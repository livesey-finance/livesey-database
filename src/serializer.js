const createTable = (schema, dbType) => {
	const jsonString = JSON.stringify(schema);
	const parsedData = JSON.parse(jsonString);
	const tableName = parsedData.Table.tableName;
	const columns = parsedData.Table.columns;

	let query = `CREATE TABLE IF NOT EXISTS ${dbType === "postgres" ? `"${tableName}"` : `\`${tableName}\``} (`;

	for (const [columnName, columnValue] of Object.entries(columns)) {
		if (!columnValue || typeof columnValue.type !== "string") {
			throw new Error(`Invalid column definition for column "${columnName}".`);
		}

		query += `${dbType === "postgres" ? `"${columnName}"` : `\`${columnName}\``} ${columnValue.type.toLowerCase()}`;

		if (
			typeof columnValue.length === "number" &&
			columnValue.type.toLowerCase() !== "uuid"
		) {
			query += `(${columnValue.length})`;
		}

		if (columnValue.primaryKey) {
			query += " PRIMARY KEY";
		}

		if (columnValue.unique) {
			query += " UNIQUE";
		}

		if (columnValue.notNull) {
			query += " NOT NULL";
		}

		if (columnValue.enum) {
			if (!Array.isArray(columnValue.enum) || columnValue.enum.length === 0) {
				throw new Error(`Invalid enum definition for column "${columnName}".`);
			}
			const enumValues = columnValue.enum
				.map((value) => `'${value}'`)
				.join(", ");
			query += ` CHECK (${dbType === "postgres" ? `"${columnName}"` : `\`${columnName}\``} IN (${enumValues}))`;
		}

		query += ", ";
	}

	query = query.slice(0, -2);
	query += ");";

	return query.trim();
};

const addRelations = (schema, allSchemas, dbType) => {
	if (!allSchemas) {
		throw new Error("Schemas array is undefined or empty.");
	}

	const jsonString = JSON.stringify(schema);
	const parsedData = JSON.parse(jsonString);

	const tableName = parsedData.Table.tableName;
	const relations = parsedData.Table.relations || {};

	const queries = [];

	// ManyToOne
	if (relations.ManyToOne) {
		const manyToOneRelations = Array.isArray(relations.ManyToOne)
			? relations.ManyToOne
			: [relations.ManyToOne];

		for (const relationParams of manyToOneRelations) {
			const query = `ALTER TABLE ${dbType === "postgres" ? `"${tableName}"` : `\`${tableName}\``}
        ADD FOREIGN KEY (${dbType === "postgres" ? `"${relationParams.foreignKey}"` : `\`${relationParams.foreignKey}\``})
        REFERENCES ${dbType === "postgres" ? `"${relationParams.relatedEntity}"` : `\`${relationParams.relatedEntity}\``}
        (${dbType === "postgres" ? `"${relationParams.foreignKey}"` : `\`${relationParams.foreignKey}\``});`;
			queries.push(query);
		}
	}

	// OneToMany
	if (relations.OneToMany) {
		const oneToManyRelations = Array.isArray(relations.OneToMany)
			? relations.OneToMany
			: [relations.OneToMany];

		for (const relationParams of oneToManyRelations) {
			const query = `ALTER TABLE ${dbType === "postgres" ? `"${relationParams.relatedEntity}"` : `\`${relationParams.relatedEntity}\``}
        ADD FOREIGN KEY (${dbType === "postgres" ? `"${relationParams.foreignKey}"` : `\`${relationParams.foreignKey}\``})
        REFERENCES ${dbType === "postgres" ? `"${tableName}"` : `\`${tableName}\``}
        (${dbType === "postgres" ? `"${relationParams.foreignKey}"` : `\`${relationParams.foreignKey}\``});`;
			queries.push(query);
		}
	}

	// OneToOne
	if (relations.OneToOne) {
		const oneToOneRelations = Array.isArray(relations.OneToOne)
			? relations.OneToOne
			: [relations.OneToOne];

		for (const relationParams of oneToOneRelations) {
			const query = `ALTER TABLE ${dbType === "postgres" ? `"${tableName}"` : `\`${tableName}\``} 
        ADD UNIQUE (${dbType === "postgres" ? `"${relationParams.foreignKey}"` : `\`${relationParams.foreignKey}\``}),
        ADD FOREIGN KEY (${dbType === "postgres" ? `"${relationParams.foreignKey}"` : `\`${relationParams.foreignKey}\``})
        REFERENCES ${dbType === "postgres" ? `"${relationParams.relatedEntity}"` : `\`${relationParams.relatedEntity}\``}
        (${dbType === "postgres" ? `"${relationParams.foreignKey}"` : `\`${relationParams.foreignKey}\``});`;
			queries.push(query);
		}
	}

	// ManyToMany
	if (relations.ManyToMany) {
		const relatedEntity = relations.ManyToMany.relatedEntity;
		const foreignKey = relations.ManyToMany.foreignKey;

		const relatedSchema = allSchemas.find(
			(s) => s.Table.tableName === relatedEntity,
		);
		if (!relatedSchema) {
			throw new Error(`Related schema for "${relatedEntity}" not found.`);
		}

		const relatedPrimaryKey = Object.keys(relatedSchema.Table.columns).find(
			(col) => relatedSchema.Table.columns[col].primaryKey,
		);

		const joinTableName = `${tableName}_${relatedEntity}`;

		const createJoinTableQuery = `
      CREATE TABLE IF NOT EXISTS ${dbType === "postgres" ? `"${joinTableName}"` : `\`${joinTableName}\``} (
        ${dbType === "postgres" ? `"${tableName}_id" uuid NOT NULL` : `\`${tableName}_id\` VARCHAR(36) NOT NULL`},
        ${dbType === "postgres" ? `"${relatedEntity}_id" uuid NOT NULL` : `\`${relatedEntity}_id\` VARCHAR(36) NOT NULL`},
        PRIMARY KEY (${dbType === "postgres" ? `"${tableName}_id", "${relatedEntity}_id"` : `\`${tableName}_id\`, \`${relatedEntity}_id\``}),
        FOREIGN KEY (${dbType === "postgres" ? `"${tableName}_id"` : `\`${tableName}_id\``})
        REFERENCES ${dbType === "postgres" ? `"${tableName}"` : `\`${tableName}\``}
        (${dbType === "postgres" ? `"${foreignKey}"` : `\`${foreignKey}\``}),
        FOREIGN KEY (${dbType === "postgres" ? `"${relatedEntity}_id"` : `\`${relatedEntity}_id\``})
        REFERENCES ${dbType === "postgres" ? `"${relatedEntity}"` : `\`${relatedEntity}\``}
        (${dbType === "postgres" ? `"${relatedPrimaryKey}"` : `\`${relatedPrimaryKey}\``})
      );
    `;

		queries.push(createJoinTableQuery);
	}

	return queries.join(" ");
};

const createSchema = async (dbClient, schemas, dbType) => {
	for (const schema of schemas) {
		const tableName = schema.Table.tableName;

		const tableExistsQuery =
			dbType === "postgres"
				? `
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `
				: `
        SELECT COUNT(*) AS count 
        FROM information_schema.tables 
        WHERE table_name = ?;
      `;

		const result = await dbClient.query(tableExistsQuery, [tableName]);

		const tableExists =
			dbType === "postgres"
				? result?.rows?.[0]?.exists || false
				: result?.[0]?.count > 0;

		if (!tableExists) {
			const createTableQuery = createTable(schema, dbType);
			await dbClient.query(createTableQuery);
		} else {
			return;
		}
	}

	for (const schema of schemas) {
		const addRelationsQuery = addRelations(schema, schemas, dbType);
		if (addRelationsQuery) {
			await dbClient.query(addRelationsQuery);
		}
	}
};

module.exports = {
	createSchema,
};
