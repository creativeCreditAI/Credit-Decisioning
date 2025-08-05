import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Reviewer' | 'Analyst' | 'Support Staff' | 'Viewer';
  department: string;
  lastLogin: Date;
  permissions: {
    canApprove: boolean;
    canViewAnalytics: boolean;
    canManageUsers: boolean;
    canViewFraudAlerts: boolean;
    canAccessDangerZone: boolean;
    canModifySettings: boolean;
  };
}

export interface AdminPreferences {
  theme: 'light' | 'dark';
  textSize: 'small' | 'medium' | 'large';
  language: 'en' | 'sw';
  layout: 'compact' | 'expanded';
  notifications: {
    email: boolean;
    slack: boolean;
    sms: boolean;
    newApplications: boolean;
    highRiskAlerts: boolean;
    documentsUploaded: boolean;
    reportFrequency: 'daily' | 'weekly';
  };
  security: {
    twoFactorAuth: boolean;
    autoLogoutDuration: 15 | 30 | 60;
    ipWhitelist: string[];
  };
  assessmentTools: {
    showFaceValue: boolean;
    showAdminReview: boolean;
    financialScoreWeight: number;
    faceValueWeight: number;
  };
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  details: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface AdminContextType {
  adminUser: AdminUser | null;
  preferences: AdminPreferences;
  auditLogs: AuditLog[];
  updatePreferences: (newPreferences: Partial<AdminPreferences>) => Promise<void>;
  updateAdminUser: (updates: Partial<AdminUser>) => Promise<void>;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'adminId' | 'adminName' | 'timestamp'>) => void;
  saveAssessment: (applicantId: string, type: 'face_value' | 'admin_review', content: string) => Promise<void>;
  loadAssessment: (applicantId: string, type: 'face_value' | 'admin_review') => Promise<string>;
  sendNotification: (type: string, message: string, priority: 'low' | 'medium' | 'high') => Promise<void>;
  pauseSubmissions: (reason: string) => Promise<void>;
  resetSystemSettings: () => Promise<void>;
  deleteAdminAccount: (adminId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const defaultPreferences: AdminPreferences = {
  theme: 'light',
  textSize: 'medium',
  language: 'en',
  layout: 'expanded',
  notifications: {
    email: true,
    slack: false,
    sms: false,
    newApplications: true,
    highRiskAlerts: true,
    documentsUploaded: false,
    reportFrequency: 'weekly'
  },
  security: {
    twoFactorAuth: false,
    autoLogoutDuration: 30,
    ipWhitelist: []
  },
  assessmentTools: {
    showFaceValue: true,
    showAdminReview: true,
    financialScoreWeight: 70,
    faceValueWeight: 30
  }
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [preferences, setPreferences] = useState<AdminPreferences>(defaultPreferences);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize admin user and preferences
  useEffect(() => {
    const initializeAdmin = async () => {
      setLoading(true);
      try {
        // 🔌 Backend API call to get current admin user
        const mockAdminUser: AdminUser = {
          id: 'admin-001',
          name: 'Admin Manager',
          email: 'admin@heva.co.ke',
          role: 'Super Admin',
          department: 'Credit Risk',
          lastLogin: new Date(),
          permissions: {
            canApprove: true,
            canViewAnalytics: true,
            canManageUsers: true,
            canViewFraudAlerts: true,
            canAccessDangerZone: true,
            canModifySettings: true
          }
        };

        // Load saved preferences from localStorage (or backend)
        const savedPreferences = localStorage.getItem('adminPreferences');
        if (savedPreferences) {
          setPreferences({ ...defaultPreferences, ...JSON.parse(savedPreferences) });
        }

        setAdminUser(mockAdminUser);
        
        // Initialize audit logs
        const mockAuditLogs: AuditLog[] = [
          {
            id: 'audit-001',
            adminId: 'admin-001',
            adminName: 'Admin Manager',
            action: 'LOGIN',
            target: 'System',
            details: 'Admin logged into dashboard',
            timestamp: new Date(),
            severity: 'low'
          }
        ];
        setAuditLogs(mockAuditLogs);
      } catch (err) {
        setError('Failed to initialize admin context');
        console.error('Admin initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    document.documentElement.style.fontSize = 
      preferences.textSize === 'small' ? '14px' : 
      preferences.textSize === 'large' ? '18px' : '16px';
  }, [preferences.theme, preferences.textSize]);

  const updatePreferences = async (newPreferences: Partial<AdminPreferences>): Promise<void> => {
    setLoading(true);
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      // 🔌 Backend API call to save preferences
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API delay
      
      setPreferences(updatedPreferences);
      localStorage.setItem('adminPreferences', JSON.stringify(updatedPreferences));
      
      addAuditLog({
        action: 'UPDATE_PREFERENCES',
        target: 'Admin Settings',
        details: `Updated preferences: ${Object.keys(newPreferences).join(', ')}`,
        severity: 'low'
      });
    } catch (err) {
      setError('Failed to update preferences');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAdminUser = async (updates: Partial<AdminUser>): Promise<void> => {
    setLoading(true);
    try {
      // 🔌 Backend API call to update admin user
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API delay
      
      if (adminUser) {
        const updatedUser = { ...adminUser, ...updates };
        setAdminUser(updatedUser);
        
        addAuditLog({
          action: 'UPDATE_PROFILE',
          target: 'Admin Profile',
          details: `Updated profile fields: ${Object.keys(updates).join(', ')}`,
          severity: 'medium'
        });
      }
    } catch (err) {
      setError('Failed to update admin user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addAuditLog = (log: Omit<AuditLog, 'id' | 'adminId' | 'adminName' | 'timestamp'>) => {
    if (!adminUser) return;
    
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}`,
      adminId: adminUser.id,
      adminName: adminUser.name,
      timestamp: new Date()
    };
    
    setAuditLogs(prev => [newLog, ...prev]);
    
    // 🔌 Backend API call to save audit log
    console.log('Audit log created:', newLog);
  };

  const saveAssessment = async (applicantId: string, type: 'face_value' | 'admin_review', content: string): Promise<void> => {
    setLoading(true);
    try {
      // 🔌 Backend API call to save assessment
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock API delay
      
      addAuditLog({
        action: 'SAVE_ASSESSMENT',
        target: `Applicant ${applicantId}`,
        details: `Saved ${type.replace('_', ' ')} assessment`,
        severity: 'medium'
      });
      
      console.log(`Saved ${type} assessment for ${applicantId}:`, content);
    } catch (err) {
      setError('Failed to save assessment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadAssessment = async (applicantId: string, type: 'face_value' | 'admin_review'): Promise<string> => {
    try {
      // 🔌 Backend API call to load assessment
      await new Promise(resolve => setTimeout(resolve, 300)); // Mock API delay
      
      // Mock saved assessments
      const mockAssessments = {
        'APP-2024-001': {
          face_value: 'Applicant demonstrates strong business acumen and professional presentation.',
          admin_review: 'Comprehensive review completed. Recommend approval with standard terms.'
        },
        'APP-2024-002': {
          face_value: 'Some concerns about business sustainability, requires closer examination.',
          admin_review: 'Pending additional documentation verification.'
        }
      };
      
      return mockAssessments[applicantId as keyof typeof mockAssessments]?.[type] || '';
    } catch (err) {
      console.error('Failed to load assessment:', err);
      return '';
    }
  };

  const sendNotification = async (type: string, message: string, priority: 'low' | 'medium' | 'high'): Promise<void> => {
    try {
      // 🔌 Backend API call to send notification based on preferences
      const { notifications } = preferences;
      
      if (notifications.email) {
        console.log('Sending email notification:', { type, message, priority });
      }
      if (notifications.slack) {
        console.log('Sending Slack notification:', { type, message, priority });
      }
      if (notifications.sms) {
        console.log('Sending SMS notification:', { type, message, priority });
      }
      
      addAuditLog({
        action: 'SEND_NOTIFICATION',
        target: 'Notification System',
        details: `Sent ${type} notification with ${priority} priority`,
        severity: priority === 'high' ? 'high' : 'low'
      });
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  };

  const pauseSubmissions = async (reason: string): Promise<void> => {
    setLoading(true);
    try {
      // 🔌 Backend API call to pause submissions
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API delay
      
      addAuditLog({
        action: 'PAUSE_SUBMISSIONS',
        target: 'Application System',
        details: `Paused submissions: ${reason}`,
        severity: 'critical'
      });
      
      await sendNotification('SYSTEM_ALERT', `Application submissions paused: ${reason}`, 'high');
    } catch (err) {
      setError('Failed to pause submissions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetSystemSettings = async (): Promise<void> => {
    setLoading(true);
    try {
      // 🔌 Backend API call to reset system settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API delay
      
      setPreferences(defaultPreferences);
      localStorage.removeItem('adminPreferences');
      
      addAuditLog({
        action: 'RESET_SYSTEM_SETTINGS',
        target: 'System Configuration',
        details: 'All system settings reset to defaults',
        severity: 'critical'
      });
    } catch (err) {
      setError('Failed to reset system settings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAdminAccount = async (adminId: string): Promise<void> => {
    setLoading(true);
    try {
      // 🔌 Backend API call to delete admin account
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API delay
      
      addAuditLog({
        action: 'DELETE_ADMIN_ACCOUNT',
        target: `Admin ${adminId}`,
        details: 'Admin account permanently deleted',
        severity: 'critical'
      });
      
      // If deleting current user, logout
      if (adminId === adminUser?.id) {
        setAdminUser(null);
        // Redirect to login
      }
    } catch (err) {
      setError('Failed to delete admin account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AdminContextType = {
    adminUser,
    preferences,
    auditLogs,
    updatePreferences,
    updateAdminUser,
    addAuditLog,
    saveAssessment,
    loadAssessment,
    sendNotification,
    pauseSubmissions,
    resetSystemSettings,
    deleteAdminAccount,
    loading,
    error
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;