import { config } from './env';
import { Client } from 'pg';

const client = new Client({
  user: 'postgres',
  host: config.pgDBHost,
  database: 'postgres',
  password: config.pgDBPass,
  port: 5434,
});

export default client;