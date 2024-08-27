import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();
import { DatabaseClient } from './databaseClient.js';

export class PostgresClient extends DatabaseClient {
  constructor() {
    super();
    this.pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
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
