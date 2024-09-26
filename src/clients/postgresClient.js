const { DatabaseClient } = require("./databaseClient.js");

class PostgresClient extends DatabaseClient {
	constructor(postgresPool) {
		super();
		this.pool = postgresPool;
	}

	static newPostgresClient(postgresPool) {
		return new PostgresClient(postgresPool);
	}

	async connect() {
		return this.pool.connect();
	}

	async query(queryText, params = []) {
		const client = await this.connect();
		try {
			const result = await client.query(queryText, params);
			return result.rows;
		} catch (error) {
			throw new Error("Error during query processing");
		} finally {
			client.release();
		}
	}

	async release() {
		return this.pool.end();
	}
}

module.exports = {
	PostgresClient,
};
