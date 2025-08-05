import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminSettings from "@/components/AdminSettings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign,
  Activity,
  Eye,
  Filter,
  Download,
  Settings,
  BarChart3,
  PieChart,
  MapPin,
  MessageSquare,

  Share2,
  MessageCircle,
  Phone,

  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Database,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  Calendar,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface AdminDashboardProps {
  language: "en" | "sw";
  activeTab?: string;
  editMode?: boolean;
}

interface AdminProfile {
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: Date;
  isEditing: boolean;
}

interface Applicant {
  id: string;
  name: string;
  businessName: string;
  sector: string;
  score: number;
  tier: string;
  status: string;
  amount: number;
  submittedAt: Date;
  riskFlags: number;
  riskLevel: 'low' | 'medium' | 'high';
  documents: string[];
  faceValueOutput?: string;
  adminNotes?: string;
  notesVisible: boolean;
  chatbotMessages?: number;
  whatsappMessages?: number;
}

interface RiskAlert {
  id: string;
  userId: string;
  userName: string;
  businessName: string;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
  flaggedAt: Date;
  status: 'active' | 'resolved' | 'investigating';
}

interface FraudAlert {
  id: string;
  userId: string;
  userName: string;
  businessName: string;
  fraudType: 'duplicate' | 'fake_kra' | 'suspicious_receipt' | 'identity_theft';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  flaggedAt: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  evidence: string[];
}

interface ApplicantJourney {
  userId: string;
  userName: string;
  currentStep: 'registration' | 'profile_complete' | 'survey_complete' | 'documents_uploaded' | 'under_review' | 'approved' | 'funded';
  lastActivity: Date;
  timeInCurrentStep: number; // days
  nextStep: string;
  blockers: string[];
  engagementScore: number; // 0-100
}

interface SectorAnalytics {
  sector: string;
  applicationRate: number;
  approvalRate: number;
  defaultRate: number;
  avgProcessingTime: number;
  totalApplications: number;
  totalApproved: number;
  totalDefaults: number;
  avgScore: number;
  totalFunded: number;
}

