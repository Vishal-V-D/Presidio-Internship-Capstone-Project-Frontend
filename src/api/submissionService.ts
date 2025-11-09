import axiosSubmissionClient from "./axiosSubmissionClient";

export type SubmissionCreate = {
  problemId: string;
  contestId?: string;
  language: string;
  code: string;
};

export type SubmissionResponse = {
  id: string;
  userId: string;
  username: string;
  problemId: string;
  contestId?: string;
  language: string;
  code: string;
  status: string;
  points: number;
  passedTests?: number;
  totalTests?: number;
  executionTime?: number;
  memoryUsed?: number;
  memory?: number;
  verdict?: string;
  output?: string;
  testResults?: Array<{
    testNumber: number;
    status: "PASSED" | "FAILED" | "RUNTIME_ERROR" | "TIME_LIMIT_EXCEEDED";
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    errorMessage?: string;
    executionTime: number;
  }>;
  feedback?: string;
  createdAt: string;
};

export type LeaderboardEntry = {
  userId: string;
  username: string;
  solved: number;
  points: number;
  firstSolveTime?: string;
  language?: string;
  totalAttempts?: number;
};

export type PaginatedResponse<T> = {
  submissions?: T[];
  leaderboard?: T[];
  page: number;
  limit: number;
  total?: number;
};

// ✅ NEW: Dashboard Metrics Types
export type DashboardMetrics = {
  totalSubmissions: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  uniqueParticipants: number;
  languageDistribution: Array<{ language: string; count: number }>;
  averagePoints: string;
  topPerformers: Array<{
    username: string;
    totalPoints: number;
    solved: number;
  }>;
  recentActivity: number;
  successRate: string;
  submissionTrend?: Array<{ date: string; count: number }>;
};

// ✅ NEW: Leaderboard Edit/Delete Types
export type LeaderboardEditRequest = {
  pointsAdjustment: number;
  reason?: string;
};

export type LeaderboardActionResponse = {
  success: boolean;
  message: string;
  reason?: string;
};

export const submissionService = {
  // ==================== SUBMISSION ENDPOINTS ====================
  
  createSubmission: (data: SubmissionCreate) =>
    axiosSubmissionClient.post("/submissions", data),

  getSubmissionById: (id: string) =>
    axiosSubmissionClient.get<SubmissionResponse>(`/submissions/${id}`),

  getMySubmissions: (page = 1, limit = 10, status?: string, language?: string) => {
    let query = `?page=${page}&limit=${limit}`;
    if (status) query += `&status=${status}`;
    if (language) query += `&language=${language}`;
    return axiosSubmissionClient.get<PaginatedResponse<SubmissionResponse>>(
      `/submissions/user/me${query}`
    );
  },

  getSubmissionsByProblem: (
    problemId: string,
    page = 1,
    limit = 10,
    status?: string
  ) => {
    let query = `?page=${page}&limit=${limit}`;
    if (status) query += `&status=${status}`;
    return axiosSubmissionClient.get<PaginatedResponse<SubmissionResponse>>(
      `/submissions/problem/${problemId}${query}`
    );
  },

  getAllSubmissions: (
    page = 1, 
    limit = 10, 
    filters?: { status?: string; language?: string; username?: string }
  ) => {
    let query = `?page=${page}&limit=${limit}`;
    if (filters?.status) query += `&status=${filters.status}`;
    if (filters?.language) query += `&language=${filters.language}`;
    if (filters?.username) query += `&username=${filters.username}`;
    return axiosSubmissionClient.get<PaginatedResponse<SubmissionResponse>>(
      `/submissions${query}`
    );
  },

  // ==================== LEADERBOARD ENDPOINTS ====================

  getContestLeaderboard: (
    contestId: string, 
    page = 1, 
    limit = 50,
    filters?: { username?: string; minPoints?: number; maxPoints?: number }
  ) => {
    let query = `?page=${page}&limit=${limit}`;
    if (filters?.username) query += `&username=${filters.username}`;
    if (filters?.minPoints !== undefined) query += `&minPoints=${filters.minPoints}`;
    if (filters?.maxPoints !== undefined) query += `&maxPoints=${filters.maxPoints}`;
    return axiosSubmissionClient.get<PaginatedResponse<LeaderboardEntry>>(
      `/submissions/leaderboard/${contestId}${query}`
    );
  },

  // ✅ NEW: Edit leaderboard entry (Organizer only)
  editLeaderboardEntry: (
    contestId: string,
    userId: string,
    data: LeaderboardEditRequest
  ) =>
    axiosSubmissionClient.patch<LeaderboardActionResponse>(
      `/submissions/leaderboard/${contestId}/user/${userId}`,
      data
    ),

  // ✅ NEW: Delete user from leaderboard (Organizer only)
  deleteLeaderboardEntry: (contestId: string, userId: string) =>
    axiosSubmissionClient.delete<LeaderboardActionResponse>(
      `/submissions/leaderboard/${contestId}/user/${userId}`
    ),

  // ==================== DASHBOARD ENDPOINTS ====================

  // ✅ NEW: Get organizer dashboard metrics
  getDashboardMetrics: (contestId?: string) => {
    const query = contestId ? `?contestId=${contestId}` : "";
    return axiosSubmissionClient.get<{
      success: boolean;
      data: DashboardMetrics;
      contestId: string;
    }>(`/submissions/dashboard/metrics${query}`);
  },
};