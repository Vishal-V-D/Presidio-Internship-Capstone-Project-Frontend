import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { submissionService } from "../../api/submissionService";
import type { 
  DashboardMetrics, 
  LeaderboardEntry, 
  SubmissionResponse 
} from "../../api/submissionService";
import { contestService } from "../../api/contestService";
import {
  TrendingUp, Users, Award, Code, CheckCircle,
  Trash2, Edit3, RefreshCw, Download, Search,
  ChevronLeft, ChevronRight, Eye,
  Calendar, Activity
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { toast } from "react-toastify";

interface Contest {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  registrationCount?: number;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  bgClass?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
}) => (
  <div className="bg-theme-secondary rounded-xl p-6 shadow-lg border border-theme flex flex-col justify-between h-32 transition-all hover:shadow-xl">
    <div className="text-4xl font-extrabold text-theme-primary">{value}</div>
    <div className="flex items-center justify-between">
      <div className="text-sm text-theme-secondary">{title}</div>
      <div className="text-theme-accent">{icon}</div>
    </div>
    {trend && (
      <div className="mt-2 text-xs bg-theme-accent/10 text-theme-accent px-2 py-1 rounded-full inline-block">
        {trend}
      </div>
    )}
  </div>
);

interface EditModalProps {
  entry: LeaderboardEntry;
  contestId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const EditLeaderboardModal: React.FC<EditModalProps> = ({ entry, contestId, onClose, onSuccess }) => {
  const [pointsAdjustment, setPointsAdjustment] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submissionService.editLeaderboardEntry(contestId, entry.userId, { pointsAdjustment, reason });
      toast.success("Leaderboard entry updated!");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-secondary rounded-2xl shadow-2xl max-w-md w-full p-6 border border-theme">
        <h2 className="text-2xl font-bold text-theme-primary mb-4 flex items-center gap-2">
          <Edit3 size={24} className="text-theme-accent" />
          Edit Leaderboard Entry
        </h2>
        <div className="mb-4 p-4 bg-theme-tertiary rounded-lg border border-theme">
          <p className="text-sm text-theme-secondary"><strong>User:</strong> {entry.username}</p>
          <p className="text-sm text-theme-secondary"><strong>Current Points:</strong> {entry.points}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">Points Adjustment</label>
            <input 
              type="number" 
              value={pointsAdjustment} 
              onChange={(e) => setPointsAdjustment(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-theme bg-theme-tertiary text-theme-primary focus:ring-2 focus:ring-theme-accent"
              placeholder="Enter adjustment value" 
              required 
            />
            <p className="text-xs text-theme-secondary mt-1">New Total: {entry.points + pointsAdjustment}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">Reason</label>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-theme bg-theme-tertiary text-theme-primary focus:ring-2 focus:ring-theme-accent"
              rows={3} 
              placeholder="Explain the reason for adjustment..." 
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 rounded-lg border border-theme text-theme-primary hover:bg-theme-tertiary transition-colors" 
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 rounded-lg button-theme text-theme-primary disabled:opacity-50" 
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function OrganizerSubmissions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'contests'>('overview');
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<string>("all");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<LeaderboardEntry | null>(null);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsTotal, setSubmissionsTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [languageFilter, setLanguageFilter] = useState<string>("");
  const [usernameSearch, setUsernameSearch] = useState<string>("");

  const fetchContests = async () => {
    try {
      const response = await contestService.getCreatedContests();
      setContests(response.data || []);
    } catch (error) {
      console.error("Failed to load contests", error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const contestId = selectedContest === "all" ? undefined : selectedContest;
      const response = await submissionService.getDashboardMetrics(contestId);
      setMetrics(response.data.data);
    } catch (error: any) {
      console.error("Failed to load metrics:", error);
    }
  };

  const fetchLeaderboard = async () => {
    if (selectedContest === "all") {
      setLeaderboard([]);
      return;
    }
    try {
      const response = await submissionService.getContestLeaderboard(selectedContest, 1, 50);
      setLeaderboard(response.data.leaderboard || []);
    } catch (error: any) {
      console.error("Failed to load leaderboard:", error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (languageFilter) filters.language = languageFilter;
      if (usernameSearch) filters.username = usernameSearch;
      const response = await submissionService.getAllSubmissions(submissionsPage, 10, filters);
      setSubmissions(response.data.submissions || []);
      setSubmissionsTotal(response.data.total || 0);
    } catch (error: any) {
      console.error("Failed to load submissions:", error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchContests(), fetchMetrics(), fetchLeaderboard(), fetchSubmissions()]);
    setLoading(false);
  };

  useEffect(() => { fetchAllData(); }, []);
  useEffect(() => { fetchMetrics(); fetchLeaderboard(); }, [selectedContest]);
  useEffect(() => { fetchSubmissions(); }, [submissionsPage, statusFilter, languageFilter, usernameSearch]);

  const handleDeleteLeaderboardEntry = async (userId: string) => {
    if (!confirm("Remove this user from leaderboard?")) return;
    try {
      await submissionService.deleteLeaderboardEntry(selectedContest, userId);
      toast.success("User removed from leaderboard");
      fetchLeaderboard();
      fetchMetrics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  const languageChartData = metrics?.languageDistribution.map((item) => ({ 
    name: item.language, 
    value: item.count 
  })) || [];
  
  const topPerformersChartData = metrics?.topPerformers.map((item) => ({ 
    name: item.username, 
    points: item.totalPoints, 
    solved: item.solved 
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-primary">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-theme-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-theme-primary font-sans">
      <div className="max-w-7xl mx-auto p-6 bg-theme-secondary rounded-3xl shadow-2xl border border-theme">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-6 border-b border-theme">
          <div>
            <h1 className="text-4xl font-bold text-theme-primary mb-1">Analytics Dashboard</h1>
            <p className="text-theme-secondary">Monitor submissions, manage contests & track performance</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={fetchAllData} 
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-theme text-theme-primary hover:bg-theme-tertiary transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg button-theme text-theme-primary">
              <Download size={18} />
              Export
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6 border-b border-theme">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'overview'
                ? 'text-theme-accent border-b-2 border-theme-accent'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Activity className="inline mr-2" size={18} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'submissions'
                ? 'text-theme-accent border-b-2 border-theme-accent'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Code className="inline mr-2" size={18} />
            Submissions
          </button>
          <button
            onClick={() => setActiveTab('contests')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'contests'
                ? 'text-theme-accent border-b-2 border-theme-accent'
                : 'text-theme-secondary hover:text-theme-primary'
            }`}
          >
            <Award className="inline mr-2" size={18} />
            Contests & Leaderboard
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards */}
              {metrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard 
                    title="Total Submissions" 
                    value={metrics.totalSubmissions} 
                    icon={<Code size={24} />} 
                    bgClass="bg-blue-600" 
                  />
                  <MetricCard 
                    title="Unique Participants" 
                    value={metrics.uniqueParticipants} 
                    icon={<Users size={24} />} 
                    bgClass="bg-green-600" 
                  />
                  <MetricCard 
                    title="Success Rate" 
                    value={metrics.successRate} 
                    icon={<CheckCircle size={24} />} 
                    trend={`${metrics.successRate}`}
                    bgClass="bg-purple-600" 
                  />
                  <MetricCard 
                    title="Avg Points" 
                    value={metrics.averagePoints} 
                    icon={<Award size={24} />} 
                    bgClass="bg-orange-600" 
                  />
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-theme-secondary rounded-2xl p-6 shadow-lg border border-theme">
                  <h2 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <Code size={24} className="text-theme-accent" />
                    Language Distribution
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={languageChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {metrics && metrics.topPerformers.length > 0 && (
                  <div className="bg-theme-secondary rounded-2xl p-6 shadow-lg border border-theme">
                    <h2 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <TrendingUp size={24} className="text-green-500" />
                      Top Performers
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={topPerformersChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                        <Legend />
                        <Area type="monotone" dataKey="points" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="solved" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SUBMISSIONS TAB */}
          {activeTab === 'submissions' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    <Search className="inline mr-1" size={16} />
                    Search Username
                  </label>
                  <input 
                    type="text" 
                    value={usernameSearch} 
                    onChange={(e) => setUsernameSearch(e.target.value)}
                    placeholder="Enter username..." 
                    className="w-full px-4 py-2 rounded-lg border border-theme bg-theme-tertiary text-theme-primary focus:ring-2 focus:ring-theme-accent" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-theme bg-theme-tertiary text-theme-primary focus:ring-2 focus:ring-theme-accent"
                  >
                    <option value="">All Statuses</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="WRONG_ANSWER">Wrong Answer</option>
                    <option value="TIME_LIMIT_EXCEEDED">Time Limit</option>
                    <option value="RUNTIME_ERROR">Runtime Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">Language</label>
                  <select 
                    value={languageFilter} 
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-theme bg-theme-tertiary text-theme-primary focus:ring-2 focus:ring-theme-accent"
                  >
                    <option value="">All Languages</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              </div>

              {/* Submissions Table */}
              <div className="bg-theme-secondary rounded-2xl p-6 shadow-lg border border-theme">
                <h2 className="text-2xl font-bold text-theme-primary mb-6 flex items-center gap-2">
                  <Code size={28} className="text-theme-accent" />
                  All Submissions
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-theme">
                        <th className="text-left py-3 px-4 text-theme-primary font-semibold">User</th>
                        <th className="text-left py-3 px-4 text-theme-primary font-semibold">Problem</th>
                        <th className="text-left py-3 px-4 text-theme-primary font-semibold">Language</th>
                        <th className="text-left py-3 px-4 text-theme-primary font-semibold">Status</th>
                        <th className="text-left py-3 px-4 text-theme-primary font-semibold">Points</th>
                        <th className="text-left py-3 px-4 text-theme-primary font-semibold">Tests</th>
                        <th className="text-left py-3 px-4 text-theme-primary font-semibold">Submitted</th>
                        <th className="text-right py-3 px-4 text-theme-primary font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="border-b border-theme/50 hover:bg-theme-tertiary transition-colors">
                          <td className="py-4 px-4 text-theme-primary font-medium">{submission.username}</td>
                          <td className="py-4 px-4 text-theme-secondary font-mono text-sm">{submission.problemId.substring(0, 8)}...</td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              {submission.language}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              submission.status === "ACCEPTED" ? "bg-green-100 text-green-700" :
                              submission.status === "WRONG_ANSWER" ? "bg-red-100 text-red-700" : 
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-theme-primary font-bold">{submission.points}</td>
                          <td className="py-4 px-4 text-theme-secondary">{submission.passedTests}/{submission.totalTests}</td>
                          <td className="py-4 px-4 text-theme-secondary text-sm">{new Date(submission.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4">
                            <button 
                              onClick={() => navigate('/organizer/submission-detail', { state: { submission } })}
                              className="p-2 rounded-lg bg-theme-accent/10 text-theme-accent hover:bg-theme-accent/20 transition-colors" 
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-theme">
                  <p className="text-sm text-theme-secondary">
                    Showing {(submissionsPage - 1) * 10 + 1} to {Math.min(submissionsPage * 10, submissionsTotal)} of {submissionsTotal}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSubmissionsPage((p) => Math.max(1, p - 1))} 
                      disabled={submissionsPage === 1}
                      className="px-4 py-2 rounded-lg border border-theme text-theme-primary hover:bg-theme-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="px-4 py-2 text-theme-primary font-medium">Page {submissionsPage}</span>
                    <button 
                      onClick={() => setSubmissionsPage((p) => p + 1)} 
                      disabled={submissionsPage * 10 >= submissionsTotal}
                      className="px-4 py-2 rounded-lg border border-theme text-theme-primary hover:bg-theme-tertiary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTESTS & LEADERBOARD TAB */}
          {activeTab === 'contests' && (
            <div className="space-y-6">
              {/* Contest Selection */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar size={18} />
                  Select Contest
                </label>
                <select 
                  value={selectedContest} 
                  onChange={(e) => setSelectedContest(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-gray-700"
                >
                  <option value="all">All Contests</option>
                  {contests.map((contest) => (
                    <option key={contest.id} value={contest.id}>
                      {contest.title} {contest.registrationCount ? `(${contest.registrationCount} registered)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contest Stats */}
              {selectedContest !== "all" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                    <Users size={32} className="mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{leaderboard.length}</div>
                    <div className="text-sm opacity-90">Participants</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                    <Award size={32} className="mb-3 opacity-80" />
                    <div className="text-3xl font-bold">{leaderboard.filter(e => e.solved > 0).length}</div>
                    <div className="text-sm opacity-90">Active Solvers</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
                    <TrendingUp size={32} className="mb-3 opacity-80" />
                    <div className="text-3xl font-bold">
                      {leaderboard.length > 0 ? Math.max(...leaderboard.map(e => e.points)) : 0}
                    </div>
                    <div className="text-sm opacity-90">Highest Score</div>
                  </div>
                </div>
              )}

              {/* Leaderboard Table */}
              {selectedContest !== "all" && leaderboard.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Award size={28} className="text-yellow-600" />
                    Contest Leaderboard
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Rank</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Username</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Solved</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Points</th>
                          <th className="text-left py-3 px-4 text-gray-700 font-semibold">Language</th>
                          <th className="text-right py-3 px-4 text-gray-700 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((entry, index) => (
                          <tr key={entry.userId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                                index === 0 ? "bg-yellow-500 text-white shadow-lg" : 
                                index === 1 ? "bg-gray-400 text-white shadow-md" : 
                                index === 2 ? "bg-orange-600 text-white shadow-md" : 
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-800 font-medium">{entry.username}</td>
                            <td className="py-4 px-4 text-gray-600">
                              <span className="inline-flex items-center gap-1">
                                <CheckCircle size={16} className="text-green-600" />
                                {entry.solved}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-purple-600 text-lg">{entry.points}</span>
                            </td>
                            <td className="py-4 px-4 text-gray-600">{entry.language || "N/A"}</td>
                            <td className="py-4 px-4">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setEditingEntry(entry)}
                                  className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors" 
                                  title="Edit Entry"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLeaderboardEntry(entry.userId)}
                                  className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors" 
                                  title="Remove Entry"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {selectedContest !== "all" && leaderboard.length === 0 && (
                <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
                  <Award size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Leaderboard Data</h3>
                  <p className="text-gray-600">No participants have submitted solutions for this contest yet.</p>
                </div>
              )}

              {selectedContest === "all" && (
                <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-200 text-center">
                  <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Contest</h3>
                  <p className="text-gray-600">Choose a specific contest to view its leaderboard and manage entries.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editingEntry && (
        <EditLeaderboardModal 
          entry={editingEntry} 
          contestId={selectedContest} 
          onClose={() => setEditingEntry(null)}
          onSuccess={() => { 
            fetchLeaderboard(); 
            fetchMetrics(); 
          }} 
        />
      )}
    </div>
  );
}