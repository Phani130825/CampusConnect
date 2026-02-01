import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tighter">
                                CAMPUS CONNECT
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-slate-600 hover:text-primary font-medium transition-colors">Home</Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="text-slate-600 hover:text-primary font-medium transition-colors">Dashboard</Link>
                                <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                                        <User size={18} className="text-secondary" />
                                        <span>{user.name}</span>
                                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-500 uppercase">{user.role}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-600 hover:text-primary font-medium transition-colors">Login</Link>
                                <Link to="/register" className="px-5 py-2.5 bg-primary text-white rounded-full font-bold shadow hover:bg-blue-700 transition-all transform hover:-translate-y-0.5">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-600 hover:text-slate-900 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-slate-100">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Home</Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Dashboard</Link>
                                <div className="px-3 py-2 border-t border-slate-100 mt-2">
                                    <div className="mb-2 font-medium text-slate-800">{user.name} <span className="text-xs text-slate-500">({user.role})</span></div>
                                    <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-medium w-full text-left">
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50">Login</Link>
                                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-slate-50">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
