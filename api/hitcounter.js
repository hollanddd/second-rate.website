const { DynamoDB, Lambda } = require('aws-sdk');

exports.handler = async function(event) {
  const d = new DynamoDB();
  const l = new Lambda();

  // Increment the count for the path and return the current hit count for
  // display. There is no additional cost associated with requesting a return value
  const upd = await d.updateItem({
    TableName: process.env.HIT_TABLE,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N:'1'} },
    ReturnValues: 'ALL_NEW', // returns the current count
  }).promise();

  const resp = await l.invoke({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  }).promise()

  // unmarshal json payload and add response headers
  let payload = JSON.parse(resp.Payload);
  payload.headers = {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET",
  }

  // unmarshal the payload body and apply the current count
  let body = JSON.parse(payload.body);
  body.count = parseInt(upd.Attributes.hits.N)

  // marshal the json payload and return
  payload.body = JSON.stringify(body)
  return payload
}
