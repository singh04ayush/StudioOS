import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">

      <div className="relative">

        <Search
          size={18}
          className="absolute left-3 top-3 text-gray-400"
        />

        <input
          placeholder="Search..."
          className="bg-slate-800 rounded-lg pl-10 pr-4 py-2 w-80 outline-none"
        />

      </div>

      <div className="flex items-center gap-6">

        <Bell />

        <div className="bg-blue-600 h-10 w-10 rounded-full flex items-center justify-center font-bold">
          B
        </div>

      </div>

    </header>
  );
}