import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Send,
  Play,
  Settings,
  RotateCcw,
  X,
  Terminal,
  Maximize2,
  ChevronUp,
  ChevronDown,
  BarChart2,
  Gauge,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  CheckCircle,
  Timer,
  Activity,
  FileCode2,
  ChevronLeft,
  ChevronRight,
  List,
  Lock,
  Brain,
  Lightbulb,
  Code,
  Eye,
  Database,
  Sparkles,
} from "lucide-react";
import { contestService, type ProblemData, type TestCaseData } from "../../api/contestService";
import { submissionService, type SubmissionResponse, type SubmissionCreate } from "../../api/submissionService";
import Editor from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";

type SupportedLanguage = "python" | "cpp" | "java";

const CODE_TEMPLATES: Record<SupportedLanguage, string> = {
  python: `def solve():
    # Read input
    s = input().strip()
    k = int(input().strip())
    
    # Your code here
    
    # Print output
    print(result)`,
  cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    int k;
    cin >> s >> k;
    
    // Your code here
    
    cout << result << endl;
    return 0;
}`,
  java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.nextLine();
        int k = sc.nextInt();
        
        // Your code here
        
        System.out.println(result);
    }
}`,
};

// --- Custom Scrollbar Hiding Styles ---
// NOTE: These styles are crucial for the requested "hidden scrollbar" behavior.
const ScrollbarStyles = () => (
  <style>{`
    /* Hide scrollbar for Chrome, Safari and Opera */
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    /* Hide scrollbar for IE, Edge and Firefox */
    .hide-scrollbar {
      -ms-overflow-style: none !important;  /* IE and Edge */
      scrollbar-width: none !important;  /* Firefox */
    }
    /* Hide main navbar in fullscreen mode */
    :fullscreen #main-navbar {
      display: none !important;
    }
    :-webkit-full-screen #main-navbar {
      display: none !important;
    }
    :-moz-full-screen #main-navbar {
      display: none !important;
    }
    :-ms-fullscreen #main-navbar {
      display: none !important;
    }
  `}</style>
);
// -------------------------------------

// ------------------------ Timer Box ------------------------
interface TimerBoxProps {
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  onContestEnd?: () => void;
}

const TimerBox = ({ startTime, endTime, durationMinutes, onContestEnd }: TimerBoxProps) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isContestOver, setIsContestOver] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      
      // If contest hasn't started yet, show full duration
      if (now < start) {
        if (durationMinutes) {
          return durationMinutes * 60;
        }
        return Math.floor((end - start) / 1000);
      }
      
      // Contest has started, calculate remaining time
      const difference = end - now;
      
      if (difference <= 0) {
        setTimeLeft(0);
        setIsContestOver(true);
        if (onContestEnd) onContestEnd();
        return 0;
      }
      
      return Math.floor(difference / 1000);
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, endTime, durationMinutes, onContestEnd]);

  if (isContestOver) {
    return (
      <div className="flex items-center space-x-3 bg-red-900/30 px-4 py-2 rounded-lg border border-red-500">
        <Clock size={18} className="text-red-400" />
        <span className="text-lg font-bold text-red-400">Contest Over</span>
      </div>
    );
  }

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  
  const formattedTime = hours > 0 
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  
  const timerClass = timeLeft < 600 ? "text-red-400" : timeLeft < 1800 ? "text-yellow-400" : "text-green-400";

  return (
    <div className="flex items-center space-x-3">
      <Clock size={18} className="text-theme-secondary-text" />
      <span className="text-sm text-theme-secondary-text">Time Left:</span>
      <span className={`text-lg font-mono font-bold ${timerClass}`}>
        {formattedTime}
      </span>
    </div>
  );
};

// ------------------------ Resizable Divider ------------------------
type ResizeDirection = "horizontal" | "vertical";

interface ResizableDividerProps {
  onResize: (position: number) => void;
  direction?: ResizeDirection;
}

const ResizableDivider = ({ onResize, direction = "horizontal" }: ResizableDividerProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onResize(direction === "horizontal" ? e.clientX : e.clientY);
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onResize, direction]);

  const accentBgClass = "bg-[hsl(var(--color-accent))]";

  if (direction === "horizontal") {
    return (
      <div
        onMouseDown={handleMouseDown}
        className={`w-2 cursor-col-resize flex items-center justify-center bg-theme-border hover:${accentBgClass} transition-all group ${
          isDragging ? `${accentBgClass} w-3` : ""
        }`}
      >
        <div className="w-0.5 h-16 bg-theme-secondary-text rounded-full group-hover:bg-theme-primary transition-colors" />
      </div>
    );
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`h-2 cursor-row-resize flex items-center justify-center bg-theme-border hover:${accentBgClass} transition-all group ${
        isDragging ? `${accentBgClass} h-3` : ""
      }`}
    >
      <div className="w-16 h-0.5 bg-theme-secondary-text rounded-full group-hover:bg-theme-primary transition-colors" />
    </div>
  );
};

// ------------------------ Problem Description Panel ------------------------
type ProblemDetails = ProblemData & {
  testcases?: TestCaseData[];
  constraints?: string;
  additionalInfo?: string;
  inputFormat?: string;
  outputFormat?: string;
};

interface DescriptionPanelProps {
  problem: ProblemDetails;
  onFullscreen: () => void;
  contestId?: string;
  submissionResult?: SubmissionResponse | null;
}

