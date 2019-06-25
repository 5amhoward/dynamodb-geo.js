import { DynamoDB } from 'aws-sdk';
import { DynamoDBManager } from './dynamodb/DynamoDBManager';

export interface BatchWritePointOutput extends DynamoDB.BatchWriteItemOutput {}

export interface DeletePointInput {
  RangeKeyValue: DynamoDB.AttributeValue;
  HashKeyValue: DynamoDB.AttributeValue;
  DeleteItemInput?: DynamoDB.DeleteItemInput;
}
export interface DeletePointOutput extends DynamoDB.DeleteItemOutput {}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}
export interface GeoQueryInput {
  QueryInput?: DynamoDB.QueryInput;
}
export interface GeoQueryOutput extends DynamoDB.QueryOutput {}
export interface GetPointInput {
  HashKeyValue: DynamoDB.AttributeValue;
  RangeKeyValue: DynamoDB.AttributeValue;
  // GeoPoint: GeoPoint;
  GetItemInput: DynamoDB.GetItemInput;
}
export interface GetPointOutput extends DynamoDB.GetItemOutput {}
export interface PutPointInput {
  RangeKeyValue: DynamoDB.AttributeValue;
  HashKeyValue: DynamoDB.AttributeValue;
  GeoPoint: GeoPoint;
  PutItemInput: DynamoDB.PutRequest;
}
export interface PutPointOutput extends DynamoDB.PutItemOutput {}
export interface QueryRadiusInput extends GeoQueryInput {
  RadiusInMeter: number;
  CenterPoint: GeoPoint;
}
export interface QueryRadiusOutput extends GeoQueryOutput {}
export interface QueryRectangleInput extends GeoQueryInput {
  MinPoint: GeoPoint;
  MaxPoint: GeoPoint;
}
export interface QueryRectangleOutput extends GeoQueryOutput {}
export interface UpdatePointInput {
  HashKeyValue: DynamoDB.AttributeValue;
  RangeKeyValue: DynamoDB.AttributeValue;
  UpdateItemInput: DynamoDB.UpdateItemInput;
}
export interface UpdatePointOutput extends DynamoDB.UpdateItemOutput {}
