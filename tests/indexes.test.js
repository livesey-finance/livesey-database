// const { test, before, beforeEach, after } = require("node:test");
// const assert = require("node:assert");
// const { PostgresClient, MySQLClient } = require("../src/clients/index.js");
// const { dbType, mySqlPool, postgresPool } = require("./envConfig.js");
// const {
// 	createIndex,
// 	createUniqueIndex,
// 	dropIndex,
// } = require("../src/indexes.js");

// let dbClient;

// before(async () => {
// 	dbClient =
// 		dbType === "postgres"
// 			? new PostgresClient(postgresPool)
// 			: new MySQLClient(mySqlPool);

// 	try {
// 		await dbClient.query(`
//       CREATE TABLE IF NOT EXISTS workers (
//         id SERIAL PRIMARY KEY,
//         name VARCHAR(255) NOT NULL
//       );
//     `);
// 	} catch (error) {
// 		assert.fail("Failed to create workers table: " + error.message);
// 	}
// });

// beforeEach(async () => {
// 	try {
// 		await dbClient.query("DELETE FROM workers;");
// 	} catch (error) {
// 		t.fail("Failed to clean up workers table: " + error.message);
// 	}
// });

// after(async () => {
// 	try {
// 		await dbClient.query("DROP TABLE IF EXISTS app_users CASCADE;");
// 	} catch (error) {
// 		throw new Error("Failed to drop app_users table: " + error.message);
// 	}
// });

// test("test createIndex, createUniqueIndex, and dropIndex functions", async (t) => {
// 	// createIndex
// 	try {
// 		await createIndex("workers", dbClient, dbType, "name");
// 	} catch (error) {
// 		if (error.code === "23505") {
// 			assert.fail("Duplicate index exists, skipping index creation.");
// 		} else {
// 			assert.fail("Failed to create index: " + error.message);
// 		}
// 	}

// 	// createUniqueIndex
// 	try {
// 		await createUniqueIndex("workers", dbClient, dbType, "name");
// 	} catch (error) {
// 		if (error.code === "23505") {
// 			assert.fail("Unique index already exists, skipping index creation.");
// 		} else {
// 			assert.fail("Failed to create unique index: " + error.message);
// 		}
// 	}

// 	// dropIndex
// 	try {
// 		await dropIndex("workers", dbClient, dbType, "workers_name_idx");
// 	} catch (error) {
// 		assert.fail("Failed to drop index: " + error.message);
// 	}

// 	try {
// 		await dropIndex("workers", dbClient, dbType, "workers_name_uniq");
// 	} catch (error) {
// 		assert.fail("Failed to drop unique index: " + error.message);
// 	}
// });
