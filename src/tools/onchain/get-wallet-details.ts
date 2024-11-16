import { tool } from "ai";
import { z } from "zod";
import { useStore } from "../../state";

export const getWalletDetails = tool({
  description: "Get details about the connected wallet including network and address",
  parameters: z.object({}),
  execute: async () => {
    console.log("🔍 Getting wallet details...");

    const { wallet } = useStore.getState();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    try {
      const details = {
        id: wallet.getId(),
        network: wallet.getNetworkId(),
        address: (await wallet.getDefaultAddress()).getId()
      };
      
      console.log("✅ Wallet details retrieved successfully");
      return `Wallet ID: ${details.id}, Network: ${details.network}, Address: ${details.address}`;
    } catch (error) {
      const errorMessage = `Error getting wallet details: ${error}`;
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },
});
