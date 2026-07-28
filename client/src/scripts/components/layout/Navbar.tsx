import { CContainer, CNavbar, CNavbarBrand, CNavbarNav, CNavItem, CNavLink, CButton } from "@coreui/react";
import { Link, NavLink } from "react-router-dom";
import { loginUrl } from "../../../util/constants";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { user, loading } = useAuth();

  return (
    <CNavbar colorScheme="dark" className="px-3 mb-0" style={{ background: "#1a2332" }}>
      <CContainer fluid className="rtp-page" style={{ maxWidth: 1100, padding: "0.75rem 1.25rem" }}>
        <CNavbarBrand as={Link} to="/" className="fw-bold text-white">
          Roblox Trust Platform
        </CNavbarBrand>
        <CNavbarNav className="ms-auto align-items-center gap-1">
          <CNavItem>
            <CNavLink as={NavLink} to="/explore" className="text-white-50">
              Explore
            </CNavLink>
          </CNavItem>
          {!loading && user ? (
            <CNavItem>
              <CButton
                as={Link}
                to={`/users/${user.rblxUserID}`}
                color="primary"
                size="sm"
                className="ms-2"
              >
                {user.robloxUsername}
              </CButton>
            </CNavItem>
          ) : (
            <CNavItem>
              <CButton
                color="primary"
                size="sm"
                className="ms-2"
                href={loginUrl}
              >
                Login with Roblox
              </CButton>
            </CNavItem>
          )}
        </CNavbarNav>
      </CContainer>
    </CNavbar>
  );
}
