import { SNS, SharedIniFileCredentials, config as awsConfig } from 'aws-sdk';
import MessageValidator = require('sns-validator');
import { config } from '../config/env';
import { logger } from './logger';
import { oneLine } from 'common-tags';
import { UnauthorizedError, InternalServerError } from 'restify-errors';

awsConfig.update({ region: config.aws_region });

const publishMessage = async (TopicArn: string, Message: string) => {
  console.log(TopicArn, Message);
  const snsClient = new SNS({
    credentials: new SharedIniFileCredentials({ profile: 'thinblock' })
  });
  return snsClient.publish({
    TopicArn,
    Message,
  }).promise();
};

export async function publishActions(jobId: string, actions: any[]) {
  await Promise.all(actions.map((obj: any) => (
    publishMessage(
      obj.action[0].sns_topic_arn,
      JSON.stringify({
        job_id: jobId
      })
    )
  )));
}

export {
  publishMessage,
};
