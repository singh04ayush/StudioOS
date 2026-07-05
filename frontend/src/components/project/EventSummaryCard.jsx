export default function EventSummaryCard() {

  const events = [

    "Haldi",

    "Mehendi",

    "Wedding",

    "Reception",

  ];

  return (

    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">

      <h2 className="text-2xl font-bold mb-5">
        📅 Events
      </h2>

      <div className="space-y-3">

        {events.map((event) => (

          <div
            key={event}
            className="bg-slate-800 rounded-lg p-3"
          >

            {event}

          </div>

        ))}

      </div>

    </div>

  );

}