import mysql from 'mysql2/promise';
import { dbHost, dbUser, dbPassword, dbName, dbPort } from '../configs/envConfig.js';
import { DatabaseClient } from './databaseClient.js';

export class MySQLClient extends DatabaseClient {
  constructor() {
    super();
    this.pool = mysql.createPool({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      port: dbPort,
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

  async release() {
    return this.pool.end();
  }
}

