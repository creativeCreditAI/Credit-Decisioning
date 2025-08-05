import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { AdminPreferences, AdminUser, AuditLog } from "@/context/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Settings,
  Monitor,
  Bell,
  Shield,
  Users,
  Database,
  AlertTriangle,
  Download,
  Eye,
  Moon,
  Sun,
  Globe,
  Layout,
  Mail,
  MessageSquare,
  Smartphone,
  FileText,
  UserPlus,
  UserMinus,
  Activity,
  Lock,
  Timer,
  Wifi,
  Trash2,
  RotateCcw,
  Pause,
  X,
  BarChart3
} from "lucide-react";

interface AdminSettingsProps {
  language: "en" | "sw";
  preferences: AdminPreferences;
  onUpdatePreferences: (newPreferences: Partial<AdminPreferences>) => Promise<void>;
  canModifySettings: boolean;
  onPauseSubmissions: (reason: string) => Promise<void>;
  onResetSettings: () => Promise<void>;
  onDeleteAccount: (adminId: string) => Promise<void>;
  adminUser: AdminUser | null;
  auditLogs: AuditLog[];
  loading: boolean;
}

interface SettingsState {
  interface: {
    theme: "light" | "dark";
    textSize: "small" | "medium" | "large";
    language: "en" | "sw";
    layout: "compact" | "expanded";
  };
  notifications: {
    email: boolean;
    newApplications: boolean;
    highRiskFlags: boolean;
    documentsUploaded: boolean;
    reportFrequency: "daily" | "weekly";
  };
  security: {
    twoFactorAuth: boolean;
    autoLogout: "15" | "30" | "60" | "120";
    ipWhitelisting: string;
  };
  data: {
    anonymizeSensitiveData: boolean;
    retentionPeriod: "3months" | "1year" | "permanent";
  };
  assessmentTools: {
    financialVsFaceValueWeight: number;
    enableFaceValueReview: boolean;
    enableAdminReview: boolean;
  };
}

