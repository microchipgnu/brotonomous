import { deployNFT } from "./onchain/deploy-nft";
import { getBalance } from "./onchain/get-balance";
import { deployToken } from "./onchain/deploy-token";
import { getWalletDetails } from "./onchain/get-wallet-details";
import { mintNFT } from "./onchain/mint-nft";
import { requestFaucetFunds } from "./onchain/request-faucet-funds";
import { trade } from "./onchain/trade";
import { transfer } from "./onchain/transfer";
import { tweet } from "./social/twitter";
export const TOOLKIT = {
    deployNFT,
    getBalance,
    deployToken,
    getWalletDetails,
    mintNFT,
    requestFaucetFunds,
    trade,
    transfer,
    tweet
}
