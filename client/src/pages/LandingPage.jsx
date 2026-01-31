import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Users, Briefcase, TrendingUp } from 'lucide-react';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen pt-16 bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
            {/* Hero Section */}
            <header className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight mb-6 animate-fade-in-up">
                    CAMPUS CONNECT
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
                    Bridging the gap between <span className="font-semibold text-slate-800">Students</span>, <span className="font-semibold text-slate-800">Entrepreneurs</span>, and <span className="font-semibold text-slate-800">Investors</span>.
                </p>

                <div className="flex gap-4">
                    {user ? (
                        <Link to="/dashboard" className="px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1">
                            Go to Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/register" className="px-8 py-4 bg-primary text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all transform hover:-translate-y-1 flex items-center gap-2">
                                Get Started <ArrowRight size={20} />
                            </Link>
                            <Link to="/login" className="px-8 py-4 bg-white text-slate-800 border border-slate-200 rounded-full font-bold shadow-md hover:shadow-lg hover:bg-slate-50 transition-all transform hover:-translate-y-1">
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </header>

            {/* Feature Section */}
            <section className="py-20 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Users className="w-10 h-10 text-blue-500" />}
                        title="For Students"
                        description="Showcase your skills by solving real-world problems. Connect with entrepreneurs and build your portfolio."
                    />
                    <FeatureCard
                        icon={<Briefcase className="w-10 h-10 text-purple-500" />}
                        title="For Entrepreneurs"
                        description="Post your challenges and find the perfect talent. innovative solutions from a vast pool of student innovators."
                    />
                    <FeatureCard
                        icon={<TrendingUp className="w-10 h-10 text-green-500" />}
                        title="For Investors"
                        description="Discover promising ventures and talented teams early. Invest in the future of innovation."
                    />
                </div>
            </section>

            <footer className="py-8 text-center text-slate-400 text-sm">
                &copy; 2026 Campus Connect - Keshav Memorial Institute of Technology
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="p-8 bg-white rounded-2xl shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-300 group">
        <div className="mb-4 p-3 bg-slate-50 rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
        <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
