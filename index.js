const databaseClient = require("./src/clients/databaseClient.js");
const mySQLClient = require("./src/clients/mySQLClient.js");
const postgresClient = require("./src/clients/postgresClient.js");
const database = require("./src/database.js");
const functions = require("./src/functions.js");
const serializer = require("./src/serializer.js");

module.exports = {
	...databaseClient,
	...mySQLClient,
	...postgresClient,
	...database,
	...functions,
	...serializer,
};
