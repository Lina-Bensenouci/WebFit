import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Appli from "./composants/Appli.jsx";
import "./main.scss";

ReactDOM.createRoot(document.getElementById("racine")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Appli />
    </BrowserRouter>
  </React.StrictMode>
);
