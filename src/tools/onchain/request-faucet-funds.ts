import { tool } from "ai";
import { z } from "zod";
import { useStore } from "../../state";

export const requestFaucetFunds = tool({
  description: "Request test tokens from the faucet for the default address in the wallet. If no asset ID is provided the faucet defaults to ETH. Faucet is only allowed on `base-testnet` and can only provide asset ID `eth` or `usdc`. You are not allowed to faucet with any other network or asset ID. If you are on another network, suggest that the user sends you some ETH from another wallet and provide the user with your wallet details.",
  parameters: z.object({
    assetId: z.string().optional().describe("The optional asset ID to request from faucet. Accepts 'eth' or 'usdc'. When omitted, defaults to the network's native asset.")
  }),
  execute: async ({ assetId }) => {
    console.log("💧 Requesting faucet funds...");
    console.log(`🪙 Asset: ${assetId || 'ETH (default)'}`);
    console.log("⏳ Request in progress...");

    const { wallet } = useStore.getState();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    try {
      const tx = await wallet.faucet()

      await tx.wait()

      console.log(`✅ Faucet funds received successfully. Transaction hash: ${tx}`);
      return `Received ${assetId || 'ETH'} from the faucet. Transaction hash: ${tx}`;
    } catch (error) {
      const errorMessage = `Error requesting faucet funds: ${error}`;
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },
});
