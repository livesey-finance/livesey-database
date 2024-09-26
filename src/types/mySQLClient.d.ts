import { Pool, Connection } from 'mysql2/promise';
import { DatabaseClient } from './databaseClient';

export declare class MySQLClient extends DatabaseClient {
  pool: Pool;
  constructor(mySqlPool: Pool);
  static newMySQLClient(mySqlPool: Pool): MySQLClient;
  connect(): Promise<Connection>;
  query(queryText: string, params?: any[]): Promise<Array<Record<string, any>>>;
  release(): Promise<void>;
}
