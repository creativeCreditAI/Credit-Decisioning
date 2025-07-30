import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Upload, 
  Video, 
  Globe, 
  Instagram, 
  Youtube,
  Building2,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface BusinessProfileData {
  businessName: string;
  creatorSector: string;
  revenueRange: string;
  businessDescription: string;
  instagramHandle: string;
  youtubeUsername: string;
  websiteLink: string;
  pitchVideo?: File;
}

interface BusinessProfileFormProps {
  language?: "en" | "sw";
  onComplete?: (data: BusinessProfileData) => void;
}

export const BusinessProfileForm = ({ 
  language = "en", 
  onComplete 
}: BusinessProfileFormProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BusinessProfileData>({
    businessName: "",
    creatorSector: "",
    revenueRange: "",
    businessDescription: "",
    instagramHandle: "",
    youtubeUsername: "",
    websiteLink: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sectors = [
    { value: "design", label: language === "en" ? "Design & Creative Services" : "Huduma za Muundo na Ubunifu" },
    { value: "fashion", label: language === "en" ? "Fashion & Apparel" : "Mitindo na Mavazi" },
    { value: "music", label: language === "en" ? "Music & Audio" : "Muziki na Sauti" },
    { value: "video", label: language === "en" ? "Video & Film" : "Video na Filamu" },
    { value: "photography", label: language === "en" ? "Photography" : "Upigaji Picha" },
    { value: "writing", label: language === "en" ? "Writing & Content" : "Kuandika na Maudhui" },
    { value: "tech", label: language === "en" ? "Tech & Digital" : "Teknolojia na Kidijitali" },
    { value: "food", label: language === "en" ? "Food & Culinary" : "Chakula na Upishi" },
    { value: "art", label: language === "en" ? "Visual Arts" : "Sanaa za Kuona" },
    { value: "other", label: language === "en" ? "Other Creative" : "Ubunifu Mwingine" }
  ];

  const revenueRanges = [
    { value: "0-50000", label: language === "en" ? "KSH 0 - 50,000/month" : "KSH 0 - 50,000/mwezi" },
    { value: "50000-200000", label: language === "en" ? "KSH 50,000 - 200,000/month" : "KSH 50,000 - 200,000/mwezi" },
    { value: "200000-500000", label: language === "en" ? "KSH 200,000 - 500,000/month" : "KSH 200,000 - 500,000/mwezi" },
    { value: "500000-1000000", label: language === "en" ? "KSH 500,000 - 1,000,000/month" : "KSH 500,000 - 1,000,000/mwezi" },
    { value: "1000000+", label: language === "en" ? "KSH 1,000,000+/month" : "KSH 1,000,000+/mwezi" }
  ];

  const steps = [
    {
      id: 1,
      title: language === "en" ? "Basic Information" : "Maelezo ya Msingi",
      description: language === "en" ? "Tell us about your business" : "Tuambie kuhusu biashara yako",
      fields: ["businessName", "creatorSector", "revenueRange"]
    },
    {
      id: 2,
      title: language === "en" ? "Business Description" : "Maelezo ya Biashara",
      description: language === "en" ? "Describe what you do" : "Elezea unachofanya",
      fields: ["businessDescription"]
    },
    {
      id: 3,
      title: language === "en" ? "Online Presence" : "Uwepo wa Mtandaoni",
      description: language === "en" ? "Your digital footprint" : "Alama yako ya kidijitali",
      fields: ["instagramHandle", "youtubeUsername", "websiteLink"]
    },
    {
      id: 4,
      title: language === "en" ? "Pitch Video (Optional)" : "Video ya Uwasilishaji (Hiari)",
      description: language === "en" ? "Show us your story" : "Tutonyeshe hadithi yako",
      fields: ["pitchVideo"]
    }
  ];

  const totalSteps = steps.length;
  const progress = (currentStep / totalSteps) * 100;

  const currentStepData = steps.find(step => step.id === currentStep);

  const isCurrentStepValid = () => {
    if (!currentStepData) return false;
    
    return currentStepData.fields.every(field => {
      if (field === "pitchVideo") return true; // Optional field
      return formData[field as keyof BusinessProfileData] !== "";
    });
  };

  const handleFieldChange = (field: string, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert(language === "en" ? "Please select a video file" : "Tafadhali chagua faili ya video");
        return;
      }
      
      // Validate file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert(language === "en" ? "File size must be less than 100MB" : "Ukubwa wa faili lazima uwe chini ya 100MB");
        return;
      }
      
      handleFieldChange("pitchVideo", file);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitBusinessProfile = async (data: BusinessProfileData): Promise<void> => {
    // 🔌 Placeholder for backend call
    console.log("Submitting business profile:", data);
    
    // Simulate API call with progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Store in localStorage for demo purposes
    localStorage.setItem("businessProfile", JSON.stringify(data));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await submitBusinessProfile(formData);
      
      if (onComplete) {
        onComplete(formData);
      }
      
      // Navigate to document upload
      navigate("/document-upload");
    } catch (error) {
      console.error("Error submitting business profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (fieldName: string) => {
    switch (fieldName) {
      case "businessName":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {language === "en" ? "Business Name" : "Jina la Biashara"} *
            </Label>
            <Input
              id={fieldName}
              value={formData.businessName}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={language === "en" ? "Enter your business name" : "Ingiza jina la biashara yako"}
            />
          </div>
        );

      case "creatorSector":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {language === "en" ? "Creator Sector" : "Sekta ya Muundaji"} *
            </Label>
            <Select value={formData.creatorSector} onValueChange={(value) => handleFieldChange(fieldName, value)}>
              <SelectTrigger>
                <SelectValue placeholder={language === "en" ? "Select your sector" : "Chagua sekta yako"} />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector.value} value={sector.value}>
                    {sector.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "revenueRange":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {language === "en" ? "Monthly Revenue Range" : "Mipaka ya Mapato ya Mwezi"} *
            </Label>
            <Select value={formData.revenueRange} onValueChange={(value) => handleFieldChange(fieldName, value)}>
              <SelectTrigger>
                <SelectValue placeholder={language === "en" ? "Select revenue range" : "Chagua mipaka ya mapato"} />
              </SelectTrigger>
              <SelectContent>
                {revenueRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "businessDescription":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {language === "en" ? "Business Description" : "Maelezo ya Biashara"} *
            </Label>
            <Textarea
              id={fieldName}
              value={formData.businessDescription}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={language === "en" 
                ? "Describe your business, services, target audience, and unique value proposition..."
                : "Elezea biashara yako, huduma, wasikilizaji walengwa, na pendekezo la thamani ya kipekee..."
              }
              rows={6}
            />
            <div className="text-xs text-muted-foreground">
              {language === "en" 
                ? "Minimum 100 characters recommended"
                : "Kiwango cha chini cha herufi 100 kunapendekezwa"
              }
            </div>
          </div>
        );

      case "instagramHandle":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="flex items-center gap-2">
              <Instagram className="w-4 h-4" />
              {language === "en" ? "Instagram Handle" : "Jina la Instagram"}
            </Label>
            <Input
              id={fieldName}
              value={formData.instagramHandle}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={language === "en" ? "@username" : "@jina_la_tumiaji"}
            />
          </div>
        );

      case "youtubeUsername":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="flex items-center gap-2">
              <Youtube className="w-4 h-4" />
              {language === "en" ? "YouTube Username" : "Jina la Tumiaji wa YouTube"}
            </Label>
            <Input
              id={fieldName}
              value={formData.youtubeUsername}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={language === "en" ? "YouTube channel name" : "Jina la kituo cha YouTube"}
            />
          </div>
        );

      case "websiteLink":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {language === "en" ? "Website Link" : "Kiungo cha Tovuti"}
            </Label>
            <Input
              id={fieldName}
              value={formData.websiteLink}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              placeholder={language === "en" ? "https://yourwebsite.com" : "https://tovuti.com"}
            />
          </div>
        );

      case "pitchVideo":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName} className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              {language === "en" ? "Pitch Video (Optional)" : "Video ya Uwasilishaji (Hiari)"}
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id={fieldName}
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor={fieldName} className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {language === "en" 
                    ? "Click to upload or drag and drop"
                    : "Bofya kupakia au buruta na uangushe"
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {language === "en" 
                    ? "MP4, MOV up to 100MB"
                    : "MP4, MOV hadi 100MB"
                  }
                </p>
              </label>
            </div>
            {formData.pitchVideo && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">
                  {formData.pitchVideo.name}
                </span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>
                {language === "en" ? "Business Profile" : "Wasifu wa Biashara"}
              </CardTitle>
              <CardDescription>
                {language === "en"
                  ? "Tell us about your creative business"
                  : "Tuambie kuhusu biashara yako ya ubunifu"
                }
              </CardDescription>
            </div>
            <Badge variant="outline">
              {currentStep}/{totalSteps}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {currentStepData.description}
                </p>
                
                <div className="space-y-4">
                  {currentStepData.fields.map(renderField)}
                </div>
              </div>
              
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  {language === "en" ? "Back" : "Nyuma"}
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid() || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {language === "en" ? "Saving..." : "Inahifadhi..."}
                    </div>
                  ) : currentStep === totalSteps ? (
                    <div className="flex items-center gap-2">
                      {language === "en" ? "Submit Profile" : "Wasilisha Wasifu"}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {language === "en" ? "Next" : "Ifuatayo"}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </>
          )}

          {isSubmitting && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">
                  {language === "en" ? "Uploading..." : "Inapakia..."}
                </span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      <Alert className="mt-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {language === "en"
            ? "All information provided will be used to assess your funding eligibility and create your credit profile."
            : "Maelezo yote yaliyotolewa yatatumiwa kutathmini uwezo wako wa kustahili ufadhili na kuunda wasifu wako wa mkopo."
          }
        </AlertDescription>
      </Alert>
    </div>
  );
}; 