import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface EligibilityFormData {
  isKenyanCitizen: boolean;
  isOver18: boolean;
  hasBusinessPlan: boolean;
  businessAge: string;
  monthlyRevenue: string;
  hasValidID: boolean;
  hasBankAccount: boolean;
  isWillingToShareData: boolean;
}

interface EligibilityCheckFormProps {
  language?: "en" | "sw";
  onComplete?: (data: EligibilityFormData) => void;
}

export const EligibilityCheckForm = ({ 
  language = "en", 
  onComplete 
}: EligibilityCheckFormProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EligibilityFormData>({
    isKenyanCitizen: false,
    isOver18: false,
    hasBusinessPlan: false,
    businessAge: "",
    monthlyRevenue: "",
    hasValidID: false,
    hasBankAccount: false,
    isWillingToShareData: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  const questions = [
    {
      id: 1,
      title: language === "en" ? "Basic Requirements" : "Mahitaji ya Msingi",
      description: language === "en" 
        ? "Let's start with some basic eligibility criteria"
        : "Tuanze na vigezo vya msingi vya kustahili",
      fields: [
        {
          type: "checkbox",
          id: "isKenyanCitizen",
          label: language === "en" ? "I am a Kenyan citizen or permanent resident" : "Mimi ni raia wa Kenya au mkazi wa kudumu",
          required: true
        },
        {
          type: "checkbox", 
          id: "isOver18",
          label: language === "en" ? "I am 18 years or older" : "Mimi ni umri wa miaka 18 au zaidi",
          required: true
        },
        {
          type: "checkbox",
          id: "hasValidID",
          label: language === "en" ? "I have a valid government-issued ID" : "Nina kitambulisho halali cha serikali",
          required: true
        }
      ]
    },
    {
      id: 2,
      title: language === "en" ? "Business Information" : "Maelezo ya Biashara",
      description: language === "en"
        ? "Tell us about your business"
        : "Tuambie kuhusu biashara yako",
      fields: [
        {
          type: "radio",
          id: "businessAge",
          label: language === "en" ? "How long has your business been operating?" : "Biashara yako imekuwa ikifanya kazi kwa muda gani?",
          options: [
            { value: "0-6months", label: language === "en" ? "0-6 months" : "0-6 miezi" },
            { value: "6months-1year", label: language === "en" ? "6 months - 1 year" : "6 miezi - mwaka 1" },
            { value: "1-3years", label: language === "en" ? "1-3 years" : "Mwaka 1-3" },
            { value: "3+years", label: language === "en" ? "3+ years" : "Mwaka 3+" }
          ],
          required: true
        },
        {
          type: "radio",
          id: "monthlyRevenue",
          label: language === "en" ? "What is your average monthly revenue?" : "Mapato yako ya wastani ya kila mwezi ni nini?",
          options: [
            { value: "0-50000", label: language === "en" ? "KSH 0 - 50,000" : "KSH 0 - 50,000" },
            { value: "50000-200000", label: language === "en" ? "KSH 50,000 - 200,000" : "KSH 50,000 - 200,000" },
            { value: "200000-500000", label: language === "en" ? "KSH 200,000 - 500,000" : "KSH 200,000 - 500,000" },
            { value: "500000+", label: language === "en" ? "KSH 500,000+" : "KSH 500,000+" }
          ],
          required: true
        }
      ]
    },
    {
      id: 3,
      title: language === "en" ? "Documentation & Planning" : "Nyaraka na Upangaji",
      description: language === "en"
        ? "Do you have the necessary documentation?"
        : "Je, una nyaraka muhimu?",
      fields: [
        {
          type: "checkbox",
          id: "hasBusinessPlan",
          label: language === "en" ? "I have a business plan or can create one" : "Nina mpango wa biashara au naweza kuunda mmoja",
          required: false
        },
        {
          type: "checkbox",
          id: "hasBankAccount",
          label: language === "en" ? "I have a business bank account or M-Pesa" : "Nina akaunti ya benki ya biashara au M-Pesa",
          required: true
        }
      ]
    },
    {
      id: 4,
      title: language === "en" ? "Data Sharing Consent" : "Idhini ya Kugawana Data",
      description: language === "en"
        ? "We need your consent to access financial data for scoring"
        : "Tunahitaji idhini yako ya kufikia data ya kifedha kwa ajili ya alama",
      fields: [
        {
          type: "checkbox",
          id: "isWillingToShareData",
          label: language === "en" 
            ? "I consent to share my financial data (M-Pesa, bank statements) for credit scoring"
            : "Nakubali kugawana data yangu ya kifedha (M-Pesa, taarifa za benki) kwa ajili ya alama za mkopo",
          required: true
        }
      ]
    }
  ];

  const currentQuestion = questions.find(q => q.id === currentStep);
  const totalSteps = questions.length;
  const progress = (currentStep / totalSteps) * 100;

  const handleFieldChange = (fieldId: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const isCurrentStepValid = () => {
    if (!currentQuestion) return false;
    
    return currentQuestion.fields.every(field => {
      if (!field.required) return true;
      
      if (field.type === "checkbox") {
        return formData[field.id as keyof EligibilityFormData] === true;
      } else if (field.type === "radio") {
        return formData[field.id as keyof EligibilityFormData] !== "";
      }
      return false;
    });
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

  const checkEligibility = async (data: EligibilityFormData): Promise<boolean> => {
    // 🔌 Placeholder for backend call
    console.log("Checking eligibility with data:", data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Basic eligibility logic
    const isEligible = 
      data.isKenyanCitizen &&
      data.isOver18 &&
      data.hasValidID &&
      data.hasBankAccount &&
      data.isWillingToShareData &&
      data.businessAge !== "" &&
      data.monthlyRevenue !== "";
    
    return isEligible;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const eligible = await checkEligibility(formData);
      setIsEligible(eligible);
      
      if (eligible) {
        // 🔌 Save eligibility data
        console.log("Saving eligibility data:", formData);
        
        // Navigate to funding selection
        setTimeout(() => {
          navigate("/funding-selection");
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    if (field.type === "checkbox") {
      return (
        <div key={field.id} className="flex items-center space-x-2">
          <Checkbox
            id={field.id}
            checked={formData[field.id as keyof EligibilityFormData] as boolean}
            onCheckedChange={(checked) => 
              handleFieldChange(field.id, checked as boolean)
            }
          />
          <Label htmlFor={field.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
      );
    } else if (field.type === "radio") {
      return (
        <div key={field.id} className="space-y-3">
          <Label className="text-sm font-medium leading-none">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <RadioGroup
            value={formData[field.id as keyof EligibilityFormData] as string}
            onValueChange={(value) => handleFieldChange(field.id, value)}
          >
            {field.options.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );
    }
    return null;
  };

  if (isEligible === false) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">
              {language === "en" ? "Not Eligible" : "Hustahili"}
            </CardTitle>
            <CardDescription>
              {language === "en" 
                ? "Unfortunately, you don't meet our current eligibility criteria. Please review the requirements and try again later."
                : "Kwa bahati mbaya, haufikii vigezo vyetu vya sasa vya kustahili. Tafadhali tathmini mahitaji na jaribu tena baadaye."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {language === "en"
                  ? "Common reasons for ineligibility include:"
                  : "Sababu za kawaida za kutostahili ni pamoja na:"
                }
              </AlertDescription>
            </Alert>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>{language === "en" ? "Not a Kenyan citizen or resident" : "Si raia wa Kenya au mkazi"}</li>
              <li>{language === "en" ? "Under 18 years of age" : "Chini ya umri wa miaka 18"}</li>
              <li>{language === "en" ? "No valid government ID" : "Hakuna kitambulisho halali cha serikali"}</li>
              <li>{language === "en" ? "No business bank account or M-Pesa" : "Hakuna akaunti ya benki ya biashara au M-Pesa"}</li>
              <li>{language === "en" ? "Unwilling to share financial data" : "Kutokubali kugawana data ya kifedha"}</li>
            </ul>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setIsEligible(null);
                setCurrentStep(1);
              }}
            >
              {language === "en" ? "Try Again" : "Jaribu Tena"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEligible === true) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">
              {language === "en" ? "Eligible!" : "Unastahili!"}
            </CardTitle>
            <CardDescription>
              {language === "en"
                ? "Congratulations! You meet our eligibility criteria. Redirecting to funding selection..."
                : "Hongera! Unafikia vigezo vyetu vya kustahili. Inaelekeza kwenye uchaguzi wa ufadhili..."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>
                {language === "en" ? "Eligibility Check" : "Ukaguzi wa Kustahili"}
              </CardTitle>
              <CardDescription>
                {language === "en"
                  ? "Let's verify if you're eligible for our funding programs"
                  : "Tuhakikishe ikiwa unastahili kwa programu zetu za ufadhili"
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
          {currentQuestion && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">{currentQuestion.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {currentQuestion.description}
                </p>
                
                <div className="space-y-4">
                  {currentQuestion.fields.map(renderField)}
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
                      {language === "en" ? "Checking..." : "Inakagua..."}
                    </div>
                  ) : currentStep === totalSteps ? (
                    <div className="flex items-center gap-2">
                      {language === "en" ? "Submit" : "Wasilisha"}
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
        </CardContent>
      </Card>
    </div>
  );
}; 