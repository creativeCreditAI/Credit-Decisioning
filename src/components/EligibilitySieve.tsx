import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Link2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface EligibilityStep {
  id: string;
  title: string;
  titleSwahili: string;
  description: string;
  descriptionSwahili: string;
  status: "incomplete" | "complete" | "optional";
  required: boolean;
}

interface EligibilitySieveProps {
  language: "en" | "sw";
  onComplete: (data: any) => void;
}

export const EligibilitySieve = ({ language, onComplete }: EligibilitySieveProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessName: "",
    founderName: "",
    sector: "",
    websiteUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    portfolioUrl: "",
    businessDescription: "",
    hasBusinessDocs: false,
    hasFinancialRecords: false,
    digitalPresence: false,
  });

  const steps: EligibilityStep[] = [
    {
      id: "basic_info",
      title: "Basic Business Information",
      titleSwahili: "Maelezo ya Msingi ya Biashara",
      description: "Tell us about your creative business",
      descriptionSwahili: "Tuambie kuhusu biashara yako ya ubunifu",
      status: "incomplete",
      required: true
    },
    {
      id: "digital_presence",
      title: "Digital Presence",
      titleSwahili: "Uwepo wa Kidijitali",
      description: "Links to your online presence and portfolio",
      descriptionSwahili: "Viungo vya uwepo wako mtandaoni na kazi zako",
      status: "incomplete",
      required: true
    },
    {
      id: "documentation",
      title: "Document Readiness",
      titleSwahili: "Utayari wa Hati",
      description: "Available business and financial documentation",
      descriptionSwahili: "Hati za biashara na kifedha zinazopatikana",
      status: "incomplete",
      required: false
    }
  ];

  const calculateProgress = () => {
    const requiredSteps = steps.filter(step => step.required);
    const completedRequired = requiredSteps.filter(step => step.status === "complete");
    return (completedRequired.length / requiredSteps.length) * 100;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return formData.businessName && formData.founderName && formData.sector && formData.businessDescription;
      case 1:
        return formData.websiteUrl || formData.instagramUrl || formData.youtubeUrl || formData.portfolioUrl;
      case 2:
        return true; // Documentation step is optional
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      steps[currentStep].status = "complete";
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // All steps completed
        onComplete(formData);
      }
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "incomplete":
        return <XCircle className="w-5 h-5 text-muted-foreground" />;
      case "optional":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName">
                  {language === "en" ? "Business Name" : "Jina la Biashara"}
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                  placeholder={language === "en" ? "e.g., Grace Designs" : "mfano, Grace Designs"}
                />
              </div>
              <div>
                <Label htmlFor="founderName">
                  {language === "en" ? "Founder Name" : "Jina la Mwanzilishi"}
                </Label>
                <Input
                  id="founderName"
                  value={formData.founderName}
                  onChange={(e) => handleInputChange("founderName", e.target.value)}
                  placeholder={language === "en" ? "Your full name" : "Jina lako kamili"}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="sector">
                {language === "en" ? "Creative Sector" : "Sekta ya Ubunifu"}
              </Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => handleInputChange("sector", e.target.value)}
                placeholder={language === "en" ? "e.g., Fashion Design" : "mfano, Ubunifu wa Mavazi"}
              />
            </div>

            <div>
              <Label htmlFor="businessDescription">
                {language === "en" ? "Business Description" : "Maelezo ya Biashara"}
              </Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                placeholder={language === "en" 
                  ? "Describe your creative business, what you do, and your target market..."
                  : "Eleza biashara yako ya ubunifu, unachofanya, na soko lako lengwa..."
                }
                rows={4}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="websiteUrl">
                  {language === "en" ? "Website URL" : "Anwani ya Tovuti"}
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                    placeholder="https://your-website.com"
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="instagramUrl">
                  {language === "en" ? "Instagram Profile" : "Wasifu wa Instagram"}
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
                    placeholder="@your_handle"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="youtubeUrl">
                  {language === "en" ? "YouTube Channel" : "Kituo cha YouTube"}
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={(e) => handleInputChange("youtubeUrl", e.target.value)}
                    placeholder="youtube.com/channel/..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="portfolioUrl">
                  {language === "en" ? "Portfolio/Other" : "Kazi/Zingine"}
                </Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                    placeholder={language === "en" ? "Portfolio link" : "Kiungo cha kazi"}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {language === "en" 
                  ? "At least one digital presence link is required. This helps us verify your creative work and business activity."
                  : "Kiungo kimoja cha uwepo wa kidijitali kinahitajika. Hii inatusaidia kuthibitisha kazi yako ya ubunifu na shughuli za biashara."
                }
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasBusinessDocs"
                  checked={formData.hasBusinessDocs}
                  onChange={(e) => handleInputChange("hasBusinessDocs", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="hasBusinessDocs">
                  {language === "en" 
                    ? "I have business registration documents" 
                    : "Nina hati za usajili wa biashara"
                  }
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasFinancialRecords"
                  checked={formData.hasFinancialRecords}
                  onChange={(e) => handleInputChange("hasFinancialRecords", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="hasFinancialRecords">
                  {language === "en" 
                    ? "I have financial records (bank statements, revenue tracking)" 
                    : "Nina rekodi za kifedha (taarifa za benki, ufuatiliaji wa mapato)"
                  }
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="digitalPresence"
                  checked={formData.digitalPresence}
                  onChange={(e) => handleInputChange("digitalPresence", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="digitalPresence">
                  {language === "en" 
                    ? "I maintain active social media for my business" 
                    : "Ninashughulikia mitandao ya kijamii kwa biashara yangu"
                  }
                </Label>
              </div>
            </div>

            <div className="p-4 bg-info/10 rounded-lg">
              <p className="text-sm text-info">
                {language === "en" 
                  ? "Don't worry if you don't have formal documents yet. We understand that creative businesses often start informally. Your digital presence and work portfolio are equally valuable."
                  : "Usijali ikiwa bado huna hati rasmi. Tunaelewa kwamba biashara za ubunifu mara nyingi huanza kwa njia isiyo rasmi. Uwepo wako wa kidijitali na kazi zako ni muhimu sawa."
                }
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          {language === "en" ? "Eligibility Assessment" : "Tathmini ya Ustahiki"}
        </CardTitle>
        <CardDescription>
          {language === "en" 
            ? "Help us understand your creative business to provide the best credit assessment"
            : "Tusaidie kuelewa biashara yako ya ubunifu ili kupata tathmini bora ya mkopo"
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{language === "en" ? "Progress" : "Maendeleo"}</span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
        </div>

        {/* Steps Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-3 rounded-lg border ${
                index === currentStep ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getStepIcon(step.status)}
                <span className="font-medium text-sm">
                  {language === "en" ? step.title : step.titleSwahili}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {language === "en" ? step.description : step.descriptionSwahili}
              </p>
              {!step.required && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {language === "en" ? "Optional" : "Si lazima"}
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {language === "en" ? steps[currentStep]?.title : steps[currentStep]?.titleSwahili}
          </h3>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            {language === "en" ? "Previous" : "Iliyotangulia"}
          </Button>
          
          <Button
            onClick={nextStep}
            disabled={!validateStep(currentStep)}
          >
            {currentStep === steps.length - 1 
              ? (language === "en" ? "Complete Assessment" : "Maliza Tathmini")
              : (language === "en" ? "Next" : "Ifuatayo")
            }
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};