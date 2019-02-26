import { Job } from 'kue';
import queue from '../../../config/kue';
import { logger } from '../../../utils/logger';
import { oneLine } from 'common-tags';
import { getJobs } from '../../../utils/jobs_service';
import { publishActions } from '../../../utils/helpers';

queue.process('eth-tx-worker', function (job, done) {
  processJob(job.data)
    .then(() => {
      logger.info(oneLine`
        [i] Job (gas price) with QueueId: ${job.id} finished successfully
      `);
      done();
    })
    .catch((e) => {
      logger.error(oneLine`
        [Err] Job (gas price) with QueueId: ${job.id} errored
      `, e);
      done(e);
    });
});

async function processJob(data: any) {
  // process the job
  // step 1: get all the jobs
  // step 2: evaluate the conditions
  // step 3: publish actions
  // getJob()
  try {
    const jobs = await getJobs('eth_gas_watcher');

    // for each all jobs and check conditions
    for (let i = 0; i < jobs.length; i++) {
      if (evaluateJobCondition(jobs[i], data)) {
        // publish actions
        try {
          await publishActions(jobs[i]._id, jobs[i].actions);
        } catch (e) {
          logger.error(oneLine`[Err] QueueJob: eth_usd with JobId: ${jobs[i]._id} errored`, e);
        }
      }
    }
  } catch (e) {
    logger.error(oneLine`[Err] Job: eth_usd errored`, e);
  }
}

function evaluateJobCondition(
  job: any, eventObj: {diff: number; etherValue: number; event: string; }
): boolean {
  try {
    const condition = job.trigger.conditions[0];
    const price = eventObj.etherValue;
    if (!condition) {
      return false;
    }
    // '$lt', '$lte', '$gt', '$gte', '$eq'
    const operator = condition.operation;
    const arg = parseFloat(condition.argument.value);
    switch (operator) {
    case '$lt':
      return price < arg;
    case '$lte':
      return price <= arg;
    case '$gt':
      return price > arg;
    case '$gte':
      return price >= arg;
    case '$eq':
      return price === arg;
    default:
      return false;
    }
  } catch (e) {
    logger.error(`Error occured while evaluating conditions for: JobId: ${job.id}`, e);
    return false;
  }
}

export function enqueueJob(data: any) {
  return new Promise<Job>((resolve, reject) => {
    const job = queue.create('eth-tx-worker', data).save((err: Error) => {
      if (err) {
        return reject(err);
      }
      return resolve(job);
    });
  });
}
