// src/pages/organizer/ProblemCreate.tsx
import { useState, useEffect } from "react";
import { contestService } from "../../api/contestService";
import { showToast } from "../../utils/toast";
// Removed unused imports: Copy, Search
import { Code2, Plus, Trash2, CheckCircle2, Clock, Database, Lock, Unlock, Edit, X } from "lucide-react";

// --- Types ---
type ProblemShape = {
    id: string | number;
    title: string;
    description: string;
    difficulty?: string;
    accessType: "PUBLIC" | "PRIVATE";
    timeLimit?: number;
    memoryLimit?: number;
};

type TestCaseShape = {
    input: string;
    expectedOutput: string;
    isSample: boolean;
};

// --- Problem Card Component ---
interface ProblemCardProps {
    problem: ProblemShape;
    onEdit: (p: ProblemShape) => void;
    onDelete: (id: string | number) => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onEdit, onDelete }) => {
    const difficultyClass = 
        problem.difficulty === 'EASY' ? 'bg-green-500/20 text-green-400' :
        problem.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400';

    return (
        <div className="bg-theme-secondary border border-theme rounded-lg p-3 hover:border-theme-accent transition-all group shadow-sm">
            <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-theme-primary text-base group-hover:text-theme-accent transition-colors flex-1 line-clamp-1">
                    {problem.title}
                </h3>
                {/* FIX: Removed 'title' prop which caused the Type Error (Code 2322) */}
                {problem.accessType === 'PUBLIC' ? (
                    <Unlock size={14} className="text-green-500" />
                ) : (
                    <Lock size={14} className="text-yellow-500" />
                )}
            </div>
            <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${difficultyClass}`}>
                    {problem.difficulty || 'N/A'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-theme-primary/10 text-theme-secondary">
                    {problem.accessType}
                </span>
            </div>
            <div className="flex gap-2 text-xs">
                <button
                    type="button"
                    onClick={() => onEdit(problem)}
                    // Correct HSL style syntax
                    style={{ backgroundColor: `hsl(var(--color-accent))` }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 hover:opacity-80 text-theme-primary rounded-md transition-colors font-medium"
                >
                    <Edit size={12} />
                    Edit
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(problem.id)}
                    // Correct HSL style syntax
                    style={{ backgroundColor: `hsl(var(--color-error))` }}
                    className="flex items-center justify-center px-2 py-1.5 hover:opacity-80 text-theme-primary rounded-md transition-colors"
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    );
};
// --- End Problem Card Component ---

// --- Main Component ---
export default function ProblemCreate() {
    const [problem, setProblem] = useState({
        title: "",
        description: "",
        difficulty: "EASY",
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        accessType: "PRIVATE",
        timeLimit: 1,
        memoryLimit: 256,
    });

    const [testCases, setTestCases] = useState<TestCaseShape[]>([
        { input: "", expectedOutput: "", isSample: true },
    ]);

    const [problems, setProblems] = useState<ProblemShape[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingProblem, setEditingProblem] = useState<ProblemShape | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // 🔄 Load Problems
    const loadProblems = async () => {
        try {
            const res = await contestService.listProblems();
            const list = res.data?.data ?? res.data?.problems ?? res.data ?? [];
            setProblems(list);
        } catch (err) {
            console.error("❌ Failed to load problems:", err);
            showToast("Failed to fetch problems", "error");
        }
    };

    // ✏️ Edit Problem
    const handleEditProblem = (prob: ProblemShape) => {
        setEditingProblem(prob);
        setProblem({
            title: prob.title,
            description: prob.description,
            difficulty: prob.difficulty || "EASY",
            inputFormat: "", // Placeholder or fetched detail
            outputFormat: "", // Placeholder or fetched detail
            constraints: "", // Placeholder or fetched detail
            accessType: prob.accessType,
            timeLimit: prob.timeLimit || 1,
            memoryLimit: prob.memoryLimit || 256,
        });
        setShowEditModal(true);
    };

    // 🗑️ Delete Problem
    const handleDeleteProblem = async (id: string | number) => {
        if (!window.confirm("Are you sure you want to delete this problem?")) return;
        try {
            await contestService.deleteProblem(String(id));
            showToast("✅ Problem deleted!", "success");
            await loadProblems();
        } catch (err) {
            console.error(err);
            showToast("❌ Failed to delete problem", "error");
        }
    };

    useEffect(() => {
        loadProblems();
    }, []);

    // 🧠 Handle input changes
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setProblem((p) => ({ ...p, [name]: value }));
    };

    const handleTestcaseChange = (index: number, field: keyof TestCaseShape, value: string | boolean) => {
        setTestCases((prev) => {
            const copy = [...prev];
            (copy[index] as any)[field] = value;
            return copy;
        });
    };

    const addTestCase = () =>
        setTestCases((prev) => [...prev, { input: "", expectedOutput: "", isSample: false }]);

    const removeTestCase = (index: number) =>
        setTestCases((prev) => prev.filter((_, i) => i !== index));

    // 🚀 Submit Problem
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!problem.title.trim()) {
            showToast("Problem title is required", "warning");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                title: problem.title,
                description: problem.description,
                difficulty: problem.difficulty,
                constraints: problem.constraints,
                inputFormat: problem.inputFormat,
                outputFormat: problem.outputFormat,
                accessType: problem.accessType as "PUBLIC" | "PRIVATE",
                timeLimit: Number(problem.timeLimit),
                memoryLimit: Number(problem.memoryLimit),
            };

            // 1️⃣ Create Problem
            const res = await contestService.createProblem(payload);
            const created = res.data?.data ?? res.data;
            const problemId = created?.id ?? created?.problem?.id;
            if (!problemId) throw new Error("Problem creation failed (no ID returned)");

            // 2️⃣ Add Testcases
            for (const tc of testCases) {
                if (!tc.input.trim() && !tc.expectedOutput.trim()) continue;
                await contestService.addTestcaseToProblem(problemId, {
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isHidden: !tc.isSample,
                });
            }

            showToast(" Problem created successfully!", "success");

            // 3️⃣ Reset and reload
            setProblem({
                title: "",
                description: "",
                difficulty: "EASY",
                inputFormat: "",
                outputFormat: "",
                constraints: "",
                accessType: "PRIVATE",
                timeLimit: 1,
                memoryLimit: 256,
            });
            setTestCases([{ input: "", expectedOutput: "", isSample: true }]);
            await loadProblems();
        } catch (err) {
            console.error("❌ Problem creation failed:", err);
            showToast("Failed to create problem", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🔄 Update Problem
    const handleUpdateProblem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProblem) return;

        try {
            setLoading(true);
            const payload = {
                title: problem.title,
                description: problem.description,
                difficulty: problem.difficulty,
                constraints: problem.constraints,
                inputFormat: problem.inputFormat,
                outputFormat: problem.outputFormat,
                accessType: problem.accessType as "PUBLIC" | "PRIVATE",
                timeLimit: Number(problem.timeLimit),
                memoryLimit: Number(problem.memoryLimit),
            };

            await contestService.updateProblem(String(editingProblem.id), payload);
            showToast("✅ Problem updated successfully!", "success");
            
            setShowEditModal(false);
            setEditingProblem(null);
            setProblem({
                title: "",
                description: "",
                difficulty: "EASY",
                inputFormat: "",
                outputFormat: "",
                constraints: "",
                accessType: "PRIVATE",
                timeLimit: 1,
                memoryLimit: 256,
            });
            await loadProblems();
        } catch (err) {
            console.error("❌ Problem update failed:", err);
            showToast("Failed to update problem", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-theme-primary p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-theme-primary mb-1 flex items-center gap-3">
                        {/* Style prop for accent color */}
                        <Code2 size={28} style={{ color: `hsl(var(--color-accent))` }} />
                        Problem Editor
                    </h1>
                    <p className="text-theme-secondary text-sm">Design coding challenges and manage existing problems.</p>
                </div>

                {/* --- FLEXIBLE MAIN CONTENT GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                    
                    {/* LEFT COLUMN: CREATE PROBLEM FORM */}
                    <div className="bg-theme-secondary border border-theme rounded-xl p-6 h-fit">
                        <h2 className="text-xl font-bold text-theme-primary mb-6 border-b border-theme/50 pb-3">Create New Challenge</h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            
                            {/* Primary Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-theme-secondary mb-1">Title *</label>
                                    <input
                                        name="title"
                                        placeholder="Two Sum Problem"
                                        value={problem.title}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-theme-primary border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-theme-secondary mb-1">Difficulty *</label>
                                    <select
                                        name="difficulty"
                                        value={problem.difficulty}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-theme-primary border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-all"
                                    >
                                        <option value="EASY">🟢 Easy</option>
                                        <option value="MEDIUM">🟡 Medium</option>
                                        <option value="HARD">🔴 Hard</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-theme-secondary mb-1">Description *</label>
                                <textarea
                                    name="description"
                                    placeholder="Describe the problem in detail..."
                                    rows={4}
                                    value={problem.description}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-theme-primary border border-theme rounded-lg text-sm text-theme-primary resize-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-all"
                                    required
                                />
                            </div>
                            
                            {/* Limits & Access */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-theme/50 rounded-lg p-4 bg-theme-secondary/50">
                                <div>
                                    <label className="block text-xs font-medium text-theme-secondary mb-1 flex items-center gap-1">
                                        <Clock size={14} className="text-blue-500" /> Time (s)
                                    </label>
                                    <input
                                        name="timeLimit"
                                        type="number"
                                        min="1"
                                        value={problem.timeLimit}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-theme-secondary mb-1 flex items-center gap-1">
                                        <Database size={14} className="text-green-500" /> Memory (MB)
                                    </label>
                                    <input
                                        name="memoryLimit"
                                        type="number"
                                        min="1"
                                        value={problem.memoryLimit}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-theme-secondary mb-1">Access *</label>
                                    <select
                                        name="accessType"
                                        value={problem.accessType}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-all"
                                    >
                                        <option value="PRIVATE">🔒 Private</option>
                                        <option value="PUBLIC">🔓 Public</option>
                                    </select>
                                </div>
                            </div>

                            {/* Format/Constraints */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-theme-secondary mb-1">Input Format</label>
                                    <textarea
                                        name="inputFormat"
                                        rows={3}
                                        className="w-full px-3 py-2 bg-theme-primary border border-theme rounded-lg text-sm text-theme-primary resize-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-theme-secondary mb-1">Output Format</label>
                                    <textarea
                                        name="outputFormat"
                                        rows={3}
                                        className="w-full px-3 py-2 bg-theme-primary border border-theme rounded-lg text-sm text-theme-primary resize-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent"
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-theme-secondary mb-1">Constraints</label>
                                    <textarea
                                        name="constraints"
                                        rows={3}
                                        className="w-full px-3 py-2 bg-theme-primary border border-theme rounded-lg text-sm text-theme-primary resize-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent"
                                    />
                                </div>
                            </div>


                            {/* Test Cases */}
                            <div className="border border-theme rounded-lg p-4 bg-theme-primary/70">
                                <div className="flex items-center justify-between mb-4 border-b border-theme/50 pb-2">
                                    <h3 className="font-bold text-theme-primary text-base">Test Cases</h3>
                                    <button
                                        type="button"
                                        onClick={addTestCase}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors text-sm font-medium button-theme !shadow-none !py-2 !px-4"
                                    >
                                        <Plus size={14} />
                                        Add
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {testCases.map((tc, idx) => (
                                        <div key={idx} className="p-3 border border-theme rounded-lg bg-theme-secondary/70">
                                            <div className="flex justify-between items-center mb-2">
                                                <strong className="text-theme-primary text-sm">Case {idx + 1}</strong>
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-1 text-xs text-theme-secondary cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={tc.isSample}
                                                            onChange={(e) => handleTestcaseChange(idx, "isSample", e.target.checked)}
                                                            className="form-checkbox h-3.5 w-3.5 rounded text-theme-accent border-theme bg-theme-primary focus:ring-theme-accent"
                                                        />
                                                        Sample
                                                    </label>
                                                    {testCases.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTestCase(idx)}
                                                            className="flex items-center text-xs text-red-500 hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] text-theme-secondary mb-1 uppercase tracking-wider">Input</label>
                                                    <textarea
                                                        rows={2}
                                                        value={tc.input}
                                                        onChange={(e) => handleTestcaseChange(idx, "input", e.target.value)}
                                                        className="w-full px-2 py-1 bg-theme-primary border border-theme rounded-md text-theme-primary font-mono text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-theme-secondary mb-1 uppercase tracking-wider">Expected Output</label>
                                                    <textarea
                                                        rows={2}
                                                        value={tc.expectedOutput}
                                                        onChange={(e) => handleTestcaseChange(idx, "expectedOutput", e.target.value)}
                                                        className="w-full px-2 py-1 bg-theme-primary border border-theme rounded-md text-theme-primary font-mono text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base button-theme"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-theme-primary"></div>
                                        Creating Problem...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Create Problem
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    
                    {/* RIGHT COLUMN: EXISTING PROBLEMS LIST (STICKY) */}
                    {problems.length > 0 && (
                        <div className="sticky top-6 self-start bg-theme-secondary border border-theme rounded-xl p-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
                            <h2 className="text-xl font-bold text-theme-primary mb-4 border-b border-theme/50 pb-3">Your Problems ({problems.length})</h2>
                            <div className="space-y-4">
                                {problems.map((p) => (
                                    <ProblemCard 
                                        key={p.id} 
                                        problem={p} 
                                        onEdit={handleEditProblem} 
                                        onDelete={handleDeleteProblem} 
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                </div>
                {/* --- END FLEXIBLE MAIN CONTENT GRID --- */}


                {/* Edit Modal */}
                {showEditModal && editingProblem && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-theme-secondary border border-theme rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto relative">
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingProblem(null);
                                }}
                                className="absolute top-4 right-4 text-theme-secondary hover:text-theme-primary transition-colors p-1"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-bold text-theme-primary mb-6 border-b border-theme/50 pb-3">Edit Problem: {editingProblem.title}</h2>

                            <form onSubmit={handleUpdateProblem} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-theme-secondary mb-1">Title *</label>
                                    <input
                                        name="title"
                                        value={problem.title}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-theme-primary border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-theme-secondary mb-1">Description *</label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        value={problem.description}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-theme-primary border border-theme rounded-lg text-sm text-theme-primary resize-none focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-theme-secondary mb-1">Difficulty *</label>
                                        <select
                                            name="difficulty"
                                            value={problem.difficulty}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-theme-primary border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-all"
                                        >
                                            <option value="EASY">🟢 Easy</option>
                                            <option value="MEDIUM">🟡 Medium</option>
                                            <option value="HARD">🔴 Hard</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-theme-secondary mb-1">Access Type *</label>
                                        <select
                                            name="accessType"
                                            value={problem.accessType}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 bg-theme-primary border border-theme rounded-lg text-sm text-theme-primary focus:ring-2 focus:ring-theme-accent focus:border-theme-accent transition-all"
                                        >
                                            <option value="PRIVATE">🔒 Private</option>
                                            <option value="PUBLIC">🔓 Public</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-3 border-t border-theme/50">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingProblem(null);
                                        }}
                                        className="flex-1 px-4 py-2 bg-theme-primary hover:bg-theme-secondary text-theme-primary rounded-lg transition-all text-sm font-semibold border border-theme"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm button-theme !shadow-none !py-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-theme-primary"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 size={16} />
                                                Update Problem
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}