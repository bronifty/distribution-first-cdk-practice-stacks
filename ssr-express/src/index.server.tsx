import React from "react";
import ReactDOMServer from "react-dom/server";
import App from "./App";

export function render() {
  console.log("ReactDOMServer.renderToString");
  return ReactDOMServer.renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
