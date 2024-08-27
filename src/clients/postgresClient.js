import pkg from 'pg';
const { Pool } = pkg;
import { env } from '../configs/envConfig.js';
import { DatabaseClient } from './databaseClient.js';

export class PostgresClient extends DatabaseClient {
  constructor() {
    super();
    this.pool = new Pool({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      port: env.DB_PORT,
      ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
  }

  async connect() {
    return this.pool.connect();
  }

  async query(queryText, params = []) {
    const client = await this.connect();
    try {
      const result = await client.query(queryText, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  release() {
    return this.pool.end();
  }
}
