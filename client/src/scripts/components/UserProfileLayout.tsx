import { NavLink, Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CButton } from "@coreui/react";
import { getUser, getUserReviews, getUserTransactions } from "../api/users";
import type { reviewData, transactionData, userData } from "../../util/types";
import { formatAccountAge, formatDateTime, formatRating } from "../../util/format";
import LoadingScreen from "../pages/loading";
import { NotFoundPage } from "../pages/404";
import StarRating from "./StarRating";
import { useAuth } from "../context/AuthContext";
import { loginUrl } from "../../util/constants";

export function UserProfileTabs() {
  const { robloxUserId } = useParams<{ robloxUserId: string }>();

  return (
    <nav className="tab-nav">
      <NavLink
        to={`/users/${robloxUserId}`}
        end
        className={({ isActive }) => (isActive ? "active" : undefined)}
      >
        Overview
      </NavLink>
      <NavLink
        to={`/users/${robloxUserId}/history`}
        className={({ isActive }) => (isActive ? "active" : undefined)}
      >
        History
      </NavLink>
      <NavLink
        to={`/users/${robloxUserId}/reviews`}
        className={({ isActive }) => (isActive ? "active" : undefined)}
      >
        Reviews
      </NavLink>
    </nav>
  );
}

export function UserProfileShell({
  children,
  user,
  averageRating,
  transactionCount,
}: {
  children: React.ReactNode;
  user: userData;
  averageRating: number | null;
  transactionCount: number;
}) {
  const { user: currentUser } = useAuth();
  const initial = user.robloxUsername.charAt(0).toUpperCase();

  return (
    <div className="rtp-page">
      <div className="profile-header rtp-card">
        <div className="profile-avatar">{initial}</div>
        <div className="flex-grow-1">
          <h1 className="h3 mb-1">{user.robloxUsername}</h1>
          <div className="text-muted mb-2">Roblox ID {user.rblxUserID}</div>
          <div className="d-flex flex-wrap gap-3">
            <div>
              <div className="small text-muted">Average rating</div>
              <StarRating rating={averageRating} />{" "}
              <span className="small text-muted">
                ({formatRating(averageRating)})
              </span>
            </div>
            <div>
              <div className="small text-muted">Transactions</div>
              <strong>{transactionCount}</strong>
            </div>
            <div>
              <div className="small text-muted">Last login</div>
              <span>{formatDateTime(user.lastLogin)}</span>
            </div>
          </div>
        </div>
        {currentUser?.rblxUserID === user.rblxUserID ? (
          <CButton color="secondary" size="sm" disabled>
            This is you
          </CButton>
        ) : currentUser ? (
          <CButton
            color="primary"
            size="sm"
            href={`mailto:?subject=Roblox Trust Platform inquiry`}
          >
            Contact
          </CButton>
        ) : (
          <CButton color="primary" size="sm" href={loginUrl}>
            Login to hire
          </CButton>
        )}
      </div>

      <div className="rtp-grid-2 mb-3">
        <div className="rtp-card rtp-stat">
          <div className="rtp-stat-label">Roblox account age</div>
          <div className="rtp-stat-value" style={{ fontSize: "1.1rem" }}>
            {formatAccountAge(user.robloxAccountAge)}
          </div>
        </div>
        <div className="rtp-card rtp-stat">
          <div className="rtp-stat-label">Platform account age</div>
          <div className="rtp-stat-value" style={{ fontSize: "1.1rem" }}>
            {formatAccountAge(user.productAccountAge)}
          </div>
        </div>
      </div>

      <UserProfileTabs />
      {children}
    </div>
  );
}

export function useUserProfileData(robloxUserId: string | undefined) {
  const [user, setUser] = useState<userData | null>(null);
  const [transactions, setTransactions] = useState<transactionData[]>([]);
  const [reviews, setReviews] = useState<reviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!robloxUserId) return;

      setLoading(true);
      const id = Number(robloxUserId);
      const [userResult, txResult, reviewResult] = await Promise.all([
        getUser(id),
        getUserTransactions(id),
        getUserReviews(id),
      ]);

      setUser(userResult);
      setTransactions(txResult?.data ?? []);
      setReviews(reviewResult?.data ?? []);
      setLoading(false);
    }

    void load();
  }, [robloxUserId]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : null;

  return { user, transactions, reviews, averageRating, loading };
}

export function UserProfileLayout() {
  const { robloxUserId } = useParams<{ robloxUserId: string }>();
  const { user, transactions, reviews, averageRating, loading } =
    useUserProfileData(robloxUserId);

  if (loading) {
    return <LoadingScreen details="Loading user profile..." />;
  }

  if (!user) {
    return (
      <NotFoundPage
        details={<>User ID {robloxUserId} is not registered on the platform.</>}
      />
    );
  }

  return (
    <UserProfileShell
      user={user}
      averageRating={averageRating}
      transactionCount={transactions.length}
    >
      <Outlet context={{ user, transactions, reviews, averageRating }} />
    </UserProfileShell>
  );
}
