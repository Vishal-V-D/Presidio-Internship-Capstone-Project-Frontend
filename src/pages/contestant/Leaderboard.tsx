import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionService, type LeaderboardEntry } from '../../api/submissionService';
import { Trophy, Medal, Award, ChevronLeft, User, Target, Clock, Code } from 'lucide-react';

const Leaderboard = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!contestId) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await submissionService.getContestLeaderboard(contestId, page, 50);
        console.log('📊 Leaderboard data:', response.data);
        
        // Backend returns { leaderboard, page, limit }
        const data = response.data as any;
        setLeaderboard(data.leaderboard || []);
        setTotalPages(Math.ceil((data.leaderboard?.length || 0) / 50));
      } catch (err: any) {
        console.error('Failed to fetch leaderboard:', err);
        setError(err.response?.data?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [contestId, page]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" />;
      default:
        return <span className="text-gray-500 font-bold">{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400';
      case 3:
        return 'bg-gradient-to-r from-orange-400/20 to-orange-500/20 border-orange-400';
      default:
        return 'bg-theme-secondary border-theme';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-primary text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center p-8">
        <div className="bg-theme-secondary border border-red-500 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/contest/${contestId}`)}
            className="px-4 py-2 button-theme text-theme-primary"
          >
            Back to Contest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary text-theme-primary p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(`/contest/${contestId}`)}
            className="p-2 mr-4 text-theme-secondary hover:text-theme-primary transition duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold flex items-center" style={{ color: 'hsl(var(--color-accent))' }}>
              <Award className="w-10 h-10 mr-3" />
              Contest Leaderboard
            </h1>
            <p className="text-theme-secondary mt-2">Real-time rankings and scores</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        {leaderboard.length > 0 ? (
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-theme-secondary border border-theme rounded-lg text-sm font-semibold text-theme-primary">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-4">Participant</div>
              <div className="col-span-2 text-center">Solved</div>
              <div className="col-span-2 text-center">Language</div>
              <div className="col-span-2 text-center">Points</div>
              <div className="col-span-1 text-center">Time</div>
            </div>

            {/* Leaderboard Entries */}
            {leaderboard.map((entry, index) => {
              const rank = (page - 1) * 50 + index + 1;
              return (
                <div
                  key={entry.userId || index}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 rounded-lg border-2 transition-all hover:shadow-lg ${getRankBgColor(rank)}`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* Username */}
                  <div className="col-span-4 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                      {entry.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-theme-primary">{entry.username || 'Anonymous'}</div>
                      <div className="text-xs text-theme-secondary flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {entry.userId?.substring(0, 8) || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Solved */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-lg font-bold text-green-500">{entry.solved || 0}</span>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center space-x-2 px-3 py-1 bg-blue-500/20 border border-blue-500/50 rounded-full">
                      <Code className="w-3 h-3 text-blue-400" />
                      <span className="text-blue-300 text-sm font-medium">{entry.language || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="px-4 py-1.5 bg-theme-accent/10 border-2 border-theme-accent rounded-full">
                      <span className="text-theme-accent font-bold text-lg">{entry.points || 0}</span>
                    </div>
                  </div>

                  {/* First Solve Time */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="text-xs text-theme-secondary flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {entry.firstSolveTime
                        ? new Date(entry.firstSolveTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-theme-secondary border border-theme rounded-lg">
            <Award className="w-16 h-16 mx-auto mb-4 text-theme-secondary opacity-50" />
            <p className="text-theme-primary text-lg">No submissions yet</p>
            <p className="text-theme-secondary text-sm mt-2">Be the first to solve a problem!</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-tertiary transition"
            >
              Previous
            </button>
            <span className="text-theme-primary">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-theme-secondary border border-theme rounded-lg text-theme-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-theme-tertiary transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
