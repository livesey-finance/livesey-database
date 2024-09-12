import t from 'tap';
import { PostgresClient, MySQLClient } from '../src/clients/index.js';
import { dbType, dbHost, dbUser, dbName, dbPort } from '../src/configs/envConfig.js';
import { Database } from '../src/database.js';

let dbClient;

t.before(async () => {
  // Initialize the right DB client based on dbType
  dbClient = dbType === 'postgres' ? new PostgresClient() : new MySQLClient();

  try {
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
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
  // Clean up the table before each test to avoid conflicts
  try {
    await dbClient.query('DELETE FROM users;');
  } catch (error) {
    console.error('Error cleaning up users table:', error);
    t.fail('Failed to clean up users table: ' + error.message);
  }
});

t.teardown(async () => {
  try {
    await dbClient.query('DROP TABLE IF EXISTS users CASCADE;');
    console.log('Users table dropped successfully');
  } catch (error) {
    console.error('Error dropping users table:', error);
    t.fail('Failed to drop users table: ' + error.message);
  }
});

t.test('test Database class methods', async (t) => {
  const tableName = 'users';
  const db = new Database(tableName, dbClient, dbType);

  // SELECT
  try {
    const criteria = { id: 1 };
    const selectFields = ['id', 'name'];
    await db.select(selectFields).where(criteria).execute();
    t.pass('SELECT query executed successfully');
  } catch (error) {
    t.fail('Failed to execute SELECT query: ' + error.message);
  }

  // INSERT (without 'id', auto-increment)
  try {
    const columns = ['name'];
    const values = ['John Doe'];
    await db.insert().into(columns).values(values).execute();
    t.pass('INSERT query executed successfully');
  } catch (error) {
    t.fail('Failed to execute INSERT query: ' + error.message);
  }

  // UPDATE
  try {
    const criteria = { id: 1 };
    const updateData = { name: 'John Updated' };
    await db.update().set(updateData).where(criteria).execute();
    t.pass('UPDATE query executed successfully');
  } catch (error) {
    t.fail('Failed to execute UPDATE query: ' + error.message);
  }

  // DELETE
  try {
    const criteria = { id: 1 };
    await db.delete().where(criteria).execute();
    t.pass('DELETE query executed successfully');
  } catch (error) {
    t.fail('Failed to execute DELETE query: ' + error.message);
  }

  t.end();
});
