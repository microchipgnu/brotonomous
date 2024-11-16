import { Coinbase } from "@coinbase/coinbase-sdk";

export const apiKeyName = process.env.CDP_API_KEY_NAME!;
export const apiKeyPrivateKey = process.env.CDP_API_KEY_PRIVATE_KEY!;
export const networkId = process.env.NETWORK_ID!;

export const coinbase = Coinbase.configure({ apiKeyName: apiKeyName, privateKey: apiKeyPrivateKey });
