import React from 'react';
import { BookOpen, User, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "Why Us", path: "/why-us" },
    { name: "Reviews", path: "/reviews" },
  ];

  return (
    <header className="bg-emerald-900 shadow-sm border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo - شمال */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8" style={{ color: "#FFD700" }} />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
 Qutooff Academy
</span>
            </Link>
          </div>

          {/* Navigation - في النص */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  location.pathname === link.path
                    ? "bg-emerald-800"
                    : "hover:bg-emerald-800"
                }`}
                style={{ color: "#FFD700" }}
              >
                {link.name}
              </Link>
            ))}
            {/* إضافة رابط Class Management للمدرسين فقط */}
            {user && user.role === 'teacher' && (
                <Link
                  to="/classes"
                  className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center space-x-1 ${
                    location.pathname === '/classes'
                      ? "bg-emerald-800"
                      : "hover:bg-emerald-800"
                  }`}
                  style={{ color: "#FFD700" }}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Class Management</span>
                </Link>
            )}
          </nav>

          {/* Get Free Trial + User Info - يمين */}
          <div className="flex items-center space-x-4">
            <Link
              to="/free-trial"
              className="px-4 py-2 rounded-full font-semibold transition-colors shadow-md"
              style={{ backgroundColor: "#FFD700", color: "#064E3B" }}
            >
              Get Free Trial
            </Link>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" style={{ color: "#FFD700" }} />
                  <span className="text-sm font-medium" style={{ color: "#FFD700" }}>
                    {user.name}
                  </span>
                  <span
                    className="text-xs px-2 py-1 rounded-full capitalize"
                    style={{ backgroundColor: "#FFD700", color: "#064E3B" }}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 transition-colors"
                  style={{ color: "#FFD700" }}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}