import React, { useState } from 'react';
import { Users, TrendingUp, Calendar, DollarSign, Video, Plus, Trash2, Edit, UserPlus, Key } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData, Child } from '../../contexts/DataContext';

export default function ParentDashboard() {
  const { user } = useAuth();
  const { 
    getChildrenByParent, 
    addChild, 
    removeChild, 
    updateChild, 
    createStudentAccount,
    updateStudentPassword,
    getUpcomingClasses,
    teachers 
  } = useData();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [selectedChildForAccount, setSelectedChildForAccount] = useState<Child | null>(null);
  const [selectedChildForPassword, setSelectedChildForPassword] = useState<Child | null>(null);
  const [newChild, setNewChild] = useState({
    name: '',
    age: '',
    level: '',
    teacher: '',
    nextClass: ''
  });
  const [accountData, setAccountData] = useState({
    email: '',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const children = user ? getChildrenByParent(user.id) : [];
  const upcomingClasses = user ? getUpcomingClasses(user.id, 'parent') : [];

  const stats = [
    { name: 'Total Children', value: children.length.toString(), icon: Users, color: 'bg-primary-500' },
    { name: 'Average Progress', value: `${Math.round(children.reduce((acc, child) => acc + child.progress, 0) / children.length || 0)}%`, icon: TrendingUp, color: 'bg-gold-500' },
    { name: 'Classes This Month', value: upcomingClasses.length.toString(), icon: Calendar, color: 'bg-blue-500' },
    { name: 'Monthly Fee', value: `$${children.length * 60}`, icon: DollarSign, color: 'bg-green-500' },
  ];

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChild.name && newChild.age && newChild.level && newChild.teacher && user) {
      addChild({
        name: newChild.name,
        age: parseInt(newChild.age),
        level: newChild.level,
        progress: 0,
        teacher: newChild.teacher,
        nextClass: newChild.nextClass || 'To be scheduled',
        parentId: user.id
      });
      setNewChild({ name: '', age: '', level: '', teacher: '', nextClass: '' });
      setShowAddModal(false);
    }
  };

  const handleEditChild = (child: Child) => {
    setEditingChild(child);
    setNewChild({
      name: child.name,
      age: child.age.toString(),
      level: child.level,
      teacher: child.teacher,
      nextClass: child.nextClass
    });
    setShowAddModal(true);
  };

  const handleUpdateChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingChild && newChild.name && newChild.age && newChild.level && newChild.teacher) {
      updateChild(editingChild.id, {
        name: newChild.name,
        age: parseInt(newChild.age),
        level: newChild.level,
        teacher: newChild.teacher,
        nextClass: newChild.nextClass
      });
      setEditingChild(null);
      setNewChild({ name: '', age: '', level: '', teacher: '', nextClass: '' });
      setShowAddModal(false);
    }
  };

  const handleRemoveChild = (childId: string) => {
    if (window.confirm('Are you sure you want to remove this child?')) {
      removeChild(childId);
    }
  };

  const handleCreateAccount = (child: Child) => {
    setSelectedChildForAccount(child);
    setAccountData({
      email: `${child.name.toLowerCase().replace(' ', '.')}@student.com`,
      password: `${child.name.toLowerCase().replace(' ', '')}123`
    });
    setShowAccountModal(true);
  };

  const handleSubmitAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChildForAccount && accountData.email && accountData.password) {
      createStudentAccount(selectedChildForAccount.id, accountData.email, accountData.password);
      setShowAccountModal(false);
      setSelectedChildForAccount(null);
      setAccountData({ email: '', password: '' });
      alert(`Student account created successfully!\n\nEmail: ${accountData.email}\nPassword: ${accountData.password}\n\nYour student can now log in with these credentials.`);
    }
  };

  const handleChangePassword = (child: Child) => {
    if (!child.studentAccount) {
      alert('No student account exists for this child');
      return;
    }
    setSelectedChildForPassword(child);
    setPasswordData({
      currentPassword: child.studentAccount.password,
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  const handleSubmitPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChildForPassword && passwordData.newPassword) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert('New passwords do not match');
        return;
      }
      if (passwordData.newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      
      updateStudentPassword(selectedChildForPassword.id, passwordData.newPassword);
      setShowPasswordModal(false);
      setSelectedChildForPassword(null);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your children's Quran memorization progress
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setEditingChild(null);
            setNewChild({ name: '', age: '', level: '', teacher: '', nextClass: '' });
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Child
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
      
      {/* Children Progress Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Children's Progress</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {children.map((child) => (
                <tr key={child.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {child.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{child.name}</div>
                        <div className="text-sm text-gray-500">Age: {child.age}</div>
                        <div className="text-xs text-gray-400">
                          {child.studentAccount ? 
                            `✅ Has Student Account` : 
                            '❌ No Student Account'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{child.level}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${child.progress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-900">{child.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {child.teacher}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {child.nextClass}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-900 flex items-center" title="Join Class">
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </button>
                      <button 
                        onClick={() => handleEditChild(child)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                        title="Edit Child"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {!child.studentAccount && (
                        <button 
                          onClick={() => handleCreateAccount(child)}
                          className="text-green-600 hover:text-green-900 flex items-center"
                          title="Create Student Account"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>
                      )}
                      {child.studentAccount && (
                        <button 
                          onClick={() => handleChangePassword(child)}
                          className="text-purple-600 hover:text-purple-900 flex items-center"
                          title="Change Student Password"
                        >
                          <Key className="h-4 w-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleRemoveChild(child.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                        title="Remove Child"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Section */}
      <div className="mt-8 bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Payment & Subscription</h2>
          <button className="bg-gold-500 text-white px-4 py-2 rounded-md hover:bg-gold-600 transition-colors">
            Pay with PayPal
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">Current Plan</h3>
              <p className="text-2xl font-bold text-green-600">Family Plan</p>
              <p className="text-sm text-green-600">$60 per child/month</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Next Payment</h3>
              <p className="text-2xl font-bold text-blue-600">Feb 1, 2024</p>
              <p className="text-sm text-blue-600">${children.length * 60} total</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-800">Payment Status</h3>
              <p className="text-2xl font-bold text-green-600">Active</p>
              <p className="text-sm text-gray-600">Auto-renewal enabled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Child Modal */}
      {(showAddModal || editingChild) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingChild ? 'Edit Child' : 'Add New Child'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingChild(null);
                    setNewChild({ name: '', age: '', level: '', teacher: '', nextClass: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={editingChild ? handleUpdateChild : handleAddChild} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Child Name *
                  </label>
                  <input
                    type="text"
                    value={newChild.name}
                    onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="18"
                    value={newChild.age}
                    onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Level *
                  </label>
                  <select
                    value={newChild.level}
                    onChange={(e) => setNewChild({ ...newChild, level: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="Short Surahs">Short Surahs</option>
                    <option value="Surah Yaseen">Surah Yaseen</option>
                    <option value="Surah Al-Mulk">Surah Al-Mulk</option>
                    <option value="Surah Al-Baqarah">Surah Al-Baqarah</option>
                    <option value="Advanced Level">Advanced Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Teacher *
                  </label>
                  <select
                    value={newChild.teacher}
                    onChange={(e) => setNewChild({ ...newChild, teacher: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Class (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2024-01-20 3:00 PM"
                    value={newChild.nextClass}
                    onChange={(e) => setNewChild({ ...newChild, nextClass: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingChild(null);
                      setNewChild({ name: '', age: '', level: '', teacher: '', nextClass: '' });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {editingChild ? 'Update Child' : 'Add Child'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Student Account Modal */}
      {showAccountModal && selectedChildForAccount && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Create Student Account for {selectedChildForAccount.name}
                </h2>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={accountData.password}
                    onChange={(e) => setAccountData({ ...accountData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAccountModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedChildForPassword && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Change Password for {selectedChildForPassword.name}
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

              <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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