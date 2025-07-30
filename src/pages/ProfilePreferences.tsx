import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  ArrowLeft, 
  Bell, 
  Mail, 
  Shield, 
  Globe,
  CheckCircle,
  AlertCircle,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";

export const ProfilePreferences = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      applicationUpdates: true,
      fundingOpportunities: true,
      marketInsights: false
    },
    privacy: {
      profileVisibility: "public",
      dataSharing: true,
      analytics: true,
      marketing: false
    },
    language: "en",
    timezone: "Africa/Nairobi",
    currency: "KES"
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: string, value: string | boolean) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleGeneralChange = (key: string, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      // 🔌 Placeholder for backend call
      console.log("Updating preferences:", preferences);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update preferences. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Preferences</h1>
          <p className="text-gray-600 mt-2">
            Customize your HEVA experience and manage your settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <Alert className={`${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
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

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Choose how you want to receive updates and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications" className="text-sm">
                        Email notifications
                      </Label>
                      <Switch
                        id="email-notifications"
                        checked={preferences.notifications.email}
                        onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="application-updates" className="text-sm">
                        Application updates
                      </Label>
                      <Switch
                        id="application-updates"
                        checked={preferences.notifications.applicationUpdates}
                        onCheckedChange={(checked) => handleNotificationChange("applicationUpdates", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="funding-opportunities" className="text-sm">
                        Funding opportunities
                      </Label>
                      <Switch
                        id="funding-opportunities"
                        checked={preferences.notifications.fundingOpportunities}
                        onCheckedChange={(checked) => handleNotificationChange("fundingOpportunities", checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Other Notifications
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-notifications" className="text-sm">
                        SMS notifications
                      </Label>
                      <Switch
                        id="sms-notifications"
                        checked={preferences.notifications.sms}
                        onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notifications" className="text-sm">
                        Push notifications
                      </Label>
                      <Switch
                        id="push-notifications"
                        checked={preferences.notifications.push}
                        onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="market-insights" className="text-sm">
                        Market insights
                      </Label>
                      <Switch
                        id="market-insights"
                        checked={preferences.notifications.marketInsights}
                        onCheckedChange={(checked) => handleNotificationChange("marketInsights", checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Data
              </CardTitle>
              <CardDescription>
                Control your privacy settings and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select 
                    value={preferences.privacy.profileVisibility} 
                    onValueChange={(value) => handlePrivacyChange("profileVisibility", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="connections">Connections Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="data-sharing" className="text-sm">
                      Data sharing for credit scoring
                    </Label>
                    <Switch
                      id="data-sharing"
                      checked={preferences.privacy.dataSharing}
                      onCheckedChange={(checked) => handlePrivacyChange("dataSharing", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="analytics" className="text-sm">
                      Analytics and insights
                    </Label>
                    <Switch
                      id="analytics"
                      checked={preferences.privacy.analytics}
                      onCheckedChange={(checked) => handlePrivacyChange("analytics", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketing" className="text-sm">
                      Marketing communications
                    </Label>
                    <Switch
                      id="marketing"
                      checked={preferences.privacy.marketing}
                      onCheckedChange={(checked) => handlePrivacyChange("marketing", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure your account preferences and regional settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={preferences.language} 
                    onValueChange={(value) => handleGeneralChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="sw">Swahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={preferences.timezone} 
                    onValueChange={(value) => handleGeneralChange("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">Nairobi (GMT+3)</SelectItem>
                      <SelectItem value="Africa/Dar_es_Salaam">Dar es Salaam (GMT+3)</SelectItem>
                      <SelectItem value="Africa/Kampala">Kampala (GMT+3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={preferences.currency} 
                    onValueChange={(value) => handleGeneralChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
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
                  Save Preferences
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 