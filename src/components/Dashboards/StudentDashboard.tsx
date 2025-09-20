import React, { useState } from 'react';
import { BookOpen, Calendar, Award, Video, Clock, Key, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { children, getClassesByStudent, getUpcomingClasses, updateStudentPassword } = useData();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Find the current student's data
  const currentStudent = children.find(child =>
    child.studentAccount?.email === user?.email || child.id === user?.id
  );

  if (!currentStudent) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome</h1>
          <p className="text-gray-600">
            Student data not found. Please contact your parent.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              If you have a student account, make sure to use the correct email and password.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const studentClasses = getClassesByStudent(currentStudent.id);
  const upcomingClasses = studentClasses.filter(cls => {
    const classDate = new Date(`${cls.date}T${cls.time}`);
    return classDate >= new Date() && cls.status === 'scheduled';
  }).slice(0, 3);

  const completedClasses = studentClasses.filter(cls => cls.status === 'completed').length;
  const streak = 12; // This can be calculated based on completed classes

  const achievements = [
    { name: 'First Surah Completed', description: 'You completed your first surah', date: '2 weeks ago' },
    { name: '7-Day Streak', description: 'Practiced for 7 consecutive days', date: '1 week ago' },
    { name: 'Perfect Recitation', description: 'Recited without mistakes', date: '3 days ago' },
  ];

  const stats = [
    { name: 'Current Progress', value: `${currentStudent.progress}%`, icon: BookOpen, color: 'bg-primary-500' },
    { name: 'Classes This Month', value: completedClasses.toString(), icon: Calendar, color: 'bg-blue-500' },
    { name: 'Daily Streak', value: `${streak} days`, icon: Award, color: 'bg-gold-500' },
    { name: 'Next Class', value: upcomingClasses.length > 0 ? 'Today' : 'TBD', icon: Clock, color: 'bg-green-500' },
  ];

  const handleChangePassword = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!currentStudent.studentAccount) {
      alert('No student account found.');
      return;
    }

    if (passwordData.currentPassword !== currentStudent.studentAccount.password) {
      alert('Current password is incorrect.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    updateStudentPassword(currentStudent.id, passwordData.newPassword);
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password changed successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning Journey</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your Quran memorization progress and join your classes.
          </p>
          <p className="mt-2 text-lg text-primary-600 font-medium">
            Welcome, {currentStudent.name}!
          </p>
        </div>
        <button
          onClick={() => {
            if (currentStudent.studentAccount) {
              setPasswordData({
                currentPassword: currentStudent.studentAccount.password,
                newPassword: '',
                confirmPassword: ''
              });
              setShowPasswordModal(true);
            }
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <Key className="h-4 w-4 mr-2" />
          Change Password
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-lg border">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className={`h-6 w-6 text-white p-1 rounded ${item.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Progress */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Current Progress</h2>
          </div>
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-primary-600 font-arabic">{currentStudent.level}</h3>
              <p className="text-gray-600">Teacher: {currentStudent.teacher}</p>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Memorization Progress</span>
                <span>{currentStudent.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${currentStudent.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-primary-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{currentStudent.progress}</div>
                <div className="text-sm text-gray-600">Completion</div>
              </div>
              <div className="p-4 bg-gold-50 rounded-lg">
                <div className="text-2xl font-bold text-gold-600">{streak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{completedClasses}</div>
                <div className="text-sm text-gray-600">Completed Classes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Classes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => {
                const classDate = new Date(`${classItem.date}T${classItem.time}`);
                const isToday = classItem.date === new Date().toISOString().split('T')[0];
                const isTomorrow = classItem.date === new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0];

                let dateText = classItem.date;
                if (isToday) dateText = 'Today';
                else if (isTomorrow) dateText = 'Tomorrow';

                return (
                  <div key={classItem.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{currentStudent.teacher}</h3>
                        <p className="text-sm text-gray-500">{dateText} at {classItem.time}</p>
                        {classItem.notes && (
                          <p className="text-xs text-gray-400 mt-1">{classItem.notes}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(classItem.zoomLink, '_blank')}
                      className="w-full bg-primary-600 text-white px-3 py-2 rounded text-sm hover:bg-primary-700 transition-colors flex items-center justify-center"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Join Class
                    </button>
                  </div>
                );
              })}
              {upcomingClasses.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500">No scheduled classes.</p>
                  <p className="text-sm text-gray-400 mt-1">You'll be notified when new classes are scheduled.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="mt-8 bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Achievements</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-gold-50 to-gold-100 rounded-lg">
                <Award className="h-8 w-8 text-gold-600 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">{achievement.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <span className="text-xs text-gold-600">{achievement.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Account Information */}
      {currentStudent.studentAccount && (
        <div className="mt-8 bg-white shadow-sm rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Login Details</h3>
                <p className="text-sm text-gray-600">Email: <span className="font-mono text-blue-600">{currentStudent.studentAccount.email}</span></p>
                <p className="text-sm text-gray-600 mt-1">Password: <span className="font-mono">••••••••</span></p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Security Settings</h3>
                <button
                  onClick={() => {
                    setPasswordData({
                      currentPassword: currentStudent.studentAccount?.password || '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setShowPasswordModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tips for Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="bg-white p-4 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-600 mx-auto mb-2" />
              <p>Review daily</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p>Attend all classes</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <Award className="h-6 w-6 text-gold-600 mx-auto mb-2" />
              <p>Practice regularly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Change Password
                </h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Confirm new password"
                    minLength={6}
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}