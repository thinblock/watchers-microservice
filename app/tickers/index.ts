import { ticker as ethBinanceTicker, bitfinexTicker as bitfinexEthTicker } from './eth_usd';
import { gasTicker } from './eth_gas';
import client from '../../config/bitfinex';

export const start = async () => {
  await ethBinanceTicker();
  await bitfinexEthTicker();
  await gasTicker();
};
