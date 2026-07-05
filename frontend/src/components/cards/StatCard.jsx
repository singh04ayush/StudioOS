export default function StatCard({
  title,
  value,
  icon,
  color = "bg-blue-600",
}) {
  const IconComponent = typeof icon === "function" ? icon : null;

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>

          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div className={`${color} h-14 w-14 rounded-xl flex items-center justify-center text-2xl`}>
          {IconComponent ? <IconComponent size={26} /> : (typeof icon === "string" ? icon : "•")}
        </div>
      </div>
    </div>
  );
}