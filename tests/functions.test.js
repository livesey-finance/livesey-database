import t from 'tap';
import { PostgresClient, MySQLClient } from '../src/clients/index.js';
import { dbType } from '../src/configs/envConfig.js';
import { DatabaseFunction } from '../src/functions.js';

let dbClient;

t.before(async () => {
  dbClient = dbType === 'postgres' ? new PostgresClient() : new MySQLClient();

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
    t.fail('Failed to create users table: ' + error.message);
  }
});

t.beforeEach(async () => {
  try {
    await dbClient.query('DELETE FROM app_users;');
  } catch (error) {
    console.error('Error cleaning up app_users table:', error);
    t.fail('Failed to clean up app_users table: ' + error.message);
  }
});

t.teardown(async () => {
  try {
    await dbClient.query('DROP TABLE IF EXISTS app_users CASCADE;');
    console.log('Users table dropped successfully');
  } catch (error) {
    console.error('Error dropping app_users table:', error);
    t.fail('Failed to drop app_users table: ' + error.message);
  }
});


t.test('test DatabaseFunction class methods', async (t) => {
  const db = new DatabaseFunction('app_users', dbClient, dbType);

  // INSERT
  try {
    const columns = ['name'];
    const values = ['John Doe'];
    await db.insert().into(columns).values(values).execute();
    t.pass('INSERT query executed successfully');
  } catch (error) {
    t.fail('Failed to execute INSERT query: ' + error.message);
  }

  // SELECT
  try {
    const criteria = { id: 1 };
    const selectFields = ['id', 'name'];
    const result = await db.findRecord(criteria, selectFields);
    t.ok(result, 'SELECT query returned a result');
  } catch (error) {
    t.fail('Failed to execute SELECT query: ' + error.message);
  }

  // UPDATE
  try {
    const criteria = { id: 1 };
    const updateData = { name: 'John Updated' };
    const result = await db.updateRecord(criteria, updateData);
    t.ok(result, 'UPDATE query executed successfully');
  } catch (error) {
    t.fail('Failed to execute UPDATE query: ' + error.message);
  }

  // DELETE
  try {
    const criteria = { id: 1 };
    const result = await db.deleteRecord(criteria);
    t.ok(result, 'DELETE query executed successfully');
  } catch (error) {
    t.fail('Failed to execute DELETE query: ' + error.message);
  }

  t.end();
});
