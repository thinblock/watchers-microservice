import * as redis from 'redis';
import { promisify } from 'util';
import { config } from '../config/env';

const client = redis.createClient(config.db);
client.on('error', function (err) {
  console.log('Redis:error ' + err);
});

export default client;

