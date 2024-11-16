import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { Wallet } from "@coinbase/coinbase-sdk"
import { networkId } from "./src/config"
import { useStore } from "./src/state"
import { TOOLKIT } from "./src/tools"
import { Elysia } from "elysia"
import { Bot } from "grammy";

// Wallet initialization
const initWallet = async () => {
  console.log("Initializing wallet...")
  const wallet = await Wallet.create({ networkId })

  console.log("Requesting funds from faucet...")
  const faucetTx = await wallet.faucet()
  await faucetTx.wait()
  console.log("Faucet transaction completed")

  useStore.getState().setWallet(wallet)
  console.log("Wallet initialized successfully")
  return wallet
}

// Task planning and execution
const generateTasks = async (goal: string) => {
  console.log(`Planning tasks for goal: "${goal}"`)
  
  const { text: taskList } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `Break down this goal into 3-5 specific actionable tasks: ${goal}`,
    system: "You are a task planner. Break down goals into numbered tasks. Be concise. Only output the numbered tasks, one per line.",
    maxSteps: 1
  })

  return taskList.split('\n').filter(task => task.trim())
}

const executeTask = async (task: string, currentGoal: string, context?: Record<string, any>) => {
  console.log(`Executing task: "${task}"`)
  const state = useStore.getState();
  const taskId = state.addTask(currentGoal, task);

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `${task}\nContext: ${JSON.stringify(context || {})}`,
      tools: TOOLKIT,
      system: "You are a helpful assistant that can help with anything related to the Coinbase wallet. Execute the given task using available tools. Keep responses under 200 characters.",
      maxSteps: 5
    })

    // Update task status before returning
    const shortResult = text?.slice(0, 200) || "No result returned";
    state.updateTaskStatus(taskId, 'completed', shortResult);
    console.log("Task result:", shortResult)
    return { result: shortResult, taskId }
  } catch (error) {
    // Update task status on error
    state.updateTaskStatus(taskId, 'failed', error instanceof Error ? error.message : "Error executing task");
    console.error("Error executing task:", error)
    return { result: null, taskId }
  }
}

const generateNextGoal = async (previousGoal: string, results: string[], context?: Record<string, any>) => {
  console.log("Generating next goal...")
  
  const { text: nextGoal } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: `Based on the previous goal "${previousGoal}" and its results ${JSON.stringify(results)}, what should be the next goal? Context: ${JSON.stringify(context || {})}`,
    system: `You are a strategic planner. Suggest the next logical goal based on previous outcomes. Be specific and concise (max 100 chars). You have access to the following tools: ${Object.values(TOOLKIT).map(tool => JSON.stringify(tool)).join(', ')}.`,
    maxSteps: 1
  })

  return nextGoal.slice(0, 100)
}

// Autonomous loop
const runAutonomousLoop = async (initialGoal: string) => {
  let currentGoal = initialGoal
  let context = {}
  
  while (true) {
    console.log(`\n🎯 Current goal: ${currentGoal}`)
    
    // Generate tasks for current goal
    const tasks = await generateTasks(currentGoal)
    console.log("📋 Generated tasks:", tasks)
    
    // Execute each task
    const results = []
    for (const task of tasks) {
      const { result, taskId } = await executeTask(task, currentGoal, context)
      if (result) {
        results.push(result)
        // Update context with task results
        context = {
          ...context,
          [`task_${taskId}`]: result
        }
      }
    }
    
    // Generate next goal with updated context
    currentGoal = await generateNextGoal(currentGoal, results, context)
    
    // Optional: Add some delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// Server setup
const setupServer = () => {
  const app = new Elysia()
    .get("/progress", () => {
      return useStore.getState().getProgress();
    })
    .listen(3000)

  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
  return app
}

// Telegram bot setup
const setupTelegramBot = async () => {
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "")

  await bot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "progress", description: "Show task progress" },
    { command: "address", description: "Show agent address" },
  ]);

  bot.command("start", (ctx) => {
    ctx.reply("Hello! I'm your friendly Coinbase assistant. How can I help you today?")
  })
  bot.command("address", async (ctx) => {
    const wallet = useStore.getState().wallet;
    ctx.reply(`My address is ${await wallet?.getDefaultAddress()}`)
  })

  bot.command("progress", (ctx) => {
    const { recent, stats } = useStore.getState().getProgress();
    
    const progressMessage = [
      "📊 Current Progress:",
      `\nStats:`,
      `✅ Completed: ${stats.completed}`,
      `⏳ Pending: ${stats.pending}`,
      `❌ Failed: ${stats.failed}`,
      `\nRecent Tasks:`,
      ...recent.slice(0, 5).map(task => ( // Only show last 5 tasks
        `\n${task.status === 'completed' ? '✅' : task.status === 'failed' ? '❌' : '⏳'} ` +
        `${task.task.slice(0, 50)}${task.task.length > 50 ? '...' : ''}`
      ))
    ].join('\n');

    ctx.reply(progressMessage);
  })

  bot.start()
  return bot
}

// Error handlers
const setupErrorHandlers = () => {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error)
  })

  process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error)
  })
}

// Main initialization
const init = async () => {
  console.log("Starting initialization...")
  await initWallet() // Re-enabled wallet initialization
  setupServer()
  await setupTelegramBot()
  setupErrorHandlers()

  // Start autonomous loop with initial goal and required context
  const initialGoal = "Create and deploy an NFT collection"
  runAutonomousLoop(initialGoal).catch(console.error)

  // Keep the process running
  await new Promise(() => { })
}

console.log("Starting application...")
init().catch(console.error)
