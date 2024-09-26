const { DatabaseClient } = require("./databaseClient.js");

class MySQLClient extends DatabaseClient {
	constructor(mySqlPool) {
		super();
		this.pool = mySqlPool;
	}

	static newMySQLClient(mySqlPool) {
		return new MySQLClient(mySqlPool);
	}

	async connect() {
		return this.pool.getConnection();
	}

	async query(queryText, params = []) {
		const connection = await this.connect();
		try {
			const [rows] = await connection.query(queryText, params);
			return rows;
		} catch (error) {
			throw new Error("Error during query processing");
		} finally {
			connection.release();
		}
	}

	async release() {
		return this.pool.end();
	}
}

module.exports = {
	MySQLClient,
};
