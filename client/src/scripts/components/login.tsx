import { loginUrl } from "../../util/constants";

function LoginButton({ large = false }: { large?: boolean }) {
  return (
    <a
      href={loginUrl}
      className={`btn btn-primary${large ? " btn-lg" : ""}`}
    >
      Login with Roblox
    </a>
  );
}

export default LoginButton;
