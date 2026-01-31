import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        // Dynamic fields mapping
        university: '', // for student
        companyName: '', // for entrepreneur
        organization: '', // for investor
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const profile = {};
            if (formData.role === 'student') profile.university = formData.university;
            if (formData.role === 'entrepreneur') profile.companyName = formData.companyName;
            if (formData.role === 'investor') profile.portfolio = formData.organization;

            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                profile
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900">Create Account</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Join the Campus Connect ecosystem
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <select
                                name="role"
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="student">Student</option>
                                <option value="entrepreneur">Entrepreneur</option>
                                <option value="investor">Investor</option>
                            </select>
                        </div>

                        {/* Conditional Fields */}
                        {formData.role === 'student' && (
                            <div>
                                <input
                                    name="university"
                                    type="text"
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="University / College"
                                    value={formData.university}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        {formData.role === 'entrepreneur' && (
                            <div>
                                <input
                                    name="companyName"
                                    type="text"
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Startup / Company Name"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        {formData.role === 'investor' && (
                            <div>
                                <input
                                    name="organization"
                                    type="text"
                                    className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                    placeholder="Organization / Fund Name"
                                    value={formData.organization}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        <div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg transition-all"
                        >
                            create Account
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <span className="text-slate-600">Already have an account? </span>
                    <Link to="/login" className="font-medium text-primary hover:text-blue-500">
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
