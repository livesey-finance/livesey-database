export const createIndex = async (tableName, dbClient, dbType, ...columns) => {
  let query = '';

  if (columns.length > 0) {
    for (const column of columns) {
      if (dbType === 'postgres') {
        query += `CREATE INDEX "${tableName}_${column}_idx" ON "${tableName}" ("${column}");`;
      } else if (dbType === 'mysql') {
        query += `CREATE INDEX \`${tableName}_${column}_idx\` ON \`${tableName}\` (\`${column}\`);`;
      }
    }
    await dbClient.query(query);
  }
};

export const createUniqueIndex = async (tableName, dbClient, dbType, ...columns) => {
  let query = '';

  if (columns.length > 0) {
    for (const column of columns) {
      if (dbType === 'postgres') {
        query += `CREATE UNIQUE INDEX "${tableName}_${column}_uniq" ON "${tableName}" ("${column}");`;
      } else if (dbType === 'mysql') {
        query += `CREATE UNIQUE INDEX \`${tableName}_${column}_uniq\` ON \`${tableName}\` (\`${column}\`);`;
      }
    }
    await dbClient.query(query);
  }
};

export const dropIndex = async (tableName, dbClient, dbType, indexName) => {
  let query = '';

  if (dbType === 'postgres') {
    query = `DROP INDEX IF EXISTS "${indexName}";`;
  } else if (dbType === 'mysql') {
    query = `DROP INDEX \`${indexName}\` ON \`${tableName}\`;`;
  }

  await dbClient.query(query);
};
