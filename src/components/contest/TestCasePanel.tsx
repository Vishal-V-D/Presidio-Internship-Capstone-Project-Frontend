import React, { useState } from "react";
// Removed unused imports
import type { ProblemData } from "../../api/contestService";
import type { SubmissionResponse } from "../../api/submissionService";

interface TestCasePanelProps {
  problem: ProblemData;
  submissionResult: SubmissionResponse | null;
}

export const TestCasePanel: React.FC<TestCasePanelProps> = ({ problem, submissionResult }) => {
  const [activeTestTab, setActiveTestTab] = useState("Testcase");
  const [customInput, setCustomInput] = useState("");
  const [customOutput] = useState("");

  const visibleTestCases = problem.testcases?.filter((tc) => !tc.isHidden) || [];

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

  const TestCaseContent = () => (
    <div className="p-4 space-y-4">
      {visibleTestCases.length === 0 ? (
        <div className="text-center text-theme-secondary-text py-8">
          No test cases available
        </div>
      ) : (
        visibleTestCases.map((testcase, index) => (
          <div
            key={testcase.id || index}
            className="bg-theme-primary border border-theme rounded-lg p-4 space-y-3"
          >
            <div className="text-xs font-semibold text-theme-secondary-text">
              Test Case {index + 1}
            </div>
            <div>
              <div className="text-xs font-semibold text-theme-secondary-text mb-1">
                Input:
              </div>
              <div className="text-sm text-theme-primary whitespace-pre-wrap font-mono p-2 rounded bg-theme-secondary">
                {testcase.input}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-theme-secondary-text mb-1">
                Expected Output:
              </div>
              <div className="text-sm text-theme-primary whitespace-pre-wrap font-mono p-2 rounded bg-theme-secondary">
                {testcase.expectedOutput}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const CustomTestContent = () => (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-theme-secondary-text mb-2">
          Custom Input:
        </label>
        <textarea
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Enter your custom input here..."
          className="w-full h-32 p-3 bg-theme-primary border border-theme rounded-lg text-theme-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-accent))] resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-theme-secondary-text mb-2">
          Output:
        </label>
        <div className="w-full h-32 p-3 bg-theme-primary border border-theme rounded-lg text-theme-primary font-mono text-sm overflow-auto">
          {customOutput || "Output will appear here after running..."}
        </div>
      </div>
    </div>
  );

  const ResultContent = () => {
    if (!submissionResult) {
      return (
        <div className="p-4 text-center text-theme-secondary-text">
          No results yet. Run or submit your code to see results.
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className="bg-theme-primary border border-theme rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-theme-secondary-text">
              Submission Status
            </span>
            <span className={`text-lg font-bold ${getStatusColor(submissionResult.status)}`}>
              {submissionResult.status}
            </span>
          </div>

          {submissionResult.executionTime && (
            <div className="text-sm text-theme-secondary-text">
              Execution Time:{" "}
              <span className="text-theme-primary font-semibold">
                {submissionResult.executionTime}ms
              </span>
            </div>
          )}

          {submissionResult.memory && (
            <div className="text-sm text-theme-secondary-text">
              Memory:{" "}
              <span className="text-theme-primary font-semibold">
                {submissionResult.memory}KB
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {submissionResult.verdict === 'RUNTIME_ERROR' && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <div className="text-sm font-semibold text-red-400 mb-2">Error:</div>
            <div className="text-sm text-red-300 whitespace-pre-wrap font-mono">
              {submissionResult.output || 'Runtime error occurred'}
            </div>
          </div>
        )}

        {/* Test Results */}
        {submissionResult.testResults && submissionResult.testResults.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-semibold text-theme-primary">Test Results:</div>
            {submissionResult.testResults.map((result: any, index: number) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.passed
                    ? "bg-green-900/10 border-green-500/30"
                    : "bg-red-900/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-theme-secondary-text">
                    Test Case {index + 1}
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      result.passed ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {result.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>

                {result.input && (
                  <div className="mb-2">
                    <div className="text-xs text-theme-secondary-text mb-1">Input:</div>
                    <div className="text-sm text-theme-primary font-mono bg-theme-secondary p-2 rounded">
                      {result.input}
                    </div>
                  </div>
                )}

                {result.expectedOutput && (
                  <div className="mb-2">
                    <div className="text-xs text-theme-secondary-text mb-1">Expected:</div>
                    <div className="text-sm text-theme-primary font-mono bg-theme-secondary p-2 rounded">
                      {result.expectedOutput}
                    </div>
                  </div>
                )}

                {result.actualOutput && (
                  <div>
                    <div className="text-xs text-theme-secondary-text mb-1">Your Output:</div>
                    <div className="text-sm text-theme-primary font-mono bg-theme-secondary p-2 rounded">
                      {result.actualOutput}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-theme-secondary border-t border-theme">
      {/* Tab Bar */}
      <div className="flex items-center bg-theme-primary border-b border-theme px-4">
        {["Testcase", "Custom Test", "Result"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTestTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-all ${
              tab === activeTestTab
                ? "border-b-2 border-[hsl(var(--color-accent))] text-[hsl(var(--color-accent))]"
                : "text-theme-secondary-text hover:text-theme-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {activeTestTab === "Testcase" && <TestCaseContent />}
        {activeTestTab === "Custom Test" && <CustomTestContent />}
        {activeTestTab === "Result" && <ResultContent />}
      </div>
    </div>
  );
};
