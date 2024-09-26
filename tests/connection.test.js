// const test = require("node:test");
// const assert = require("node:assert/strict");
// const { PostgresClient, MySQLClient } = require("../src/clients/index.js");
// const {
// 	dbType,
// 	dbHost,
// 	dbUser,
// 	dbName,
// 	dbPort,
// 	mySqlPool,
// 	postgresPool,
// } = require("./envConfig.js");

// let dbClient;

// test("test connection to database", async (t) => {
// 	if (dbType === "postgres") {
// 		dbClient = new PostgresClient(postgresPool);
// 		assert.ok(
// 			dbClient instanceof PostgresClient,
// 			"dbClient should be an instance of PostgresClient",
// 		);
// 	} else if (dbType === "mysql") {
// 		dbClient = new MySQLClient(mySqlPool);
// 		assert.ok(
// 			dbClient instanceof MySQLClient,
// 			"dbClient should be an instance of MySQLClient",
// 		);
// 	} else {
// 		assert.fail("Unsupported dbType");
// 	}
// });

// test("test connection to database", async (t) => {
// 	if (dbType === "postgres") {
// 		dbClient = new PostgresClient(postgresPool);
// 		assert.ok(
// 			dbClient instanceof PostgresClient,
// 			"dbClient should be an instance of PostgresClient",
// 		);
// 	} else if (dbType === "mysql") {
// 		dbClient = new MySQLClient(mySqlPool);
// 		assert.ok(
// 			dbClient instanceof MySQLClient,
// 			"dbClient should be an instance of MySQLClient",
// 		);
// 	} else {
// 		assert.fail("Unsupported dbType");
// 	}

// 	let connection;
// 	try {
// 		connection = await dbClient.connect();
// 		assert.ok(connection, "Connection should be established");
// 	} catch (error) {
// 		assert.fail("Failed to connect to the database: " + error.message);
// 	} finally {
// 		if (connection) connection.release();
// 	}

// 	try {
// 		const rows = await dbClient.query("SELECT 1 as result");
// 		assert.deepEqual(
// 			rows[0],
// 			{ result: 1 },
// 			"Query should return expected result",
// 		);
// 	} catch (error) {
// 		assert.fail("Failed to run query: " + error.message);
// 	}

// 	try {
// 		await dbClient.release();
// 	} catch (error) {
// 		assert.fail("Failed to close the connection pool: " + error.message);
// 	}
// });
