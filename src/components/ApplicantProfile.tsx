import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdmin } from "@/context/AdminContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  User,
  FileText,
  Star,
  MessageSquare,
  MessageCircle,
  Phone,
  Calendar,
  Building,
  MapPin,
  DollarSign,
  TrendingUp,
  Shield,
  CheckCircle,
  BarChart3,
  PieChart,
  Save,
  Eye,
  EyeOff
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

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
  email?: string;
  phone?: string;
  location?: string;
  businessDescription?: string;
  fundingPurpose?: string;
  previousLoans?: string;
  monthlyRevenue?: number;
  yearsInBusiness?: number;
}

// Mock data - in real implementation, this would come from API
const mockApplicants: Applicant[] = [
    {
      id: "APP-2024-001",
      name: "Grace Wanjiku",
      email: "grace.wanjiku@example.com",
      phone: "+254712345678",
      location: "Nairobi, Kenya",
      businessName: "Grace Designs",
      businessDescription: "Fashion design studio specializing in contemporary African wear.",
      sector: "Fashion Design",
      score: 742,
      tier: "A",
      status: "approved",
      amount: 150000,
      submittedAt: new Date("2024-01-15"),
      riskFlags: 0,
      riskLevel: 'low',
      documents: ["National ID", "Business Registration Certificate", "M-Pesa Statements"],
      faceValueOutput: "Strong business model with consistent revenue growth.",
      adminNotes: "Approved based on strong financials and market position.",
      notesVisible: true,
      chatbotMessages: 12,
      whatsappMessages: 8,
      fundingPurpose: "Expanding production capacity",
      previousLoans: "No previous formal loans.",
      monthlyRevenue: 85000,
      yearsInBusiness: 3
    },
    {
      id: "APP-2024-004",
      name: "Michael Karanja",
      email: "michael.karanja@example.com",
      phone: "+254745678901",
      location: "Nairobi, Kenya",
      businessName: "AnimateKE Studio",
      businessDescription: "Animation studio specializing in 2D/3D animation and motion graphics for commercials and educational content.",
      sector: "Animation & Motion Graphics",
      score: 712,
      tier: "A",
      status: "approved",
      amount: 200000,
      submittedAt: new Date("2024-01-12"),
      riskFlags: 0,
      riskLevel: 'low',
      documents: ["National ID", "Business Registration Certificate", "Portfolio", "Bank Statements"],
      faceValueOutput: "Excellent portfolio showcasing high-quality animation work for local and international clients.",
      adminNotes: "Approved based on strong portfolio and client testimonials.",
      notesVisible: true,
      chatbotMessages: 15,
      whatsappMessages: 10,
      fundingPurpose: "Upgrading animation software and equipment for higher quality productions",
      previousLoans: "One business loan of KES 100,000 in 2023, successfully repaid",
      monthlyRevenue: 120000,
      yearsInBusiness: 2.5
    },
    {
      id: "APP-2024-005",
      name: "Amina Hassan",
      email: "amina.hassan@example.com",
      phone: "+254756789012",
      location: "Mombasa, Kenya",
      businessName: "Voices of Kenya Podcast",
      businessDescription: "Podcast production company focusing on Kenyan stories, culture, and business insights.",
      sector: "Podcasting & Radio Production",
      score: 656,
      tier: "B",
      status: "pending",
      amount: 80000,
      submittedAt: new Date("2024-01-11"),
      riskFlags: 1,
      riskLevel: 'medium',
      documents: ["National ID", "Business Registration Certificate", "M-Pesa Statements"],
      faceValueOutput: "Growing podcast with good listener engagement, needs additional equipment funding.",
      adminNotes: "Pending verification of listener analytics and revenue projections.",
      notesVisible: false,
      chatbotMessages: 7,
      whatsappMessages: 4,
      fundingPurpose: "Purchasing professional recording equipment and studio setup",
      previousLoans: "No previous formal loans",
      monthlyRevenue: 35000,
      yearsInBusiness: 1
    }
  ];

