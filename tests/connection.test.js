import t from 'tap';
import { PostgresClient, MySQLClient } from '../src/clients/index.js';
import { dbType, dbHost, dbUser, dbName, dbPort } from '../src/configs/envConfig.js';

let dbClient;

t.test('test connection to database', async (t) => {
  console.log(`Testing database connection for dbType: ${dbType}`);
  console.log(`Database config: Host=${dbHost}, User=${dbUser}, Name=${dbName}, Port=${dbPort}`);

  if (dbType === 'postgres') {
    dbClient = new PostgresClient();
    t.ok(dbClient instanceof PostgresClient, 'dbClient should be an instance of PostgresClient');
  } else if (dbType === 'mysql') {
    dbClient = new MySQLClient();
    t.ok(dbClient instanceof MySQLClient, 'dbClient should be an instance of MySQLClient');
  } else {
    t.fail('Unsupported dbType');
    t.end();
    return;
  }

  // Test connection
  let connection;
  try {
    connection = await dbClient.connect();
    t.ok(connection, 'Connection should be established');
  } catch (error) {
    console.error('Error while connecting to the database:', error);
    t.fail('Failed to connect to the database: ' + error.message);
  } finally {
    if (connection) connection.release();
  }

  try {
    const rows = await dbClient.query('SELECT 1 as result');
    t.same(rows[0], { result: 1 }, 'Query should return expected result');
  } catch (error) {
    console.error('Error while running query:', error);
    t.fail('Failed to run query: ' + error.message);
  }

  try {
    await dbClient.release();
    t.pass('Connection pool closed successfully');
  } catch (error) {
    console.error('Error while releasing connection pool:', error);
    t.fail('Failed to close the connection pool: ' + error.message);
  }

  t.end();
});
