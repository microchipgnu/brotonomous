import { deployNFT } from "./deploy-nft";
import { getBalance } from "./get-balance";
import { deployToken } from "./deploy-token";
import { getWalletDetails } from "./get-wallet-details";
import { mintNFT } from "./mint-nft";
import { requestFaucetFunds } from "./request-faucet-funds";
import { trade } from "./trade";
import { transfer } from "./transfer";

export const TOOLKIT = {
    deployNFT,
    getBalance,
    deployToken,
    getWalletDetails,
    mintNFT,
    requestFaucetFunds,
    trade,
    transfer
}
