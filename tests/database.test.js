import { strict as assert } from 'node:assert';
import { PostgresClient } from '../src/clients/postgresClient.js';
import { DatabaseFunction } from '../src/functions.js';
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

const runTests = async () => {
  const dbClient = new PostgresClient();
  const dbFunction = new DatabaseFunction('Asset', dbClient);

  try {
    // Create Drone and Asset tables
    await createSchema(dbClient, [droneSchema, assetSchema]);
    console.log('✔️ Drone and Asset tables created successfully.');

    // Insert into Drone table
    await dbClient.query(
      'INSERT INTO "Drone" ("droneId") VALUES ($1) ON CONFLICT DO NOTHING;',
      ['123e4567-e89b-12d3-a456-426614174002']
    );
    console.log('✔️ Insertion into Drone successful.');

    // Insert into Asset table
    const insertResult = await dbFunction.saveRecord({
      assetPriceId: '123e4567-e89b-12d3-a456-426614174000',
      assetType: 'Shares',
      assetId: '123e4567-e89b-12d3-a456-426614174001',
      purchasePrice: 100.5,
      currentPrice: 150.75,
      priceDate: new Date(),
      droneId: '123e4567-e89b-12d3-a456-426614174002'
    });

    assert.ok(insertResult, 'Failed to insert into Asset table.');
    console.log('✔️ Insertion into Asset successful.');

    // Update a record
    const updateResult = await dbFunction.updateRecord(
      { assetPriceId: '123e4567-e89b-12d3-a456-426614174000' },
      { currentPrice: 155.75 }
    );
    assert.ok(updateResult, 'Failed to update Asset record.');
    console.log('✔️ Record update successful.');

    // Delete a record
    const deleteResult = await dbFunction.deleteRecord({ assetPriceId: '123e4567-e89b-12d3-a456-426614174000' });
    assert.ok(deleteResult, 'Failed to delete Asset record.');
    console.log('✔️ Record deletion successful.');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    // Cleaning up the database
    try {
      await dbClient.query('DROP TABLE IF EXISTS "Asset" CASCADE;');
      console.log('✔️ Asset table cleaned.');

      await dbClient.query('DROP TABLE IF EXISTS "Drone" CASCADE;');
      console.log('✔️ Drone table cleaned.');
    } catch (cleanupError) {
      console.error('❌ Database cleanup error:', cleanupError.message);
    } finally {
      await dbClient.release();
    }
  }
};

// Run the tests
runTests();
