import mysql from 'mysql2/promise';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT;
export const dbType = process.env.DB_TYPE;
export const dbHost = process.env.DB_HOST;
export const dbUser = process.env.DB_USER;
export const dbPassword = process.env.DB_PASSWORD;
export const dbName = process.env.DB_NAME;
export const dbPort = process.env.DB_PORT;
export const dbSsl = process.env.DB_SSL;

export const mySqlPool = mysql.createPool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
});

export const postgresPool = new Pool({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  ssl: dbSsl === 'true' ? { rejectUnauthorized: false } : false,
});
