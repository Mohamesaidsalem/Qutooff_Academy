import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ref, set, get, push, remove, update, onValue, off } from 'firebase/database';
import { database } from '../firebase/config';
import { useAuth } from './AuthContext';

export interface Child {
  id: string;
  name: string;
  age: number;
  level: string;
  progress: number;
  teacher: string;
  nextClass: string;
  parentId: string;
  studentAccount?: {
    email: string;
    password: string;
  };
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  specialization: string;
  students: string[];
}

// ✅ تم تصحيح الواجهة هنا لإضافة 'in-progress' و 'duration'
export interface Class {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  time: string;
  duration: number; // ✅ خاصية 'duration' المضافة
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'; // ✅ تم إضافة 'in-progress'
  zoomLink: string;
  notes?: string;
}

interface DataContextType {
  children: Child[];
  teachers: Teacher[];
  classes: Class[];
  loading: boolean;
  
  // Children methods
  getChildrenByParent: (parentId: string) => Child[];
  addChild: (child: Omit<Child, 'id'>) => Promise<void>;
  updateChild: (childId: string, updates: Partial<Child>) => Promise<void>;
  removeChild: (childId: string) => Promise<void>;
  
  // Student account methods
  createStudentAccount: (childId: string, email: string, password: string) => Promise<void>;
  updateStudentPassword: (childId: string, newPassword: string) => Promise<void>;
  
  // Teacher methods
  getStudentsByTeacher: (teacherId: string) => Child[];
  
  // Class methods
  getClassesByStudent: (studentId: string) => Class[];
  getClassesByTeacher: (teacherId: string) => Class[];
  getUpcomingClasses: (userId: string, userType: 'parent' | 'teacher' | 'student') => Class[];
  scheduleClass: (classData: Omit<Class, 'id'>) => Promise<void>;
  updateClass: (classId: string, updates: Partial<Class>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const { user } = useAuth();
  const [childrenData, setChildrenData] = useState<Child[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize default teachers
  useEffect(() => {
    const initializeTeachers = async () => {
      try {
        const teachersRef = ref(database, 'teachers');
        const snapshot = await get(teachersRef);
        
        if (!snapshot.exists()) {
          // Create default teachers
          const defaultTeachers = [
            {
              id: '1',
              name: 'الشيخ أحمد محمد',
              email: 'ahmed@qutooff.com',
              specialization: 'تحفيظ القرآن الكريم',
              students: []
            },
            {
              id: '2',
              name: 'الشيخة فاطمة علي',
              email: 'fatima@qutooff.com',
              specialization: 'تجويد وتحفيظ',
              students: []
            },
            {
              id: '3',
              name: 'الشيخ محمد حسن',
              email: 'mohamed@qutooff.com',
              specialization: 'القراءات العشر',
              students: []
            }
          ];

          for (const teacher of defaultTeachers) {
            await set(ref(database, `teachers/${teacher.id}`), teacher);
          }
        }
      } catch (error) {
        console.error('Error initializing teachers:', error);
      }
    };

    initializeTeachers();
  }, []);

  // Real-time listeners
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const childrenRef = ref(database, 'children');
    const teachersRef = ref(database, 'teachers');
    const classesRef = ref(database, 'classes');

    // Listen to children changes
    const unsubscribeChildren = onValue(childrenRef, (snapshot: any) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const childrenArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setChildrenData(childrenArray);
      } else {
        setChildrenData([]);
      }
    });

    // Listen to teachers changes
    const unsubscribeTeachers = onValue(teachersRef, (snapshot: any) => {
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
    const unsubscribeClasses = onValue(classesRef, (snapshot: any) => {
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
      setLoading(false);
    });

    return () => {
      off(childrenRef, 'value', unsubscribeChildren);
      off(teachersRef, 'value', unsubscribeTeachers);
      off(classesRef, 'value', unsubscribeClasses);
    };
  }, [user]);

  // Children methods
  const getChildrenByParent = (parentId: string): Child[] => {
    return childrenData.filter(child => child.parentId === parentId);
  };

  const addChild = async (child: Omit<Child, 'id'>): Promise<void> => {
    try {
      const childrenRef = ref(database, 'children');
      const newChildRef = push(childrenRef);
      await set(newChildRef, child);
    } catch (error) {
      console.error('Error adding child:', error);
      throw error;
    }
  };

  const updateChild = async (childId: string, updates: Partial<Child>): Promise<void> => {
    try {
      const childRef = ref(database, `children/${childId}`);
      await update(childRef, updates);
    } catch (error) {
      console.error('Error updating child:', error);
      throw error;
    }
  };

  const removeChild = async (childId: string): Promise<void> => {
    try {
      const childRef = ref(database, `children/${childId}`);
      await remove(childRef);
    } catch (error) {
      console.error('Error removing child:', error);
      throw error;
    }
  };

  // Student account methods
  const createStudentAccount = async (childId: string, email: string, password: string): Promise<void> => {
    try {
      const childRef = ref(database, `children/${childId}`);
      await update(childRef, {
        studentAccount: {
          email,
          password
        }
      });
    } catch (error) {
      console.error('Error creating student account:', error);
      throw error;
    }
  };

  const updateStudentPassword = async (childId: string, newPassword: string): Promise<void> => {
    try {
      const childRef = ref(database, `children/${childId}/studentAccount`);
      await update(childRef, { password: newPassword });
    } catch (error) {
      console.error('Error updating student password:', error);
      throw error;
    }
  };

  // Teacher methods
  const getStudentsByTeacher = (teacherId: string): Child[] => {
    return childrenData.filter(child => child.teacher === teachers.find(t => t.id === teacherId)?.name);
  };

  // Class methods
  const getClassesByStudent = (studentId: string): Class[] => {
    return classes.filter(cls => cls.studentId === studentId);
  };

  const getClassesByTeacher = (teacherId: string): Class[] => {
    return classes.filter(cls => cls.teacherId === teacherId);
  };

  const getUpcomingClasses = (userId: string, userType: 'parent' | 'teacher' | 'student'): Class[] => {
    let userClasses: Class[] = [];
    
    if (userType === 'parent') {
      const parentChildren = getChildrenByParent(userId);
      userClasses = classes.filter(cls => 
        parentChildren.some(child => child.id === cls.studentId)
      );
    } else if (userType === 'teacher') {
      userClasses = getClassesByTeacher(userId);
    } else if (userType === 'student') {
      userClasses = getClassesByStudent(userId);
    }

    return userClasses.filter(cls => {
      const classDate = new Date(`${cls.date}T${cls.time}`);
      return classDate >= new Date() && cls.status === 'scheduled';
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const scheduleClass = async (classData: Omit<Class, 'id'>): Promise<void> => {
    try {
      const classesRef = ref(database, 'classes');
      const newClassRef = push(classesRef);
      await set(newClassRef, classData);
    } catch (error) {
      console.error('Error scheduling class:', error);
      throw error;
    }
  };

  const updateClass = async (classId: string, updates: Partial<Class>): Promise<void> => {
    try {
      const classRef = ref(database, `classes/${classId}`);
      await update(classRef, updates);
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  };

  const value = {
    children: childrenData,
    teachers,
    classes,
    loading,
    
    // Children methods
    getChildrenByParent,
    addChild,
    updateChild,
    removeChild,
    
    // Student account methods
    createStudentAccount,
    updateStudentPassword,
    
    // Teacher methods
    getStudentsByTeacher,
    
    // Class methods
    getClassesByStudent,
    getClassesByTeacher,
    getUpcomingClasses,
    scheduleClass,
    updateClass
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}