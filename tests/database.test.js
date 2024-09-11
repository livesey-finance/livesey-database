import { strict as assert } from 'node:assert';
import { PostgresClient } from '../src/clients/postgresClient.js'; // Додайте також MySQLClient для MySQL
import { Database } from '../src/database.js'; // Ваш універсальний клас Database
import { createSchema } from '../src/serializer.js';

// Schema for the Drone table
const droneSchema = {
  'Table': {
    'tableName': 'Drone',
    'columns': {
      'droneId': {
        'type': 'uuid',
        'primaryKey': true,
        'unique': true,
        'notNull': true
      }
    }
  }
};

// Schema for the Asset table
const assetSchema = {
  'Table': {
    'tableName': 'Asset',
    'columns': {
      'assetPriceId': {
        'type': 'uuid',
        'primaryKey': true,
        'unique': true,
        'notNull': true
      },
      'assetType': {
        'type': 'varchar',
        'length': 10,
        'notNull': true,
        'enum': ['Shares', 'Crypto']
      },
      'assetId': {
        'type': 'uuid',
        'notNull': true
      },
      'purchasePrice': {
        'type': 'numeric',
        'notNull': true
      },
      'currentPrice': {
        'type': 'numeric',
        'notNull': true
      },
      'priceDate': {
        'type': 'timestamp with time zone',
        'notNull': true
      },
      'droneId': {
        'type': 'uuid',
        'notNull': true
      }
    },
    'relations': {
      'ManyToOne': {
        'relatedEntity': 'Drone',
        'foreignKey': 'droneId'
      }
    }
  }
};

const runTests = async (dbType = 'postgres') => {
  let dbClient;

  // Підключення відповідного клієнта залежно від типу бази даних
  if (dbType === 'postgres') {
    dbClient = new PostgresClient(); // Може бути також MySQLClient для MySQL
  } else {
    // Підключити MySQL клієнт (наприклад, MySQLClient)
    dbClient = new MySQLClient();
  }

  const db = new Database('Asset', dbClient, dbType); // Використовується ваш універсальний клас Database

  try {
    // Створення таблиць
    await createSchema(dbClient, [droneSchema, assetSchema], dbType);
    console.log('✔️ Drone and Asset tables created successfully.');

    // Вставка в таблицю Drone
    await dbClient.query(
      dbType === 'postgres' ?
        'INSERT INTO "Drone" ("droneId") VALUES ($1) ON CONFLICT DO NOTHING;' :
        'INSERT INTO `Drone` (`droneId`) VALUES (?) ON DUPLICATE KEY UPDATE `droneId` = `droneId`;',
      ['123e4567-e89b-12d3-a456-426614174002']
    );
    console.log('✔️ Insertion into Drone successful.');

    // Вставка в таблицю Asset
    const insertResult = await db.insert()
      .into(['assetPriceId', 'assetType', 'assetId', 'purchasePrice', 'currentPrice', 'priceDate', 'droneId'])
      .values([
        '123e4567-e89b-12d3-a456-426614174000',
        'Shares',
        '123e4567-e89b-12d3-a456-426614174001',
        100.5,
        150.75,
        new Date(),
        '123e4567-e89b-12d3-a456-426614174002'
      ])
      .execute();

    assert.ok(insertResult, 'Failed to insert into Asset table.');
    console.log('✔️ Insertion into Asset successful.');

    // Оновлення запису
    const updateResult = await db.update()
      .set({ currentPrice: 155.75 })
      .where({ assetPriceId: '123e4567-e89b-12d3-a456-426614174000' })
      .execute();
    assert.ok(updateResult, 'Failed to update Asset record.');
    console.log('✔️ Record update successful.');

    // Видалення запису
    const deleteResult = await db.delete()
      .where({ assetPriceId: '123e4567-e89b-12d3-a456-426614174000' })
      .execute();
    assert.ok(deleteResult, 'Failed to delete Asset record.');
    console.log('✔️ Record deletion successful.');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    // Очищення бази даних
    try {
      await dbClient.query(dbType === 'postgres' ? 'DROP TABLE IF EXISTS "Asset" CASCADE;' : 'DROP TABLE IF EXISTS `Asset`;');
      console.log('✔️ Asset table cleaned.');

      await dbClient.query(dbType === 'postgres' ? 'DROP TABLE IF EXISTS "Drone" CASCADE;' : 'DROP TABLE IF EXISTS `Drone`;');
      console.log('✔️ Drone table cleaned.');
    } catch (cleanupError) {
      console.error('❌ Database cleanup error:', cleanupError.message);
    } finally {
      await dbClient.release();
    }
  }
};

// Запуск тестів для PostgreSQL
runTests('postgres');

// Для MySQL можна запустити тест так само:
// runTests('mysql');
