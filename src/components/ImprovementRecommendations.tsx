import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  Star
} from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  titleSwahili: string;
  description: string;
  descriptionSwahili: string;
  impact: "high" | "medium" | "low";
  estimatedPoints: number;
  timeframe: string;
  timeframeSwahili: string;
  category: "payment" | "account" | "behavior" | "documentation" | "diversification";
  completed: boolean;
  actionSteps: string[];
  actionStepsSwahili: string[];
}

interface ImprovementRecommendationsProps {
  recommendations: Recommendation[];
  onMarkComplete: (id: string) => void;
  language?: "en" | "sw";
  className?: string;
}

const defaultRecommendations: Recommendation[] = [
  {
    id: "consistent-mpesa",
    title: "Maintain Consistent M-Pesa Activity",
    titleSwahili: "Endelea na Shughuli za M-Pesa kwa Uthabiti",
    description: "Regular M-Pesa transactions show financial stability and improve your payment history score.",
    descriptionSwahili: "Miamala ya kawaida ya M-Pesa inaonyesha uthabiti wa kifedha na kuboresha alama za historia ya malipo.",
    impact: "high",
    estimatedPoints: 25,
    timeframe: "2-3 months",
    timeframeSwahili: "miezi 2-3",
    category: "payment",
    completed: false,
    actionSteps: [
      "Use M-Pesa for at least 10 transactions per month",
      "Keep a minimum balance of KES 500",
      "Avoid bounced transactions or insufficient funds",
      "Use M-Pesa for utility payments when possible"
    ],
    actionStepsSwahili: [
      "Tumia M-Pesa kwa miamala angalau 10 kwa mwezi",
      "Weka salio la angalau KES 500",
      "Epuka miamala iliyokataliwa au ukosefu wa fedha",
      "Tumia M-Pesa kulipa bili za huduma inapowezekana"
    ]
  },
  {
    id: "bank-connection",
    title: "Connect Your Bank Account",
    titleSwahili: "Unganisha Akaunti ya Benki",
    description: "Adding bank account data provides a more complete financial picture and boosts your creditworthiness.",
    descriptionSwahili: "Kuongeza data ya akaunti ya benki hutoa picha kamili zaidi ya kifedha na kuongeza uongozi wako wa mkopo.",
    impact: "high",
    estimatedPoints: 35,
    timeframe: "Immediate",
    timeframeSwahili: "Mara moja",
    category: "account",
    completed: false,
    actionSteps: [
      "Link your primary bank account",
      "Ensure account has 3+ months of history",
      "Maintain regular deposit patterns",
      "Keep account in good standing"
    ],
    actionStepsSwahili: [
      "Unganisha akaunti yako kuu ya benki",
      "Hakikisha akaunti ina historia ya miezi 3+",
      "Endelea na mifumo ya amana ya kawaida",
      "Weka akaunti katika hali nzuri"
    ]
  },
  {
    id: "utility-payments",
    title: "Set Up Automatic Utility Payments",
    titleSwahili: "Weka Malipo ya Otomatiki ya Huduma",
    description: "Regular, on-time utility payments demonstrate financial responsibility and reliability.",
    descriptionSwahili: "Malipo ya kawaida ya huduma kwa wakati unaonyesha uwajibikaji wa kifedha na kuaminika.",
    impact: "medium",
    estimatedPoints: 20,
    timeframe: "1-2 months",
    timeframeSwahili: "miezi 1-2",
    category: "payment",
    completed: false,
    actionSteps: [
      "Connect utility payment history",
      "Set up automatic payments for KPLC",
      "Include water and internet bills",
      "Ensure payments are made before due dates"
    ],
    actionStepsSwahili: [
      "Unganisha historia ya malipo ya huduma",
      "Weka malipo ya otomatiki kwa KPLC",
      "Jumuisha bili za maji na mtandao",
      "Hakikisha malipo yanafanywa kabla ya tarehe za mwisho"
    ]
  },
  {
    id: "business-documentation",
    title: "Upload Business Registration Documents",
    titleSwahili: "Pakia Hati za Usajili wa Biashara",
    description: "Formal business registration shows legitimacy and can significantly improve your business credit profile.",
    descriptionSwahili: "Usajili rasmi wa biashara unaonyesha halali na unaweza kuboresha kwa kiasi kikubwa wasifu wako wa mkopo wa biashara.",
    impact: "high",
    estimatedPoints: 30,
    timeframe: "Immediate",
    timeframeSwahili: "Mara moja",
    category: "documentation",
    completed: false,
    actionSteps: [
      "Register your business with relevant authorities",
      "Upload business permit or license",
      "Provide tax compliance certificate",
      "Include any professional certifications"
    ],
    actionStepsSwahili: [
      "Sajili biashara yako na mamlaka husika",
      "Pakia kibali cha biashara au leseni",
      "Toa cheti cha ufuatiliaji wa ushuru",
      "Jumuisha vyeti vyoyote vya kitaalamu"
    ]
  }
];

