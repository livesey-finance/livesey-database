export class Database {
  constructor(tableName, dbClient) {
    this.tableName = tableName;
    this.dbClient = dbClient;
    if (typeof this.tableName !== 'string') {
      throw new Error('Table name must be a string');
    }
    this.query = '';
    this.whereValues = [];
  }

  select(object) {
    const fields = object ?
      Object.keys(object)
        .filter((key) => object[key])
        .map((key) => `"${key}"`)
        .join(', ') :
      '*';
    this.query += `SELECT ${fields} FROM "${this.tableName}"`;
    return this;
  }

  where(object) {
    if (object) {
      const whereConditions = [];
      const whereValues = [];

      Object.keys(object).forEach((key) => {
        const condition = object[key];
        if (typeof condition === 'object' && condition.operator && condition.value !== undefined) {
          whereConditions.push(`"${key}" ${condition.operator} $${this.whereValues.length + whereValues.length + 1}`);
          whereValues.push(condition.value);
        } else {
          whereConditions.push(`"${key}" = $${this.whereValues.length + whereValues.length + 1}`);
          whereValues.push(condition);
        }
      });

      this.query += ` WHERE ${whereConditions.join(' AND ')}`;
      this.whereValues = this.whereValues.concat(whereValues);
    }
    return this;
  }

  insert() {
    this.query += 'INSERT ';
    return this;
  }

  into(columns) {
    const formattedColumns = columns.map((col) => `"${col}"`).join(', ');
    this.query += ` INTO "${this.tableName}" (${formattedColumns})`;
    return this;
  }

  values(valuesArray) {
    const placeholders = valuesArray.map((_, index) => `$${index + 1}`).join(', ');
    this.query += ` VALUES (${placeholders})`;
    this.whereValues = this.whereValues.concat(valuesArray);
    return this;
  }

  update() {
    this.query += `UPDATE "${this.tableName}"`;
    return this;
  }

  set(object) {
    const setClauses = Object.keys(object).map((key, index) => `"${key}" = $${this.whereValues.length + index + 1}`);
    this.query += ` SET ${setClauses.join(', ')}`;
    this.whereValues = this.whereValues.concat(Object.values(object));
    return this;
  }

  delete() {
    this.query += `DELETE FROM "${this.tableName}"`;
    return this;
  }

  async execute() {
    try {
      return await this.dbClient.query(this.query, this.whereValues);
    } catch (error) {
      console.error('Error executing query:', error.message);
      throw new Error(`Database query execution error: ${error.message}`);
    }
  }
}
