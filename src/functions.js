import { Database } from './database.js';

export class DatabaseFunction extends Database {
  constructor(tableName, dbClient) {
    super(tableName, dbClient);
  }

  async findRecord(criteria = {}, selectFields = null) {
    try {
      this.select(selectFields);

      if (Object.keys(criteria).length > 0) {
        this.where(criteria);
      }

      const result = await this.execute();
      return result;
    } catch (err) {
      console.error('Error in find method:', err.message);
      throw err;
    }
  }

  async saveRecord(data) {
    try {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const result = await this
        .insert()
        .into(keys)
        .values(values)
        .execute();
      return result;
    } catch (err) {
      console.error('Error in save method:', err.message);
      throw err;
    }
  }

  async updateRecord(criteria, updateData) {
    try {
      const result = await this
        .update()
        .set(updateData)
        .where(criteria)
        .execute();
      return result;
    } catch (err) {
      console.error('Error in updateRecord method:', err.message);
      throw err;
    }
  }

  async deleteRecord(criteria) {
    try {
      if (Object.keys(criteria).length > 0) {
        const result = await this
          .delete()
          .where(criteria)
          .execute();
        return result;
      } else {
        throw new Error('Delete operation requires criteria.');
      }
    } catch (err) {
      console.error('Error in delete method:', err.message);
      throw err;
    }
  }

}
