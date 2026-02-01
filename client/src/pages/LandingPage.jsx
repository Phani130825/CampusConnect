import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
    ArrowRight, Users, Briefcase, TrendingUp, ChevronRight, Hexagon,
    Target, Lightbulb, Rocket, CheckCircle2, Code, Award,
    Globe, Shield, Zap, MessageSquare, Star, BarChart3
} from 'lucide-react';

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

            {/* Stats Section */}
            <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <StatCard number="500+" label="Active Students" />
                        <StatCard number="150+" label="Problems Solved" />
                        <StatCard number="75+" label="Entrepreneurs" />
                        <StatCard number="30+" label="Investors Connected" />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">How It Works</h2>
                        <p className="text-slate-500 mt-4">A seamless process from problem to solution</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connector Lines */}
                        <div className="hidden md:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200"></div>

                        <ProcessCard
                            step="1"
                            icon={<Target className="w-8 h-8" />}
                            title="Post Problems"
                            description="Entrepreneurs share real-world business challenges that need innovative solutions"
                            bgColor="bg-blue-50"
                            textColor="text-blue-600"
                        />
                        <ProcessCard
                            step="2"
                            icon={<Lightbulb className="w-8 h-8" />}
                            title="Submit Solutions"
                            description="Students propose creative solutions leveraging their skills and expertise"
                            bgColor="bg-purple-50"
                            textColor="text-purple-600"
                        />
                        <ProcessCard
                            step="3"
                            icon={<Rocket className="w-8 h-8" />}
                            title="Connect & Grow"
                            description="Investors discover talent while students gain experience and opportunities"
                            bgColor="bg-emerald-50"
                            textColor="text-emerald-600"
                        />
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Why Choose Campus Connect?</h2>
                        <p className="text-slate-500 mt-4">Powered by cutting-edge technology and real connections</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <BenefitCard
                            icon={<Zap className="w-6 h-6 text-yellow-600" />}
                            title="AI-Powered Matching"
                            description="Smart recommendations match students with problems based on their skills and interests"
                        />
                        <BenefitCard
                            icon={<Shield className="w-6 h-6 text-blue-600" />}
                            title="Secure Platform"
                            description="JWT authentication and role-based access control ensure data protection"
                        />
                        <BenefitCard
                            icon={<Code className="w-6 h-6 text-green-600" />}
                            title="Real-World Experience"
                            description="Students work on actual business problems, not hypothetical scenarios"
                        />
                        <BenefitCard
                            icon={<Award className="w-6 h-6 text-purple-600" />}
                            title="Build Your Portfolio"
                            description="Showcase your solutions and get recognized by industry leaders"
                        />
                        <BenefitCard
                            icon={<Globe className="w-6 h-6 text-indigo-600" />}
                            title="Global Network"
                            description="Connect with entrepreneurs and investors from around the world"
                        />
                        <BenefitCard
                            icon={<BarChart3 className="w-6 h-6 text-orange-600" />}
                            title="Track Progress"
                            description="Monitor your impact with detailed analytics and performance metrics"
                        />
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Success Stories</h2>
                        <p className="text-slate-500 mt-4">See how Campus Connect transforms ideas into reality</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <UseCaseCard
                            category="E-Commerce"
                            title="Inventory Management System"
                            description="A student developed an AI-powered inventory prediction system that helped a startup reduce waste by 35%"
                            stats={["3 weeks delivery", "35% cost reduction", "$50K funding secured"]}
                        />
                        <UseCaseCard
                            category="FinTech"
                            title="Mobile Banking Solution"
                            description="Computer science students built a secure mobile banking app prototype that attracted seed investment"
                            stats={["5 team members", "2 months development", "$100K investment"]}
                        />
                        <UseCaseCard
                            category="Healthcare"
                            title="Telemedicine Platform"
                            description="Medical tech solution connecting patients with doctors, now serving 1000+ users daily"
                            stats={["1000+ daily users", "98% satisfaction", "Expanding nationwide"]}
                        />
                        <UseCaseCard
                            category="EdTech"
                            title="Learning Management System"
                            description="Innovative LMS with personalized learning paths, acquired by education company"
                            stats={["10K+ students", "Company acquisition", "Featured in TechCrunch"]}
                        />
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">What Our Community Says</h2>
                        <p className="text-slate-500 mt-4">Real feedback from students, entrepreneurs, and investors</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="Campus Connect helped me land my first internship. The real-world problems gave me experience that stood out in interviews."
                            author="Priya Sharma"
                            role="Computer Science Student"
                            rating={5}
                        />
                        <TestimonialCard
                            quote="We found our lead developer through this platform. The quality of talent and solutions is exceptional."
                            author="Raj Malhotra"
                            role="Tech Entrepreneur"
                            rating={5}
                        />
                        <TestimonialCard
                            quote="As an investor, this platform gives me early access to the most promising student-led projects. It's a game changer."
                            author="Sarah Chen"
                            role="Venture Capitalist"
                            rating={5}
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
                    <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                        Join thousands of students, entrepreneurs, and investors building the future of innovation
                    </p>

                    {!user && (
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-lg font-bold shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                Create Free Account <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 rounded-lg font-bold shadow-xl hover:bg-slate-100 transition-all"
                            >
                                Sign In
                            </Link>
                        </div>
                    )}

                    <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-400" />
                            <span>Free to join</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-400" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-green-400" />
                            <span>Cancel anytime</span>
                        </div>
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

const StatCard = ({ number, label }) => (
    <div className="p-6">
        <div className="text-4xl md:text-5xl font-bold mb-2">{number}</div>
        <div className="text-blue-100 font-medium">{label}</div>
    </div>
);

const ProcessCard = ({ step, icon, title, description, bgColor, textColor }) => (
    <div className="relative">
        <div className={`${bgColor} p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100`}>
            <div className={`absolute -top-4 -left-4 w-12 h-12 ${bgColor} ${textColor} rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-lg`}>
                {step}
            </div>
            <div className={`${textColor} mb-4 p-3 bg-white rounded-lg inline-block shadow-sm`}>{icon}</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    </div>
);

const BenefitCard = ({ icon, title, description }) => (
    <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
        <div className="mb-4 p-3 bg-white rounded-lg inline-block shadow-sm">{icon}</div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
);

const UseCaseCard = ({ category, title, description, stats }) => (
    <div className="p-8 bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all duration-300">
        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-4">
            {category}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-3">
            {stats.map((stat, index) => (
                <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    {stat}
                </span>
            ))}
        </div>
    </div>
);

const TestimonialCard = ({ quote, author, role, rating }) => (
    <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300">
        <div className="flex gap-1 mb-4">
            {[...Array(rating)].map((_, i) => (
                <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
            ))}
        </div>
        <p className="text-slate-700 mb-6 leading-relaxed italic">"{quote}"</p>
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {author.charAt(0)}
            </div>
            <div>
                <div className="font-bold text-slate-900">{author}</div>
                <div className="text-sm text-slate-500">{role}</div>
            </div>
        </div>
    </div>
);

export default LandingPage;
