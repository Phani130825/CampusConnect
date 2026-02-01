import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Briefcase, Code, Eye, Send, Check } from 'lucide-react';

const EntrepreneurDashboard = () => {
    const [problems, setProblems] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', domain: '', requiredSkills: '' });

    // Submissions State
    const [activeProblem, setActiveProblem] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [viewingSubmissions, setViewingSubmissions] = useState(false);

    // Forwarding State
    const [forwardingSolution, setForwardingSolution] = useState(null);
    const [investors, setInvestors] = useState([]);
    const [forwardNote, setForwardNote] = useState('');
    const [selectedInvestor, setSelectedInvestor] = useState('');

    const fetchMyProblems = async () => {
        try {
            const res = await axios.get('/api/problems/my');
            setProblems(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchInvestors = async () => {
        try {
            const res = await axios.get('/api/auth/investors');
            setInvestors(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchMyProblems();
        fetchInvestors();
    }, []);

    const fetchSubmissions = async (problemId) => {
        try {
            const res = await axios.get(`/api/solutions/problem/${problemId}`);
            setSubmissions(res.data);
            setViewingSubmissions(true);
        } catch (err) {
            console.error(err);
            alert('Failed to load submissions');
        }
    };

    const handleOpenSubmissions = (problem) => {
        setActiveProblem(problem);
        fetchSubmissions(problem._id);
    };

    const handleForward = async () => {
        if (!selectedInvestor) return alert('Select an investor');
        try {
            await axios.post(`/api/solutions/${forwardingSolution._id}/forward`, {
                investorId: selectedInvestor,
                recommendationNote: forwardNote
            });
            alert('Solution forwarded successfully!');
            setForwardingSolution(null);
            setForwardNote('');
            setSelectedInvestor('');
            // Refresh submissions to show updated status
            fetchSubmissions(activeProblem._id);
        } catch (err) {
            console.error(err);
            alert('Failed to forward solution');
        }
    };

    const handleAnalyze = async (solutionId, description, problemId) => {
        try {
            // Optimistic update to show loading state if needed, but here we just wait
            const res = await axios.post('/api/ai/analyze-solution', { description, problemId });

            // Update the submissions state with the new AI analysis
            setSubmissions(prev => prev.map(sub =>
                sub._id === solutionId ? { ...sub, aiAnalysis: res.data } : sub
            ));
        } catch (err) {
            console.error(err);
            alert('AI Analysis failed. Check if HUGGING_FACE_TOKEN is set in server/.env');
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/problems', formData);
            setIsCreating(false);
            setFormData({ title: '', description: '', domain: '', requiredSkills: '' });
            fetchMyProblems();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">My Problems</h1>
                    <p className="text-slate-600">Manage your problem statements and review submissions.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-blue-700 transition"
                >
                    <Plus size={20} /> Post New Problem
                </button>
            </div>

            {/* Create Problem Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800">Post a Problem Statement</h2>
                            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Problem Title</label>
                                <input name="title" type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" value={formData.title} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
                                    <input name="domain" type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" value={formData.domain} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills</label>
                                    <input name="requiredSkills" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" value={formData.requiredSkills} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
                                <textarea name="description" required rows="5" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" value={formData.description} onChange={handleChange}></textarea>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2.5 mr-4 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                                <button type="submit" className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow hover:bg-blue-700">Post Problem</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Submissions Modal */}
            {viewingSubmissions && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Submissions</h2>
                                <p className="text-sm text-slate-500">for {activeProblem?.title}</p>
                            </div>
                            <button onClick={() => setViewingSubmissions(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            {submissions.length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-slate-500">No solutions submitted yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {submissions.map(solution => (
                                        <div key={solution._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                        {solution.student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-900">{solution.student.name}</h3>
                                                        <p className="text-xs text-slate-500">{solution.student.profile?.university}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-bold uppercase rounded-full ${solution.status === 'forwarded' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {solution.status}
                                                </span>
                                            </div>

                                            <p className="text-slate-700 mb-4 bg-slate-50 p-4 rounded-lg text-sm leading-relaxed">{solution.description}</p>

                                            {/* AI Analysis Section */}
                                            <div className="mb-4">
                                                {solution.aiAnalysis ? (
                                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                                                <Code size={18} className="text-slate-500" />
                                                                Semantic Relevance Analysis
                                                            </h4>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-xl font-bold text-slate-900">{solution.aiAnalysis.viabilityScore}%</div>
                                                                <span className="px-3 py-1 bg-white rounded-md text-xs font-semibold text-slate-700 border border-slate-200">
                                                                    {solution.aiAnalysis.sentiment}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                                                            {solution.aiAnalysis.analysisSummary}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <span className="font-medium">Model:</span> sentence-transformers/all-MiniLM-L6-v2
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAnalyze(solution._id, solution.description, activeProblem._id)}
                                                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors border border-blue-200 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100"
                                                    >
                                                        Analyze Relevance (AI)
                                                    </button>
                                                )}
                                            </div>


                                            <div className="flex flex-wrap gap-4 mb-6 text-sm">
                                                {solution.documentLink && <a href={solution.documentLink} target="_blank" className="text-primary hover:underline font-medium">View Document</a>}
                                                {solution.prototypeLink && <a href={solution.prototypeLink} target="_blank" className="text-primary hover:underline font-medium">View Prototype</a>}
                                            </div>

                                            <div className="flex justify-end border-t border-slate-100 pt-4">
                                                {solution.status !== 'forwarded' && (
                                                    <button
                                                        onClick={() => setForwardingSolution(solution)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition shadow"
                                                    >
                                                        Forward to Investor <Send size={14} />
                                                    </button>
                                                )}
                                                {solution.status === 'forwarded' && (
                                                    <div className="flex items-center gap-2 text-purple-600 font-medium text-sm">
                                                        <Check size={16} /> Forwarded to Investors
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Forwarding Modal */}
            {forwardingSolution && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Forward to Investor</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Investor</label>
                                <select
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    value={selectedInvestor}
                                    onChange={(e) => setSelectedInvestor(e.target.value)}
                                >
                                    <option value="">-- Choose an Investor --</option>
                                    {investors.map(inv => (
                                        <option key={inv._id} value={inv._id}>{inv.name} {inv.profile?.portfolio && `- ${inv.profile.portfolio}`}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Recommendation Note</label>
                                <textarea
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    rows="3"
                                    placeholder="Why is this solution worth investing in?"
                                    value={forwardNote}
                                    onChange={(e) => setForwardNote(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => setForwardingSolution(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded text-sm font-bold">Cancel</button>
                                <button onClick={handleForward} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow hover:bg-blue-700">Send Recommendation</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Problem List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {problems.map((problem) => (
                    <div key={problem._id} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full">
                                {problem.domain}
                            </span>
                            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${problem.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                                {problem.status}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{problem.title}</h3>
                        <p className="text-slate-600 line-clamp-3 mb-4">{problem.description}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {problem.requiredSkills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded">
                                    {skill}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <div className="text-sm text-slate-500">
                                Posted on {new Date(problem.createdAt).toLocaleDateString()}
                            </div>
                            <button
                                onClick={() => handleOpenSubmissions(problem)}
                                className="flex items-center gap-2 text-primary font-bold text-sm hover:underline"
                            >
                                <Eye size={16} /> View Submissions
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EntrepreneurDashboard;
