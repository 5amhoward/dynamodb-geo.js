import * as ddbGeo from '../../src';
import * as AWS from 'aws-sdk';
import { expect } from 'chai';
import { IoT1ClickDevicesService } from 'aws-sdk';

AWS.config.update({
  accessKeyId: 'dummy',
  secretAccessKey: 'dummy',
  region: 'eu-west-1'
});

describe('Example', function() {
  // Use a local DB for the example.
  const ddb = new AWS.DynamoDB({ endpoint: 'http://127.0.0.1:8000' });

  // Configuration for a new instance of a GeoDataManager. Each GeoDataManager instance represents a table
  const config = new ddbGeo.GeoDataManagerConfiguration(ddb, 'test-capitals');

  // Instantiate the table manager
  const capitalsManager = new ddbGeo.GeoDataManager(config);

  before(async function() {
    this.timeout(20000);
    config.hashKeyLength = 3;
    config.consistentRead = false;

    // Use GeoTableUtil to help construct a CreateTableInput.
    const createTableInput = ddbGeo.GeoTableUtil.getCreateTableRequest(config);
    createTableInput.ProvisionedThroughput.ReadCapacityUnits = 2;
    await ddb.createTable(createTableInput).promise();
    // Wait for it to become ready
    await ddb.waitFor('tableExists', { TableName: config.tableName }).promise();
    // Load sample data in batches

    console.log('Loading sample data from capitals.json');
    const data = require('../../example/capitals.json');
    const putPointInputs = data.map(function(capital, i) {
      return {
        RangeKeyValue: { S: capital.capital }, // Use this to ensure uniqueness of the hash/range pairs.
        HashKeyValue: { S: capital.country },
        GeoPoint: {
          latitude: capital.latitude,
          longitude: capital.longitude
        },
        TimeWindow: {
          start: new Date(capital.from),
          end: new Date(capital.to)
        },

        PutItemInput: {
          Item: {
            country: { S: capital.country },
            capital: { S: capital.capital }
          }
        }
      };
    });

    const BATCH_SIZE = 25;
    const WAIT_BETWEEN_BATCHES_MS = 1000;
    let currentBatch = 1;

    async function resumeWriting() {
      if (putPointInputs.length === 0) {
        console.log('Finished loading');
        return;
      }
      const thisBatch = [];
      for (
        var i = 0, itemToAdd = null;
        i < BATCH_SIZE && (itemToAdd = putPointInputs.shift());
        i++
      ) {
        thisBatch.push(itemToAdd);
      }
      console.log(
        'Writing batch ' +
          currentBatch++ +
          '/' +
          Math.ceil(data.length / BATCH_SIZE)
      );
      await capitalsManager.batchWritePoints(thisBatch).promise();
      // Sleep
      await new Promise(resolve =>
        setInterval(resolve, WAIT_BETWEEN_BATCHES_MS)
      );
      return resumeWriting();
    }
    return resumeWriting();
  });

  it('queryRadius', async function() {
    this.timeout(20000);
    // Perform a radius query
    const result = await capitalsManager.queryRadius({
      RadiusInMeter: 100000,
      TimeWindow: {
        start: new Date('2019-06-28T11:00:36.969Z'),
        end: new Date('2019-06-31T11:00:36.969Z')
      },
      CenterPoint: {
        latitude: 52.22573,
        longitude: 0.149593
      }
    });
    // expect no result as outside time window
    expect(result).to.deep.equal([]);
  });

  it('queryRadius', async function() {
    this.timeout(20000);
    // Perform a radius query
    const result = await capitalsManager.queryRadius({
      RadiusInMeter: 100000,
      TimeWindow: {
        start: new Date('2019-06-27T11:00:36.969Z'),
        end: new Date('2019-06-28T11:00:36.969Z')
      },
      CenterPoint: {
        latitude: 52.22573,
        longitude: 0.149593
      }
    });
    // expect no result as outside time window
    expect(result).to.deep.equal([]);
  });

  it('getPoint', async () => {
    this.timeout(20000);
    const { Item } = await capitalsManager
      .getPoint({
        RangeKeyValue: { S: 'London' },
        HashKeyValue: { S: 'United Kingdom' },
        GetItemInput: {
          TableName: config.tableName,
          Key: {}
        }
      })
      .promise();
    expect(Item).to.deep.equal({
      rangeKey: { S: 'London' },
      country: { S: 'United Kingdom' },
      capital: { S: 'London' },
      hashKey: { S: 'United Kingdom' },
      geohashKey: { S: '201926522' },
      geoJson: { S: '{"type":"Point","coordinates":[-0.13,51.51]}' },
      geohash: { N: '5221366118452580119' },
      from: { S: '2019-06-27T11:00:36.969Z' },
      to: { S: '2019-06-28T11:00:36.969Z' }
    });
  });
  after(async function() {
    this.timeout(10000);
    await ddb.deleteTable({ TableName: config.tableName }).promise();
  });
});
