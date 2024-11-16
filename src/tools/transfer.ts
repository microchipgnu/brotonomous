import { tool } from "ai";
import { z } from "zod";
import { useStore } from "../state";

export const transfer = tool({
  description: "Transfer an asset from the wallet to another onchain address. It takes the amount, the asset ID to transfer, the destination to send the funds (either an onchain address, an ENS `example.eth`, or Basename `example.base.eth`), and whether to do a gasless transfer as inputs. The gasless option is available on `base-sepolia` and `base-mainnet` networks for `usdc` asset only. Always use the gasless option when it is available. Always use the asset ID `usdc` when attempting to transfer USDC. Always ensure that you have enough balance of the input asset ID to complete the transfer.",
  parameters: z.object({
    amount: z.number().describe("The amount of the asset to transfer, e.g. '15', '0.000001'"),
    assetId: z.string().describe("The asset ID to transfer, e.g. 'eth', '0x036CbD53842c5426634e7929541eC2318f3dCF7e'"),
    destination: z.string().describe("The destination to transfer the funds, e.g. '0x58dBecc0894Ab4C24F98a0e684c989eD07e4e027', 'example.eth', 'example.base.eth'"),
    gasless: z.boolean().optional().default(false).describe("Whether to do a gasless transfer (gasless is available on Base Sepolia and Mainnet for USDC) Always do the gasless option when it is available.")
  }),
  execute: async ({ amount, assetId, destination, gasless }) => {
    console.log("💸 Transferring assets...");
    console.log(`💰 Amount: ${amount}`);
    console.log(`🪙 Asset: ${assetId}`);
    console.log(`📫 Destination: ${destination}`);
    console.log(`⛽ Gasless: ${gasless}`);
    console.log("⏳ Transfer in progress...");

    const { wallet } = useStore.getState();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    try {
      const tx = await wallet.createTransfer({
        amount,
        assetId,
        destination,
        gasless
      });

      await tx.wait();

      console.log(`✅ Transfer completed successfully. Transaction hash: ${tx}`);
      return `Transferred ${amount} of ${assetId} to ${destination}. Transaction hash: ${tx}`;
    } catch (error) {
      const errorMessage = `Error transferring assets: ${error}`;
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },
});
