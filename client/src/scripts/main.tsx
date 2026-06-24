import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/index.css";
// import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserProfilePage from "./pages/User";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <>
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/users/:robloxUserId" element={<UserProfilePage />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  </>,
);
