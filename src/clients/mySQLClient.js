import mysql from 'mysql2/promise';
import { env } from '../configs/envConfig.js';
import { DatabaseClient } from './databaseClient.js';

export class MySQLClient extends DatabaseClient {
  constructor() {
    super();
    this.pool = mysql.createPool({
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      port: env.DB_PORT,
    });
  }

  async connect() {
    return this.pool.getConnection();
  }

  async query(queryText, params = []) {
    const connection = await this.connect();
    try {
      const [rows] = await connection.query(queryText, params);
      return rows;
    } finally {
      connection.release();
    }
  }

  release() {
    return this.pool.end();
  }
}

