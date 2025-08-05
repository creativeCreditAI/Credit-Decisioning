import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Save, 
  Download, 
  Trash2, 
  Pause, 
  X, 
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  Type,
  Globe,
  Volume2,
  Accessibility,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useUserSettings, type Language, type FundingType, type Theme, type TextSize } from "@/context/UserSettingsContext";
import { useAuth } from "@/context/AuthContext";

export const UserSettingsPanel = () => {
  const { settings, updateSettings, resetSettings, exportUserData, pauseApplication, cancelApplication, changeFundingType } = useUserSettings();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportData = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      await exportUserData();
      setMessage({ type: 'success', text: 'Data exported successfully! Check your downloads.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseApplication = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      await pauseApplication();
      setMessage({ type: 'success', text: 'Application paused successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to pause application. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelApplication = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      await cancelApplication();
      setMessage({ type: 'success', text: 'Application cancelled successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to cancel application. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeFundingType = async (newType: FundingType) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      await changeFundingType(newType);
      setMessage({ type: 'success', text: `Funding type changed to ${newType} successfully.` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change funding type. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    resetSettings();
    setMessage({ type: 'success', text: 'Settings reset to default successfully.' });
  };

  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case "light": return <Sun className="w-4 h-4" />;
      case "dark": return <Moon className="w-4 h-4" />;
      case "system": return <Monitor className="w-4 h-4" />;
    }
  };

  const getTextSizeLabel = (size: TextSize) => {
    switch (size) {
      case "small": return "Small";
      case "medium": return "Medium";
      case "large": return "Large";
    }
  };

  const getLanguageLabel = (lang: Language) => {
    switch (lang) {
      case "en": return "English";
      case "sw": return "Swahili";
      case "fr": return "French";
      case "ar": return "Arabic";
    }
  };

  const getFundingTypeLabel = (type: FundingType) => {
    switch (type) {
      case "grant": return "Grant";
      case "loan": return "Loan";
      case "investment": return "Investment";
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={`${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Customize your visual experience and interface settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Theme Toggle */}
            <div>
              <Label htmlFor="theme" className="flex items-center gap-2 mb-2">
                {getThemeIcon(settings.theme)}
                Theme
              </Label>
              <Select 
                value={settings.theme} 
                onValueChange={(value: Theme) => updateSettings({ theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text Size */}
            <div>
              <Label htmlFor="textSize" className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4" />
                Text Size
              </Label>
              <Select 
                value={settings.textSize} 
                onValueChange={(value: TextSize) => updateSettings({ textSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div>
              <Label htmlFor="language" className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4" />
                Language
              </Label>
              <Select 
                value={settings.language} 
                onValueChange={(value: Language) => updateSettings({ language: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Swahili</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibility
          </CardTitle>
          <CardDescription>
            Customize accessibility features for better user experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-assistant" className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Voice Assistant
                </Label>
                <Switch
                  id="voice-assistant"
                  checked={settings.voiceAssistant}
                  onCheckedChange={(checked) => updateSettings({ voiceAssistant: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  High Contrast
                </Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSettings({ highContrast: checked })}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4" />
                  Reduced Motion
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSettings({ reducedMotion: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export your data and manage application information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="export-format">Export Format</Label>
              <Select 
                value={settings.dataExportFormat} 
                onValueChange={(value: "pdf" | "csv") => updateSettings({ dataExportFormat: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleExportData} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exporting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download My Data
                  </div>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Reset Settings</p>
              <p className="text-sm text-gray-600">Clear all preferences and restore defaults</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Settings</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all your settings to default values. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetSettings}>
                    Reset Settings
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will affect your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Application Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Application Status</p>
                <p className="text-sm text-gray-600">
                  {settings.applicationStatus ? 
                    `Status: ${settings.applicationStatus.charAt(0).toUpperCase() + settings.applicationStatus.slice(1)}` : 
                    "No active application"
                  }
                </p>
                <p className="text-sm text-gray-600">
                  Funding Type: {getFundingTypeLabel(settings.fundingType)}
                </p>
              </div>
              <Badge variant={settings.applicationStatus === "approved" ? "default" : 
                           settings.applicationStatus === "rejected" ? "destructive" : 
                           "secondary"}>
                {settings.applicationStatus || "None"}
              </Badge>
            </div>
          </div>

          {/* Application Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium">Pause Application</p>
                <p className="text-sm text-gray-600">Temporarily pause your application process</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Pause Application</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will pause your application. You can resume it later from your dashboard.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePauseApplication}>
                      Pause Application
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium">Cancel Application</p>
                <p className="text-sm text-gray-600">Permanently cancel your application</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isLoading}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Application</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Your application will be permanently cancelled.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Application</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelApplication} className="bg-red-600 hover:bg-red-700">
                      Cancel Application
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Change Funding Type</p>
                <p className="text-sm text-gray-600">Switch between grant, loan, or investment</p>
              </div>
              <Select 
                value={settings.fundingType} 
                onValueChange={(value: FundingType) => handleChangeFundingType(value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grant">Grant</SelectItem>
                  <SelectItem value="loan">Loan</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 