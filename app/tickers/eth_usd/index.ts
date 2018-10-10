import client from '../../../config/binance';
import redis from '../../../config/redis';
import { enqueueJob } from './queue';
import { logger } from '../../../utils/logger';

const symbol = 'ETHUSDT';
export const ticker = async () => {
  logger.info(symbol, 'Ticker Started!');
  client.ws.ticker(symbol, (ticker) => {
    const price = parseFloat(ticker.bestAsk);
    logger.info(symbol, 'Price:', price);
    redis.get(symbol, (err, val: string) => {
      if (err) {
        return;
      }
      const lastPrice = parseFloat(val);
      if (!lastPrice) {
        redis.set(symbol, ticker.bestAsk);
      } else {
        const diff = price - lastPrice;
        if (Math.abs(diff) !== 0) {
          logger.info('Eth Price Change Event Fired, Diff=', diff);
          redis.set(symbol, ticker.bestAsk);
          // eneque job
          enqueueJob({
            event: diff < 0 ? 'price_drop' : 'price_surge',
            diff: Math.abs(diff), price
          }).then((job) => {
            logger.info('Enqueued Job:', job.id);
          })
          .catch((e) => {
            logger.error('Error occurred while enqueuing job', e);
          });
        }
      }
    });
  });
};
