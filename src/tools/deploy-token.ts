import { tool } from "ai";
import { z } from "zod";
import { useStore } from "../state";

export const deployToken = tool({
  description: "Deploy an ERC20 token smart contract. It takes the token name, symbol, and total supply as input. The token will be deployed using the wallet's default address as the owner and initial token holder.",
  parameters: z.object({
    name: z.string().describe('The name of the token (e.g., "My Token")'),
    symbol: z.string().describe('The token symbol (e.g., "USDC", "MEME", "SYM")'),
    totalSupply: z.number().describe('The total supply of tokens to mint (e.g., "1000000")')
  }),
  execute: async ({ name, symbol, totalSupply }) => {
    console.log("🚀 Deploying new token...");
    console.log(`📝 Name: ${name}`);
    console.log(`🔤 Symbol: ${symbol}`);
    console.log(`💰 Total Supply: ${totalSupply}`);
    console.log("⏳ Deployment in progress...");

    const { wallet } = useStore.getState();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    try {
      const tx = await wallet.deployToken({
        name,
        symbol,
        totalSupply
      });

      console.log(`✅ Token deployed successfully. Transaction hash: ${tx}`);
      return `Token ${name} (${symbol}) deployed successfully with total supply of ${totalSupply} tokens. Transaction hash: ${tx}`;
    } catch (error) {
      const errorMessage = `Error deploying token: ${error}`;
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },
});
