import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import { PostgresClient, MySQLClient } from '../src/clients/index.js';
import { dbType, mySqlPool, postgresPool } from './envConfig.js';
import { createIndex, createUniqueIndex, dropIndex } from '../src/indexes.js';

let dbClient;

before(async () => {
  dbClient = dbType === 'postgres' ? new PostgresClient(postgresPool) : new MySQLClient(mySqlPool);

  try {
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `);
    console.log('workers table created successfully');
  } catch (error) {
    console.error('Error creating workers table:', error);
    assert.fail('Failed to create workers table: ' + error.message);
  }
});

beforeEach(async () => {
  try {
    await dbClient.query('DELETE FROM workers;');
  } catch (error) {
    console.error('Error cleaning up workers table:', error);
    t.fail('Failed to clean up workers table: ' + error.message);
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

test('test createIndex, createUniqueIndex, and dropIndex functions', async (t) => {
  // createIndex
  try {
    await createIndex('workers', dbClient, dbType, 'name');
    console.log('createIndex should create a non-unique index on "name" column');
  } catch (error) {
    if (error.code === '23505') {
      assert.fail('Duplicate index exists, skipping index creation.');
    } else {
      assert.fail('Failed to create index: ' + error.message);
    }
  }

  // createUniqueIndex
  try {
    await createUniqueIndex('workers', dbClient, dbType, 'name');
    console.log('createUniqueIndex should create a unique index on "name" column');
  } catch (error) {
    if (error.code === '23505') {
      assert.fail('Unique index already exists, skipping index creation.');
    } else {
      assert.fail('Failed to create unique index: ' + error.message);
    }
  }

  // dropIndex
  try {
    await dropIndex('workers', dbClient, dbType, 'workers_name_idx');
    console.log('dropIndex should drop the non-unique index on "name" column');
  } catch (error) {
    assert.fail('Failed to drop index: ' + error.message);
  }

  try {
    await dropIndex('workers', dbClient, dbType, 'workers_name_uniq');
    console.log('dropIndex should drop the unique index on "name" column');
  } catch (error) {
    assert.fail('Failed to drop unique index: ' + error.message);
  }
});
