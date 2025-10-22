# Credit Decisioning Platform - Frontend Integration Guide

## 🚀 Quick Start with Backend Integration

This frontend is now fully integrated with your Django backend API running on port 8000. Follow these steps to get everything connected:

### 1. Backend Setup

Make sure your Django backend is running on `http://localhost:8000` with the following API endpoints available:

```bash
# Start your Django backend
cd your-backend-directory
python manage.py runserver 8000
```

### 2. Frontend Setup

```bash
# Install dependencies
bun install

# Start the development server
bun run dev
```

The frontend will connect to your backend at `http://localhost:8000/api` by default.

## 🔌 Backend Integration Features

### ✅ Implemented Services

1. **Authentication Service**
   - User login/registration
   - Admin login
   - Token management
   - Profile management

2. **Application Service**
   - Create/update applications
   - Submit applications
   - Get user applications
   - Application status tracking

3. **Document Service**
   - Upload documents
   - Upload media files
   - Delete documents
   - Retrieve user documents

4. **Credit Scoring Service**
   - Calculate credit scores
   - Get score explanations
   - Retrieve user scores

5. **Admin Service**
   - Dashboard statistics
   - Application management
   - User management
   - Analytics and reporting

6. **Chat/Bot Service**
   - AI assistant integration
   - Chat suggestions
   - Message handling

### 🎯 Key Components

#### IntegratedDashboard Component
A comprehensive dashboard that demonstrates all backend integrations:

- **User Dashboard**: Applications, documents, credit score, chat
- **Admin Dashboard**: Stats, user management, application reviews
- **Real-time Error Handling**: Proper error states and loading indicators
- **File Upload**: Document management with progress tracking

#### Usage Example:
```tsx
import { IntegratedDashboard } from './components/IntegratedDashboard';

function App() {
  return (
    <AuthProvider>
      <IntegratedDashboard />
    </AuthProvider>
  );
}
```

## 🛠️ API Configuration

### Environment Variables

Create or update `.env.local`:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_WHATSAPP_BOT=true
VITE_ENABLE_CREDIT_SCORING=true
VITE_ENABLE_DOCUMENT_UPLOAD=true
VITE_ENABLE_ADMIN_DASHBOARD=true

# File Upload Settings
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg,.png,.doc,.docx
```

### Service Usage Examples

#### Authentication
```tsx
import { AuthService } from './services/backendService';

// User login
const user = await AuthService.validateUserLogin(email, password);

// Admin login
const admin = await AuthService.validateAdminLogin(email, password);

// Update profile
const updatedUser = await AuthService.updateProfile({
  name: "New Name",
  businessName: "Updated Business"
});
```

#### Applications
```tsx
import { ApplicationService } from './services/backendService';

// Create application
const application = await ApplicationService.createApplication({
  business_name: "My Business",
  business_description: "Business description",
  funding_amount_requested: 500000,
  business_stage: "startup",
  sector: "technology"
});

// Get user applications
const applications = await ApplicationService.getUserApplications();

// Submit application
await ApplicationService.submitApplication(applicationId);
```

#### Document Upload
```tsx
import { DocumentService } from './services/backendService';

// Upload document
const document = await DocumentService.uploadDocument(
  file, 
  'business_plan', 
  applicationId
);

// Get user documents
const documents = await DocumentService.getUserDocuments();
```

#### Credit Scoring
```tsx
import { CreditScoringService } from './services/backendService';

// Calculate score
const score = await CreditScoringService.calculateCreditScore();

// Get existing score
const existingScore = await CreditScoringService.getCreditScore();
```

#### Admin Functions
```tsx
import { AdminService } from './services/backendService';

// Get dashboard stats
const stats = await AdminService.getStatsOverview();

// Review application
await AdminService.reviewApplication(applicationId, {
  status: 'approved',
  comments: 'Application looks good'
});

// Get all applications
const { applications } = await AdminService.getAllApplications(1, 'pending');
```

## 🎨 UI Components Integration

### Authentication Flow
The AuthContext is fully integrated with the backend:

```tsx
const { user, login, logout, createUserAccount } = useAuth();

// Login
const success = await login(email, password, 'user');

