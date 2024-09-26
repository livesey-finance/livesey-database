import { PostgresClient } from "./postgresClient";
import { MySQLClient } from "./mySQLClient";

type DBClient = PostgresClient | MySQLClient;
type DBType = "postgres" | "mysql";

export class Database {
	constructor(tableName: string, dbClient: DBClient, dbType: DBType);
	formatColumnName(column: string): string;
	formatTableName(): string;
	formatPlaceholder(index: number): string;
	select(fields?: string[]): this;
	where(object: Record<string, any>): this;
	insert(): this;
	into(columns: string[]): this;
	values(valuesArray: any[]): this;
	update(): this;
	set(object: Record<string, any>): this;
	delete(): this;
	clearQuery(): void;
	execute(): Promise<any>;
}
