// src/routes/AppRoutes.tsx

import { useContext } from "react";
import { Routes, Route } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ContactPage from "../pages/ContactPage";
import DashboardOrganizer from "../pages/organizer/DashboardOrganizer";
import DashboardContestant from "../pages/contestant/DashboardContestant";
import ContestCreate from "../pages/organizer/ContestCreate";
import ProblemCreate from "../pages/organizer/ProblemCreate";
import OrganizerLayout from "../pages/organizer";
import ContestDashboard from "../pages/organizer/ContestList";
import OrganizerSubmissions from "../pages/organizer/OrganizerSubmissions";
import SubmissionDetailView from "../pages/organizer/SubmissionDetailView";
import ContestDetails from "../pages/contestant/ContestDetails";
import App from "../pages/contestant/problemlist";
import ProblemPage from "../pages/contestant/contestPage";
import Leaderboard from "../pages/contestant/Leaderboard";
import ListsPage from "../pages/personal/ListsPage";
import NotesPage from "../pages/personal/NotesPage";
import ProgressPage from "../pages/personal/ProgressPage";
import PointsPage from "../pages/personal/PointsPage";
import DiscussPage from "../pages/contestant/DiscussPage";
import ProfilePage from "../pages/profile/ProfilePage";
import SettingsPage from "../pages/settings/SettingsPage";
import ContestantNotificationsPage from "../pages/notifications/ContestantNotificationsPage";
import OrganizerNotificationsPage from "../pages/notifications/OrganizerNotificationsPage";

export default function AppRoutes() {
  const auth = useContext(AuthContext);

  if (auth?.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* LANDING PAGE - Root Route */}
      <Route path="/" element={<LandingPage />} />

      {/* PUBLIC ROUTES */}
      <Route element={<PublicRoute redirectToDashboard={false} />}>
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route element={<PublicRoute redirectToDashboard={true} />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* PROTECTED – ORGANIZER */}
<Route element={<ProtectedRoute role="organizer" />}>
  <Route path="/organizer" element={<OrganizerLayout />}>
    {/* ✅ DashboardOrganizer is now the index route: /organizer */}
    <Route index element={<DashboardOrganizer />} />
    
    {/* ✅ Contest List is now at: /organizer/contests */}
    <Route path="contests" element={<ContestDashboard />} />
    
    {/* Other organizer routes */}
    <Route path="create" element={<ContestCreate />} />
    <Route path="create-problem" element={<ProblemCreate />} />
    <Route path="submissions" element={<OrganizerSubmissions />} />
    <Route path="submission-detail" element={<SubmissionDetailView />} />
    <Route path="notifications" element={<OrganizerNotificationsPage />} />
  </Route>
</Route>

      {/* PROTECTED – SHARED ACCOUNT PAGES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* PROTECTED – CONTESTANT */}
      <Route element={<ProtectedRoute role="contestant" />}>
        <Route path="/problems" element={<App />} />
        <Route path="/problems/:id" element={<ProblemPage />} />
        <Route path="/explore" element={<DashboardContestant />} />
        <Route path="/discuss" element={<DiscussPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/points" element={<PointsPage />} />
        <Route path="/notifications" element={<ContestantNotificationsPage />} />
        <Route path="/contest/:id" element={<ContestDetails />} />
        <Route path="/contest/:contestId" element={<App />} />
        <Route path="/contest/:contestId/problem/:problemId" element={<ProblemPage />} />
        <Route path="/contest/:contestId/leaderboard" element={<Leaderboard />} />
      </Route>

    </Routes>
  );
}