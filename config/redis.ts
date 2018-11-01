import * as redis from 'redis';
import { promisify } from 'util';
import { config } from '../config/env';

interface IRedisClient extends redis.RedisClient {
  getAsync(s: String): Promise<string>;
}

const client = <IRedisClient> redis.createClient(config.db);
client.on('error', function (err) {
  console.log('Redis:error ' + err);
});

client.getAsync = (key: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    client.get(key, (err, val: string) => {
      if (err) return reject(err);
      return resolve(val);
    });
  });
};

export default client;

