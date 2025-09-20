import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, LogOut, DollarSign, Calendar, Shield, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserRoleText = (role: string) => {
    switch (role) {
      case 'parent': return 'Parent';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      case 'admin': return 'Admin';
      case 'super_admin': return 'Super Admin';
      default: return '';
    }
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-red-600 bg-red-50';
      case 'admin': return 'text-purple-600 bg-purple-50';
      case 'teacher': return 'text-blue-600 bg-blue-50';
      case 'parent': return 'text-green-600 bg-green-50';
      case 'student': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-emerald-600">
              Quraan Academy
            </Link>
          </div>
          
          {!loading && !user && (
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/courses" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                Courses
              </Link>
              <Link to="/why-us" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                Why Us
              </Link>
              <Link to="/reviews" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">
                Reviews
              </Link>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {(user.role === 'parent' || user.role === 'student' || user.role === 'teacher') && (
                  <>
                    <Link to="/classes" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> My Classes
                    </Link>
                    <Link to="/payment" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" /> Payments
                    </Link>
                  </>
                )}
                
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <Link to="/admin-settings" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center">
                    <Settings className="h-4 w-4 mr-1" /> System
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className={`text-sm font-bold px-2 py-1 rounded-full ${getUserRoleColor(user.role)}`}>
                      {user.role === 'super_admin' && <Shield className="h-3 w-3 inline mr-1" />}
                      {getUserRoleText(user.role)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{user.name}</div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center hover:bg-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/free-trial" className="bg-yellow-500 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-yellow-600 transition-colors">
                  Get Free Trial
                </Link>
                <Link to="/" className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center hover:bg-emerald-700 transition-colors">
                  <LogIn className="h-4 w-4 mr-1" /> Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;