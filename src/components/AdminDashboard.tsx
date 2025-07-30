import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  Star,
  User,
  FileText,
  Share2,
  MessageCircle,
  Phone,
  Edit,
  Save,
  X,
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

export const AdminDashboard = ({ language }: AdminDashboardProps) => {
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30d");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: "Admin Manager",
    email: "admin@heva.co.ke",
    role: "Senior Credit Analyst",
    department: "Credit Decisioning",
    lastLogin: new Date(),
    isEditing: false
  });
  const [faceValueOutput, setFaceValueOutput] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [notesVisible, setNotesVisible] = useState(true);

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
      { sector: "Film & Video", count: 17, avgScore: 689, fundedAmount: 75000 }
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
    setSelectedApplicant(applicant);
    setShowApplicantModal(true);
    setFaceValueOutput(applicant.faceValueOutput || "");
    setAdminNotes(applicant.adminNotes || "");
    setNotesVisible(applicant.notesVisible);
  };

  const handleSaveFaceValueOutput = () => {
    if (selectedApplicant) {
      // 🔌 Placeholder for backend call
      console.log("Saving face value output for:", selectedApplicant.id);
      console.log("Content:", faceValueOutput);
    }
  };

  const handleSaveAdminNotes = () => {
    if (selectedApplicant) {
      // 🔌 Placeholder for backend call
      console.log("Saving admin notes for:", selectedApplicant.id);
      console.log("Content:", adminNotes);
      console.log("Visible to user:", notesVisible);
    }
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

  const filteredApplicants = applicants.filter(applicant => 
    applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    applicant.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    applicant.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
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
          <TabsTrigger value="data-tools">
            {language === "en" ? "Data Tools" : "Zana za Data"}
          </TabsTrigger>
          <TabsTrigger value="chatbot">
            {language === "en" ? "Chatbot" : "Mazungumzo"}
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
                        <Badge variant={getStatusColor(applicant.status) as any}>
                          {applicant.status}
                        </Badge>
                        <Button variant="outline" size="sm">
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
                      
                      <Badge variant={getStatusColor(applicant.status) as any}>
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
                        <Button variant="outline" size="sm">
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
                    <Button variant="outline" size="sm">
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
      </Tabs>

      {/* Applicant Detail Modal */}
      {showApplicantModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {language === "en" ? "Applicant Details" : "Maelezo ya Mwombaji"} - {selectedApplicant.name}
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowApplicantModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Applicant Information */}
                <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {language === "en" ? "Basic Information" : "Maelezo ya Msingi"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">{language === "en" ? "Name:" : "Jina:"}</span>
                        <p>{selectedApplicant.name}</p>
                      </div>
                      <div>
                        <span className="font-medium">{language === "en" ? "Business:" : "Biashara:"}</span>
                        <p>{selectedApplicant.businessName}</p>
                      </div>
                      <div>
                        <span className="font-medium">{language === "en" ? "Sector:" : "Sekta:"}</span>
                        <p>{selectedApplicant.sector}</p>
                      </div>
                      <div>
                        <span className="font-medium">{language === "en" ? "Score:" : "Alama:"}</span>
                        <p>{selectedApplicant.score}</p>
                      </div>
                      <div>
                        <span className="font-medium">{language === "en" ? "Tier:" : "Kiwango:"}</span>
                        <Badge className={getTierColor(selectedApplicant.tier)}>
                          {selectedApplicant.tier}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">{language === "en" ? "Status:" : "Hali:"}</span>
                        <Badge variant={getStatusColor(selectedApplicant.status) as any}>
                          {selectedApplicant.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {language === "en" ? "Documents" : "Nyaraka"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedApplicant.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{doc}</span>
                          <Badge variant="outline" className="text-xs">
                            {language === "en" ? "Uploaded" : "Imepakiwa"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Face Value Output & Admin Notes */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      {language === "en" ? "Face Value Output" : "Matokeo ya Thamani ya Uso"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder={language === "en" ? "Enter face value output..." : "Ingiza matokeo ya thamani ya uso..."}
                      value={faceValueOutput}
                      onChange={(e) => setFaceValueOutput(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={handleSaveFaceValueOutput} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {language === "en" ? "Save Face Value Output" : "Hifadhi Matokeo ya Thamani ya Uso"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      {language === "en" ? "Admin Notes & Feedback" : "Maelezo ya Msimamizi na Maoni"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder={language === "en" ? "Add admin notes..." : "Ongeza maelezo ya msimamizi..."}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={4}
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={notesVisible}
                        onCheckedChange={setNotesVisible}
                      />
                      <Label className="text-sm">
                        {language === "en" ? "Visible to User" : "Inaonekana kwa Mtumiaji"}
                      </Label>
                    </div>
                    <Button onClick={handleSaveAdminNotes} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {language === "en" ? "Save Notes" : "Hifadhi Maelezo"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      {language === "en" ? "Communication History" : "Historia ya Mawasiliano"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewChatbotMessages(selectedApplicant.id)}
                        className="flex-1"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {language === "en" ? "Chatbot" : "Chatbot"} ({selectedApplicant.chatbotMessages})
                    </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewWhatsAppMessages(selectedApplicant.id)}
                        className="flex-1"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {language === "en" ? "WhatsApp" : "WhatsApp"} ({selectedApplicant.whatsappMessages})
                    </Button>
              </div>
            </CardContent>
          </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};