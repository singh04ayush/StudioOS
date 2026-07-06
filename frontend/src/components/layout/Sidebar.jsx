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
  { title: "Dashboard", path: "/",          icon: LayoutDashboard },
  { title: "Projects",  path: "/projects",  icon: FolderOpen },
  { title: "Clients",   path: "/clients",   icon: Users },
  { title: "Payments",  path: "/payments",  icon: Wallet },
  { title: "Editing",   path: "/editing",   icon: Film },
  { title: "Calendar",  path: "/calendar",  icon: Calendar },
  { title: "Reports",   path: "/reports",   icon: BarChart3 },
  { title: "Settings",  path: "/settings",  icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <span style={{ fontSize: 20 }}>📸</span>
        <span>StudioOS</span>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.title}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-item${isActive ? " active" : ""}`
              }
            >
              <Icon size={16} />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

    </aside>
  );
}