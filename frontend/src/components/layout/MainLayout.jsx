import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-slate-950">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Header />

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
}