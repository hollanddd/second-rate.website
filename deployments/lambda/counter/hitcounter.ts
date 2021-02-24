import { DynamoDBClient, UpdateItemCommand, UpdateItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { LambdaClient, InvokeCommand, InvokeCommandOutput } from '@aws-sdk/client-lambda';

const dbc: DynamoDBClient = new DynamoDBClient({});
const lc: LambdaClient = new LambdaClient({});

// incrementCount adds to the number of hits for the given path
async function incrementCount(path: string): Promise<number> {
  try {
    const update: UpdateItemCommandOutput = await dbc.send(new UpdateItemCommand({
      TableName: process.env.HIT_TABLE,
      Key: { path: { S: path } },
      UpdateExpression: 'ADD hits :incr',
      ExpressionAttributeValues: { ':incr': { N:'1'} },
      ReturnValues: 'ALL_NEW', // returns the current count
    }));

    return parseInt(update.Attributes?.["hits"]?.N || "0")

  } catch (error) {
    console.log('error updating the count')
    console.log(error.message)
    throw error
  }
}

async function invokeDownstream(payload: Uint8Array): Promise<InvokeCommandOutput> {
  return await lc.send(new InvokeCommand({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: payload,
  }));
}

function addCorsHeaders(payload: any): any {
  payload.headers = {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
  }
  return payload
}

function addHitCountToPayloadBody(payload: any, count: number): any {
    let body = JSON.parse(payload.body);
    body.count = count;
    payload.body = JSON.stringify(body);
    return payload;
}

exports.handler = async function(event: any) {
  // Increment the count for the path and return the current hit count for
  // display. There is no additional cost associated with requesting a return value
  try {
    const [ count, resp ] = await Promise.all([
      incrementCount(event.path),
      invokeDownstream(Uint8Array.from(event))
    ]);

    let payload = JSON.parse(resp.Payload?.toString() || '');
    payload = addCorsHeaders(payload);
    payload = addHitCountToPayloadBody(payload, count);
    return payload;
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    }
  }
}
