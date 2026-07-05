import { useState } from "react";
import { createProject } from "../../services/projectService";

export default function CreateProject() {

  const [form, setForm] = useState({
    projectName: "",
    clientName: "",
    phone: "",
    email: "",
    address: "",
    eventType: "",
    location: "",
    startDate: "",
    endDate: "",
    totalAmount: "",
    advance: "",
    balance: "",
    status: "Upcoming",
    notes: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createProject(form);

      alert("✅ Project Created Successfully");

      setForm({
        projectName: "",
        clientName: "",
        phone: "",
        email: "",
        address: "",
        eventType: "",
        location: "",
        startDate: "",
        endDate: "",
        totalAmount: "",
        advance: "",
        balance: "",
        status: "Upcoming",
        notes: "",
      });

    } catch (error) {
      console.error(error);
      alert("❌ Failed to create project");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-4xl font-bold mb-8">
        Create Project
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-5"
      >

        <input
          name="projectName"
          placeholder="Project Name"
          value={form.projectName}
          onChange={handleChange}
          className="bg-slate-900 p-4 rounded-xl"
          required
        />

        <input
          name="clientName"
          placeholder="Client Name"
          value={form.clientName}
          onChange={handleChange}
          className="bg-slate-900 p-4 rounded-xl"
          required
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          className="bg-slate-900 p-4 rounded-xl"
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="bg-slate-900 p-4 rounded-xl"
        />

        <input
          name="eventType"
          placeholder="Event Type"
          value={form.eventType}
          onChange={handleChange}
          className="bg-slate-900 p-4 rounded-xl"
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="bg-slate-900 p-4 rounded-xl"
        />

        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          className="bg-slate-900 p-4 rounded-xl"
        />

        <input
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          className="bg-slate-900 p-4 rounded-xl"
        />

        <input
          type="number"
           name="totalAmount"
           placeholder="Total Amount"
           value={form.totalAmount}
           onChange={handleChange}
           className="bg-slate-900 p-4 rounded-xl"
           required
        />

        <input
          type="number"
          name="advance"
          placeholder="Advance"
          value={form.advance}
          onChange={handleChange}
          className="bg-slate-900 p-4 rounded-xl"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          className="col-span-2 bg-slate-900 p-4 rounded-xl h-32"
        />

        <button
          className="col-span-2 bg-blue-600 hover:bg-blue-700 p-4 rounded-xl text-lg font-semibold"
        >
          Save Project
        </button>

      </form>

    </div>
  );
}