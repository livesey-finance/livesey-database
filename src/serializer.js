const createTable = (schema) => {
  const jsonString = JSON.stringify(schema);
  const parsedData = JSON.parse(jsonString);
  const tableName = parsedData.Table.tableName;
  const columns = parsedData.Table.columns;
  const relations = parsedData.Table.relations || {};

  let query = `CREATE TABLE IF NOT EXISTS "${tableName}" (`;

  const foreignKeys = [];

  for (const [columnName, columnValue] of Object.entries(columns)) {
    if (!columnValue || typeof columnValue.type !== 'string') {
      throw new Error(`Invalid column definition for column "${columnName}".`);
    }

    query += `"${columnName}" ${columnValue.type.toLowerCase()}`;

    if (typeof columnValue.length === 'number' && columnValue.type.toLowerCase() !== 'uuid') {
      query += `(${columnValue.length})`;
    }

    if (columnValue.primaryKey) {
      query += ' PRIMARY KEY';
    }

    if (columnValue.unique) {
      query += ' UNIQUE';
    }

    if (columnValue.notNull) {
      query += ' NOT NULL';
    }

    if (columnValue.enum) {
      if (!Array.isArray(columnValue.enum) || columnValue.enum.length === 0) {
        throw new Error(`Invalid enum definition for column "${columnName}".`);
      }
      const enumValues = columnValue.enum.map((value) => `'${value}'`).join(', ');
      query += ` CHECK ("${columnName}" IN (${enumValues}))`;
    }

    if (columnValue.foreignKey) {
      const { table, column } = columnValue.foreignKey;
      foreignKeys.push(`FOREIGN KEY ("${columnName}") REFERENCES "${table}"("${column}")`);
    }

    query += ', ';
  }

  // Append foreign keys to the query
  if (foreignKeys.length > 0) {
    query += foreignKeys.join(', ') + ', ';
  }

  query = query.slice(0, -2); // Remove last comma and space
  query += ');';

  // Handle ManyToMany relationships by creating join tables
  if (relations.ManyToMany) {
    for (const [relatedEntity, relationParams] of Object.entries(relations.ManyToMany)) {
      const joinTableName = `${tableName}_${relationParams.relatedEntity}`;
      query += ` CREATE TABLE IF NOT EXISTS "${joinTableName}" (`;
      query += `"${tableName}_id" UUID NOT NULL, `;
      query += `"${relationParams.relatedEntity}_id" UUID NOT NULL, `;
      query += `PRIMARY KEY ("${tableName}_id", "${relationParams.relatedEntity}_id"), `;
      query += `FOREIGN KEY ("${tableName}_id") REFERENCES "${tableName}"("id"), `;
      query += `FOREIGN KEY ("${relationParams.relatedEntity}_id") REFERENCES "${relationParams.relatedEntity}"("id")`;
      query += ');';
    }
  }

  return query.trim();
};


export const createSchema = async (dbClient, schema) => {
  const tableName = schema.Table.tableName;

  const tableExistsQuery = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `;

  const result = await dbClient.query(tableExistsQuery, [tableName]);

  const tableExists = result[0].exists;
  if (tableExists) {
    return;
  }

  const createTableQuery = createTable(schema);
  await dbClient.query(createTableQuery);
};
