import { TokenAnalyst } from '@tokenanalyst/sdk';
import { logger } from '../../../utils/logger';
import pgClient from '../../../config/pg';

const ta = new TokenAnalyst();


/*Here we start the stream using FOREIGN TABLE from PipelineDB*/
const streamSQL = `
  CREATE FOREIGN TABLE eth_transactions_stream
    (
      price_eth float, price_usd float, from_address varchar(50),
      to_address varchar(50), gas_price integer, gas integer,
      tx_hash varchar(70)
    )
  SERVER pipelinedb;
`;

/*Here we write the query to filter by amount*/
const filterTransactionViewSQL = `
  CREATE VIEW filter_eth_transactions AS
    SELECT price_usd, price_eth, tx_hash, from_address, to_address, gas_price, gas
    FROM eth_transactions_stream
    WHERE from_address IN ('0xfa524bc9c0061ead9836933adc491292f6bd1563', '0xb9954de4d4d49dfc5856dcaca8f70d6939e2e407', '0xb4b6b77b5977f53ccc95a140a4d31c1b11e00d1a', '0xd5fb603d8b952c61c07d7b33f8fda989664b6824 ;
`;

const executeViewSQL = `SELECT * FROM filter_eth_transactions;`;


export const txStreamETH = async () => {
  await pgClient.connect();

  try {
    await pgClient.query(streamSQL);
    await pgClient.query(filterTransactionViewSQL);
    logger.info('Done creating Tables');
  } catch (e) {
    logger.error('Error creating tables or its already created', e);
  }

  logger.info('[TRANSACTIONS]', 'Stream Started');
  const stream = ta.streams.transactionsWithLabelsAndPrice.subscribe((txData: any) => {
    const toAddress = txData.TOADDR;
    const fromAddress = txData.FROMADDR;
    const priceUSD = txData.PRICE;
    const priceEth = txData.WEIVALUE;
    const gas = txData.GAS;
    const gasPrice = txData.GASPRICE;
    const txHash = txData.TX.HASH;
    logger.info('Got new transaction with Hash: ', txHash);
    pgClient.query({
      text: `
        INSERT INTO
        eth_transactions_stream
        (price_eth, price_usd, from_address, to_address, gas_price, gas, tx_hash)
        VALUES($1, $2, $3, $4, $5, $6, $7)
      `,
      values: [priceEth, priceUSD, fromAddress, toAddress, gasPrice, gas, txHash],
    }).then(() => {
      logger.info('[TRANSACTIONS]: Hash: ', txHash, ' Saved!');
    })
    .catch((err) => {
      logger.error(err, ' Got error in saving!');
    });
  });

  setInterval(() => {
    pgClient.query(executeViewSQL).then((data) => {
      console.log(data);
    })
    .catch((e) => {
      logger.error(e, 'Error from Cron');
    });

    // Run every 5mins to consume the events in the stream
  }, 300000);
};
