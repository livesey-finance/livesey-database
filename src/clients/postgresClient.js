import pkg from 'pg';
const { Pool } = pkg;
import { dbHost, dbUser, dbPassword, dbName, dbPort, dbSsl } from '../configs/envConfig.js';
import { DatabaseClient } from './databaseClient.js';

export class PostgresClient extends DatabaseClient {
  constructor() {
    super();
    this.pool = new Pool({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: dbPort,
      ssl: dbSsl === 'true' ? { rejectUnauthorized: false } : false,
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

  async release() {
    return this.pool.end();
  }
}
