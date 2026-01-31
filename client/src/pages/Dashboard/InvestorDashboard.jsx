import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, FileText, User, ArrowRight } from 'lucide-react';

const InvestorDashboard = () => {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSolutions();
    }, []);

    const fetchSolutions = async () => {
        try {
            const res = await axios.get('/api/solutions/forwarded');
            setSolutions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Investment Opportunities</h1>
                <p className="text-slate-600">Review solutions forwarded by entrepreneurs.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : solutions.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                    <h3 className="text-xl font-bold text-slate-700">No opportunities yet</h3>
                    <p className="text-slate-500 mt-2">Solutions forwarded to you will appear here.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {solutions.map((solution) => (
                        <div key={solution._id} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                            <div className="md:flex">
                                <div className="md:w-1/3 bg-slate-50 p-6 border-r border-slate-100">
                                    <div className="mb-4">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Problem Statement</span>
                                        <h3 className="text-lg font-bold text-slate-900 mt-1">{solution.problem?.title}</h3>
                                        <p className="text-sm text-slate-600 mt-2 line-clamp-3">{solution.problem?.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                        <User size={16} className="text-primary" />
                                        <span className="font-medium">{solution.student?.name}</span>
                                    </div>
                                </div>

                                <div className="md:w-2/3 p-6">
                                    <div className="mb-6">
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
                                            Entrepreneur's Recommendation
                                        </span>
                                        <p className="text-slate-800 mt-3 italic text-lg border-l-4 border-blue-500 pl-4 py-1">
                                            "{solution.recommendationNote}"
                                        </p>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="font-bold text-slate-900 mb-2">Solution Overview</h4>
                                        <p className="text-slate-600 leading-relaxed">{solution.description}</p>
                                    </div>

                                    <div className="flex gap-4">
                                        {solution.documentLink && (
                                            <a href={solution.documentLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium">
                                                <FileText size={16} /> View Document
                                            </a>
                                        )}
                                        {solution.prototypeLink && (
                                            <a href={solution.prototypeLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition text-sm font-medium">
                                                <ExternalLink size={16} /> View Prototype
                                            </a>
                                        )}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                                        <button className="px-6 py-2 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition">
                                            Skip
                                        </button>
                                        <button
                                            onClick={() => window.open(`mailto:${solution.student?.email || ''}?subject=Interest in your solution for ${solution.problem?.title}&body=Hi ${solution.student?.name}, I saw your solution on Campus Connect...`)}
                                            className="px-6 py-2 bg-primary text-white rounded-lg font-bold shadow hover:bg-blue-700 transition flex items-center gap-2"
                                        >
                                            Connect <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InvestorDashboard;
