import React, { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";
import type { ProblemData } from "../../api/contestService";
import { submissionService, type SubmissionResponse } from "../../api/submissionService";

interface DescriptionPanelProps {
  problem: ProblemData;
  onFullscreen: () => void;
}

export const DescriptionPanel: React.FC<DescriptionPanelProps> = ({ problem, onFullscreen }) => {
  const [activeTab, setActiveTab] = useState("Description");
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const visibleTestCases = problem.testcases?.filter((tc) => !tc.isHidden) || [];

  // Fetch submissions when Submissions tab is active
  useEffect(() => {
    if (activeTab === "Submissions" && problem.id) {
      setLoadingSubmissions(true);
      submissionService
        .getSubmissionsByProblem(problem.id, 1, 20)
        .then((res) => {
          console.log('📥 Submissions response:', res.data);
          const submissionsData = res.data?.submissions || [];
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
      <p className="leading-relaxed text-base border-b border-theme pb-4">{problem.description}</p>

      {visibleTestCases.length > 0 && (
        <div className="border-t border-theme pt-6">
          <h4 className="text-lg font-semibold text-theme-primary mb-4">Examples</h4>
          {visibleTestCases.map((testcase, index) => (
            <div key={testcase.id || index} className="bg-theme-secondary rounded-lg p-5 space-y-4 border border-theme mb-4 last:mb-0">
              <div className="text-xs font-semibold text-theme-secondary-text mb-2">Example {index + 1}:</div>
              <div>
                <div className="text-xs font-semibold text-theme-secondary-text mb-2">Input:</div>
                <div className="text-sm text-theme-primary whitespace-pre-wrap font-mono p-3 rounded bg-theme-primary/50">
                  {testcase.input}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-theme-secondary-text mb-2">Output:</div>
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
        <div className="p-4 bg-theme-secondary rounded text-theme-secondary-text whitespace-pre-wrap text-sm border border-theme">
          {problem.inputFormat}
        </div>
      </div>

      <div className="border-t border-theme pt-6">
        <h4 className="text-lg font-semibold text-theme-primary mb-3">Output Format</h4>
        <div className="p-4 bg-theme-secondary rounded text-theme-secondary-text whitespace-pre-wrap text-sm border border-theme">
          {problem.outputFormat}
        </div>
      </div>

      {problem.constraints && (
        <div className="border-t border-theme pt-6">
          <h4 className="text-lg font-semibold text-theme-primary mb-3">Constraints</h4>
          <div className="whitespace-pre-wrap text-sm text-theme-secondary-text leading-relaxed p-3">{problem.constraints}</div>
        </div>
      )}

      {problem.additionalInfo && (
        <div className="border-t border-theme pt-6">
          <h4 className="text-lg font-semibold text-theme-primary mb-3">Additional Notes</h4>
          <div className="whitespace-pre-wrap text-gray-300 p-3">{problem.additionalInfo}</div>
        </div>
      )}
    </div>
  );

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

    const statusCounts = submissions.reduce((acc, sub) => {
      const status = sub.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalSubmissions = submissions.length;
    const acceptedCount = (statusCounts['AC'] || 0) + (statusCounts['ACCEPTED'] || 0);
    const successRate = totalSubmissions > 0 ? ((acceptedCount / totalSubmissions) * 100).toFixed(1) : '0';

    return (
      <div className="p-6 space-y-6">
        <div className="text-theme-primary text-lg font-semibold">Your Submissions History</div>
        
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
          
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const percentage = (count / totalSubmissions) * 100;
              const color = status.includes('AC') || status.includes('ACCEPTED') ? 'bg-green-500' :
                           status.includes('WA') || status.includes('WRONG') ? 'bg-red-500' :
                           status.includes('TLE') || status.includes('TIME') ? 'bg-yellow-500' :
                           status.includes('RE') || status.includes('RUNTIME') ? 'bg-orange-500' : 'bg-blue-500';
              
              return (
                <div key={status} className="flex items-center space-x-2">
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

        <div className="space-y-3">
          {submissions.map((submission) => (
            <div key={submission.id} className="bg-theme-secondary border border-theme rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`font-semibold ${getStatusColor(submission.status)}`}>
                  {submission.status}
                </span>
                <span className="text-xs text-theme-secondary-text">
                  {new Date(submission.createdAt || Date.now()).toLocaleString()}
                </span>
              </div>
              {submission.executionTime && (
                <div className="text-xs text-theme-secondary-text">
                  Execution Time: {submission.executionTime}ms
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-theme-secondary border-r border-theme">
      <div className="flex items-center justify-between bg-theme-primary border-b border-theme px-6 py-3">
        <div className="flex space-x-6">
          {["Description", "Submissions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium transition-all pb-1 ${
                activeTab === tab
                  ? "text-theme-primary border-b-2 border-[hsl(var(--color-accent))]"
                  : "text-theme-secondary-text hover:text-theme-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={onFullscreen}
          className="p-2 hover:bg-theme-secondary rounded transition-colors"
          title="Fullscreen"
        >
          <Maximize2 size={16} className="text-theme-secondary-text" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {activeTab === "Description" ? <DescriptionContent /> : <SubmissionsContent />}
      </div>
    </div>
  );
};
