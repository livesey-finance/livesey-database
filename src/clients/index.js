const databaseClient = require("./databaseClient.js");
const mySQLClient = require("./mySQLClient.js");
const postgresClient = require("./postgresClient.js");

module.exports = {
	...databaseClient,
	...mySQLClient,
	...postgresClient,
};
