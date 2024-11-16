import type { Wallet } from "@coinbase/coinbase-sdk"
import { createStore } from "zustand/vanilla"

interface State {
  wallet: Wallet | null;
  setWallet: (wallet: Wallet) => void;
}

export const useStore = createStore<State>((set) => ({
    wallet: null,
    setWallet: (wallet: Wallet) => set({ wallet })
}))