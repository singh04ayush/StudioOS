export default function NotificationCard({ title, color = "red" }) {
  const colors = {
    red: "border-red-500 bg-red-500/10",
    yellow: "border-yellow-500 bg-yellow-500/10",
    blue: "border-blue-500 bg-blue-500/10",
    green: "border-green-500 bg-green-500/10",
  };

  return (
    <div
      className={`p-4 rounded-xl border ${colors[color]} text-white`}
    >
      {title}
    </div>
  );
}