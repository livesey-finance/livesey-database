const { test, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const { PostgresClient, MySQLClient } = require("../src/clients/index.js");
const { dbType, mySqlPool, postgresPool } = require("./envConfig.js");
const { DatabaseFunction } = require("../src/functions.js");

let dbClient;

before(async () => {
	dbClient =
		dbType === "postgres"
			? new PostgresClient(postgresPool)
			: new MySQLClient(mySqlPool);

	try {
		// Створення таблиці employees
		await dbClient.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        employee_name VARCHAR(255) NOT NULL
      );
    `);

		await dbClient.query("SELECT 1");
	} catch (error) {
		assert.fail("Failed to create employees table: " + error.message);
	}
});

beforeEach(async () => {
	try {
		await dbClient.query(`
			CREATE TABLE IF NOT EXISTS employees (
				id SERIAL PRIMARY KEY,
				employee_name VARCHAR(255) NOT NULL
			);
		`);

		await dbClient.query("TRUNCATE TABLE employees RESTART IDENTITY;");
	} catch (error) {
		assert.fail("Failed to clean up employees table: " + error.message);
	}
});

after(async () => {
	try {
		await dbClient.query("DROP TABLE IF EXISTS employees CASCADE;");
	} catch (error) {
		assert.fail("Failed to drop employees table: " + error.message);
	}
});

test("DatabaseFunction class methods", async (t) => {
	const db = new DatabaseFunction("employees", dbClient, dbType);

	// INSERT
	await t.test("INSERT query", async () => {
		try {
			const columns = ["employee_name"];
			const values = ["Jane Doe"];
			await db.insert().into(columns).values(values).execute();
		} catch (error) {
			assert.fail("Failed to execute INSERT query: " + error.message);
		}
	});

	// SELECT
	await t.test("SELECT query", async () => {
		try {
			const criteria = { id: 1 };
			const selectFields = ["id", "employee_name"];
			const result = await db.findRecord(criteria, selectFields);
			assert.ok(result, "SELECT query returned a result");
		} catch (error) {
			assert.fail("Failed to execute SELECT query: " + error.message);
		}
	});

	// UPDATE
	await t.test("UPDATE query", async () => {
		try {
			const criteria = { id: 1 };
			const updateData = { employee_name: "Jane Updated" };
			const result = await db.updateRecord(criteria, updateData);
			assert.ok(result, "UPDATE query executed successfully");
		} catch (error) {
			assert.fail("Failed to execute UPDATE query: " + error.message);
		}
	});

	// DELETE
	await t.test("DELETE query", async () => {
		try {
			const criteria = { id: 1 };
			const result = await db.deleteRecord(criteria);
			assert.ok(result, "DELETE query executed successfully");
		} catch (error) {
			assert.fail("Failed to execute DELETE query: " + error.message);
		}
	});
});
