import t from 'tap';
import { PostgresClient, MySQLClient } from '../src/clients/index.js';
import { dbType } from '../src/configs/envConfig.js'; // dbType: 'postgres' or 'mysql'
import { createIndex, createUniqueIndex, dropIndex } from '../src/indexes.js';

let dbClient;

t.before(async () => {
  dbClient = dbType === 'postgres' ? new PostgresClient() : new MySQLClient();

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
    t.fail('Failed to create workers table: ' + error.message);
  }
});

t.beforeEach(async () => {
  try {
    await dbClient.query('DELETE FROM workers;');
  } catch (error) {
    console.error('Error cleaning up workers table:', error);
    t.fail('Failed to clean up workers table: ' + error.message);
  }
});

t.teardown(async () => {
  try {
    await dbClient.query('DROP TABLE IF EXISTS workers CASCADE;');
    console.log('workers table dropped successfully');
  } catch (error) {
    console.error('Error dropping workers table:', error);
    t.fail('Failed to drop workers table: ' + error.message);
  }
});

t.test('test createIndex, createUniqueIndex, and dropIndex functions', async (t) => {
  // createIndex
  try {
    await createIndex('workers', dbClient, dbType, 'name');
    t.pass('createIndex should create a non-unique index on "name" column');
  } catch (error) {
    if (error.code === '23505') {
      t.fail('Duplicate index exists, skipping index creation.');
    } else {
      t.fail('Failed to create index: ' + error.message);
    }
  }

  // createUniqueIndex
  try {
    await createUniqueIndex('workers', dbClient, dbType, 'name');
    t.pass('createUniqueIndex should create a unique index on "name" column');
  } catch (error) {
    if (error.code === '23505') {
      t.fail('Unique index already exists, skipping index creation.');
    } else {
      t.fail('Failed to create unique index: ' + error.message);
    }
  }

  // dropIndex
  try {
    await dropIndex('workers', dbClient, dbType, 'workers_name_idx');
    t.pass('dropIndex should drop the non-unique index on "name" column');
  } catch (error) {
    t.fail('Failed to drop index: ' + error.message);
  }

  try {
    await dropIndex('workers', dbClient, dbType, 'workers_name_uniq');
    t.pass('dropIndex should drop the unique index on "name" column');
  } catch (error) {
    t.fail('Failed to drop unique index: ' + error.message);
  }

  t.end();
});
