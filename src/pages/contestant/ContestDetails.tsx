import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contestService } from '../../api/contestService';
import { submissionService } from '../../api/submissionService';
import { AuthContext } from '../../context/AuthContext'; 
import {
  ChevronLeft,
  Users,
  ExternalLink,
  Award,
  List,
  Calendar,
  Zap,
  Lock,
  CheckCircle,
  User,
  Gavel, 
  Timer,
  Hourglass,
} from 'lucide-react';
import { calculateDurationMinutes, formatDuration } from '../../utils/time';
type UpperDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
type DifficultyKey = UpperDifficulty | Lowercase<UpperDifficulty>;

const DIFFICULTY_POINTS: Record<DifficultyKey, number> = {
  EASY: 3,
  MEDIUM: 4,
  HARD: 6,
  easy: 3,
  medium: 4,
  hard: 6,
};

const getDifficultyPoints = (difficulty: string | undefined): number => {
  if (!difficulty) return 4;
  const normalized = difficulty.toUpperCase() as UpperDifficulty;
  return DIFFICULTY_POINTS[normalized] ?? 4;
};

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') {
      return maybeMessage;
    }

    const responseMessage = (error as {
      response?: { data?: { message?: unknown } };
    }).response?.data?.message;

    if (typeof responseMessage === 'string') {
      return responseMessage;
    }
  }

  return fallback;
};

// --- NEW COMPONENT: Contest Guidelines (Styled with theme variables) ---
const ContestGuidelines = () => (
    <div className="mt-10 p-6   rounded-lg shadow-inner">
        <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center">
            <Gavel 
              className="w-5 h-5 mr-2" 
              style={{ color: 'hsl(var(--color-accent))' }} 
            />
            Contest Rules & Guidelines
        </h3>
        {/* Formatted without asterisks/list-disc, using bold headers and indentation */}
        <div className="space-y-3 text-sm text-theme-secondary">
            <p className="font-semibold text-theme-primary">Coding Environment:</p>
            <p className="ml-4">All solutions must be implemented using one of the supported languages (e.g., Python, C++, Java) and run within the provided environment.</p>

            <p className="font-semibold text-theme-primary">Plagiarism Policy:</p>
            <p className="ml-4">Sharing solution code or logic before the contest ends, or using code found online, is strictly prohibited. Violators will be <b>disqualified</b> and may face a temporary ban.</p>
            
            <p className="font-semibold text-theme-primary">System Integrity:</p>
            <p className="ml-4">Attempting to disrupt the contest server or gaining an unfair advantage through non-standard means is forbidden.</p>

            <p className="font-semibold text-theme-primary">Tie-breaker:</p>
            <p className="ml-4">Ranks are determined by the <b>total score</b>. Ties are broken by the <b>total time taken</b> to submit the last successful solution, plus any penalty time.</p>

            <p className="font-semibold text-theme-primary">Technical Issues:</p>
            <p className="ml-4">In case of platform-wide technical issues, the contest time may be extended or the contest may be canceled. Individual connection issues will not be compensated.</p>
        </div>
        <p className="mt-4 text-xs text-theme-secondary/70">
            By registering, you agree to abide by the full terms and conditions of the competitive coding platform.
        </p>
    </div>
);
// ------------------------------------------

// Orange Accent Button Bar
interface ActionButtonsProps {
  isRegistered: boolean;
  onRegister: () => void;
  loading: boolean;
  contestId: string;
  isContestActive: boolean;
}

