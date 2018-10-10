import { ticker as ethTicker } from './eth_usd';

export const start = async () => {
  await ethTicker();
};
