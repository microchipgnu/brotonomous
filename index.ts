import { generateText, generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { Wallet } from "@coinbase/coinbase-sdk"
import { networkId } from "./src/config"
import { useStore } from "./src/state"
import { TOOLKIT } from "./src/tools"
import { Elysia } from "elysia"
import { Bot } from "grammy"
import { z } from "zod"

// Wallet initialization
const initWallet = async () => {
  console.log("🔐 Initializing wallet...")
  const wallet = await Wallet.create({ networkId })

  console.log("💧 Requesting funds from faucet...")
  const faucetTx = await wallet.faucet()
  await faucetTx.wait()
  console.log("✅ Faucet transaction completed")

  useStore.getState().setWallet(wallet)
  console.log("🎉 Wallet initialized successfully")
  return wallet
}

// Task planning and execution with improved reasoning
const generateTasks = async (goal: string) => {
  console.log(`🎯 Planning tasks for goal: "${goal}"`)
  
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      tasks: z.array(z.object({
        id: z.number(),
        title: z.string(),
        prerequisites: z.array(z.string()),
        risks: z.array(z.string()),
        resources: z.array(z.string()),
        successCriteria: z.array(z.string())
      }))
    }),
    prompt: `Analyze this goal and break it down into 3-5 specific actionable tasks: ${goal}. For each task, provide:
    - Prerequisites and dependencies
    - Potential risks and mitigation steps  
    - Resource requirements
    - Success criteria`,
    system: "You are a strategic task planner with expertise in blockchain and NFTs. Break down goals into numbered tasks that build upon each other logically. Consider dependencies, risks, and success criteria. Be specific and actionable."
  })

  return object.tasks.map(task => task.title)
}

const executeTask = async (task: string, currentGoal: string, context?: Record<string, any>) => {
  console.log(`⚡ Executing task: "${task}"`)
  const state = useStore.getState();
  const taskId = state.addTask(currentGoal, task);

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Task: ${task}
Current Goal: ${currentGoal}
Previous Context: ${JSON.stringify(context || {})}

Before executing:
1. What are the key considerations for this task?
2. What potential issues should we watch out for?
3. How does this task contribute to the overall goal?

Please execute the task after analysis.`,
      tools: TOOLKIT,
      system: "You are an intelligent blockchain agent with deep understanding of NFTs and market dynamics. Analyze tasks thoroughly before execution, considering implications and potential issues. Use available tools strategically to achieve optimal outcomes.",
      maxSteps: 7
    })

    const shortResult = text?.slice(0, 200) || "No result returned";
    state.updateTaskStatus(taskId, 'completed', shortResult);
    console.log("✅ Task completed:", shortResult)
    return { result: shortResult, taskId }
  } catch (error) {
    state.updateTaskStatus(taskId, 'failed', error instanceof Error ? error.message : "Error executing task");
    console.error("❌ Error executing task:", error)
    return { result: null, taskId }
  }
}

const generateNextGoal = async (previousGoal: string, results: string[], context?: Record<string, any>) => {
  console.log("🎯 Generating next goal...")
  
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({
      analysis: z.object({
        achievements: z.array(z.string()),
        challenges: z.array(z.string()),
        priorities: z.array(z.string()),
        alignment: z.string()
      }),
      nextGoal: z.string()
    }),
    prompt: `Previous Goal: "${previousGoal}"
Results: ${JSON.stringify(results)}
Context: ${JSON.stringify(context || {})}

Please analyze:
1. What was achieved vs intended outcomes?
2. What challenges or opportunities emerged?
3. What should be prioritized next?
4. How does this align with long-term objectives?`,
    system: `You are a strategic AI advisor specializing in blockchain projects. Analyze outcomes carefully and suggest focused, impactful next steps. Consider market conditions, resource constraints, and long-term value. Available tools: ${Object.values(TOOLKIT).map(tool => JSON.stringify(tool)).join(', ')}.`
  })

  return object.nextGoal.slice(0, 100)
}

// Autonomous loop with improved reasoning
const runAutonomousLoop = async (initialGoal: string) => {
  let currentGoal = initialGoal
  let context = {}
  let iterationCount = 0
  
  while (true) {
    console.log(`\n🔄 Iteration ${++iterationCount} - Current goal: ${currentGoal}`)
    
    // Generate tasks with improved planning
    const tasks = await generateTasks(currentGoal)
    console.log("📋 Generated tasks:", tasks)
    
    // Execute tasks with better context awareness
    const results = []
    for (const task of tasks) {
      const { result, taskId } = await executeTask(task, currentGoal, context)
      if (result) {
        results.push(result)
        context = {
          ...context,
          [`task_${taskId}`]: result,
          lastCompletedTask: task,
          iterationCount
        }
      }
    }
    
    // Evaluate progress and determine next goal
    currentGoal = await generateNextGoal(currentGoal, results, context)
    
    // Adaptive delay based on task complexity
    const delay = Math.min(2000 * Math.log(iterationCount + 1), 10000)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
}

// Server setup
const setupServer = () => {
  const app = new Elysia()
    .get("/progress", () => {
      return useStore.getState().getProgress();
    })
    .listen(3000)

  console.log(`🚀 Elysia server running at ${app.server?.hostname}:${app.server?.port}`)
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
    ctx.reply("🤖 Hello! I'm your friendly Coinbase assistant. How can I help you today?")
  })
  bot.command("address", async (ctx) => {
    const wallet = useStore.getState().wallet;
    ctx.reply(`💼 My address is ${await wallet?.getDefaultAddress()}`)
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
      ...recent.slice(0, 5).map(task => (
        `\n${task.status === 'completed' ? '✅' : task.status === 'failed' ? '❌' : '⏳'} ` +
        `${task.task.slice(0, 50)}${task.task.length > 50 ? '...' : ''}`
      ))
    ].join('\n');

    ctx.reply(progressMessage);
  })

  console.log("🤖 Telegram bot initialized")
  bot.start()
  return bot
}

// Error handlers
const setupErrorHandlers = () => {
  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught exception:', error)
  })

  process.on('unhandledRejection', (error) => {
    console.error('💥 Unhandled rejection:', error)
  })
}

// Main initialization
const init = async () => {
  console.log("🚀 Starting initialization...")
  await initWallet()
  setupServer()
  await setupTelegramBot()
  setupErrorHandlers()

  // Start autonomous loop with initial goal and required context
  const initialGoal = "create an nft collection and shill it"
  console.log("🤖 Starting autonomous loop with initial goal:", initialGoal)
  runAutonomousLoop(initialGoal).catch(console.error)

  // Keep the process running
  await new Promise(() => { })
}

console.log("🎬 Starting application...")
init().catch(console.error)
