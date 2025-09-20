import React, { useState } from 'react';
import { Calendar, Users, Clock, Video, CheckCircle, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { 
    getStudentsByTeacher, 
    getClassesByTeacher, 
    updateClass,
    children,
    teachers,
    classes
  } = useData();

  // Find the current teacher's ID
  const currentTeacher = teachers.find(t => t.email === user?.email);
  const teacherId = currentTeacher?.id || '1';
  
  const students = getStudentsByTeacher(teacherId);
  const teacherClasses = getClassesByTeacher(teacherId);
  
  // Upcoming classes
  const upcomingClasses = teacherClasses.filter(cls => {
    const classDate = new Date(`${cls.date}T${cls.time}`);
    return classDate >= new Date() && cls.status === 'scheduled';
  }).slice(0, 4);

  // Classes scheduled for current month
  const currentMonthClasses = teacherClasses.filter(cls => {
    const classDate = new Date(cls.date);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return classDate.getMonth() === currentMonth && 
           classDate.getFullYear() === currentYear;
  });

  const completedClassesThisMonth = currentMonthClasses.filter(cls => cls.status === 'completed');
  const scheduledClassesThisMonth = currentMonthClasses.filter(cls => cls.status === 'scheduled');

  const stats = [
    { name: 'Total Students', value: students.length.toString(), icon: Users, color: 'bg-primary-500' },
    { name: 'Today\'s Classes', value: upcomingClasses.filter(cls => cls.date === new Date().toISOString().split('T')[0]).length.toString(), icon: Calendar, color: 'bg-blue-500' },
    { name: 'Classes This Month', value: currentMonthClasses.length.toString(), icon: Clock, color: 'bg-gold-500' },
    { name: 'Completed Classes', value: completedClassesThisMonth.length.toString(), icon: CheckCircle, color: 'bg-green-500' },
  ];

  const markClassCompleted = (classId: string) => {
    updateClass(classId, { status: 'completed' });
    alert('Class marked as completed!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            View students, monthly schedule, and upcoming classes
          </p>
        </div>
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

      {/* Monthly Schedule */}
      <div className="mb-8 bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">My Monthly Schedule - {new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}</h2>
          <p className="mt-1 text-sm text-gray-500">
            All classes scheduled for you this month
          </p>
        </div>
        <div className="p-6">
          {currentMonthClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentMonthClasses
                .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                .map((classItem) => {
                  const student = children.find(s => s.id === classItem.studentId);
                  const isToday = classItem.date === new Date().toISOString().split('T')[0];
                  const isPast = new Date(`${classItem.date}T${classItem.time}`) < new Date();
                  const isUpcoming = new Date(`${classItem.date}T${classItem.time}`) > new Date();
                  
                  return (
                    <div key={classItem.id} className={`p-4 rounded-lg border ${
                      classItem.status === 'completed' ? 'bg-green-50 border-green-200' :
                      isToday ? 'bg-red-50 border-red-200' :
                      isPast && classItem.status === 'scheduled' ? 'bg-orange-50 border-orange-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{student?.name}</p>
                          <p className="text-sm text-gray-600">{classItem.date} - {classItem.time}</p>
                          <p className="text-xs text-gray-500 mt-1">{student?.level}</p>
                          
                          <div className="mt-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              classItem.status === 'completed' ? 'bg-green-100 text-green-800' :
                              classItem.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              isToday ? 'bg-red-100 text-red-800' :
                              isPast ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {classItem.status === 'completed' ? 'Completed' :
                               classItem.status === 'cancelled' ? 'Cancelled' :
                               isToday ? 'Today' :
                               isPast ? 'Missed' : 'Scheduled'}
                            </span>
                          </div>

                          {classItem.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">
                              "{classItem.notes}"
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-1 ml-2">
                          {classItem.status === 'scheduled' && isUpcoming && (
                            <button 
                              onClick={() => window.open(classItem.zoomLink, '_blank')}
                              className="bg-primary-600 text-white px-2 py-1 rounded text-xs hover:bg-primary-700 transition-colors flex items-center"
                              title="Join Class"
                            >
                              <Video className="h-3 w-3 mr-1" />
                              Join
                            </button>
                          )}
                          {classItem.status === 'scheduled' && (isPast || isToday) && (
                            <button 
                              onClick={() => markClassCompleted(classItem.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center"
                              title="Mark as Complete"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No classes scheduled this month</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Classes */}
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Classes</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => {
                const student = children.find(s => s.id === classItem.studentId);
                const isToday = classItem.date === new Date().toISOString().split('T')[0];
                
                return (
                  <div key={classItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{student?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {isToday ? 'Today' : classItem.date} at {classItem.time}
                      </p>
                      <p className="text-xs text-gray-400">{student?.level}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => window.open(classItem.zoomLink, '_blank')}
                        className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 transition-colors flex items-center"
                      >
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </button>
                      <button 
                        onClick={() => markClassCompleted(classItem.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center"
                        title="Mark as Complete"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {upcomingClasses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No upcoming classes scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Student Progress */}
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Student Progress</h2>
            <p className="text-sm text-gray-500">View only - cannot be modified</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{student.progress}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{student.level}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">Age: {student.age} years</p>
                    {student.progress >= 90 && (
                      <div className="flex items-center text-xs text-gold-600">
                        <Award className="h-3 w-3 mr-1" />
                        Excellent
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {students.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p>No students enrolled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Progress Rate</h3>
          <p className="text-3xl font-bold text-primary-600">
            {Math.round(students.reduce((acc, student) => acc + student.progress, 0) / students.length || 0)}%
          </p>
          <p className="text-sm text-gray-500">Average progress of all students</p>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Rate</h3>
          <p className="text-3xl font-bold text-green-600">
            {currentMonthClasses.length > 0 ? Math.round((completedClassesThisMonth.length / currentMonthClasses.length) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-500">of scheduled classes this month</p>
        </div>
        <div className="bg-white p-6 rounded-lg border text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Classes</h3>
          <p className="text-3xl font-bold text-orange-600">
            {scheduledClassesThisMonth.filter(cls => new Date(`${cls.date}T${cls.time}`) < new Date()).length}
          </p>
          <p className="text-sm text-gray-500">scheduled classes not completed</p>
        </div>
      </div>
    </div>
  );
}