export const AdminSettings = ({ 
  language, 
  preferences, 
  onUpdatePreferences, 
  canModifySettings, 
  onPauseSubmissions, 
  onResetSettings, 
  onDeleteAccount, 
  adminUser, 
  auditLogs, 
  loading 
}: AdminSettingsProps) => {
  const canAccessDangerZone = adminUser?.permissions?.canAccessDangerZone || false;
  const [showDangerZoneConfirm, setShowDangerZoneConfirm] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("");
  const [pauseReason, setPauseReason] = useState("");
  const [settings, setSettings] = useState<SettingsState>({
    interface: {
      theme: preferences.theme,
      textSize: preferences.textSize,
      language: preferences.language,
      layout: preferences.layout
    },
    notifications: {
      email: preferences.notifications.email,
      newApplications: preferences.notifications.newApplications,
      highRiskFlags: preferences.notifications.highRiskAlerts,
      documentsUploaded: preferences.notifications.documentsUploaded,
      reportFrequency: preferences.notifications.reportFrequency
    },
    security: {
      twoFactorAuth: preferences.security.twoFactorAuth,
      autoLogout: preferences.security.autoLogoutDuration.toString() as "15" | "30" | "60" | "120",
      ipWhitelisting: preferences.security.ipWhitelist.join(", ")
    },
    data: {
      anonymizeSensitiveData: false,
      retentionPeriod: "1year"
    },
    assessmentTools: {
      financialVsFaceValueWeight: preferences.assessmentTools.financialScoreWeight,
      enableFaceValueReview: preferences.assessmentTools.showFaceValue,
      enableAdminReview: preferences.assessmentTools.showAdminReview
    }
  });

  // Handler functions
  const handlePreferenceChange = async (key: keyof AdminPreferences, value: any) => {
    try {
      await onUpdatePreferences({ [key]: value });
    } catch (error) {
      console.error("Failed to update preference:", error);
    }
  };

  const handleNestedPreferenceChange = async (section: keyof AdminPreferences, key: string, value: any) => {
    try {
      const sectionPrefs = preferences[section] as any;
      const newSectionPrefs = {
        ...sectionPrefs,
        [key]: value
      };
      await onUpdatePreferences({ [section]: newSectionPrefs });
    } catch (error) {
      console.error("Failed to update nested preference:", error);
    }
  };

  const updateSetting = (section: keyof SettingsState, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleDangerZoneAction = async (action: string) => {
    try {
      switch (action) {
        case "pause_submissions":
          if (pauseReason.trim()) {
            await onPauseSubmissions(pauseReason);
            setPauseReason("");
          }
          break;
        case "reset_settings":
          await onResetSettings();
          break;
        case "delete_account":
          if (adminUser?.id) {
            await onDeleteAccount(adminUser.id);
          }
          break;
      }
      setShowDangerZoneConfirm(null);
    } catch (error) {
      console.error("Danger zone action failed:", error);
    }
  };

  const downloadData = (format: "csv" | "pdf") => {
    console.log(`Downloading data in ${format} format`);
    // Placeholder for download logic
  };

  const addNewAdmin = () => {
    if (newAdminEmail && newAdminRole) {
      console.log("Adding new admin:", { email: newAdminEmail, role: newAdminRole });
      setNewAdminEmail("");
      setNewAdminRole("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === "en" ? "Admin Settings" : "Mipangilio ya Msimamizi"}
          </h1>
          <p className="text-gray-600 mt-2">
            {language === "en" 
              ? "Configure dashboard preferences and system settings" 
              : "Sanidi mapendeleo ya dashibodi na mipangilio ya mfumo"
            }
          </p>
        </div>
        <Button onClick={() => console.log("Settings auto-saved")} disabled={!canModifySettings}>
          <Settings className="w-4 h-4 mr-2" />
          {language === "en" ? "Auto-Saved" : "Imehifadhiwa Otomatiki"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interface Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              {language === "en" ? "Interface Preferences" : "Mapendeleo ya Kiolesura"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preferences.theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <Label>{language === "en" ? "Dark Mode" : "Hali ya Giza"}</Label>
              </div>
              <Switch
                checked={preferences.theme === "dark"}
                onCheckedChange={(checked) => 
                  handlePreferenceChange("theme", checked ? "dark" : "light")
                }
                disabled={!canModifySettings}
              />
            </div>

            {/* Text Size */}
            <div className="space-y-2">
              <Label>{language === "en" ? "Text Size" : "Ukubwa wa Maandishi"}</Label>
              <Select
                value={preferences.textSize}
                onValueChange={(value) => handlePreferenceChange("textSize", value)}
                disabled={!canModifySettings}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{language === "en" ? "Small" : "Ndogo"}</SelectItem>
                  <SelectItem value="medium">{language === "en" ? "Medium" : "Wastani"}</SelectItem>
                  <SelectItem value="large">{language === "en" ? "Large" : "Kubwa"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {language === "en" ? "Language" : "Lugha"}
              </Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => handlePreferenceChange("language", value)}
                disabled={!canModifySettings}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sw">Kiswahili</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Layout */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                {language === "en" ? "Layout" : "Muundo"}
              </Label>
              <Select
                value={preferences.layout}
                onValueChange={(value) => handlePreferenceChange("layout", value)}
                disabled={!canModifySettings}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">{language === "en" ? "Compact" : "Fupi"}</SelectItem>
                  <SelectItem value="expanded">{language === "en" ? "Expanded" : "Kubwa"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {language === "en" ? "Notification Settings" : "Mipangilio ya Arifa"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Notification Channels */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {language === "en" ? "Notification Channels:" : "Njia za Arifa:"}
              </Label>
              
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                  <span className="text-sm">{language === "en" ? "Email Notifications" : "Arifa za Barua Pepe"}</span>
              </div>
              <Switch
                checked={preferences.notifications.email}
                onCheckedChange={(checked) => handleNestedPreferenceChange("notifications", "email", checked)}
                disabled={!canModifySettings}
              />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">{language === "en" ? "Slack Notifications" : "Arifa za Slack"}</span>
                </div>
                <Switch
                  checked={preferences.notifications.slack}
                  onCheckedChange={(checked) => handleNestedPreferenceChange("notifications", "slack", checked)}
                  disabled={!canModifySettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-sm">{language === "en" ? "SMS Notifications" : "Arifa za SMS"}</span>
                </div>
                <Switch
                  checked={preferences.notifications.sms}
                  onCheckedChange={(checked) => handleNestedPreferenceChange("notifications", "sms", checked)}
                  disabled={!canModifySettings}
                />
              </div>
            </div>

            <Separator />

            {/* Individual Alert Types */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {language === "en" ? "Enable Alerts For:" : "Ruhusu Arifa za:"}
              </Label>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{language === "en" ? "New Applications" : "Maombi Mapya"}</span>
                </div>
                <Switch
                  checked={preferences.notifications.newApplications}
                  onCheckedChange={(checked) => handleNestedPreferenceChange("notifications", "newApplications", checked)}
                  disabled={!canModifySettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{language === "en" ? "High-Risk Flags" : "Dalili za Hatari"}</span>
                </div>
                <Switch
                  checked={preferences.notifications.highRiskAlerts}
                  onCheckedChange={(checked) => handleNestedPreferenceChange("notifications", "highRiskAlerts", checked)}
                  disabled={!canModifySettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">{language === "en" ? "Documents Uploaded" : "Nyaraka Zimepakiwa"}</span>
                </div>
                <Switch
                  checked={preferences.notifications.documentsUploaded}
                  onCheckedChange={(checked) => handleNestedPreferenceChange("notifications", "documentsUploaded", checked)}
                  disabled={!canModifySettings}
                />
              </div>

              {/* Test Notification Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm">{language === "en" ? "Test Notifications" : "Jaribu Arifa"}</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    // Test notification functionality
                    console.log("Testing notifications...");
                    // In real implementation, this would trigger a test notification
                  }}
                  disabled={!canModifySettings}
                >
                  {language === "en" ? "Test" : "Jaribu"}
                </Button>
              </div>
            </div>

            {/* Report Frequency */}
            <div className="space-y-2">
              <Label>{language === "en" ? "Report Frequency" : "Mzunguko wa Ripoti"}</Label>
              <Select
                value={preferences.notifications.reportFrequency}
                onValueChange={(value) => handleNestedPreferenceChange("notifications", "reportFrequency", value)}
                disabled={!canModifySettings}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{language === "en" ? "Daily" : "Kila Siku"}</SelectItem>
                  <SelectItem value="weekly">{language === "en" ? "Weekly" : "Kila Wiki"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {language === "en" ? "Security Settings" : "Mipangilio ya Usalama"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <Label>{language === "en" ? "Two-Factor Authentication" : "Uthibitishaji wa Hatua Mbili"}</Label>
              </div>
              <Switch
                checked={preferences.security.twoFactorAuth}
                onCheckedChange={(checked) => handleNestedPreferenceChange("security", "twoFactorAuth", checked)}
                disabled={!canModifySettings}
              />
            </div>

            {/* Auto Logout */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                {language === "en" ? "Auto Logout Duration" : "Muda wa Kutoka Kiotomatiki"}
              </Label>
              <Select
                value={preferences.security.autoLogoutDuration.toString()}
                onValueChange={(value) => handleNestedPreferenceChange("security", "autoLogoutDuration", parseInt(value))}
                disabled={!canModifySettings}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 {language === "en" ? "minutes" : "dakika"}</SelectItem>
                  <SelectItem value="30">30 {language === "en" ? "minutes" : "dakika"}</SelectItem>
                  <SelectItem value="60">1 {language === "en" ? "hour" : "saa"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* IP Whitelisting */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                {language === "en" ? "IP Whitelisting" : "Orodha Nyeupe ya IP"}
              </Label>
              <Input
                placeholder={language === "en" ? "Enter IP addresses (comma separated)" : "Ingiza anwani za IP (zikitenganishwa na koma)"}
                value={preferences.security.ipWhitelist.join(", ")}
                onChange={(e) => handleNestedPreferenceChange("security", "ipWhitelist", e.target.value.split(",").map(ip => ip.trim()).filter(ip => ip))}
                disabled={!canModifySettings}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Permissions Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {language === "en" ? "User Permissions" : "Ruhusa za Watumiaji"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Admin */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                {language === "en" ? "Add New Admin" : "Ongeza Msimamizi Mpya"}
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder={language === "en" ? "Email address" : "Anwani ya barua pepe"}
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="flex-1"
                />
                <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="superadmin">Superadmin</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addNewAdmin} disabled={!newAdminEmail || !newAdminRole}>
                  {language === "en" ? "Add" : "Ongeza"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                {language === "en" ? "View Audit Logs" : "Tazama Rekodi za Ukaguzi"}
              </Button>
              <Button variant="outline" size="sm">
                <UserMinus className="w-4 h-4 mr-2" />
                {language === "en" ? "Manage Admins" : "Simamia Wasimamizi"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {language === "en" ? "Data Settings" : "Mipangilio ya Data"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Download Data */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {language === "en" ? "Download Application Data" : "Pakua Data ya Maombi"}
              </Label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => downloadData("csv")} className="flex-1">
                  CSV
                </Button>
                <Button variant="outline" onClick={() => downloadData("pdf")} className="flex-1">
                  PDF
                </Button>
              </div>
            </div>

            {/* Anonymize Data */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <Label>{language === "en" ? "Anonymize Sensitive Data" : "Ficha Data Nyeti"}</Label>
              </div>
              <Switch
                checked={settings.data.anonymizeSensitiveData}
                onCheckedChange={(checked) => updateSetting("data", "anonymizeSensitiveData", checked)}
              />
            </div>

            {/* Data Retention */}
            <div className="space-y-2">
              <Label>{language === "en" ? "Data Retention Period" : "Kipindi cha Kuhifadhi Data"}</Label>
              <Select
                value={settings.data.retentionPeriod}
                onValueChange={(value) => updateSetting("data", "retentionPeriod", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">3 {language === "en" ? "Months" : "Miezi"}</SelectItem>
                  <SelectItem value="1year">1 {language === "en" ? "Year" : "Mwaka"}</SelectItem>
                  <SelectItem value="permanent">{language === "en" ? "Permanent" : "Kudumu"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {language === "en" ? "Assessment Tools" : "Zana za Tathmini"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Financial vs Face Value Weight */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {language === "en" ? "Financial Score Weight" : "Uzito wa Alama za Kifedha"}
                </Label>
                <span className="text-sm font-medium">{settings.assessmentTools.financialVsFaceValueWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.assessmentTools.financialVsFaceValueWeight}
                onChange={(e) => updateSetting("assessmentTools", "financialVsFaceValueWeight", parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Face Value</span>
                <span>Financial Data</span>
              </div>
            </div>

            {/* Enable/Disable Assessment Sections */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{language === "en" ? "Enable Face Value Review" : "Wezesha Mapitio ya Thamani ya Uso"}</Label>
                <Switch
                  checked={settings.assessmentTools.enableFaceValueReview}
                  onCheckedChange={(checked) => updateSetting("assessmentTools", "enableFaceValueReview", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>{language === "en" ? "Enable Admin Review Section" : "Wezesha Sehemu ya Mapitio ya Msimamizi"}</Label>
                <Switch
                  checked={settings.assessmentTools.enableAdminReview}
                  onCheckedChange={(checked) => updateSetting("assessmentTools", "enableAdminReview", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {language === "en" ? "Danger Zone" : "Eneo la Hatari"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Pause Applications */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={!canAccessDangerZone}
                >
                  <Pause className="w-4 h-4 mr-2" />
                  {language === "en" ? "Pause Applications" : "Simamisha Maombi"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {language === "en" ? "Pause Application Submissions" : "Simamisha Maombi"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === "en" 
                      ? "This will temporarily stop new applications from being submitted. Please provide a reason:"
                      : "Hii itasimamisha maombi mapya kwa muda. Tafadhali toa sababu:"
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Textarea
                    placeholder={language === "en" ? "Reason for pausing submissions..." : "Sababu ya kusimamisha maombi..."}
                    value={pauseReason}
                    onChange={(e) => setPauseReason(e.target.value)}
                    rows={3}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>{language === "en" ? "Cancel" : "Ghairi"}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDangerZoneAction("pause_submissions")}
                    disabled={!pauseReason.trim()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {language === "en" ? "Pause Submissions" : "Simamisha Maombi"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Reset System Settings */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={!canAccessDangerZone}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {language === "en" ? "Reset System" : "Rejesha Mfumo"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {language === "en" ? "Reset System Settings" : "Rejesha Mipangilio ya Mfumo"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === "en" 
                      ? "This will reset all admin preferences to default values. This action cannot be undone."
                      : "Hii itarejesha mipangilio yote ya msimamizi kwa maadili ya kawaida. Kitendo hiki hakiwezi kutenduliwa."
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{language === "en" ? "Cancel" : "Ghairi"}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDangerZoneAction("reset_settings")}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {language === "en" ? "Reset Settings" : "Rejesha Mipangilio"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete Admin Account */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={!canAccessDangerZone}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === "en" ? "Delete Account" : "Futa Akaunti"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {language === "en" ? "Delete Admin Account" : "Futa Akaunti ya Msimamizi"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {language === "en" 
                      ? "This will permanently delete your admin account and you will be logged out immediately. This action cannot be undone."
                      : "Hii itafuta kabisa akaunti yako ya msimamizi na utaondolewa mara moja. Kitendo hiki hakiwezi kutenduliwa."
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{language === "en" ? "Cancel" : "Ghairi"}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDangerZoneAction("delete_account")}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {language === "en" ? "Delete Account" : "Futa Akaunti"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {language === "en" ? "Audit Logs" : "Rekodi za Ukaguzi"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-start justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={log.severity === 'critical' ? 'destructive' : log.severity === 'high' ? 'destructive' : 'secondary'}>
                      {log.severity}
                    </Badge>
                    <span className="text-sm font-medium">{log.action}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {log.adminName} • {log.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                {language === "en" ? "No audit logs available" : "Hakuna rekodi za ukaguzi"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;