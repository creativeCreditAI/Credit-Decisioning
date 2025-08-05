import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  ArrowLeft, 
  User, 
  Mail, 
  Building2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Shield,
  Key
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { RoleBasedNavbar } from "./RoleBasedNavbar";

export const AdminProfileSettings = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    role: user?.role || "admin"
  });
  
  // Password management state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasPassword, setHasPassword] = useState(true); // Assume admin has password set

  const roleOptions = [
    { value: "admin", label: "Administrator" },
    { value: "superadmin", label: "Super Administrator" },
    { value: "manager", label: "Manager" },
    { value: "reviewer", label: "Reviewer" },
    { value: "analyst", label: "Analyst" }
  ];

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear message when user starts typing
    if (message) {
      setMessage(null);
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear password message when user starts typing
    if (passwordMessage) {
      setPasswordMessage(null);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePasswordStrength = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    };
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Validate required fields
      if (!profileData.fullName.trim()) {
        setMessage({ type: 'error', text: 'Full name is required.' });
        return;
      }
      
      if (!profileData.email.trim()) {
        setMessage({ type: 'error', text: 'Email address is required.' });
        return;
      }
      
      if (!validateEmail(profileData.email)) {
        setMessage({ type: 'error', text: 'Please enter a valid email address.' });
        return;
      }
      
      // 🔌 Placeholder for backend call
      console.log("Updating admin profile:", profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local user data
      updateUser({
        name: profileData.fullName,
        email: profileData.email,
        role: profileData.role as "admin" | "superadmin"
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordMessage(null);
    
    try {
      // Validate current password is not empty (if changing password)
      if (hasPassword && !passwordData.currentPassword) {
        setPasswordMessage({ type: 'error', text: 'Current password is required.' });
        return;
      }
      
      // Validate new password strength
      const passwordStrength = validatePasswordStrength(passwordData.newPassword);
      if (!passwordStrength.isValid) {
        setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long and contain uppercase, lowercase, and numbers.' });
        return;
      }
      
      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
        return;
      }
      
      // 🔌 Placeholder for backend call - Verify current password and update
      console.log("Changing admin password:", {
        currentPassword: hasPassword ? "***HASHED_CURRENT***" : "N/A",
        newPassword: "***HASHED_NEW***",
        isInitialSetup: !hasPassword
      });
      
      // Simulate API call for password verification and update
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 🔌 Backend integration: 
      // 1. Hash current password and verify against stored hash (if changing)
      // 2. Hash new password using bcrypt or similar
      // 3. Update password in database
      // 4. Invalidate existing sessions if needed
      
      setPasswordMessage({ type: 'success', text: hasPassword ? 'Password updated successfully!' : 'Password set successfully!' });
      
      // Update hasPassword state if this was initial setup
      if (!hasPassword) {
        setHasPassword(true);
      }
      
      // Clear form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
      });
      
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'Failed to update password. Please check your current password and try again.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleBasedNavbar role="admin" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/overview")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your admin account information and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {user?.name?.split(" ").map(n => n[0]).join("") || "A"}
                  </AvatarFallback>
                </Avatar>
                
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-gray-600 text-sm">{user?.email}</p>
                
                <div className="mt-3">
                  <Badge variant="default" className="bg-blue-600">
                    <Shield className="w-3 h-3 mr-1" />
                    {profileData.role}
                  </Badge>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Profile Complete</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Email Verified</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Admin Access</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal and role information
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {message && (
                  <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    {message.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        value={profileData.fullName}
                        onChange={(e) => handleProfileChange("fullName", e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange("email", e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This will be used as your login username
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="role" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Role in the Company *
                    </Label>
                    <Select value={profileData.role} onValueChange={(value) => handleProfileChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/admin/overview")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Save Changes
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Password Management */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Key className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Password Management</CardTitle>
                    <CardDescription>
                      {hasPassword ? "Change your account password" : "Set up your account password"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {passwordMessage && (
                  <Alert className={`mb-6 ${passwordMessage.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    {passwordMessage.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={passwordMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                      {passwordMessage.text}
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {hasPassword && (
                    <div>
                      <Label htmlFor="currentPassword" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Current Password *
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                          placeholder="Enter your current password"
                          required
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('current')}
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="newPassword" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {hasPassword ? "New Password" : "Set Password"} *
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                        placeholder={hasPassword ? "Enter your new password" : "Enter your password"}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {passwordData.newPassword && (
                      <div className="mt-2 space-y-2">
                        <div className="text-xs text-gray-600">Password strength:</div>
                        <div className="flex gap-2">
                          {[
                            { key: 'minLength', label: '8+ chars', valid: passwordData.newPassword.length >= 8 },
                            { key: 'hasUpperCase', label: 'A-Z', valid: /[A-Z]/.test(passwordData.newPassword) },
                            { key: 'hasLowerCase', label: 'a-z', valid: /[a-z]/.test(passwordData.newPassword) },
                            { key: 'hasNumbers', label: '0-9', valid: /\d/.test(passwordData.newPassword) }
                          ].map((requirement) => (
                            <Badge
                              key={requirement.key}
                              variant={requirement.valid ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {requirement.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirmNewPassword" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Confirm {hasPassword ? "New " : ""}Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmNewPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmNewPassword}
                        onChange={(e) => handlePasswordChange("confirmNewPassword", e.target.value)}
                        placeholder={hasPassword ? "Confirm your new password" : "Confirm your password"}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Password Match Indicator */}
                    {passwordData.confirmNewPassword && (
                      <div className="mt-2">
                        {passwordData.newPassword === passwordData.confirmNewPassword ? (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Passwords match
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            Passwords do not match
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      type="submit" 
                      disabled={isChangingPassword || 
                        (hasPassword && !passwordData.currentPassword) || 
                        !passwordData.newPassword || 
                        !passwordData.confirmNewPassword}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isChangingPassword ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          {hasPassword ? "Updating Password..." : "Setting Password..."}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Save Changes
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
