import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Users, Award, TrendingUp, CheckCircle, ArrowRight, ArrowLeft, Star, FileText, Clock, Target, Heart, Zap } from "lucide-react";

interface SurveyQuestion {
  id: string;
  section: string;
  sectionSwahili: string;
  question: string;
  questionSwahili: string;
  type: "text" | "radio" | "checkbox" | "textarea" | "number" | "select";
  options?: {
    value: string;
    label: string;
    labelSwahili: string;
    score?: number;
  }[];
  required?: boolean;
}

interface BusinessSurveyProps {
  language?: "en" | "sw";
  onComplete?: (results: any) => void;
}

const surveyQuestions: SurveyQuestion[] = [
  // SECTION 1: Business Identity & Operations
  {
    id: "business-name",
    section: "Business Identity & Operations",
    sectionSwahili: "Utambulisho wa Biashara na Uendeshaji",
    question: "What is your business name?",
    questionSwahili: "Jina la biashara yako ni nini?",
    type: "text",
    required: true
  },
  {
    id: "creative-sector",
    section: "Business Identity & Operations",
    sectionSwahili: "Utambulisho wa Biashara na Uendeshaji",
    question: "Which creative sector best describes your work?",
    questionSwahili: "Sekta gani ya ubunifu inaelezea kazi yako zaidi?",
    type: "select",
    options: [
      { value: "fashion", label: "Fashion / Apparel", labelSwahili: "Mitindo / Nguo" },
      { value: "digital-art", label: "Digital Art / Illustration", labelSwahili: "Sanaa ya Kidijitali / Michoro" },
      { value: "content-creation", label: "Content Creation / UGC", labelSwahili: "Uundaji wa Maudhui / UGC" },
      { value: "photography", label: "Photography / Videography", labelSwahili: "Upigaji Picha / Video" },
      { value: "crafts", label: "Crafts / Handmade Goods", labelSwahili: "Ufundi / Bidhaa za Mkono" },
      { value: "baking", label: "Baking / Culinary Arts", labelSwahili: "Upishi / Sanaa za Mapishi" },
      { value: "music", label: "Music / Performance", labelSwahili: "Muziki / Tamasha" },
      { value: "other", label: "Other", labelSwahili: "Nyingine" }
    ],
    required: true
  },
  {
    id: "start-date",
    section: "Business Identity & Operations",
    sectionSwahili: "Utambulisho wa Biashara na Uendeshaji",
    question: "When did you officially begin offering your services or products?",
    questionSwahili: "Ulikuanza rasmi kutoa huduma au bidhaa zako lini?",
    type: "text",
    required: true
  },
  {
    id: "hours-per-week",
    section: "Business Identity & Operations",
    sectionSwahili: "Utambulisho wa Biashara na Uendeshaji",
    question: "How many hours per week do you dedicate to your creative work?",
    questionSwahili: "Saa ngapi kwa wiki unazitolea kazi yako ya ubunifu?",
    type: "number",
    required: true
  },
  {
    id: "work-type",
    section: "Business Identity & Operations",
    sectionSwahili: "Utambulisho wa Biashara na Uendeshaji",
    question: "Do you work full-time or part-time on your creative business?",
    questionSwahili: "Unafanya kazi ya muda kamili au muda wa nusu kwenye biashara yako ya ubunifu?",
    type: "radio",
    options: [
      { value: "full-time", label: "Full-time", labelSwahili: "Muda kamili" },
      { value: "part-time", label: "Part-time", labelSwahili: "Muda wa nusu" },
      { value: "seasonal", label: "Seasonal", labelSwahili: "Msimu" },
      { value: "project-based", label: "Project-based", labelSwahili: "Kulingana na miradi" }
    ],
    required: true
  },

  // SECTION 2: Client & Product Insights
  {
    id: "clients-per-month",
    section: "Client & Product Insights",
    sectionSwahili: "Ufahamu wa Wateja na Bidhaa",
    question: "On average, how many clients or orders do you handle per month?",
    questionSwahili: "Kwa wastani, wateja au maagizo mangapi unayoshughulikia kwa mwezi?",
    type: "number",
    required: true
  },
  {
    id: "promotion-platforms",
    section: "Client & Product Insights",
    sectionSwahili: "Ufahamu wa Wateja na Bidhaa",
    question: "Which platforms do you use to promote or sell your work?",
    questionSwahili: "Mitandao ipi unayotumia kukuza au kuuza kazi yako?",
    type: "checkbox",
    options: [
      { value: "instagram", label: "Instagram", labelSwahili: "Instagram" },
      { value: "tiktok", label: "TikTok", labelSwahili: "TikTok" },
      { value: "whatsapp", label: "WhatsApp", labelSwahili: "WhatsApp" },
      { value: "etsy", label: "Etsy", labelSwahili: "Etsy" },
      { value: "own-website", label: "Own Website", labelSwahili: "Tovuti Yangu" },
      { value: "physical-markets", label: "Physical Markets", labelSwahili: "Masoko ya Kimwili" },
      { value: "referrals", label: "Referrals/Word of Mouth", labelSwahili: "Marejeleo/Maneno ya Mdomo" }
    ]
  },
  {
    id: "client-discovery",
    section: "Client & Product Insights",
    sectionSwahili: "Ufahamu wa Wateja na Bidhaa",
    question: "How do clients typically find you?",
    questionSwahili: "Wateja wanakupata vipi kwa kawaida?",
    type: "radio",
    options: [
      { value: "social-media", label: "Social media discovery", labelSwahili: "Ugunduzi wa mitandao ya kijamii" },
      { value: "referrals", label: "Personal referrals", labelSwahili: "Marejeleo ya kibinafsi" },
      { value: "online-marketplaces", label: "Online marketplaces", labelSwahili: "Masoko ya mtandaoni" },
      { value: "repeat-customers", label: "Repeat customers", labelSwahili: "Wateja wa kurudia" },
      { value: "other-discovery", label: "Other", labelSwahili: "Nyingine" }
    ],
    required: true
  },
  {
    id: "repeat-customers-percentage",
    section: "Client & Product Insights",
    sectionSwahili: "Ufahamu wa Wateja na Bidhaa",
    question: "What percentage of your clients are repeat customers?",
    questionSwahili: "Asilimia ngapi ya wateja wako ni wateja wa kurudia?",
    type: "radio",
    options: [
      { value: "0-25", label: "0–25%", labelSwahili: "0–25%" },
      { value: "26-50", label: "26–50%", labelSwahili: "26–50%" },
      { value: "51-75", label: "51–75%", labelSwahili: "51–75%" },
      { value: "76-100", label: "76–100%", labelSwahili: "76–100%" }
    ],
    required: true
  },
  {
    id: "feedback-collection",
    section: "Client & Product Insights",
    sectionSwahili: "Ufahamu wa Wateja na Bidhaa",
    question: "How do you collect feedback from your clients?",
    questionSwahili: "Unakusanya maoni kutoka kwa wateja wako vipi?",
    type: "textarea",
    required: true
  },

  // SECTION 3: Production & Fulfilment
  {
    id: "production-method",
    section: "Production & Fulfilment",
    sectionSwahili: "Uzalishaji na Utekelezaji",
    question: "How do you typically produce your work?",
    questionSwahili: "Unazalisha kazi yako vipi kwa kawaida?",
    type: "radio",
    options: [
      { value: "made-to-order", label: "Made to order", labelSwahili: "Kutengenezwa kwa agizo" },
      { value: "pre-made-inventory", label: "Pre-made inventory", labelSwahili: "Hifadhi ya kutengenezwa mapema" },
      { value: "digital-only", label: "Digital-only", labelSwahili: "Kidijitali tu" },
      { value: "subscription", label: "Subscription-based content", labelSwahili: "Maudhui ya ushirika" },
      { value: "other-production", label: "Other", labelSwahili: "Nyingine" }
    ],
    required: true
  },
  {
    id: "collaboration",
    section: "Production & Fulfilment",
    sectionSwahili: "Uzalishaji na Utekelezaji",
    question: "Do you collaborate with other creatives or vendors?",
    questionSwahili: "Unashirikiana na wabunifu wengine au wauzaji?",
    type: "textarea",
    required: true
  },
  {
    id: "fulfillment-time",
    section: "Production & Fulfilment",
    sectionSwahili: "Uzalishaji na Utekelezaji",
    question: "How long does it typically take to fulfill one client order or project?",
    questionSwahili: "Inachukua muda gani kwa kawaida kutekeleza agizo moja la mteja au mradi?",
    type: "text",
    required: true
  },
  {
    id: "work-process",
    section: "Production & Fulfilment",
    sectionSwahili: "Uzalishaji na Utekelezaji",
    question: "Describe your work process: Do you follow a schedule, workflow system, or use project management tools?",
    questionSwahili: "Eleza mchakato wako wa kazi: Unafuata ratiba, mfumo wa mchakato wa kazi, au unatumia zana za usimamizi wa miradi?",
    type: "textarea",
    required: true
  },

  // SECTION 4: Professionalism & Risk Indicators
  {
    id: "deadline-meeting",
    section: "Professionalism & Risk Indicators",
    sectionSwahili: "Utaalamu na Viashiria vya Hatari",
    question: "Do you meet your order or delivery deadlines?",
    questionSwahili: "Unafikia tarehe za mwisho za agizo au uwasilishaji?",
    type: "radio",
    options: [
      { value: "always", label: "Always", labelSwahili: "Siku zote" },
      { value: "most-of-time", label: "Most of the time", labelSwahili: "Mara nyingi" },
      { value: "occasionally", label: "Occasionally", labelSwahili: "Mara kwa mara" },
      { value: "rarely", label: "Rarely", labelSwahili: "Mara chache" }
    ],
    required: true
  },
  {
    id: "delay-management",
    section: "Professionalism & Risk Indicators",
    sectionSwahili: "Utaalamu na Viashiria vya Hatari",
    question: "What steps do you take to manage delays or challenges in production?",
    questionSwahili: "Hatua zipi unazochukua kusimamia kuchelewa au changamoto katika uzalishaji?",
    type: "textarea",
    required: true
  },
  {
    id: "client-disputes",
    section: "Professionalism & Risk Indicators",
    sectionSwahili: "Utaalamu na Viashiria vya Hatari",
    question: "Have you ever had a dispute with a client? How did you resolve it?",
    questionSwahili: "Umewahi kuwa na ugomvi na mteja? Uliutatua vipi?",
    type: "textarea",
    required: true
  },
  {
    id: "documented-proof",
    section: "Professionalism & Risk Indicators",
    sectionSwahili: "Utaalamu na Viashiria vya Hatari",
    question: "Do you have documented proof of your past work (e.g., portfolio, testimonials)?",
    questionSwahili: "Una ushahidi wa kazi yako ya zamani (k.m., portfolio, ushuhuda)?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", labelSwahili: "Ndiyo" },
      { value: "no", label: "No", labelSwahili: "Hapana" },
      { value: "partial", label: "Partial", labelSwahili: "Sehemu" }
    ],
    required: true
  },
  {
    id: "contracts-agreements",
    section: "Professionalism & Risk Indicators",
    sectionSwahili: "Utaalamu na Viashiria vya Hatari",
    question: "Do you sign contracts or agreements with clients or collaborators?",
    questionSwahili: "Unasaini mikataba au makubaliano na wateja au washirika?",
    type: "radio",
    options: [
      { value: "always", label: "Always", labelSwahili: "Siku zote" },
      { value: "sometimes", label: "Sometimes", labelSwahili: "Mara kwa mara" },
      { value: "never", label: "Never", labelSwahili: "Kamwe" }
    ],
    required: true
  },

  // SECTION 5: Vision & Growth Mindset
  {
    id: "business-goals",
    section: "Vision & Growth Mindset",
    sectionSwahili: "Mtazamo na Msimamo wa Ukuaji",
    question: "What are your business goals for the next 12 months?",
    questionSwahili: "Malengo yako ya biashara kwa miezi 12 ijayo ni nini?",
    type: "textarea",
    required: true
  },
  {
    id: "hiring-plans",
    section: "Vision & Growth Mindset",
    sectionSwahili: "Mtazamo na Msimamo wa Ukuaji",
    question: "Do you plan to hire help or grow a team?",
    questionSwahili: "Una mpango wa kuajiri msaada au kukuza timu?",
    type: "textarea",
    required: true
  },
  {
    id: "skill-improvement",
    section: "Vision & Growth Mindset",
    sectionSwahili: "Mtazamo na Msimamo wa Ukuaji",
    question: "How do you stay inspired or keep improving your skills?",
    questionSwahili: "Unabaki na hamasa au kuendelea kuboresha ujuzi wako vipi?",
    type: "textarea",
    required: true
  },
  {
    id: "mentorship-openness",
    section: "Vision & Growth Mindset",
    sectionSwahili: "Mtazamo na Msimamo wa Ukuaji",
    question: "Are you open to mentorship or coaching programs?",
    questionSwahili: "Una ufunguzi kwa programu za uongozi au mafunzo?",
    type: "radio",
    options: [
      { value: "very-open", label: "Very open", labelSwahili: "Nina ufunguzi sana" },
      { value: "somewhat-open", label: "Somewhat open", labelSwahili: "Nina ufunguzi kidogo" },
      { value: "not-interested", label: "Not interested", labelSwahili: "Sina nia" }
    ],
    required: true
  },
  {
    id: "creative-communities",
    section: "Vision & Growth Mindset",
    sectionSwahili: "Mtazamo na Msimamo wa Ukuaji",
    question: "Are you part of any creative business communities or networks?",
    questionSwahili: "Uko sehemu ya jamii yoyote ya biashara ya ubunifu au mitandao?",
    type: "textarea",
    required: true
  },

  // SECTION 6: Digital Presence & Initiative
  {
    id: "digital-tools",
    section: "Digital Presence & Initiative",
    sectionSwahili: "Uwepo wa Kidijitali na Mpango",
    question: "Do you currently use any of the following for your business?",
    questionSwahili: "Kwa sasa unatumia yoyote kati ya zifuatazo kwa biashara yako?",
    type: "checkbox",
    options: [
      { value: "website", label: "Website", labelSwahili: "Tovuti" },
      { value: "newsletter", label: "Newsletter", labelSwahili: "Barua pepe ya habari" },
      { value: "online-booking", label: "Online booking system", labelSwahili: "Mfumo wa kuhifadhi mtandaoni" },
      { value: "automated-invoicing", label: "Automated invoicing tools", labelSwahili: "Zana za kujifanyia kiotomatiki" },
      { value: "crm", label: "Customer Relationship Management (CRM) tools", labelSwahili: "Zana za Usimamizi wa Uhusiano na Wateja (CRM)" },
      { value: "analytics", label: "Analytics (Instagram Insights, Google Analytics, etc.)", labelSwahili: "Uchambuzi (Instagram Insights, Google Analytics, n.k.)" }
    ]
  },
  {
    id: "digital-archive",
    section: "Digital Presence & Initiative",
    sectionSwahili: "Uwepo wa Kidijitali na Mpango",
    question: "Do you keep a digital archive or backup of your work?",
    questionSwahili: "Una hifadhi ya kidijitali au nakala ya kazi yako?",
    type: "radio",
    options: [
      { value: "yes", label: "Yes", labelSwahili: "Ndiyo" },
      { value: "no", label: "No", labelSwahili: "Hapana" },
      { value: "partial", label: "Partial", labelSwahili: "Sehemu" }
    ],
    required: true
  },

  // SECTION 7: Adaptability & Innovation
  {
    id: "business-adaptation",
    section: "Adaptability & Innovation",
    sectionSwahili: "Uwezo wa Kujibadilisha na Ubunifu",
    question: "Have you adapted your business or offerings in response to external changes (e.g., market trends, client behavior)?",
    questionSwahili: "Umebadilisha biashara yako au huduma zako kujibu mabadiliko ya nje (k.m., mielekeo ya soko, tabia ya wateja)?",
    type: "textarea",
    required: true
  },
  {
    id: "new-skills",
    section: "Adaptability & Innovation",
    sectionSwahili: "Uwezo wa Kujibadilisha na Ubunifu",
    question: "What new skill or tool did you learn recently that supports your business?",
    questionSwahili: "Ujuzi au zana mpya gani uliyojifunza hivi karibuni inayounga mkono biashara yako?",
    type: "textarea",
    required: true
  },
  {
    id: "business-alternatives",
    section: "Adaptability & Innovation",
    sectionSwahili: "Uwezo wa Kujibadilisha na Ubunifu",
    question: "If your usual way of doing business was interrupted, what alternatives would you explore?",
    questionSwahili: "Ikiwa njia yako ya kawaida ya kufanya biashara ilikatizwa, njia mbadala zipi ungechunguza?",
    type: "textarea",
    required: true
  },

  // SECTION 8: Personality & Motivation
  {
    id: "discipline-deadlines",
    section: "Personality & Motivation",
    sectionSwahili: "Tabia na Hamasa",
    question: "How would you describe your relationship with discipline and deadlines?",
    questionSwahili: "Ungeelezaje uhusiano wako na nidhamu na tarehe za mwisho?",
    type: "textarea",
    required: true
  },
  {
    id: "motivation",
    section: "Personality & Motivation",
    sectionSwahili: "Tabia na Hamasa",
    question: "What motivates you to keep building your business?",
    questionSwahili: "Nini kinakuhamasisha kuendelea kujenga biashara yako?",
    type: "textarea",
    required: true
  },
  {
    id: "self-doubt-actions",
    section: "Personality & Motivation",
    sectionSwahili: "Tabia na Hamasa",
    question: "In moments of self-doubt, what actions do you take?",
    questionSwahili: "Katika nyakati za kujikana, hatua zipi unazochukua?",
    type: "textarea",
    required: true
  },
  {
    id: "brand-values",
    section: "Personality & Motivation",
    sectionSwahili: "Tabia na Hamasa",
    question: "What values guide your brand or creative work?",
    questionSwahili: "Thamani zipi zinazongoza chapa yako au kazi yako ya ubunifu?",
    type: "textarea",
    required: true
  }
];

