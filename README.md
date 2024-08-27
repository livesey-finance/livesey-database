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
    - [Create a Database Instance](#2-create-a-database-instance)
    - [Perform Database Operations](#3-perform-database-operations)
    - [Close the Database Connection](#4-close-the-database-connection)
- [API Reference](#api-reference)
  - [DatabaseClient](#databaseclient)
  - [MySQLClient](#mysqlclient)
  - [PostgresClient](#postgresclient)
  - [Database](#database)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)
- [Contact](#contact)

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
DB_PASSWORD=#your  password
DB_NAME= #your database name
DB_PORT=3306 # or 5432 for PostgreSQL
DB_SSL=true # or false for non-SSL connections
```

## Usage

### 1. Initialize the Database Client

You need to initialize the database client based on the environment configuration (MySQL or PostgreSQL).

```javascript
import { MySQLClient } from 'livesey-database';
import { PostgresClient } from 'livesey-database';
import { Database } from 'livesey-database';

// Determine the database client type based on the environment configuration
const dbClient = process.env.DB_TYPE === 'mysql' ? new MySQLClient() : new PostgresClient();
```

### 2. Create a Database Instance

Once you have a `dbClient`, you can create a `Database` instance for the desired table.

```javascript
const db = new Database('User', dbClient);
```

### 3. Perform Database Operations

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

### 4. Close the Database Connection

Don't forget to release the database client connection when you are done:

```javascript
dbClient.release();
```

## API Reference

### `DatabaseClient`

An abstract class for creating a database client.

#### Methods

-  `connect()` : Establish a connection to the database. Must be implemented in derived classes.
-  `query(queryText, params)` : Execute a SQL query with optional parameters. Must be implemented in derived classes.
-  `release()` : Close the database connection. Must be implemented in derived classes.

### `MySQLClient`

Implements the `DatabaseClient` interface for MySQL databases.

#### Methods

-  `connect()` : Returns a MySQL connection from the pool.
-  `query(queryText, params)` : Executes a SQL query using MySQL connection.
-  `release()` : Ends all connections in the MySQL pool.

### `PostgresClient`

Implements the `DatabaseClient` interface for PostgreSQL databases.

#### Methods

-  `connect()` : Returns a PostgreSQL connection from the pool.
-  `query(queryText, params)` : Executes a SQL query using PostgreSQL connection.
-  `release()` : Ends all connections in the PostgreSQL pool.

### `Database`

A class to build and execute SQL queries for a specific table.

#### Constructor

-  `new Database(tableName, dbClient)` : Initializes a new instance of the `Database` class for a given table and database client.

#### Methods

-  `select(fields)` : Builds a SELECT SQL query. `fields` is an object where keys are column names.
-  `where(conditions)` : Adds a WHERE clause to the SQL query. `conditions` is an object with column names and their corresponding values or operators.
-  `insert()` : Begins an INSERT SQL query.
-  `into(columns)` : Specifies the columns for the INSERT SQL query.
-  `values(valuesArray)` : Adds values for the INSERT SQL query.
-  `update()` : Begins an UPDATE SQL query.
-  `set(object)` : Sets the columns and values to be updated.
-  `delete()` : Begins a DELETE SQL query.
-  `execute()` : Executes the built SQL query.

## Examples

Refer to the Usage section above for detailed examples of how to use the package for different types of SQL operations.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue on the GitHub repository.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Support

If you have any questions or need further assistance, please open an issue on our GitHub repository or contact the maintainer.

## Contact

For any questions or inquiries, please contact huziukwork@gmail.com.

---

By following the above documentation, you should be able to easily configure and use the database package in your application.

<p align="right">(<a href="#readme-top">back to top</a>)</p>