// Create account
const created = await createUserAccount({
  name: "John Doe",
  email: "john@example.com",
  businessName: "John's Business"
});
```

### Error Handling
Comprehensive error handling with user-friendly messages:

```tsx
try {
  const result = await ApplicationService.createApplication(data);
  // Success handling
} catch (error) {
  if (error instanceof ApiError) {
    setError(error.message);
  } else {
    setError('An unexpected error occurred');
  }
}
```

### Loading States
All API calls include proper loading states:

```tsx
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await SomeService.someMethod();
  } finally {
    setLoading(false);
  }
};
```

## 🔍 Testing the Integration

### 1. Test User Registration/Login
1. Go to the login page
2. Register a new user or login with existing credentials
3. Verify token is stored and user data is retrieved

### 2. Test Application Creation
1. Navigate to the dashboard
2. Fill out the application form
3. Submit and verify it appears in the applications list

### 3. Test Document Upload
1. Select a file in the document upload section
2. Upload and verify it appears in the documents list
3. Check that the file is properly stored in your backend

### 4. Test Credit Scoring
1. Click "Calculate Score" button
2. Verify the score is calculated and displayed
3. Check recommendations are shown

### 5. Test Admin Features (Admin Login)
1. Login as admin
2. View dashboard statistics
3. Review applications
4. Test admin-specific functionalities

## 🚦 API Status Indicators

The frontend includes network status detection and offline handling:

- **Online/Offline Detection**: Automatic detection of network status
- **Retry Mechanism**: Failed requests are automatically retried
- **Local Caching**: Important data is cached for offline access
- **Error Boundaries**: Graceful error handling throughout the app

## 🔧 Customization

### Adding New API Endpoints

1. Add the endpoint to `backendService.ts`:
```tsx
export class NewService {
  static async newMethod(data: any): Promise<any> {
    try {
      const response = await ApiClient.request('/new/endpoint/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response.success ? response.data : null;
    } catch (error) {
      console.error('New method failed:', error);
      throw error;
    }
  }
}
```

2. Use in components:
```tsx
import { NewService } from '../services/backendService';

const handleNewAction = async () => {
  try {
    const result = await NewService.newMethod(data);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Modifying API Base URL

Update the environment variable:
```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

## 📊 Backend API Endpoints Summary

Your Django backend should have these endpoints available:

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/admin/login/` - Admin login
- `POST /api/auth/register/` - User registration
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/update/` - Update profile
- `POST /api/auth/validate-token/` - Validate token

### Applications
- `POST /api/applications/create/` - Create application
- `GET /api/applications/user/` - Get user applications
- `GET /api/application/{user_id}/` - Get application by user ID
- `GET /api/applications/{application_id}/` - Get application details
- `PUT /api/applications/{application_id}/update/` - Update application
- `POST /api/applications/{application_id}/submit/` - Submit application
- `DELETE /api/applications/{application_id}/delete/` - Delete application

### Documents
- `POST /api/documents/upload/` - Upload document
- `POST /api/documents/media/upload/` - Upload media
- `GET /api/documents/user/` - Get user documents
- `DELETE /api/documents/{document_id}/delete/` - Delete document

### Credit Scoring
- `POST /api/scoring/calculate/` - Calculate credit score
- `GET /api/scoring/score/` - Get credit score
- `GET /api/scoring/explanation/` - Get score explanation

### Admin
- `GET /api/admin/dashboard/stats/` - Dashboard statistics
- `GET /api/admin/applications/` - List all applications
- `GET /api/admin/applications/{application_id}/` - Application details
- `POST /api/admin/applications/{application_id}/review/` - Review application

### Chat
- `POST /api/chat/message/` - Send chat message
- `GET /api/chat/suggestions/` - Get chat suggestions

## 🔐 Security Features

- **Token-based Authentication**: JWT/Token authentication
- **Request Validation**: Input validation and sanitization
- **Error Handling**: Secure error messages without sensitive data exposure
- **CORS Configuration**: Proper CORS setup for cross-origin requests

## 📱 Mobile Responsive

The UI is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices
- Progressive Web App (PWA) ready

## 🎉 You're All Set!

Your frontend is now fully connected to your Django backend. The integrated dashboard component provides a comprehensive example of all the available features. Start by testing the login functionality and then explore the various features available based on your user role (user vs admin).

For any issues or questions, check the browser console for detailed error messages and ensure your Django backend is running with all the required endpoints.
