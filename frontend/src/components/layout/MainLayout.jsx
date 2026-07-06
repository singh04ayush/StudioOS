import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-body">
        <Header />
        <main className="main-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
}