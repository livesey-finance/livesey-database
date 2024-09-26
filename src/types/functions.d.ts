import { Database } from "./database";
import { PostgresClient } from "./postgresClient";
import { MySQLClient } from "./mySQLClient";

type Criteria = Record<string, any>;
type SelectFields = string[] | null;
type DBClient = PostgresClient | MySQLClient;
type DBType = "postgres" | "mysql" | string;

export declare class DatabaseFunction extends Database {
	constructor(tableName: string, dbClient: DBClient, dbType: DBType);
	findRecord(criteria?: Criteria, selectFields?: SelectFields): Promise<any>;
	saveRecord(data: Record<string, any>): Promise<any>;
	updateRecord(
		criteria: Criteria,
		updateData: Record<string, any>,
	): Promise<any>;
	deleteRecord(criteria: Criteria): Promise<any>;
}
