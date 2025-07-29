import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Lightbulb, 
  Building2, 
  TrendingUp,
  ArrowRight,
  Target,
  Users,
  FileText
} from "lucide-react";

interface QuickAction {
  id: string;
  title: string;
  titleSwahili: string;
  description: string;
  descriptionSwahili: string;
  icon: React.ReactNode;
  color: string;
  href?: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  language?: "en" | "sw";
  onActionClick: (actionId: string) => void;
  className?: string;
}

const quickActions: QuickAction[] = [
  {
    id: "score-breakdown",
    title: "Score Breakdown",
    titleSwahili: "Uchambuzi wa Alama",
    description: "See detailed analysis of your credit score components",
    descriptionSwahili: "Ona uchambuzi wa kina wa vipengele vya alama za mkopo",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "improve-score",
    title: "Improve Score",
    titleSwahili: "Boresha Alama",
    description: "Get personalized tips to boost your creditworthiness",
    descriptionSwahili: "Pata vidokezo vya kibinafsi kuboresha uongozi wako wa mkopo",
    icon: <Lightbulb className="w-6 h-6" />,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "find-lenders",
    title: "Find Lenders",
    titleSwahili: "Tafuta Wakopeshaji",
    description: "Discover lenders who serve creative industries",
    descriptionSwahili: "Gundua wakopeshaji wanaohudumia viwanda vya ubunifu",
    icon: <Building2 className="w-6 h-6" />,
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "track-progress",
    title: "Track Progress",
    titleSwahili: "Fuatilia Maendeleo",
    description: "Monitor your credit score changes over time",
    descriptionSwahili: "Fuatilia mabadiliko ya alama za mkopo kwa muda",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "from-purple-500 to-purple-600"
  }
];

const additionalActions: QuickAction[] = [
  {
    id: "sector-insights",
    title: "Sector Insights",
    titleSwahili: "Maarifa ya Sekta",
    description: "See how your industry peers are performing",
    descriptionSwahili: "Ona jinsi wenzako wa tasnia wanavyofanya",
    icon: <Target className="w-5 h-5" />,
    color: "from-indigo-500 to-blue-600"
  },
  {
    id: "connect-peers",
    title: "Connect with Peers",
    titleSwahili: "Unganishana na Wenzako",
    description: "Network with other creative entrepreneurs",
    descriptionSwahili: "Unganishana na wajasiriamali wengine wa ubunifu",
    icon: <Users className="w-5 h-5" />,
    color: "from-pink-500 to-rose-600"
  },
  {
    id: "resources",
    title: "Learning Resources",
    titleSwahili: "Rasilimali za Kujifunza",
    description: "Access financial literacy materials",
    descriptionSwahili: "Pata nyenzo za ujuzi wa kifedha",
    icon: <FileText className="w-5 h-5" />,
    color: "from-teal-500 to-cyan-600"
  }
];

export const QuickActions = ({
  language = "en",
  onActionClick,
  className
}: QuickActionsProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Primary Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {language === "en" ? "Quick Actions" : "Vitendo vya Haraka"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.id}
              className="relative p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group"
              onClick={() => onActionClick(action.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={cn(
                    "w-12 h-12 rounded-lg bg-gradient-to-r mb-4 flex items-center justify-center text-white",
                    action.color
                  )}>
                    {action.icon}
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-2">
                    {language === "en" ? action.title : action.titleSwahili}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {language === "en" ? action.description : action.descriptionSwahili}
                  </p>
                </div>
                
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-2 mt-2" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Secondary Actions */}
      <div>
        <h4 className="text-md font-medium mb-3 text-muted-foreground">
          {language === "en" ? "Explore More" : "Chunguza Zaidi"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {additionalActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto p-4 justify-start group hover:border-primary/50"
              onClick={() => onActionClick(action.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={cn(
                  "w-8 h-8 rounded-md bg-gradient-to-r flex items-center justify-center text-white",
                  action.color
                )}>
                  {action.icon}
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">
                    {language === "en" ? action.title : action.titleSwahili}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {language === "en" ? action.description : action.descriptionSwahili}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};