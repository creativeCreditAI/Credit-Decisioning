import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle,
  Star,
  Target,
  ArrowRight
} from "lucide-react";

interface ScoreFactor {
  category: string;
  categorySwahili: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  description: string;
  descriptionSwahili: string;
  points: number;
}

interface NarrativeRationaleProps {
  score: number;
  tier: "A" | "B" | "C" | "D";
  factors: ScoreFactor[];
  narrative: {
    summary: string;
    summarySwahili: string;
    decision: "approved" | "conditional" | "rejected";
    decisionReason: string;
    decisionReasonSwahili: string;
    nextSteps: string[];
    nextStepsSwahili: string[];
  };
  language: "en" | "sw";
  className?: string;
}

export const NarrativeRationale = ({ 
  score, 
  tier, 
  factors, 
  narrative, 
  language, 
  className 
}: NarrativeRationaleProps) => {
  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "conditional":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case "rejected":
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "approved":
        return "success";
      case "conditional":
        return "secondary";
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

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      case "neutral":
        return <Target className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const positiveFactors = factors.filter(f => f.impact === "positive");
  const negativeFactors = factors.filter(f => f.impact === "negative");
  const neutralFactors = factors.filter(f => f.impact === "neutral");

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {language === "en" ? "Credit Assessment Summary" : "Muhtasari wa Tathmini ya Mkopo"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score and Decision Summary */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{score}</div>
              <div className="text-sm text-muted-foreground">
                {language === "en" ? "Credit Score" : "Alama za Mkopo"}
              </div>
            </div>
            <div className="text-center">
              <Badge className={`text-lg px-3 py-1 ${getTierColor(tier)}`}>
                {language === "en" ? `Tier ${tier}` : `Kiwango ${tier}`}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                {language === "en" ? "Funding Tier" : "Kiwango cha Ufadhili"}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getDecisionIcon(narrative.decision)}
            <Badge variant={getDecisionColor(narrative.decision) as any}>
              {narrative.decision.charAt(0).toUpperCase() + narrative.decision.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Star className="w-4 h-4" />
            {language === "en" ? "Assessment Summary" : "Muhtasari wa Tathmini"}
          </h3>
          <p className="text-sm leading-relaxed p-3 bg-muted/50 rounded-lg">
            {language === "en" ? narrative.summary : narrative.summarySwahili}
          </p>
          
          <div className="p-3 border-l-4 border-primary bg-primary/5">
            <h4 className="font-medium text-sm mb-1">
              {language === "en" ? "Decision Rationale" : "Sababu za Uamuzi"}
            </h4>
            <p className="text-sm">
              {language === "en" ? narrative.decisionReason : narrative.decisionReasonSwahili}
            </p>
          </div>
        </div>

        {/* Scoring Factors */}
        <div className="space-y-4">
          <h3 className="font-semibold">
            {language === "en" ? "Scoring Breakdown" : "Uchambuzi wa Alama"}
          </h3>

          {/* Positive Factors */}
          {positiveFactors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-success flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {language === "en" ? "Positive Factors" : "Mambo Mazuri"}
              </h4>
              {positiveFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2">
                    {getImpactIcon(factor.impact)}
                    <div>
                      <div className="text-sm font-medium">
                        {language === "en" ? factor.category : factor.categorySwahili}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === "en" ? factor.description : factor.descriptionSwahili}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-success">
                    +{factor.points}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Negative Factors */}
          {negativeFactors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                {language === "en" ? "Areas for Improvement" : "Maeneo ya Kuboresha"}
              </h4>
              {negativeFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2">
                    {getImpactIcon(factor.impact)}
                    <div>
                      <div className="text-sm font-medium">
                        {language === "en" ? factor.category : factor.categorySwahili}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === "en" ? factor.description : factor.descriptionSwahili}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-destructive">
                    {factor.points}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Neutral Factors */}
          {neutralFactors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                {language === "en" ? "Neutral Factors" : "Mambo ya Kawaida"}
              </h4>
              {neutralFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/30 border">
                  <div className="flex items-center gap-2">
                    {getImpactIcon(factor.impact)}
                    <div>
                      <div className="text-sm font-medium">
                        {language === "en" ? factor.category : factor.categorySwahili}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {language === "en" ? factor.description : factor.descriptionSwahili}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {factor.points}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            {language === "en" ? "Next Steps" : "Hatua Zinazofuata"}
          </h3>
          <div className="space-y-2">
            {(language === "en" ? narrative.nextSteps : narrative.nextStepsSwahili).map((step, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mt-0.5">
                  {index + 1}
                </div>
                <p className="flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t">
          <Button className="w-full">
            {narrative.decision === "approved" && (language === "en" ? "Proceed to Loan Application" : "Endelea na Ombi la Mkopo")}
            {narrative.decision === "conditional" && (language === "en" ? "Complete Requirements" : "Timiza Mahitaji")}
            {narrative.decision === "rejected" && (language === "en" ? "Improve and Reapply" : "Boresha na Omba Tena")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};