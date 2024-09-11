<a name="readme-top"></a>

# livesey-database

## Overview

This package provides an abstract database client and a generic database interface for interacting with different SQL databases (MySQL and PostgreSQL). It allows for building and executing SQL queries in a fluent, chainable manner, abstracting the complexities of direct SQL syntax.

### Features

- Fluent API for building SQL queries.
- Database-agnostic: Supports multiple databases (MySQL and PostgreSQL).
- Chainable methods: Build complex queries by chaining method calls.
- Error handling: Provides meaningful error messages for database operations.

## Table of Contents

- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)
    - [Initialize the Database Client](#1-initialize-the-database-client)
    - [Schema Creation and Serialization](#2-schema-creation-and-serialization)
    - [Create a Database Instance](#3-create-a-database-instance)
    - [Perform Database Operations](#4-perform-database-operations)
    - [Close the Database Connection](#5-close-the-database-connection)
- [API Reference](#api-reference)
  - [DatabaseClient](#databaseclient)
  - [MySQLClient](#mysqlclient)
  - [PostgresClient](#postgresclient)
  - [Database](#database)
  - [Indexes](#indexes)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Contact](#contact)

---

## Getting Started

### Installation

To install the package, use npm:


```bash
npm install livesey-database
```

## Configuration

Before using the package, configure your environment variables in a `.env` file or directly in your environment:

```env
DB_TYPE=mysql # or postgres
DB_HOST=#your host
DB_USER=#your username
DB_PASSWORD=#your password
DB_NAME= #your database name
DB_PORT=3306 # or 5432 for PostgreSQL
DB_SSL=true # or false for non-SSL connections
```

---

## Usage

### 1. Initialize the Database Client

You need to initialize the database client based on the environment configuration (MySQL or PostgreSQL).

```javascript
import { MySQLClient, PostgresClient, Database } from 'livesey-database';

// Determine the database client type based on the environment configuration
const dbClient = process.env.DB_TYPE === 'mysql' ? new MySQLClient() : new PostgresClient();
```

### 2. Schema Creation and Serialization

#### Define and Create Schemas

You can create your own table using JSON syntax that follows structures like these:

```js
import { createSchema } from 'livesey-database';

export const PermissionSchema = {
  'Table': {
    'tableName': 'Permission',
    'columns': {
      'permissionId': {
        'type': 'uuid',
        'primaryKey': true,
        'unique': true,
        'notNull': true
      },
      'permissionName': {
        'type': 'varchar',
        'length': 255,
        'notNull': true
      },
      'description': {
        'type': 'text'
      }
    }
  }
};

await createSchema(dbClient, PermissionSchema);
console.log('Permission table created successfully.');
```

#### Foreign Keys and Relationships

If you want to create relationship (`OneToOne`, `ManyToOne`, `OneToMany`, `ManyToMany`) you should define it in `relations` sector.

```js
export const RoleSchema = {
  'Table': {
    'tableName': 'Role',
    'columns': {
      'roleId': {
        'type': 'uuid',
        'primaryKey': true,
        'unique': true,
        'notNull': true
      },
      'roleName': {
        'type': 'varchar',
        'length': 255,
        'notNull': true
      }
    },
    'relations': {
      'ManyToMany': {
        'relatedEntity': 'Permission',
        'foreignKey': 'roleId'
      }
    }
  }
};

await createSchema(dbClient, RoleSchema);
console.log('Role table with ManyToMany relation was created successfully.');
```


### 3. Create a Database Instance

Once you have a dbClient, you can create a Database instance for the desired table.

```javascript
const db = new Database('User', dbClient);
```

### 4. Perform Database Operations

#### Select Queries

To select all columns from a table:

```javascript
const users = await db.select().execute();
console.log('All Users:', users);
```

To select specific columns with conditions:

```javascript
const users = await db.select({ name: true, surname: true })
  .where({ name: 'John', surname: 'Doe' })
  .execute();
console.log('Selected Users:', users);
```

#### Insert Queries

To insert data into a table:

```javascript
await db.insert()
  .into(['name', 'price', 'quantity'])
  .values(['Product A', 10.99, 5])
  .execute();
console.log('Product inserted successfully');
```

#### Update Queries

To update data in a table:

```javascript
await db.update()
  .set({ name: 'Timber', surname: 'Saw' })
  .where({ userId: 'c5fe6661-93ea-43f9-8b6a-92f31f00aa16' })
  .execute();
console.log('User updated successfully');
```

#### Delete Queries

To delete data from a table:

```javascript
await db.delete()
  .where({ userId: 'c5fe6661-93ea-43f9-8b6a-92f31f00aa16' })
  .execute();
console.log('User deleted successfully');
```

### 5. Close the Database Connection

Don't forget to release the database client connection when you are done:

```javascript
    try {
      //some logic here 
    } catch (error) {
      console.error('❌ Database error:', error.message);
    } finally {
      await dbClient.release(); // break connection with db
    }
```

---


## API Reference

### `DatabaseClient`

An abstract class for creating a database client.

#### Constructor

-  `new DatabaseClient()`

#### Methods

-  `async connect()` : Establish a connection to the database. Must be implemented in derived classes.
-  `async query(queryText, params)` : Execute a SQL query with optional parameters. Must be implemented in derived classes.
-  `release()` : Close the database connection. Must be implemented in derived classes.

### `MySQLClient`

Implements the `DatabaseClient` interface for MySQL databases.

#### Constructor

-  `new MySQLClient()`

#### Methods

-  `async connect()` : Returns a MySQL connection from the pool.
-  `async query(queryText, params)` : Executes a SQL query using MySQL connection.
-  `release()` : Ends all connections in the MySQL pool.

### `PostgresClient`

Implements the `DatabaseClient` interface for PostgreSQL databases.

#### Constructor

-  `new PostgresClient()`

#### Methods

-  `async connect()` : Returns a PostgreSQL connection from the pool.
-  `async query(queryText, params)` : Executes a SQL query using PostgreSQL connection.
-  `release()` : Ends all connections in the PostgreSQL pool.

### `Database`

A class to build and execute SQL queries for a specific table.

#### Constructor

-  `new Database(tableName: string, dbClient: string)` : Initializes a new instance of the `Database` class for a given table and database client.

#### Methods

-  `select(fields: Array)` : Builds a SELECT SQL query. `fields` is an array where keys are column names.
-  `where(conditions: Object)` : Adds a WHERE clause to the SQL query. `conditions` is an object with column names and their corresponding values or operators.
-  `insert()` : Begins an INSERT SQL query.
-  `into(columns: Array)` : Specifies the columns for the INSERT SQL query.
-  `values(valuesArray: Array)` : Adds values for the INSERT SQL query.
-  `update()` : Begins an UPDATE SQL query.
-  `set(object: Object)` : Sets the columns and values to be updated.
-  `delete()` : Begins a DELETE SQL query.
-  `async execute()` : Executes the built SQL query.

### `DatabaseFunction`

Extends `Database` to provide higher-level operations such as finding, saving, updating, and deleting records.

#### Constructor

-  `new DatabaseFunction(tableName: string, dbClient: string)`

#### Methods

-  `async findRecord(criteria: Object, selectFields: Array)` : Finds a record matching the criteria.
-  `async saveRecord(data: Object)` : Inserts a new record into the table.
-  `async updateRecord(criteria: Object, updateData: Object)` : Updates a record matching the criteria.
-  `async deleteRecord(criteria: Object)` : Deletes a record matching the criteria.

### `createSchema`

Creates a table from schema(json object).

#### Methods

-  `createSchema(dbClient: string, schema: Object)` : Function to create tables and manage relationships.

---

## Examples

Refer to the Usage and Schema Creation sections above for detailed examples of how to use the package for different types of SQL operations and schema definitions.

---

## Contributing

Contributions are welcome! Please submit a pull request or open an issue on the GitHub repository.

---

## Indexes

Indexes are a crucial part of database optimization, improving the performance of queries by allowing faster data retrieval. The `livesey-database` package provides utility functions to create, manage, and delete indexes in both MySQL and PostgreSQL databases. 

### Types of Indexes
- **Standard Index**: Speeds up data retrieval based on the values in one or more columns.
- **Unique Index**: Ensures that the values in the indexed column(s) are unique across all rows.

### Functions for Managing Indexes

The package provides three key functions for working with indexes:

1. `createIndex`
2. `createUniqueIndex`
3. `dropIndex`

These functions allow you to easily create and manage indexes on tables, supporting both MySQL and PostgreSQL syntax.

---

### `createIndex`

Creates a standard index on one or more columns of a specified table.

#### Parameters:
- `tableName` (string): Name of the table on which the index will be created.
- `dbClient` (DatabaseClient): The database client to use for the operation.
- `dbType` (string): The type of database (`mysql` or `postgres`).
- `columns` (string[]): The columns to be indexed.

#### Example:

```javascript
await createIndex('User', dbClient, 'postgres', 'name', 'email');
```

In this example, an index will be created on the `name` and `email` columns of the `User` table in a PostgreSQL database.

---

### `createUniqueIndex`

Creates a unique index on one or more columns, ensuring that values in the indexed columns are unique.

#### Parameters:
- `tableName` (string): Name of the table on which the unique index will be created.
- `dbClient` (DatabaseClient): The database client to use for the operation.
- `dbType` (string): The type of database (`mysql` or `postgres`).
- `columns` (string[]): The columns to be indexed.

#### Example:

```javascript
await createUniqueIndex('User', dbClient, 'mysql', 'email');
```

This creates a unique index on the `email` column of the `User` table in a MySQL database.

---

### `dropIndex`

Drops an existing index from a table.

#### Parameters:
- `tableName` (string): The name of the table from which the index will be dropped.
- `dbClient` (DatabaseClient): The database client to use for the operation.
- `dbType` (string): The type of database (`mysql` or `postgres`).
- `indexName` (string): The name of the index to be dropped.

#### Example:

```javascript
await dropIndex('User', dbClient, 'postgres', 'User_email_idx');
```

This command will drop the index named `User_email_idx` from the `User` table in a PostgreSQL database.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

## Support

If you have any questions or need further assistance, please open an issue on our GitHub repository or contact the maintainer.

---

## Contact

For any questions or inquiries, please contact huziukwork@gmail.com.

---

By following the above documentation, you should be able to easily configure and use the database package in your application.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
