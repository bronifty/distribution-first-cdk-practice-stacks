import React from "react";
import "./App.css";

const App = () => {
  const [count, setCount] = React.useState(0);
  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
};

export default App;
