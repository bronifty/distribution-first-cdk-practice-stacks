// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { edgeSuccess, edgeFailure } from "../utils";

// const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async () => {
  // const params = {
  //   TableName: process.env.NOTES_TABLE_NAME || "",
  // };

  try {
    // const result = await client.send(new ScanCommand(params));
    // Return the matching list of items in response body
    // return success(result.Items);
    const responseData = {
      message: "hello world",
    };

    return edgeSuccess(responseData);
  } catch (e) {
    console.log(e);
    return edgeFailure({ status: false });
  }
};
