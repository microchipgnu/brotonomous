import { tool } from "ai";
import { z } from "zod";
import { useStore } from "../../state";
import { TwitterApi } from "twitter-api-v2";

export const tweet = tool({
  description: "Post a tweet to Twitter about an NFT deployment or other blockchain activity",
  parameters: z.object({
    message: z.string().describe("The tweet message to post"),
    mediaUrl: z.string().optional().describe("Optional URL to media to attach to tweet"),
  }),
  execute: async ({ message, mediaUrl }) => {
    console.log("🐦 Posting tweet...");
    console.log(`📝 Message: ${message}`);
    if (mediaUrl) {
      console.log(`🖼️ Media: ${mediaUrl}`);
    }
    console.log("⏳ Tweet in progress...");

    const { wallet } = useStore.getState();

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    try {
      // Initialize Twitter client
      const client = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessSecret: process.env.TWITTER_ACCESS_SECRET!,
      });

      let mediaIds: string[] = [];
      if (mediaUrl) {
        // Download and upload media if URL provided
        const mediaBuffer = await fetch(mediaUrl).then(res => res.arrayBuffer());
        const mediaId = await client.v1.uploadMedia(Buffer.from(mediaBuffer));
        mediaIds.push(mediaId);
      }

      // Post the tweet
      const tweet = await client.v2.tweet({
        text: message,
        media: mediaIds.length > 0 ? { media_ids: [mediaIds[0]] } : undefined
      });
      
      console.log(`✅ Tweet posted successfully. Tweet ID: ${tweet.data.id}`);
      return `Tweet posted successfully. Tweet ID: ${tweet.data.id}`;
    } catch (error) {
      const errorMessage = `Error posting tweet: ${error}`;
      console.error(`❌ ${errorMessage}`);
      throw new Error(errorMessage);
    }
  },
});
