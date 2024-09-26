import { DatabaseClient } from "./databaseClient";

type DBType = "postgres" | "mysql";

export declare function createIndex(
	tableName: string,
	dbClient: DatabaseClient,
	dbType: DBType,
	...columns: string[]
): Promise<void>;

export declare function createUniqueIndex(
	tableName: string,
	dbClient: DatabaseClient,
	dbType: DBType,
	...columns: string[]
): Promise<void>;

export declare function dropIndex(
	tableName: string,
	dbClient: DatabaseClient,
	dbType: DBType,
	indexName: string,
): Promise<void>;
