import { DynamoDBManager } from '../../src/dynamodb/DynamoDBManager';
import { expect } from 'chai';
import { GeoDataManagerConfiguration } from '../../src';

describe('DynamoDBManager.deletePoint', () => {
  it('calls deleteItem with the correct arguments ', () => {
    let called = false;
    const config = new GeoDataManagerConfiguration(
      {
        deleteItem: (args: any) => {
          called = true;
          expect(args).to.deep.equal({
            TableName: 'MyTable',
            Key: {
              hashKey: { S: '44' },
              rangeKey: { S: '1234' }
            }
          });
        }
      },
      'MyTable'
    );

    const ddb = new DynamoDBManager(config);

    ddb.deletePoint({
      RangeKeyValue: { S: '1234' },
      HashKeyValue: { S: '44' }
    });

    expect(called).to.be.true;
  });
});

describe('DynamoDBManager.putPoint', () => {
  it('calls putItem with the correct arguments ', () => {
    let called = false;
    const config = new GeoDataManagerConfiguration(
      {
        putItem: (args: any) => {
          called = true;
          expect(args).to.deep.equal({
            TableName: 'MyTable',
            Item: {
              geoJson: { S: '{"type":"Point","coordinates":[-0.13,51.51]}' },
              geohash: { N: '5221366118452580119' },
              geohashKey: { N: '52' },
              rangeKey: { S: 'touareg' },
              hashKey: { S: 'sam' },
              country: { S: 'UK' },
              capital: { S: 'London' }
            },
            ConditionExpression: 'attribute_not_exists(capital)'
          });
        }
      },
      'MyTable'
    );

    const ddb: any = new DynamoDBManager(config);

    ddb.putPoint({
      RangeKeyValue: { S: 'touareg' }, // Use this to ensure uniqueness of the hash/range pairs.
      GeoPoint: {
        // An object specifying latitutde and longitude as plain numbers. Used to build the geohash, the hashkey and geojson data
        latitude: 51.51,
        longitude: -0.13
      },
      HashKeyValue: { S: 'sam' },
      PutItemInput: {
        // Passed through to the underlying DynamoDB.putItem request. TableName is filled in for you.
        Item: {
          // The primary key, geohash and geojson data is filled in for you
          country: { S: 'UK' }, // Specify attribute values using { type: value } objects, like the DynamoDB API.
          capital: { S: 'London' }
        },
        ConditionExpression: 'attribute_not_exists(capital)'
      }
    });

    expect(called).to.be.true;
  });
});
