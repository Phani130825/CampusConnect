import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Users, Briefcase, TrendingUp, ChevronRight, Hexagon } from 'lucide-react';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen pt-16 bg-slate-50 flex flex-col font-sans">
            {/* Hero Section */}
            <header className="relative overflow-hidden pt-20 pb-24">
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-100/50 skew-x-12 translate-x-20"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6">
                        <Hexagon size={12} className="fill-blue-700" /> Next Gen Collaboration
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-8">
                        The Future of <br className="hidden md:block" />
                        <span className="text-blue-600">Student Innovation</span>
                    </h1>

                    <p className="text-xl text-slate-600 max-w-2xl mb-12 leading-relaxed font-light">
                        Campus Connect is the premier ecosystem bridging the gap between academic talent and industry capital.
                        Deploy solutions, secure funding, and scale ideas.
                    </p>

                    <div className="flex gap-4">
                        {user ? (
                            <Link to="/dashboard" className="px-8 py-4 bg-slate-900 text-white rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
                                Access Dashboard <ArrowRight size={20} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
                                    Get Started <ChevronRight size={20} />
                                </Link>
                                <Link to="/login" className="px-8 py-4 bg-white text-slate-800 border border-slate-200 rounded-lg font-bold shadow-sm hover:bg-slate-50 transition-all">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Feature Section */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Ecosystem Architecture</h2>
                        <p className="text-slate-500 mt-4">Three pillars of innovation working in sync.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-blue-600" />}
                            title="Student Innovators"
                            description="Deploy technical solutions to real-world problem statements. Build a verified portfolio of shipped code."
                        />
                        <FeatureCard
                            icon={<Briefcase className="w-8 h-8 text-slate-800" />}
                            title="Enterprise Partners"
                            description="Source elite talent and technical solutions. Accelerate R&D through academic partnerships."
                        />
                        <FeatureCard
                            icon={<TrendingUp className="w-8 h-8 text-emerald-600" />}
                            title="Venture Capital"
                            description="Early access to high-potential technical teams and pre-seed investment opportunities."
                        />
                    </div>
                </div>
            </section>

            <footer className="py-12 bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="font-semibold text-slate-100 tracking-wider">CAMPUS CONNECT</span>
                    <span>&copy; 2026 Keshav Memorial Institute of Technology</span>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 group">
        <div className="mb-6 p-4 bg-white rounded-lg border border-slate-100 shadow-sm inline-block group-hover:scale-105 transition-transform">{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed text-sm">{description}</p>
    </div>
);

export default LandingPage;
