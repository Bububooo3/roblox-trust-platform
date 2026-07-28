import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { GlobalToaster } from "../notifToaster";

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <GlobalToaster />
    </>
  );
}
