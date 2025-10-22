import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Server,
  Database,
  Settings,
  Code,
  Terminal,
  ExternalLink,
  Copy,
  RefreshCw,
  Loader2
} from "lucide-react";

interface SetupCheck {
  name: string;
  status: "checking" | "pass" | "fail" | "warning";
  message: string;
  action?: string;
}

export const SetupGuide = () => {
  const [setupChecks, setSetupChecks] = useState<SetupCheck[]>([
    { name: "Backend Connection", status: "checking", message: "Checking..." },
    { name: "Environment Variables", status: "checking", message: "Checking..." },
    { name: "Authentication", status: "checking", message: "Checking..." },
    { name: "Database Connection", status: "checking", message: "Checking..." },
    { name: "API Endpoints", status: "checking", message: "Checking..." },
  ]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    performSetupChecks();
  }, []);

  const performSetupChecks = async () => {
    setIsChecking(true);
    const results: SetupCheck[] = [];

    // Check Backend Connection
    try {
      const response = await fetch(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok || response.status === 404) {
        results.push({
          name: "Backend Connection",
          status: "pass",
          message: "✅ Backend server is running and accessible"
        });
      } else {
        results.push({
          name: "Backend Connection",
          status: "fail",
          message: "❌ Backend server returned error status",
          action: "Ensure Django server is running on port 8000"
        });
      }
    } catch (error) {
      results.push({
        name: "Backend Connection",
        status: "fail",
        message: "❌ Cannot connect to backend server",
        action: "Start Django server: python manage.py runserver 8000"
      });
    }

    // Check Environment Variables
    const requiredEnvVars = ['VITE_API_BASE_URL'];
    const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
    
    if (missingVars.length === 0) {
      results.push({
        name: "Environment Variables",
        status: "pass",
        message: "✅ All required environment variables are set"
      });
    } else {
      results.push({
        name: "Environment Variables",
        status: "warning",
        message: `⚠️ Some optional environment variables are missing: ${missingVars.join(', ')}`,
        action: "Check .env.local file and add missing variables"
      });
    }

    // Check Authentication
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const authResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/validate-token/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (authResponse.ok) {
          results.push({
            name: "Authentication",
            status: "pass",
            message: "✅ Authentication token is valid"
          });
        } else {
          results.push({
            name: "Authentication",
            status: "warning",
            message: "⚠️ Authentication token is invalid or expired",
            action: "Please log in again"
          });
        }
      } catch (error) {
        results.push({
          name: "Authentication",
          status: "warning",
          message: "⚠️ Could not validate authentication token",
          action: "Backend authentication endpoint may not be available"
        });
      }
    } else {
      results.push({
        name: "Authentication",
        status: "warning",
        message: "⚠️ No authentication token found",
        action: "Log in to test authenticated endpoints"
      });
    }

    // Check Database Connection (simulated)
    try {
      const dbResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/profile/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Token ${token}` })
        }
      });

      if (dbResponse.ok) {
        results.push({
          name: "Database Connection",
          status: "pass",
          message: "✅ Database is accessible through API"
        });
      } else if (dbResponse.status === 401) {
        results.push({
          name: "Database Connection",
          status: "pass",
          message: "✅ Database endpoint is accessible (authentication required)"
        });
      } else {
        results.push({
          name: "Database Connection",
          status: "fail",
          message: "❌ Database connection issue",
          action: "Check Django database configuration"
        });
      }
    } catch (error) {
      results.push({
        name: "Database Connection",
        status: "fail",
        message: "❌ Cannot reach database endpoints",
        action: "Ensure Django backend is properly configured"
      });
    }

    // Check API Endpoints
    const endpoints = ['/auth/login/', '/applications/user/', '/documents/user/', '/scoring/score/'];
    let workingEndpoints = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        // Any response (including 401, 404) means the endpoint exists
        if (response.status !== 500) {
          workingEndpoints++;
        }
      } catch (error) {
        // Endpoint not reachable
      }
    }

    if (workingEndpoints === endpoints.length) {
      results.push({
        name: "API Endpoints",
        status: "pass",
        message: "✅ All API endpoints are accessible"
      });
    } else if (workingEndpoints > 0) {
      results.push({
        name: "API Endpoints",
        status: "warning",
        message: `⚠️ ${workingEndpoints}/${endpoints.length} API endpoints are accessible`,
        action: "Some endpoints may not be configured"
      });
    } else {
      results.push({
        name: "API Endpoints",
        status: "fail",
        message: "❌ No API endpoints are accessible",
        action: "Check Django URL configuration"
      });
    }

    setSetupChecks(results);
    setIsChecking(false);
  };

  const getStatusIcon = (status: SetupCheck["status"]) => {
    switch (status) {
      case "checking":
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case "pass":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "fail":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: SetupCheck["status"]) => {
    switch (status) {
      case "checking":
        return <Badge variant="secondary">Checking</Badge>;
      case "pass":
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-yellow-500">Warning</Badge>;
      case "fail":
        return <Badge variant="destructive">Fail</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const CodeBlock = ({ children, language = "bash" }: { children: string; language?: string }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code>{children}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(children)}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Backend Integration Setup Guide</h1>
        <p className="text-muted-foreground">Follow this guide to connect your frontend to the Django backend</p>
      </div>

      {/* Setup Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Setup Status
            </div>
            <Button variant="outline" size="sm" onClick={performSetupChecks} disabled={isChecking}>
              <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
              Recheck
            </Button>
          </CardTitle>
          <CardDescription>Current status of your backend integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {setupChecks.map((check, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <h4 className="font-medium">{check.name}</h4>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                    {check.action && (
                      <p className="text-sm text-blue-600 mt-1">
                        <strong>Action:</strong> {check.action}
                      </p>
                    )}
                  </div>
                </div>
                {getStatusBadge(check.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Tabs defaultValue="backend" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="backend">Backend Setup</TabsTrigger>
          <TabsTrigger value="frontend">Frontend Setup</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="backend" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Django Backend Setup
              </CardTitle>
              <CardDescription>Get your Django backend running on port 8000</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Start Django Development Server</h4>
                <CodeBlock>
{`# Navigate to your Django project directory
cd your-django-backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the development server
python manage.py runserver 8000`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Verify API Endpoints</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Your Django backend should have these endpoints available:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
                  <div>• POST /api/auth/login/</div>
                  <div>• POST /api/auth/register/</div>
                  <div>• GET /api/auth/profile/</div>
                  <div>• POST /api/applications/create/</div>
                  <div>• GET /api/applications/user/</div>
                  <div>• POST /api/documents/upload/</div>
                  <div>• GET /api/documents/user/</div>
                  <div>• POST /api/scoring/calculate/</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. CORS Configuration</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Ensure CORS is configured to allow requests from your frontend:
                </p>
                <CodeBlock language="python">
{`# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True`}
                </CodeBlock>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frontend" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Frontend Configuration
              </CardTitle>
              <CardDescription>Configure your React frontend for backend integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Environment Variables</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Create or update your .env.local file:
                </p>
                <CodeBlock>
{`# .env.local
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_TIMEOUT=10000
VITE_DEBUG_MODE=true`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Start Development Server</h4>
                <CodeBlock>
{`# Install dependencies
bun install

# Start the development server
bun run dev`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Current Configuration</h4>
                <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>API Base URL:</span>
                    <code>{import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <code>{import.meta.env.MODE}</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Debug Mode:</span>
                    <code>{import.meta.env.VITE_DEBUG_MODE || 'false'}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Testing Your Integration
              </CardTitle>
              <CardDescription>Verify that everything is working correctly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Backend Health Check</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Test if your backend is responding:
                </p>
                <CodeBlock>
{`curl -X GET http://localhost:8000/api/
# Should return 404 or other response (not connection error)`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Test Authentication</h4>
                <CodeBlock>
{`curl -X POST http://localhost:8000/api/auth/login/ \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com", "password": "password123"}'`}
                </CodeBlock>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Use the Backend Tester</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the built-in tester component to verify all endpoints:
                </p>
                <Button variant="outline" asChild>
                  <a href="/backend-tester">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Backend Tester
                  </a>
                </Button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">4. Monitor Backend Status</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Use the status monitor to check real-time backend health:
                </p>
                <Button variant="outline" asChild>
                  <a href="/status-monitor">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Status Monitor
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Common Issues
              </CardTitle>
              <CardDescription>Solutions to common integration problems</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Connection Refused:</strong> Make sure your Django server is running on port 8000.
                    Run: <code>python manage.py runserver 8000</code>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>CORS Error:</strong> Add your frontend URL to CORS_ALLOWED_ORIGINS in Django settings.
                    Include both localhost and 127.0.0.1 with the correct port.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>404 Errors:</strong> Verify your Django URL patterns include the API endpoints.
                    Check that your urls.py includes the API routes.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Authentication Issues:</strong> Ensure you're using the correct token format.
                    Django Rest Framework uses "Token your-token-here" in the Authorization header.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Database Errors:</strong> Run migrations and ensure your database is properly configured.
                    Check Django logs for specific error messages.
                  </AlertDescription>
                </Alert>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Debug Commands</h4>
                <CodeBlock>
{`# Check if Django is running
curl -I http://localhost:8000/

# Test a specific endpoint
curl -X GET http://localhost:8000/api/auth/profile/

# Check Django logs
python manage.py runserver 8000 --verbosity=2

# Reset database (if needed)
python manage.py flush
python manage.py migrate`}
                </CodeBlock>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
