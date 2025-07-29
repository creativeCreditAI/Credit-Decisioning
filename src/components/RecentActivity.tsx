import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  CheckCircle,
  AlertCircle,
  Clock,
  Smartphone,
  Building2,
  Zap
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "score_change" | "data_sync" | "recommendation" | "achievement" | "alert";
  title: string;
  titleSwahili: string;
  description: string;
  descriptionSwahili: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
  value?: string;
  valueSwahili?: string;
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  language?: "en" | "sw";
  className?: string;
}

const defaultActivities: ActivityItem[] = [
  {
    id: "sync-mpesa",
    type: "data_sync",
    title: "M-Pesa data synced",
    titleSwahili: "Data ya M-Pesa imesasishwa",
    description: "Latest transactions imported successfully",
    descriptionSwahili: "Miamala ya hivi karibuni imeingizwa kwa ufanisi",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    icon: <Smartphone className="w-4 h-4" />,
    color: "text-blue-600 bg-blue-100"
  },
  {
    id: "score-increase",
    type: "score_change",
    title: "Credit score increased",
    titleSwahili: "Alama za mkopo zimeongezeka",
    description: "Your score improved this month",
    descriptionSwahili: "Alama zako zimeboresha mwezi huu",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    icon: <TrendingUp className="w-4 h-4" />,
    color: "text-green-600 bg-green-100",
    value: "+12 points",
    valueSwahili: "+alama 12"
  },
  {
    id: "new-tip",
    type: "recommendation",
    title: "New improvement tip available",
    titleSwahili: "Kidokezo kipya cha kuboresha kimepatikana",
    description: "Connect your bank account for better scoring",
    descriptionSwahili: "Unganisha akaunti ya benki kwa alama bora",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    icon: <Lightbulb className="w-4 h-4" />,
    color: "text-yellow-600 bg-yellow-100"
  },
  {
    id: "milestone",
    type: "achievement",
    title: "Milestone reached",
    titleSwahili: "Hatua muhimu imefikiwa",
    description: "You've completed 75% of recommendations",
    descriptionSwahili: "Umekamilisha 75% ya mapendekezo",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-purple-600 bg-purple-100"
  },
  {
    id: "payment-reminder",
    type: "alert",
    title: "Payment reminder",
    titleSwahili: "Ukumbusho wa malipo",
    description: "KPLC bill due in 3 days",
    descriptionSwahili: "Bili ya KPLC inakamilika siku 3",
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    icon: <Zap className="w-4 h-4" />,
    color: "text-orange-600 bg-orange-100"
  }
];

const getTimeAgo = (date: Date, language: "en" | "sw"): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (language === "en") {
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  } else {
    if (diffInHours < 1) return "Sasa hivi";
    if (diffInHours < 24) return `Masaa ${diffInHours} yaliyopita`;
    if (diffInDays < 7) return `Siku ${diffInDays} zilizopita`;
    if (diffInDays < 30) return `Wiki ${Math.floor(diffInDays / 7)} zilizopita`;
    return `Miezi ${Math.floor(diffInDays / 30)} iliyopita`;
  }
};

const getActivityBadge = (type: ActivityItem["type"], language: "en" | "sw") => {
  const typeConfig = {
    score_change: {
      text: language === "en" ? "Score" : "Alama",
      variant: "default" as const
    },
    data_sync: {
      text: language === "en" ? "Sync" : "Usasishaji",
      variant: "secondary" as const
    },
    recommendation: {
      text: language === "en" ? "Tip" : "Kidokezo",
      variant: "outline" as const
    },
    achievement: {
      text: language === "en" ? "Achievement" : "Mafanikio",
      variant: "default" as const
    },
    alert: {
      text: language === "en" ? "Alert" : "Onyo",
      variant: "destructive" as const
    }
  };

  const config = typeConfig[type];
  return (
    <Badge variant={config.variant} className="text-xs">
      {config.text}
    </Badge>
  );
};

export const RecentActivity = ({
  activities = defaultActivities,
  language = "en",
  className
}: RecentActivityProps) => {
  return (
    <Card className={cn("", className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {language === "en" ? "Recent Activity" : "Shughuli za Hivi Karibuni"}
          </h3>
          <RefreshCw className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
        </div>

        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-4 p-3 rounded-lg transition-all duration-200 hover:bg-muted/50",
                index !== activities.length - 1 && "border-b border-border/50 pb-4"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                activity.color
              )}>
                {activity.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">
                        {language === "en" ? activity.title : activity.titleSwahili}
                      </h4>
                      {getActivityBadge(activity.type, language)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {language === "en" ? activity.description : activity.descriptionSwahili}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {getTimeAgo(activity.timestamp, language)}
                      </div>
                      
                      {activity.value && (
                        <Badge variant="outline" className="text-xs">
                          {language === "en" ? activity.value : activity.valueSwahili}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              {language === "en" 
                ? "No recent activity. Start connecting your accounts to see updates here." 
                : "Hakuna shughuli za hivi karibuni. Anza kuunganisha akaunti zako kuona masasisho hapa."
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};