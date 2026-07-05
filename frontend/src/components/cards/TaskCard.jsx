export default function TaskCard({ tasks }) {

    return (

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">

            <h2 className="text-xl font-semibold mb-4">
                Today's Tasks
            </h2>

            {tasks.map((task) => (

                <div
                    key={task}
                    className="flex items-center gap-3 mb-3"
                >

                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>

                    <p>{task}</p>

                </div>

            ))}

        </div>

    );

}