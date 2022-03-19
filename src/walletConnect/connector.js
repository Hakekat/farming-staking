import { BscConnector } from "@binance-chain/bsc-connector";
import { InjectedConnector } from "@web3-react/injected-connector";

export const bsc = new BscConnector({
  supportedChainIds: [56,97],
});

export const injected = new InjectedConnector({
  supportedChainIds: [56,97],
});