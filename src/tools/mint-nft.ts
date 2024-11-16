import { tool } from "ai";
import { z } from "zod";
import { useStore } from "../state";

export const mintNFT = tool({
  description: "Mint an NFT (ERC-721) to a specified destination address onchain via a contract invocation. It takes the contract address of the NFT onchain and the destination address onchain that will receive the NFT as inputs. Do not use the contract address as the destination address.",
  parameters: z.object({
    contractAddress: z.string().describe("The contract address of the NFT (ERC-721) to mint, e.g. '0x036CbD53842c5426634e7929541eC2318f3dCF7e'"),
    destination: z.string().describe("The destination address that will receive the NFT onchain, e.g. '0x036CbD53842c5426634e7929541eC2318f3dCF7e'")
  }),
  execute: async ({ contractAddress, destination }) => {
    console.log("🎨 Minting new NFT...");
    console.log(`📝 Contract Address: ${contractAddress}`);
    console.log(`📫 Destination Address: ${destination}`);
    console.log("⏳ Minting in progress...");

    const { wallet } = useStore.getState();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    try {
      const tx = await wallet.invokeContract({
        contractAddress,
        method: "mint",
        args: {
          to: destination,
          quantity: 1
        }
      });

      console.log(`✅ NFT minted successfully. Transaction hash: ${tx}`);
      return `Minted NFT from contract ${contractAddress} to address ${destination}. Transaction hash: ${tx}`;
    } catch (error) {
      const errorMessage = `Error minting NFT: ${error}`;
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },
});
