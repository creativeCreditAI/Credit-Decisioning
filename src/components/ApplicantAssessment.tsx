import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Save, 
  Clock, 
  User, 
  FileText, 
  Eye, 
  CheckCircle,
  Loader2
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

interface ApplicantAssessmentProps {
  applicantId: string;
  applicantName: string;
  language: "en" | "sw";
  canModifySettings: boolean;
}

export const ApplicantAssessment = ({ 
  applicantId, 
  applicantName, 
  language, 
  canModifySettings 
}: ApplicantAssessmentProps) => {
  const { saveAssessment, loadAssessment, loading } = useAdmin();
  
  const [faceValueOutput, setFaceValueOutput] = useState("");
  const [adminAssessment, setAdminAssessment] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [updatedBy, setUpdatedBy] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showFaceValue, setShowFaceValue] = useState(true);
  const [showAdminReview, setShowAdminReview] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load saved assessments on component mount
  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const [faceValue, adminReview] = await Promise.all([
          loadAssessment(applicantId, 'face_value'),
          loadAssessment(applicantId, 'admin_review')
        ]);
        
        setFaceValueOutput(faceValue);
        setAdminAssessment(adminReview);
        setLastUpdated(new Date());
        setUpdatedBy("Admin Manager");
      } catch (error) {
        console.error("Failed to load assessments:", error);
      }
    };

    loadAssessments();
  }, [applicantId, loadAssessment]);

  const handleSaveFaceValue = async () => {
    if (!faceValueOutput.trim()) return;
    
    setIsSaving(true);
    try {
      await saveAssessment(applicantId, 'face_value', faceValueOutput);
      setLastSaved(new Date());
      setLastUpdated(new Date());
      setUpdatedBy("Admin Manager");
    } catch (error) {
      console.error("Failed to save face value output:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAdminAssessment = async () => {
    if (!adminAssessment.trim()) return;
    
    setIsSaving(true);
    try {
      await saveAssessment(applicantId, 'admin_review', adminAssessment);
      setLastSaved(new Date());
      setLastUpdated(new Date());
      setUpdatedBy("Admin Manager");
    } catch (error) {
      console.error("Failed to save admin assessment:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString(language === "en" ? "en-US" : "sw-KE", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Assessment Tools Visibility Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {language === "en" ? "Assessment Tools Visibility" : "Uonekano wa Zana za Tathmini"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <Label>{language === "en" ? "Show Face Value Output" : "Onyesha Matokeo ya Thamani ya Uso"}</Label>
            </div>
            <Switch
              checked={showFaceValue}
              onCheckedChange={setShowFaceValue}
              disabled={!canModifySettings}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <Label>{language === "en" ? "Show Admin Assessment" : "Onyesha Tathmini ya Msimamizi"}</Label>
            </div>
            <Switch
              checked={showAdminReview}
              onCheckedChange={setShowAdminReview}
              disabled={!canModifySettings}
            />
          </div>
        </CardContent>
      </Card>

      {/* Face Value Output */}
      {showFaceValue && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {language === "en" ? "Face Value Output" : "Matokeo ya Thamani ya Uso"}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {language === "en" ? "Editable Assessment" : "Tathmini Inayoweza Kuhaririwa"}
              </Badge>
              {lastUpdated && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {language === "en" ? "Last updated:" : "Ilisasishwa mwisho:"} {formatTimestamp(lastUpdated)}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="face-value-output">
                {language === "en" ? "Face Value Assessment" : "Tathmini ya Thamani ya Uso"}
              </Label>
              <Textarea
                id="face-value-output"
                placeholder={language === "en" 
                  ? "Enter your face value assessment of the applicant's business potential, presentation, and overall impression..."
                  : "Ingiza tathmini yako ya thamani ya uso ya uwezo wa biashara wa mwombaji, uwasilishaji, na mtazamo wa jumla..."
                }
                value={faceValueOutput}
                onChange={(e) => setFaceValueOutput(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {lastSaved && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>
                      {language === "en" ? "Saved:" : "Imehifadhiwa:"} {formatTimestamp(lastSaved)}
                    </span>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleSaveFaceValue}
                disabled={!faceValueOutput.trim() || isSaving || !canModifySettings}
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {language === "en" ? "Save to DB" : "Hifadhi kwenye DB"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Assessment */}
      {showAdminReview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {language === "en" ? "Admin Assessment" : "Tathmini ya Msimamizi"}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {language === "en" ? "Formal Review" : "Mapitio Rasmi"}
              </Badge>
              {lastUpdated && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {language === "en" ? "Last updated:" : "Ilisasishwa mwisho:"} {formatTimestamp(lastUpdated)}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-assessment">
                {language === "en" ? "Formal Admin Review" : "Mapitio Rasmi ya Msimamizi"}
              </Label>
              <Textarea
                id="admin-assessment"
                placeholder={language === "en" 
                  ? "Enter your formal administrative assessment, including recommendations, risk analysis, and approval conditions..."
                  : "Ingiza tathmini yako rasmi ya kiutawala, ikijumuisha mapendekezo, uchambuzi wa hatari, na masharti ya idhini..."
                }
                value={adminAssessment}
                onChange={(e) => setAdminAssessment(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {lastSaved && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>
                      {language === "en" ? "Saved:" : "Imehifadhiwa:"} {formatTimestamp(lastSaved)}
                    </span>
                  </div>
                )}
                {updatedBy && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{updatedBy}</span>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={handleSaveAdminAssessment}
                disabled={!adminAssessment.trim() || isSaving || !canModifySettings}
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {language === "en" ? "Save Assessment" : "Hifadhi Tathmini"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicantAssessment; 