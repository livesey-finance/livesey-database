class Database {
	constructor(tableName, dbClient, dbType) {
		this.tableName = tableName;
		this.dbClient = dbClient;
		this.dbType = dbType;

		if (typeof this.tableName !== "string") {
			throw new Error("Table name must be a string");
		}

		this.query = "";
		this.whereValues = [];
	}
	
	formatName(name) {
		if (this.dbType === "postgres") {
			return `"${name}"`;
		} else {
			return `\`${name}\``;
		}
	}

	formatPlaceholder(index) {
		if(this.dbType === "postgres"){
			return `$${index + 1}`;
		} else {
			return  "?";
		}
	}

	select(fields) {
		let field = "";
		if (fields) {
			const selectedFields = [];
			for (const key of fields) {
				selectedFields.push(this.formatName(key));
			}
			field = selectedFields.join(", ");
		} else {
			field = "*";
		}
		this.query += `SELECT ${field} FROM ${this.formatName(this.tableName)}`;
		return this;
	}

	where(object) {
		if (object) {
			const whereConditions = [];
			const whereValues = [];

			for (const [key, condition] of Object.entries(object)) {
				const operator = (typeof condition === "object" && condition?.operator) ? condition.operator : "=";
				const value = (typeof condition === "object" && condition?.value != null) ? condition.value : condition;
				whereConditions.push(`${this.formatName(key)} ${operator} ${this.formatPlaceholder(this.whereValues.length + whereValues.length)}`);
				whereValues.push(value);
			}			  

			this.query += ` WHERE ${whereConditions.join(" AND ")}`;
			this.whereValues = this.whereValues.concat(whereValues);
		}
		return this;
	}

	insert() {
		this.query += "INSERT";
		return this;
	}

	into(columns) {
		if (!Array.isArray(columns) || columns.length === 0) {
			throw new Error("Columns should be a non-empty array");
		}
		let formattedColumns = "";
		for (const col of columns) {
			formattedColumns += this.formatName(col) + ", ";
		}

		formattedColumns = formattedColumns.slice(0, -2);

		this.query += ` INTO ${this.formatName(this.tableName)} (${formattedColumns})`;
		return this;
	}

	values(valuesArray) {
		if (!Array.isArray(valuesArray) || valuesArray.length === 0) {
			throw new Error("Values should be a non-empty array");
		}

		const placeholders = [];
		for (let index = 0; index < valuesArray.length; index++) {
			placeholders.push(this.formatPlaceholder(index));
		}

		this.query += ` VALUES (${placeholders.join(", ")})`;
		this.whereValues = this.whereValues.concat(valuesArray);
		return this;
	}

	update() {
		this.query += `UPDATE ${this.formatName(this.tableName)}`;
		return this;
	}

	set(object) {
		const setClauses = [];
		let index = 0;

		for (const key of Object.keys(object)) {
			setClauses.push(`${this.formatName(key)} = ${this.formatPlaceholder(this.whereValues.length + index++)}`);
		}
		this.query += ` SET ${setClauses.join(", ")}`;
		this.whereValues = this.whereValues.concat(Object.values(object));
		return this;
	}

	delete() {
		this.query += `DELETE FROM ${this.formatName(this.tableName)}`;
		return this;
	}

	clearQuery() {
		this.query = "";
		this.whereValues = [];
	}

	async execute() {
		try {
			const result = await this.dbClient.query(this.query, this.whereValues);
			this.clearQuery();
			return result;
		} catch (error) {
			this.clearQuery();
			throw new Error(`Database query execution error: ${error.message}`);
		}
	}
}

module.exports = {
	Database,
};
