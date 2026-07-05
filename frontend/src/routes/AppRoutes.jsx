import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";

import Dashboard from "../pages/Dashboard/Index";
import Projects from "../pages/Projects/Index";
import Clients from "../pages/Clients/Index";
import Payments from "../pages/Payments/Index";
import Events from "../pages/Events/Index";
import Editing from "../pages/Editing/Index";
import Calendar from "../pages/Calendar/Index";
import Reports from "../pages/Reports/Index";
import Settings from "../pages/Settings/Index";
import ProjectDetails from "../pages/ProjectDetails/Index";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/events" element={<Events />} />
        <Route path="/editing" element={<Editing />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}