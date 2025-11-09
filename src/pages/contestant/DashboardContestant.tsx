import  { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Zap, Calendar as CalendarIcon } from 'lucide-react';
import { contestService } from '../../api/contestService';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const IMAGE_PATHS = [
  '/contest1.png', '/contest2.png', '/contest3.png', '/contest4.png', '/contest5.png',
];

const shuffleArray = (array: string[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

const formatContestDateTime = (isoDate?: string) => {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  };
  return date.toLocaleString(undefined, options);
};


// --- Filter Pills ---
const FilterPills = ({ selected, onSelect }: { selected: string, onSelect: (value: string) => void }) => (
  <div className="flex space-x-3 text-sm font-semibold mb-6">
    {['Upcoming', 'Registered', 'Finished'].map((pill) => (
      <button
        key={pill}
        onClick={() => onSelect(pill)}
        className={`py-2 px-6 rounded-full font-semibold transition ${
          selected === pill
            ? 'button-theme text-theme-primary shadow-lg'
            : 'bg-theme-secondary text-theme-secondary hover:bg-gray-100 border border-theme'
        }`}
      >
        {pill}
      </button>
    ))}
  </div>
);

// --- Search Bar ---
const SearchAndFilterBar = ({ searchText, setSearchText }: { searchText: string, setSearchText: (val: string) => void }) => (
  <div className="flex items-center mb-8">
    <div className="flex items-center w-full bg-theme-secondary border border-theme rounded-xl px-4 py-3 shadow-sm focus-within:border-theme-accent">
      <Search className="w-5 h-5 text-theme-secondary mr-3" />
      <input
        type="text"
        placeholder="Search contests..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full focus:outline-none bg-transparent text-theme-primary placeholder-theme-secondary"
      />
    </div>
  </div>
);

// --- Pagination (static placeholder) ---
const Pagination = () => (
  <div className="flex justify-between items-center mt-10 p-4 border-t border-theme">
    <span className="text-sm text-theme-secondary">Showing 1 - 8 contests</span>
    <div className="flex items-center space-x-2">
      <span className="text-sm text-theme-secondary hidden sm:inline">Page 1 of 6</span>
      <button className="p-2 rounded-lg text-theme-secondary border border-theme hover:bg-gray-100 transition">
        <ChevronDown className="w-4 h-4 transform rotate-90" />
      </button>
      <button className={`p-2 rounded-lg button-theme`}>
        <ChevronDown className="w-4 h-4 transform -rotate-90 text-theme-primary" />
      </button>
    </div>
  </div>
);

// --- Contest Card ---
const ContestCard = ({ contest, imageSrc, onAction }: { contest: any, imageSrc: string, onAction: (contest: any) => void }) => {
  const formattedDate = formatContestDateTime(contest.startDate);
  const description = contest.description || 'No description provided.';
  const shortDescription = description.length > 50 ? description.substring(0, 50) + '...' : description;

  const now = new Date();
  const endDate = new Date(contest.endDate);
  const isExpired = endDate < now;

  // Always show "View More" unless expired
  const buttonText = isExpired ? 'Expired' : 'View More';
  const buttonClass = isExpired
    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
    : 'button-theme text-theme-primary shadow-lg';

  return (
    <div className="bg-theme-secondary rounded-xl shadow-3xl overflow-hidden transition duration-300 hover:scale-[1.01] animate-fade-in-slide-up">
      <div className="relative h-48 w-full">
        <img src={imageSrc} alt={contest.title} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 bg-theme-secondary/80 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-theme-primary">
          {contest.problemCount || 'N/A'} Problems • {contest.difficulty || 'Unknown'}
        </span>
        <span className="absolute top-3 right-3 text-theme-primary text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'hsl(var(--color-accent))' }}>
          {isExpired ? 'FINISHED' : contest.isRegistered ? 'REGISTERED' : 'UPCOMING'}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-theme-primary truncate mb-1">{contest.title}</h3>
        <p className="text-sm text-theme-secondary mb-3">{shortDescription}</p>
        <div className="flex justify-between items-center pt-3 border-t border-theme">
          <div className="flex items-center text-sm font-medium text-theme-primary">
            <Zap className="w-4 h-4 mr-2 text-theme-secondary" />
            <span className="text-xs sm:text-sm">{formattedDate}</span>
          </div>
          <button 
            className={`py-2 px-4 rounded-lg font-semibold text-sm transition duration-200 ${buttonClass}`}
            onClick={() => !isExpired && onAction(contest)}
            disabled={isExpired}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Dashboard ---
const ContestDashboard = () => {
  const [contests, setContests] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('Upcoming');
  const [searchText, setSearchText] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const allRes = await contestService.listContests();
        console.log(allRes);
        const regRes = await contestService.getRegisteredContests();
        const registeredIds = regRes.data.map((c: any) => c.id);

        const mappedContests = allRes.data.map((contest: any) => ({
          id: contest.id,
          title: contest.title,
          description: contest.description || 'No description provided',
          startDate: contest.startTime,
          endDate: contest.endTime,
          problemCount: contest.contestProblems?.length || 0,
          difficulty: contest.difficulty || 'Medium',
          isRegistered: registeredIds.includes(contest.id)
        }));

        setContests(mappedContests);
      } catch (error) {
        console.error('Contest fetch error:', error);
      }
    };

    fetchContests();
  }, []);

  const filteredContests = useMemo(() => {
    return contests.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchText.toLowerCase());
      const now = new Date();
      const start = new Date(c.startDate);
      const end = new Date(c.endDate);
      const matchesFilter =
        filter === 'Upcoming' ? !c.isRegistered && start > now :
        filter === 'Registered' ? c.isRegistered :
        filter === 'Finished' ? end < now :
        true;
      
      // Date filter
      const matchesDate = selectedDate 
        ? start.toDateString() === selectedDate.toDateString()
        : true;
      
      return matchesSearch && matchesFilter && matchesDate;
    });
  }, [contests, filter, searchText, selectedDate]);

  const allImages = [...IMAGE_PATHS];
  while (allImages.length < filteredContests.length) allImages.push(...IMAGE_PATHS);
  const uniqueShuffledImages = shuffleArray(allImages).slice(0, filteredContests.length);

  const handleAction = async (contest: any) => {
    try {
      const response = await contestService.getContestById(contest.id);
      console.log('Contest Details:', response.data);
      navigate(`/contest/${contest.id}`, { state: { contest: response.data } });
    } catch (error) {
      console.error('Failed to fetch contest details', error);
    }
  };

  // Get contest dates for calendar highlighting
  const contestDates = useMemo(() => {
    return contests
      .filter(c => c.isRegistered)
      .map(c => new Date(c.startDate).toDateString());
  }, [contests]);

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();
      if (contestDates.includes(dateStr)) {
        return 'contest-date';
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-theme-primary p-4 sm:p-8 lg:p-12 font-sans">
      <div className="max-w-8xl mx-auto">
        {/* 75:25 Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[75fr_25fr] gap-8">
          {/* Left Section - 75% */}
          <main className="mt-0 p-6 bg-theme-secondary rounded-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-theme-primary mb-2">Contest Arena</h1>
                {selectedDate && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-theme-secondary">
                      Showing contests for: {selectedDate.toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="text-xs px-3 py-1 rounded-full bg-theme-primary text-theme-accent hover:bg-theme-accent hover:text-theme-primary transition-all border border-theme-accent"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>
              <FilterPills selected={filter} onSelect={setFilter} />
            </div>
            <SearchAndFilterBar searchText={searchText} setSearchText={setSearchText} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContests.map((contest, index) => (
                <ContestCard key={contest.id} contest={contest} imageSrc={uniqueShuffledImages[index]} onAction={handleAction} />
              ))}
            </div>
            {filteredContests.length === 0 && (
              <div className="text-center py-12 text-theme-secondary">
                <p className="text-lg">No contests found</p>
              </div>
            )}
            <Pagination />
          </main>

          {/* Right Section - 25% Calendar & Stats */}
          <aside className="space-y-6">
            {/* Calendar Widget */}
            <div className="bg-theme-secondary rounded-xl p-5 shadow-lg sticky top-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-theme">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" style={{ color: 'hsl(var(--color-accent))' }} />
                  <h2 className="text-lg font-bold text-theme-primary">Contest Calendar</h2>
                </div>
              </div>
              <div className="calendar-container">
                <Calendar
                  tileClassName={tileClassName}
                  onClickDay={(date) => setSelectedDate(date)}
                  value={selectedDate}
                  className="w-full border-none bg-transparent text-theme-primary modern-calendar"
                />
              </div>
              <div className="mt-4 pt-4 border-t border-theme space-y-2">
                <div className="flex items-center gap-2 text-xs text-theme-secondary">
                  <div className="w-3 h-3 rounded-sm border-2" style={{ borderColor: 'hsl(var(--color-accent))' }}></div>
                  <span>Registered Events</span>
                </div>
                <p className="text-[10px] text-theme-secondary italic">Click a date to filter contests</p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-theme-secondary rounded-xl p-5 shadow-lg">
              <h3 className="text-base font-bold text-theme-primary mb-3 pb-2 border-b border-theme">Quick Stats</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center p-2.5 bg-theme-primary rounded-lg">
                  <span className="text-xs text-theme-secondary font-medium">Total Contests</span>
                  <span className="text-base font-bold text-theme-primary">{contests.length}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-theme-primary rounded-lg">
                  <span className="text-xs text-theme-secondary font-medium">Registered</span>
                  <span className="text-base font-bold" style={{ color: 'hsl(var(--color-accent))' }}>
                    {contests.filter(c => c.isRegistered).length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-theme-primary rounded-lg">
                  <span className="text-xs text-theme-secondary font-medium">Upcoming</span>
                  <span className="text-base font-bold text-theme-primary">
                    {contests.filter(c => !c.isRegistered && new Date(c.startDate) > new Date()).length}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

    
    </div>
  );
};

export default ContestDashboard;
