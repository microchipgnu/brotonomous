import { tool } from "ai";
import { z } from "zod";
import { useStore } from "../state";

export const trade = tool({
  description: "Trade a specified amount of a from asset to a to asset for the wallet. It takes the the amount of the from asset to trade, the from asset ID to trade, and the to asset ID to receive from the trade as inputs. Trades are only supported on Mainnets (e.g. `base-mainnet`, `ethereum-mainnet`). Never allow trades on any other network.",
  parameters: z.object({
    amount: z.number().describe("The amount of the from asset to trade, e.g. '15', '0.000001'"),
    fromAssetId: z.string().describe("The from asset ID to trade, e.g. 'eth', '0x036CbD53842c5426634e7929541eC2318f3dCF7e'"),
    toAssetId: z.string().describe("The to asset ID to receive from the trade, e.g. 'eth', '0x036CbD53842c5426634e7929541eC2318f3dCF7e'")
  }),
  execute: async ({ amount, fromAssetId, toAssetId }) => {
    console.log("💱 Trading assets...");
    console.log(`💰 Amount: ${amount}`);
    console.log(`📤 From Asset: ${fromAssetId}`);
    console.log(`📥 To Asset: ${toAssetId}`);
    console.log("⏳ Trade in progress...");

    const { wallet } = useStore.getState();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    try {
      const tx = await wallet.createTrade({
        amount,
        fromAssetId,
        toAssetId
      });

      await tx.wait();

      console.log(`✅ Trade completed successfully. Transaction hash: ${tx}`);
      return `Traded ${amount} of ${fromAssetId} for ${toAssetId}. Transaction hash: ${tx}`;
    } catch (error) {
      const errorMessage = `Error trading assets: ${error}`;
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },
});
