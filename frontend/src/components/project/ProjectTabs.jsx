import { useState } from "react";

export default function ProjectTabs() {

  const [active, setActive] = useState("Overview");

  const tabs = [
    "Overview",
    "Events",
    "Payments",
    "Team",
    "Editing",
    "Deliveries",
    "Notes",
  ];

  return (

    <div className="flex gap-3 overflow-x-auto">

      {tabs.map((tab) => (

        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={`px-5 py-3 rounded-xl transition ${
            active === tab
              ? "bg-blue-600"
              : "bg-slate-900 border border-slate-800 hover:border-blue-500"
          }`}
        >

          {tab}

        </button>

      ))}

    </div>

  );

}