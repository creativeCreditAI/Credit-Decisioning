import { useState, useEffect, useCallback } from "react";
import { HttpClient, TokenManager, NetworkStatus } from "../lib/api";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Wifi, 
  WifiOff, 
  Server, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Database,
  Shield,
  Activity
} from "lucide-react";

interface HealthCheck {
  endpoint: string;
  name: string;
  status: "healthy" | "unhealthy" | "checking";
  responseTime?: number;
  lastChecked?: Date;
  error?: string;
}

export const BackendStatusMonitor = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { endpoint: "/auth/validate-token/", name: "Authentication", status: "checking" },
    { endpoint: "/admin/dashboard/stats/", name: "Admin Services", status: "checking" },
    { endpoint: "/applications/user/", name: "Application Services", status: "checking" },
    { endpoint: "/documents/user/", name: "Document Services", status: "checking" },
    { endpoint: "/scoring/score/", name: "Credit Scoring", status: "checking" },
    { endpoint: "/chat/suggestions/", name: "Chat Services", status: "checking" },
  ]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const performHealthCheck = useCallback(async () => {
    if (!isOnline) return;

    setIsChecking(true);
    const results: HealthCheck[] = [];

    for (const check of healthChecks) {
      const startTime = Date.now();
      
      try {
        // For auth endpoint, only check if we have a token
        if (check.endpoint === "/auth/validate-token/" && !TokenManager.getToken()) {
          results.push({
            ...check,
            status: "unhealthy",
            error: "No authentication token",
            lastChecked: new Date(),
          });
          continue;
        }

        await HttpClient.get(check.endpoint);
        
        const responseTime = Date.now() - startTime;
        results.push({
          ...check,
          status: "healthy",
          responseTime,
          lastChecked: new Date(),
        });
      } catch (error) {
        results.push({
          ...check,
          status: "unhealthy",
          error: error instanceof Error ? error.message : "Unknown error",
          lastChecked: new Date(),
        });
      }
    }

    setHealthChecks(results);
    setLastUpdate(new Date());
    setIsChecking(false);
  }, [isOnline, healthChecks]);

  useEffect(() => {
    // Monitor network status
    const cleanup = NetworkStatus.onChange((online) => {
      setIsOnline(online);
      if (online) {
        performHealthCheck();
      }
    });

    // Initial health check
    performHealthCheck();

    // Set up periodic health checks (every 30 seconds)
    const interval = setInterval(performHealthCheck, 30000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [performHealthCheck]);

  const getOverallStatus = (): "healthy" | "unhealthy" | "partial" => {
    const healthy = healthChecks.filter(c => c.status === "healthy").length;
    const total = healthChecks.length;
    
    if (healthy === total) return "healthy";
    if (healthy === 0) return "unhealthy";
    return "partial";
  };

  const getStatusIcon = (status: HealthCheck["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "unhealthy":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "checking":
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusBadge = (status: HealthCheck["status"]) => {
    switch (status) {
      case "healthy":
        return <Badge variant="default" className="bg-green-500">Healthy</Badge>;
      case "unhealthy":
        return <Badge variant="destructive">Unhealthy</Badge>;
      case "checking":
        return <Badge variant="secondary">Checking...</Badge>;
    }
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Backend Status Monitor
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <div className="flex items-center gap-1">
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500">Offline</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={performHealthCheck}
              disabled={isChecking || !isOnline}
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Real-time status of backend services • Last updated: {lastUpdate.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Overall Status */}
        <div className="flex items-center justify-between mb-6 p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Overall Backend Status</h3>
              <p className="text-sm text-muted-foreground">
                {healthChecks.filter(c => c.status === "healthy").length} of {healthChecks.length} services healthy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {overallStatus === "healthy" && (
              <Badge variant="default" className="bg-green-500">All Systems Operational</Badge>
            )}
            {overallStatus === "partial" && (
              <Badge variant="secondary" className="bg-yellow-500">Partial Outage</Badge>
            )}
            {overallStatus === "unhealthy" && (
              <Badge variant="destructive">Service Disruption</Badge>
            )}
          </div>
        </div>

        {/* Service Status List */}
        <div className="space-y-3">
          {healthChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <h4 className="font-medium">{check.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {check.endpoint}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {check.responseTime && (
                  <span className="text-sm text-muted-foreground">
                    {check.responseTime}ms
                  </span>
                )}
                {getStatusBadge(check.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Authentication Status */}
        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4" />
            <h4 className="font-medium">Authentication Status</h4>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>Token Available:</span>
              <Badge variant={TokenManager.getToken() ? "default" : "secondary"}>
                {TokenManager.getToken() ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Token Valid:</span>
              <Badge variant={TokenManager.isTokenValid() ? "default" : "destructive"}>
                {TokenManager.isTokenValid() ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {healthChecks.some(c => c.status === "unhealthy") && (
          <div className="mt-4 space-y-2">
            {healthChecks
              .filter(c => c.status === "unhealthy")
              .map((check, index) => (
                <Alert key={index} variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{check.name}:</strong> {check.error}
                  </AlertDescription>
                </Alert>
              ))}
          </div>
        )}

        {/* Network Offline Warning */}
        {!isOnline && (
          <Alert className="mt-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're currently offline. Some features may not work properly until connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {/* API Configuration Info */}
        <div className="mt-6 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4" />
            <h4 className="font-medium">Configuration</h4>
          </div>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span>API Base URL:</span>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}
              </code>
            </div>
            <div className="flex justify-between">
              <span>Environment:</span>
              <Badge variant="outline">
                {import.meta.env.MODE || 'development'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Debug Mode:</span>
              <Badge variant={import.meta.env.VITE_DEBUG_MODE === 'true' ? "default" : "secondary"}>
                {import.meta.env.VITE_DEBUG_MODE === 'true' ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
