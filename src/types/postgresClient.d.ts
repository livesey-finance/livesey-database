import { Pool, PoolClient } from 'pg';
import { DatabaseClient } from './databaseClient';

export declare class PostgresClient extends DatabaseClient {
  pool: Pool;
  constructor(postgresPool: Pool);
  static newPostgresClient(postgresPool: Pool): PostgresClient;
  connect(): Promise<PoolClient>;
  query(queryText: string, params?: any[]): Promise<Array<Record<string, any>>>;
  release(): Promise<void>;
}
