// 🔌 Backend Service Integration - Django API at localhost:8000
// Complete implementation of all backend API calls

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API Response interfaces
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  avatar?: string;
  businessName?: string;
  sector?: string;
  applicationId?: string;
  is_active?: boolean;
  date_joined?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  documentType: string;
  userId?: string;
  application_id?: string;
}

export interface Application {
  id: string;
  userId?: string;
  business_name: string;
  business_description: string;
  founder_name: string;
  founder_email: string;
  founder_phone?: string;
  funding_amount_requested: number;
  business_stage: string;
  sector: string;
  location?: string;
  employee_count?: number;
  monthly_revenue?: number;
  social_media_profiles?: Record<string, string>;
  status: "draft" | "submitted" | "reviewing" | "approved" | "rejected";
  completion_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface CreditScore {
  score: number;
  grade: string;
  factors: Record<string, string | number | boolean>;
  recommendations: string[];
  created_at: string;
}

// Backend response interfaces
interface DocumentUploadResponse {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
  document_type: string;
  application_id?: string;
}

interface MediaUploadResponse {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploaded_at: string;
  media_type: string;
  application_id?: string;
}

// API Client Configuration
class ApiClient {
  private static getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private static getHeaders(includeAuth = true): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
    }

    return headers;
  }

  static async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  static async uploadFile(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Token ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error(`Upload failed: ${endpoint}`, error);
      throw error;
    }
  }
}

