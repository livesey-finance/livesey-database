import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { PostgresClient, MySQLClient } from '../src/clients/index.js';
import { dbType, mySqlPool, postgresPool } from './envConfig.js';
import { createSchema } from '../src/serializer.js';
import { DatabaseFunction } from '../src/functions.js';

const AssetPricesSchema = {
  'Table': {
    'tableName': 'Asset',
    'columns': {
      'assetId': {
        'type': 'uuid',
        'primaryKey': true,
        'unique': true,
        'notNull': true
      },
      'assetType': {
        'type': 'varchar',
        'length': 10,
        'notNull': true,
        'enum': ['Shares', 'Crypto']
      },
      'name': {
        'type': 'varchar',
        'length': 255,
        'notNull': true
      },
      'currentPrice': {
        'type': 'numeric',
        'notNull': true
      },
      'currencyCode': {
        'type': 'varchar',
        'length': 3,
        'notNull': true
      }
    },
    'relations': {
      'ManyToOne': {
        'relatedEntity': 'Currency',
        'foreignKey': 'currencyCode'
      }
    }
  }
};

const CurrencySchema = {
  'Table': {
    'tableName': 'Currency',
    'columns': {
      'currencyId': {
        'type': 'uuid',
        'primaryKey': true,
        'unique': true,
        'notNull': true
      },
      'currencyCode': {
        'type': 'varchar',
        'length': 3,
        'notNull': true,
        'unique': true
      },
      'name': {
        'type': 'varchar',
        'length': 255,
        'notNull': true
      },
      'symbol': {
        'type': 'varchar',
        'length': 10,
        'notNull': true
      },
      'exchangeRate': {
        'type': 'numeric',
        'notNull': true
      },
      'decimalPlaces': {
        'type': 'integer',
        'notNull': true
      },
      'lastUpdated': {
        'type': 'timestamp with time zone',
        'notNull': true
      }
    }
  }
};

let dbClient;

before(async () => {
  dbClient = dbType === 'postgres' ? new PostgresClient(postgresPool) : new MySQLClient(mySqlPool);

  await dbClient.query('DROP TABLE IF EXISTS "Asset" CASCADE;');
  await dbClient.query('DROP TABLE IF EXISTS "Currency" CASCADE;');
});

after(async () => {
  await dbClient.query('DROP TABLE IF EXISTS "Asset" CASCADE;');
  await dbClient.query('DROP TABLE IF EXISTS "Currency" CASCADE;');
});

test('create and validate Asset and Currency tables', async (t) => {
  const schemas = [AssetPricesSchema, CurrencySchema];

  try {
    await createSchema(dbClient, schemas, dbType);
    console.log('Tables created successfully');
    console.log('Schema created');
  } catch (error) {
    console.error('Schema creation failed:', error);
    assert.fail('Failed to create tables: ' + error.message);
  }

  try {
    const tableExistsQuery = dbType === 'postgres' ?
      'SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1);' :
      'SHOW TABLES LIKE ?;';

    console.log('Checking if Asset table exists...');
    const assetResult = await dbClient.query(tableExistsQuery, ['Asset']);
    console.log('Asset table result:', assetResult);

    console.log('Checking if Currency table exists...');
    const currencyResult = await dbClient.query(tableExistsQuery, ['Currency']);
    console.log('Currency table result:', currencyResult);

    if (dbType === 'postgres') {
      console.log('Postgres assetResult rows:', assetResult);
      console.log('Postgres currencyResult rows:', currencyResult);
    } else {
      console.log('MySQL assetResult:', assetResult);
      console.log('MySQL currencyResult:', currencyResult);
    }

    const db1 = new DatabaseFunction('Asset', dbClient, dbType);
    const db2 = new DatabaseFunction('Currency', dbClient, dbType);
    const result1 = await db1.findRecord({}, null);
    const result2 = await db2.findRecord({}, null);

    assert.ok(result1, 'Asset table exists');
    assert.ok(result2, 'Currency table exists');
  } catch (error) {
    console.error('Failed to validate table existence:', error);
    assert.fail('Failed to validate table existence: ' + error.message);
  }
});
