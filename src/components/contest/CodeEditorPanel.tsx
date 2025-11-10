import React, { useState, useEffect } from "react";
import { Maximize2, Play, Send, ChevronDown, ChevronUp } from "lucide-react";
import Editor from "@monaco-editor/react";
import type { ProblemData } from "../../api/contestService";
import { submissionService, type SubmissionResponse, type SubmissionCreate } from "../../api/submissionService";

interface CodeEditorPanelProps {
  problem: ProblemData;
  onFullscreen: () => void;
  isBottomCollapsed: boolean;
  onToggleBottom: () => void;
  onSubmissionResult: (result: SubmissionResponse) => void;
  contestId?: string;
  language: string;
  setLanguage: (lang: string) => void;
}

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({ 
  problem, 
  onFullscreen, 
  isBottomCollapsed, 
  onToggleBottom, 
  onSubmissionResult, 
  contestId, 
  language, 
  setLanguage 
}) => {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const codeTemplates: Record<string, string> = {
    python: `def solve():\n    # Read input\n    s = input().strip()\n    k = int(input().strip())\n    \n    # Your code here\n    \n    # Print output\n    print(result)`,
    cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    int k;\n    cin >> s >> k;\n    \n    // Your code here\n    \n    cout << result << endl;\n    return 0;\n}`,
    java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.nextLine();\n        int k = sc.nextInt();\n        \n        // Your code here\n        \n        System.out.println(result);\n    }\n}`,
  };

  useEffect(() => {
    setCode(codeTemplates[language] || codeTemplates.python);
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

    try {
      const submissionData: SubmissionCreate = {
        problemId: problem.id,
        language: language,
        code: code,
        contestId: contestId || 'standalone',
      };

      const response = await submissionService.createSubmission(submissionData);
      console.log("Submission created:", response.data);

      if (response.data.id) {
        pollSubmissionStatus(response.data.id);
      }
    } catch (error: any) {
      console.error("Submission failed:", error);
      if (error.response?.status === 401) {
        setSubmitError('Authentication failed. Please refresh the page and try again.');
      } else {
        setSubmitError(error.response?.data?.message || "Failed to submit code");
      }
      setIsSubmitting(false);
    }
  };

  const pollSubmissionStatus = async (submissionId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      try {
        const response = await submissionService.getSubmissionById(submissionId, true);
        const submission = response.data;

        if (submission.status !== "PENDING" && submission.status !== "RUNNING") {
          clearInterval(poll);
          setIsSubmitting(false);
          onSubmissionResult(submission);
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setIsSubmitting(false);
          setSubmitError("Submission is taking longer than expected. Check submissions tab.");
        }
      } catch (error: any) {
        console.error("Error polling submission:", error);
        
        // If it's a 401 error, the interceptor will handle logout
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

    try {
      const submissionData: SubmissionCreate = {
        problemId: problem.id,
        language: language,
        code: code,
        contestId: contestId || 'standalone',
      };

      const response = await submissionService.createSubmission(submissionData);
      console.log("Test run created:", response.data);

      if (response.data.id) {
        pollRunStatus(response.data.id);
      }
    } catch (error: any) {
      console.error("Run failed:", error);
      if (error.response?.status === 401) {
        setSubmitError('Authentication failed. Please refresh the page and try again.');
      } else {
        setSubmitError(error.response?.data?.message || "Failed to run code");
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

        if (submission.status !== "PENDING" && submission.status !== "RUNNING") {
          clearInterval(poll);
          setIsRunning(false);
          onSubmissionResult(submission);
        }

        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setIsRunning(false);
          setSubmitError("Execution is taking longer than expected.");
        }
      } catch (error: any) {
        console.error("Error polling run:", error);
        
        // If it's a 401 error, the interceptor will handle logout
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

  const getMonacoLanguage = (lang: string) => {
    const langMap: Record<string, string> = {
      python: "python",
      cpp: "cpp",
      java: "java",
    };
    return langMap[lang] || "python";
  };

  return (
    <div className="flex flex-col h-full bg-theme-secondary">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-theme-primary border-b border-theme px-4 py-2">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-theme-primary">Code Editor</span>
          
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 bg-theme-secondary border border-theme rounded-lg text-theme-primary text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-accent))]"
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {/* Run Button */}
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            data-action="run"
          >
            <Play size={16} />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-1.5 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            style={{ background: 'var(--button-theme-bg)' }}
            data-action="submit"
          >
            <Send size={16} />
            <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
          </button>

          {/* Collapse/Expand Bottom */}
          <button
            onClick={onToggleBottom}
            className="p-2 hover:bg-theme-secondary rounded transition-colors"
            title={isBottomCollapsed ? "Expand Test Cases" : "Collapse Test Cases"}
          >
            {isBottomCollapsed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={onFullscreen}
            className="p-2 hover:bg-theme-secondary rounded transition-colors"
            title="Fullscreen"
          >
            <Maximize2 size={16} className="text-theme-secondary-text" />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {submitError && (
        <div className="bg-red-900/20 border-l-4 border-red-500 px-4 py-2 text-red-400 text-sm">
          {submitError}
        </div>
      )}

      {/* Monaco Editor */}
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
          }}
        />
      </div>
    </div>
  );
};
