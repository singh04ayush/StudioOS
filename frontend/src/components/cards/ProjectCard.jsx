export default function ProjectCard({
  title,
  value,
  icon,
  color = "bg-blue-600",
}) {
  const IconComponent = typeof icon === "function" ? icon : null;

  return (
    <div className="bg-slate-900 rounded-2xl p-5 shadow-lg border border-slate-800">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div className={`${color} p-3 rounded-xl`}>
          {IconComponent ? <IconComponent size={26} /> : (typeof icon === "string" ? icon : "•")}
        </div>
      </div>
    </div>
  );
}