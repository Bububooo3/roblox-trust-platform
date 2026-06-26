import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/index.css";
// import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserProfilePage from "./pages/users/users";
import LandingPage from "./pages";

createRoot(document.getElementById("root")!).render(
  <>
    <StrictMode>
      <BrowserRouter>
        <Routes>
          {/* ../ */}
          <Route path="/" element={<LandingPage />} />

          {/* ../auth */}
          <Route path="/auth/roblox/login" element="" />
          <Route path="/auth/roblox/return" element="" />

          {/* ../users */}
          <Route path="/users" element="" />
          <Route path="/users/:robloxUserId" element={<UserProfilePage />} />
          <Route path="/users/:robloxUserId/history" element="" />
          <Route path="/users/:robloxUserId/reviews" element="" />

          {/* ../transactions */}
          <Route path="/transactions" element="" />
          <Route path="/transactions/:transactionId" element="" />

          {/* ../explore */}
          <Route path="/explore" element="" />
          <Route />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  </>,
);
