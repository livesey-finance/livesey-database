import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
import { DatabaseClient } from './databaseClient.js';

export class MySQLClient extends DatabaseClient {
  constructor() {
    super();
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
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

