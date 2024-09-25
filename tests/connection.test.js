import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresClient, MySQLClient } from '../src/clients/index.js';
import { dbType, dbHost, dbUser, dbName, dbPort, mySqlPool, postgresPool } from './envConfig.js';

let dbClient;

test('test connection to database', async (t) => {
  console.log(`Testing database connection for dbType: ${dbType}`);
  console.log(`Database config: Host=${dbHost}, User=${dbUser}, Name=${dbName}, Port=${dbPort}`);

  if (dbType === 'postgres') {
    dbClient = new PostgresClient(postgresPool);
    assert.ok(dbClient instanceof PostgresClient, 'dbClient should be an instance of PostgresClient');
  } else if (dbType === 'mysql') {
    dbClient = new MySQLClient(mySqlPool);
    assert.ok(dbClient instanceof MySQLClient, 'dbClient should be an instance of MySQLClient');
  } else {
    assert.fail('Unsupported dbType');
  }
});

test('test connection to database', async (t) => {
  console.log(`Testing database connection for dbType: ${dbType}`);
  console.log(`Database config: Host=${dbHost}, User=${dbUser}, Name=${dbName}, Port=${dbPort}`);

  if (dbType === 'postgres') {
    dbClient = new PostgresClient(postgresPool);
    assert.ok(dbClient instanceof PostgresClient, 'dbClient should be an instance of PostgresClient');
  } else if (dbType === 'mysql') {
    dbClient = new MySQLClient(mySqlPool);
    assert.ok(dbClient instanceof MySQLClient, 'dbClient should be an instance of MySQLClient');
  } else {
    assert.fail('Unsupported dbType');
  }

  let connection;
  try {
    connection = await dbClient.connect();
    assert.ok(connection, 'Connection should be established');
  } catch (error) {
    console.error('Error while connecting to the database:', error);
    assert.fail('Failed to connect to the database: ' + error.message);
  } finally {
    if (connection) connection.release();
  }

  try {
    const rows = await dbClient.query('SELECT 1 as result');
    assert.deepEqual(rows[0], { result: 1 }, 'Query should return expected result');
  } catch (error) {
    console.error('Error while running query:', error);
    assert.fail('Failed to run query: ' + error.message);
  }

  try {
    await dbClient.release();
    console.log('Connection pool closed successfully');
  } catch (error) {
    console.error('Error while releasing connection pool:', error);
    assert.fail('Failed to close the connection pool: ' + error.message);
  }
});
