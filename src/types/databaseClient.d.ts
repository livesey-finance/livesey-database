export declare class DatabaseClient {
    connect(): Promise<any>;
    query(queryText: string, params?: string[]): Promise<any>;
    release(): Promise<void>;
  }
  