import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CButton } from "@coreui/react";
import LoginButton from "../components/login";
import { getPlatformStats } from "../api/users";
import type { platformStats } from "../../util/types";
import { useAuth } from "../context/AuthContext";

function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<platformStats | null>(null);

  useEffect(() => {
    void getPlatformStats().then(setStats);
  }, []);

  return (
    <div className="rtp-page">
      <section className="hero">
        <h1>Trust, verified.</h1>
        <p>
          Roblox Trust Platform helps developers and clients track work history,
          verify reputations, and manage transactions with transparency. No more
          relying on scattered Discord spreadsheets.
        </p>
        {user ? (
          <CButton as={Link} to={`/users/${user.rblxUserID}`} color="light" size="lg">
            Go to your profile
          </CButton>
        ) : (
          <LoginButton large />
        )}
      </section>

      <div className="rtp-grid-2 mb-4">
        <div className="rtp-card rtp-stat">
          <div className="rtp-stat-value">{stats?.userCount ?? "—"}</div>
          <div className="rtp-stat-label">Registered users</div>
        </div>
        <div className="rtp-card rtp-stat">
          <div className="rtp-stat-value">{stats?.transactionCount ?? "—"}</div>
          <div className="rtp-stat-label">Tracked transactions</div>
        </div>
      </div>

      <div className="rtp-grid-2">
        <div className="rtp-card">
          <h2 className="h5">Browse developers</h2>
          <p className="text-muted">
            Search the explore directory by username, rating, transaction count,
            or total volume to find trustworthy collaborators.
          </p>
          <CButton as={Link} to="/explore" color="primary" variant="outline">
            Explore users
          </CButton>
        </div>
        <div className="rtp-card">
          <h2 className="h5">Verified Roblox accounts</h2>
          <p className="text-muted">
            Participation requires Roblox OAuth verification. Every profile is
            tied to a real Roblox account with visible account age and work
            history.
          </p>
          {!user && <LoginButton />}
        </div>
        <div className="rtp-card">
          <h2 className="h5">Transaction lifecycle</h2>
          <p className="text-muted">
            Pending → Ongoing → Success, with mutual cancel and dispute reporting.
            Both parties can leave reviews after a successful transaction.
          </p>
        </div>
        <div className="rtp-card">
          <h2 className="h5">Public work history</h2>
          <p className="text-muted">
            Developers choose which transactions to make public. Reported
            transactions are forced visible so the community can stay informed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
