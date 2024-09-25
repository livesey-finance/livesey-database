import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { PostgresClient, MySQLClient } from '../src/clients/index.js';
import { dbType, mySqlPool, postgresPool } from './envConfig.js';
import { DatabaseFunction } from '../src/functions.js';

let dbClient;

before(async () => {
  dbClient = dbType === 'postgres' ? new PostgresClient(postgresPool) : new MySQLClient(mySqlPool);

  try {
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);
    console.log('Users table created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
    throw new Error('Failed to create users table: ' + error.message);
  }
});

beforeEach(async () => {
  try {
    await dbClient.query('DELETE FROM app_users;');
  } catch (error) {
    console.error('Error cleaning up app_users table:', error);
    throw new Error('Failed to clean up app_users table: ' + error.message);
  }
});

after(async () => {
  try {
    await dbClient.query('DROP TABLE IF EXISTS app_users CASCADE;');
    console.log('Users table dropped successfully');
  } catch (error) {
    console.error('Error dropping app_users table:', error);
    throw new Error('Failed to drop app_users table: ' + error.message);
  }
});

test('DatabaseFunction class methods', async (t) => {
  const db = new DatabaseFunction('app_users', dbClient, dbType);

  // INSERT
  await t.test('INSERT query', async () => {
    try {
      const columns = ['name'];
      const values = ['John Doe'];
      await db.insert().into(columns).values(values).execute();
    } catch (error) {
      assert.fail('Failed to execute INSERT query: ' + error.message);
    }
  });

  // SELECT
  await t.test('SELECT query', async () => {
    try {
      const criteria = { id: 1 };
      const selectFields = ['id', 'name'];
      const result = await db.findRecord(criteria, selectFields);
      assert.ok(result, 'SELECT query should return a result');
    } catch (error) {
      assert.fail('Failed to execute SELECT query: ' + error.message);
    }
  });

  // UPDATE
  await t.test('UPDATE query', async () => {
    try {
      const criteria = { id: 1 };
      const updateData = { name: 'John Updated' };
      const result = await db.updateRecord(criteria, updateData);
      assert.ok(result, 'UPDATE query should execute successfully');
    } catch (error) {
      assert.fail('Failed to execute UPDATE query: ' + error.message);
    }
  });

  // DELETE
  await t.test('DELETE query', async () => {
    try {
      const criteria = { id: 1 };
      const result = await db.deleteRecord(criteria);
      assert.ok(result, 'DELETE query should execute successfully');
    } catch (error) {
      assert.fail('Failed to execute DELETE query: ' + error.message);
    }
  });
});
