import { strict as assert } from 'node:assert';
import { PostgresClient } from '../src/clients/postgresClient.js';
import { DatabaseFunction } from '../src/functions.js';
import { createSchema } from '../src/serializer.js';
import { createIndex, createUniqueIndex, dropIndex } from '../src/indexes.js';

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

  if (dbType === 'postgres') {
    dbClient = new PostgresClient();
  } else {
    dbClient = new MySQLClient();
  }

  const assetDbFunction = new DatabaseFunction('Asset', dbClient);
  const droneDbFunction = new DatabaseFunction('Drone', dbClient);

  try {
    await dbClient.beginTransaction();

    await createSchema(dbClient, [droneSchema, assetSchema], dbType);
    console.log('✔️ Drone and Asset tables created successfully.');

    await createIndex('Asset', dbClient, dbType, 'assetId');
    await createUniqueIndex('Asset', dbClient, dbType, 'assetType');
    console.log('✔️ Indexes created successfully.');

    const droneSaveResult = await droneDbFunction.insert()
      .into(['droneId'])
      .values(['123e4567-e89b-12d3-a456-426614174002'])
      .execute();
    assert.ok(droneSaveResult, 'Failed to insert into Drone table.');
    console.log('✔️ Drone record inserted successfully.');

    const assetSaveResult = await assetDbFunction.insert()
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
    assert.ok(assetSaveResult, 'Failed to insert into Asset table.');
    console.log('✔️ Asset record inserted successfully.');

    const foundAsset = await assetDbFunction.select()
      .where({ assetPriceId: '123e4567-e89b-12d3-a456-426614174000' })
      .execute();
    assert.ok(foundAsset.length > 0, 'Failed to find Asset record.');
    console.log('✔️ Asset record found successfully:', foundAsset);

    const updateResult = await assetDbFunction.update()
      .set({ currentPrice: 155.75 })
      .where({ assetPriceId: '123e4567-e89b-12d3-a456-426614174000' })
      .execute();
    assert.ok(updateResult, 'Failed to update Asset record.');
    console.log('✔️ Asset record updated successfully.');

    const updatedAsset = await assetDbFunction.select()
      .where({ assetPriceId: '123e4567-e89b-12d3-a456-426614174000' })
      .execute();
    assert.strictEqual(updatedAsset[0].currentPrice, 155.75, 'Asset currentPrice was not updated correctly.');
    console.log('✔️ Asset currentPrice updated successfully:', updatedAsset);

    const deleteResult = await assetDbFunction.delete()
      .where({ assetPriceId: '123e4567-e89b-12d3-a456-426614174000' })
      .execute();
    assert.ok(deleteResult, 'Failed to delete Asset record.');
    console.log('✔️ Asset record deleted successfully.');

    const deletedAsset = await assetDbFunction.select()
      .where({ assetPriceId: '123e4567-e89b-12d3-a456-426614174000' })
      .execute();
    assert.strictEqual(deletedAsset.length, 0, 'Asset record was not deleted.');
    console.log('✔️ Asset record deletion confirmed.');

    await dropIndex('Asset', dbClient, dbType, 'Asset_assetId_idx');
    await dropIndex('Asset', dbClient, dbType, 'Asset_assetType_uniq');
    console.log('✔️ Indexes dropped successfully.');

    await dbClient.commitTransaction();
    console.log('✔️ Transaction committed successfully.');

  } catch (error) {
    console.error('❌ Test error:', error.message);

    await dbClient.rollbackTransaction();
    console.log('❌ Transaction rolled back due to error.');

  } finally {
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
