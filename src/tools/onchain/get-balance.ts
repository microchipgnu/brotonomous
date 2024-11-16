import { tool } from "ai";
import { z } from "zod";
import { useStore } from "../../state";

export const getBalance = tool({
  description: "Get the balance of the wallet for a given asset",
  parameters: z.object({
    assetId: z.string().describe("The asset ID to get the balance for, e.g. 'eth', 'usdc', or a contract address"),
  }),
  execute: async ({ assetId }) => {
    console.log("💰 Getting wallet balance...");
    console.log(`🪙 Asset: ${assetId}`);

    const { wallet } = useStore.getState();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    try {
      const balance = await wallet.getBalance(assetId);
      console.log(`✅ Balance retrieved successfully: ${balance}`);
      return `Balance for asset ${assetId}: ${balance}`;
    } catch (error) {
      const errorMessage = `Error getting balance: ${error}`;
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },
});
