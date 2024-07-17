import { edgeSuccess, edgeFailure } from "../utils/response";

const handler = async (event: any) => {
  try {
    // Your logic here
    return edgeSuccess({ message: "Hello from Lambda@Edge!" });
  } catch (error) {
    return edgeFailure({ message: "An error occurred" });
  }
};

export { handler };
