import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages";
import ExplorePage from "./pages/explore";
import UserOverviewPage from "./pages/users/users";
import UserHistoryPage from "./pages/users/history";
import UserReviewsPage from "./pages/users/reviews";
import TransactionPage from "./pages/transactions/transaction";
import AuthSendoffPage from "./pages/auth/sendoff";
import { UserProfileLayout } from "./components/UserProfileLayout";
import { NotFoundPage } from "./pages/404";

import "@coreui/coreui/dist/css/coreui.min.css";
import "../styles/app.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/explore" element={<ExplorePage />} />

            <Route path="/users" element={<Navigate to="/explore" replace />} />
            <Route path="/users/:robloxUserId" element={<UserProfileLayout />}>
              <Route index element={<UserOverviewPage />} />
              <Route path="history" element={<UserHistoryPage />} />
              <Route path="reviews" element={<UserReviewsPage />} />
            </Route>

            <Route
              path="/transactions"
              element={<Navigate to="/explore" replace />}
            />
            <Route
              path="/transactions/:transactionId"
              element={<TransactionPage />}
            />

            <Route path="/auth/roblox/login" element={<AuthSendoffPage />} />
            <Route path="/login" element={<Navigate to="/auth/roblox/login" replace />} />

            <Route
              path="*"
              element={<NotFoundPage details="This page does not exist." />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
