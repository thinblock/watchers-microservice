import {TokenAnalyst} from '@tokenanalyst/sdk');
import { Client } from 'pg';
import redis from '../../../config/redis';
import { enqueueJob } from './queue';
import { logger } from '../../../utils/logger';

const ta = new TokenAnalyst();
const client = new Client();


await client.connect()

export const txStreamETH = async () => {
  logger.info('[TRANSATIONS]', amount, 'Stream Started');
  const stream = ta.streams.erc20TokenTransfer.subscribe(console.log);

  /*Here we start the stream using FOREIGN TABLE from PipelineDB*/
  const s = 'CREATE FOREIGN TABLE pricestream ( price,toAddress'

  /*Here we write the query to filter by amount*/
  const q = 'CREATE VIEW v WITH (action=materialize) AS SELECT url,count(*) AS total_count, count(DISTINCT cookie) FROM ta GROUP BY toAddress'
  

  /*Cleans up view v*/
  client.query('DROP VIEW v');


};
