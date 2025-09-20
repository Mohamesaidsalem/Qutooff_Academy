import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Header from './components/Layout/Header';
import Hero from './components/Landing/Hero';
import LoginForm from './components/Auth/LoginForm';

import CoursesPage from './components/CoursesPage';
import ParentDashboard from './components/Dashboards/ParentDashboard';
import TeacherDashboard from './components/Dashboards/TeacherDashboard';
import StudentDashboard from './components/Dashboards/StudentDashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';

import SuperAdminDashboard from './components/Dashboards/SuperAdminDashboard';
import FreeTrial from './components/Pages/FreeTrial';
import WhyUs from './components/Pages/WhyUs';
import Reviews from './components/Pages/Reviews';
import CoursesTabs from './components/CoursesTabs';
import ClassManagement from './components/ClassManagement';

function AppContent() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const getDashboardComponent = () => {
    if (!user) {
      return <div>Please log in to view the dashboard.</div>;
    }
    switch (user.role) {
      case 'parent':
        return <ParentDashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'student':
        return <StudentDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'super_admin':
        return <SuperAdminDashboard />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              getDashboardComponent()
            ) : (
              <>
                <Hero onGetStarted={() => setShowLogin(true)} />
                <CoursesTabs />
              </>
            )
          } 
        />
        <Route path="/courses" element={<CoursesPage onEnroll={() => setShowLogin(true)} />} />
        <Route path="/why-us" element={<WhyUs />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/free-trial" element={<FreeTrial />} />
        <Route path="/classes" element={<ClassManagement />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <AppContent />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;