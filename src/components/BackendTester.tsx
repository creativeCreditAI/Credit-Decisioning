import { useState } from "react";
import { 
  AuthService, 
  ApplicationService, 
  DocumentService, 
  CreditScoringService,
  AdminService,
  ChatbotService,
  DataIntegrationService
} from "../services/backendService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2,
  User,
  FileText,
  CreditCard,
  Settings,
  MessageSquare,
  Database,
  Upload
} from "lucide-react";

interface TestResult {
  name: string;
  status: "idle" | "running" | "success" | "error";
  result?: unknown;
  error?: string;
  duration?: number;
}

export const BackendTester = () => {
  const [testResults, setTestResults] = useState<{ [key: string]: TestResult }>({});
  const [globalLoading, setGlobalLoading] = useState(false);

  // Test data
  const [testData, setTestData] = useState({
    email: "test@example.com",
    password: "password123",
    adminEmail: "admin@example.com",
    adminPassword: "admin123",
    businessName: "Test Business",
    businessDescription: "A test business for API testing",
    fundingAmount: 500000,
    sector: "technology",
    chatMessage: "What documents do I need for my application?",
    smsMessages: ["M-PESA: You have received KES 5,000 from John Doe"],
  });

  const updateTestResult = (testName: string, update: Partial<TestResult>) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: { ...prev[testName], ...update }
    }));
  };

  const runTest = async (testName: string, testFunction: () => Promise<unknown>) => {
    updateTestResult(testName, { status: "running" });
    const startTime = Date.now();

    try {
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      updateTestResult(testName, {
        status: "success",
        result,
        duration,
        error: undefined
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(testName, {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        duration
      });
    }
  };

  const runAllTests = async () => {
    setGlobalLoading(true);
    
    const tests = [
      { name: "User Registration", fn: testUserRegistration },
      { name: "User Login", fn: testUserLogin },
      { name: "Get Profile", fn: testGetProfile },
      { name: "Create Application", fn: testCreateApplication },
      { name: "Get Applications", fn: testGetApplications },
      { name: "Upload Document", fn: testDocumentUpload },
      { name: "Get Documents", fn: testGetDocuments },
      { name: "Calculate Credit Score", fn: testCalculateCreditScore },
      { name: "Get Credit Score", fn: testGetCreditScore },
      { name: "Chat Message", fn: testChatMessage },
      { name: "Parse SMS", fn: testParseSMS },
    ];

    for (const test of tests) {
      await runTest(test.name, test.fn);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setGlobalLoading(false);
  };

  // Test functions
  const testUserRegistration = async () => {
    return await AuthService.register({
      email: testData.email,
      password: testData.password,
      password_confirm: testData.password,
      name: "Test User",
      phone: "+254712345678",
      business_name: testData.businessName,
      sector: testData.sector,
    });
  };

  const testUserLogin = async () => {
    return await AuthService.validateUserLogin(testData.email, testData.password);
  };

  const testAdminLogin = async () => {
    return await AuthService.validateAdminLogin(testData.adminEmail, testData.adminPassword);
  };

  const testGetProfile = async () => {
    return await AuthService.getUserProfile();
  };

  const testUpdateProfile = async () => {
    return await AuthService.updateProfile({
      name: "Updated Test User",
      businessName: "Updated Test Business"
    });
  };

  const testCreateApplication = async () => {
    return await ApplicationService.createApplication({
      business_name: testData.businessName,
      business_description: testData.businessDescription,
      founder_name: "Test User",
      founder_email: testData.email,
      founder_phone: "+254712345678",
      funding_amount_requested: testData.fundingAmount,
      business_stage: "startup",
      sector: testData.sector,
      location: "Nairobi",
      employee_count: 1,
      monthly_revenue: 50000,
      social_media_profiles: {
        website: "https://testbusiness.com",
        linkedin: "linkedin.com/in/testuser"
      }
    });
  };

  const testGetApplications = async () => {
    return await ApplicationService.getUserApplications();
  };

  const testDocumentUpload = async () => {
    // Create a dummy file for testing
    const dummyFile = new File(["test content"], "test-document.pdf", { type: "application/pdf" });
    return await DocumentService.uploadDocument(dummyFile, "business_plan");
  };

  const testGetDocuments = async () => {
    return await DocumentService.getUserDocuments();
  };

  const testCalculateCreditScore = async () => {
    return await CreditScoringService.calculateCreditScore();
  };

  const testGetCreditScore = async () => {
    return await CreditScoringService.getCreditScore();
  };

  const testGetScoreExplanation = async () => {
    return await CreditScoringService.getScoreExplanation();
  };

  const testAdminStats = async () => {
    return await AdminService.getStatsOverview();
  };

  const testAdminApplications = async () => {
    return await AdminService.getAllApplications();
  };

  const testChatMessage = async () => {
    return await ChatbotService.sendMessage(testData.chatMessage);
  };

  const testChatSuggestions = async () => {
    return await ChatbotService.getChatSuggestions();
  };

  const testParseSMS = async () => {
    return await DataIntegrationService.parseSmsMessages(testData.smsMessages);
  };

  const testAIParseSMS = async () => {
    return await DataIntegrationService.aiParseSmsMessages(testData.smsMessages);
  };

  const testSyncMpesa = async () => {
    return await DataIntegrationService.syncMpesaData();
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Play className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "running":
        return <Badge variant="secondary">Running</Badge>;
      case "success":
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  const TestSection = ({ 
    title, 
    icon, 
    tests 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    tests: { name: string; fn: () => Promise<unknown> }[] 
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>Test {title.toLowerCase()} endpoints</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tests.map((test) => {
          const result = testResults[test.name];
          return (
            <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(result?.status || "idle")}
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  {result?.duration && (
                    <p className="text-sm text-muted-foreground">{result.duration}ms</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusBadge(result?.status || "idle")}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runTest(test.name, test.fn)}
                  disabled={result?.status === "running" || globalLoading}
                >
                  Run
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Backend API Tester</h1>
          <p className="text-muted-foreground">Test all backend endpoints and integrations</p>
        </div>
        <Button onClick={runAllTests} disabled={globalLoading} size="lg">
          {globalLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Running All Tests...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run All Tests
            </>
          )}
        </Button>
      </div>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Configure test data for API calls</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="auth">Auth</TabsTrigger>
              <TabsTrigger value="business">Business</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="auth" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">User Email</label>
                  <Input
                    value={testData.email}
                    onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">User Password</label>
                  <Input
                    type="password"
                    value={testData.password}
                    onChange={(e) => setTestData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Admin Email</label>
                  <Input
                    value={testData.adminEmail}
                    onChange={(e) => setTestData(prev => ({ ...prev, adminEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Admin Password</label>
                  <Input
                    type="password"
                    value={testData.adminPassword}
                    onChange={(e) => setTestData(prev => ({ ...prev, adminPassword: e.target.value }))}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="business" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Business Name</label>
                  <Input
                    value={testData.businessName}
                    onChange={(e) => setTestData(prev => ({ ...prev, businessName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Funding Amount</label>
                  <Input
                    type="number"
                    value={testData.fundingAmount}
                    onChange={(e) => setTestData(prev => ({ ...prev, fundingAmount: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Description</label>
                <Textarea
                  value={testData.businessDescription}
                  onChange={(e) => setTestData(prev => ({ ...prev, businessDescription: e.target.value }))}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="chat" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chat Message</label>
                <Textarea
                  value={testData.chatMessage}
                  onChange={(e) => setTestData(prev => ({ ...prev, chatMessage: e.target.value }))}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="data" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SMS Messages (JSON array)</label>
                <Textarea
                  value={JSON.stringify(testData.smsMessages, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setTestData(prev => ({ ...prev, smsMessages: parsed }));
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TestSection
          title="Authentication"
          icon={<User className="w-5 h-5" />}
          tests={[
            { name: "User Registration", fn: testUserRegistration },
            { name: "User Login", fn: testUserLogin },
            { name: "Admin Login", fn: testAdminLogin },
            { name: "Get Profile", fn: testGetProfile },
            { name: "Update Profile", fn: testUpdateProfile },
          ]}
        />

        <TestSection
          title="Applications"
          icon={<FileText className="w-5 h-5" />}
          tests={[
            { name: "Create Application", fn: testCreateApplication },
            { name: "Get Applications", fn: testGetApplications },
          ]}
        />

        <TestSection
          title="Documents"
          icon={<Upload className="w-5 h-5" />}
          tests={[
            { name: "Upload Document", fn: testDocumentUpload },
            { name: "Get Documents", fn: testGetDocuments },
          ]}
        />

        <TestSection
          title="Credit Scoring"
          icon={<CreditCard className="w-5 h-5" />}
          tests={[
            { name: "Calculate Credit Score", fn: testCalculateCreditScore },
            { name: "Get Credit Score", fn: testGetCreditScore },
            { name: "Get Score Explanation", fn: testGetScoreExplanation },
          ]}
        />

        <TestSection
          title="Admin Services"
          icon={<Settings className="w-5 h-5" />}
          tests={[
            { name: "Admin Stats", fn: testAdminStats },
            { name: "Admin Applications", fn: testAdminApplications },
          ]}
        />

        <TestSection
          title="Chat & Data"
          icon={<MessageSquare className="w-5 h-5" />}
          tests={[
            { name: "Chat Message", fn: testChatMessage },
            { name: "Chat Suggestions", fn: testChatSuggestions },
            { name: "Parse SMS", fn: testParseSMS },
            { name: "AI Parse SMS", fn: testAIParseSMS },
            { name: "Sync M-Pesa", fn: testSyncMpesa },
          ]}
        />
      </div>

      {/* Test Results Display */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Detailed results from API tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(testResults).map(([name, result]) => (
                <div key={name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{name}</h4>
                    {getStatusBadge(result.status)}
                  </div>
                  
                  {result.error && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {result.result && (
                    <div className="bg-muted p-3 rounded text-sm">
                      <pre className="whitespace-pre-wrap overflow-auto max-h-40">
                        {JSON.stringify(result.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
