import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Eye,
  MessageSquare,
  Star,
  Calendar,
  MapPin,
  Building
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  documentType: string;
  status: "uploaded" | "verified" | "pending";
}

interface ApplicationData {
  id: string;
  businessName: string;
  sector: string;
  location: string;
  fundingType: "grant" | "loan" | "investment";
  amount: number;
  status: "draft" | "submitted" | "reviewing" | "approved" | "rejected";
  submittedAt: Date;
  profileCompletion: number;
  documentsUploaded: number;
  totalDocuments: number;
}

interface SurveyData {
  satisfaction: number;
  easeOfUse: number;
  supportQuality: number;
  likelihoodToRecommend: number;
  feedback: string;
  improvements: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    satisfaction: 0,
    easeOfUse: 0,
    supportQuality: 0,
    likelihoodToRecommend: 0,
    feedback: "",
    improvements: ""
  });
  const [isSubmittingSurvey, setIsSubmittingSurvey] = useState(false);
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // 🔌 Placeholder functions for backend calls
  const fetchUserApplicationData = async () => {
    // 🔌 Placeholder for backend call
    console.log("Fetching user application data");
    return {
      id: "APP-2024-001",
      businessName: user?.businessName || "Grace Designs",
      sector: user?.sector || "Fashion Design",
      location: "Nairobi, Kenya",
      fundingType: "loan" as const,
      amount: 150000,
      status: "submitted" as const,
      submittedAt: new Date("2024-01-15"),
      profileCompletion: 85,
      documentsUploaded: 4,
      totalDocuments: 5
    };
  };

  const fetchUserDocuments = async () => {
    // 🔌 Placeholder for backend call
    console.log("Fetching user documents");
    return [
      {
        id: "doc-1",
        name: "National ID",
        type: "image/jpeg",
        size: 2048576,
        url: "/documents/id.jpg",
        uploadedAt: new Date("2024-01-10"),
        documentType: "identification",
        status: "verified" as const
      },
      {
        id: "doc-2",
        name: "Business Registration Certificate",
        type: "application/pdf",
        size: 1048576,
        url: "/documents/business-reg.pdf",
        uploadedAt: new Date("2024-01-11"),
        documentType: "business",
        status: "verified" as const
      },
      {
        id: "doc-3",
        name: "M-Pesa Statements (6 months)",
        type: "application/pdf",
        size: 3145728,
        url: "/documents/mpesa-statements.pdf",
        uploadedAt: new Date("2024-01-12"),
        documentType: "financial",
        status: "verified" as const
      },
      {
        id: "doc-4",
        name: "Utility Bills",
        type: "application/pdf",
        size: 1572864,
        url: "/documents/utility-bills.pdf",
        uploadedAt: new Date("2024-01-13"),
        documentType: "utility",
        status: "pending" as const
      }
    ];
  };

  const submitSurvey = async (surveyData: SurveyData) => {
    // 🔌 Placeholder for backend call
    console.log("Submitting survey:", surveyData);
    setIsSubmittingSurvey(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmittingSurvey(false);
    setSurveySubmitted(true);
    console.log("Survey submitted successfully");
  };

  useEffect(() => {
    const loadData = async () => {
      const [appData, docs] = await Promise.all([
        fetchUserApplicationData(),
        fetchUserDocuments()
      ]);
      
      setApplicationData(appData);
      setDocuments(docs);
    };

    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "uploaded":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitSurvey(surveyData);
  };

  if (!applicationData) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
              <DashboardHeader 
          user={{
            name: user?.name || "Grace Wanjiku",
            avatar: user?.avatar,
            businessName: user?.businessName || "Grace Designs",
            sectors: [user?.sector || "Fashion Design"]
          }}
          language={language}
          onLanguageChange={setLanguage}
          userRole={user?.role}
        />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {language === "en" ? "Complete Your Profile" : "Kamilisha Wasifu Wako"}
          </h1>
          <p className="text-muted-foreground">
            {language === "en" 
              ? "Review your application details and complete the post-application survey"
              : "Kagua maelezo ya ombi lako na kamilisha uchunguzi wa baada ya ombi"
            }
          </p>
        </div>

        {/* Application Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              {language === "en" ? "Application Summary" : "Muhtasari wa Ombi"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{applicationData.profileCompletion}%</div>
                <div className="text-sm text-muted-foreground">
                  {language === "en" ? "Profile Complete" : "Wasifu Umekamilika"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {applicationData.documentsUploaded}/{applicationData.totalDocuments}
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === "en" ? "Documents Uploaded" : "Nyaraka Zilizopakiwa"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  KES {applicationData.amount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === "en" ? "Requested Amount" : "Kiasi Kilichoombwa"}
                </div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {applicationData.status}
                </Badge>
                <div className="text-sm text-muted-foreground mt-1">
                  {language === "en" ? "Application Status" : "Hali ya Ombi"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">
              {language === "en" ? "Documents" : "Nyaraka"}
            </TabsTrigger>
            <TabsTrigger value="application">
              {language === "en" ? "Application Details" : "Maelezo ya Ombi"}
            </TabsTrigger>
            <TabsTrigger value="survey">
              {language === "en" ? "Survey" : "Uchunguzi"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === "en" ? "Uploaded Documents" : "Nyaraka Zilizopakiwa"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(doc.status)}
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatFileSize(doc.size)} • {doc.documentType}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {language === "en" ? "Uploaded" : "Ilipakiwa"} {doc.uploadedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(doc.status) as any}>
                          {doc.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          {language === "en" ? "View" : "Tazama"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="application" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  {language === "en" ? "Application Information" : "Maelezo ya Ombi"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        {language === "en" ? "Business Name" : "Jina la Biashara"}
                      </Label>
                      <div className="text-lg font-medium">{applicationData.businessName}</div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        {language === "en" ? "Sector" : "Sekta"}
                      </Label>
                      <div className="text-lg font-medium">{applicationData.sector}</div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        {language === "en" ? "Location" : "Mahali"}
                      </Label>
                      <div className="text-lg font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {applicationData.location}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        {language === "en" ? "Funding Type" : "Aina ya Ufadhili"}
                      </Label>
                      <div className="text-lg font-medium capitalize">{applicationData.fundingType}</div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        {language === "en" ? "Requested Amount" : "Kiasi Kilichoombwa"}
                      </Label>
                      <div className="text-lg font-medium">KES {applicationData.amount.toLocaleString()}</div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        {language === "en" ? "Submitted Date" : "Tarehe ya Kuwasilisha"}
                      </Label>
                      <div className="text-lg font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {applicationData.submittedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="survey" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {language === "en" ? "Post-Application Survey" : "Uchunguzi wa Baada ya Ombi"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {language === "en" 
                    ? "Help us improve our services by completing this brief survey"
                    : "Tusaidie kuboresha huduma zetu kwa kukamilisha uchunguzi huu mfupi"
                  }
                </p>
              </CardHeader>
              <CardContent>
                {surveySubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {language === "en" ? "Survey Submitted!" : "Uchunguzi Umewasilishwa!"}
                    </h3>
                    <p className="text-muted-foreground">
                      {language === "en" 
                        ? "Thank you for your feedback. We appreciate your time."
                        : "Asante kwa maoni yako. Tunathamini muda wako."
                      }
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSurveySubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          {language === "en" ? "Overall Satisfaction" : "Uridhishaji wa Jumla"}
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setSurveyData(prev => ({ ...prev, satisfaction: rating }))}
                              className={`p-2 rounded-full ${
                                surveyData.satisfaction >= rating 
                                  ? "text-yellow-500" 
                                  : "text-gray-300"
                              }`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          {language === "en" ? "Ease of Application Process" : "Urahisi wa Mchakato wa Ombi"}
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setSurveyData(prev => ({ ...prev, easeOfUse: rating }))}
                              className={`p-2 rounded-full ${
                                surveyData.easeOfUse >= rating 
                                  ? "text-yellow-500" 
                                  : "text-gray-300"
                              }`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          {language === "en" ? "Support Quality" : "Ubora wa Msaada"}
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setSurveyData(prev => ({ ...prev, supportQuality: rating }))}
                              className={`p-2 rounded-full ${
                                surveyData.supportQuality >= rating 
                                  ? "text-yellow-500" 
                                  : "text-gray-300"
                              }`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          {language === "en" ? "Likelihood to Recommend" : "Uwezekano wa Kupendekeza"}
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setSurveyData(prev => ({ ...prev, likelihoodToRecommend: rating }))}
                              className={`p-2 rounded-full ${
                                surveyData.likelihoodToRecommend >= rating 
                                  ? "text-yellow-500" 
                                  : "text-gray-300"
                              }`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="feedback" className="text-sm font-medium">
                        {language === "en" ? "Additional Feedback" : "Maoni ya Ziada"}
                      </Label>
                      <Textarea
                        id="feedback"
                        placeholder={language === "en" 
                          ? "Share your experience with our platform..." 
                          : "Shiriki uzoefu wako na jukwaa letu..."
                        }
                        value={surveyData.feedback}
                        onChange={(e) => setSurveyData(prev => ({ ...prev, feedback: e.target.value }))}
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="improvements" className="text-sm font-medium">
                        {language === "en" ? "Suggestions for Improvement" : "Mapendekezo ya Uboreshaji"}
                      </Label>
                      <Textarea
                        id="improvements"
                        placeholder={language === "en" 
                          ? "What could we improve?" 
                          : "Tunawezaje kuboresha?"
                        }
                        value={surveyData.improvements}
                        onChange={(e) => setSurveyData(prev => ({ ...prev, improvements: e.target.value }))}
                        className="mt-2"
                        rows={3}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmittingSurvey}
                    >
                      {isSubmittingSurvey ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          {language === "en" ? "Submitting..." : "Inawasilisha..."}
                        </div>
                      ) : (
                        language === "en" ? "Submit Survey" : "Wasilisha Uchunguzi"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage; 