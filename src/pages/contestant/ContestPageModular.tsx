import  { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { contestService, type ProblemData } from "../../api/contestService";
import type { SubmissionResponse } from "../../api/submissionService";
import {
  ScrollbarStyles,
  TopBar,
  DescriptionPanel,
  ResizableDivider,
  CodeEditorPanel,
  TestCasePanel,
} from "../../components/contest";

const ContestPageModular = () => {
  const { contestId, problemId } = useParams<{ contestId: string; problemId: string }>();
  
  // State
  const [problem, setProblem] = useState<ProblemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("python");
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  
  // Layout state
  const [leftWidth, setLeftWidth] = useState(40); // Percentage
  const [bottomHeight, setBottomHeight] = useState(40); // Percentage
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);
  const [descFullscreen, setDescFullscreen] = useState(false);
  const [editorFullscreen, setEditorFullscreen] = useState(false);

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      if (!problemId) return;
      
      // Ensure we have a token before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No auth token found, skipping problem fetch');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await contestService.getProblem(problemId);
        console.log("📚 Problem fetched:", response.data);
        setProblem(response.data);
      } catch (error) {
        console.error("Failed to fetch problem:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Resize handlers
  const handleHorizontalResize = useCallback((clientX: number) => {
    const newWidth = (clientX / window.innerWidth) * 100;
    setLeftWidth(Math.max(20, Math.min(80, newWidth)));
  }, []);

  const handleVerticalResize = useCallback((clientY: number) => {
    const containerHeight = window.innerHeight - 120; // Subtract top bar height
    const newHeight = ((containerHeight - clientY + 120) / containerHeight) * 100;
    setBottomHeight(Math.max(20, Math.min(80, newHeight)));
  }, []);

  // Reset code handler
  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your code?")) {
      window.location.reload();
    }
  };

  // Submission result handler
  const handleSubmissionResult = (result: SubmissionResponse) => {
    setSubmissionResult(result);
    setIsBottomCollapsed(false); // Expand bottom panel to show results
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-primary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[hsl(var(--color-accent))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-secondary text-lg">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-screen bg-theme-primary">
        <div className="text-center">
          <p className="text-theme-primary text-xl mb-4">Problem not found</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 text-white rounded-lg"
            style={{ background: 'var(--button-theme-bg)' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen modes
  if (descFullscreen) {
    return (
      <div className="h-screen bg-theme-primary">
        <ScrollbarStyles />
        <DescriptionPanel
          problem={problem}
          onFullscreen={() => setDescFullscreen(false)}
        />
      </div>
    );
  }

  if (editorFullscreen) {
    return (
      <div className="h-screen bg-theme-primary flex flex-col">
        <ScrollbarStyles />
        <CodeEditorPanel
          problem={problem}
          onFullscreen={() => setEditorFullscreen(false)}
          isBottomCollapsed={false}
          onToggleBottom={() => {}}
          onSubmissionResult={handleSubmissionResult}
          contestId={contestId}
          language={language}
          setLanguage={setLanguage}
        />
      </div>
    );
  }

  // Normal layout
  return (
    <div className="flex flex-col h-screen bg-theme-primary">
      <ScrollbarStyles />
      
      {/* Top Bar */}
      <TopBar onReset={handleReset} initialTime={1800} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Description Panel */}
        <div style={{ width: `${leftWidth}%` }} className="flex flex-col">
          <DescriptionPanel
            problem={problem}
            onFullscreen={() => setDescFullscreen(true)}
          />
        </div>

        {/* Horizontal Divider */}
        <ResizableDivider
          onResize={handleHorizontalResize}
          direction="horizontal"
        />

        {/* Right: Code Editor + Test Cases */}
        <div style={{ width: `${100 - leftWidth}%` }} className="flex flex-col">
          {/* Code Editor */}
          <div
            style={{
              height: isBottomCollapsed ? "100%" : `${100 - bottomHeight}%`,
            }}
            className="flex flex-col"
          >
            <CodeEditorPanel
              problem={problem}
              onFullscreen={() => setEditorFullscreen(true)}
              isBottomCollapsed={isBottomCollapsed}
              onToggleBottom={() => setIsBottomCollapsed(!isBottomCollapsed)}
              onSubmissionResult={handleSubmissionResult}
              contestId={contestId}
              language={language}
              setLanguage={setLanguage}
            />
          </div>

          {/* Vertical Divider */}
          {!isBottomCollapsed && (
            <ResizableDivider
              onResize={handleVerticalResize}
              direction="vertical"
            />
          )}

          {/* Test Cases Panel */}
          {!isBottomCollapsed && (
            <div style={{ height: `${bottomHeight}%` }} className="flex flex-col">
              <TestCasePanel
                problem={problem}
                submissionResult={submissionResult}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContestPageModular;