const DescriptionPanel = ({ problem, onFullscreen,submissionResult }: DescriptionPanelProps) => {
  const [activeTab, setActiveTab] = useState("Description");
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const visibleTestCases = problem.testcases?.filter((tc) => !tc.isHidden) ?? [];

  // Auto-switch to Submissions tab only when result is complete (not RUNNING)
  useEffect(() => {
    if (submissionResult && submissionResult.status !== "RUNNING") {
      setActiveTab("Submissions");
    }
  }, [submissionResult]);

  // Fetch submissions when Submissions tab is active
  useEffect(() => {
    if (activeTab === "Submissions" && problem.id) {
      setLoadingSubmissions(true);
      submissionService
        .getSubmissionsByProblem(problem.id, 1, 20)
        .then((res) => {
          console.log('📥 Submissions response:', res.data);
          const responseData = res.data;
          const submissionsData = responseData.submissions ?? (responseData as { data?: SubmissionResponse[] }).data ?? [];
          setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
          setLoadingSubmissions(false);
        })
        .catch((err) => {
          console.error("Failed to fetch submissions:", err);
          setSubmissions([]);
          setLoadingSubmissions(false);
        });
    }
  }, [activeTab, problem.id]);

  const DescriptionContent = () => (
    <div className="p-6 text-theme-secondary-text space-y-6">
      {/* Removed boxed indentation */}
      <p className="leading-relaxed text-base border-b border-theme pb-4">{problem.description}</p>

      {visibleTestCases.length > 0 && (
        <div className="border-t border-theme pt-6">
          <h4 className="text-lg font-semibold text-theme-primary mb-4">Examples</h4>
          {visibleTestCases.map((testcase, index) => (
            <div key={testcase.id || index} className="bg-theme-secondary rounded-lg p-5 space-y-4 border border-theme mb-4 last:mb-0">
              <div className="text-xs font-semibold text-theme-secondary-text mb-2">Example {index + 1}:</div>
              <div>
                <div className="text-xs font-semibold text-theme-secondary-text mb-2">Input:</div>
                {/* Minimal styling for input/output blocks */}
                <div className="text-sm text-theme-primary whitespace-pre-wrap font-mono p-3 rounded bg-theme-primary/50">
                  {testcase.input}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-theme-secondary-text mb-2">Output:</div>
                {/* Minimal styling for input/output blocks */}
                <div className="text-sm text-theme-primary whitespace-pre-wrap font-mono p-3 rounded bg-theme-primary/50">
                  {testcase.expectedOutput}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-theme pt-6">
        <h4 className="text-lg font-semibold text-theme-primary mb-3">Input Format</h4>
        {/* Removed boxed indentation */}
        <div className="p-4 bg-theme-secondary rounded text-theme-secondary-text whitespace-pre-wrap text-sm border border-theme">
          {problem.inputFormat}
        </div>
      </div>

      <div className="border-t border-theme pt-6">
        <h4 className="text-lg font-semibold text-theme-primary mb-3">Output Format</h4>
        {/* Removed boxed indentation */}
        <div className="p-4 bg-theme-secondary rounded text-theme-secondary-text whitespace-pre-wrap text-sm border border-theme">
          {problem.outputFormat}
        </div>
      </div>

      {problem.constraints && (
        <div className="border-t border-theme pt-6">
          <h4 className="text-lg font-semibold text-theme-primary mb-3">Constraints</h4>
          {/* Minimal styling for constraints */}
          <div className="whitespace-pre-wrap text-sm text-theme-secondary-text leading-relaxed p-3">{problem.constraints}</div>
        </div>
      )}

      {problem.additionalInfo && (
        <div className="border-t border-theme pt-6">
          <h4 className="text-lg font-semibold text-theme-primary mb-3">Additional Notes</h4>
          {/* Minimal styling for additional notes */}
          <div className="whitespace-pre-wrap text-gray-300 p-3">{problem.additionalInfo}</div>
        </div>
      )}
    </div>
  );

  const SubmissionsContent = () => {
    if (loadingSubmissions) {
      return (
        <div className="p-6 text-center text-theme-secondary-text">
          <div className="text-sm">Loading submissions...</div>
        </div>
      );
    }

    if (!submissions || submissions.length === 0) {
      return (
        <div className="p-6 text-theme-secondary-text border border-theme m-4 rounded-lg">
          <div className="text-theme-primary text-lg font-semibold mb-4">Your Submissions History</div>
          <div className="text-sm text-theme-secondary-text opacity-70">No submissions yet</div>
        </div>
      );
    }

    const getStatusColor = (status: string) => {
      switch (status) {
        case "AC":
        case "ACCEPTED":
          return "text-green-400";
        case "WA":
        case "WRONG_ANSWER":
          return "text-red-400";
        case "TLE":
        case "TIME_LIMIT_EXCEEDED":
          return "text-yellow-400";
        case "RE":
        case "RUNTIME_ERROR":
          return "text-orange-400";
        case "PENDING":
        case "RUNNING":
          return "text-blue-400";
        default:
          return "text-gray-400";
      }
    };

    // Calculate submission statistics
    const statusCounts = submissions.reduce<Record<string, number>>((acc, sub) => {
      const status = sub.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const totalSubmissions = submissions.length;
    const acceptedCount = (statusCounts['AC'] || 0) + (statusCounts['ACCEPTED'] || 0);
    const successRate = totalSubmissions > 0 ? ((acceptedCount / totalSubmissions) * 100).toFixed(1) : '0';

    return (
      <div className="p-6 space-y-6">
        <div className="text-theme-primary text-lg font-semibold">Your Submissions History</div>
        
        {/* Statistics Chart */}
        <div className="bg-theme-secondary border border-theme rounded-lg p-4">
          <div className="text-sm font-semibold text-theme-primary mb-3">Submission Statistics</div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-theme-primary">{totalSubmissions}</div>
              <div className="text-xs text-theme-secondary-text">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{acceptedCount}</div>
              <div className="text-xs text-theme-secondary-text">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{successRate}%</div>
              <div className="text-xs text-theme-secondary-text">Success Rate</div>
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = (count / totalSubmissions) * 100;
              const color = status.includes('AC') || status.includes('ACCEPTED') ? 'bg-green-500' :
                           status.includes('WA') || status.includes('WRONG') ? 'bg-red-500' :
                           status.includes('TLE') || status.includes('TIME') ? 'bg-yellow-500' :
                           status.includes('RE') || status.includes('RUNTIME') ? 'bg-orange-500' : 'bg-blue-500';
              
              return (
                <div key={status} className="flex items-center space-x-14">
                  <div className="w-20 text-xs text-theme-secondary-text">{status}</div>
                  <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="w-12 text-xs text-theme-secondary-text text-right">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-theme-secondary border border-theme rounded-lg p-4 hover:bg-[hsl(var(--color-border)/0.3)] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className={`font-semibold ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                  <span className="text-xs text-theme-secondary-text">
                    {submission.language.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-theme-secondary-text">
                  {new Date(submission.createdAt).toLocaleString()}
                </span>
              </div>
              {submission.points !== undefined && (
                <div className="text-sm text-theme-secondary-text">
                  Score: <span className="text-theme-primary font-medium">{submission.points}</span>
                </div>
              )}
              {submission.executionTime !== undefined && (
                <div className="text-xs text-theme-secondary-text mt-1">
                  Execution Time: {submission.executionTime}ms
                </div>
              )}
              {/* AI Feedback removed */}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    // ADDED BORDER to main panel & hide-scrollbar class
    <div className="flex flex-col h-full bg-theme-secondary rounded-lg overflow-y-auto hide-scrollbar border border-theme">
      <div className="p-5 border-b border-theme sticky top-0 bg-theme-secondary z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-theme-primary">{problem.title}</h1>
          <button
            onClick={onFullscreen}
            className="p-2 hover:bg-[hsl(var(--color-border)/0.5)] rounded-lg text-theme-secondary-text hover:text-theme-primary transition-all"
            title="Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          <span
            className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              problem.difficulty === "EASY"
                ? "bg-green-700 text-white"
                : problem.difficulty === "MEDIUM"
                ? "bg-yellow-700 text-white"
                : "bg-red-700 text-white"
            }`}
          >
            {problem.difficulty}
          </span>
        </div>

        <div className="flex border-b border-theme">
          {["Description", "Submissions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-all ${
                tab === activeTab
                  ? "border-b-2 border-theme-accent text-theme-accent"
                  : "text-theme-secondary-text hover:text-theme-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        {activeTab === "Description" ? <DescriptionContent /> : <SubmissionsContent />}
      </div>
    </div>
  );
};

// ------------------------ Code Editor Panel ------------------------
interface CodeEditorPanelProps {
  problem: ProblemData;
  onFullscreen: () => void;
  isBottomCollapsed: boolean;
  onToggleBottom: () => void;
  onSubmissionResult: (result: SubmissionResponse) => void;
  contestId?: string;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  socket: Socket | null;
  onSubmitWithRealtime: (data: SubmissionCreate) => Promise<string>;
  isRunning: boolean;
  setIsRunning: (val: boolean) => void;
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
  liveProgress: {
    status: string;
    message: string;
    testNumber?: number;
    totalTests?: number;
    passedTests?: number;
  } | null;
  setLiveProgress: (progress: {
    status: string;
    message: string;
    testNumber?: number;
    totalTests?: number;
    passedTests?: number;
  } | null) => void;
  isContestOver?: boolean;
}

const CodeEditorPanel = ({ problem, onFullscreen, isBottomCollapsed, onToggleBottom, onSubmissionResult, contestId, language, setLanguage, socket: _socket, onSubmitWithRealtime: _onSubmitWithRealtime, isRunning, setIsRunning, isSubmitting, setIsSubmitting, liveProgress: _liveProgress, setLiveProgress: _setLiveProgress, isContestOver = false }: CodeEditorPanelProps) => {
  const [code, setCode] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setCode(CODE_TEMPLATES[language]);
  }, [language]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("Please write some code before submitting!");
      return;
    }

    if (!problem.id) {
      setSubmitError("Problem ID is missing");
      return;
    }

    // Validate token exists before submission
    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitError('Authentication required. Please login again.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    // Auto-open test results panel when submitting
    if (isBottomCollapsed) {
      onToggleBottom();
    }

    try {
      const submissionData: SubmissionCreate = {
        problemId: problem.id,
        language: language,
        code: code,
        contestId: contestId || 'standalone',
      };

      console.log("📤 Submitting code...", submissionData);
      const response = await submissionService.createSubmission(submissionData);
      console.log("✅ Submission created:", response.data);

      // Poll for result using the same reliable method as Run
      if (response.data.id) {
        pollSubmitStatus(response.data.id);
      }
    } catch (error: any) {
      console.error("Submission failed:", error);
      if (error.response?.status === 401) {
        setSubmitError('Authentication failed. Please refresh the page and try again.');
      } else {
        setSubmitError(error.response?.data?.message || "Failed to submit. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  const handleRun = async () => {
    if (!code.trim()) {
      alert("Please write some code before running!");
      return;
    }

    if (!problem.id) {
      setSubmitError("Problem ID is missing");
      return;
    }

    // Validate token exists before running
    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitError('Authentication required. Please login again.');
      return;
    }

    setIsRunning(true);
    setSubmitError(null);
    
    // Auto-open test results panel when running
    if (isBottomCollapsed) {
      onToggleBottom();
    }

    try {
      // For "Run", we create a submission with contestId required by backend
      const submissionData: SubmissionCreate = {
        problemId: problem.id,
        language: language,
        code: code,
        contestId: contestId || 'standalone', // Backend requires contestId
      };

      const response = await submissionService.createSubmission(submissionData);
      console.log("Test run created:", response.data);

      // Poll for result
      if (response.data.id) {
        pollRunStatus(response.data.id);
      }
    } catch (error: any) {
      console.error("Run failed:", error);
      if (error.response?.status === 401) {
        setSubmitError('Authentication failed. Please refresh the page and try again.');
      } else {
        setSubmitError(error.response?.data?.message || "Failed to run code. Please try again.");
      }
      setIsRunning(false);
    }
  };

  const pollRunStatus = async (submissionId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      try {
        const response = await submissionService.getSubmissionById(submissionId, true);
        const submission = response.data;
        
        console.log(`📊 Poll #${attempts} - Status: ${submission.status}, Passed: ${submission.passedTests}/${submission.totalTests}`);
        
        // Update result immediately to show current state
        onSubmissionResult(submission);

        if (submission.status !== "PENDING" && submission.status !== "RUNNING") {
          console.log(`✅ Polling complete - Final status: ${submission.status}`);
          clearInterval(poll);
          setIsRunning(false);
        }

        if (attempts >= maxAttempts) {
          console.warn(`⏱️ Polling timeout after ${maxAttempts} attempts - Last status: ${submission.status}`);
          clearInterval(poll);
          setIsRunning(false);
          
          // If still pending after timeout, show error but keep the result visible
          if (submission.status === "PENDING" || submission.status === "RUNNING") {
            setSubmitError("⚠️ Execution is taking longer than expected. The backend might be processing your submission.");
            // Update with timeout status
            onSubmissionResult({
              ...submission,
              feedback: "Execution timeout - Backend is still processing or there may be an issue."
            });
          }
        }
      } catch (error: any) {
        console.error("Error polling run:", error);
        
        // If it's a 401 error, the interceptor will handle logout
        // For other errors, just stop polling
        if (error.response?.status === 401) {
          console.warn('⚠️ Authentication error during polling - stopping');
          clearInterval(poll);
          setIsRunning(false);
          setSubmitError('Authentication error. Please refresh and try again.');
        } else {
          // For other errors, continue polling a few more times
          if (attempts < maxAttempts - 5) {
            console.warn('⚠️ Polling error, will retry...');
          } else {
            clearInterval(poll);
            setIsRunning(false);
            setSubmitError('Failed to fetch results. Please try again.');
          }
        }
      }
    }, 1000);
  };

  const pollSubmitStatus = async (submissionId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      try {
        const response = await submissionService.getSubmissionById(submissionId, true);
        const submission = response.data;
        
        console.log(`📊 Submit Poll #${attempts} - Status: ${submission.status}, Passed: ${submission.passedTests}/${submission.totalTests}`);
        
        // Update result immediately to show current state
        onSubmissionResult(submission);

        if (submission.status !== "PENDING" && submission.status !== "RUNNING") {
          console.log(`✅ Submission polling complete - Final status: ${submission.status}`);
          clearInterval(poll);
          setIsSubmitting(false);
        }

        if (attempts >= maxAttempts) {
          console.warn(`⏱️ Submission polling timeout after ${maxAttempts} attempts - Last status: ${submission.status}`);
          clearInterval(poll);
          setIsSubmitting(false);
          
          // If still pending after timeout, show error but keep the result visible
          if (submission.status === "PENDING" || submission.status === "RUNNING") {
            setSubmitError("⚠️ Execution is taking longer than expected. The backend might be processing your submission.");
            // Update with timeout status
            onSubmissionResult({
              ...submission,
              feedback: "Execution timeout - Backend is still processing or there may be an issue."
            });
          }
        }
      } catch (error: any) {
        console.error("Error polling submission:", error);
        
        // If it's a 401 error, the interceptor will handle logout
        // For other errors, just stop polling
        if (error.response?.status === 401) {
          console.warn('⚠️ Authentication error during polling - stopping');
          clearInterval(poll);
          setIsSubmitting(false);
          setSubmitError('Authentication error. Please refresh and try again.');
        } else {
          // For other errors, continue polling a few more times
          if (attempts < maxAttempts - 5) {
            console.warn('⚠️ Polling error, will retry...');
          } else {
            clearInterval(poll);
            setIsSubmitting(false);
            setSubmitError('Failed to fetch results. Please try again.');
          }
        }
      }
    }, 1000);
  };

  const getMonacoLanguage = (lang: SupportedLanguage) => {
    const map: Record<SupportedLanguage, string> = { python: "python", cpp: "cpp", java: "java" };
    return map[lang] || "python";
  };

  const headerBgClass = "bg-[hsl(var(--color-bg-secondary)/1.1)]";
  const hoverBgClass = "hover:bg-[hsl(var(--color-border)/0.5)]";

  return (
    // ADDED BORDER to main panel
    <div className="flex flex-col h-full bg-theme-secondary rounded-lg overflow-hidden border border-theme">
      <div className={`flex items-center justify-between ${headerBgClass} px-4 py-2.5 border-b border-theme`}>
        <div className="flex items-center space-x-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-theme-primary border border-theme rounded-lg px-3 py-2 text-sm text-theme-primary focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-accent))] transition-colors"
          >
            <option value="python">Python3</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>

          <button
            onClick={handleRun}
            disabled={isRunning || isContestOver}
            data-action="run"
            className={`flex items-center text-white text-sm px-4 py-2 rounded-lg transition-all ${
              isRunning || isContestOver
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
            title={isContestOver ? "Contest has ended" : ""}
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Running...
              </>
            ) : (
              <>
                <Play size={14} className="mr-2" />
                {isContestOver ? "Contest Over" : "Run"}
              </>
            )}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isContestOver}
            data-action="submit"
            className={`flex items-center text-white text-sm px-4 py-2 rounded-lg transition-all ${
              isSubmitting || isContestOver
                ? "bg-green-700 cursor-not-allowed opacity-50"
                : "bg-green-600 hover:bg-green-700"
            }`}
            title={isContestOver ? "Contest has ended" : ""}
          >
            <Send size={14} className="mr-2" />
            {isContestOver ? "Contest Over" : isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          {submitError && (
            <div className="text-xs text-red-400 max-w-xs truncate mr-2" title={submitError}>
              {submitError}
            </div>
          )}
          <button
            onClick={onToggleBottom}
            className={`p-2 ${hoverBgClass} rounded-lg text-theme-secondary-text hover:text-theme-primary transition-all`}
            title={isBottomCollapsed ? "Show testcases" : "Hide testcases"}
          >
            {isBottomCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          <button
            onClick={onFullscreen}
            className={`p-2 ${hoverBgClass} rounded-lg text-theme-secondary-text hover:text-theme-primary transition-all`}
            title="Fullscreen"
          >
            <Maximize2 size={18} />
          </button>
          <button className={`p-2 ${hoverBgClass} rounded-lg text-theme-secondary-text hover:text-theme-primary transition-all`}>
            <Settings size={18} />
          </button>
          <button
            onClick={() => setCode(CODE_TEMPLATES[language])}
            className={`p-2 ${hoverBgClass} rounded-lg text-theme-secondary-text hover:text-theme-primary transition-all`}
            title="Reset code"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Monaco editor itself handles its scrollbars, but wrapping it in a container helps */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            autoIndent: "full",

            // 🧹 Clean visual settings
            renderWhitespace: "none",
            renderControlCharacters: false,

            // Remove indentation guides
            guides: {
              indentation: false,
              bracketPairs: false, // This removes the bracket pair guides
            },
          }}
        />
      </div>
    </div>
  );
};

// ------------------------ Test Cases Panel ------------------------
interface TestCasesPanelProps {
  problem: ProblemData;
  onFullscreen: () => void;
  submissionResult: SubmissionResponse | null;
  isRunning?: boolean;
  isSubmitting?: boolean;
  liveProgress?: {
    status: string;
    message: string;
    testNumber?: number;
    totalTests?: number;
    passedTests?: number;
  } | null;
  contestId?: string;
}

const TestCasesPanel = ({ problem, onFullscreen, submissionResult, isRunning = false, isSubmitting = false, liveProgress = null, contestId }: TestCasesPanelProps) => {
  const isPracticeMode = !contestId;
  const [activeTab, setActiveTab] = useState("testcases");
  
  const [showCode, setShowCode] = useState(false);
  
  // Parse AI feedback sections
  const parseFeedback = (feedback: string) => {
    if (!feedback) return null;
    
    const sections = {
      timeComplexity: '',
      spaceComplexity: '',
      codeQuality: '',
      fixes: ''
    };
    
    // Extract sections based on numbered headings
    const timeMatch = feedback.match(/3\)\s*Time Complexity[\s\S]*?(?=4\)|$)/);
    const spaceMatch = feedback.match(/4\)\s*Space Complexity[\s\S]*?(?=5\)|$)/);
    const qualityMatch = feedback.match(/5\)\s*Code Quality & Style[\s\S]*?(?=6\)|$)/);
    const fixesMatch = feedback.match(/6\)\s*Fixes([\s\S]*?)(?=7\)|Changes:|$)/);
    
    if (timeMatch) sections.timeComplexity = timeMatch[0].replace(/3\)\s*Time Complexity\s*-?\s*/i, '').trim();
    if (spaceMatch) sections.spaceComplexity = spaceMatch[0].replace(/4\)\s*Space Complexity\s*-?\s*/i, '').trim();
    if (qualityMatch) sections.codeQuality = qualityMatch[0].replace(/5\)\s*Code Quality & Style\s*-?\s*/i, '').trim();
    if (fixesMatch) sections.fixes = fixesMatch[1].trim();
    
    return sections;
  };
  
  // Format code blocks from fixes section
  const formatCodeBlock = (code: string) => {
    if (!code) return null;
    const codeMatch = code.match(/```([\s\S]*?)```/);
    if (!codeMatch) return null;
    
    const codeContent = codeMatch[1].trim();
    const lines = codeContent.split('\n');
    const lang = lines[0].match(/^(python|javascript|java|cpp|c)$/i) ? lines.shift() : 'python';
    
    return (
      <div className="rounded-lg overflow-hidden border-2 border-purple-500/30 shadow-lg">
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-4 py-2 border-b border-purple-500/30 flex items-center justify-between">
          <span className="text-xs font-bold text-purple-300">{(lang || 'PYTHON').toUpperCase()} - Fixed Solution</span>
          <Code size={14} className="text-purple-400" />
        </div>
        <pre className="bg-gray-900 p-5 overflow-x-auto max-h-96">
          <code className="text-sm text-green-300 font-mono leading-relaxed">{lines.join('\n')}</code>
        </pre>
      </div>
    );
  };
  
  // Auto-switch to result tab when running/submitting or when liveProgress appears
  useEffect(() => {
    if (isRunning || isSubmitting || liveProgress) {
      setActiveTab("result");
    }
  }, [isRunning, isSubmitting, liveProgress]);
  const [customInput, setCustomInput] = useState("");

  const allTestCases = problem.testcases || [];
  const visibleTestCases = allTestCases.filter((tc) => !tc.isHidden);
  const hiddenTestCasesCount = allTestCases.length - visibleTestCases.length;

  const detailedResults = useMemo(() => submissionResult?.testResults || [], [submissionResult]);
  const totalPassed = submissionResult?.passedTests ?? detailedResults.filter((t) => t.status === "PASSED").length;
  const totalTests = submissionResult?.totalTests ?? (detailedResults.length || undefined);

  const headerBgClass = "bg-[hsl(var(--color-bg-secondary)/1.1)]";
  const hoverBgClass = "hover:bg-[hsl(var(--color-border)/0.5)]";
  const innerBgClass = "bg-[hsl(var(--color-bg-secondary)/1.1)]";

  return (
    // ADDED BORDER to main panel
    <div className="flex flex-col h-full bg-theme-secondary rounded-lg overflow-hidden border border-theme">
      <div className={`flex items-center justify-between border-b border-theme ${headerBgClass}`}>
        <div className="flex">
          <button
            onClick={() => setActiveTab("testcases")}
            className={`px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "testcases"
                ? "border-b-2 border-theme-accent text-theme-accent"
                : "text-theme-secondary-text hover:text-theme-primary"
            }`}
          >
            Testcases
          </button>
          <button
            onClick={() => setActiveTab("result")}
            className={`px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "result"
                ? "border-b-2 border-theme-accent text-theme-accent"
                : "text-theme-secondary-text hover:text-theme-primary"
            }`}
          >
            Test Result
          </button>
          {isPracticeMode && submissionResult && (submissionResult as any).feedback && (
            <button
              onClick={() => setActiveTab("aifeedback")}
              className={`px-4 py-2.5 text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === "aifeedback"
                  ? "border-b-2 border-cyan-500 text-cyan-400"
                  : "text-theme-secondary-text hover:text-theme-primary"
              }`}
            >
              <Brain size={16} />
              AI Feedback
            </button>
          )}
        </div>
        <button
          onClick={onFullscreen}
          className={`p-2 mr-2 ${hoverBgClass} rounded-lg text-theme-secondary-text hover:text-theme-primary transition-all`}
          title="Fullscreen"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Added hide-scrollbar class here to enable section scrolling */}
      <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
        {activeTab === "aifeedback" ? (
          <div className="space-y-5">
            <div className="rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5 shadow-lg">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-5 border-b border-purple-500/30">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                    <Lightbulb size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-theme-primary flex items-center gap-2">
                      AI-Powered Feedback
                      <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded-full shadow font-bold">Practice Mode</span>
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Feedback Content */}
              <div className="p-6 space-y-6">
                {(() => {
                  const sections = parseFeedback((submissionResult as any).feedback);
                  if (!sections) return <p className="text-theme-secondary">No feedback available</p>;
                  
                  return (
                    <>
                      {/* Time Complexity */}
                      {sections.timeComplexity && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                            <Clock size={16} />
                            <span>TIME COMPLEXITY</span>
                          </div>
                          <div className="bg-theme-secondary rounded-lg p-4 border border-theme text-theme-primary text-sm leading-relaxed">
                            {sections.timeComplexity}
                          </div>
                        </div>
                      )}
                      
                      {/* Space Complexity */}
                      {sections.spaceComplexity && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                            <Database size={16} />
                            <span>SPACE COMPLEXITY</span>
                          </div>
                          <div className="bg-theme-secondary rounded-lg p-4 border border-theme text-theme-primary text-sm leading-relaxed">
                            {sections.spaceComplexity}
                          </div>
                        </div>
                      )}
                      
                      {/* Code Quality */}
                      {sections.codeQuality && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                            <CheckCircle size={16} />
                            <span>CODE QUALITY & STYLE</span>
                          </div>
                          <div className="bg-theme-secondary rounded-lg p-4 border border-theme text-theme-primary text-sm">
                            <ul className="space-y-1.5 list-none">
                              {sections.codeQuality.split('\n').filter(line => line.trim().startsWith('-')).map((line, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-violet-400 mt-1">•</span>
                                  <span className="flex-1">{line.replace(/^-\s*/, '')}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      {/* Fixes - Hidden behind warning */}
                      {sections.fixes && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                            <Code size={16} />
                            <span>SOLUTION CODE</span>
                          </div>
                          
                          {!showCode ? (
                            <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-5">
                              <div className="flex items-start gap-3 mb-4">
                                <AlertTriangle size={24} className="text-yellow-400 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                  <h4 className="font-bold text-yellow-400 mb-2">Try solving it yourself first!</h4>
                                  <p className="text-theme-primary text-sm leading-relaxed mb-3">
                                    Viewing the solution too early can hurt your learning. We recommend:
                                  </p>
                                  <ul className="text-sm text-theme-primary space-y-1 mb-4 list-disc list-inside">
                                    <li>Review the complexity analysis above</li>
                                    <li>Check the code quality suggestions</li>
                                    <li>Try implementing the fix yourself</li>
                                    <li>Only view solution if you're completely stuck</li>
                                  </ul>
                                  <button
                                    onClick={() => setShowCode(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
                                  >
                                    <Eye size={16} />
                                    I understand, show me the solution
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-sm text-green-400">
                                  <CheckCircle size={16} />
                                  <span className="font-medium">Solution revealed - Study it carefully!</span>
                                </div>
                                <button
                                  onClick={() => setShowCode(false)}
                                  className="text-xs text-theme-secondary hover:text-theme-primary transition-colors"
                                >
                                  Hide
                                </button>
                              </div>
                              {formatCodeBlock(sections.fixes)}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
              
              {/* Footer */}
              <div className="bg-purple-500/10 border-t border-purple-500/30 p-4">
                <div className="text-xs text-theme-primary flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  <span><strong>Practice Mode Only:</strong> Use AI feedback to learn and improve. Contest mode tests your real skills!</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "testcases" ? (
          <div className="space-y-4">

            {/* HIDDEN TEST CASES SECTION */}
            {hiddenTestCasesCount > 0 && (
              <div className="bg-[hsl(var(--color-border)/0.3)] rounded-lg p-3 border border-theme text-sm text-theme-secondary-text">
                <span className="font-semibold text-theme-primary">{hiddenTestCasesCount}</span> additional test cases (private) will be run upon submission.
              </div>
            )}

            {/* All visible test cases are shown here */}
            {visibleTestCases.map((testcase, index) => (
              <div key={testcase.id || index} className={`${innerBgClass} rounded-lg p-5 border border-theme`}>
                <div className="text-sm font-medium text-theme-secondary-text mb-3">
                  Case {index + 1}
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-theme-secondary-text opacity-70 mb-2">Input:</div>
                    {/* Minimal styling for input/output blocks */}
                    <div className="text-sm text-theme-primary whitespace-pre-wrap font-mono p-3 rounded bg-theme-primary/50">
                      {testcase.input}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-theme-secondary-text opacity-70 mb-2">Expected Output:</div>
                    {/* Minimal styling for input/output blocks */}
                    <div className="text-sm text-theme-primary whitespace-pre-wrap font-mono p-3 rounded bg-theme-primary/50">
                      {testcase.expectedOutput}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className={`${innerBgClass} rounded-lg p-5 border border-theme`}>
              <div className="text-sm font-medium text-theme-secondary-text mb-3">Custom Input</div>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom test input..."
                className="w-full h-32 bg-theme-primary text-theme-primary p-4 rounded-lg text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-accent))] border border-theme"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Show live progress with WebSocket data */}
            {liveProgress ? (
              <div className="space-y-4">
                {/* Live Progress Header */}
                <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-blue-500/30 rounded-full"></div>
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-300">{liveProgress.status}</h3>
                        <p className="text-sm text-blue-200">{liveProgress.message}</p>
                      </div>
                    </div>
                    {liveProgress.totalTests && liveProgress.totalTests > 0 && (
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-300">
                          {liveProgress.passedTests} / {liveProgress.totalTests}
                        </div>
                        <div className="text-xs text-blue-400">Tests Passed</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  {liveProgress.totalTests && liveProgress.totalTests > 0 && (
                    <div className="space-y-2">
                      <div className="w-full bg-blue-950 rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                          style={{ 
                            width: `${Math.max(5, ((liveProgress.passedTests || 0) / liveProgress.totalTests) * 100)}%` 
                          }}
                        >
                          <span className="text-[10px] font-bold text-white">
                            {Math.round(((liveProgress.passedTests || 0) / liveProgress.totalTests) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Current Test Indicator */}
                  {liveProgress.testNumber && (
                    <div className="mt-4 flex items-center space-x-2 text-blue-300">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        Currently testing case #{liveProgress.testNumber}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Status Message */}
                <div className="bg-theme-secondary/50 border border-theme rounded-lg p-4 text-center">
                  <p className="text-theme-secondary-text text-sm">
                    💡 Your code is being executed in a secure sandbox environment
                  </p>
                </div>
              </div>
            ) : (isRunning || isSubmitting) && !submissionResult ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-500/30 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <div className="text-center">
                  <p className="text-theme-primary font-semibold text-lg mb-1">
                    {isSubmitting ? '🚀 Submitting your code...' : '⚡ Running test cases...'}
                  </p>
                  <p className="text-theme-secondary-text text-sm">
                    Please wait while we execute your code
                  </p>
                </div>
              </div>
            ) : submissionResult ? (
              <div className="space-y-5">
                {/* Verdict Summary */}
                <div className={`${innerBgClass} rounded-lg p-5 border border-theme space-y-4`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-widest text-theme-secondary-text">
                          Overall verdict
                        </span>
                        <span
                          className={`text-2xl font-bold ${
                            submissionResult.status === "AC" || submissionResult.status === "ACCEPTED"
                              ? "text-green-400"
                              : submissionResult.status === "WA" || submissionResult.status === "WRONG_ANSWER"
                              ? "text-red-400"
                              : submissionResult.status === "TLE" || submissionResult.status === "TIME_LIMIT_EXCEEDED"
                              ? "text-yellow-400"
                              : submissionResult.status === "PENDING"
                              ? "text-blue-400"
                              : submissionResult.status === "RUNNING"
                              ? "text-purple-400"
                              : "text-orange-400"
                          }`}
                        >
                          {submissionResult.verdict || submissionResult.status}
                        </span>
                        {(submissionResult.status === "PENDING" || submissionResult.status === "RUNNING") && (
                          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                      {submissionResult.output && (
                        <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-theme bg-theme-primary/50 p-3 text-xs text-theme-primary font-mono">
                          {submissionResult.output}
                        </pre>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 min-w-[220px]">
                      <div className="flex items-center gap-3 rounded-lg border border-theme bg-theme-primary/60 px-3 py-2">
                        <CheckCircle2 className="text-green-400" size={18} />
                        <div>
                          <div className="text-xs text-theme-secondary-text">Passed</div>
                          <div className="text-sm font-semibold text-theme-primary">
                            {totalPassed ?? "-"} / {totalTests ?? "-"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-theme bg-theme-primary/60 px-3 py-2">
                        <Timer className="text-blue-400" size={18} />
                        <div>
                          <div className="text-xs text-theme-secondary-text">Exec Time</div>
                          <div className="text-sm font-semibold text-theme-primary">
                            {submissionResult.executionTime ?? "-"}ms
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-theme bg-theme-primary/60 px-3 py-2">
                        <Activity className="text-purple-400" size={18} />
                        <div>
                          <div className="text-xs text-theme-secondary-text">Memory</div>
                          <div className="text-sm font-semibold text-theme-primary">
                            {submissionResult.memoryUsed ?? submissionResult.memory ?? "-"}
                            {submissionResult.memoryUsed || submissionResult.memory ? " MB" : ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-theme bg-theme-primary/60 px-3 py-2">
                        <Trophy className="text-amber-400" size={18} />
                        <div>
                          <div className="text-xs text-theme-secondary-text">Points</div>
                          <div className="text-sm font-semibold text-theme-primary">
                            {submissionResult.points ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed test case results */}
                {detailedResults.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-theme-secondary-text">
                        <BarChart2 size={16} className="text-[hsl(var(--color-accent))]" />
                        Detailed Test Breakdown
                      </div>
                    </div>
                    <div className="text-xs text-theme-secondary-text">
                      Execution time shows total runtime per testcase (ms)
                    </div>
                    <div className="space-y-3">
                      {detailedResults.map((result) => {
                        const statusColor =
                          result.status === "PASSED"
                            ? "bg-green-500/10 text-green-300 border-green-500/40"
                            : result.status === "FAILED"
                            ? "bg-red-500/10 text-red-300 border-red-500/40"
                            : result.status === "RUNTIME_ERROR"
                            ? "bg-orange-500/10 text-orange-300 border-orange-500/40"
                            : "bg-yellow-500/10 text-yellow-300 border-yellow-500/40";

                        // Check if this is a hidden test case
                        const isHidden = (result as any).isHidden === true;

                        return (
                          <div key={result.testNumber} className="rounded-xl border border-theme bg-theme-secondary/60 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-theme-primary/70 text-theme-primary font-semibold">
                                  #{result.testNumber}
                                </div>
                                {isHidden && (
                                  <Lock size={16} className="text-gray-400" />
                                )}
                                <div className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusColor}`}>
                                  {result.status.replace(/_/g, " ")}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-theme-secondary-text">
                                <Gauge size={14} />
                                {result.executionTime} ms
                              </div>
                            </div>
                            
                            {isHidden ? (
                              // Hidden test case - only show status
                              <div className="mt-4 p-4 bg-theme-primary/30 rounded-lg border-2 border-dashed border-gray-600">
                                <div className="flex items-center justify-center space-x-3 text-gray-400">
                                  <Lock size={20} />
                                  <div className="text-center">
                                    <p className="font-semibold">Hidden Test Case</p>
                                    <p className="text-xs mt-1">Input and output details are not visible</p>
                                    <p className="text-sm mt-2">
                                      Result: <span className={`font-bold ${
                                        result.status === "PASSED" ? "text-green-400" : "text-red-400"
                                      }`}>
                                        {result.status === "PASSED" ? "✓ PASSED" : "✗ FAILED"}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              // Visible test case - show full details
                              <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs font-semibold text-theme-secondary-text uppercase">
                                    <FileCode2 size={14} /> Input
                                  </div>
                                  <pre className="whitespace-pre-wrap rounded-lg border border-theme bg-theme-primary/50 p-3 text-xs text-theme-primary font-mono">
                                    {result.input}
                                  </pre>
                                </div>
                                <div className="space-y-3">
                                  <div className="space-y-2">
                                    <div>
                                      <div className="text-xs font-semibold text-theme-secondary-text uppercase">Expected</div>
                                      <pre className="whitespace-pre-wrap rounded-lg border border-theme bg-theme-primary/50 p-3 text-xs text-theme-primary font-mono">
                                        {result.expectedOutput}
                                      </pre>
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold text-theme-secondary-text uppercase">Actual Output</div>
                                      <pre className="whitespace-pre-wrap rounded-lg border border-theme bg-theme-primary/50 p-3 text-xs text-theme-primary font-mono">
                                        {result.actualOutput ?? "(no output)"}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {!isHidden && result.errorMessage && (
                              <div className="mt-3 space-y-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                                <div className="flex items-center gap-2 font-semibold uppercase tracking-wide">
                                  <AlertTriangle size={14} />
                                  Stack Trace / Error Details
                                </div>
                                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-red-200/90">
                                  {result.errorMessage}
                                </pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-theme bg-theme-secondary/60 p-4 text-sm text-theme-secondary-text">
                    Detailed test results will appear here when available.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-theme-secondary-text py-12">
                <Terminal size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">Run your code to see results</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ------------------------ Main Problem Page ------------------------
const ProblemPage = () => {
  const { id, contestId, problemId } = useParams();
  const navigate = useNavigate();
  // Use problemId if available (from contest route), otherwise use id (from standalone problem route)
  const activeProblemId = problemId || id;
  
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leftWidth, setLeftWidth] = useState(40);
  const [rightTopHeight, setRightTopHeight] = useState(60);
  const [fullscreenPanel, setFullscreenPanel] = useState<string | null>(null);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const wsRef = useRef<Socket | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>("python");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveProgress, setLiveProgress] = useState<{
    status: string;
    message: string;
    testNumber?: number;
    totalTests?: number;
    passedTests?: number;
  } | null>(null);
  
  // Contest state
  const [contest, setContest] = useState<any>(null);
  const [problems, setProblems] = useState<ProblemData[]>([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [isContestOver, setIsContestOver] = useState(false);
  const [showContestOverModal, setShowContestOverModal] = useState(false);
  const [isPageFullscreen, setIsPageFullscreen] = useState(false);

  // Auto-enter fullscreen when contest page loads
  useEffect(() => {
    if (contestId) {
      // Request fullscreen after a short delay to ensure page is loaded
      const timer = setTimeout(() => {
        document.documentElement.requestFullscreen?.().catch((err) => {
          console.log("Fullscreen request failed:", err);
        });
        setIsPageFullscreen(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [contestId]);
  
  // Fetch contest data if contestId is provided
  useEffect(() => {
    if (!contestId) return;
    
    // Ensure we have a token before making the request
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No auth token found, skipping contest fetch');
      return;
    }
    
    contestService
      .getContestById(contestId)
      .then((res) => {
        setContest(res.data);
        const contestProblems = res.data.contestProblems || [];
        const problemList = contestProblems.map((cp: any) => cp.problem || cp);
        setProblems(problemList);
        
        // Find current problem index
        if (activeProblemId) {
          const index = problemList.findIndex((p: any) => p.id === activeProblemId);
          if (index !== -1) {
            setCurrentProblemIndex(index);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch contest:", err);
      });
  }, [contestId, activeProblemId]);

  // Fetch problem data
  useEffect(() => {
    if (!activeProblemId) return;
    
    // Ensure we have a token before making the request
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No auth token found, skipping problem fetch');
      setLoading(false);
      return;
    }
    
    contestService
      .getProblem(activeProblemId)
      .then((res) => {
        setProblem(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch problem:", err);
        setLoading(false);
      });
  }, [activeProblemId]);

  // WebSocket connection for real-time updates (optional - only if backend is running)
useEffect(() => {
  console.log('🔌 Initializing Socket.IO connection...');
  
  const token = localStorage.getItem('token');

  const socketConnection = io(
    import.meta.env.SUBMISSION_SERVICE_URL || 'http://quantum-judge-alb-dev-233767472.us-east-1.elb.amazonaws.com:5000',
    {
      transports: ['websocket', 'polling'],
      auth: token ? { token: `Bearer ${token}` } : undefined,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    }
  );

  socketConnection.on('connect', () => {
    console.log('🟢 Socket.IO connected:', socketConnection.id);
  });

  socketConnection.on('disconnect', (reason) => {
    console.log('🔴 Socket.IO disconnected:', reason);
  });

  socketConnection.on('connect_error', (error) => {
    console.log('⚠️ Connection error:', error.message);
  });

  setSocket(socketConnection);
  wsRef.current = socketConnection;

  return () => {
    socketConnection.disconnect();
  };
}, []); // Run once on mount
  const handleHorizontalResize = useCallback((clientX: number) => {
    const newWidth = (clientX / window.innerWidth) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftWidth(newWidth);
    }
  }, []);

  const handleVerticalResize = useCallback((clientY: number) => {
    const container = document.getElementById("right-panel");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newHeight = ((clientY - rect.top) / rect.height) * 100;
    if (newHeight > 20 && newHeight < 80) {
      setRightTopHeight(newHeight);
    }
  }, []);

  const handleResetLayout = () => {
    setLeftWidth(40);
    setRightTopHeight(60);
    setFullscreenPanel(null);
    setIsBottomCollapsed(false);
  };

  const handleToggleBottom = () => {
    setIsBottomCollapsed(!isBottomCollapsed);
  };

  const handleSubmissionResult = (result: SubmissionResponse) => {
    console.log("🧾 Submission result received:", result);
    setSubmissionResult(result);
    // Automatically show the test result tab
    if (isBottomCollapsed) {
      setIsBottomCollapsed(false);
    }
  };
const handleSubmitWithRealtime = async (submissionData: SubmissionCreate) => {
  if (!wsRef.current || !wsRef.current.connected) {
    throw new Error('Socket not connected. Please refresh the page.');
  }

  try {
    // Create submission via API
    const response = await submissionService.createSubmission(submissionData);
    const submissionId = response.data.id;
    
    console.log('📤 Submission ID:', submissionId);
    console.log('👂 Listening on:', `submission:${submissionId}`);

    return submissionId;
  } catch (error) {
    console.error('❌ Submission failed:', error);
    throw error;
  }
};
  const hoverBgClass = "hover:bg-[hsl(var(--color-border)/0.5)]";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-primary">
        <div className="text-lg font-medium text-theme-secondary-text">Loading...</div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-primary">
        <div className="text-lg font-medium text-red-500">Problem not found</div>
      </div>
    );
  }

  if (fullscreenPanel) {
    return (
      <div className="flex flex-col h-screen bg-theme-primary overflow-hidden">
        <ScrollbarStyles />
        <div className="flex items-center justify-between px-4 py-3 bg-theme-secondary border-b border-theme">
          <div className="text-theme-primary font-medium">
            {fullscreenPanel === "description" && "Problem Description"}
            {fullscreenPanel === "editor" && "Code Editor"}
            {fullscreenPanel === "testcases" && "Test Cases"}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleResetLayout}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-all"
            >
              <RotateCcw size={14} />
              <span>Reset Layout</span>
            </button>
            <button
              onClick={() => setFullscreenPanel(null)}
              className={`p-2 ${hoverBgClass} rounded-lg text-theme-secondary-text hover:text-theme-primary transition-all`}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden p-2">
          {fullscreenPanel === "description" && <DescriptionPanel problem={problem} onFullscreen={() => setFullscreenPanel(null)} contestId={contestId} submissionResult={submissionResult} />}
          {fullscreenPanel === "editor" && <CodeEditorPanel problem={problem} onFullscreen={() => setFullscreenPanel(null)} isBottomCollapsed={false} onToggleBottom={() => {}} onSubmissionResult={handleSubmissionResult} contestId={contestId} language={language} setLanguage={setLanguage} socket={socket} onSubmitWithRealtime={handleSubmitWithRealtime} isRunning={isRunning} setIsRunning={setIsRunning} isSubmitting={isSubmitting} setIsSubmitting={setIsSubmitting} liveProgress={liveProgress} setLiveProgress={setLiveProgress} isContestOver={isContestOver} />}
          {fullscreenPanel === "testcases" && <TestCasesPanel problem={problem} onFullscreen={() => setFullscreenPanel(null)} submissionResult={submissionResult} isRunning={isRunning} isSubmitting={isSubmitting} liveProgress={liveProgress} contestId={contestId} />}
        </div>
      </div>
    );
  }

  // Navigate to previous/next problem
  const navigateToProblem = (direction: 'prev' | 'next') => {
    if (!contestId || problems.length === 0) return;
    
    let newIndex = currentProblemIndex;
    if (direction === 'prev' && currentProblemIndex > 0) {
      newIndex = currentProblemIndex - 1;
    } else if (direction === 'next' && currentProblemIndex < problems.length - 1) {
      newIndex = currentProblemIndex + 1;
    }
    
    if (newIndex !== currentProblemIndex) {
      const newProblem = problems[newIndex];
      setCurrentProblemIndex(newIndex);
      navigate(`/contest/${contestId}/problem/${newProblem.id}`);
    }
  };
  
  const handleContestEnd = () => {
    setIsContestOver(true);
    setShowContestOverModal(true);
  };
  
  const togglePageFullscreen = () => {
    if (!isPageFullscreen) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.log("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.log("Exit fullscreen failed:", err);
      });
    }
    setIsPageFullscreen(!isPageFullscreen);
  };

  // Contest Over Modal Component
  const ContestOverModal = () => {
    if (!showContestOverModal) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="bg-theme-secondary border-4 border-red-500 rounded-2xl p-10 max-w-2xl w-full mx-4 shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Clock size={64} className="text-red-400" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping"></div>
              </div>
            </div>
            
            {/* Title */}
            <h2 className="text-5xl font-bold text-red-400">
              Contest Over!
            </h2>
            
            {/* Message */}
            <p className="text-xl text-theme-secondary-text leading-relaxed">
              The contest has ended. You can no longer submit solutions.
              <br />
              Thank you for participating!
            </p>
            
            {/* Stats if available */}
            {contest && (
              <div className="bg-theme-primary/50 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-theme-primary mb-3">Contest Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-theme-secondary-text">Contest:</span>
                    <p className="text-theme-primary font-medium">{contest.title}</p>
                  </div>
                  <div>
                    <span className="text-theme-secondary-text">Problems:</span>
                    <p className="text-theme-primary font-medium">{problems.length}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Buttons */}
            <div className="flex gap-4 justify-center mt-8">
              <button
                onClick={() => navigate(`/contest/${contestId}/leaderboard`)}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg"
              >
                View Leaderboard
              </button>
              <button
                onClick={() => setShowContestOverModal(false)}
                className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Continue Viewing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    // Main container set to h-screen and overflow-hidden to prevent global scroll
    <div className="flex flex-col h-screen bg-theme-primary overflow-hidden">
      <ScrollbarStyles />
      <div className="flex items-center justify-between px-4 py-2.5 bg-theme-secondary border-b border-theme">
        {/* Left Section - Problem Navigation */}
        <div className="flex items-center space-x-3">
          {contestId && (
            <button
              onClick={() => navigate(`/contest/${contestId}`)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[hsl(var(--color-accent)/0.1)] border-2 border-[hsl(var(--color-accent))] text-[hsl(var(--color-accent))] hover:bg-[hsl(var(--color-accent)/0.2)] transition-all font-medium"
              title="Back to Contest Details"
            >
              <ChevronLeft size={18} />
              <span className="text-sm">Back</span>
            </button>
          )}
          {contestId && problems.length > 0 && (
            <>
              <button
                onClick={() => navigateToProblem('prev')}
                disabled={currentProblemIndex === 0 || isContestOver}
                className={`p-2 rounded-lg transition-all ${
                  currentProblemIndex === 0 || isContestOver
                    ? 'opacity-50 cursor-not-allowed text-gray-500'
                    : 'hover:bg-[hsl(var(--color-border)/0.5)] text-theme-secondary-text hover:text-theme-primary'
                }`}
                title="Previous Problem"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex items-center space-x-2 px-3 py-1 bg-theme-primary rounded-lg border border-theme">
                <List size={14} className="text-theme-accent" />
                <span className="text-sm font-medium text-theme-primary">
                  Problem {currentProblemIndex + 1} / {problems.length}
                </span>
              </div>
              
              <button
                onClick={() => navigateToProblem('next')}
                disabled={currentProblemIndex === problems.length - 1 || isContestOver}
                className={`p-2 rounded-lg transition-all ${
                  currentProblemIndex === problems.length - 1 || isContestOver
                    ? 'opacity-50 cursor-not-allowed text-gray-500'
                    : 'hover:bg-[hsl(var(--color-border)/0.5)] text-theme-secondary-text hover:text-theme-primary'
                }`}
                title="Next Problem"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* Center Section - Timer */}
        <div className="flex items-center">
          {contest?.endTime && contest?.startTime ? (
            <TimerBox 
              startTime={contest.startTime} 
              endTime={contest.endTime} 
              durationMinutes={contest.durationMinutes}
              onContestEnd={handleContestEnd} 
            />
          ) : (
            <div className="flex items-center space-x-3">
              <Clock size={18} className="text-theme-secondary-text" />
              <span className="text-sm text-theme-secondary-text">Practice Mode</span>
            </div>
          )}
        </div>

        {/* Right Section - Reset & Fullscreen */}
        <div className="flex items-center space-x-3">
          <button
            onClick={togglePageFullscreen}
            className="p-2 hover:bg-[hsl(var(--color-border)/0.5)] rounded-lg text-theme-secondary-text hover:text-theme-primary transition-all"
            title={isPageFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={handleResetLayout}
            className="p-2 hover:bg-[hsl(var(--color-border)/0.5)] rounded-lg text-theme-secondary-text hover:text-theme-primary transition-all"
            title="Reset Layout"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div id="contest-content-area" className="flex flex-1 overflow-hidden p-2 gap-0">
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col">
          <DescriptionPanel problem={problem} onFullscreen={() => setFullscreenPanel("description")} contestId={contestId} submissionResult={submissionResult} />
        </div>

        <ResizableDivider onResize={handleHorizontalResize} direction="horizontal" />

        <div id="right-panel" style={{ width: `${100 - leftWidth}%` }} className="flex flex-col gap-0">
          <div style={{ height: isBottomCollapsed ? "100%" : `${rightTopHeight}%` }} className="flex flex-col">
            <CodeEditorPanel
              problem={problem}
              onFullscreen={() => setFullscreenPanel("editor")}
              isBottomCollapsed={isBottomCollapsed}
              onToggleBottom={handleToggleBottom}
              onSubmissionResult={handleSubmissionResult}
              contestId={contestId}
              language={language}
              setLanguage={setLanguage}
              socket={socket}
              onSubmitWithRealtime={handleSubmitWithRealtime}
              isRunning={isRunning}
              setIsRunning={setIsRunning}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              liveProgress={liveProgress}
              setLiveProgress={setLiveProgress}
              isContestOver={isContestOver}
            />
          </div>

          {!isBottomCollapsed && (
            <>
              <ResizableDivider onResize={handleVerticalResize} direction="vertical" />
              <div style={{ height: `${100 - rightTopHeight}%` }} className="flex flex-col">
                <TestCasesPanel problem={problem} onFullscreen={() => setFullscreenPanel("testcases")} submissionResult={submissionResult} isRunning={isRunning} isSubmitting={isSubmitting} liveProgress={liveProgress} contestId={contestId} />
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Contest Over Modal */}
      <ContestOverModal />
    </div>
  );
};

export default ProblemPage;
