import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { Wallet } from "@coinbase/coinbase-sdk"
import { networkId } from "./src/config"
import { useStore } from "./src/state"
import { TOOLKIT } from "./src/tools"

const initWallet = async () => {
    const wallet = await Wallet.create({
        networkId: networkId
    })

    const faucetTx = await wallet.faucet()
    await faucetTx.wait()
    useStore.setState({ wallet })
    return wallet
}

const init = async () => {
    await initWallet()

    const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: "Let's deploy an NFT called 'My NFT' with the metadata 'This is my NFT'",
        tools: TOOLKIT,
        system: "You are a helpful assistant that can help with anything related to the Coinbase wallet.",
        maxSteps: 5
    })
}

init()


