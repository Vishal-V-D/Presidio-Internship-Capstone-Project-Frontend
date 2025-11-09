import React, { useEffect, useState, useContext } from "react";
import { contestService } from "../../api/contestService";
import { AuthContext } from "../../context/AuthContext";
import { showToast } from "../../utils/toast";
import { calculateDurationMinutes, formatDuration } from "../../utils/time";
import { Pencil, Trash, X, Check, Search } from "lucide-react";

type ContestForm = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  durationMinutes: number;
  problemIds: string[];
};

// --- Helpers ---
// Format date for <input type="datetime-local">
const formatForInput = (date: Date) => {
  // Checks for invalid date object
  if (isNaN(date.getTime())) {
    console.error("formatForInput received an Invalid Date object.");
    return ''; // Return empty string to prevent RangeError
  }
  // Convert to local time string (YYYY-MM-DDTHH:MM)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

// --- Component ---
const DEFAULT_DURATION = 60;

const computeEndFromDuration = (start: string, durationMinutes: number): string => {
  if (!start) return "";
  const base = new Date(start);
  if (Number.isNaN(base.getTime())) return "";
  const end = new Date(base.getTime() + Math.max(durationMinutes, 0) * 60000);
  return formatForInput(end);
};

export default function CreateContest() {
  const { user } = useContext(AuthContext)!;

  const now = new Date();
  const defaultStart = formatForInput(new Date(now.getTime() + 10 * 60000)); // +10 mins
  const defaultEnd = computeEndFromDuration(defaultStart, DEFAULT_DURATION);

  const [formData, setFormData] = useState<ContestForm>({
    title: "",
    description: "",
    startDate: defaultStart,
    endDate: defaultEnd,
    durationMinutes: DEFAULT_DURATION,
    problemIds: [],
  });

  const [publicProblems, setPublicProblems] = useState<any[]>([]);
  const [privateProblems, setPrivateProblems] = useState<any[]>([]);
  const [createdContests, setCreatedContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [problemSearch, setProblemSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'private' | 'public'>('private');

  // Helper to safely parse date string and prevent RangeError
  const safeParseDate = (dateString: string, fallbackDate: Date): Date => {
    if (!dateString) return fallbackDate;
    
    // 1. Sanitize: Replace space with 'T', which often fixes server date strings (e.g., "2025-11-06 14:00:00" -> "2025-11-06T14:00:00")
    const sanitizedString = dateString.replace(' ', 'T');
    
    const date = new Date(sanitizedString);
    
    // 2. Check for validity.
    if (isNaN(date.getTime())) {
      console.warn("⚠️ Invalid date string received from API. Using default time.", dateString);
      return fallbackDate;
    }
    
    return date;
  }

  // --- Fetching Logic ---
  const fetchProblems = async () => {
    try {
      const res = await contestService.listProblems(user?.id);
      const problems = res.data?.data ?? res.data ?? [];

      const pub = problems.filter((p: any) => p.accessType === "PUBLIC");
      const priv = problems.filter(
        (p: any) => p.accessType === "PRIVATE" && p.createdBy?.id === user?.id
      );

      setPublicProblems(pub);
      setPrivateProblems(priv);
    } catch (err) {
      console.error("❌ Failed to fetch problems:", err);
      showToast("Failed to fetch problems", "error");
    }
  };

  const fetchCreatedContests = async () => {
    try {
      const res = await contestService.getCreatedContests();
      const list = res.data?.data ?? res.data ?? [];
      const sorted = [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setCreatedContests(sorted);
    } catch (err) {
      console.error("❌ Failed to fetch contests:", err);
      showToast("Failed to fetch contests", "error");
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProblems();
      fetchCreatedContests();
    }
  }, [user]);

  // --- Handlers ---

  // Function to reset form fields
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: defaultStart,
      endDate: defaultEnd,
      durationMinutes: DEFAULT_DURATION,
      problemIds: [],
    });
    setEditId(null);
  }

  // Toggle selected problem
  const toggleProblemSelection = (id: string) => {
    setFormData((prev) => {
      const already = prev.problemIds.includes(id);
      return {
        ...prev,
        problemIds: already
          ? prev.problemIds.filter((pid) => pid !== id)
          : [...prev.problemIds, id],
      };
    });
  };

  // ✅ UPDATED — EDIT HANDLER uses safeParseDate
  const handleEdit = async (contestId: string) => {
    setLoading(true);
    try {
      // 1. Fetch the full contest data
      const res = await contestService.getContestById(contestId);
      const contest = res.data?.data ?? res.data;

      if (!contest) throw new Error("Contest data missing");
      
      // --- SAFELY PARSE DATES ---
      // We use the current default dates as a fallback if the API date is invalid
      const defaultStartDate = new Date(defaultStart);
      const defaultEndDate = new Date(defaultEnd);
      
      const validStartDate = safeParseDate(contest.startDate, defaultStartDate);
      const validEndDate = safeParseDate(contest.endDate, defaultEndDate);
      const resolvedDuration = contest.durationMinutes ?? calculateDurationMinutes(validStartDate, validEndDate) ?? DEFAULT_DURATION;

      // 2. Populate the form
      setFormData({
        title: contest.title,
        description: contest.description,
        startDate: formatForInput(validStartDate), // Now uses the VALID Date object
        endDate: formatForInput(validEndDate),     // Now uses the VALID Date object
        durationMinutes: resolvedDuration,
        problemIds: [],
      });
      setEditId(contestId);
      showToast(`Editing contest: ${contest.title}`, "info");

      // 3. Scroll to the form
      document.getElementById("contest-form")?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error("❌ Failed to fetch contest for edit:", err);
      showToast("Failed to load contest data for editing ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  // DELETE HANDLER (unchanged)
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this contest?")) return;
    try {
      await contestService.deleteContest(id);
      showToast("Contest deleted ✅", "success");
      await fetchCreatedContests();
      if (editId === id) resetForm();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete contest ❌", "error");
    }
  };

  // Filtered problems (unchanged)
  const getFilteredProblems = (problems: any[]) => {
    return problems.filter(p =>
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.id.includes(problemSearch)
    );
  };
  
  const problemsToShow = activeTab === 'private' 
    ? getFilteredProblems(privateProblems) 
    : getFilteredProblems(publicProblems);

  // Create / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast("Contest title is required", "warning");
      return;
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      showToast("End date must be after start date", "warning");
      return;
    }
    
    // Require at least one problem only in CREATE mode
    if (!editId && formData.problemIds.length === 0) {
       showToast("Please select at least one problem for the contest", "warning");
       return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        durationMinutes: formData.durationMinutes,
      };

      let contestId = editId;

      // UPDATE MODE
      if (editId) {
        // Use the updateContest API
        // NOTE: Problem assignment is not handled in UPDATE here.
        await contestService.updateContest(editId, payload);
        showToast("Contest updated successfully ✅", "success");
      } else {
        // CREATE MODE
        const res = await contestService.createContest(payload);
        contestId =
          res.data?.data?.id || res.data?.contest?.id || res.data?._id;
        if (!contestId) throw new Error("Contest ID missing");

        // Add problems after successful creation
        await Promise.all(formData.problemIds.map(pid => 
          contestService.addProblemToContest(contestId!, pid)
        ));

        showToast("Contest created successfully ✅", "success");
      }

      resetForm();
      await fetchCreatedContests();
    } catch (err) {
      console.error(err);
      showToast(`Operation Failed ❌: ${err instanceof Error ? err.message : 'Unknown error'}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // max-w-7xl for expanded width
    <div className="max-w-7xl mx-auto bg-theme-secondary border border-theme rounded-3xl p-8 lg:p-10  animate-fade-in-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-theme-primary tracking-tight">
          {editId ? "Edit Contest Details" : "Create New Contest"}
        </h1>
        {editId && (
          <button
            onClick={resetForm}
            className="flex items-center gap-2 text-theme-secondary hover:text-red-500 transition duration-200 p-2 rounded-full border border-theme hover:border-red-500"
            title="Cancel Editing"
            disabled={loading}
          >
            <X size={20} />
            <span className="hidden sm:inline">Cancel Edit</span>
          </button>
        )}
      </div>
      <p className="text-theme-secondary mb-8">
        Define the core details and select the problems for your coding contest.
      </p>

      {/* 📝 Contest Form */}
      <form onSubmit={handleSubmit} id="contest-form" className="space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h2 className="font-semibold text-2xl text-theme-primary border-b border-theme pb-2 mb-4">
              Contest Details
            </h2>
            
            <input
              type="text"
              placeholder="Contest Title (e.g., Weekly Contest #35)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-3 border rounded-xl bg-theme-primary text-theme-primary focus:ring-theme-accent focus:border-theme-accent outline-none transition duration-200"
              required
              disabled={loading}
            />

            <textarea
              placeholder="Contest Description (Provide key rules, theme, or prizes)"
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 border rounded-xl bg-theme-primary text-theme-primary focus:ring-theme-accent focus:border-theme-accent outline-none transition duration-200"
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-6">
            <h2 className="font-semibold text-2xl text-theme-primary border-b border-theme pb-2 mb-4">
              Timing
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-theme-secondary block mb-2">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      startDate: value,
                      endDate: computeEndFromDuration(value, prev.durationMinutes) || prev.endDate,
                    }));
                  }}
                  className="w-full p-3 border rounded-xl bg-theme-primary text-theme-primary focus:ring-theme-accent focus:border-theme-accent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-theme-secondary block mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      endDate: value,
                      durationMinutes: calculateDurationMinutes(prev.startDate, value) ?? prev.durationMinutes,
                    }));
                  }}
                  className="w-full p-3 border rounded-xl bg-theme-primary text-theme-primary focus:ring-theme-accent focus:border-theme-accent"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-theme-secondary block mb-2">
                Duration (minutes)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={15}
                  step={5}
                  value={formData.durationMinutes}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const sanitized = Number.isFinite(raw) ? Math.max(1, raw) : DEFAULT_DURATION;
                    setFormData((prev) => ({
                      ...prev,
                      durationMinutes: sanitized,
                      endDate: computeEndFromDuration(prev.startDate, sanitized) || prev.endDate,
                    }));
                  }}
                  className="w-32 p-3 border rounded-xl bg-theme-primary text-theme-primary focus:ring-theme-accent focus:border-theme-accent"
                  disabled={loading}
                />
                <span className="text-sm text-theme-secondary">
                  {formatDuration(formData.durationMinutes)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Problems Selection - More Trendy UI */}
        <div className="border border-theme rounded-2xl p-6 bg-theme-primary/30 space-y-5">
          <h3 className="font-bold text-2xl text-theme-primary mb-3">
            Problem Selection
          </h3>
          
          {editId && (
            <div className="p-3 bg-yellow-900/20 text-yellow-300 rounded-lg border border-yellow-800 text-sm">
                ⚠️ **Note:** When editing, problems are *not* automatically added or removed via this form. This section is only for selecting problems during **Contest Creation**. Use a separate interface to manage problems for an existing contest.
            </div>
          )}
          
          {/* Hide problem selection in edit mode for a cleaner UI/UX, as we don't handle updates here */}
          {!editId && (
            <>
                {/* Search and Tabs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-secondary" size={20} />
                    <input
                      type="text"
                      placeholder="Search problems by title or ID..."
                      value={problemSearch}
                      onChange={(e) => setProblemSearch(e.target.value)}
                      className="w-full p-3 pl-10 border rounded-xl bg-theme-primary text-theme-primary focus:ring-theme-accent focus:border-theme-accent outline-none transition duration-200"
                    />
                  </div>
                  
                  <div className="flex space-x-2 p-1 bg-theme-primary rounded-xl border border-theme">
                    <button
                      type="button"
                      onClick={() => setActiveTab('private')}
                      className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                        activeTab === 'private'
                          ? 'bg-theme-secondary shadow-lg text-theme-primary'
                          : 'text-theme-secondary hover:bg-theme-secondary/50'
                      }`}
                    >
                      My Problems ({privateProblems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('public')}
                      className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                        activeTab === 'public'
                          ? 'bg-theme-secondary shadow-lg text-theme-primary'
                          : 'text-theme-secondary hover:bg-theme-secondary/50'
                      }`}
                    >
                      Public Library ({publicProblems.length})
                    </button>
                  </div>
                </div>

                {/* Problems List */}
                <div className="min-h-[150px] max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {problemsToShow.length === 0 ? (
                    <p className="text-theme-secondary p-4 text-center">
                      {problemSearch ? `No results found for "${problemSearch}" in ${activeTab} problems.` : `No ${activeTab} problems available.`}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {problemsToShow.map((p) => {
                        const isSelected = formData.problemIds.includes(p.id);
                        const isPrivate = p.accessType === "PRIVATE";
                        return (
                          <div 
                            key={p.id}
                            onClick={() => toggleProblemSelection(p.id)}
                            className={`
                              p-4 rounded-xl border-2 cursor-pointer transition duration-200 flex items-center justify-between space-x-3
                              ${isSelected 
                                ? 'border-theme-accent bg-theme-accent/20 shadow-md' 
                                : 'border-theme hover:border-theme-accent/50 bg-theme-primary/70'
                              }
                            `}
                          >
                            <div className="flex-grow min-w-0">
                              <p className="font-semibold text-theme-primary truncate">{p.title}</p>
                              <p className="text-xs text-theme-secondary truncate">ID: {p.id}</p>
                            </div>

                            <div className="flex-shrink-0 flex items-center space-x-2">
                              <span 
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  isPrivate 
                                    ? 'bg-yellow-900/70 text-yellow-300' 
                                    : 'bg-green-900/70 text-green-300'
                                }`}
                              >
                                {isPrivate ? "PRIVATE" : "PUBLIC"}
                              </span>
                              
                              {isSelected ? (
                                <Check size={20} className="text-theme-accent" />
                              ) : (
                                <div className="w-5 h-5 border border-theme rounded-full"></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-theme-secondary border border-theme rounded-xl flex justify-between items-center">
                   <span className="font-medium text-theme-primary">
                       {formData.problemIds.length} problem(s) selected
                   </span>
                   {formData.problemIds.length > 0 && (
                      <button 
                          type="button" 
                          onClick={() => setFormData(prev => ({...prev, problemIds: []}))}
                          className="text-sm text-red-500 hover:text-red-700"
                      >
                          Clear All
                      </button>
                   )}
                </div>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="button-theme w-full text-xl py-3 disabled:opacity-50"
        >
          {loading
            ? editId
              ? "Saving Changes..."
              : "Creating Contest..."
            : editId
            ? "Update Contest Details"
            : "Create Contest"}
        </button>
      </form>

      
      <hr className="border-theme my-10" />

      {/* 🚀 Recently Created Contests - Enhanced List */}
      <div className="mb-6">
        <h2 className="font-bold text-3xl mb-4 text-theme-primary">
          Your Contests
        </h2>
        {createdContests.length === 0 ? (
          <div className="p-6 bg-theme-primary/50 border border-theme rounded-xl text-center text-theme-secondary">
            <p className="font-medium">No contests created yet. Get started above!</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {createdContests.map((c) => (
              <li
                key={c.id}
                className={`
                    px-4 py-3 rounded-xl border-l-4 flex justify-between items-center transition duration-300 
                    ${editId === c.id ? 'border-theme-accent bg-theme-accent/10 shadow-lg' : 'border-theme bg-theme-primary/50 hover:bg-theme-primary'}
                `}
              >
                <div className="flex-grow min-w-0">
                  <span className="font-bold text-lg text-theme-primary truncate block">
                    {c.title}
                  </span>
                  <span className="block text-xs text-theme-secondary mt-1">
                    <span className="font-medium">Start:</span>{" "}
                    {new Date(c.startDate).toLocaleString()}
                    <span className="mx-2 text-theme-secondary/70">•</span>
                    <span className="font-medium">End:</span>{" "}
                    {new Date(c.endDate).toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-3 flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleEdit(c.id)}
                    className="p-2 rounded-full text-blue-400 hover:bg-blue-900/50 transition duration-200"
                    title="Edit Contest"
                    disabled={loading}
                  >
                    <Pencil size={20} />
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 rounded-full text-red-400 hover:bg-red-900/50 transition duration-200"
                    title="Delete Contest"
                    disabled={loading}
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}