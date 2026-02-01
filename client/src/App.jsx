import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import EntrepreneurDashboard from './pages/Dashboard/EntrepreneurDashboard';
import InvestorDashboard from './pages/Dashboard/InvestorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/useAuth';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;

  if (user.role === 'student') return <StudentDashboard />;
  if (user.role === 'entrepreneur') return <EntrepreneurDashboard />;
  if (user.role === 'investor') return <InvestorDashboard />;

  return <Navigate to="/" />;
};

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Specific Role Routes if needed
        <Route 
          path="/student/*" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        */}
      </Routes>
    </div>
  );
}

export default App;