const getImpactBadge = (impact: Recommendation["impact"], language: "en" | "sw") => {
  const impactConfig = {
    high: {
      color: "bg-success text-white",
      text: language === "en" ? "High Impact" : "Athari Kubwa",
      icon: <Star className="w-3 h-3" />
    },
    medium: {
      color: "bg-warning text-white",
      text: language === "en" ? "Medium Impact" : "Athari ya Kati",
      icon: <TrendingUp className="w-3 h-3" />
    },
    low: {
      color: "bg-info text-white",
      text: language === "en" ? "Low Impact" : "Athari Ndogo",
      icon: <Target className="w-3 h-3" />
    }
  };

  const config = impactConfig[impact];
  return (
    <Badge className={cn("flex items-center gap-1", config.color)}>
      {config.icon}
      {config.text}
    </Badge>
  );
};

export const ImprovementRecommendations = ({
  recommendations = defaultRecommendations,
  onMarkComplete,
  language = "en",
  className
}: ImprovementRecommendationsProps) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const completedCount = recommendations.filter(r => r.completed).length;
  const totalPotentialPoints = recommendations
    .filter(r => !r.completed)
    .reduce((sum, r) => sum + r.estimatedPoints, 0);

  const toggleExpanded = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  // Sort: incomplete high-impact first, then by estimated points
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    if (a.impact !== b.impact) {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return impactOrder[a.impact] - impactOrder[b.impact];
    }
    return b.estimatedPoints - a.estimatedPoints;
  });

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-dark mb-2">
          {language === "en" ? "Improve Your Score" : "Boresha Alama Yako"}
        </h2>
        <p className="text-muted-foreground mb-4">
          {language === "en" 
            ? "Follow these recommendations to boost your credit score" 
            : "Fuata mapendekezo haya kuboresha alama za mkopo"
          }
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {completedCount}/{recommendations.length}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === "en" ? "Completed" : "Zimekamilika"}
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-orange mb-1">
                +{totalPotentialPoints}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === "en" ? "Potential Points" : "Alama Zinazowezekana"}
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {Math.round((completedCount / recommendations.length) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {language === "en" ? "Progress" : "Maendeleo"}
              </div>
            </div>
          </Card>
        </div>

        <Progress 
          value={(completedCount / recommendations.length) * 100} 
          className="w-full h-2 mb-2"
        />
        <p className="text-sm text-muted-foreground">
          {language === "en" 
            ? `${completedCount} of ${recommendations.length} recommendations completed`
            : `Mapendekezo ${completedCount} kati ya ${recommendations.length} yamekamilika`
          }
        </p>
      </div>

      <div className="space-y-4">
        {sortedRecommendations.map((recommendation) => (
          <Card 
            key={recommendation.id} 
            className={cn(
              "transition-all duration-200",
              recommendation.completed && "opacity-75 bg-success/5",
              expandedCard === recommendation.id && "ring-2 ring-primary/20"
            )}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {recommendation.completed && (
                      <CheckCircle className="w-5 h-5 text-success" />
                    )}
                    <h3 className={cn(
                      "font-semibold text-lg",
                      recommendation.completed && "line-through text-muted-foreground"
                    )}>
                      {language === "en" ? recommendation.title : recommendation.titleSwahili}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-3">
                    {language === "en" ? recommendation.description : recommendation.descriptionSwahili}
                  </p>
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    {getImpactBadge(recommendation.impact, language)}
                    
                    <Badge variant="outline" className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +{recommendation.estimatedPoints} {language === "en" ? "points" : "alama"}
                    </Badge>
                    
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {language === "en" ? recommendation.timeframe : recommendation.timeframeSwahili}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleExpanded(recommendation.id)}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {language === "en" ? "Details" : "Maelezo"}
                  </Button>
                  
                  {!recommendation.completed && (
                    <Button
                      size="sm"
                      onClick={() => onMarkComplete(recommendation.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {language === "en" ? "Mark Done" : "Alama Imekamilika"}
                    </Button>
                  )}
                </div>
              </div>

              {expandedCard === recommendation.id && (
                <div className="border-t pt-4 fade-in">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    {language === "en" ? "Action Steps:" : "Hatua za Kitendo:"}
                  </h4>
                  <ul className="space-y-2">
                    {(language === "en" ? recommendation.actionSteps : recommendation.actionStepsSwahili).map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {totalPotentialPoints > 0 && (
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">
              {language === "en" ? "Boost Your Score Today!" : "Ongeza Alama Zako Leo!"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "en" 
                ? `Complete all recommendations to potentially gain ${totalPotentialPoints} points and improve your credit tier.`
                : `Kamiliaa mapendekezo yote ili uweze kupata alama ${totalPotentialPoints} na kuboresha kiwango chako cha mkopo.`
              }
            </p>
            <Button className="bg-gradient-to-r from-primary to-primary-green text-white">
              {language === "en" ? "Get Started" : "Anza"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};