const ActionButtons = ({ isRegistered, onRegister, loading, contestId, isContestActive }: ActionButtonsProps) => (
  <div className="flex items-center space-x-3 mt-8">
    {!isRegistered ? (
      <button 
        onClick={onRegister}
        disabled={loading}
        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 px-6 rounded-full transition duration-200 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
      >
        <CheckCircle className="w-5 h-5" />
        <span>{loading ? 'Registering...' : 'Register Now'}</span>
      </button>
    ) : (
      <div className="flex items-center space-x-2 bg-green-100 text-green-700 py-2.5 px-6 rounded-full border-2 border-green-500 font-semibold">
        <CheckCircle className="w-5 h-5" />
        <span>Registered</span>
      </div>
    )}
    
    {/* Leaderboard Button - Only visible during contest time */}
    {isContestActive && isRegistered && (
      <button 
        onClick={() => window.location.href = `/contest/${contestId}/leaderboard`}
        className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2.5 px-6 rounded-full transition duration-200 hover:from-yellow-600 hover:to-yellow-700 font-semibold shadow-lg"
      >
        <Award className="w-5 h-5" />
        <span>Leaderboard</span>
      </button>
    )}
    
    <button className="flex items-center space-x-2 button-theme text-theme-primary py-2 px-4 rounded-full transition duration-200 border border-theme hover:bg-gray-50">
      <Zap className="w-5 h-5" />
      <span>Virtual Contest</span>
    </button>
    
    <button className="p-2.5 rounded-full bg-theme-secondary text-theme-secondary border border-theme hover:bg-gray-100 transition duration-200">
      <Users className="w-5 h-5" />
    </button>
    
    <button className="p-2.5 rounded-full bg-theme-secondary text-theme-secondary border border-theme hover:bg-gray-100 transition duration-200">
      <ExternalLink className="w-5 h-5" />
    </button>
  </div>
);

// Problem List Widget - UPDATED LOGIC FOR TITLE VISIBILITY AND NAVIGATION
interface ContestUser {
  id?: string;
  username?: string;
  email?: string;
}

interface ContestProblem {
  id: string;
  title?: string;
  name?: string;
  difficulty?: string;
  createdBy?: ContestUser;
}

interface ContestProblemWrapper {
  problem?: ContestProblem;
  difficulty?: string;
}

type ContestProblemLike = ContestProblem | ContestProblemWrapper;

interface ProblemListWidgetProps {
  problems: ContestProblemLike[];
  isRegistered: boolean;
  contestStartTime: string | Date;
  contestId: string;
}

