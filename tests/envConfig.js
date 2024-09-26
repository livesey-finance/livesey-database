const mysql = require("mysql2/promise");
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const dbType = process.env.DB_TYPE;
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;
const dbSsl = process.env.DB_SSL;

const mySqlPool = mysql.createPool({
	host: dbHost,
	user: dbUser,
	password: dbPassword,
	database: dbName,
	port: dbPort,
});

const postgresPool = new Pool({
	host: dbHost,
	user: dbUser,
	password: dbPassword,
	database: dbName,
	port: dbPort,
	ssl: dbSsl === "true" ? { rejectUnauthorized: false } : false,
});

module.exports = {
	dbType,
	mySqlPool,
	postgresPool,
};
