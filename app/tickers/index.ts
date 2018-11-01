import { ticker as ethBinanceTicker, bitfinexTicker as bitfinexEthTicker } from './eth_usd';
import client from '../../config/bitfinex';

export const start = async () => {
  await ethBinanceTicker();
  await bitfinexEthTicker();
};
