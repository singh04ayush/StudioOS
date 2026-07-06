import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="header">

      <div className="header-search">
        <Search size={15} className="search-icon" />
        <input placeholder="Search projects, clients…" />
      </div>

      <div className="header-actions">
        <button className="header-icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="header-avatar">B</div>
      </div>

    </header>
  );
}