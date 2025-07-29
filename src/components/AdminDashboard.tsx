import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
  MapPin
} from "lucide-react";

interface AdminDashboardProps {
  language: "en" | "sw";
}

export const AdminDashboard = ({ language }: AdminDashboardProps) => {
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30d");

  // Mock data for admin dashboard
  const dashboardStats = {
    totalApplications: 147,
    approvedApplications: 89,
    pendingReview: 23,
    totalFunded: 1250000,
    averageScore: 678,
    riskAlerts: 8,
    sectorDistribution: [
      { sector: "Fashion Design", count: 45, avgScore: 725, fundedAmount: 450000 },
      { sector: "Digital Media", count: 32, avgScore: 698, fundedAmount: 320000 },
      { sector: "Music Production", count: 28, avgScore: 652, fundedAmount: 280000 },
      { sector: "Visual Arts", count: 25, avgScore: 643, fundedAmount: 125000 },
      { sector: "Film & Video", count: 17, avgScore: 689, fundedAmount: 75000 }
    ],
    recentApplications: [
      {
        id: "APP-2024-001",
        founderName: "Grace Wanjiku",
        businessName: "Grace Designs",
        sector: "Fashion Design",
        score: 742,
        tier: "A",
        status: "approved",
        amount: 150000,
        submittedAt: new Date("2024-01-15"),
        riskFlags: 0
      },
      {
        id: "APP-2024-002", 
        founderName: "James Mwenda",
        businessName: "Nairobi Beats",
        sector: "Music Production",
        score: 658,
        tier: "B",
        status: "pending",
        amount: 75000,
        submittedAt: new Date("2024-01-14"),
        riskFlags: 2
      },
      {
        id: "APP-2024-003",
        founderName: "Sarah Kimani",
        businessName: "Digital Stories KE",
        sector: "Digital Media",
        score: 695,
        tier: "B",
        status: "conditional",
        amount: 100000,
        submittedAt: new Date("2024-01-13"),
        riskFlags: 1
      }
    ]
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === "en" ? "HEVA Admin Dashboard" : "Dashibodi ya Msimamizi wa HEVA"}
          </h1>
          <p className="text-muted-foreground">
            {language === "en" 
              ? "Credit decisioning platform analytics and management"
              : "Uchambuzi na usimamizi wa jukwaa la uamuzi wa mikopo"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            {language === "en" ? "Export" : "Hamisha"}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            {language === "en" ? "Settings" : "Mipangilio"}
          </Button>
        </div>
      </div>

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

      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">
            {language === "en" ? "Applications" : "Maombi"}
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
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                {language === "en" ? "Recent Applications" : "Maombi ya Hivi Karibuni"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardStats.recentApplications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{app.founderName}</div>
                        <div className="text-sm text-muted-foreground">{app.businessName}</div>
                        <div className="text-xs text-muted-foreground">{app.id}</div>
                      </div>
                      <div className="text-center">
                        <Badge className={`${getTierColor(app.tier)}`}>
                          {language === "en" ? `Tier ${app.tier}` : `Kiwango ${app.tier}`}
                        </Badge>
                        <div className="text-sm font-medium mt-1">{app.score}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">KES {app.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{app.sector}</div>
                      </div>
                      
                      <Badge variant={getStatusColor(app.status) as any}>
                        {app.status}
                      </Badge>
                      
                      {app.riskFlags > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {app.riskFlags} {language === "en" ? "flags" : "dalili"}
                        </Badge>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        {language === "en" ? "Review" : "Kagua"}
                      </Button>
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
                <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="font-medium text-destructive">High Risk Alert</span>
                    <Badge variant="destructive">New</Badge>
                  </div>
                  <p className="text-sm">
                    Multiple applications from similar business profiles detected. Potential fraud pattern identified.
                  </p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      {language === "en" ? "Investigate" : "Chunguza"}
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-warning" />
                    <span className="font-medium text-warning">Score Drift Alert</span>
                  </div>
                  <p className="text-sm">
                    Average sector scores dropping for Fashion Design sector. Model may need recalibration.
                  </p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      {language === "en" ? "Review Model" : "Kagua Muundo"}
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-info/20 bg-info/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-info" />
                    <span className="font-medium text-info">Behavioral Alert</span>
                  </div>
                  <p className="text-sm">
                    15% increase in late document submissions this month. Consider sending reminder communications.
                  </p>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      {language === "en" ? "Send Reminders" : "Tuma Vikumbusho"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};