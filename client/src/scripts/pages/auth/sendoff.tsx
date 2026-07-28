import { Navigate } from "react-router-dom";
import { loginUrl } from "../../../util/constants";

function AuthSendoffPage() {
  window.location.href = loginUrl;
  return <Navigate to="/" replace />;
}

export default AuthSendoffPage;
