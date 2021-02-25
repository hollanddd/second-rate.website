interface CountInputEvent {
  path: string
}

exports.handler = async function(event: CountInputEvent) {
  console.log("request:", JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count: 0, path: event.path }),
  };
};

