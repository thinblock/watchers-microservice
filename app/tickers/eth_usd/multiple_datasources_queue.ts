import { Job } from 'kue';
import queue from '../../../config/kue';
import { logger } from '../../../utils/logger';
import redis from '../../../config/redis';
import { oneLine } from 'common-tags';
import { getJobs } from '../../../utils/jobs_service';
import { publishActions } from '../../../utils/helpers';

queue.process('multiple-datasources-ethusd-worker', function (job, done) {
  const jobData = job.data;
  processJob(jobData)
    .then(() => {
      logger.info(oneLine`
        [i] Job (eth_usd) with QueueId: ${job.id} finished successfully
      `);
      done();
    })
    .catch((e) => {
      logger.error(oneLine`
        [Err] Job (eth_usd) with QueueId: ${job.id} errored
      `, e);
      done(e);
    });
});

async function processJob(data: any) {
  try {
    const [binanceEthPrice, bitfinexEthPrice] = await Promise.all([
      redis.getAsync('BINANCE_ETHUSDT'),
      redis.getAsync('BITFINEX_tETHUSD')
    ]);

    const difference = Math.abs(parseFloat(binanceEthPrice) - parseFloat(bitfinexEthPrice));
    if (difference === 0) {
      return true;
    }

    const jobs = await getJobs('binance_bitfinex_eth_price_diff_watcher');
    // for each all jobs and check conditions
    for (let i = 0; i < jobs.length; i++) {
      if (evaluateJobCondition(jobs[i], { difference })) {
        // publish actions
        try {
          await publishActions(jobs[i]._id, jobs[i].actions);
        } catch (e) {
          logger.error(oneLine`
            [Err] QueueJob: [multiple-datasources-ethusd-worker] with
            JobId: ${jobs[i]._id} errored
          `, e);
        }
      }
    }
    return true;
  } catch (e) {
    logger.error(oneLine`[Err] Job: eth_usd errored`, e);
    return false;
  }
}

function evaluateJobCondition(job: any, eventObj: {difference: number; }): boolean {
  try {
    const condition = job.trigger.conditions[0];
    if (!condition) {
      return false;
    }
    const priceDiff = eventObj.difference;
    // '$lt', '$lte', '$gt', '$gte', '$eq'
    const operator = condition.operation;
    const arg = parseFloat(condition.argument.value);
    switch (operator) {
    case '$lt':
      return priceDiff < arg;
    case '$lte':
      return priceDiff <= arg;
    case '$gt':
      return priceDiff > arg;
    case '$gte':
      return priceDiff >= arg;
    case '$eq':
      return priceDiff === arg;
    default:
      return false;
    }
  } catch (e) {
    logger.error(`Error occured while evaluating conditions for: JobId: ${job.id}`, e);
    return false;
  }
}

export function enqueueMultipleDataSourcesJob() {
  return new Promise<Job>((resolve, reject) => {
    const job = queue.create('multiple-datasources-ethusd-worker', {}).save((err: Error) => {
      if (err) {
        return reject(err);
      }
      return resolve(job);
    });
  });
}
