import * as BitfinexAPI from 'bitfinex-api-node';
import { logger } from '../utils/logger';

const bfx = new BitfinexAPI({
  ws: {
    autoReconnect: true,
    seqAudit: true,
    transform: true
  }
});

const client = bfx.ws(2);

client.on('error', (err: Error) => logger.error(`BFX API ERR: ${err.message}`, err));
client.on('open', (s: any) => logger.info(`BFX API WS CONNECTED`, s));

client.ticker = async (symbol: string, cb: (ticker: ITickerResponse) => any) => {
  client.onTicker({ symbol }, (ticker: ITickerResponse) => {
    cb(ticker);
  });
  await client.open();
  client.subscribeTicker(symbol);
};

interface ITickerResponse {
  symbol: string;
  bid: number;
  bidSize: number;
  ask: number;
  askSize: number;
  dailyChange: number;
  dailyChangePerc: number;
  lastPrice: number;
  volume: number;
  high: number;
  low: number;
}

interface IClient {
  ticker(sym: string, cb: (ticker: ITickerResponse) => any): Promise<any>;
}

export default client as Partial<IClient>;
