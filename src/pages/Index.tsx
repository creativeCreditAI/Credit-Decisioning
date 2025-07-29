import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { CreditScoreDisplay } from "@/components/CreditScoreDisplay";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { AccountLinking } from "@/components/AccountLinking";
import { ImprovementRecommendations } from "@/components/ImprovementRecommendations";
import { SectorSelection } from "@/components/SectorSelection";
import { EligibilitySieve } from "@/components/EligibilitySieve";
import { RiskFlags } from "@/components/RiskFlags";
import { NarrativeRationale } from "@/components/NarrativeRationale";
import { AdminDashboard } from "@/components/AdminDashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowUpRight, 
  Shield, 
  Users, 
  TrendingUp,
  Award,
  Target,
  Calendar,
  MapPin,
  Settings
} from "lucide-react";

const Index = () => {
  const [language, setLanguage] = useState<"en" | "sw">("en");
  const [selectedSectors, setSelectedSectors] = useState<string[]>(["design"]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userRole, setUserRole] = useState<"founder" | "admin">("founder");
  const [showEligibility, setShowEligibility] = useState(false);

  // Mock user data
  const user = {
    name: "Grace Wanjiku",
    avatar: undefined,
    sectors: ["Design & Creative Services"],
    location: "Nairobi, Kenya",
    memberSince: "March 2024"
  };

  // Mock credit score data
  const creditScore = 742;
  const scoreChange = "+12";
  const lastUpdated = "2 hours ago";

  // Mock account providers
  const [accountProviders, setAccountProviders] = useState([
    {
      id: "mpesa",
      name: "M-Pesa",
      nameSwahili: "M-Pesa",
      icon: "📱",
      description: "Mobile money transactions and payment history",
      descriptionSwahili: "Miamala ya pesa za simu na historia ya malipo",
      status: "connected" as const,
      lastSync: new Date(),
      required: true
    },
    {
      id: "bank",
      name: "Bank Account",
      nameSwahili: "Akaunti ya Benki", 
      icon: "🏦",
      description: "Bank statements and transaction history",
      descriptionSwahili: "Taarifa za benki na historia ya miamala",
      status: "disconnected" as const,
      required: false
    },
    {
      id: "utilities",
      name: "Utility Payments",
      nameSwahili: "Malipo ya Huduma",
      icon: "⚡",
      description: "KPLC, water, and other utility payment records", 
      descriptionSwahili: "Rekodi za malipo ya KPLC, maji, na huduma zingine",
      status: "syncing" as const,
      required: false
    }
  ]);

  const handleLanguageChange = (newLanguage: "en" | "sw") => {
    setLanguage(newLanguage);
  };

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case "score-breakdown":
        setActiveTab("score-details");
        break;
      case "improve-score":
        setActiveTab("improvements");
        break;
      case "find-lenders":
        // Navigate to lenders page
        break;
      case "track-progress":
        setActiveTab("progress");
        break;
      default:
        console.log(`Action clicked: ${actionId}`);
    }
  };

  const handleAccountConnect = async (providerId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAccountProviders(prev => 
      prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, status: "connected", lastSync: new Date() }
          : provider
      )
    );
  };

  const handleAccountDisconnect = async (providerId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setAccountProviders(prev => 
      prev.map(provider => 
        provider.id === providerId 
          ? { ...provider, status: "disconnected", lastSync: undefined }
          : provider
      )
    );
  };

  const handleMarkComplete = (recommendationId: string) => {
    console.log(`Marking recommendation ${recommendationId} as complete`);
  };

  const connectedAccounts = accountProviders.filter(p => p.status === "connected").length;
  const completionPercentage = (connectedAccounts / accountProviders.length) * 100;

  // Mock data for enhanced features
  const mockRiskFlags = [
    {
      id: "flag-1",
      type: "medium" as const,
      title: "Inconsistent Revenue Reporting",
      titleSwahili: "Ripoti Zisizofanana za Mapato",
      description: "Revenue figures don't match across different data sources",
      descriptionSwahili: "Takwimu za mapato hazifanani katika vyanzo mbalimbali vya data",
      category: "financial" as const,
      active: true,
      timestamp: new Date()
    }
  ];

  const mockScoreFactors = [
    {
      category: "Digital Presence",
      categorySwahili: "Uwepo wa Kidijitali",
      impact: "positive" as const,
      weight: 0.25,
      description: "Strong Instagram following with regular engagement",
      descriptionSwahili: "Wafuasi wengi wa Instagram na ushirikiano wa kawaida",
      points: 85
    },
    {
      category: "Financial Consistency", 
      categorySwahili: "Uthabiti wa Kifedha",
      impact: "negative" as const,
      weight: 0.30,
      description: "Irregular income patterns over the last 6 months",
      descriptionSwahili: "Mifumo ya mapato isiyokuwa ya kawaida kwa miezi 6 iliyopita",
      points: -15
    }
  ];

  const mockNarrative = {
    summary: "Grace Designs shows strong creative potential with excellent digital presence and customer engagement. However, financial record keeping needs improvement to qualify for higher funding tiers.",
    summarySwahili: "Grace Designs inaonyesha uwezekano mkubwa wa ubunifu na uwepo mzuri wa kidijitali na ushirikiano wa wateja. Hata hivyo, uhifadhi wa rekodi za kifedha unahitaji kuboresha ili kustahili viwango vya juu vya ufadhili.",
    decision: "conditional" as const,
    decisionReason: "Application approved with conditions. Complete financial documentation required before fund disbursement.",
    decisionReasonSwahili: "Ombi limeidhinishwa kwa masharti. Hati kamili za kifedha zinahitajika kabla ya kutoa fedha.",
    nextSteps: [
      "Submit 6 months of M-Pesa statements", 
      "Provide business bank account statements if available",
      "Complete financial planning workshop",
      "Resubmit application for final review"
    ],
    nextStepsSwahili: [
      "Wasilisha taarifa za M-Pesa za miezi 6",
      "Toa taarifa za akaunti ya benki ya biashara ikiwa zinapatikana", 
      "Kamilisha warsha ya upangaji wa kifedha",
      "Wasilisha tena ombi kwa ukaguzi wa mwisho"
    ]
  };

  const handleEligibilityComplete = (data: any) => {
    console.log("Eligibility data:", data);
    setShowEligibility(false);
    setActiveTab("dashboard");
  };

  if (showEligibility) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <DashboardHeader 
          user={user}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EligibilitySieve 
            language={language}
            onComplete={handleEligibilityComplete}
          />
        </div>
      </div>
    );
  }

  if (userRole === "admin") {
    return (
      <div className="min-h-screen bg-neutral-light">
        <DashboardHeader 
          user={{ ...user, name: "James Mwangi - Investment Officer" }}
          language={language}
          onLanguageChange={handleLanguageChange}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AdminDashboard language={language} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light">
      <DashboardHeader 
        user={user}
        language={language}
        onLanguageChange={handleLanguageChange}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <Button
              variant={userRole === "founder" ? "default" : "outline"}
              size="sm"
              onClick={() => setUserRole("founder")}
            >
              {language === "en" ? "Founder View" : "Mwanzilishi"}
            </Button>
            <Button
              variant={userRole === "admin" ? "default" : "outline"}
              size="sm"
              onClick={() => setUserRole("admin")}
            >
              {language === "en" ? "Admin View" : "Msimamizi"}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEligibility(true)}
          >
            {language === "en" ? "Start New Application" : "Anza Ombi Jipya"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">
              {language === "en" ? "Dashboard" : "Dashibodi"}
            </TabsTrigger>
            <TabsTrigger value="score-details">
              {language === "en" ? "Score Details" : "Maelezo ya Alama"}
            </TabsTrigger>
            <TabsTrigger value="improvements">
              {language === "en" ? "Improve" : "Boresha"}
            </TabsTrigger>
            <TabsTrigger value="accounts">
              {language === "en" ? "Accounts" : "Akaunti"}
            </TabsTrigger>
            <TabsTrigger value="assessment">
              {language === "en" ? "Assessment" : "Tathmini"}
            </TabsTrigger>
            <TabsTrigger value="progress">
              {language === "en" ? "Progress" : "Maendeleo"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Hero Section with Credit Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Credit Score Display */}
              <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-card via-card to-primary/5">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  <CreditScoreDisplay score={creditScore} animated={true} />
                  
                  <div className="flex-1 text-center lg:text-left">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          {language === "en" ? "Your Credit Score" : "Alama Zako za Mkopo"}
                        </h2>
                        <p className="text-muted-foreground">
                          {language === "en" 
                            ? "Based on your financial behavior and creative industry data"
                            : "Kulingana na tabia yako ya kifedha na data ya tasnia ya ubunifu"
                          }
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                        <Badge variant="default" className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {scoreChange} {language === "en" ? "this month" : "mwezi huu"}
                        </Badge>
                        <Badge variant="outline">
                          {language === "en" ? "Updated" : "Imesasishwa"} {lastUpdated}
                        </Badge>
                        <Badge variant="outline">
                          <Shield className="w-3 h-3 mr-1" />
                          {language === "en" ? "Verified" : "Imehalalishwa"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="text-center lg:text-left">
                          <div className="text-2xl font-bold text-primary">
                            {accountProviders.filter(p => p.status === "connected").length}/{accountProviders.length}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {language === "en" ? "Accounts Connected" : "Akaunti Zilizounganishwa"}
                          </div>
                        </div>
                        <div className="text-center lg:text-left">
                          <div className="text-2xl font-bold text-accent-orange">
                            {Math.round(completionPercentage)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {language === "en" ? "Profile Complete" : "Wasifu Umekamilika"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Profile Summary */}
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center text-white text-xl font-bold">
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.location}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {user.sectors.map((sector, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {language === "en" ? "Member since" : "Mwanachama tangu"} {user.memberSince}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    {language === "en" ? "Edit Profile" : "Hariri Wasifu"}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <QuickActions 
              language={language}
              onActionClick={handleActionClick}
            />

            {/* Recent Activity */}
            <RecentActivity language={language} />
            
            {/* Risk Flags */}
            <RiskFlags 
              flags={mockRiskFlags} 
              language={language} 
            />
          </TabsContent>

          <TabsContent value="score-details" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {language === "en" ? "Credit Score Breakdown" : "Uchambuzi wa Alama za Mkopo"}
              </h2>
              {/* Score breakdown components would go here */}
              <div className="text-center py-12 text-muted-foreground">
                {language === "en" ? "Detailed score analysis coming soon..." : "Uchambuzi wa kina wa alama unakuja hivi karibuni..."}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="improvements" className="space-y-6">
            <ImprovementRecommendations 
              recommendations={[]} // Uses default recommendations from component
              language={language}
              onMarkComplete={handleMarkComplete}
            />
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <AccountLinking
              providers={accountProviders}
              onConnect={handleAccountConnect}
              onDisconnect={handleAccountDisconnect}
              language={language}
            />
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <NarrativeRationale
              score={creditScore}
              tier="B"
              factors={mockScoreFactors}
              narrative={mockNarrative}
              language={language}
            />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {language === "en" ? "Your Progress" : "Maendeleo Yako"}
              </h2>
              {/* Progress tracking components would go here */}
              <div className="text-center py-12 text-muted-foreground">
                {language === "en" ? "Progress tracking features coming soon..." : "Vipengele vya kufuatilia maendeleo vinakuja hivi karibuni..."}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
