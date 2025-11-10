import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// NOTE: I am assuming your ProblemData now includes an optional 'status' property:
// type ProblemData = { id?: string; title: string; difficulty?: string; timeLimit?: number; status?: 'SOLVED' | 'ATTEMPTED' | 'UNATTEMPTED' };
import { contestService, type ProblemData } from '../../api/contestService';
import { Search, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, MinusCircle } from 'lucide-react';

// --- FilterCard Component Refined ---
const FilterCard = ({ title, count, isActive, onClick, difficulty }: { title: string; count: number; isActive: boolean; onClick: () => void; difficulty: string | 'ALL' }) => {
    const getColors = () => {
        switch(difficulty) {
            case 'EASY': return 'text-green-400 border-green-500/30';
            case 'MEDIUM': return 'text-yellow-400 border-yellow-500/30';
            case 'HARD': return 'text-red-400 border-red-500/30';
            default: return 'text-[hsl(var(--color-accent))] border-[hsl(var(--color-accent))]/30'; // Accent color for 'All'
        }
    };
    
    const colors = getColors();

    // FIXED: Unselected style is now clearly visible but muted
    return (
        <div 
            onClick={onClick}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 
                ${isActive 
                    ? `bg-theme-secondary ring-2 ring-[hsl(var(--color-accent))] shadow-lg ${colors} hover:border-[hsl(var(--color-accent))]` 
                    : `bg-theme-secondary/30 border-theme/50 hover:bg-theme-secondary/60 hover:border-theme ${colors.replace('text-', 'text-')}/70` // Muted text color for unselected
                }
            `}
        >
            <div className="flex flex-col items-start">
                <h3 className={`text-sm font-medium ${isActive ? 'text-[hsl(var(--color-accent))]' : 'text-theme-secondary'}`}>{title}</h3>
                <span className="text-2xl font-bold mt-1 text-theme-primary">{count}</span>
            </div>
            {isActive && (
                // Subtle highlight for active filter
                <div className="absolute top-0 left-0 w-full h-1 bg-[hsl(var(--color-accent))] rounded-t-lg"></div>
            )}
        </div>
    );
};


// --- QuestionListItem Component Refined ---
interface QuestionListItemProps {
  problem: ProblemData;
  onClick: () => void;
}

const QuestionListItem: React.FC<QuestionListItemProps> = ({ problem, onClick }) => {
    const difficulty = problem.difficulty || 'MEDIUM';
    const status = problem.status ? problem.status.toUpperCase() : 'UNATTEMPTED'; // Use status property
    
    let difficultyColor = '';
    let difficultyBg = '';
    
    switch(difficulty.toUpperCase()) {
        case 'EASY':
            difficultyColor = 'text-green-400';
            difficultyBg = 'bg-green-500/10';
            break;
        case 'MEDIUM':
            difficultyColor = 'text-yellow-400';
            difficultyBg = 'bg-yellow-500/10';
            break;
        case 'HARD':
            difficultyColor = 'text-red-400';
            difficultyBg = 'bg-red-500/10';
            break;
        default:
            difficultyColor = 'text-gray-400';
            difficultyBg = 'bg-gray-700/30';
    }

    let statusIcon;
    let statusColor;
    switch(status) {
        case 'SOLVED':
            statusIcon = <CheckCircle size={16} />;
            statusColor = 'text-green-500';
            break;
        case 'ATTEMPTED':
            statusIcon = <MinusCircle size={16} />;
            statusColor = 'text-yellow-500';
            break;
        case 'UNATTEMPTED':
        default:
            statusIcon = <XCircle size={16} />;
            statusColor = 'text-gray-600';
            break;
    }

    // Tighter vertical spacing, cleaner hover.
    return (
        <div 
            onClick={onClick}
            className="group flex items-center justify-between gap-4 p-3 hover:bg-theme-secondary/80 transition-all cursor-pointer"
        >
            {/* Status (First Column) */}
            <div className={`w-8 flex justify-center flex-shrink-0 ${statusColor}`}>
                {statusIcon}
            </div>

            {/* Problem Title */}
            <h3 className="flex-1 text-theme-primary truncate font-medium text-base group-hover:text-[hsl(var(--color-accent))] transition-colors min-w-[150px]">
                {problem.title}
            </h3>

            {/* Difficulty Pill */}
            <div className={`w-24 text-center px-2 py-1 rounded border ${difficultyBg} ${difficultyColor} font-medium text-sm flex-shrink-0`}>
                {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
            </div>
            
            {/* Time Limit */}
            <div className="w-16 flex items-center gap-1 text-theme-secondary text-sm flex-shrink-0 justify-end">
                <Clock size={14} />
                <span>{problem.timeLimit || 2}s</span>
            </div>
        </div>
    );
}

// --- StatusSelect Component (New) ---
const StatusSelect = ({ statusFilter, setStatusFilter }: { statusFilter: string; setStatusFilter: (status: string) => void }) => {
    return (
        <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-theme-primary border border-theme/50 rounded-lg py-2.5 px-3 text-theme-primary text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-accent))] focus:border-[hsl(var(--color-accent))] transition-all appearance-none cursor-pointer"
        >
            <option value="">All Statuses</option>
            <option value="SOLVED">✅ Solved</option>
            <option value="ATTEMPTED">➖ Attempted</option>
            <option value="UNATTEMPTED">❌ Unattempted</option>
        </select>
    );
}


// --- Main App Component Refined ---
function App() {
    const navigate = useNavigate();
    const [problems, setProblems] = useState<ProblemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>(''); // NEW State for Status Filter
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // ... (useEffect for fetching problems remains the same)
    useEffect(() => {
        const fetchProblems = async () => {
            // Ensure we have a token before making the request
            const token = localStorage.getItem('token');
            if (!token) {
                console.warn('⚠️ No auth token found, skipping problems fetch');
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                // Assume contestService.listProblems returns problem data with an optional `status` field
                const response = await contestService.listProblems(undefined, 1, 100); 
                
                const problemsData = Array.isArray(response.data) 
                    ? response.data 
                    : response.data.problems || response.data.data || [];
                
                // Mocking status data for demonstration since the API response is unknown
                const mockProblems = problemsData.map((p: ProblemData & { status?: string }, i: number) => ({
                    ...p,
                    id: p.id || `P${i}`, // Ensure IDs exist
                    status: i % 5 === 0 ? 'SOLVED' : (i % 3 === 0 ? 'ATTEMPTED' : 'UNATTEMPTED'),
                }));
                
                setProblems(mockProblems);
            } catch (err: any) {
                console.error('Failed to fetch problems:', err);
                setError(err.response?.data?.message || 'Failed to load problems');
            } finally {
                setLoading(false);
            }
        };

        fetchProblems();
    }, []);

    const handleProblemClick = (problemId: string | undefined) => {
        if (problemId) {
            navigate(`/problems/${problemId}`);
        }
    };

    // Filter problems based on search, difficulty, and status
    const filteredProblems = problems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = !difficultyFilter || problem.difficulty?.toUpperCase() === difficultyFilter;
        const problemStatus = problem.status?.toUpperCase() || 'UNATTEMPTED';
        const matchesStatus = !statusFilter || problemStatus === statusFilter;
        return matchesSearch && matchesDifficulty && matchesStatus;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProblems = filteredProblems.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, difficultyFilter, statusFilter]); // Added statusFilter dependency
    
    return (
        <div className="min-h-screen bg-theme-primary">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-theme-primary mb-1">Problem Set 🚀</h1>
                    <p className="text-theme-secondary text-sm">Practice coding problems and sharpen your skills</p>
                </div>

                {/* Filter Cards (Difficulty) - More compact and clearer unselected state */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <FilterCard 
                        title="All Problems" 
                        count={problems.length}
                        difficulty="ALL"
                        isActive={difficultyFilter === ''}
                        onClick={() => setDifficultyFilter('')}
                    />
                    <FilterCard 
                        title="Easy" 
                        count={problems.filter(p => p.difficulty?.toUpperCase() === 'EASY').length}
                        difficulty="EASY"
                        isActive={difficultyFilter === 'EASY'}
                        onClick={() => setDifficultyFilter('EASY')}
                    />
                    <FilterCard 
                        title="Medium" 
                        count={problems.filter(p => p.difficulty?.toUpperCase() === 'MEDIUM').length}
                        difficulty="MEDIUM"
                        isActive={difficultyFilter === 'MEDIUM'}
                        onClick={() => setDifficultyFilter('MEDIUM')}
                    />
                    <FilterCard 
                        title="Hard" 
                        count={problems.filter(p => p.difficulty?.toUpperCase() === 'HARD').length}
                        difficulty="HARD"
                        isActive={difficultyFilter === 'HARD'}
                        onClick={() => setDifficultyFilter('HARD')}
                    />
                </div>

                {/* Search & Status Filter Toolbar (Consolidated) */}
                <div className="flex flex-col md:flex-row items-center gap-3 p-4 bg-theme-secondary border border-theme rounded-xl mb-6">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-secondary" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search problems by title..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-theme-primary border border-theme/50 rounded-lg py-2.5 pl-11 pr-4 text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-accent))] focus:border-[hsl(var(--color-accent))] transition-all"
                        />
                    </div>
                    
                    {/* NEW Status Filter */}
                    <StatusSelect statusFilter={statusFilter} setStatusFilter={setStatusFilter} />

                    <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                        {/* Results Count */}
                        <div className="flex items-center gap-1 text-theme-secondary text-sm flex-shrink-0">
                            <span className="font-bold text-theme-primary">{filteredProblems.length}</span>
                            <span className="text-xs">of</span>
                            <span>{problems.length}</span>
                        </div>
                        
                        {/* Clear Button */}
                        {(searchQuery || difficultyFilter || statusFilter) && (
                            <button 
                                onClick={() => { setSearchQuery(''); setDifficultyFilter(''); setStatusFilter(''); }}
                                className="px-3 py-2 text-theme-secondary hover:text-red-500 rounded-lg transition-all font-medium border border-transparent hover:border-red-500/30"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Problem List Container */}
                <div className="bg-theme-secondary border border-theme rounded-xl mb-8">
                    {loading ? (
                        // Loading state
                        <div className="text-center py-20">
                            <div className="w-10 h-10 border-4 border-[hsl(var(--color-accent))] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-theme-secondary">Loading problems...</p>
                        </div>
                    ) : error ? (
                        // Error state
                        <div className="text-center py-12 bg-theme-secondary rounded-xl">
                            <p className="text-red-500 mb-4 text-lg">⚠️ Error: {error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 text-white rounded-lg font-semibold bg-[hsl(var(--color-error))] hover:opacity-90 transition-opacity"
                            >
                                Retry Fetch
                            </button>
                        </div>
                    ) : filteredProblems.length > 0 ? (
                        <>
                            {/* NEW: Column Headers for the list */}
                            <div className="flex items-center justify-between gap-4 p-3 border-b border-theme/30 text-theme-secondary font-semibold text-sm">
                                <span className="w-8 flex justify-center flex-shrink-0">Status</span>
                                <span className="flex-1">Title</span>
                                <span className="w-24 text-center flex-shrink-0">Difficulty</span>
                                <span className="w-16 text-right flex-shrink-0">Time</span>
                            </div>

                            <div className="divide-y divide-theme/30">
                                {currentProblems.map((problem, index) => (
                                    <QuestionListItem
                                        key={problem.id || `problem-${index}`}
                                        problem={problem}
                                        onClick={() => handleProblemClick(problem.id)}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between p-4 border-t border-theme/30">
                                    <div className="text-theme-secondary text-sm">
                                        Showing {startIndex + 1} - {Math.min(endIndex, filteredProblems.length)} of {filteredProblems.length}
                                    </div>
                                    
                                    {/* Pagination buttons (kept simple) */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 text-theme-secondary hover:text-[hsl(var(--color-accent))] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        
                                        <span className="text-theme-primary font-medium text-sm">
                                            {currentPage} / {totalPages}
                                        </span>
                                        
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 text-theme-secondary hover:text-[hsl(var(--color-accent))] rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // No results state
                        <div className="text-center py-20 rounded-xl">
                            <Search size={36} className="mx-auto mb-4 text-theme-secondary" />
                            <p className="text-theme-primary text-lg font-medium">No problems match your filters</p>
                            <p className="text-theme-secondary text-sm mt-1">Try adjusting your search, difficulty, or status filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;