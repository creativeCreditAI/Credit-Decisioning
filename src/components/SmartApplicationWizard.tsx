import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ApplicationService, DocumentService, CreditScoringService } from "../services/backendService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  DollarSign,
  Building,
  User,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Loader2
} from "lucide-react";

export const SmartApplicationWizard = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState({
    // Basic Business Information
    business_name: "",
    business_description: "",
    business_stage: "startup",
    sector: "",
    location: "",
    registration_number: "",
    year_established: new Date().getFullYear(),
    
    // Founder Information
    founder_name: user?.name || "",
    founder_email: user?.email || "",
    founder_phone: "",
    founder_experience: "",
    founder_education: "",
    
    // Financial Information
    funding_amount_requested: 0,
    monthly_revenue: 0,
    employee_count: 1,
    previous_funding: 0,
    projected_revenue: 0,
    use_of_funds: "",
    
    // Additional Information
    social_media_profiles: {
      website: "",
      linkedin: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },
    business_model: "",
    target_market: "",
    competitive_advantage: "",
    growth_plans: "",
  });

  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    business_plan: null,
    financial_statements: null,
    id_document: null,
    business_registration: null,
    pitch_deck: null,
  });

  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const sectors = [
    "audio_visual",
    "design_services", 
    "visual_arts",
    "performing_arts",
    "fashion",
    "technology",
    "agriculture",
    "manufacturing",
    "services",
    "retail",
    "other"
  ];

  const businessStages = [
    { value: "idea", label: "Idea Stage" },
    { value: "startup", label: "Startup" },
    { value: "early_stage", label: "Early Stage" },
    { value: "growth", label: "Growth Stage" },
    { value: "expansion", label: "Expansion" },
    { value: "mature", label: "Mature Business" }
  ];

  const documentTypes = [
    { key: "business_plan", label: "Business Plan", required: true, description: "Detailed business plan (PDF)" },
    { key: "financial_statements", label: "Financial Statements", required: true, description: "Last 12 months financial records" },
    { key: "id_document", label: "ID Document", required: true, description: "National ID or Passport" },
    { key: "business_registration", label: "Business Registration", required: false, description: "Certificate of incorporation" },
    { key: "pitch_deck", label: "Pitch Deck", required: false, description: "Presentation slides (optional)" },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (step) {
      case 1:
        if (!applicationData.business_name) newErrors.business_name = "Business name is required";
        if (!applicationData.business_description) newErrors.business_description = "Business description is required";
        if (!applicationData.sector) newErrors.sector = "Please select a sector";
        if (!applicationData.location) newErrors.location = "Location is required";
        break;
      
      case 2:
        if (!applicationData.founder_name) newErrors.founder_name = "Founder name is required";
        if (!applicationData.founder_email) newErrors.founder_email = "Email is required";
        if (!applicationData.founder_phone) newErrors.founder_phone = "Phone number is required";
        break;
      
      case 3:
        if (applicationData.funding_amount_requested <= 0) newErrors.funding_amount_requested = "Funding amount must be greater than 0";
        if (!applicationData.use_of_funds) newErrors.use_of_funds = "Please describe how you'll use the funds";
        break;
      
      case 4: {
        const requiredDocs = documentTypes.filter(doc => doc.required);
        const missingDocs = requiredDocs.filter(doc => !documents[doc.key] && !uploadedDocs[doc.key]);
        if (missingDocs.length > 0) {
          newErrors.documents = `Missing required documents: ${missingDocs.map(d => d.label).join(", ")}`;
        }
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      social_media_profiles: {
        ...prev.social_media_profiles,
        [platform]: value
      }
    }));
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    try {
      setUploading(prev => ({ ...prev, [documentType]: true }));
      
      const uploadedDoc = await DocumentService.uploadDocument(file, documentType, applicationId || undefined);
      
      setUploadedDocs(prev => ({
        ...prev,
        [documentType]: uploadedDoc.id
      }));
      
      setDocuments(prev => ({
        ...prev,
        [documentType]: file
      }));
      
    } catch (error) {
      console.error(`Failed to upload ${documentType}:`, error);
      setErrors(prev => ({
        ...prev,
        [documentType]: `Failed to upload ${documentType}`
      }));
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    
    try {
      setLoading(true);
      
      let appId = applicationId;
      
      // Create application if it doesn't exist
      if (!appId) {
        const newApp = await ApplicationService.createApplication(applicationData);
        appId = newApp.id;
        setApplicationId(appId);
      } else {
        // Update existing application
        await ApplicationService.updateApplication(appId, applicationData);
      }
      
      // Submit the application
      await ApplicationService.submitApplication(appId);
      
      // Calculate credit score
      try {
        await CreditScoringService.calculateCreditScore();
      } catch (error) {
        console.warn("Credit score calculation failed:", error);
      }
      
      // Redirect to dashboard or success page
      alert("Application submitted successfully! You will be redirected to your dashboard.");
      window.location.href = "/dashboard";
      
    } catch (error) {
      console.error("Failed to submit application:", error);
      setErrors({ submit: "Failed to submit application. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i + 1 < currentStep
                ? "bg-green-500 text-white"
                : i + 1 === currentStep
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {i + 1 < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-12 h-1 mx-2 ${
                i + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="w-5 h-5" />
          Business Information
        </CardTitle>
        <CardDescription>Tell us about your business</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="business_name">Business Name *</Label>
          <Input
            id="business_name"
            value={applicationData.business_name}
            onChange={(e) => handleInputChange("business_name", e.target.value)}
            className={errors.business_name ? "border-red-500" : ""}
          />
          {errors.business_name && <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>}
        </div>

        <div>
          <Label htmlFor="business_description">Business Description *</Label>
          <textarea
            id="business_description"
            className={`w-full min-h-[100px] px-3 py-2 border rounded-md ${errors.business_description ? "border-red-500" : "border-gray-300"}`}
            value={applicationData.business_description}
            onChange={(e) => handleInputChange("business_description", e.target.value)}
            placeholder="Describe what your business does..."
          />
          {errors.business_description && <p className="text-red-500 text-sm mt-1">{errors.business_description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Sector *</Label>
            <Select value={applicationData.sector} onValueChange={(value) => handleInputChange("sector", value)}>
              <SelectTrigger className={errors.sector ? "border-red-500" : ""}>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {sectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sector && <p className="text-red-500 text-sm mt-1">{errors.sector}</p>}
          </div>

          <div>
            <Label>Business Stage</Label>
            <Select value={applicationData.business_stage} onValueChange={(value) => handleInputChange("business_stage", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {businessStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={applicationData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className={errors.location ? "border-red-500" : ""}
              placeholder="City, Country"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div>
            <Label htmlFor="year_established">Year Established</Label>
            <Input
              id="year_established"
              type="number"
              value={applicationData.year_established}
              onChange={(e) => handleInputChange("year_established", parseInt(e.target.value))}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="registration_number">Business Registration Number</Label>
          <Input
            id="registration_number"
            value={applicationData.registration_number}
            onChange={(e) => handleInputChange("registration_number", e.target.value)}
            placeholder="Optional"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Founder Information
        </CardTitle>
        <CardDescription>Information about the business founder/owner</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="founder_name">Full Name *</Label>
            <Input
              id="founder_name"
              value={applicationData.founder_name}
              onChange={(e) => handleInputChange("founder_name", e.target.value)}
              className={errors.founder_name ? "border-red-500" : ""}
            />
            {errors.founder_name && <p className="text-red-500 text-sm mt-1">{errors.founder_name}</p>}
          </div>

          <div>
            <Label htmlFor="founder_email">Email *</Label>
            <Input
              id="founder_email"
              type="email"
              value={applicationData.founder_email}
              onChange={(e) => handleInputChange("founder_email", e.target.value)}
              className={errors.founder_email ? "border-red-500" : ""}
            />
            {errors.founder_email && <p className="text-red-500 text-sm mt-1">{errors.founder_email}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="founder_phone">Phone Number *</Label>
          <Input
            id="founder_phone"
            value={applicationData.founder_phone}
            onChange={(e) => handleInputChange("founder_phone", e.target.value)}
            className={errors.founder_phone ? "border-red-500" : ""}
            placeholder="+254712345678"
          />
          {errors.founder_phone && <p className="text-red-500 text-sm mt-1">{errors.founder_phone}</p>}
        </div>

        <div>
          <Label htmlFor="founder_experience">Relevant Experience</Label>
          <textarea
            id="founder_experience"
            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
            value={applicationData.founder_experience}
            onChange={(e) => handleInputChange("founder_experience", e.target.value)}
            placeholder="Describe your relevant business or industry experience..."
          />
        </div>

        <div>
          <Label htmlFor="founder_education">Education Background</Label>
          <Input
            id="founder_education"
            value={applicationData.founder_education}
            onChange={(e) => handleInputChange("founder_education", e.target.value)}
            placeholder="Highest level of education"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Financial Information
        </CardTitle>
        <CardDescription>Tell us about your financial needs and current situation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="funding_amount_requested">Funding Amount Requested (KES) *</Label>
            <Input
              id="funding_amount_requested"
              type="number"
              value={applicationData.funding_amount_requested || ""}
              onChange={(e) => handleInputChange("funding_amount_requested", parseInt(e.target.value) || 0)}
              className={errors.funding_amount_requested ? "border-red-500" : ""}
              min="1"
            />
            {errors.funding_amount_requested && <p className="text-red-500 text-sm mt-1">{errors.funding_amount_requested}</p>}
          </div>

          <div>
            <Label htmlFor="monthly_revenue">Current Monthly Revenue (KES)</Label>
            <Input
              id="monthly_revenue"
              type="number"
              value={applicationData.monthly_revenue || ""}
              onChange={(e) => handleInputChange("monthly_revenue", parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employee_count">Number of Employees</Label>
            <Input
              id="employee_count"
              type="number"
              value={applicationData.employee_count}
              onChange={(e) => handleInputChange("employee_count", parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="previous_funding">Previous Funding Received (KES)</Label>
            <Input
              id="previous_funding"
              type="number"
              value={applicationData.previous_funding || ""}
              onChange={(e) => handleInputChange("previous_funding", parseInt(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="projected_revenue">Projected Annual Revenue (KES)</Label>
          <Input
            id="projected_revenue"
            type="number"
            value={applicationData.projected_revenue || ""}
            onChange={(e) => handleInputChange("projected_revenue", parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div>
          <Label htmlFor="use_of_funds">How will you use the funding? *</Label>
          <textarea
            id="use_of_funds"
            className={`w-full min-h-[100px] px-3 py-2 border rounded-md ${errors.use_of_funds ? "border-red-500" : "border-gray-300"}`}
            value={applicationData.use_of_funds}
            onChange={(e) => handleInputChange("use_of_funds", e.target.value)}
            placeholder="Describe how you plan to use the funding..."
          />
          {errors.use_of_funds && <p className="text-red-500 text-sm mt-1">{errors.use_of_funds}</p>}
        </div>
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Document Upload
        </CardTitle>
        <CardDescription>Upload required documents for your application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.documents && (
          <Alert variant="destructive">
            <AlertDescription>{errors.documents}</AlertDescription>
          </Alert>
        )}
        
        {documentTypes.map((docType) => (
          <div key={docType.key} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  {docType.label}
                  {docType.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                </h4>
                <p className="text-sm text-muted-foreground">{docType.description}</p>
              </div>
              
              {uploadedDocs[docType.key] ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : documents[docType.key] ? (
                <Clock className="w-5 h-5 text-yellow-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileUpload(docType.key, file);
                  }
                }}
                disabled={uploading[docType.key]}
                className="flex-1"
              />
              
              {uploading[docType.key] && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
            </div>

            {documents[docType.key] && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {documents[docType.key]?.name}
              </p>
            )}

            {errors[docType.key] && (
              <p className="text-red-500 text-sm mt-1">{errors[docType.key]}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderStep5 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Additional Information
        </CardTitle>
        <CardDescription>Tell us more about your business strategy and online presence</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="business" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="business">Business Strategy</TabsTrigger>
            <TabsTrigger value="social">Online Presence</TabsTrigger>
          </TabsList>
          
          <TabsContent value="business" className="space-y-4">
            <div>
              <Label htmlFor="business_model">Business Model</Label>
              <textarea
                id="business_model"
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                value={applicationData.business_model}
                onChange={(e) => handleInputChange("business_model", e.target.value)}
                placeholder="How does your business make money?"
              />
            </div>

            <div>
              <Label htmlFor="target_market">Target Market</Label>
              <textarea
                id="target_market"
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                value={applicationData.target_market}
                onChange={(e) => handleInputChange("target_market", e.target.value)}
                placeholder="Who are your customers?"
              />
            </div>

            <div>
              <Label htmlFor="competitive_advantage">Competitive Advantage</Label>
              <textarea
                id="competitive_advantage"
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                value={applicationData.competitive_advantage}
                onChange={(e) => handleInputChange("competitive_advantage", e.target.value)}
                placeholder="What makes your business unique?"
              />
            </div>

            <div>
              <Label htmlFor="growth_plans">Growth Plans</Label>
              <textarea
                id="growth_plans"
                className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md"
                value={applicationData.growth_plans}
                onChange={(e) => handleInputChange("growth_plans", e.target.value)}
                placeholder="How do you plan to grow your business?"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={applicationData.social_media_profiles.website}
                onChange={(e) => handleSocialMediaChange("website", e.target.value)}
                placeholder="https://your-website.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={applicationData.social_media_profiles.linkedin}
                  onChange={(e) => handleSocialMediaChange("linkedin", e.target.value)}
                  placeholder="LinkedIn profile URL"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={applicationData.social_media_profiles.instagram}
                  onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                  placeholder="Instagram handle"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={applicationData.social_media_profiles.facebook}
                  onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                  placeholder="Facebook page URL"
                />
              </div>

              <div>
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  value={applicationData.social_media_profiles.twitter}
                  onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                  placeholder="Twitter handle"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {errors.submit && (
          <Alert variant="destructive">
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Funding Application</h1>
        <p className="text-muted-foreground">Complete your application in {totalSteps} simple steps</p>
      </div>

      {renderStepIndicator()}

      <div className="mb-6">
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Step {currentStep} of {totalSteps} ({Math.round(progress)}% complete)
        </p>
      </div>

      <div className="mb-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
