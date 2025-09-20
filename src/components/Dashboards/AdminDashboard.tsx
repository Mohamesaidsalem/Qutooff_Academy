import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  BarChart, 
  Home, 
  Settings, 
  UserPlus,
  GraduationCap,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import { ref, onValue, off, push, set, update } from 'firebase/database';
import { database } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';

// Import the separated components
import UserManagement from '../admin/UserManagement';
import CourseManagement from '../admin/CourseManagement';
import SubscriptionManagement from '../admin/SubscriptionManagement';
import TeacherScheduleManagement from '../admin/TeacherScheduleManagement';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Firebase data states
  const [children, setChildren] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Firebase real-time listeners
  useEffect(() => {
    if (!user) return;

    const childrenRef = ref(database, 'children');
    const teachersRef = ref(database, 'teachers');  
    const classesRef = ref(database, 'classes');
    const coursesRef = ref(database, 'courses');

    // Listen to children changes
    const unsubscribeChildren = onValue(childrenRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const childrenArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setChildren(childrenArray);
      } else {
        setChildren([]);
      }
    });

    // Listen to teachers changes  
    const unsubscribeTeachers = onValue(teachersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const teachersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setTeachers(teachersArray);
      } else {
        setTeachers([]);
      }
    });

    // Listen to classes changes
    const unsubscribeClasses = onValue(classesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const classesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setClasses(classesArray);
      } else {
        setClasses([]);
      }
    });

    // Listen to courses changes
    const unsubscribeCourses = onValue(coursesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const coursesArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setCourses(coursesArray);
      } else {
        setCourses([]);
      }
      setLoading(false);
    });

    return () => {
      off(childrenRef, 'value', unsubscribeChildren);
      off(teachersRef, 'value', unsubscribeTeachers); 
      off(classesRef, 'value', unsubscribeClasses);
      off(coursesRef, 'value', unsubscribeCourses);
    };
  }, [user]);

  // Handler functions for class scheduling
  const handleScheduleClass = async (classData: any) => {
    try {
      const classesRef = ref(database, 'classes');
      const newClassRef = push(classesRef);
      await set(newClassRef, classData);
    } catch (error) {
      console.error('Error scheduling class:', error);
      throw error;
    }
  };

  const handleUpdateClass = async (classId: string, updates: any) => {
    try {
      const classRef = ref(database, `classes/${classId}`);
      await update(classRef, updates);
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  };

  const totalRevenue = children.length * 60; // $60 per child
  const activeTeachers = teachers.length;
  const totalStudents = children.length;
  const classesThisMonth = classes.filter(cls => {
    const classDate = new Date(cls.date);
    const currentMonth = new Date().getMonth();
    return classDate.getMonth() === currentMonth;
  }).length;

  const stats = [
    { name: 'Total Students', value: totalStudents.toString(), icon: Users, color: 'bg-blue-500', change: '+12%' },
    { name: 'Active Teachers', value: activeTeachers.toString(), icon: BookOpen, color: 'bg-green-500', change: '+2' },
    { name: 'Monthly Revenue', value: `$${totalRevenue}`, icon: DollarSign, color: 'bg-emerald-500', change: '+18%' },
    { name: 'Classes this Month', value: classesThisMonth.toString(), icon: CalendarIcon, color: 'bg-purple-500', change: '+24%' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Dashboard Overview', icon: Home },
    { id: 'users', name: 'User Management', icon: UserPlus },
    { id: 'teachers', name: 'Teacher Schedules', icon: GraduationCap },
    { id: 'courses', name: 'Course Management', icon: BookOpen },
    { id: 'subscriptions', name: 'Subscriptions & Payments', icon: CreditCard },
    { id: 'analytics', name: 'Analytics', icon: BarChart },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Qutooff Academy - Admin Dashboard</h1>
              <p className="mt-2 text-sm text-gray-600">
                Complete management system for users, teachers, courses, and subscriptions
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((item) => (
                <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`p-3 rounded-lg ${item.color}`}>
                          <item.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {item.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {item.value}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              <TrendingUp className="h-4 w-4 flex-shrink-0 self-center text-green-500" />
                              <span className="ml-1">{item.change}</span>
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <UserPlus className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-blue-900">Create Account</span>
                </button>
                <button
                  onClick={() => setActiveTab('teachers')}
                  className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <GraduationCap className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-green-900">Manage Teachers</span>
                </button>
                <button
                  onClick={() => setActiveTab('courses')}
                  className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
                  <span className="text-sm font-medium text-purple-900">Create Course</span>
                </button>
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <CreditCard className="h-8 w-8 text-emerald-600 mb-2" />
                  <span className="text-sm font-medium text-emerald-900">View Payments</span>
                </button>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">New teacher registered: Ahmed Mohamed</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Student enrolled in Advanced English</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">Payment received from Fatima Ali</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database Connection</span>
                      <span className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Payment Gateway</span>
                      <span className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email Service</span>
                      <span className="flex items-center text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Operational
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Render Components Based on Active Tab with proper props */}
        {activeTab === 'users' && <UserManagement />}
        
        {activeTab === 'teachers' && (
          <TeacherScheduleManagement 
                      teachers={teachers}
                      children={children}
                      classes={classes}
                      onScheduleClass={handleScheduleClass}
                      onUpdateClass={handleUpdateClass} onDeleteClass={function (classId: string): void {
                          throw new Error('Function not implemented.');
                      } }          />
        )}

        {activeTab === 'courses' && (
          <CourseManagement 
            teachers={teachers}
            children={children}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionManagement 
            children={children}
            courses={courses}
          />
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500">Advanced analytics and reporting features coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
            <p className="text-gray-500">Configuration and system settings coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}