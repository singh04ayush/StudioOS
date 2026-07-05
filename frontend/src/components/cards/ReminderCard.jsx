export default function ReminderCard({ reminders }) {

    return (

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">

            <h2 className="text-xl font-semibold mb-4">

                Notifications

            </h2>

            {reminders.map((item) => (

                <div
                    key={item}
                    className="bg-red-500/10 border border-red-500 rounded-lg p-3 mb-3"
                >

                    {item}

                </div>

            ))}

        </div>

    );

}