export const AdminDashboard = ({ language, activeTab: propActiveTab = "overview", editMode = false }: AdminDashboardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    adminUser, 
    preferences, 
    auditLogs, 
    updatePreferences, 
    addAuditLog, 
    saveAssessment, 
    loadAssessment,
    sendNotification,
    pauseSubmissions,
    resetSystemSettings,
    deleteAdminAccount,
    loading: adminLoading,
    error: adminError 
  } = useAdmin();
  
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [activeTab, setActiveTab] = useState(propActiveTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Update activeTab when prop changes (for routing)
  useEffect(() => {
    setActiveTab(propActiveTab);
  }, [propActiveTab]);

  // Handle tab changes and navigate to correct routes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    
    // Navigate to the correct route based on tab
    switch (newTab) {
      case "overview":
        navigate("/admin/overview");
        break;
      case "applicants":
        navigate("/admin/applicants");
        break;
      case "analytics":
        navigate("/admin/analytics");
        break;
      case "alerts":
        navigate("/admin/risk-alerts");
        break;
      case "sectors":
        navigate("/admin/sectors");
        break;
      case "data-tools":
        navigate("/admin/data-reports");
        break;
      case "settings":
        navigate("/admin/settings");
        break;
      default:
        navigate("/admin/overview");
    }
  };

  // Role-based access control from context
  const userRole = adminUser?.role || "Viewer";
  const permissions = adminUser?.permissions || {
    canApprove: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canViewFraudAlerts: false,
    canAccessDangerZone: false,
    canModifySettings: false
  };
  const { canApprove, canViewAnalytics, canManageUsers, canViewFraudAlerts, canAccessDangerZone, canModifySettings } = permissions;

  // 🔌 Placeholder functions for backend calls
  const getUserData = async (userId: string) => {
    // 🔌 Placeholder for backend call
    console.log("Getting user data for:", userId);
    return {
      id: userId,
      name: "Grace Wanjiku",
      businessName: "Grace Designs",
      sector: "Fashion Design",
      score: 742,
      tier: "A",
      status: "approved",
      documents: ["ID", "Business Registration", "M-Pesa Statements", "Utility Bills"],
      applicationData: {
        profileCompletion: 95,
        financialHealth: 82,
        marketPresence: 88
      }
    };
  };

  const impersonateUser = async (userId: string) => {
    // 🔌 Placeholder for backend call
    console.log("Impersonating user:", userId);
    setIsImpersonating(true);
    // In real implementation, this would switch the admin to user view
    setTimeout(() => setIsImpersonating(false), 2000);
  };

  const downloadUserData = async (userId?: string) => {
    // 🔌 Placeholder for backend call
    console.log("Downloading user data:", userId || "all users");
    // Simulate download
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Download completed");
  };

  const shareDataWithinInstitution = async (userId: string) => {
    // 🔌 Placeholder for backend call
    console.log("Sharing data within institution for user:", userId);
    // Simulate sharing
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Data shared successfully");
  };

  // Enhanced mock data for admin dashboard
  const dashboardStats = {
    totalApplications: 147,
    approvedApplications: 89,
    pendingReview: 23,
    totalFunded: 1250000,
    averageScore: 678,
    riskAlerts: 8,
    approvalRate: 60.5,
    totalApplicants: 147,
    totalFundsDisbursed: 1250000,
    sectorDistribution: [
      { sector: "Fashion Design", count: 45, avgScore: 725, fundedAmount: 450000 },
      { sector: "Digital Media", count: 32, avgScore: 698, fundedAmount: 320000 },
      { sector: "Music Production", count: 28, avgScore: 652, fundedAmount: 280000 },
      { sector: "Visual Arts", count: 25, avgScore: 643, fundedAmount: 125000 },
      { sector: "Film & Video", count: 17, avgScore: 689, fundedAmount: 75000 },
      { sector: "Animation & Motion Graphics", count: 23, avgScore: 712, fundedAmount: 185000 },
      { sector: "Photography", count: 19, avgScore: 668, fundedAmount: 95000 },
      { sector: "Gaming & Esports", count: 15, avgScore: 701, fundedAmount: 120000 },
      { sector: "Content Creation", count: 21, avgScore: 685, fundedAmount: 147000 },
      { sector: "Digital Product Design", count: 18, avgScore: 734, fundedAmount: 162000 },
      { sector: "Podcasting & Radio Production", count: 12, avgScore: 656, fundedAmount: 84000 },
      { sector: "Artisan & Traditional Crafts", count: 16, avgScore: 671, fundedAmount: 98000 },
      { sector: "Cultural Tourism", count: 14, avgScore: 692, fundedAmount: 105000 },
      { sector: "Comic & Book Publishing", count: 11, avgScore: 647, fundedAmount: 77000 }
    ]
  };

  const applicants: Applicant[] = [
      {
        id: "APP-2024-001",
      name: "Grace Wanjiku",
        businessName: "Grace Designs",
        sector: "Fashion Design",
        score: 742,
        tier: "A",
        status: "approved",
        amount: 150000,
        submittedAt: new Date("2024-01-15"),
      riskFlags: 0,
      riskLevel: 'low',
      documents: ["ID", "Business Registration", "M-Pesa Statements", "Utility Bills"],
      faceValueOutput: "Strong business model with consistent revenue growth. Excellent credit history and market presence.",
      adminNotes: "Approved based on strong financials and market position.",
      notesVisible: true,
      chatbotMessages: 12,
      whatsappMessages: 8
      },
      {
        id: "APP-2024-002", 
      name: "James Mwenda",
        businessName: "Nairobi Beats",
        sector: "Music Production",
        score: 658,
        tier: "B",
        status: "pending",
        amount: 75000,
        submittedAt: new Date("2024-01-14"),
      riskFlags: 2,
      riskLevel: 'medium',
      documents: ["ID", "Business Registration", "Bank Statements"],
      faceValueOutput: "Promising business but needs additional documentation for verification.",
      adminNotes: "Pending additional financial documents.",
      notesVisible: false,
      chatbotMessages: 5,
      whatsappMessages: 3
      },
      {
        id: "APP-2024-003",
      name: "Sarah Kimani",
        businessName: "Digital Stories KE",
        sector: "Digital Media",
        score: 695,
        tier: "B",
        status: "conditional",
        amount: 100000,
        submittedAt: new Date("2024-01-13"),
      riskFlags: 1,
      riskLevel: 'medium',
      documents: ["ID", "Business Registration", "M-Pesa Statements"],
      faceValueOutput: "Good potential but requires collateral for approval.",
      adminNotes: "Conditional approval with collateral requirement.",
      notesVisible: true,
      chatbotMessages: 8,
      whatsappMessages: 6
    },
    {
      id: "APP-2024-004",
      name: "Michael Karanja",
      businessName: "AnimateKE Studio",
      sector: "Animation & Motion Graphics",
      score: 712,
      tier: "A",
      status: "approved",
      amount: 200000,
      submittedAt: new Date("2024-01-12"),
      riskFlags: 0,
      riskLevel: 'low',
      documents: ["ID", "Business Registration", "Portfolio", "Bank Statements"],
      faceValueOutput: "Excellent portfolio showcasing high-quality animation work.",
      adminNotes: "Approved based on strong portfolio and client testimonials.",
      notesVisible: true,
      chatbotMessages: 15,
      whatsappMessages: 10
    },
    {
      id: "APP-2024-005",
      name: "Amina Hassan",
      businessName: "Voices of Kenya Podcast",
      sector: "Podcasting & Radio Production",
      score: 656,
      tier: "B",
      status: "pending",
      amount: 80000,
      submittedAt: new Date("2024-01-11"),
      riskFlags: 1,
      riskLevel: 'medium',
      documents: ["ID", "Business Registration", "M-Pesa Statements"],
      faceValueOutput: "Growing podcast with good listener engagement.",
      adminNotes: "Pending verification of listener analytics and revenue projections.",
      notesVisible: false,
      chatbotMessages: 7,
      whatsappMessages: 4
    },
    {
      id: "APP-2024-006",
      name: "David Mwangi",
      businessName: "Pixel Perfect Games",
      sector: "Gaming & Esports",
      score: 701,
      tier: "A",
      status: "approved",
      amount: 150000,
      submittedAt: new Date("2024-01-10"),
      riskFlags: 0,
      riskLevel: 'low',
      documents: ["ID", "Business Registration", "Game Portfolio", "Revenue Reports"],
      faceValueOutput: "Innovative mobile game developer with successful titles.",
      adminNotes: "Approved for game development and esports tournament funding.",
      notesVisible: true,
      chatbotMessages: 11,
      whatsappMessages: 7
    }
  ];

  const riskAlerts: RiskAlert[] = [
    {
      id: "RISK-001",
      userId: "APP-2024-002",
      userName: "James Mwenda",
      businessName: "Nairobi Beats",
      riskLevel: 'medium',
      reason: "Multiple applications detected",
      flaggedAt: new Date("2024-01-14"),
      status: 'investigating'
    },
    {
      id: "RISK-002",
      userId: "APP-2024-004",
      userName: "John Doe",
      businessName: "Tech Solutions",
      riskLevel: 'high',
      reason: "Suspicious financial patterns",
      flaggedAt: new Date("2024-01-13"),
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "secondary";
      case "conditional":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "A":
        return "bg-success text-success-foreground";
      case "B":
        return "bg-info text-info-foreground";
      case "C":
        return "bg-warning text-warning-foreground";
      case "D":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-success text-success-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleApplicantClick = (applicant: Applicant) => {
    navigate(`/admin/applicant/${applicant.id}`);
  };



  const handleDownloadData = async (userId?: string, format: 'csv' | 'json' = 'csv') => {
    // 🔌 Placeholder for backend call
    console.log(`Downloading ${format.toUpperCase()} data for:`, userId || "all users");
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Download completed");
  };

  const handleShareWithHeva = async (userId: string) => {
    // 🔌 Placeholder for backend call
    console.log("Sharing data with HEVA systems for user:", userId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Data shared successfully");
  };

  const handleViewChatbotMessages = (userId: string) => {
    // 🔌 Placeholder for backend call
    console.log("Viewing chatbot messages for user:", userId);
  };

  const handleViewWhatsAppMessages = (userId: string) => {
    // 🔌 Placeholder for backend call
    console.log("Viewing WhatsApp messages for user:", userId);
  };

  // Mock data for new features
  const fraudAlerts: FraudAlert[] = [
    {
      id: "FRAUD-001",
      userId: "APP-2024-002",
      userName: "James Mwenda",
      businessName: "Mwenda Productions",
      fraudType: "duplicate",
      severity: "high",
      description: "Multiple applications detected with similar business details",
      flaggedAt: new Date("2024-01-15"),
      status: "active",
      evidence: ["Duplicate business registration", "Similar phone numbers", "Identical business description"]
    },
    {
      id: "FRAUD-002",
      userId: "APP-2024-007",
      userName: "Sarah Kimani",
      businessName: "Kimani Photography",
      fraudType: "fake_kra",
      severity: "critical",
      description: "Invalid KRA PIN detected during verification",
      flaggedAt: new Date("2024-01-14"),
      status: "investigating",
      evidence: ["Invalid KRA PIN format", "No matching business records", "Suspicious registration date"]
    },
    {
      id: "FRAUD-003",
      userId: "APP-2024-008",
      userName: "Peter Otieno",
      businessName: "Otieno Digital",
      fraudType: "suspicious_receipt",
      severity: "medium",
      description: "Receipts show inconsistent revenue patterns",
      flaggedAt: new Date("2024-01-13"),
      status: "active",
      evidence: ["Inconsistent transaction dates", "Unusual revenue spikes", "Missing supporting documents"]
    }
  ];

  const applicantJourneys: ApplicantJourney[] = [
    {
      userId: "APP-2024-001",
      userName: "Grace Wanjiku",
      currentStep: "approved",
      lastActivity: new Date("2024-01-15"),
      timeInCurrentStep: 2,
      nextStep: "Fund disbursement",
      blockers: [],
      engagementScore: 95
    },
    {
      userId: "APP-2024-002",
      userName: "James Mwenda",
      currentStep: "under_review",
      lastActivity: new Date("2024-01-14"),
      timeInCurrentStep: 5,
      nextStep: "Document verification",
      blockers: ["Pending KRA verification", "Missing bank statements"],
      engagementScore: 78
    },
    {
      userId: "APP-2024-003",
      userName: "Mary Njeri",
      currentStep: "documents_uploaded",
      lastActivity: new Date("2024-01-12"),
      timeInCurrentStep: 8,
      nextStep: "Review process",
      blockers: ["Awaiting admin review"],
      engagementScore: 82
    },
    {
      userId: "APP-2024-009",
      userName: "John Kamau",
      currentStep: "survey_complete",
      lastActivity: new Date("2024-01-10"),
      timeInCurrentStep: 12,
      nextStep: "Document upload",
      blockers: ["User needs guidance on document requirements"],
      engagementScore: 45
    },
    {
      userId: "APP-2024-010",
      userName: "Alice Wambui",
      currentStep: "profile_complete",
      lastActivity: new Date("2024-01-08"),
      timeInCurrentStep: 15,
      nextStep: "Complete survey",
      blockers: ["User hasn't logged in for 7 days"],
      engagementScore: 30
    }
  ];

  const sectorAnalytics: SectorAnalytics[] = [
    {
      sector: "Fashion Design",
      applicationRate: 15.2,
      approvalRate: 68.5,
      defaultRate: 2.1,
      avgProcessingTime: 4.2,
      totalApplications: 45,
      totalApproved: 31,
      totalDefaults: 1,
      avgScore: 725,
      totalFunded: 450000
    },
    {
      sector: "Digital Media",
      applicationRate: 12.8,
      approvalRate: 71.2,
      defaultRate: 1.8,
      avgProcessingTime: 3.8,
      totalApplications: 32,
      totalApproved: 23,
      totalDefaults: 0,
      avgScore: 698,
      totalFunded: 320000
    },
    {
      sector: "Animation & Motion Graphics",
      applicationRate: 8.5,
      approvalRate: 75.0,
      defaultRate: 1.2,
      avgProcessingTime: 5.1,
      totalApplications: 23,
      totalApproved: 17,
      totalDefaults: 0,
      avgScore: 712,
      totalFunded: 185000
    },
    {
      sector: "Gaming & Esports",
      applicationRate: 6.2,
      approvalRate: 66.7,
      defaultRate: 3.3,
      avgProcessingTime: 4.8,
      totalApplications: 15,
      totalApproved: 10,
      totalDefaults: 1,
      avgScore: 701,
      totalFunded: 120000
    },
    {
      sector: "Content Creation",
      applicationRate: 9.1,
      approvalRate: 72.4,
      defaultRate: 1.9,
      avgProcessingTime: 3.5,
      totalApplications: 21,
      totalApproved: 15,
      totalDefaults: 0,
      avgScore: 685,
      totalFunded: 147000
    }
  ];

  const filteredApplicants = applicants.filter(applicant => 
    applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    applicant.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    applicant.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFraudTypeColor = (type: string) => {
    switch (type) {
      case "duplicate":
        return "bg-orange-100 text-orange-800";
      case "fake_kra":
        return "bg-red-100 text-red-800";
      case "suspicious_receipt":
        return "bg-yellow-100 text-yellow-800";
      case "identity_theft":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getJourneyStepColor = (step: string) => {
    switch (step) {
      case "funded":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "documents_uploaded":
        return "bg-purple-100 text-purple-800";
      case "survey_complete":
        return "bg-indigo-100 text-indigo-800";
      case "profile_complete":
        return "bg-gray-100 text-gray-800";
      case "registration":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">



      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "en" ? "Total Applications" : "Maombi Yote"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              {language === "en" ? "+12% from last month" : "+12% kutoka mwezi uliopita"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "en" ? "Approval Rate" : "Kiwango cha Idhini"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((dashboardStats.approvedApplications / dashboardStats.totalApplications) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "en" ? "89 approved applications" : "Maombi 89 yameidhinishwa"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "en" ? "Total Funded" : "Jumla ya Ufadhili"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {(dashboardStats.totalFunded / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "en" ? "Across all sectors" : "Katika sekta zote"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "en" ? "Risk Alerts" : "Tahadhari za Hatari"}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{dashboardStats.riskAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {language === "en" ? "Require attention" : "Zinahitaji umakini"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === "en" ? "Fraud Alerts" : "Tahadhari za Ulaghai"}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{fraudAlerts.filter(a => a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {language === "en" ? "Active alerts" : "Tahadhari za kazi"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {language === "en" ? "Role:" : "Jukumu:"} {userRole}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {language === "en" ? "Department:" : "Idara:"} {adminUser?.department || "Not Set"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={canApprove ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"}>
              {canApprove ? (language === "en" ? "Can Approve" : "Anaweza Kuidhinisha") : (language === "en" ? "View Only" : "Tazama Tu")}
            </Badge>
            {canManageUsers && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {language === "en" ? "User Management" : "Usimamizi wa Watumiaji"}
              </Badge>
            )}
          </div>
        </div>
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="overview">
            {language === "en" ? "Overview" : "Muhtasari"}
          </TabsTrigger>
          <TabsTrigger value="applicants">
            {language === "en" ? "Applicants" : "Waombaji"}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            {language === "en" ? "Analytics" : "Uchambuzi"}
          </TabsTrigger>
          <TabsTrigger value="sectors">
            {language === "en" ? "Sectors" : "Sekta"}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            {language === "en" ? "Risk Alerts" : "Tahadhari"}
          </TabsTrigger>
          <TabsTrigger value="fraud" className={!canViewFraudAlerts ? "opacity-50" : ""}>
            {language === "en" ? "Fraud" : "Ulaghai"}
          </TabsTrigger>
          <TabsTrigger value="journey">
            {language === "en" ? "Journey" : "Safari"}
          </TabsTrigger>
          <TabsTrigger value="sector-analytics" className={!canViewAnalytics ? "opacity-50" : ""}>
            {language === "en" ? "Sector Analytics" : "Uchambuzi wa Sekta"}
          </TabsTrigger>
          <TabsTrigger value="data-tools">
            {language === "en" ? "Data Tools" : "Zana za Data"}
          </TabsTrigger>
          <TabsTrigger value="chatbot">
            {language === "en" ? "Chatbot" : "Mazungumzo"}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {language === "en" ? "Settings" : "Mipangilio"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {language === "en" ? "Platform Usage Statistics" : "Takwimu za Matumizi ya Jukwaa"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{language === "en" ? "Survey Completion Rate" : "Kiwango cha Kukamilisha Uchunguzi"}</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{language === "en" ? "Document Upload Success" : "Mafanikio ya Kupakia Nyaraka"}</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{language === "en" ? "Account Linking Rate" : "Kiwango cha Kuunganisha Akaunti"}</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {language === "en" ? "Recent Applicants" : "Waombaji wa Hivi Karibuni"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applicants.slice(0, 3).map((applicant) => (
                    <div key={applicant.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleApplicantClick(applicant)}>
                      <div>
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-sm text-muted-foreground">{applicant.businessName}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getTierColor(applicant.tier)}`}>
                          {applicant.tier}
                        </Badge>
                        <Badge variant={getStatusColor(applicant.status) as "success" | "secondary" | "warning" | "destructive" | "outline"}>
                          {applicant.status}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/applicant/${applicant.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("applicants")}>
                    {language === "en" ? "View All Applicants" : "Tazama Waombaji Wote"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applicants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {language === "en" ? "All Applicants" : "Waombaji Wote"}
              </CardTitle>
                    <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder={language === "en" ? "Search applicants..." : "Tafuta waombaji..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={language === "en" ? "Filter by sector" : "Chuja kwa sekta"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === "en" ? "All Sectors" : "Sekta Zote"}</SelectItem>
                    <SelectItem value="Fashion Design">{language === "en" ? "Fashion Design" : "Muundo wa Nguo"}</SelectItem>
                    <SelectItem value="Digital Media">{language === "en" ? "Digital Media" : "Media ya Kidijitali"}</SelectItem>
                    <SelectItem value="Music Production">{language === "en" ? "Music Production" : "Uzalishaji wa Muziki"}</SelectItem>
                    <SelectItem value="Visual Arts">{language === "en" ? "Visual Arts" : "Sanaa za Kuona"}</SelectItem>
                    <SelectItem value="Film & Video">{language === "en" ? "Film & Video" : "Filamu na Video"}</SelectItem>
                    <SelectItem value="Animation & Motion Graphics">{language === "en" ? "Animation & Motion Graphics" : "Uhuishaji na Michoro ya Mwendo"}</SelectItem>
                    <SelectItem value="Podcasting & Radio Production">{language === "en" ? "Podcasting & Radio Production" : "Uzalishaji wa Podikasti na Redio"}</SelectItem>
                    <SelectItem value="Photography">{language === "en" ? "Photography" : "Upigaji Picha"}</SelectItem>
                    <SelectItem value="Comic & Book Publishing">{language === "en" ? "Comic & Book Publishing" : "Uchapishaji wa Vitabu na Katuni"}</SelectItem>
                    <SelectItem value="Gaming & Esports">{language === "en" ? "Gaming & Esports" : "Michezo na Esports"}</SelectItem>
                    <SelectItem value="Digital Product Design">{language === "en" ? "Digital Product Design" : "Ubunifu wa Bidhaa za Kidijitali"}</SelectItem>
                    <SelectItem value="Artisan & Traditional Crafts">{language === "en" ? "Artisan & Traditional Crafts" : "Ufundi wa Jadi na wa Kisasa"}</SelectItem>
                    <SelectItem value="Cultural Tourism">{language === "en" ? "Cultural Tourism" : "Utalii wa Kitamaduni"}</SelectItem>
                    <SelectItem value="Content Creation">{language === "en" ? "Content Creation" : "Uundaji wa Maudhui"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredApplicants.map((applicant) => (
                  <div key={applicant.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => handleApplicantClick(applicant)}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {applicant.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-sm text-muted-foreground">{applicant.businessName}</div>
                        <div className="text-xs text-muted-foreground">{applicant.id}</div>
                      </div>
                      <div className="text-center">
                        <Badge className={`${getTierColor(applicant.tier)}`}>
                          {language === "en" ? `Tier ${applicant.tier}` : `Kiwango ${applicant.tier}`}
                        </Badge>
                        <div className="text-sm font-medium mt-1">{applicant.score}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">KES {applicant.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{applicant.sector}</div>
                      </div>
                      
                      <Badge variant={getStatusColor(applicant.status) as "success" | "secondary" | "warning" | "destructive" | "outline"}>
                        {applicant.status}
                      </Badge>
                      
                      <Badge className={getRiskLevelColor(applicant.riskLevel)}>
                        {applicant.riskLevel} risk
                      </Badge>
                      
                      {applicant.riskFlags > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {applicant.riskFlags} {language === "en" ? "flags" : "dalili"}
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                          <MessageCircle className="w-4 h-4" />
                          <span className="ml-1 text-xs">{applicant.chatbotMessages}</span>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Phone className="w-4 h-4" />
                          <span className="ml-1 text-xs">{applicant.whatsappMessages}</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/applicant/${applicant.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                      </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {language === "en" ? "Score Distribution" : "Usambazaji wa Alama"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">800+ (Excellent)</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">650-799 (Prime)</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">500-649 (Near Prime)</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Below 500 (Subprime)</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  {language === "en" ? "Application Status" : "Hali ya Maombi"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Approved</span>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Review</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conditional</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <Progress value={10} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rejected</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {language === "en" ? "Sector Performance" : "Utendaji wa Sekta"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats.sectorDistribution.map((sector, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{sector.sector}</h4>
                      <Badge variant="outline">{sector.count} applications</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Avg Score</div>
                        <div className="font-medium">{sector.avgScore}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Funded</div>
                        <div className="font-medium">KES {(sector.fundedAmount / 1000).toFixed(0)}K</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Success Rate</div>
                        <div className="font-medium">
                          {Math.round((sector.count * 0.7 / sector.count) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {language === "en" ? "Risk Alerts & Monitoring" : "Tahadhari za Hatari na Ufuatiliaji"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {riskAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 border rounded-lg ${
                    alert.riskLevel === 'high' ? 'border-destructive/20 bg-destructive/5' :
                    alert.riskLevel === 'medium' ? 'border-warning/20 bg-warning/5' :
                    'border-info/20 bg-info/5'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          alert.riskLevel === 'high' ? 'text-destructive' :
                          alert.riskLevel === 'medium' ? 'text-warning' :
                          'text-info'
                        }`} />
                        <span className={`font-medium ${
                          alert.riskLevel === 'high' ? 'text-destructive' :
                          alert.riskLevel === 'medium' ? 'text-warning' :
                          'text-info'
                        }`}>
                          {alert.riskLevel.charAt(0).toUpperCase() + alert.riskLevel.slice(1)} Risk Alert
                        </span>
                        <Badge className={getRiskLevelColor(alert.riskLevel)}>
                          {alert.status}
                        </Badge>
                  </div>
                      <div className="text-xs text-muted-foreground">
                        {alert.flaggedAt.toLocaleDateString()}
                  </div>
                </div>
                    <div className="mb-2">
                      <div className="font-medium">{alert.userName}</div>
                      <div className="text-sm text-muted-foreground">{alert.businessName}</div>
                  </div>
                    <p className="text-sm mb-3">
                      {alert.reason}
                  </p>
                    <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        {language === "en" ? "Investigate" : "Chunguza"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/applicant/${alert.userId}`)}
                    >
                        {language === "en" ? "View Profile" : "Tazama Wasifu"}
                    </Button>
                      {alert.status === 'active' && (
                        <Button variant="outline" size="sm">
                          {language === "en" ? "Resolve" : "Suluhisha"}
                        </Button>
                      )}
                  </div>
                </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-tools" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Download & Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  {language === "en" ? "Data Download & Export" : "Pakua na Hamisha Data"}
              </CardTitle>
            </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>{language === "en" ? "Download Single User" : "Pakua Mtumiaji Mmoja"}</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                          placeholder={language === "en" ? "Enter User ID" : "Ingiza ID ya Mtumiaji"}
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                        />
                        <Button 
                          size="sm" 
                        onClick={() => handleDownloadData(selectedUserId, 'csv')}
                          disabled={!selectedUserId}
                        >
                        CSV
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadData(selectedUserId, 'json')}
                        disabled={!selectedUserId}
                      >
                        JSON
                        </Button>
                      </div>
                    </div>

                  <div>
                    <Label>{language === "en" ? "Download All Users" : "Pakua Waombaji Wote"}</Label>
                    <div className="flex gap-2 mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleDownloadData(undefined, 'csv')}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {language === "en" ? "All Users CSV" : "Waombaji Wote CSV"}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadData(undefined, 'json')}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {language === "en" ? "All Users JSON" : "Waombaji Wote JSON"}
                      </Button>
                      </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* HEVA Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  {language === "en" ? "HEVA Systems Integration" : "Muunganisho wa Mifumo ya HEVA"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>{language === "en" ? "Share User Data with HEVA" : "Shiriki Data ya Mtumiaji na HEVA"}</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                          placeholder={language === "en" ? "Enter User ID" : "Ingiza ID ya Mtumiaji"}
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                        />
                        <Button 
                          size="sm" 
                        onClick={() => handleShareWithHeva(selectedUserId)}
                        disabled={!selectedUserId}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        {language === "en" ? "Share" : "Shiriki"}
                        </Button>
                      </div>
                    </div>
                  
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{language === "en" ? "Role-based Permissions" : "Ruhusa za Kulingana na Jukumu"}</span>
                  </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "en" 
                        ? "Only authorized admins can share data with HEVA systems"
                        : "Wasimamizi walioidhinishwa tu wanaweza kushiriki data na mifumo ya HEVA"
                      }
                    </p>
                </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fraud" className="space-y-4">
          {!canViewFraudAlerts ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "en" ? "Access Restricted" : "Ufikiaji Umepunguzwa"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "en" 
                    ? "You don't have permission to view fraud alerts. Contact your administrator."
                    : "Huna ruhusa ya kutazama tahadhari za ulaghai. Wasiliana na msimamizi wako."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    {language === "en" ? "Fraud Detection Alerts" : "Tahadhari za Ugunduzi wa Ulaghai"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fraudAlerts.map((alert) => (
                      <div key={alert.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getFraudTypeColor(alert.fraudType)}>
                                {alert.fraudType.replace('_', ' ').toUpperCase()}
                              </Badge>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <h4 className="font-semibold">{alert.userName}</h4>
                            <p className="text-sm text-muted-foreground">{alert.businessName}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                              {alert.flaggedAt.toLocaleDateString()}
                            </div>
                            <Badge variant="outline" className="mt-1">
                              {alert.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm mb-3">{alert.description}</p>
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">
                            {language === "en" ? "Evidence:" : "Ushahidi:"}
                          </h5>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {alert.evidence.map((item, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline">
                            {language === "en" ? "Investigate" : "Chunguza"}
                          </Button>
                          <Button size="sm" variant="outline">
                            {language === "en" ? "Mark as False Positive" : "Weka kama Uongo"}
                          </Button>
                          <Button size="sm" variant="outline">
                            {language === "en" ? "View Profile" : "Tazama Wasifu"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {language === "en" ? "Applicant Journey Tracker" : "Kifuatilia Safari ya Mwombaji"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicantJourneys.map((journey) => (
                  <div key={journey.userId} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{journey.userName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getJourneyStepColor(journey.currentStep)}>
                            {journey.currentStep.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {journey.timeInCurrentStep} days
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {journey.lastActivity.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${journey.engagementScore}%` }}
                            ></div>
                          </div>
                          <span className="text-xs">{journey.engagementScore}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">
                          {language === "en" ? "Next Step:" : "Hatua Inayofuata:"}
                        </span> {journey.nextStep}
                      </p>
                      {journey.blockers.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-600">
                            {language === "en" ? "Blockers:" : "Vizuizi:"}
                          </p>
                          <ul className="text-sm text-red-600 space-y-1">
                            {journey.blockers.map((blocker, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                                {blocker}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        {language === "en" ? "Send Reminder" : "Tuma Kumbusho"}
                      </Button>
                      <Button size="sm" variant="outline">
                        {language === "en" ? "View Profile" : "Tazama Wasifu"}
                      </Button>
                      <Button size="sm" variant="outline">
                        {language === "en" ? "Contact" : "Wasiliana"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sector-analytics" className="space-y-4">
          {!canViewAnalytics ? (
            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {language === "en" ? "Access Restricted" : "Ufikiaji Umepunguzwa"}
                </h3>
                <p className="text-muted-foreground">
                  {language === "en" 
                    ? "You don't have permission to view sector analytics. Contact your administrator."
                    : "Huna ruhusa ya kutazama uchambuzi wa sekta. Wasiliana na msimamizi wako."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      {language === "en" ? "Sector Performance Overview" : "Muhtasari wa Utendaji wa Sekta"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sectorAnalytics.map((sector) => (
                        <div key={sector.sector} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">{sector.sector}</h4>
                            <Badge variant="outline">
                              {sector.totalApplications} applications
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Application Rate</p>
                              <p className="font-semibold">{sector.applicationRate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Approval Rate</p>
                              <p className="font-semibold text-green-600">{sector.approvalRate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Default Rate</p>
                              <p className="font-semibold text-red-600">{sector.defaultRate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Avg Processing</p>
                              <p className="font-semibold">{sector.avgProcessingTime} days</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex justify-between text-sm">
                              <span>Total Funded: KES {(sector.totalFunded / 1000).toFixed(0)}K</span>
                              <span>Avg Score: {sector.avgScore}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5" />
                      {language === "en" ? "Sector Distribution" : "Usambazaji wa Sekta"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sectorAnalytics.map((sector) => (
                        <div key={sector.sector} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{sector.sector}</span>
                            <span>{sector.totalApplications} ({((sector.totalApplications / sectorAnalytics.reduce((sum, s) => sum + s.totalApplications, 0)) * 100).toFixed(1)}%)</span>
                          </div>
                          <Progress 
                            value={(sector.totalApplications / sectorAnalytics.reduce((sum, s) => sum + s.totalApplications, 0)) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {language === "en" ? "Chatbot & WhatsApp Integration" : "Muunganisho wa Chatbot na WhatsApp"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* In-site Chatbot */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    {language === "en" ? "In-site Chatbot Messages" : "Ujumbe wa Chatbot wa Ndani"}
                  </h4>
                  
                  <div className="space-y-3">
                    {applicants.slice(0, 5).map((applicant) => (
                      <div key={applicant.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{applicant.name}</div>
                            <div className="text-sm text-muted-foreground">{applicant.businessName}</div>
                      </div>
                          <Badge variant="outline">{applicant.chatbotMessages} messages</Badge>
                        </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                          onClick={() => handleViewChatbotMessages(applicant.id)}
                          className="w-full"
                          >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {language === "en" ? "View Messages" : "Tazama Ujumbe"}
                          </Button>
                        </div>
                    ))}
                      </div>
                    </div>

                {/* WhatsApp Integration */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    {language === "en" ? "WhatsApp Bot Messages" : "Ujumbe wa WhatsApp Bot"}
                  </h4>
                  
                  <div className="space-y-3">
                    {applicants.slice(0, 5).map((applicant) => (
                      <div key={applicant.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{applicant.name}</div>
                            <div className="text-sm text-muted-foreground">{applicant.businessName}</div>
                      </div>
                          <Badge variant="outline">{applicant.whatsappMessages} messages</Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewWhatsAppMessages(applicant.id)}
                          className="w-full"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          {language === "en" ? "View Messages" : "Tazama Ujumbe"}
                        </Button>
                      </div>
                    ))}
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AdminSettings 
            language={language} 
            preferences={preferences}
            onUpdatePreferences={updatePreferences}
            canModifySettings={canModifySettings}
            onPauseSubmissions={pauseSubmissions}
            onResetSettings={resetSystemSettings}
            onDeleteAccount={deleteAdminAccount}
            adminUser={adminUser}
            auditLogs={auditLogs}
            loading={adminLoading}
          />
        </TabsContent>
      </Tabs>


    </div>
  );
};