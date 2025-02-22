import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ChatWindowContextProvider } from "./Context/ChatWindowContext.jsx";

createRoot(document.getElementById("root")).render(
  <ChatWindowContextProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </ChatWindowContextProvider>
);