export const ApplicantProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    adminUser, 
    saveAssessment, 
    loadAssessment, 
    addAuditLog,
    preferences,
    loading: adminLoading 
  } = useAdmin();
  
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [language] = useState<"en" | "sw">("en");
  const [faceValueAssessment, setFaceValueAssessment] = useState("");
  const [adminReview, setAdminReview] = useState("");
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [savingReview, setSavingReview] = useState(false);
  const [faceValueTimestamp, setFaceValueTimestamp] = useState<Date | null>(null);
  const [adminReviewTimestamp, setAdminReviewTimestamp] = useState<Date | null>(null);
  const isAdmin = adminUser?.permissions.canApprove || false;
  const [adminAction, setAdminAction] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");

  useEffect(() => {
    const fetchApplicant = async () => {
      setLoading(true);
      try {
        const foundApplicant = mockApplicants.find(app => app.id === id);
        setApplicant(foundApplicant || null);
        
        // Load saved assessments if applicant exists and user is admin
        if (foundApplicant && id && isAdmin) {
          const [savedFaceValue, savedAdminReview] = await Promise.all([
            loadAssessment(id, 'face_value'),
            loadAssessment(id, 'admin_review')
          ]);
          
          setFaceValueAssessment(savedFaceValue);
          setAdminReview(savedAdminReview);
        }
      } catch (error) {
        console.error("Error fetching applicant:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchApplicant();
    }
  }, [id, isAdmin, loadAssessment]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "pending": return "secondary";
      case "conditional": return "warning";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "A": return "bg-success text-success-foreground";
      case "B": return "bg-info text-info-foreground";
      case "C": return "bg-warning text-warning-foreground";
      case "D": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleSaveFaceValueAssessment = async () => {
    if (!id || !faceValueAssessment.trim()) return;
    
    setSavingAssessment(true);
    try {
      await saveAssessment(id, 'face_value', faceValueAssessment);
      setFaceValueTimestamp(new Date());
      addAuditLog({
        action: 'SAVE_FACE_VALUE_ASSESSMENT',
        target: `Applicant ${id}`,
        details: `Saved face value assessment for ${applicant?.name}`,
        severity: 'medium'
      });
    } catch (error) {
      console.error("Failed to save face value assessment:", error);
    } finally {
      setSavingAssessment(false);
    }
  };

  const handleSaveAdminReview = async () => {
    if (!id || !adminReview.trim()) return;
    
    setSavingReview(true);
    try {
      await saveAssessment(id, 'admin_review', adminReview);
      setAdminReviewTimestamp(new Date());
      addAuditLog({
        action: 'SAVE_ADMIN_REVIEW',
        target: `Applicant ${id}`,
        details: `Saved admin review for ${applicant?.name}`,
        severity: 'medium'
      });
    } catch (error) {
      console.error("Failed to save admin review:", error);
    } finally {
      setSavingReview(false);
    }
  };

  const handleAdminAction = (action: string) => {
    setAdminAction(action);
    // Reset reasons if not cancel
    if (action !== "cancel") {
      setCancelReason("");
      setOtherReason("");
    }
  };
  const handleSubmitAdminAction = () => {
    const reason = cancelReason === "other" ? otherReason : cancelReason;
    console.log("Admin action:", adminAction, "Reason:", reason);
    // Placeholder for backend call
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {language === "en" ? "Applicant Not Found" : "Mombi Hajapatikana"}
            </h1>
            <p className="text-gray-600 mb-6">
              {language === "en" 
                ? "The requested applicant profile could not be found." 
                : "Wasifu wa mombi ulioombwa haujapatikana."
              }
            </p>
            <Button onClick={() => navigate("/admin/applicants")}>
              {language === "en" ? "Back to Applicants" : "Rudi kwa Waombaji"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "en" ? "Back to Dashboard" : "Rudi kwenye Dashibodi"}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === "en" ? "Applicant Profile" : "Wasifu wa Mwombaji"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getTierColor(applicant.tier)}>
              Tier {applicant.tier}
            </Badge>
            <Badge variant={getStatusColor(applicant.status) as "success" | "secondary" | "warning" | "destructive" | "outline"}>
              {applicant.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="font-medium">{applicant.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="font-medium">{applicant.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="font-medium">{applicant.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="font-medium">{applicant.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Name</label>
                    <p className="font-medium">{applicant.businessName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sector</label>
                    <p className="font-medium">{applicant.sector}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="font-medium">{applicant.businessDescription}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {applicant.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">{doc}</span>
                      <Badge variant="outline" className="text-xs">Verified</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Admin-Only Sections */}
            {isAdmin && (
              <>
                {/* Face Value Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Face Value Assessment
                      <Badge variant="outline" className="text-xs ml-2">Admin Only</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="faceValueAssessment" className="text-sm font-medium">
                        Initial impressions and visual assessment of the applicant
                      </Label>
                      <Textarea
                        id="faceValueAssessment"
                        placeholder="Enter your face value assessment based on visual or first impression of the applicant..."
                        value={faceValueAssessment}
                        onChange={(e) => setFaceValueAssessment(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <Button 
                      onClick={handleSaveFaceValueAssessment} 
                      className="w-full"
                      disabled={savingAssessment || !faceValueAssessment.trim()}
                    >
                      {savingAssessment ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-b-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Face Value Assessment
                        </>
                      )}
                    </Button>
                    {faceValueTimestamp && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last saved: {faceValueTimestamp.toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Admin Review */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Admin Review
                      <Badge variant="outline" className="text-xs ml-2">Admin Only</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label htmlFor="adminReview" className="text-sm font-medium">
                        Comprehensive assessment after reviewing documents and profile
                      </Label>
                      <Textarea
                        id="adminReview"
                        placeholder="Enter your comprehensive assessment of the applicant after reviewing their documents and profile..."
                        value={adminReview}
                        onChange={(e) => setAdminReview(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <Button 
                      onClick={handleSaveAdminReview} 
                      className="w-full"
                      disabled={savingReview || !adminReview.trim()}
                    >
                      {savingReview ? (
                        <>
                          <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-b-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Admin Review
                        </>
                      )}
                    </Button>
                    {adminReviewTimestamp && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last saved: {adminReviewTimestamp.toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Credit Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{applicant.score}</div>
                  <p className="text-sm text-gray-600">Credit Score</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Risk Level</span>
                  <Badge className={getRiskLevelColor(applicant.riskLevel)}>
                    {applicant.riskLevel} risk
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Repayment Capacity Score Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Repayment Capacity Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Past Loan Repayment Status */}
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Past Loan Repayment Status</span>
                  </div>
                  <p className="text-sm font-semibold text-green-700">Completed, On Time</p>
                </div>

                {/* Revenue vs Loan Ratio */}
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Revenue vs Loan Ratio</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-700">3.5:1</p>
                </div>

                {/* Optional Income Sources */}
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Optional Income Sources</span>
                  </div>
                  <p className="text-sm font-semibold text-purple-700">M-Pesa Inflows, Inventory Turnover</p>
                </div>
              </CardContent>
            </Card>

            {/* Admin Actions Section */}
            {isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Admin Actions
                    <Badge variant="outline" className="text-xs ml-2">Admin Only</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <Button
                      variant={adminAction === "approve" ? "default" : "outline"}
                      onClick={() => handleAdminAction("approve")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant={adminAction === "review" ? "default" : "outline"}
                      onClick={() => handleAdminAction("review")}
                    >
                      Set to Review
                    </Button>
                    <Button
                      variant={adminAction === "flag" ? "default" : "outline"}
                      onClick={() => handleAdminAction("flag")}
                    >
                      Flag for Reevaluation
                    </Button>
                    <Button
                      variant={adminAction === "cancel" ? "destructive" : "outline"}
                      onClick={() => handleAdminAction("cancel")}
                    >
                      Cancel / Reject
                    </Button>
                  </div>
                  {adminAction === "cancel" && (
                    <div className="space-y-2">
                      <Label htmlFor="cancelReason">Cancellation Reason</Label>
                      <Select value={cancelReason} onValueChange={setCancelReason}>
                        <SelectTrigger id="cancelReason" className="w-full">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="incomplete">Incomplete docs</SelectItem>
                          <SelectItem value="risk">High-risk behavior</SelectItem>
                          <SelectItem value="sector">Not in HEVA sector</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {cancelReason === "other" && (
                        <Input
                          placeholder="Enter other reason..."
                          value={otherReason}
                          onChange={e => setOtherReason(e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>
                  )}
                  <Button
                    className="w-full mt-2"
                    onClick={handleSubmitAdminAction}
                    disabled={adminAction === "cancel" && !cancelReason}
                    variant={adminAction === "cancel" ? "destructive" : "default"}
                  >
                    {adminAction === "approve"
                      ? "Approve"
                      : adminAction === "review"
                      ? "Set to Review"
                      : adminAction === "flag"
                      ? "Flag for Reevaluation"
                      : adminAction === "cancel"
                      ? "Cancel / Reject"
                      : "Take Action"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {applicant.faceValueOutput && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Assessment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{applicant.faceValueOutput}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Communication
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chatbot Messages ({applicant.chatbotMessages})
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  WhatsApp Messages ({applicant.whatsappMessages})
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantProfile;