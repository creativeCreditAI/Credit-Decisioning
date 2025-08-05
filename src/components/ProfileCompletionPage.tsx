import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  Upload, 
  FileText, 
  Trash2, 
  Edit, 
  Eye,
  AlertCircle,
  Download,
  Plus,
  Minus,
  Award,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUserSettings } from "@/context/UserSettingsContext";

interface Document {
  id: string;
  name: string;
  type: "bank_statement" | "utility_bill" | "business_license" | "tax_return" | "other";
  status: "pending" | "uploaded" | "verified" | "rejected";
  uploadedAt?: Date;
  fileSize?: string;
  url?: string;
}

interface Survey {
  id: string;
  name: string;
  description: string;
  status: "pending" | "completed";
  completedAt?: Date;
  score?: number;
}

export const ProfileCompletionPage = () => {
  const { user } = useAuth();
  const { currentLanguage } = useUserSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mock documents data
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Bank Statement - March 2024",
      type: "bank_statement",
      status: "uploaded",
      uploadedAt: new Date("2024-03-15"),
      fileSize: "2.3 MB"
    },
    {
      id: "2", 
      name: "KPLC Bill - February 2024",
      type: "utility_bill",
      status: "pending"
    },
    {
      id: "3",
      name: "Business License",
      type: "business_license", 
      status: "verified",
      uploadedAt: new Date("2024-02-20"),
      fileSize: "1.1 MB"
    }
  ]);

  // Mock surveys data
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: "1",
      name: "Business Creditworthiness Survey",
      description: "Comprehensive assessment of your business financial health and creditworthiness",
      status: "pending"
    },
    {
      id: "2", 
      name: "Market Analysis Survey",
      description: "Understanding your market position and competitive landscape",
      status: "completed",
      completedAt: new Date("2024-03-10"),
      score: 85
    }
  ]);



  const requiredDocuments = [
    { type: "bank_statement", name: "Bank Statements (Last 6 months)", required: true },
    { type: "utility_bill", name: "Utility Bills (Last 3 months)", required: true },
    { type: "business_license", name: "Business License", required: true },
    { type: "tax_return", name: "Tax Returns (Last 2 years)", required: false },
    { type: "other", name: "Other Supporting Documents", required: false }
  ];

  const calculateCompletion = () => {
    const totalItems = requiredDocuments.filter(d => d.required).length + surveys.length;
    const completedItems = documents.filter(d => d.status === "verified").length + 
                         surveys.filter(s => s.status === "completed").length;
    return Math.round((completedItems / totalItems) * 100);
  };

  const completionPercentage = calculateCompletion();

  const handleFileUpload = async (file: File, documentType: string) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: documentType as any,
        status: "uploaded",
        uploadedAt: new Date(),
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      };
      
      setDocuments(prev => [...prev, newDocument]);
      setMessage({ type: 'success', text: 'Document uploaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload document. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setMessage({ type: 'success', text: 'Document deleted successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete document. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSurvey = async (surveyId: string) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Simulate survey completion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSurveys(prev => prev.map(survey => 
        survey.id === surveyId 
          ? { ...survey, status: "completed", completedAt: new Date(), score: Math.floor(Math.random() * 30) + 70 }
          : survey
      ));
      
      setMessage({ type: 'success', text: 'Survey completed successfully!' });
      
      // Check if profile is now complete
      if (calculateCompletion() === 100) {
        setTimeout(() => setShowSuccess(true), 1000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to complete survey. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "bank_statement": return "🏦";
      case "utility_bill": return "⚡";
      case "business_license": return "📋";
      case "tax_return": return "📊";
      default: return "📄";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="default" className="bg-green-100 text-green-800">Verified</Badge>;
      case "uploaded":
        return <Badge variant="secondary">Under Review</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center p-8">
          <div className="mb-6">
            <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-600 mb-2">Profile Completed! 🎉</h1>
            <p className="text-gray-600">
              Congratulations! Your profile is now 100% complete and ready for review.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Your application will be reviewed within 1-2 business days</li>
                <li>• You'll receive updates via email and dashboard</li>
                <li>• Check your dashboard for real-time status updates</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => window.location.href = "/dashboard"}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            Upload required documents and complete surveys to improve your credit score
          </p>
        </div>

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

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Completion</CardTitle>
                <CardDescription>
                  {completionPercentage}% complete - {completionPercentage === 100 ? "Ready for review!" : "Keep going!"}
                </CardDescription>
              </div>
              <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
                {completionPercentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercentage} className="w-full mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {documents.filter(d => d.status === "verified").length}
                </div>
                <div className="text-gray-600">Documents Verified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {surveys.filter(s => s.status === "completed").length}
                </div>
                <div className="text-gray-600">Surveys Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.status === "uploaded").length}
                </div>
                <div className="text-gray-600">Under Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {requiredDocuments.filter(d => d.required).length + surveys.length - 
                   documents.filter(d => d.status === "verified").length - 
                   surveys.filter(s => s.status === "completed").length}
                </div>
                <div className="text-gray-600">Remaining</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Documents Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Required Documents
              </CardTitle>
              <CardDescription>
                Upload the following documents to verify your business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {requiredDocuments.map((reqDoc) => {
                const uploadedDoc = documents.find(d => d.type === reqDoc.type);
                
                return (
                  <div key={reqDoc.type} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getDocumentIcon(reqDoc.type)}</span>
                        <div>
                          <h4 className="font-medium">{reqDoc.name}</h4>
                          {reqDoc.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                      </div>
                      {uploadedDoc && getStatusBadge(uploadedDoc.status)}
                    </div>
                    
                    {uploadedDoc ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{uploadedDoc.name}</span>
                          <span>{uploadedDoc.fileSize}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteDocument(uploadedDoc.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Click to upload or drag and drop
                          </p>
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, reqDoc.type);
                            }}
                            className="hidden"
                            id={`upload-${reqDoc.type}`}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => document.getElementById(`upload-${reqDoc.type}`)?.click()}
                            disabled={isLoading}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Upload File
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Surveys Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Business Surveys
              </CardTitle>
              <CardDescription>
                Complete these surveys to improve your credit score and application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Business Creditworthiness Survey */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Business Creditworthiness Survey</h4>
                    <p className="text-sm text-gray-600 mb-2">Comprehensive assessment of your business financial health and creditworthiness</p>
                  </div>
                  <Badge variant={surveys.find(s => s.id === "1")?.status === "completed" ? "default" : "outline"}>
                    {surveys.find(s => s.id === "1")?.status === "completed" ? "Completed" : "Pending"}
                  </Badge>
                </div>
                <Button 
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    window.location.href = "/dashboard";
                    setTimeout(() => {
                      const el = document.querySelector('[data-section="creditworthiness-survey"]');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 700);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Go to Survey
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/dashboard"}
          >
            Back to Dashboard
          </Button>
          
          <div className="flex gap-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Profile
            </Button>
            <Button 
              disabled={completionPercentage < 100}
              onClick={() => setShowSuccess(true)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit for Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 