const createTable = (schema) => {
  const jsonString = JSON.stringify(schema);
  const parsedData = JSON.parse(jsonString);

  let query = `CREATE TABLE "${parsedData.Table.tableName}" (`;

  for (const [columnName, columnValue] of Object.entries(parsedData.Table.columns)) {
    query += `"${columnName}" ${columnValue.type.toLowerCase()}`;

    if (columnValue.length && columnValue.type.toLowerCase() !== 'uuid') {
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
      const enumValues = columnValue.enum.map((value) => `'${value}'`).join(', ');
      query += ` CHECK ("${columnName}" IN (${enumValues}))`;
    }

    if (columnValue.foreignKey) {
      query += `, FOREIGN KEY ("${columnName}") REFERENCES "${columnValue.foreignKey.table}"("${columnValue.foreignKey.column}")`;
    }

    query += ', ';
  }

  if (parsedData.Table.relations) {
    for (const [relation, relationParams] of Object.entries(parsedData.Table.relations)) {
      if (relation === 'OneToMany' || relation === 'OneToOne' || relation === 'ManyToOne') {
        // Skip adding these since they're already handled via `foreignKey` in columns
        continue;
      } else if (relation === 'ManyToMany') {
        const joinTableName = `${parsedData.Table.tableName}_${relationParams.relatedEntity}`;
        query += `CREATE TABLE "${joinTableName}" (`;
        query += `"${parsedData.Table.tableName}_id" INT, `;
        query += `"${relationParams.relatedEntity}_id" INT, `;
        query += `PRIMARY KEY ("${parsedData.Table.tableName}_id", "${relationParams.relatedEntity}_id")); `;
      }
    }
  }

  query = query.slice(0, -2);
  query += ');';

  return query;
};