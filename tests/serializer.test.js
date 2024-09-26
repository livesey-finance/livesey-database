const { test, before, beforeEach, after } = require("node:test");
const assert = require("node:assert/strict");
const { PostgresClient, MySQLClient } = require("../src/clients/index.js");
const { dbType, mySqlPool, postgresPool } = require("./envConfig.js");
const { createSchema } = require("../src/serializer.js");
const { DatabaseFunction } = require("../src/functions.js");

const AssetPricesSchema = {
	Table: {
		tableName: "Asset",
		columns: {
			assetId: {
				type: "uuid",
				primaryKey: true,
				unique: true,
				notNull: true,
			},
			assetType: {
				type: "varchar",
				length: 10,
				notNull: true,
				enum: ["Shares", "Crypto"],
			},
			name: {
				type: "varchar",
				length: 255,
				notNull: true,
			},
			currentPrice: {
				type: "numeric",
				notNull: true,
			},
			currencyCode: {
				type: "varchar",
				length: 3,
				notNull: true,
			},
		},
		relations: {
			ManyToOne: {
				relatedEntity: "Currency",
				foreignKey: "currencyCode",
			},
		},
	},
};

const CurrencySchema = {
	Table: {
		tableName: "Currency",
		columns: {
			currencyId: {
				type: "uuid",
				primaryKey: true,
				unique: true,
				notNull: true,
			},
			currencyCode: {
				type: "varchar",
				length: 3,
				notNull: true,
				unique: true,
			},
			name: {
				type: "varchar",
				length: 255,
				notNull: true,
			},
			symbol: {
				type: "varchar",
				length: 10,
				notNull: true,
			},
			exchangeRate: {
				type: "numeric",
				notNull: true,
			},
			decimalPlaces: {
				type: "integer",
				notNull: true,
			},
			lastUpdated: {
				type: "timestamp with time zone",
				notNull: true,
			},
		},
	},
};

let dbClient;

before(async () => {
	dbClient =
		dbType === "postgres"
			? new PostgresClient(postgresPool)
			: new MySQLClient(mySqlPool);

	await dbClient.query('DROP TABLE IF EXISTS "Asset" CASCADE;');
	await dbClient.query('DROP TABLE IF EXISTS "Currency" CASCADE;');
});

after(async () => {
	await dbClient.query('DROP TABLE IF EXISTS "Asset" CASCADE;');
	await dbClient.query('DROP TABLE IF EXISTS "Currency" CASCADE;');
});

test("create and validate Asset and Currency tables", async (t) => {
	const schemas = [AssetPricesSchema, CurrencySchema];

	try {
		await createSchema(dbClient, schemas, dbType);
	} catch (error) {
		assert.fail("Failed to create tables: " + error.message);
	}

	try {
		const tableExistsQuery =
			dbType === "postgres"
				? "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1);"
				: "SHOW TABLES LIKE ?;";

		const assetResult = await dbClient.query(tableExistsQuery, ["Asset"]);

		const currencyResult = await dbClient.query(tableExistsQuery, ["Currency"]);

		const db1 = new DatabaseFunction("Asset", dbClient, dbType);
		const db2 = new DatabaseFunction("Currency", dbClient, dbType);
		const result1 = await db1.findRecord({}, null);
		const result2 = await db2.findRecord({}, null);

		assert.ok(result1, "Asset table exists");
		assert.ok(result2, "Currency table exists");
	} catch (error) {
		assert.fail("Failed to validate table existence: " + error.message);
	}
});
