import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowRight, 
  Gift, 
  CreditCard, 
  TrendingUp, 
  Info,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Target
} from "lucide-react";

interface FundingOption {
  id: string;
  title: string;
  titleSwahili: string;
  description: string;
  descriptionSwahili: string;
  icon: React.ReactNode;
  features: string[];
  featuresSwahili: string[];
  requirements: string[];
  requirementsSwahili: string[];
  maxAmount: string;
  maxAmountSwahili: string;
  timeline: string;
  timelineSwahili: string;
  interestRate?: string;
  interestRateSwahili?: string;
  equity?: string;
  equitySwahili?: string;
}

interface FundingSelectorProps {
  language?: "en" | "sw";
  onSelect?: (fundingType: string) => void;
}

export const FundingSelector = ({ 
  language = "en", 
  onSelect 
}: FundingSelectorProps) => {
  const navigate = useNavigate();
  const [selectedFunding, setSelectedFunding] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fundingOptions: FundingOption[] = [
    {
      id: "grant",
      title: "Grant Funding",
      titleSwahili: "Ufadhili wa Ruzuku",
      description: "Non-repayable funding for creative entrepreneurs",
      descriptionSwahili: "Ufadhili usiorudishwa kwa wajasiriamali wa ubunifu",
      icon: <Gift className="w-6 h-6" />,
      features: [
        "No repayment required",
        "Focus on creative industry growth",
        "Mentorship and training included",
        "Networking opportunities"
      ],
      featuresSwahili: [
        "Hakuna malipo ya kurudisha",
        "Kuzingatia ukuaji wa tasnia ya ubunifu",
        "Ushauri na mafunzo yamejumuishwa",
        "Fursa za mtandao"
      ],
      requirements: [
        "Strong creative portfolio",
        "Clear business plan",
        "Demonstrated impact potential",
        "Community engagement"
      ],
      requirementsSwahili: [
        "Portfolio nzuri ya ubunifu",
        "Mpango wa biashara wa wazi",
        "Uwezo wa athari ulioonyeshwa",
        "Ushiriki wa jamii"
      ],
      maxAmount: "KSH 500,000",
      maxAmountSwahili: "KSH 500,000",
      timeline: "2-4 weeks",
      timelineSwahili: "Wiki 2-4"
    },
    {
      id: "loan",
      title: "Business Loan",
      titleSwahili: "Mkopo wa Biashara",
      description: "Flexible loan options with competitive interest rates",
      descriptionSwahili: "Chaguo za mkopo zinazobadilika na viwango vya riba vinavyoshindana",
      icon: <CreditCard className="w-6 h-6" />,
      features: [
        "Competitive interest rates (8-15%)",
        "Flexible repayment terms",
        "No collateral required for small amounts",
        "Quick approval process"
      ],
      featuresSwahili: [
        "Viwango vya riba vinavyoshindana (8-15%)",
        "Masharti ya malipo yanayobadilika",
        "Hakuna dhamana inayohitajika kwa kiasi kidogo",
        "Mchakato wa kuidhinisha haraka"
      ],
      requirements: [
        "Good credit score (600+)",
        "Stable income history",
        "Business registration",
        "Financial statements"
      ],
      requirementsSwahili: [
        "Alama nzuri ya mkopo (600+)",
        "Historia ya mapato thabiti",
        "Usajili wa biashara",
        "Taarifa za kifedha"
      ],
      maxAmount: "KSH 2,000,000",
      maxAmountSwahili: "KSH 2,000,000",
      timeline: "1-2 weeks",
      timelineSwahili: "Wiki 1-2",
      interestRate: "8-15%",
      interestRateSwahili: "8-15%"
    },
    {
      id: "investment",
      title: "Equity Investment",
      titleSwahili: "Uwekezaji wa Haki",
      description: "Strategic investment for high-growth creative businesses",
      descriptionSwahili: "Uwekezaji wa kimkakati kwa biashara za ubunifu zinazokua kwa kasi",
      icon: <TrendingUp className="w-6 h-6" />,
      features: [
        "Strategic partnership",
        "Access to investor network",
        "Business development support",
        "Exit strategy planning"
      ],
      featuresSwahili: [
        "Ushirikiano wa kimkakati",
        "Ufikiaji wa mtandao wa wawekezaji",
        "Msaada wa ukuzaji wa biashara",
        "Upangaji wa mkakati wa kutoka"
      ],
      requirements: [
        "Proven business model",
        "Strong growth potential",
        "Scalable operations",
        "Experienced team"
      ],
      requirementsSwahili: [
        "Muundo wa biashara uliothibitishwa",
        "Uwezo mkubwa wa ukuaji",
        "Shughuli zinazoweza kuongezeka",
        "Timu yenye uzoefu"
      ],
      maxAmount: "KSH 10,000,000",
      maxAmountSwahili: "KSH 10,000,000",
      timeline: "4-8 weeks",
      timelineSwahili: "Wiki 4-8",
      equity: "10-30%",
      equitySwahili: "10-30%"
    }
  ];

  const saveFundingType = async (type: string): Promise<void> => {
    // 🔌 Placeholder for backend call
    console.log("Saving funding type:", type);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Store in localStorage for demo purposes
    localStorage.setItem("selectedFundingType", type);
  };

  const handleSubmit = async () => {
    if (!selectedFunding) return;
    
    setIsSubmitting(true);
    
    try {
      await saveFundingType(selectedFunding);
      
      if (onSelect) {
        onSelect(selectedFunding);
      }
      
      // Navigate to business profile
      navigate("/business-profile");
    } catch (error) {
      console.error("Error saving funding type:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOption = fundingOptions.find(option => option.id === selectedFunding);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          {language === "en" ? "Choose Your Funding Type" : "Chagua Aina ya Ufadhili"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {language === "en"
            ? "Select the funding option that best fits your business needs and goals"
            : "Chagua chaguo la ufadhili linalofaa zaidi mahitaji na malengo yako ya biashara"
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {fundingOptions.map((option) => (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedFunding === option.id 
                ? "ring-2 ring-primary border-primary" 
                : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedFunding(option.id)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {option.icon}
              </div>
              <CardTitle className="text-lg">
                {language === "en" ? option.title : option.titleSwahili}
              </CardTitle>
              <CardDescription>
                {language === "en" ? option.description : option.descriptionSwahili}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Key Features */}
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {language === "en" ? "Key Features" : "Vipengele Muhimu"}
                </h4>
                <ul className="space-y-1 text-sm">
                  {(language === "en" ? option.features : option.featuresSwahili).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  {language === "en" ? "Requirements" : "Mahitaji"}
                </h4>
                <ul className="space-y-1 text-sm">
                  {(language === "en" ? option.requirements : option.requirementsSwahili).map((req, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">
                    {language === "en" ? "Max Amount" : "Kiasi cha Juu"}
                  </div>
                  <div className="font-semibold text-sm">
                    {language === "en" ? option.maxAmount : option.maxAmountSwahili}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">
                    {language === "en" ? "Timeline" : "Muda"}
                  </div>
                  <div className="font-semibold text-sm">
                    {language === "en" ? option.timeline : option.timelineSwahili}
                  </div>
                </div>
                {option.interestRate && (
                  <div className="text-center col-span-2">
                    <div className="text-xs text-muted-foreground">
                      {language === "en" ? "Interest Rate" : "Kiwango cha Riba"}
                    </div>
                    <div className="font-semibold text-sm">
                      {language === "en" ? option.interestRate : option.interestRateSwahili}
                    </div>
                  </div>
                )}
                {option.equity && (
                  <div className="text-center col-span-2">
                    <div className="text-xs text-muted-foreground">
                      {language === "en" ? "Equity Share" : "Sehemu ya Haki"}
                    </div>
                    <div className="font-semibold text-sm">
                      {language === "en" ? option.equity : option.equitySwahili}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOption && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {selectedOption.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">
                  {language === "en" ? "Selected:" : "Imechaguliwa:"} {language === "en" ? selectedOption.title : selectedOption.titleSwahili}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === "en" ? selectedOption.description : selectedOption.descriptionSwahili}
                </p>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {language === "en" ? "Saving..." : "Inahifadhi..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {language === "en" ? "Continue to Business Profile" : "Endelea kwenye Wasifu wa Biashara"}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {language === "en"
            ? "You can change your funding type later in your application process. Each option has different requirements and benefits."
            : "Unaweza kubadilisha aina ya ufadhili baadaye katika mchakato wa ombi lako. Kila chaguo lina mahitaji na faida tofauti."
          }
        </AlertDescription>
      </Alert>
    </div>
  );
}; 