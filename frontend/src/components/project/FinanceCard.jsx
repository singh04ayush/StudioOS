export default function FinanceCard({ project }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

      <h2 className="text-2xl font-bold mb-5">
        💰 Financial Summary
      </h2>

      <div className="space-y-3">

        <p>
          Total :
          <strong className="ml-2">
            ₹{Number(project.totalAmount).toLocaleString()}
          </strong>
        </p>

        <p>
          Advance :
          <strong className="ml-2 text-green-400">
            ₹{Number(project.advance).toLocaleString()}
          </strong>
        </p>

        <p>
          Pending :
          <strong className="ml-2 text-red-400">
            ₹{Number(project.balance).toLocaleString()}
          </strong>
        </p>

      </div>

    </div>
  );
}