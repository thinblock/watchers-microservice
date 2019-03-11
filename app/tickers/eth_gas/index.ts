import web3 from '../../../config/web3';
import redis from '../../../config/redis';
import { enqueueJob } from './queue';
import { logger } from '../../../utils/logger';

export const gasTicker = async () => {

  const gasPrice = await web3.eth.getGasPrice();
  const block = await web3.eth.getBlock('latest');
  const etherValue = web3.utils.fromWei(String(gasPrice * block.gasLimit), 'ether');
  const ETH_GAS_PRICE = 'ETH_GAS_PRICE';

  redis.get(ETH_GAS_PRICE, (err, val: string) => {
    if (err) {
      logger.error(`Error when trying to retreive ${ETH_GAS_PRICE} from redis`, err);
      return;
    }
    const lastPrice = parseFloat(val);
    if (!lastPrice) {
      redis.set(ETH_GAS_PRICE, etherValue);
    } else {
      const diff = parseFloat(etherValue) - lastPrice;
      if (Math.abs(diff) !== 0) {
        redis.set(ETH_GAS_PRICE, etherValue);
        // enqueueJob
        enqueueJob({
          event: diff < 0 ? 'price_drop' : 'price_surge',
          diff: Math.abs(diff), etherValue
        }).then((job) => {
          logger.info('Enqueued Job:', job.id);
        })
        .catch((e) => {
          logger.error('Error occurred while enqueuing job', e);
        });
      }
    }
  });

  setTimeout( () => {
    gasTicker();
  }, 10000);
};
