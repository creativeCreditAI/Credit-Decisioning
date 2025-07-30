import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ChatbotProvider } from "@/context/ChatbotContext";
import { LandingPage } from "./pages/LandingPage";
import { Login } from "./pages/Login";
import { ProfileSettings } from "./pages/ProfileSettings";
import { ProfilePreferences } from "./pages/ProfilePreferences";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import { EligibilityCheckForm } from "@/components/EligibilityCheckForm";
import { FundingSelector } from "@/components/FundingSelector";
import { BusinessProfileForm } from "@/components/BusinessProfileForm";
import { DocumentUpload } from "@/components/DocumentUpload";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { UserDashboard } from "@/components/UserDashboard";
import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { BusinessSurvey } from "@/components/BusinessSurvey";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: "user" | "admin" }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/eligibility-check" element={<EligibilityCheckForm />} />
        <Route path="/funding-selection" element={<FundingSelector />} />
        <Route path="/business-profile" element={<BusinessProfileForm />} />
        <Route path="/document-upload" element={<DocumentUpload />} />
        <Route path="/business-survey" element={<BusinessSurvey />} />
        
        {/* Protected User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/progress" 
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/feedback" 
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/chatbot" 
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/profile" 
          element={
            <ProtectedRoute requiredRole="user">
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/settings" 
          element={
            <ProtectedRoute requiredRole="user">
              <ProfileSettings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile/preferences" 
          element={
            <ProtectedRoute requiredRole="user">
              <ProfilePreferences />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requiredRole="user">
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/applicants" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/analytics" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/alerts" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/sectors" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardLayout />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/profile" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardLayout />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatbotWidget />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ChatbotProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </ChatbotProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// Admin Login Component
const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const success = await login(email, password, "admin");
      
      if (success) {
        navigate("/admin/dashboard");
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Access HEVA admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@heva.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