export const BusinessSurvey = ({ language = "en", onComplete }: BusinessSurveyProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<any>(null);

  const currentQ = surveyQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      const surveyResults = calculateResults();
      setResults(surveyResults);
      setIsComplete(true);
      if (onComplete) {
        onComplete(surveyResults);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    let totalScore = 0;
    let maxScore = 0;
    const categoryScores: Record<string, { score: number; maxScore: number }> = {};

    surveyQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const category = question.section;
        if (!categoryScores[category]) {
          categoryScores[category] = { score: 0, maxScore: 0 };
        }

        let questionScore = 0;
        let questionMaxScore = 1;

        if (question.type === "radio" && question.options) {
          const option = question.options.find(opt => opt.value === answer);
          questionScore = option?.score || 0;
          questionMaxScore = Math.max(...question.options.map(opt => opt.score || 0));
        } else if (question.type === "checkbox" && Array.isArray(answer)) {
          questionScore = answer.length;
          questionMaxScore = question.options?.length || 1;
        } else if (question.type === "text" || question.type === "textarea") {
          questionScore = answer.length > 10 ? 1 : 0.5;
          questionMaxScore = 1;
        } else if (question.type === "number") {
          questionScore = Math.min(answer / 10, 1);
          questionMaxScore = 1;
        }

        categoryScores[category].score += questionScore;
        categoryScores[category].maxScore += questionMaxScore;
        totalScore += questionScore;
        maxScore += questionMaxScore;
      }
    });

    const overallScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    
    let level = "Basic";
    let levelColor = "bg-gray-100 text-gray-800";
    
    if (overallScore >= 80) {
      level = "Excellent";
      levelColor = "bg-green-100 text-green-800";
    } else if (overallScore >= 60) {
      level = "Good";
      levelColor = "bg-blue-100 text-blue-800";
    } else if (overallScore >= 40) {
      level = "Fair";
      levelColor = "bg-yellow-100 text-yellow-800";
    }

    return {
      overallScore: Math.round(overallScore),
      level,
      levelColor,
      categoryScores,
      totalQuestions: surveyQuestions.length,
      answeredQuestions: Object.keys(answers).length
    };
  };

  const renderQuestion = () => {
    if (!currentQ) return null;

    const questionText = language === "sw" ? currentQ.questionSwahili : currentQ.question;
    const sectionText = language === "sw" ? currentQ.sectionSwahili : currentQ.section;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              {sectionText}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {surveyQuestions.length}
            </span>
          </div>
          <CardTitle className="text-xl">{questionText}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQ.type === "text" && (
            <Input
              value={answers[currentQ.id] || ""}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              placeholder={language === "sw" ? "Jibu hapa..." : "Answer here..."}
            />
          )}

          {currentQ.type === "number" && (
            <Input
              type="number"
              value={answers[currentQ.id] || ""}
              onChange={(e) => handleAnswer(currentQ.id, parseInt(e.target.value) || 0)}
              placeholder={language === "sw" ? "Nambari..." : "Number..."}
            />
          )}

          {currentQ.type === "textarea" && (
            <Textarea
              value={answers[currentQ.id] || ""}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              placeholder={language === "sw" ? "Jibu hapa..." : "Answer here..."}
              rows={4}
            />
          )}

          {currentQ.type === "radio" && currentQ.options && (
            <RadioGroup
              value={answers[currentQ.id] || ""}
              onValueChange={(value) => handleAnswer(currentQ.id, value)}
            >
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>
                    {language === "sw" ? option.labelSwahili : option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQ.type === "checkbox" && currentQ.options && (
            <div className="space-y-2">
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={Array.isArray(answers[currentQ.id]) && answers[currentQ.id].includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentAnswers = Array.isArray(answers[currentQ.id]) ? answers[currentQ.id] : [];
                      if (checked) {
                        handleAnswer(currentQ.id, [...currentAnswers, option.value]);
                      } else {
                        handleAnswer(currentQ.id, currentAnswers.filter((a: string) => a !== option.value));
                      }
                    }}
                  />
                  <Label htmlFor={option.value}>
                    {language === "sw" ? option.labelSwahili : option.label}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {currentQ.type === "select" && currentQ.options && (
            <RadioGroup
              value={answers[currentQ.id] || ""}
              onValueChange={(value) => handleAnswer(currentQ.id, value)}
            >
              {currentQ.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>
                    {language === "sw" ? option.labelSwahili : option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "sw" ? "Iliyotangulia" : "Previous"}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={currentQ.required && !answers[currentQ.id]}
            >
              {currentQuestion === surveyQuestions.length - 1 
                ? (language === "sw" ? "Maliza" : "Complete") 
                : (language === "sw" ? "Ifuatayo" : "Next")
              }
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Award className="w-6 h-6" />
            {language === "sw" ? "Matokeo ya Uchunguzi" : "Survey Results"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {results.overallScore}%
            </div>
            <Badge className={`text-lg px-4 py-2 ${results.levelColor}`}>
              {results.level} {language === "sw" ? "Uongozi" : "Creditworthiness"}
            </Badge>
            <p className="text-muted-foreground mt-2">
              {language === "sw" 
                ? `${results.answeredQuestions} kati ya ${results.totalQuestions} maswali yamejibiwa`
                : `${results.answeredQuestions} out of ${results.totalQuestions} questions answered`
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(results.categoryScores).map(([category, scoreData]) => {
              const percentage = scoreData.maxScore > 0 ? (scoreData.score / scoreData.maxScore) * 100 : 0;
              return (
                <Card key={category} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-sm">{category}</h3>
                    <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </Card>
              );
            })}
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {language === "sw" ? "Mapendekezo" : "Recommendations"}
            </h3>
            <ul className="text-green-700 space-y-1 text-sm">
              {results.overallScore >= 80 && (
                <li>• {language === "sw" ? "Una uongozi bora wa biashara! Endelea kujenga uhusiano na wateja." : "Excellent business creditworthiness! Continue building client relationships."}</li>
              )}
              {results.overallScore < 80 && (
                <li>• {language === "sw" ? "Fikiria kuboresha mfumo wa kufanya kazi na uhusiano na wateja." : "Consider improving your workflow system and client relationships."}</li>
              )}
              {results.overallScore < 60 && (
                <li>• {language === "sw" ? "Unaweza kufaidika kutoka kwa mafunzo ya biashara na uongozi." : "You could benefit from business training and mentorship."}</li>
              )}
            </ul>
          </div>

          <div className="flex justify-center">
            <Button onClick={() => window.location.href = "/dashboard"}>
              {language === "sw" ? "Rudi kwenye Dashboard" : "Back to Dashboard"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">
              {language === "sw" ? "Uchunguzi wa Uongozi wa Biashara" : "Business Creditworthiness Survey"}
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === "sw" 
              ? "Tathmini biashara yako ya ubunifu kwa sababu zisizo za kifedha na upate mapendekezo ya kuboresha uongozi wako wa biashara."
              : "Assess your creative business on non-financial factors and get recommendations to improve your business creditworthiness."
            }
          </p>
        </div>

        {!isComplete && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>{language === "sw" ? "Maendeleo" : "Progress"}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {isComplete ? renderResults() : renderQuestion()}
      </div>
    </div>
  );
};
