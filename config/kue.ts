import { createQueue } from 'kue';
import { config } from './env';

const queue = createQueue({ redis: config.db });

export default queue;