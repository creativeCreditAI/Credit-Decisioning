import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ApplicationService,
  DocumentService,
  CreditScoringService,
  AdminService,
  ChatbotService,
  Application,
  Document,
  CreditScore
} from "../services/backendService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Upload, Send, Download, AlertCircle } from "lucide-react";

interface DashboardStats {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  totalFundingRequested: number;
  averageScore: number;
}

export const IntegratedDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [creditScore, setCreditScore] = useState<CreditScore | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [newApplication, setNewApplication] = useState({
    business_name: "",
    business_description: "",
    funding_amount_requested: 0,
    business_stage: "startup",
    sector: "",
    location: "",
    monthly_revenue: 0
  });
  const [chatMessage, setChatMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  // Loading states
  const [createLoading, setCreateLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && user) {
        await loadDashboardData();
      }
    };
    
    loadData();
  }, [isAuthenticated, user]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [appsData, docsData, scoreData] = await Promise.allSettled([
        ApplicationService.getUserApplications(),
        DocumentService.getUserDocuments(),
        CreditScoringService.getCreditScore()
      ]);

      if (appsData.status === 'fulfilled') {
        setApplications(appsData.value);
      }

      if (docsData.status === 'fulfilled') {
        setDocuments(docsData.value);
      }

      if (scoreData.status === 'fulfilled') {
        setCreditScore(scoreData.value);
      }

      // Load admin stats if user is admin
      if (user?.role === 'admin') {
        try {
          const stats = await AdminService.getStatsOverview();
          setDashboardStats(stats);
        } catch (error) {
          console.error('Failed to load admin stats:', error);
        }
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadDashboardData();
    }
  }, [isAuthenticated, user, loadDashboardData]);  const handleCreateApplication = async () => {
    if (!user) return;

    try {
      setCreateLoading(true);
      setError(null);

      const applicationData = {
        ...newApplication,
        founder_name: user.name,
        founder_email: user.email,
        founder_phone: user.phone || "",
      };

      const newApp = await ApplicationService.createApplication(applicationData);
      setApplications(prev => [...prev, newApp]);
      
      // Reset form
      setNewApplication({
        business_name: "",
        business_description: "",
        funding_amount_requested: 0,
        business_stage: "startup",
        sector: "",
        location: "",
        monthly_revenue: 0
      });

      alert('Application created successfully!');
    } catch (error) {
      console.error('Failed to create application:', error);
      setError('Failed to create application. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    try {
      setUploadLoading(true);
      setError(null);

      const document = await DocumentService.uploadDocument(file, documentType, applications[0]?.id);
      setDocuments(prev => [...prev, document]);
      
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Failed to upload document:', error);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleCalculateScore = async () => {
    try {
      setScoreLoading(true);
      setError(null);

      const score = await CreditScoringService.calculateCreditScore();
      setCreditScore(score);
      
      if (score) {
        alert(`Your credit score has been calculated: ${score.score} (${score.grade})`);
      }
    } catch (error) {
      console.error('Failed to calculate credit score:', error);
      setError('Failed to calculate credit score. Please try again.');
    } finally {
      setScoreLoading(false);
    }
  };

  const handleChatMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      setChatLoading(true);
      setError(null);

      const response = await ChatbotService.sendMessage(chatMessage);
      if (response) {
        setChatResponse(response.response);
      }
    } catch (error) {
      console.error('Failed to send chat message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to access the dashboard</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {user?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
        </h1>
        <Badge variant={user?.role === 'admin' ? 'destructive' : 'default'}>
          {user?.role?.toUpperCase()}
        </Badge>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Admin Stats */}
      {user?.role === 'admin' && dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.totalApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dashboardStats.approvedApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dashboardStats.pendingApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{dashboardStats.rejectedApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Funding</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {dashboardStats.totalFundingRequested.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Avg Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.averageScore.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Application */}
        {user?.role !== 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Application</CardTitle>
              <CardDescription>Start your funding application process</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Business Name"
                value={newApplication.business_name}
                onChange={(e) => setNewApplication(prev => ({ ...prev, business_name: e.target.value }))}
              />
              <Textarea
                placeholder="Business Description"
                value={newApplication.business_description}
                onChange={(e) => setNewApplication(prev => ({ ...prev, business_description: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Funding Amount (KES)"
                value={newApplication.funding_amount_requested || ""}
                onChange={(e) => setNewApplication(prev => ({ ...prev, funding_amount_requested: parseInt(e.target.value) || 0 }))}
              />
              <Input
                placeholder="Sector (e.g., Fashion, Technology)"
                value={newApplication.sector}
                onChange={(e) => setNewApplication(prev => ({ ...prev, sector: e.target.value }))}
              />
              <Input
                placeholder="Location"
                value={newApplication.location}
                onChange={(e) => setNewApplication(prev => ({ ...prev, location: e.target.value }))}
              />
              <Button onClick={handleCreateApplication} disabled={createLoading} className="w-full">
                {createLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Application
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Your recent applications</CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-muted-foreground">No applications found</p>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{app.business_name}</h3>
                        <p className="text-sm text-muted-foreground">{app.business_description}</p>
                        <p className="text-sm">KES {app.funding_amount_requested.toLocaleString()}</p>
                      </div>
                      <Badge variant={
                        app.status === 'approved' ? 'default' :
                        app.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Upload */}
        {user?.role !== 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>Upload required documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(file, 'business_plan');
                  }
                }}
                disabled={uploadLoading}
              />
              {uploadLoading && (
                <div className="flex items-center mt-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Uploading...</span>
                </div>
              )}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Uploaded Documents</h4>
                {documents.length === 0 ? (
                  <p className="text-muted-foreground">No documents uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {documents.slice(0, 3).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between border rounded p-2">
                        <span className="text-sm">{doc.name}</span>
                        <Badge variant="outline">{doc.documentType}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Credit Score */}
        {user?.role !== 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Credit Score</CardTitle>
              <CardDescription>Your current credit assessment</CardDescription>
            </CardHeader>
            <CardContent>
              {creditScore ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{creditScore.score}</div>
                    <div className="text-lg">{creditScore.grade}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {creditScore.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">No credit score available</p>
                  <Button onClick={handleCalculateScore} disabled={scoreLoading}>
                    {scoreLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Calculate Score
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Get help with your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask a question..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
              />
              <Button onClick={handleChatMessage} disabled={chatLoading}>
                {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {chatResponse && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">{chatResponse}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
