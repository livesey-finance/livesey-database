const { test, before, beforeEach, after } = require("node:test");
const assert = require("node:assert");
const { PostgresClient, MySQLClient } = require("../src/clients/index.js");
const { dbType, mySqlPool, postgresPool } = require("./envConfig.js");
const { Database } = require("../src/database.js");

let dbClient;

before(async () => {
	// Initialize the correct DB client based on dbType
	dbClient =
		dbType === "postgres"
			? new PostgresClient(postgresPool)
			: new MySQLClient(mySqlPool);

	try {
		await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);
	} catch (error) {
		throw new Error("Failed to create users table: " + error.message);
	}
});

beforeEach(async () => {
	// Clean up the table before each test
	try {
		await dbClient.query("DELETE FROM users;");
	} catch (error) {
		throw new Error("Failed to clean up users table: " + error.message);
	}
});

after(async () => {
	try {
		await dbClient.query("DROP TABLE IF EXISTS users CASCADE;");
	} catch (error) {
		throw new Error("Failed to drop users table: " + error.message);
	}
});

test("Database class methods", async (t) => {
	const tableName = "users";
	const db = new Database(tableName, dbClient, dbType);

	// SELECT
	await t.test("SELECT query", async () => {
		try {
			const criteria = { id: 1 };
			const selectFields = ["id", "name"];
			const result = await db.select(selectFields).where(criteria).execute();
			assert.ok(result, "SELECT query should return results");
		} catch (error) {
			assert.fail("Failed to execute SELECT query: " + error.message);
		}
	});

	// INSERT
	await t.test("INSERT query", async () => {
		try {
			const columns = ["name"];
			const values = ["John Doe"];
			await db.insert().into(columns).values(values).execute();
		} catch (error) {
			assert.fail("Failed to execute INSERT query: " + error.message);
		}
	});

	// UPDATE
	await t.test("UPDATE query", async () => {
		try {
			const criteria = { id: 1 };
			const updateData = { name: "John Updated" };
			await db.update().set(updateData).where(criteria).execute();
		} catch (error) {
			assert.fail("Failed to execute UPDATE query: " + error.message);
		}
	});

	// DELETE
	await t.test("DELETE query", async () => {
		try {
			const criteria = { id: 1 };
			await db.delete().where(criteria).execute();
		} catch (error) {
			assert.fail("Failed to execute DELETE query: " + error.message);
		}
	});
});