const ProblemListWidget = ({ problems, isRegistered, contestStartTime, contestId }: ProblemListWidgetProps) => {
  // Determine if the contest has started
  const now = new Date();
  const contestStart = new Date(contestStartTime);
  const contestStarted = contestStart <= now; 
  
  // Use the navigation hook
  const navigate = useNavigate();
  
  // Track solved problems
  const [solvedProblems, setSolvedProblems] = React.useState<Record<string, boolean>>({});
  
  // Fetch solved problems status
  React.useEffect(() => {
    if (!isRegistered || !contestId) return;
    
    const fetchSolvedStatus = async () => {
      try {
        // Get user's submissions for this contest
        const response = await submissionService.getContestLeaderboard(contestId, 1, 100);
        const leaderboardData = response.data as any;
        const leaderboard = leaderboardData.leaderboard || [];
        
        // Get current user ID
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        
        // Find user's solved problems
        const userEntry = leaderboard.find((entry: any) => entry.userId === user.id);
        if (userEntry && userEntry.solvedProblems) {
          const solved: Record<string, boolean> = {};
          userEntry.solvedProblems.forEach((problemId: string) => {
            solved[problemId] = true;
          });
          setSolvedProblems(solved);
        }
      } catch (err) {
        console.error('Failed to fetch solved status:', err);
      }
    };
    
    fetchSolvedStatus();
    // Poll every 10 seconds to update status
    const interval = setInterval(fetchSolvedStatus, 10000);
    return () => clearInterval(interval);
  }, [isRegistered, contestId]);

  if (!isRegistered) {
    return (
      <div className="bg-theme-secondary border border-theme rounded-lg p-6 shadow-3xl">
        <h3 className="flex items-center text-lg font-semibold text-theme-primary mb-4">
          <Lock className="w-5 h-5 mr-2 text-gray-400" />
          Problem List
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Lock className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-theme-secondary text-sm">
            Register for the contest to view problems
          </p>
        </div>
      </div>
    );
  }

  // Handle navigation click
  const handleProblemClick = (problemId: string | undefined, isLocked: boolean) => {
    if (!problemId) return;
    if (isLocked) {
      console.log(`Problem ${problemId} is locked. Contest starts at ${contestStart.toLocaleString()}.`);
      return;
    }
    
    // Navigate with both contestId and problemId
    navigate(`/contest/${contestId}/problem/${problemId}`);
  };

  return (
    <div className="bg-theme-secondary border border-theme rounded-lg p-6 shadow-3xl">
      <h3 className="flex items-center text-lg font-semibold text-theme-primary mb-4">
        <List className="w-5 h-5 mr-2" style={{ color: 'hsl(var(--color-accent))' }} />
        Problem List
      </h3>
      {problems && problems.length > 0 ? (
        <ul className="space-y-3">
          {problems
            .sort((a: ContestProblemLike, b: ContestProblemLike) => {
              // Sort by difficulty: EASY -> MEDIUM -> HARD
              const difficultyOrder = { 'EASY': 1, 'MEDIUM': 2, 'HARD': 3 };
              const aProblem = (a as ContestProblemWrapper).problem ?? (a as ContestProblem);
              const bProblem = (b as ContestProblemWrapper).problem ?? (b as ContestProblem);
              const aDiff = (aProblem?.difficulty ?? 'MEDIUM').toUpperCase();
              const bDiff = (bProblem?.difficulty ?? 'MEDIUM').toUpperCase();
              return (difficultyOrder[aDiff as keyof typeof difficultyOrder] || 2) - (difficultyOrder[bDiff as keyof typeof difficultyOrder] || 2);
            })
            .map((item, index) => {
            // Safely access the nested problem object
            const problem = (item as ContestProblemWrapper).problem ?? (item as ContestProblem);
            if (!problem) return null;
            
            const difficulty = (problem.difficulty || 'MEDIUM').toUpperCase();
            
            // Logic: Show REAL title ONLY if contest has started. Otherwise, show placeholder.
            const realProblemTitle = problem.title || problem.name || `Problem ${index + 1}`; 
            const problemTitleToDisplay = contestStarted 
                ? realProblemTitle
                : `Problem ${index + 1}`; // Placeholder title if upcoming

            const points = getDifficultyPoints(difficulty);
            const difficultyBadge = 
              difficulty === 'EASY' ? 'bg-green-100 text-green-700 border-green-200' :
              difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
              'bg-red-100 text-red-700 border-red-200';
            
            // Problem is locked (cannot navigate) if the contest hasn't started
            const isProblemLocked = !contestStarted;

            const isSolved = problem.id ? solvedProblems[problem.id] : false;
            
            return (
              <li 
                key={problem.id || index} 
                onClick={() => handleProblemClick(problem.id, isProblemLocked)}
                className={`flex justify-between items-center text-theme-secondary p-3 rounded-lg transition duration-150 ${
                  isProblemLocked 
                    ? 'cursor-default opacity-70' // Locked: not clickable, dim
                    : 'cursor-pointer hover:bg-gray-50 hover:text-theme-primary group' // Unlocked: clickable
                }`}
              >
                <div className="flex items-center flex-1 min-w-0 space-x-2">
                  {/* Tick mark for solved problems */}
                  {isSolved && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate font-medium">
                      {problemTitleToDisplay} {/* Title based on contest status */}
                    </span>
                    {/* Only show creator/metadata if the contest has started, mirroring title logic */}
                    {contestStarted && problem.createdBy && (
                      <span className="text-xs text-gray-400 mt-0.5 flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {problem.createdBy.username || problem.createdBy.email}
                      </span>
                    )}
                  </div>
                </div>
                {/* Points and Difficulty Display (Always visible as per request) */}
                <div className="flex items-center space-x-2 ml-3">
                  <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full border ${difficultyBadge}`}>
                    {difficulty}
                  </span>
                  {/* Points are always shown */}
                  <span 
                    className="text-sm font-mono bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full font-bold border border-orange-200"
                  >
                    {points}pts
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-8 text-theme-secondary">
          No problems available yet
        </div>
      )}
    </div>
  );
};

// Ranking Widget with User Score
interface LeaderboardEntry {
  userId: string;
  points?: number;
  solved?: number;
  solvedProblems?: string[];
}

interface RankingWidgetProps {
  contestId: string;
  userId?: string;
}

const RankingWidget = ({ contestId, userId }: RankingWidgetProps) => {
  const [userScore, setUserScore] = React.useState<{ rank: number; points: number; solved: number } | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!contestId || !userId) return;

    const fetchUserScore = async () => {
      try {
        setLoading(true);
        const response = await submissionService.getContestLeaderboard(contestId, 1, 100);
        const leaderboardData = response.data as { leaderboard?: LeaderboardEntry[] };
        const leaderboard = leaderboardData.leaderboard ?? [];
        
        // Find current user in leaderboard
        const userEntry = leaderboard.find((entry) => entry.userId === userId);
        if (userEntry) {
          const userRank = leaderboard.indexOf(userEntry) + 1;
          setUserScore({
            rank: userRank,
            points: userEntry.points || 0,
            solved: userEntry.solved || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch user score:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserScore();
  }, [contestId, userId]);

  return (
    <div className="bg-theme-secondary border border-theme rounded-lg p-6 shadow-3xl mb-6">
      <h3 className="flex items-center text-lg font-semibold text-theme-primary mb-4">
        <Award className="w-5 h-5 mr-2 text-yellow-500" />
        Your Performance
      </h3>
      
      {loading ? (
        <div className="text-center py-4 text-theme-secondary-text text-sm">Loading...</div>
      ) : userScore ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-theme-primary/20 rounded-lg">
            <span className="text-sm text-theme-secondary-text">Rank</span>
            <span className="text-xl font-bold text-orange-400">#{userScore.rank}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-theme-primary/20 rounded-lg">
            <span className="text-sm text-theme-secondary-text">Points</span>
            <span className="text-xl font-bold text-green-400">{userScore.points}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-theme-primary/20 rounded-lg">
            <span className="text-sm text-theme-secondary-text">Solved</span>
            <span className="text-xl font-bold text-blue-400">{userScore.solved}</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-theme-secondary-text text-sm">
          No submissions yet. Start solving problems!
        </div>
      )}
    </div>
  );
};

// Format ISO Date to readable (for the header display)
const formatDateTime = (isoDate: string | Date | null | undefined, includeTime = true) => {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  // Using 'en-US' or 'en-GB' format for consistent display like "5 Nov 2025, 07:18 pm"
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: true })
  }).replace(/, /g, ', '); 
};

// --- MAIN COMPONENT ---

interface ContestBonusPrize {
  rank: string;
  prize: string;
}

interface ContestPrizeImage {
  url?: string;
  link?: string;
  name?: string;
}

interface ContestData {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  createdBy?: ContestUser;
  bonusPrizes?: ContestBonusPrize[];
  prizeImages?: (string | ContestPrizeImage)[];
  ranking?: LeaderboardEntry[];
  contestProblems?: ContestProblemLike[];
}

const isPrizeImage = (value: string | ContestPrizeImage): value is ContestPrizeImage =>
  typeof value === 'object';

const LeetCodeContestPage = () => {
  const { id: routeContestIdParam } = useParams<{ id: string }>();
  const routeContestId = routeContestIdParam ?? '';
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [contest, setContest] = useState<ContestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  // Check registration status (FIXED LOGIC)
  useEffect(() => {
    const checkRegistration = async () => {
      if (!routeContestId) return;
      
      setCheckingRegistration(true);
      console.log(`[API Call] Checking registration status for contest ID: ${routeContestId}`);
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.log('[Registration Check] User not logged in, assumed NOT registered.');
          setIsRegistered(false);
          setCheckingRegistration(false);
          return;
        }

        // Using the recommended endpoint /contests/me/registered via getRegisteredContests()
        const response = await contestService.getRegisteredContests(); 
        
        console.log('[API Response] Registered Contests List:', response.data); // Log response data
        
        const registeredContests = (response.data as Array<{ id?: string; contestId?: string; _id?: string }> | undefined) ?? [];
        
        const isAlreadyRegistered = registeredContests.some(
          (event) => String(event.id ?? event.contestId ?? event._id) === String(routeContestId)
        );
        
        console.log(`[Registration Check] Contest ID ${routeContestId} found in list: ${isAlreadyRegistered}`);
        
        setIsRegistered(isAlreadyRegistered);
      } catch (err) {
        console.error('[Registration Check ERROR] Failed to fetch registered contests:', err);
        setIsRegistered(false);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistration();
  }, [routeContestId]);

  // Fetch contest details
  useEffect(() => {
    const fetchContest = async () => {
      if (!routeContestId) return;
      
      console.log(`[API Call] Fetching contest details for ID: ${routeContestId}`);
      try {
        const contestId = routeContestId;
        const res = await contestService.getContestById(contestId);
        console.log('[API Response] Contest data received:', res.data); // Log response data
        setContest(res.data as ContestData);
      } catch (err) {
        console.error('[Fetch Contest ERROR] Failed to fetch contest details:', err);
        setError(extractErrorMessage(err, 'Failed to fetch contest details.'));
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [routeContestId]);

  // Handle registration
  const handleRegister = async () => {
    setRegistering(true);
    setRegisterError(null);
    console.log(`[API Call] Attempting to register user for contest ID: ${routeContestId}`);

    try {
      const effectiveContestId = contest?.id ?? routeContestId ?? '';
      if (!effectiveContestId) {
        setRegisterError('Contest ID is missing.');
        setRegistering(false);
        return;
      }

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setRegisterError('Please login to register for the contest');
        setRegistering(false);
        return;
      }

      const user = JSON.parse(userStr) as { id?: string };
      if (!user?.id) {
        setRegisterError('Please login to register for the contest');
        setRegistering(false);
        return;
      }
      
      // Call registration API
      await contestService.registerForContest(effectiveContestId);
      
      console.log('[API Response] Registration successful'); // Log success response
      
      setIsRegistered(true);
      setRegisterError(null);
    } catch (err) {
      console.error('[Registration ERROR] Failed to register:', err); // Log error response
      setRegisterError(extractErrorMessage(err, 'Failed to register. Please try again.'));
    } finally {
      setRegistering(false);
    }
  };

  if (loading || checkingRegistration) {
    return <div className="p-8 text-center text-theme-primary">Loading contest details...</div>;
  }
  
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!contest) return <div className="p-8 text-center text-theme-primary">Contest not found.</div>;

  const now = new Date();
  const startDate = new Date(contest.startTime);
  const endDate = new Date(contest.endTime);
  const isExpired = endDate < now;
  const isOngoing = startDate <= now && endDate >= now; 

  // Determine Contest Status text
  let statusText = 'Upcoming';
  if (isExpired) {
      statusText = 'Finished';
  } else if (isOngoing) {
      statusText = 'Ongoing';
  }

  // Extract organizer username safely
  const organizerUsername = contest.createdBy?.username || 'Unknown Organizer';
  const durationLabel = formatDuration(contest.durationMinutes ?? calculateDurationMinutes(contest.startTime, contest.endTime) ?? 60);
  
  // Formatted date strings for display
  const formattedStartTime = formatDateTime(contest.startTime);
  const formattedEndTime = formatDateTime(contest.endTime);

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary font-sans p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Navigation / Back Button */}
        <header className="flex items-center mb-10">
          <button 
            onClick={() => navigate('/explore')} 
            className="p-2 mr-6 text-theme-secondary hover:text-theme-primary transition duration-200"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold" style={{ color: 'hsl(var(--color-accent))' }}>
              {contest.title}
            </h1>
            
            {/* Start Date, End Date, and Status - Cleaner and Slightly Larger */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-theme-secondary py-3">
              <div className="flex items-center gap-2 rounded-full border border-theme bg-theme-secondary/70 px-3 py-1.5">
                <Calendar className="w-4 h-4 text-theme-primary" />
                <span className="text-theme-primary">{formattedStartTime}</span>
                <span className="text-theme-secondary/70">→</span>
                <span className="text-theme-primary">{formattedEndTime}</span>
              </div>

              <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 border text-sm font-semibold ${
                isOngoing
                  ? 'border-green-500/50 bg-green-500/10 text-green-400'
                  : isExpired
                  ? 'border-red-500/50 bg-red-500/10 text-red-400'
                  : 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300'
              }`}>
                <Hourglass className="w-4 h-4" />
                {statusText}
              </div>

              <div className="flex items-center gap-2 rounded-full border border-theme bg-theme-secondary/70 px-3 py-1.5 text-theme-primary">
                <Timer className="w-4 h-4 text-theme-primary" />
                <span>{durationLabel}</span>
              </div>
            </div>

            {/* Organizer Name */}
            <p className="flex items-center text-sm font-medium text-theme-secondary mt-1">
              <User className="w-4 h-4 mr-1.5" />
              Organized by: <span className="ml-1 text-theme-primary font-bold">{organizerUsername}</span>
            </p>
          </div>
        </header>

        {/* Registration Error Message */}
        {registerError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {registerError}
          </div>
        )}

        {/* Main Layout Grid */}
        <div className="grid lg:grid-cols-3 gap-10">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2">
            <ActionButtons 
              isRegistered={isRegistered} 
              onRegister={handleRegister}
              loading={registering}
              contestId={contest.id}
              isContestActive={isOngoing}
            />

            <section className="mt-10">
              <p className="text-theme-secondary mb-6">{contest.description || 'No description provided.'}</p>

              {contest.bonusPrizes && contest.bonusPrizes.length > 0 && (
                <>
                  <h3 className="text-xl font-bold text-theme-primary mb-4 flex items-center">
                    <span className="text-2xl mr-2" style={{ color: 'hsl(var(--color-accent))' }}>★</span> Bonus Prizes
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-theme-secondary">
                    {contest.bonusPrizes.map((item, idx) => (
                      <li key={idx}>
                        Contestants ranked <span className="font-semibold" style={{ color: 'hsl(var(--color-accent-hover))' }}>{item.rank}</span> will win a {item.prize}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 text-sm text-theme-secondary/70 max-w-2xl">
                    ONLY LCUS (leetcode.com) accounts are eligible for bonus rewards. A LeetCode team member will contact you after ranking is finalized.
                  </p>
                </>
              )}
            </section>
            
            {/* GUIDELINES SECTION */}
            <ContestGuidelines /> 
            
            {contest.prizeImages && contest.prizeImages.length > 0 && (
                <div className="flex space-x-4 mt-6">
                  {contest.prizeImages.map((img, idx) => {
                    const imageSrc = isPrizeImage(img) ? img.url ?? '' : img;
                    const imageAlt = isPrizeImage(img) ? img.name ?? 'Prize' : 'Prize';

                    return (
                      <div key={idx} className="w-24 h-24 bg-theme-secondary/50 rounded-lg flex items-center justify-center text-theme-secondary border border-theme">
                        <img src={imageSrc} alt={imageAlt} className="max-w-full max-h-full" />
                      </div>
                    );
                  })}
                </div>
              )}
          </div>

          {/* RIGHT COLUMN */}
          <aside className="lg:col-span-1">
            <RankingWidget contestId={contest.id} userId={auth?.user?.id} />
            <ProblemListWidget 
              problems={contest.contestProblems || []} 
              isRegistered={isRegistered}
              contestStartTime={contest.startTime} // PASS START TIME
              contestId={contest.id} // PASS CONTEST ID
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeContestPage;