import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, Briefcase, Send, X, Sparkles, ArrowRight } from 'lucide-react';

// Configure axios to send cookies
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StudentDashboard = () => {
    const [problems, setProblems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [solutionData, setSolutionData] = useState({
        description: '',
        documentLink: '',
        prototypeLink: ''
    });

    const [recommendations, setRecommendations] = useState([]);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileData, setProfileData] = useState({ skills: '', bio: '' });

    useEffect(() => {
        // Load initial profile data
        const loadProfile = async () => {
            try {
                const res = await axios.get('/api/auth/me');
                if (res.data.profile) {
                    setProfileData({
                        skills: res.data.profile.skills ? res.data.profile.skills.join(', ') : '',
                        bio: res.data.profile.bio || ''
                    });
                }
            } catch (err) { console.error(err); }
        };
        loadProfile();
        fetchProblems();
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const res = await axios.get('/api/ai/recommendations');
            setRecommendations(res.data);
        } catch (err) {
            console.error("Failed to fetch recommendations", err);
        }
    };

    const fetchProblems = async () => {
        try {
            const res = await axios.get('/api/problems');
            setProblems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/auth/profile', profileData);
            alert('Profile updated! Recommendations will now be more accurate.');
            setShowProfileModal(false);
            fetchRecommendations(); // Refresh recommendations
        } catch (err) {
            console.error(err);
            alert('Failed to update profile');
        }
    };

    const handleApply = (problem) => {
        setSelectedProblem(problem);
    };

    const handleChange = (e) => {
        setSolutionData({ ...solutionData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/solutions', {
                problemId: selectedProblem._id,
                ...solutionData
            });
            alert('Solution submitted successfully!');
            setSelectedProblem(null);
            setSolutionData({ description: '', documentLink: '', prototypeLink: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to submit solution');
        }
    };

    const filteredProblems = problems.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.requiredSkills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Edit Profile Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition"
                >
                    <Briefcase size={16} /> Edit Profile & Skills
                </button>
            </div>

            {/* Profile Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Update Profile</h3>
                            <button onClick={() => setShowProfileModal(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
                                <input
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    value={profileData.skills}
                                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                                    placeholder="React, Node.js, AI..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                                <textarea
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary"
                                    rows="3"
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    placeholder="Tell us about your expertise..."
                                ></textarea>
                            </div>
                            <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition">
                                Save & specific Recommendations
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="text-purple-600 fill-purple-100" />
                        <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendations.map(({ problem, score }) => (
                            <div key={problem._id} className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                                <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                    {score}% Match
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2 mt-2">{problem.title}</h3>
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{problem.description}</p>
                                <button
                                    onClick={() => handleApply(problem)}
                                    className="text-sm font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                                >
                                    View Details <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore Problems</h1>
                <p className="text-slate-600 max-w-2xl mx-auto">Find challenges that match your skills and make a real-world impact.</p>

                <div className="mt-8 relative max-w-xl mx-auto">
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 rounded-full border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        placeholder="Search by title, domain, or skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : filteredProblems.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-500">No problems found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProblems.map((problem) => (
                        <div key={problem._id} className="bg-white rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition flex flex-col h-full group">
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {problem.domain}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{problem.title}</h3>
                                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                    <Briefcase size={14} /> Posted by {problem.entrepreneur?.name || 'Entrepreneur'}
                                </p>
                                <p className="text-slate-600 line-clamp-3 mb-4 text-sm leading-relaxed">{problem.description}</p>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {problem.requiredSkills.map((skill, index) => (
                                        <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded border border-slate-200">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 pt-0 mt-auto">
                                <button
                                    onClick={() => handleApply(problem)}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition shadow-md"
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedProblem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-slate-800">Submit Solution</h2>
                            <button onClick={() => setSelectedProblem(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h3 className="font-bold text-blue-900 text-lg mb-1">{selectedProblem.title}</h3>
                                <p className="text-blue-800 text-sm">{selectedProblem.description}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Solution Description</label>
                                    <textarea
                                        name="description"
                                        required
                                        rows="6"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                        placeholder="Describe your approach and solution in detail..."
                                        value={solutionData.description}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Document Link (PDF/Drive)</label>
                                        <input
                                            name="documentLink"
                                            type="url"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                            placeholder="https://..."
                                            value={solutionData.documentLink}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Prototype / Github Link</label>
                                        <input
                                            name="prototypeLink"
                                            type="url"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                            placeholder="https://github.com/..."
                                            value={solutionData.prototypeLink}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProblem(null)}
                                        className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
                                    >
                                        <Send size={18} /> Submit Solution
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
