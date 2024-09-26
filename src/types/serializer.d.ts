import { DatabaseClient } from './databaseClient';
type DBType = 'postgres' | 'mysql';

interface ColumnDefinition {
  type: string;
  length?: number;
  primaryKey?: boolean;
  unique?: boolean;
  notNull?: boolean;
  enum?: string[];
}

interface Relation {
  foreignKey: string;
  relatedEntity: string;
}

interface Relations {
  ManyToOne?: Relation | Relation[];
  OneToMany?: Relation | Relation[];
  OneToOne?: Relation | Relation[];
  ManyToMany?: {
    foreignKey: string;
    relatedEntity: string;
  };
}

interface TableSchema {
  tableName: string;
  columns: Record<string, ColumnDefinition>;
  relations?: Relations;
}

interface Schema {
  Table: TableSchema;
}

export declare function createTable(schema: Schema, dbType: DBType): string;

export declare function addRelations(schema: Schema, allSchemas: Schema[], dbType: DBType): string;

export declare function createSchema(dbClient: DatabaseClient, schemas: Schema[], dbType: DBType): Promise<void>;
