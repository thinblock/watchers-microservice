import {
  ticker as ethBinanceTicker,
  bitfinexTicker as bitfinexEthTicker,
} from './tickers/eth_usd';
import { gasTicker } from './tickers/eth_gas';
import { txStreamETH } from './transactions/eth';

export const start = async () => {
  // await ethBinanceTicker();
  // await bitfinexEthTicker();
  // await gasTicker();
  await txStreamETH();
};
