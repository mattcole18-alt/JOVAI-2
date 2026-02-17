import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Jovair from "../jovair-demo";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Jovair />
  </StrictMode>
);
