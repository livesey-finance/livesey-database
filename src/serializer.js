const createTable = (schema, dbType) => {
	const jsonString = JSON.stringify(schema);
	const parsedData = JSON.parse(jsonString);
	const tableName = parsedData.Table.tableName;
	const columns = parsedData.Table.columns;

	let query = `CREATE TABLE IF NOT EXISTS `;

	if (dbType === "postgres") {
		query += `"${tableName}"`;
	} else {
		query += `\`${tableName}\``;
	}

	query += ` (`;

	for (const [columnName, columnValue] of Object.entries(columns)) {
		if (!columnValue || typeof columnValue.type !== "string") {
			throw new Error(`Invalid column definition for column "${columnName}".`);
		}

		query += ` `;
		if (dbType === "postgres") {
			query += `"${columnName}"`;
		} else {
			query += `\`${columnName}\``;
		}
		query += ` ${columnValue.type.toLowerCase()}`;

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

			if (dbType === "postgres") {
				query += ` CHECK ("${columnName}" IN (${enumValues}))`;
			} else {
				query += ` CHECK (\`${columnName}\` IN (${enumValues}))`;
			}
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
		let manyToOneRelations;

		if (Array.isArray(relations.ManyToOne)) {
			manyToOneRelations = relations.ManyToOne;
		} else {
			manyToOneRelations = [relations.ManyToOne];
		}

		for (const relationParams of manyToOneRelations) {
			let tableNameWrapped;
			let foreignKeyWrapped;
			let relatedEntityWrapped;

			if (dbType === "postgres") {
				tableNameWrapped = `"${tableName}"`;
				foreignKeyWrapped = `"${relationParams.foreignKey}"`;
				relatedEntityWrapped = `"${relationParams.relatedEntity}"`;
			} else {
				tableNameWrapped = `\`${tableName}\``;
				foreignKeyWrapped = `\`${relationParams.foreignKey}\``;
				relatedEntityWrapped = `\`${relationParams.relatedEntity}\``;
			}

			const query = `ALTER TABLE ${tableNameWrapped}
			ADD FOREIGN KEY (${foreignKeyWrapped})
			REFERENCES ${relatedEntityWrapped}
			(${foreignKeyWrapped});`;

			queries.push(query);
		}
	}

	// OneToMany
	if (relations.OneToMany) {
		let oneToManyRelations;
		if (Array.isArray(relations.OneToMany)) {
			oneToManyRelations = relations.OneToMany;
		} else {
			oneToManyRelations = [relations.OneToMany];
		}

		for (const relationParams of oneToManyRelations) {
			let relatedEntityFormatted;
			if (dbType === "postgres") {
				relatedEntityFormatted = `"${relationParams.relatedEntity}"`;
			} else {
				relatedEntityFormatted = `\`${relationParams.relatedEntity}\``;
			}

			let foreignKeyFormatted;
			if (dbType === "postgres") {
				foreignKeyFormatted = `"${relationParams.foreignKey}"`;
			} else {
				foreignKeyFormatted = `\`${relationParams.foreignKey}\``;
			}

			let tableNameFormatted;
			if (dbType === "postgres") {
				tableNameFormatted = `"${tableName}"`;
			} else {
				tableNameFormatted = `\`${tableName}\``;
			}

			let foreignKeyReferenceFormatted;
			if (dbType === "postgres") {
				foreignKeyReferenceFormatted = `"${relationParams.foreignKey}"`;
			} else {
				foreignKeyReferenceFormatted = `\`${relationParams.foreignKey}\``;
			}

			const query = `ALTER TABLE ${relatedEntityFormatted} ADD FOREIGN KEY (${foreignKeyFormatted}) REFERENCES ${tableNameFormatted} (${foreignKeyReferenceFormatted});`;

			queries.push(query);
		}
	}

	// OneToOne
	if (relations.OneToOne) {
		let oneToOneRelations;
		if (Array.isArray(relations.OneToOne)) {
			oneToOneRelations = relations.OneToOne;
		} else {
			oneToOneRelations = [relations.OneToOne];
		}

		for (const relationParams of oneToOneRelations) {
			let formattedTableName;
			if (dbType === "postgres") {
				formattedTableName = `"${tableName}"`;
			} else {
				formattedTableName = `\`${tableName}\``;
			}

			let formattedForeignKey;
			if (dbType === "postgres") {
				formattedForeignKey = `"${relationParams.foreignKey}"`;
			} else {
				formattedForeignKey = `\`${relationParams.foreignKey}\``;
			}

			let formattedRelatedEntity;
			if (dbType === "postgres") {
				formattedRelatedEntity = `"${relationParams.relatedEntity}"`;
			} else {
				formattedRelatedEntity = `\`${relationParams.relatedEntity}\``;
			}

			const query = `ALTER TABLE ${formattedTableName} ADD UNIQUE (${formattedForeignKey}), ADD FOREIGN KEY (${formattedForeignKey}) REFERENCES ${formattedRelatedEntity} (${formattedForeignKey});`;
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

		let joinTableWrapped = "";
		let tableIdWrapped = "";
		let relatedEntityIdWrapped = "";
		let primaryKeyWrapped = "";
		let tableForeignKeyWrapped = "";
		let relatedEntityForeignKeyWrapped = "";

		if (dbType === "postgres") {
			joinTableWrapped = `"${joinTableName}"`;
			tableIdWrapped = `"${tableName}_id" uuid NOT NULL`;
			relatedEntityIdWrapped = `"${relatedEntity}_id" uuid NOT NULL`;
			primaryKeyWrapped = `"${tableName}_id", "${relatedEntity}_id"`;
			tableForeignKeyWrapped = `"${tableName}_id"`;
			relatedEntityForeignKeyWrapped = `"${relatedEntity}_id"`;
		} else {
			joinTableWrapped = `\`${joinTableName}\``;
			tableIdWrapped = `\`${tableName}_id\` VARCHAR(36) NOT NULL`;
			relatedEntityIdWrapped = `\`${relatedEntity}_id\` VARCHAR(36) NOT NULL`;
			primaryKeyWrapped = `\`${tableName}_id\`, \`${relatedEntity}_id\``;
			tableForeignKeyWrapped = `\`${tableName}_id\``;
			relatedEntityForeignKeyWrapped = `\`${relatedEntity}_id\``;
		}

		let tableWrapped;
		let foreignKeyWrapped;
		let relatedEntityWrapped;
		let relatedPrimaryKeyWrapped;

		if (dbType === "postgres") {
			tableWrapped = `"${tableName}"`;
			foreignKeyWrapped = `"${foreignKey}"`;
			relatedEntityWrapped = `"${relatedEntity}"`;
			relatedPrimaryKeyWrapped = `"${relatedPrimaryKey}"`;
		} else {
			tableWrapped = `\`${tableName}\``;
			foreignKeyWrapped = `\`${foreignKey}\``;
			relatedEntityWrapped = `\`${relatedEntity}\``;
			relatedPrimaryKeyWrapped = `\`${relatedPrimaryKey}\``;
		}

		const createJoinTableQuery = `
		  CREATE TABLE IF NOT EXISTS ${joinTableWrapped} (
			${tableIdWrapped},
			${relatedEntityIdWrapped},
			PRIMARY KEY (${primaryKeyWrapped}),
			FOREIGN KEY (${tableForeignKeyWrapped})
			REFERENCES ${tableWrapped} (${foreignKeyWrapped}),
			FOREIGN KEY (${relatedEntityForeignKeyWrapped})
			REFERENCES ${relatedEntityWrapped} (${relatedPrimaryKeyWrapped})
		  );
		`;

		queries.push(createJoinTableQuery);
	}

	return queries.join(" ");
};

const createSchema = async (dbClient, schemas, dbType) => {
	for (const schema of schemas) {
		const tableName = schema.Table.tableName;

		let tableExistsQuery;
		if (dbType === "postgres") {
			tableExistsQuery = `
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
		} else {
			tableExistsQuery = `
        SELECT COUNT(*) AS count 
        FROM information_schema.tables 
        WHERE table_name = ?;
      `;
		}

		const result = await dbClient.query(tableExistsQuery, [tableName]);

		let tableExists = false;
		if (dbType === "postgres") {
			if (result && result.rows && result.rows[0] && result.rows[0].exists) {
				tableExists = result.rows[0].exists;
			}
		} else {
			if (result && result[0] && result[0].count > 0) {
				tableExists = true;
			}
		}

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
