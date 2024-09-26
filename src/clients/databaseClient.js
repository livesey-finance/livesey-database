class DatabaseClient {
	async connect() {
		throw new Error("connect() must be implemented");
	}

	async query(queryText, params) {
		throw new Error("query() must be implemented");
	}

	release() {
		throw new Error("release() must be implemented");
	}
}

module.exports = {
	DatabaseClient,
};
