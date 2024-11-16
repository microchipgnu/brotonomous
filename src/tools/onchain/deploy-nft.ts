import { tool } from "ai";
import { z } from "zod";
import { useStore } from "../../state";

export const deployNFT = tool({
  description: "Deploy a new NFT", 
  parameters: z.object({
    name: z.string(),
    description: z.string(),
  }),
  execute: async ({ name, description }) => {
    console.log("🚀 Deploying new NFT...");
    console.log(`📝 Name: ${name}`);
    console.log(`📄 Description: ${description}`);
    console.log("⏳ Deployment in progress...");

    const { wallet } = useStore.getState()

    if (!wallet) {
        throw new Error("Wallet not found")
    }

    const tx = await wallet.deployNFT({
        name,
        symbol: "NFT",
        baseURI: "https://example.com"
    })

    console.log(`✅ NFT deployed successfully. Transaction hash: ${tx}`)
    return `NFT deployed successfully. Transaction hash: ${tx}`
  },
});
