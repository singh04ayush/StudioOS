export default function ClientInfoCard({ project }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

      <h2 className="text-2xl font-bold mb-5">
        👤 Client Information
      </h2>

      <div className="space-y-3">

        <p>
          <span className="font-semibold">Name:</span>{" "}
          {project.clientName}
        </p>

        <p>
          <span className="font-semibold">Phone:</span>{" "}
          {project.phone || "-"}
        </p>

        <p>
          <span className="font-semibold">Email:</span>{" "}
          {project.email || "-"}
        </p>

        <p>
          <span className="font-semibold">Location:</span>{" "}
          {project.location || "-"}
        </p>

      </div>

    </div>
  );
}