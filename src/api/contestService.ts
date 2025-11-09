// src/api/contestService.ts

import axiosContestClient from "./axiosContestClient";

// ✅ ---------- TYPES ----------

export type ContestantRegistrationData = {
  username: string;
  email: string;
  password: string;
};

export type OrganizerRegistrationData = {
  username: string;
  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type ContestData = {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  durationMinutes?: number;
};

export type ContestUpdateData = Partial<ContestData>;

export type ProblemData = {
  id?: string; // Added for API responses
  title: string;
  description: string;
  difficulty?: string;
  constraints?: string;
  inputFormat?: string;
  outputFormat?: string;
  additionalInfo?: string;
  timeLimit?: number; // Added for completeness in form usage
  memoryLimit?: number; // Added for completeness in form usage
  accessType: "PUBLIC" | "PRIVATE"; // ✅ matches backend enum
  testcases?: TestCaseData[]; // Added for API responses
  // Additional fields for problem list display
  status?: 'SOLVED' | 'ATTEMPTED' | 'UNATTEMPTED' | string;
  points?: number;
  solved?: number;
  totalAttempts?: number;
};

export type TestCaseData = {
  id?: string; // Added for API responses
  input: string;
  expectedOutput: string;
  isHidden: boolean; // ✅ fixed (backend uses this)
};

// ✅ ---------- API SERVICE ----------

export const contestService = {
  // ------- AUTH -------
  registerOrganizer: (data: OrganizerRegistrationData) =>
    axiosContestClient.post("/auth/signup/organizer", data),

  registerContestant: (data: ContestantRegistrationData) =>
    axiosContestClient.post("/auth/signup/contestant", data),

  login: (data: LoginData) =>
    axiosContestClient.post("/auth/login", data),

  logout: () =>
    axiosContestClient.post("/auth/logout"),

  getMe: () =>
    axiosContestClient.get("/auth/me"),

  // ------- CONTESTS -------
  createContest: (data: ContestData) =>
    axiosContestClient.post("/contests", data),

  listContests: (search?: string, page = 1, limit = 10) => {
    let query = `?page=${page}&limit=${limit}`;
    if (search) query += `&search=${search}`;
    return axiosContestClient.get(`/contests${query}`);
  },

  getContestById: (id: string) =>
    axiosContestClient.get(`/contests/${id}`),

  deleteContest: (id: string) =>
    axiosContestClient.delete(`/contests/${id}`),
  // ------- CONTESTS -------

updateContest: (id: string, data: ContestUpdateData) =>
  axiosContestClient.put(`/contests/${id}`, data), // ✅ Update contest




  addProblemToContest: (contestId: string, problemId: string) =>
    axiosContestClient.post(`/contests/${contestId}/problems`, { problemId }),

  removeContestProblem: (cpId: string) =>
    axiosContestClient.delete(`/contests/problems/${cpId}`),

  registerForContest: (contestId: string) =>
    axiosContestClient.post(`/contests/${contestId}/register`),

  getCreatedContests: () =>
    axiosContestClient.get("contests/me/created"),

  getRegisteredContests: () =>
    axiosContestClient.get("/contests/me/registered"),

  // ------- PROBLEMS -------
  createProblem: (data: ProblemData) =>
    axiosContestClient.post("/problems", data),

  listProblems: (organizerId?: string, page = 1, limit = 10) =>
  axiosContestClient.get(`/problems?organizerId=${organizerId}&skip=${(page - 1) * limit}&take=${limit}`),

  

  getProblem: (id: string) =>
    axiosContestClient.get(`/problems/${id}`),

  updateProblem: (id: string, data: Partial<ProblemData>) =>
    axiosContestClient.put(`/problems/${id}`, data),

  deleteProblem: (id: string) =>
    axiosContestClient.delete(`/problems/${id}`),

  addTestcaseToProblem: (id: string, data: TestCaseData) =>
    axiosContestClient.post(`/problems/${id}/testcases`, data),
    
  // ------- DASHBOARD/METRICS (Added for dynamic dashboard) -------
  getOrganizerMetrics: () =>
    axiosContestClient.get("/organizer/metrics"),

  getRecentSubmissions: (limit = 5) =>
    axiosContestClient.get(`/submissions/latest?limit=${limit}`),

  // ------- HEALTH -------
  healthCheck: () =>
    axiosContestClient.get("/health"),
};