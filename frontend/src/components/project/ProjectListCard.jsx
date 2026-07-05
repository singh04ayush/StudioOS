import { Link } from "react-router-dom";

export default function ProjectListCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer">

        <div className="flex justify-between items-start">

          {/* Left Side */}
          <div>

            <h2 className="text-2xl font-bold text-white">
              {project.projectName}
            </h2>

            <p className="text-gray-400 mt-2">
              👤 {project.clientName}
            </p>

            <p className="text-gray-500 mt-1">
              📞 {project.phone || "N/A"}
            </p>

            <p className="text-gray-500 mt-1">
              📍 {project.location || "N/A"}
            </p>

            <p className="text-gray-500 mt-1">
              📅 {project.startDate} {project.endDate && `- ${project.endDate}`}
            </p>

          </div>

          {/* Right Side */}
          <div className="text-right">

            <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
              {project.status}
            </span>

            <div className="mt-5">

              <p className="text-green-400 font-semibold">
                Total ₹{Number(project.totalAmount || 0).toLocaleString()}
              </p>

              <p className="text-blue-400">
                Advance ₹{Number(project.advance || 0).toLocaleString()}
              </p>

              <p className="text-red-400">
                Pending ₹{Number(project.balance || 0).toLocaleString()}
              </p>

            </div>

          </div>

        </div>

      </div>
    </Link>
  );
}