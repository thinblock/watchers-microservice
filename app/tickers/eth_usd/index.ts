import client from '../../../config/binance';
import bitfinexClient from '../../../config/bitfinex';
import redis from '../../../config/redis';
import { enqueueJob } from './queue';
import { enqueueMultipleDataSourcesJob } from './multiple_datasources_queue';
import { logger } from '../../../utils/logger';

const symbol = 'ETHUSDT';
export const ticker = async () => {
  logger.info('[BINANCE]', symbol, 'Ticker Started!');
  client.ws.ticker(symbol, (ticker) => {
    const price = parseFloat(ticker.bestAsk);
    redis.get('BINANCE_' + symbol, (err, val: string) => {
      if (err) {
        return;
      }
      const lastPrice = parseFloat(val);
      if (!lastPrice) {
        redis.set('BINANCE_' + symbol, ticker.bestAsk);
      } else {
        const diff = price - lastPrice;
        if (Math.abs(diff) !== 0) {
          logger.info('[BINANCE] Eth Price Change Event Fired, Diff=', diff);
          redis.set('BINANCE_' + symbol, ticker.bestAsk);
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
          enqueueMultipleDataSourcesJob().then((job) => {
            logger.info('Enqueued MultipleDataSources Job:', job.id);
          })
          .catch((e) => {
            logger.error('Error occurred while enqueuing job', e);
          });
        }
      }
    });
  });
};

export const bitfinexTicker = async () => {
  const symbol = 'tETHUSD';
  logger.info('[BITFINEX]', symbol, 'Ticker Started!');
  await bitfinexClient.ticker('tETHUSD', (ticker) => {
    const price = ticker.ask;
    redis.get('BITFINEX_' + symbol, (err, val: string) => {
      if (err) {
        return;
      }
      const lastPrice = parseFloat(val);
      if (!lastPrice) {
        redis.set('BITFINEX_' + symbol, price + '');
      } else {
        const diff = price - lastPrice;
        if (Math.abs(diff) !== 0) {
          logger.info('[BITFINEX] Eth Price Change Event Fired, Diff=', diff);
          redis.set('BITFINEX_' + symbol, ticker.ask + '');
          enqueueMultipleDataSourcesJob().then((job) => {
            logger.info('Enqueued MultipleDataSources Job:', job.id);
          })
          .catch((e) => {
            logger.error('Error occurred while enqueuing job', e);
          });
        }
      }
    });
  });
};
