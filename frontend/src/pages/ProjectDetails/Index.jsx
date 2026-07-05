import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Wallet,
  CalendarDays,
  Users,
  Film,
  Package,
  FileText,
  MessageSquare,
} from "lucide-react";
import ProjectService from "../../services/projectService";
import PaymentService from "../../services/paymentService";
import EventService from "../../services/eventService";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "events", label: "Events" },
  { key: "payments", label: "Payments" },
  { key: "team", label: "Team" },
  { key: "editing", label: "Editing" },
  { key: "deliveries", label: "Deliveries" },
  { key: "files", label: "Files" },
  { key: "notes", label: "Notes" },
];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const response = await ProjectService.getProjectById(id);
      const projectData = response.data || {};
      setProject(projectData);
      setPayments(projectData.payments || []);
      setEvents(projectData.events || []);
      setNotes(projectData.notes || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const totalAmount = Number(project?.totalAmount || 0);
    const advance = Number(project?.advance || 0);
    const balance = Math.max(totalAmount - advance, 0);
    const received = advance;

    return {
      totalAmount,
      advance,
      received,
      balance,
      paymentCount: payments.length,
      eventCount: events.length,
      noteCount: notes.length,
    };
  }, [project, payments, events, notes]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-400">Loading project workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">Error: {error || "Project not found"}</p>
        <button
          onClick={() => navigate("/projects")}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-600/20 text-green-400";
      case "Ongoing":
      case "In Progress":
        return "bg-blue-600/20 text-blue-400";
      case "Upcoming":
      case "Scheduled":
        return "bg-yellow-600/20 text-yellow-400";
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };

  const getEventStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-600/20 text-green-400";
      case "Scheduled":
      case "Upcoming":
        return "bg-blue-600/20 text-blue-400";
      case "In Progress":
        return "bg-yellow-600/20 text-yellow-400";
      default:
        return "bg-red-600/20 text-red-400";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="rounded-full border border-slate-700 p-2 text-gray-400 transition hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{project.projectName}</h1>
            <p className="mt-2 text-gray-400">Client: {project.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-gray-300">
            {project.eventType || "General"}
          </span>
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-gray-400">Total Amount</p>
          <p className="mt-2 text-2xl font-semibold text-green-400">₹{summary.totalAmount.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-gray-400">Received</p>
          <p className="mt-2 text-2xl font-semibold text-blue-400">₹{summary.received.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-gray-400">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-red-400">₹{summary.balance.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-gray-400">Workspace</p>
          <p className="mt-2 text-2xl font-semibold">{summary.eventCount + summary.paymentCount + summary.noteCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900">
        <div className="flex flex-wrap gap-2 border-b border-slate-800 p-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-slate-800 hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8 p-8">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                <div className="mb-6 flex items-center gap-3">
                  <Phone size={18} className="text-blue-400" />
                  <h2 className="text-xl font-semibold">Client Information</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="mt-2 font-medium text-white">{project.phone || "-"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="mt-2 font-medium text-white">{project.email || "-"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:col-span-2">
                    <p className="text-sm text-gray-400">Address</p>
                    <p className="mt-2 font-medium text-white">{project.address || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                <div className="mb-6 flex items-center gap-3">
                  <CalendarDays size={18} className="text-blue-400" />
                  <h2 className="text-xl font-semibold">Project Timeline</h2>
                </div>
                <div className="space-y-4 text-sm text-gray-300">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="text-gray-400">Start Date</p>
                    <p className="mt-1 font-medium text-white">{project.startDate || "-"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="text-gray-400">End Date</p>
                    <p className="mt-1 font-medium text-white">{project.endDate || "Pending"}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="text-gray-400">Location</p>
                    <p className="mt-1 font-medium text-white">{project.location || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                <div className="mb-6 flex items-center gap-3">
                  <Wallet size={18} className="text-green-400" />
                  <h2 className="text-xl font-semibold">Financial Summary</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="font-semibold text-white">₹{summary.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <span className="text-gray-400">Advance</span>
                    <span className="font-semibold text-blue-400">₹{summary.advance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                    <span className="text-gray-400">Pending</span>
                    <span className="font-semibold text-red-400">₹{summary.balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                <div className="mb-6 flex items-center gap-3">
                  <FileText size={18} className="text-purple-400" />
                  <h2 className="text-xl font-semibold">Quick Actions</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-gray-300">Record Payment</div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-gray-300">Add Event</div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-gray-300">Assign Team</div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-gray-300">Upload File</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Project Events</h2>
              <span className="text-sm text-gray-400">{events.length} event(s)</span>
            </div>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">{event.eventName}</p>
                        <p className="mt-1 text-sm text-gray-400">{event.eventType || "General"}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm ${getEventStatusColor(event.status)}`}>
                        {event.status || "Scheduled"}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {event.eventDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {event.venue || event.location || "-"}
                      </div>
                      <div>Assigned: {event.assignedTeam || event.assignedTo || "Unassigned"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-gray-400">
                No events scheduled for this project yet.
              </div>
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <span className="text-sm text-gray-400">{payments.length} payment(s)</span>
            </div>
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-white">₹{Number(payment.amount).toLocaleString()}</p>
                        <p className="mt-1 text-sm text-gray-400">{payment.paymentDate}</p>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>{payment.paymentMode || "Cash"}</p>
                        {payment.referenceNumber ? <p className="mt-1">Ref: {payment.referenceNumber}</p> : null}
                      </div>
                    </div>
                    {payment.remarks ? <p className="mt-4 text-sm text-gray-300">{payment.remarks}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-gray-400">
                No payments recorded for this project.
              </div>
            )}
          </div>
        )}

        {activeTab === "team" && (
          <div className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <Users size={18} className="text-blue-400" />
              <h2 className="text-xl font-semibold">Assigned Team</h2>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-gray-400">
              Team assignment workflow is ready for the next phase of StudioOS expansion.
            </div>
          </div>
        )}

        {activeTab === "editing" && (
          <div className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <Film size={18} className="text-purple-400" />
              <h2 className="text-xl font-semibold">Editing Pipeline</h2>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-gray-400">
              Editing tasks and delivery tracking can be linked to this workspace as the module grows.
            </div>
          </div>
        )}

        {activeTab === "deliveries" && (
          <div className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <Package size={18} className="text-green-400" />
              <h2 className="text-xl font-semibold">Deliveries</h2>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-gray-400">
              Delivery milestones and client approvals will be managed here.
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <FileText size={18} className="text-yellow-400" />
              <h2 className="text-xl font-semibold">Files & Assets</h2>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-gray-400">
              File metadata and future cloud-storage integration can be added here.
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <MessageSquare size={18} className="text-cyan-400" />
              <h2 className="text-xl font-semibold">Notes & Timeline</h2>
            </div>
            {notes.length > 0 ? (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 text-sm text-gray-300">
                    <p>{note.noteText || note.description || "Project note"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-8 text-center text-gray-400">
                No notes or timeline entries available yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
