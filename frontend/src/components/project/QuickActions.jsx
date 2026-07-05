export default function QuickActions() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <h2 className="text-2xl font-bold mb-5">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">

        <button className="bg-blue-600 hover:bg-blue-700 rounded-xl py-3">
          💰 Record Payment
        </button>

        <button className="bg-green-600 hover:bg-green-700 rounded-xl py-3">
          📅 Add Event
        </button>

        <button className="bg-purple-600 hover:bg-purple-700 rounded-xl py-3">
          👥 Assign Team
        </button>

        <button className="bg-orange-600 hover:bg-orange-700 rounded-xl py-3">
          📝 Add Note
        </button>

      </div>

    </div>
  );
}