import {
  LayoutDashboard,
  FolderOpen,
  Users,
  Wallet,
  Film,
  Calendar,
  BarChart3,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "Projects", path: "/projects", icon: FolderOpen },
  { title: "Clients", path: "/clients", icon: Users },
  { title: "Payments", path: "/payments", icon: Wallet },
  { title: "Editing", path: "/editing", icon: Film },
  { title: "Calendar", path: "/calendar", icon: Calendar },
  { title: "Reports", path: "/reports", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">

      <div className="p-6 text-2xl font-bold border-b border-slate-800">
        📸 StudioOS
      </div>

      <nav className="p-4 space-y-2">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.title}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800 text-gray-300"
                }`
              }
            >
              <Icon size={20} />
              {item.title}
            </NavLink>
          );
        })}

      </nav>

    </aside>
  );
}