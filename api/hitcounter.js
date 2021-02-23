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

  console.log('update response:', JSON.stringify(upd, undefined, 2));
  console.log('downstream response:', JSON.stringify(resp, undefined, 2));

  // merge count from update into downstream response
  let current = parseInt(upd.Attributes.hits.N)
  let payload = JSON.parse(resp.Payload);
  let body = JSON.parse(payload.body);
  body.count = current
  payload.body = JSON.stringify(body)
  return payload
}
