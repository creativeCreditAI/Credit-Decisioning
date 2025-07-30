// 🔌 Backend Service Integration Points
// This file documents all the backend API calls that need to be implemented

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  businessName?: string;
  sector?: string;
  applicationId?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  documentType: string;
  userId: string;
}

export interface Application {
  id: string;
  userId: string;
  status: "draft" | "submitted" | "reviewing" | "approved" | "rejected";
  fundingType: "grant" | "loan" | "investment";
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Authentication Services
export class AuthService {
  // User login validation
  static async validateUserLogin(email: string, password: string): Promise<User | null> {
    // TODO: Implement backend call
    // POST /api/auth/user/login
    // Body: { email, password }
    // Returns: User object or null
    throw new Error("Backend integration required");
  }

  // Admin login validation
  static async validateAdminLogin(email: string, password: string): Promise<User | null> {
    // TODO: Implement backend call
    // POST /api/auth/admin/login
    // Body: { email, password }
    // Returns: User object or null
    throw new Error("Backend integration required");
  }

  // Create user account after application completion
  static async createUserAccount(userData: Omit<User, 'id' | 'role'>): Promise<User> {
    // TODO: Implement backend call
    // POST /api/users
    // Body: { name, email, businessName, sector, applicationId }
    // Returns: Created User object
    throw new Error("Backend integration required");
  }
}

// Document Management Services
export class DocumentService {
  // Upload single document
  static async uploadDocument(
    file: File, 
    documentType: string, 
    userId: string
  ): Promise<Document> {
    // TODO: Implement backend call
    // POST /api/documents/upload
    // FormData: { file, documentType, userId }
    // Returns: Document object with URL and metadata
    throw new Error("Backend integration required");
  }

  // Delete single document
  static async deleteDocument(documentId: string): Promise<boolean> {
    // TODO: Implement backend call
    // DELETE /api/documents/:documentId
    // Returns: Success boolean
    throw new Error("Backend integration required");
  }

  // Get user documents
  static async getUserDocuments(userId: string): Promise<Document[]> {
    // TODO: Implement backend call
    // GET /api/documents/user/:userId
    // Returns: Array of Document objects
    throw new Error("Backend integration required");
  }
}

// Application Services
export class ApplicationService {
  // Create application after document upload completion
  static async createApplication(
    userId: string,
    fundingType: string,
    documents: Document[]
  ): Promise<Application> {
    // TODO: Implement backend call
    // POST /api/applications
    // Body: { userId, fundingType, documentIds: string[] }
    // Returns: Created Application object
    throw new Error("Backend integration required");
  }

  // Get user application
  static async getUserApplication(userId: string): Promise<Application | null> {
    // TODO: Implement backend call
    // GET /api/applications/user/:userId
    // Returns: Application object or null
    throw new Error("Backend integration required");
  }

  // Get application data for profile page
  static async getApplication(userId: string): Promise<any> {
    // TODO: Implement backend call
    // GET /api/application/:userId
    // Returns: Application data with documents and survey info
    throw new Error("Backend integration required");
  }
}

// Survey Services
export class SurveyService {
  // Submit post-application survey
  static async submitSurvey(surveyData: any): Promise<any> {
    // TODO: Implement backend call
    // POST /api/survey
    // Body: { satisfaction, easeOfUse, supportQuality, likelihoodToRecommend, feedback, improvements }
    // Returns: Success response
    throw new Error("Backend integration required");
  }
}

// Admin Services
export class AdminService {
  // Get all applications for admin dashboard
  static async getAllApplications(): Promise<Application[]> {
    // TODO: Implement backend call
    // GET /api/admin/applications
    // Returns: Array of Application objects
    throw new Error("Backend integration required");
  }

  // Get application details
  static async getApplicationDetails(applicationId: string): Promise<Application> {
    // TODO: Implement backend call
    // GET /api/admin/applications/:applicationId
    // Returns: Application object with full details
    throw new Error("Backend integration required");
  }

  // Update application status
  static async updateApplicationStatus(
    applicationId: string, 
    status: Application['status']
  ): Promise<Application> {
    // TODO: Implement backend call
    // PATCH /api/admin/applications/:applicationId
    // Body: { status }
    // Returns: Updated Application object
    throw new Error("Backend integration required");
  }

  // Get dashboard overview stats
  static async getStatsOverview(): Promise<any> {
    // TODO: Implement backend call
    // GET /api/stats/overview
    // Returns: Dashboard statistics
    throw new Error("Backend integration required");
  }

  // Get user dashboard data
  static async getUserDashboard(userId: string): Promise<any> {
    // TODO: Implement backend call
    // GET /api/user/:id/dashboard
    // Returns: User dashboard data
    throw new Error("Backend integration required");
  }

  // Post admin note for user
  static async postUserNote(userId: string, note: string, visible: boolean): Promise<any> {
    // TODO: Implement backend call
    // POST /api/user/:id/note
    // Body: { note, visible }
    // Returns: Success response
    throw new Error("Backend integration required");
  }

  // Post admin feedback for user
  static async postUserFeedback(userId: string, feedback: string): Promise<any> {
    // TODO: Implement backend call
    // POST /api/user/:id/feedback
    // Body: { feedback }
    // Returns: Success response
    throw new Error("Backend integration required");
  }

  // Post admin score for user
  static async postUserScore(userId: string, score: string | number): Promise<any> {
    // TODO: Implement backend call
    // POST /api/user/:id/score
    // Body: { score }
    // Returns: Success response
    throw new Error("Backend integration required");
  }

  // Get analytics data
  static async getAnalytics(): Promise<any> {
    // TODO: Implement backend call
    // GET /api/analytics
    // Returns: Analytics data
    throw new Error("Backend integration required");
  }

  // Get users by sector
  static async getUsersBySector(): Promise<any> {
    // TODO: Implement backend call
    // GET /api/users/by-sector
    // Returns: Users grouped by sector
    throw new Error("Backend integration required");
  }

  // Get risk alerts
  static async getRiskAlerts(): Promise<any> {
    // TODO: Implement backend call
    // GET /api/users/risk-alerts
    // Returns: Risk alerts data
    throw new Error("Backend integration required");
  }

  // Download user data
  static async downloadUserData(userId?: string): Promise<Blob> {
    // TODO: Implement backend call
    // GET /api/download/user/:id or GET /api/download/all
    // Returns: File blob
    throw new Error("Backend integration required");
  }

  // Share data with HEVA
  static async shareWithHeva(userId: string): Promise<any> {
    // TODO: Implement backend call
    // POST /api/heva/share/:id
    // Returns: Success response
    throw new Error("Backend integration required");
  }

  // Get chatbot messages
  static async getChatbotMessages(userId: string): Promise<any> {
    // TODO: Implement backend call
    // GET /api/chatbot/user/:id
    // Returns: Chatbot conversation history
    throw new Error("Backend integration required");
  }

  // Get WhatsApp messages
  static async getWhatsAppMessages(userId: string): Promise<any> {
    // TODO: Implement backend call
    // GET /api/whatsapp/user/:id
    // Returns: WhatsApp conversation history
    throw new Error("Backend integration required");
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