import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  FileX, 
  Users, 
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";

interface RiskFlag {
  id: string;
  type: "high" | "medium" | "low" | "info";
  title: string;
  titleSwahili: string;
  description: string;
  descriptionSwahili: string;
  category: "financial" | "behavioral" | "documentation" | "fraud" | "market";
  active: boolean;
  timestamp: Date;
}

interface RiskFlagsProps {
  flags: RiskFlag[];
  language: "en" | "sw";
  className?: string;
}

export const RiskFlags = ({ flags, language, className }: RiskFlagsProps) => {
  const getRiskIcon = (type: string) => {
    switch (type) {
      case "high":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "low":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "info":
        return <CheckCircle className="w-4 h-4 text-info" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getRiskColor = (type: string) => {
    switch (type) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      case "info":
        return "default";
      default:
        return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "financial":
        return <TrendingDown className="w-4 h-4" />;
      case "behavioral":
        return <Users className="w-4 h-4" />;
      case "documentation":
        return <FileX className="w-4 h-4" />;
      case "fraud":
        return <Shield className="w-4 h-4" />;
      case "market":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const activeFlags = flags.filter(flag => flag.active);
  const highRiskFlags = activeFlags.filter(flag => flag.type === "high");
  const mediumRiskFlags = activeFlags.filter(flag => flag.type === "medium");

  if (activeFlags.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            {language === "en" ? "Risk Assessment" : "Tathmini ya Hatari"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {language === "en" 
                ? "No active risk flags detected. Your application looks good!"
                : "Hakuna dalili za hatari zilizotambuliwa. Ombi lako linaonekana vizuri!"
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {language === "en" ? "Risk Flags" : "Dalili za Hatari"}
          <Badge variant={highRiskFlags.length > 0 ? "destructive" : "secondary"}>
            {activeFlags.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* High Risk Flags */}
        {highRiskFlags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-destructive flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              {language === "en" ? "High Risk" : "Hatari Kubwa"}
            </h4>
            {highRiskFlags.map((flag) => (
              <Alert key={flag.id} variant="destructive">
                <div className="flex items-start gap-2">
                  {getCategoryIcon(flag.category)}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="font-medium mb-1">
                        {language === "en" ? flag.title : flag.titleSwahili}
                      </div>
                      <div className="text-sm">
                        {language === "en" ? flag.description : flag.descriptionSwahili}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {flag.timestamp.toLocaleDateString()}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Medium Risk Flags */}
        {mediumRiskFlags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-warning flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {language === "en" ? "Medium Risk" : "Hatari ya Kati"}
            </h4>
            {mediumRiskFlags.map((flag) => (
              <Alert key={flag.id}>
                <div className="flex items-start gap-2">
                  {getCategoryIcon(flag.category)}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="font-medium mb-1">
                        {language === "en" ? flag.title : flag.titleSwahili}
                      </div>
                      <div className="text-sm">
                        {language === "en" ? flag.description : flag.descriptionSwahili}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {flag.timestamp.toLocaleDateString()}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        {/* Other Risk Flags */}
        {activeFlags.filter(flag => flag.type !== "high" && flag.type !== "medium").length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {language === "en" ? "Other Flags" : "Dalili Zingine"}
            </h4>
            {activeFlags
              .filter(flag => flag.type !== "high" && flag.type !== "medium")
              .map((flag) => (
                <div key={flag.id} className="flex items-start gap-2 p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(flag.type)}
                    {getCategoryIcon(flag.category)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {language === "en" ? flag.title : flag.titleSwahili}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === "en" ? flag.description : flag.descriptionSwahili}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {flag.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={getRiskColor(flag.type) as any} className="text-xs">
                    {flag.type.toUpperCase()}
                  </Badge>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
