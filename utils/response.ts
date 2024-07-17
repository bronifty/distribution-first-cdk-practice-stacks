const success = (body: any) => {
  return buildResponse(200, body);
};

const failure = (body: any) => {
  return buildResponse(500, body);
};

const buildResponse = (statusCode: number, body: any) => ({
  statusCode: statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
  body: JSON.stringify(body),
});

// New function for Lambda@Edge responses
const buildEdgeResponse = (statusCode: number, body: any) => ({
  status: statusCode.toString(),
  statusDescription: statusCode === 200 ? "OK" : "Internal Server Error",
  headers: {
    "cache-control": [{ key: "Cache-Control", value: "max-age=0" }],
    "content-type": [{ key: "Content-Type", value: "application/json" }],
    "access-control-allow-origin": [
      { key: "Access-Control-Allow-Origin", value: "*" },
    ],
    "access-control-allow-credentials": [
      { key: "Access-Control-Allow-Credentials", value: "true" },
    ],
  },
  body: JSON.stringify(body),
});

// New success and failure functions for Lambda@Edge
const edgeSuccess = (body: any) => {
  return buildEdgeResponse(200, body);
};

const edgeFailure = (body: any) => {
  return buildEdgeResponse(500, body);
};

export { success, failure, edgeSuccess, edgeFailure };