// Authentication Services
export class AuthService {
  static async validateUserLogin(email: string, password: string): Promise<User | null> {
    try {
      const response = await ApiClient.request<{ user: User; token: string }>('/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error('User login failed:', error);
      return null;
    }
  }

  static async validateAdminLogin(email: string, password: string): Promise<User | null> {
    try {
      const response = await ApiClient.request<{ user: User; token: string }>('/auth/admin/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error('Admin login failed:', error);
      return null;
    }
  }
  static async register(userData: {
    email: string;
    password: string;
    password_confirm: string;
    name: string;
    phone?: string;
    business_name?: string;
    sector?: string;
  }): Promise<User | null> {
    try {
      const response = await ApiClient.request<{ user: User; token: string }>('/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.token);
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  static async getUserProfile(): Promise<User | null> {
    try {
      const response = await ApiClient.request<User>('/auth/profile/');
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Get profile failed:', error);
      return null;
    }
  }

  static async updateProfile(profileData: Partial<User>): Promise<User | null> {
    try {
      const response = await ApiClient.request<User>('/auth/profile/update/', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  }

  static async validateToken(): Promise<boolean> {
    try {
      const response = await ApiClient.request('/auth/validate-token/', {
        method: 'POST',
      });
      return response.success;
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('auth_token');
      return false;
    }
  }

  static async createUserAccount(userData: Omit<User, 'id' | 'role'>): Promise<User> {
    const registerData = {
      email: userData.email,
      password: 'temp_password_123', // This should be handled differently in real app
      password_confirm: 'temp_password_123',
      name: userData.name,
      phone: userData.phone,
      business_name: userData.businessName,
      sector: userData.sector,
    };

    const user = await this.register(registerData);
    if (!user) {
      throw new Error('Failed to create user account');
    }
    return user;
  }

  static logout(): void {
    localStorage.removeItem('auth_token');
  }
}

// Document Management Services
export class DocumentService {
  static async uploadDocument(
    file: File, 
    documentType: string, 
    applicationId?: string
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    if (applicationId) {
      formData.append('application_id', applicationId);
    }

    try {
      const response = await ApiClient.uploadFile('/documents/upload/', formData);
      if (response.success && response.data) {
        const data = response.data as DocumentUploadResponse;
        return {
          id: data.id,
          name: data.name,
          type: data.type,
          size: data.size,
          url: data.url,
          uploadedAt: new Date(data.uploaded_at),
          documentType: data.document_type,
          application_id: data.application_id,
        };
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  }

  static async uploadMedia(
    file: File, 
    mediaType: string, 
    applicationId?: string
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('media_type', mediaType);
    if (applicationId) {
      formData.append('application_id', applicationId);
    }

    try {
      const response = await ApiClient.uploadFile('/documents/media/upload/', formData);
      if (response.success && response.data) {
        const data = response.data as MediaUploadResponse;
        return {
          id: data.id,
          name: data.name,
          type: data.type,
          size: data.size,
          url: data.url,
          uploadedAt: new Date(data.uploaded_at),
          documentType: data.media_type,
          application_id: data.application_id,
        };
      }
      throw new Error('Media upload failed');
    } catch (error) {
      console.error('Media upload failed:', error);
      throw error;
    }
  }

  static async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const response = await ApiClient.request(`/documents/${documentId}/delete/`, {
        method: 'DELETE',
      });
      return response.success;
    } catch (error) {
      console.error('Document deletion failed:', error);
      return false;
    }
  }

  static async getUserDocuments(): Promise<Document[]> {
    try {
      const response = await ApiClient.request<Document[]>('/documents/user/');
      if (response.success && response.data) {
        return response.data.map(doc => ({
          ...doc,
          uploadedAt: new Date(doc.uploadedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Get user documents failed:', error);
      return [];
    }
  }
}

// Application Services
export class ApplicationService {
  static async createApplication(applicationData: Partial<Application>): Promise<Application> {
    try {
      const response = await ApiClient.request<Application>('/applications/create/', {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Application creation failed');
    } catch (error) {
      console.error('Create application failed:', error);
      throw error;
    }
  }

  static async getUserApplications(): Promise<Application[]> {
    try {
      const response = await ApiClient.request<Application[]>('/applications/user/');
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Get user applications failed:', error);
      return [];
    }
  }

  static async getUserApplication(userId: string): Promise<Application | null> {
    try {
      const response = await ApiClient.request<Application>(`/application/${userId}/`);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Get user application failed:', error);
      return null;
    }
  }

  static async getApplicationDetail(applicationId: string): Promise<Application | null> {
    try {
      const response = await ApiClient.request<Application>(`/applications/${applicationId}/`);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Get application detail failed:', error);
      return null;
    }
  }

  static async updateApplication(applicationId: string, updateData: Partial<Application>): Promise<Application | null> {
    try {
      const response = await ApiClient.request<Application>(`/applications/${applicationId}/update/`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Update application failed:', error);
      throw error;
    }
  }

  static async submitApplication(applicationId: string): Promise<boolean> {
    try {
      const response = await ApiClient.request(`/applications/${applicationId}/submit/`, {
        method: 'POST',
      });
      return response.success;
    } catch (error) {
      console.error('Submit application failed:', error);
      return false;
    }
  }

  static async deleteApplication(applicationId: string): Promise<boolean> {
    try {
      const response = await ApiClient.request(`/applications/${applicationId}/delete/`, {
        method: 'DELETE',
      });
      return response.success;
    } catch (error) {
      console.error('Delete application failed:', error);
      return false;
    }
  }

  // Legacy method for compatibility
  static async getApplication(userId: string): Promise<Application | null> {
    return this.getUserApplication(userId);
  }
}

// Credit Scoring Services
export class CreditScoringService {
  static async calculateCreditScore(): Promise<CreditScore | null> {
    try {
      const response = await ApiClient.request<CreditScore>('/scoring/calculate/', {
        method: 'POST',
      });
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Calculate credit score failed:', error);
      return null;
    }
  }

  static async getCreditScore(): Promise<CreditScore | null> {
    try {
      const response = await ApiClient.request<CreditScore>('/scoring/score/');
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Get credit score failed:', error);
      return null;
    }
  }

  static async getScoreExplanation(): Promise<{
    factors: Record<string, string | number>;
    recommendations: string[];
    explanation: string;
  } | null> {
    try {
      const response = await ApiClient.request<{
        factors: Record<string, string | number>;
        recommendations: string[];
        explanation: string;
      }>('/scoring/explanation/');
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Get score explanation failed:', error);
      return null;
    }
  }
}

// Survey Services
export class SurveyService {
  static async submitSurvey(surveyData: {
    satisfaction: number;
    easeOfUse: number;
    supportQuality: number;
    likelihoodToRecommend: number;
    feedback: string;
    improvements: string[];
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await ApiClient.request<{ success: boolean; message?: string }>('/survey/', {
        method: 'POST',
        body: JSON.stringify(surveyData),
      });
      return response;
    } catch (error) {
      console.error('Submit survey failed:', error);
      throw error;
    }
  }
}

// Data Integration Services
export class DataIntegrationService {
  static async parseSmsMessages(smsMessages: string[]): Promise<unknown> {
    try {
      const response = await ApiClient.request('/data/sms/parse/', {
        method: 'POST',
        body: JSON.stringify({ sms_messages: smsMessages }),
      });
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Parse SMS messages failed:', error);
      throw error;
    }
  }

  static async aiParseSmsMessages(smsMessages: string[]): Promise<unknown> {
    try {
      const response = await ApiClient.request('/data/sms/ai-parse/', {
        method: 'POST',
        body: JSON.stringify({ sms_messages: smsMessages }),
      });
      return response.success ? response.data : null;
    } catch (error) {
      console.error('AI parse SMS messages failed:', error);
      throw error;
    }
  }

  static async getDemoSmsMessages(): Promise<string[]> {
    try {
      const response = await ApiClient.request<string[]>('/data/sms/demo/');
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Get demo SMS messages failed:', error);
      return [];
    }
  }

  static async syncMpesaData(): Promise<boolean> {
    try {
      const response = await ApiClient.request('/data/sync/', {
        method: 'POST',
      });
      return response.success;
    } catch (error) {
      console.error('Sync M-Pesa data failed:', error);
      return false;
    }
  }
}

// Chatbot Services
export class ChatbotService {
  static async sendMessage(message: string): Promise<{ response: string } | null> {
    try {
      const response = await ApiClient.request<{ response: string }>('/chat/message/', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Send chat message failed:', error);
      return null;
    }
  }

  static async getChatSuggestions(): Promise<string[]> {
    try {
      const response = await ApiClient.request<string[]>('/chat/suggestions/');
      return response.success ? response.data || [] : [];
    } catch (error) {
      console.error('Get chat suggestions failed:', error);
      return [];
    }
  }
}

// Admin Services
export class AdminService {
  static async getAllApplications(page = 1, status?: string): Promise<{
    applications: Application[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      let url = `/admin/applications/?page=${page}`;
      if (status) url += `&status=${status}`;

      const response = await ApiClient.request<{
        applications: Application[];
        total: number;
        page: number;
        pages: number;
      }>(url);

      return response.success ? response.data || { applications: [], total: 0, page: 1, pages: 1 } : { applications: [], total: 0, page: 1, pages: 1 };
    } catch (error) {
      console.error('Get all applications failed:', error);
      return { applications: [], total: 0, page: 1, pages: 1 };
    }
  }

  static async getApplicationDetails(applicationId: string): Promise<Application | null> {
    try {
      const response = await ApiClient.request<Application>(`/admin/applications/${applicationId}/`);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Get application details failed:', error);
      return null;
    }
  }

  static async reviewApplication(
    applicationId: string,
    reviewData: {
      status: 'approved' | 'rejected' | 'pending';
      comments?: string;
      conditions?: string[];
    }
  ): Promise<boolean> {
    try {
      const response = await ApiClient.request(`/admin/applications/${applicationId}/review/`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });
      return response.success;
    } catch (error) {
      console.error('Review application failed:', error);
      return false;
    }
  }

  static async getStatsOverview(): Promise<{
    totalApplications: number;
    approvedApplications: number;
    pendingApplications: number;
    rejectedApplications: number;
    totalFundingRequested: number;
    averageScore: number;
  }> {
    try {
      const response = await ApiClient.request<{
        totalApplications: number;
        approvedApplications: number;
        pendingApplications: number;
        rejectedApplications: number;
        totalFundingRequested: number;
        averageScore: number;
      }>('/admin/dashboard/stats/');

      return response.success ? response.data || {
        totalApplications: 0,
        approvedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0,
        totalFundingRequested: 0,
        averageScore: 0,
      } : {
        totalApplications: 0,
        approvedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0,
        totalFundingRequested: 0,
        averageScore: 0,
      };
    } catch (error) {
      console.error('Get stats overview failed:', error);
      return {
        totalApplications: 0,
        approvedApplications: 0,
        pendingApplications: 0,
        rejectedApplications: 0,
        totalFundingRequested: 0,
        averageScore: 0,
      };
    }
  }

  static async getUserDashboard(userId: string): Promise<{
    user: User;
    application: Application | null;
    documents: Document[];
    creditScore: CreditScore | null;
  } | null> {
    try {
      const response = await ApiClient.request<{
        user: User;
        application: Application | null;
        documents: Document[];
        creditScore: CreditScore | null;
      }>(`/user/${userId}/dashboard/`);

      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Get user dashboard failed:', error);
      return null;
    }
  }

  static async postUserNote(userId: string, note: string, visible: boolean): Promise<boolean> {
    try {
      const response = await ApiClient.request(`/user/${userId}/note/`, {
        method: 'POST',
        body: JSON.stringify({ note, visible }),
      });
      return response.success;
    } catch (error) {
      console.error('Post user note failed:', error);
      return false;
    }
  }

  static async postUserFeedback(userId: string, feedback: string): Promise<boolean> {
    try {
      const response = await ApiClient.request(`/user/${userId}/feedback/`, {
        method: 'POST',
        body: JSON.stringify({ feedback }),
      });
      return response.success;
    } catch (error) {
      console.error('Post user feedback failed:', error);
      return false;
    }
  }

  static async postUserScore(userId: string, score: string | number): Promise<boolean> {
    try {
      const response = await ApiClient.request(`/user/${userId}/score/`, {
        method: 'POST',
        body: JSON.stringify({ score }),
      });
      return response.success;
    } catch (error) {
      console.error('Post user score failed:', error);
      return false;
    }
  }

  static async getAnalytics(): Promise<{
    applicationTrends: unknown[];
    sectorDistribution: Record<string, number>;
    approvalRates: unknown[];
    fundingStats: unknown[];
  }> {
    try {
      const response = await ApiClient.request<{
        applicationTrends: unknown[];
        sectorDistribution: Record<string, number>;
        approvalRates: unknown[];
        fundingStats: unknown[];
      }>('/admin/analytics/');

      return response.success ? response.data || {
        applicationTrends: [],
        sectorDistribution: {},
        approvalRates: [],
        fundingStats: [],
      } : {
        applicationTrends: [],
        sectorDistribution: {},
        approvalRates: [],
        fundingStats: [],
      };
    } catch (error) {
      console.error('Get analytics failed:', error);
      return {
        applicationTrends: [],
        sectorDistribution: {},
        approvalRates: [],
        fundingStats: [],
      };
    }
  }

  static async getUsersBySector(): Promise<Record<string, User[]>> {
    try {
      const response = await ApiClient.request<Record<string, User[]>>('/admin/users/by-sector/');
      return response.success ? response.data || {} : {};
    } catch (error) {
      console.error('Get users by sector failed:', error);
      return {};
    }
  }

  static async getRiskAlerts(): Promise<{
    highRiskUsers: User[];
    flaggedApplications: Application[];
    alerts: { id: string; type: string; message: string; severity: string }[];
  }> {
    try {
      const response = await ApiClient.request<{
        highRiskUsers: User[];
        flaggedApplications: Application[];
        alerts: { id: string; type: string; message: string; severity: string }[];
      }>('/admin/risk-alerts/');

      return response.success ? response.data || {
        highRiskUsers: [],
        flaggedApplications: [],
        alerts: [],
      } : {
        highRiskUsers: [],
        flaggedApplications: [],
        alerts: [],
      };
    } catch (error) {
      console.error('Get risk alerts failed:', error);
      return {
        highRiskUsers: [],
        flaggedApplications: [],
        alerts: [],
      };
    }
  }

  static async downloadUserData(userId?: string): Promise<Blob> {
    try {
      const endpoint = userId ? `/admin/download/user/${userId}/` : '/admin/download/all/';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: ApiClient['getHeaders'](),
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Download user data failed:', error);
      throw error;
    }
  }

  static async shareWithHeva(userId: string): Promise<boolean> {
    try {
      const response = await ApiClient.request(`/admin/heva/share/${userId}/`, {
        method: 'POST',
      });
      return response.success;
    } catch (error) {
      console.error('Share with HEVA failed:', error);
      return false;
    }
  }

  static async getChatbotMessages(userId: string): Promise<{
    messages: { id: string; message: string; response: string; timestamp: string }[];
  }> {
    try {
      const response = await ApiClient.request<{
        messages: { id: string; message: string; response: string; timestamp: string }[];
      }>(`/admin/chatbot/user/${userId}/`);

      return response.success ? response.data || { messages: [] } : { messages: [] };
    } catch (error) {
      console.error('Get chatbot messages failed:', error);
      return { messages: [] };
    }
  }

  static async getWhatsAppMessages(userId: string): Promise<{
    messages: { id: string; from: string; to: string; body: string; timestamp: string }[];
  }> {
    try {
      const response = await ApiClient.request<{
        messages: { id: string; from: string; to: string; body: string; timestamp: string }[];
      }>(`/admin/whatsapp/user/${userId}/`);

      return response.success ? response.data || { messages: [] } : { messages: [] };
    } catch (error) {
      console.error('Get WhatsApp messages failed:', error);
      return { messages: [] };
    }
  }

  // Legacy methods for compatibility
  static async updateApplicationStatus(
    applicationId: string, 
    status: Application['status']
  ): Promise<Application | null> {
    return this.getApplicationDetails(applicationId);
  }
}

// Database Schema Requirements
export const DATABASE_SCHEMAS = {
  users: `
    CREATE TABLE users (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      business_name VARCHAR(255),
      sector VARCHAR(255),
      application_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `,
  
  documents: `
    CREATE TABLE documents (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      size BIGINT NOT NULL,
      url VARCHAR(500) NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `,
  
  applications: `
    CREATE TABLE applications (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      status ENUM('draft', 'submitted', 'reviewing', 'approved', 'rejected') DEFAULT 'draft',
      funding_type ENUM('grant', 'loan', 'investment') NOT NULL,
      amount DECIMAL(15,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `
};

// API Endpoints Summary
export const API_ENDPOINTS = {
  // Authentication
  USER_LOGIN: 'POST /api/auth/user/login',
  ADMIN_LOGIN: 'POST /api/auth/admin/login',
  CREATE_USER: 'POST /api/users',
  
  // Documents
  UPLOAD_DOCUMENT: 'POST /api/documents/upload',
  DELETE_DOCUMENT: 'DELETE /api/documents/:documentId',
  GET_USER_DOCUMENTS: 'GET /api/documents/user/:userId',
  
  // Applications
  CREATE_APPLICATION: 'POST /api/applications',
  GET_USER_APPLICATION: 'GET /api/applications/user/:userId',
  GET_APPLICATION: 'GET /api/application/:userId',
  
  // Survey
  SUBMIT_SURVEY: 'POST /api/survey',
  
  // Admin
  GET_ALL_APPLICATIONS: 'GET /api/admin/applications',
  GET_APPLICATION_DETAILS: 'GET /api/admin/applications/:applicationId',
  UPDATE_APPLICATION_STATUS: 'PATCH /api/admin/applications/:applicationId',
  
  // Admin Dashboard
  GET_STATS_OVERVIEW: 'GET /api/stats/overview',
  GET_USER_DASHBOARD: 'GET /api/user/:id/dashboard',
  POST_USER_NOTE: 'POST /api/user/:id/note',
  POST_USER_FEEDBACK: 'POST /api/user/:id/feedback',
  POST_USER_SCORE: 'POST /api/user/:id/score',
  GET_ANALYTICS: 'GET /api/analytics',
  GET_USERS_BY_SECTOR: 'GET /api/users/by-sector',
  GET_RISK_ALERTS: 'GET /api/users/risk-alerts',
  
  // Data Export & Sharing
  DOWNLOAD_USER_DATA: 'GET /api/download/user/:id',
  DOWNLOAD_ALL_DATA: 'GET /api/download/all',
  SHARE_WITH_HEVA: 'POST /api/heva/share/:id',
  
  // Chatbot
  GET_CHATBOT_MESSAGES: 'GET /api/chatbot/user/:id',
  GET_WHATSAPP_MESSAGES: 'GET /api/whatsapp/user/:id'
}; 