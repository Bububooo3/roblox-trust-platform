import { StrictMode } from "react";
import { createRoot } from "react-dom/client"
// import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import UserProfilePage from "./pages/users/users";
import LandingPage from "./pages";

import '@coreui/coreui/dist/css/coreui.min.css'
import "../styles/simple.css"
import { NotFoundPage } from "./pages/404";

createRoot(document.getElementById("root")!).render(
  <>
    <StrictMode>
      <BrowserRouter>
        <Routes>
          {/* ../ */}
          <Route path="/" element={<LandingPage />} />

          {/* ../auth */}
          <Route path="/login" element="" />
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

          {/* NOT FOUND */}
          <Route path="*" element={<NotFoundPage details="Web route does not exist!" />} />
          <Route />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  </>,
);
