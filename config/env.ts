import * as path from 'path';

const env: string = process.env.NODE_ENV || 'development';
const debug: boolean = !!process.env.DEBUG || false;
const isDev: boolean = env === 'development';
const isTestEnv: boolean = env === 'test';
// default settings are for dev environment
const config = {
  name: 'TB-WATCHER-API',
  env: env,
  test: isTestEnv,
  debug: debug,
  root: path.join(__dirname, '/..'),
  port: 8080,
  db: process.env.TB_WATCHERS_REDIS_DB_STRING,
  aws_region: process.env.TB_AWS_REGION || 'ap-southeast-1',
  ethNode: process.env.TB_ETH_NODE,
};

const services = {
  jobs: {
    url: 'http://jobs.service.thinblock.io',
  }
};


// settings for test environment
if (env === 'production') {
  config.port = 5005;
  config.debug = false;
}

export { config, services };
