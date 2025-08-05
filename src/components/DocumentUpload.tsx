import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Trash2,
  ArrowRight,
  Info,
  Lock
} from "lucide-react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: Date;
  status: 'uploading' | 'completed' | 'error';
  progress?: number;
  documentType: string;
}

interface DocumentField {
  id: string;
  title: string;
  titleSwahili: string;
  description: string;
  descriptionSwahili: string;
  required: boolean;
  maxFiles: number;
  acceptedTypes: string[];
  maxSize: number; // in MB
  icon: React.ReactNode;
}

interface DocumentUploadProps {
  language?: "en" | "sw";
  onComplete?: (documents: Record<string, UploadedFile[]>) => void;
}

export const DocumentUpload = ({ 
  language = "en", 
  onComplete 
}: DocumentUploadProps) => {
  const navigate = useNavigate();
  const { createUserAccount } = useAuth();
  const [documents, setDocuments] = useState<Record<string, UploadedFile[]>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password setup state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const documentFields: DocumentField[] = [
    {
      id: "utility_bills",
      title: "Utility Bills",
      titleSwahili: "Bili za Huduma",
      description: "KPLC, water, internet bills (last 3 months)",
      descriptionSwahili: "Bili za KPLC, maji, mtandao (miezi 3 ya mwisho)",
      required: true,
      maxFiles: 5,
      acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSize: 10,
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: "mpesa_statements",
      title: "M-Pesa Statements",
      titleSwahili: "Taarifa za M-Pesa",
      description: "M-Pesa transaction statements (last 6 months)",
      descriptionSwahili: "Taarifa za miamala ya M-Pesa (miezi 6 ya mwisho)",
      required: true,
      maxFiles: 10,
      acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSize: 15,
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: "bank_statements",
      title: "Bank Statements",
      titleSwahili: "Taarifa za Benki",
      description: "Business bank account statements (if available)",
      descriptionSwahili: "Taarifa za akaunti ya benki ya biashara (ikiwa zinapatikana)",
      required: false,
      maxFiles: 8,
      acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSize: 20,
      icon: <FileText className="w-5 h-5" />
    },
    {
      id: "business_registration",
      title: "Business Registration",
      titleSwahili: "Usajili wa Biashara",
      description: "Business registration certificate or license",
      descriptionSwahili: "Cheti cha usajili wa biashara au leseni",
      required: true,
      maxFiles: 3,
      acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSize: 10,
      icon: <File className="w-5 h-5" />
    },
    {
      id: "id_documents",
      title: "ID Documents",
      titleSwahili: "Nyaraka za Kitambulisho",
      description: "National ID, passport, or driving license",
      descriptionSwahili: "Kitambulisho cha taifa, pasipoti, au leseni ya kuendesha",
      required: true,
      maxFiles: 2,
      acceptedTypes: [".pdf", ".jpg", ".jpeg", ".png"],
      maxSize: 8,
      icon: <Image className="w-5 h-5" />
    }
  ];

  // 🔌 Placeholder for backend call - Upload single document
  const uploadSingleDocument = async (docType: string, file: File): Promise<UploadedFile> => {
    console.log("Uploading single document:", { docType, fileName: file.name });
    
    const fileId = `${docType}_${Date.now()}_${Math.random()}`;
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading',
      progress: 0,
      documentType: docType
    };
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      uploadedFile.progress = progress;
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    uploadedFile.status = 'completed';
    uploadedFile.url = URL.createObjectURL(file);
    
    // 🔌 Backend integration: Save document info to database
    console.log("Saving document to database:", {
      id: fileId,
      name: file.name,
      type: docType,
      size: file.size,
      uploadedAt: uploadedFile.uploadedAt
    });
    
    return uploadedFile;
  };

  // 🔌 Placeholder for backend call - Delete single document
  const deleteSingleDocument = async (docType: string, fileId: string): Promise<boolean> => {
    console.log("Deleting document:", { docType, fileId });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 🔌 Backend integration: Remove document from database and server
    console.log("Removing document from database and server:", fileId);
    
    return true;
  };

  const handleFileSelect = async (fieldId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const field = documentFields.find(f => f.id === fieldId);
    if (!field) return;
    
    // Only process the first file (single upload)
    const file = files[0];
    const currentFiles = documents[fieldId] || [];
    
    // Check if adding this file would exceed maxFiles
    if (currentFiles.length >= field.maxFiles) {
      alert(language === "en" 
        ? `Maximum ${field.maxFiles} files allowed for ${field.title}`
        : `Faili za juu zaidi ${field.maxFiles} zinazoruhusiwa kwa ${field.titleSwahili}`
      );
      return;
    }
    
    // Validate file type
    const isValidType = field.acceptedTypes.some(type => 
      file.name.toLowerCase().endsWith(type.replace('.', '')) ||
      file.type.includes(type.replace('.', ''))
    );
    
    if (!isValidType) {
      alert(language === "en"
        ? `Invalid file type. Accepted: ${field.acceptedTypes.join(', ')}`
        : `Aina ya faili isiyo halali. Inayokubalika: ${field.acceptedTypes.join(', ')}`
      );
      return;
    }
    
    // Validate file size
    if (file.size > field.maxSize * 1024 * 1024) {
      alert(language === "en"
        ? `File too large. Maximum size: ${field.maxSize}MB`
        : `Faili kubwa sana. Ukubwa wa juu: ${field.maxSize}MB`
      );
      return;
    }
    
    setUploadingFiles(prev => ({ ...prev, [fieldId]: true }));
    
    try {
      const uploadedFile = await uploadSingleDocument(fieldId, file);
      
      // Add the uploaded file to the documents state
      setDocuments(prev => ({
        ...prev,
        [fieldId]: [...(prev[fieldId] || []), uploadedFile]
      }));
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const handleRemoveFile = async (fieldId: string, fileId: string) => {
    try {
      const success = await deleteSingleDocument(fieldId, fileId);
      
      if (success) {
        setDocuments(prev => ({
          ...prev,
          [fieldId]: prev[fieldId]?.filter(file => file.id !== fileId) || []
        }));
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const isFormComplete = () => {
    const documentsComplete = documentFields.every(field => {
      if (!field.required) return true;
      const fieldFiles = documents[field.id] || [];
      return fieldFiles.length > 0 && fieldFiles.every(file => file.status === 'completed');
    });
    
    // Check password validation
    const passwordValid = password.length >= 8 && password === confirmPassword;
    
    return documentsComplete && passwordValid;
  };

  const getCompletionPercentage = () => {
    const requiredFields = documentFields.filter(field => field.required);
    const completedFields = requiredFields.filter(field => {
      const fieldFiles = documents[field.id] || [];
      return fieldFiles.length > 0 && fieldFiles.every(file => file.status === 'completed');
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const handleSubmit = async () => {
    if (!isFormComplete()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get business profile data to access business email
      const businessProfileData = localStorage.getItem("businessProfile");
      let businessProfile = null;
      
      if (businessProfileData) {
        try {
          businessProfile = JSON.parse(businessProfileData);
        } catch (e) {
          console.error("Error parsing business profile:", e);
        }
      }
      
      // 🔌 Backend integration: Save all document data
      console.log("Saving all document data:", documents);
      
      // 🔌 Backend integration: Save user credentials securely
      console.log("Saving user credentials:", {
        email: businessProfile?.businessEmail,
        password: "***HASHED_PASSWORD***" // In real implementation, hash the password
      });
      
      // Create user account after successful application completion
      const userData = {
        name: businessProfile?.applicantName || "New User",
        email: businessProfile?.businessEmail || "user@example.com",
        businessName: businessProfile?.businessName || "Business",
        sector: businessProfile?.creatorSector || "Creative"
      };
      
      const accountCreated = await createUserAccount(userData);
      
      if (accountCreated) {
        if (onComplete) {
          onComplete(documents);
        }
        
        // Navigate to user dashboard
        navigate("/dashboard");
      } else {
        throw new Error("Failed to create user account");
      }
    } catch (error) {
      console.error("Error submitting documents:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          {language === "en" ? "Document Upload" : "Kupakia Nyaraka"}
        </h1>
        <p className="text-lg text-muted-foreground">
          {language === "en"
            ? "Upload the required documents to complete your application"
            : "Pakia nyaraka zinazohitajika kukamilisha ombi lako"
          }
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {getCompletionPercentage()}%
            </div>
            <div className="text-sm text-muted-foreground">
              {language === "en" ? "Complete" : "Imekamilika"}
            </div>
          </div>
          <Progress value={getCompletionPercentage()} className="w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documentFields.map((field) => {
          const fieldFiles = documents[field.id] || [];
          const isUploading = uploadingFiles[field.id];
          
          return (
            <Card key={field.id} className="relative">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {field.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {language === "en" ? field.title : field.titleSwahili}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </CardTitle>
                    <CardDescription>
                      {language === "en" ? field.description : field.descriptionSwahili}
                    </CardDescription>
                  </div>
                  <Badge variant={field.required ? "default" : "secondary"}>
                    {field.required 
                      ? (language === "en" ? "Required" : "Inahitajika")
                      : (language === "en" ? "Optional" : "Hiari")
                    }
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept={field.acceptedTypes.join(',')}
                    onChange={(e) => handleFileSelect(field.id, e.target.files)}
                    className="hidden"
                    id={`upload-${field.id}`}
                    disabled={isUploading}
                  />
                  <label htmlFor={`upload-${field.id}`} className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {isUploading 
                        ? (language === "en" ? "Uploading..." : "Inapakia...")
                        : (language === "en" ? "Click to upload one document" : "Bofya kupakia nyaraka moja")
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {language === "en"
                        ? `Max ${field.maxFiles} files, ${field.maxSize}MB each`
                        : `Faili za juu zaidi ${field.maxFiles}, ${field.maxSize}MB kila moja`
                      }
                    </p>
                  </label>
                </div>

                {/* File List */}
                {fieldFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">
                      {language === "en" ? "Uploaded Files" : "Faili Zilizopakiwa"}
                      <span className="text-muted-foreground ml-2">
                        ({fieldFiles.length}/{field.maxFiles})
                      </span>
                    </h4>
                    
                    <div className="space-y-2">
                      {fieldFiles.map((file) => (
                        <div key={file.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <File className="w-4 h-4 text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                          
                          {file.status === 'uploading' && file.progress !== undefined && (
                            <div className="flex items-center gap-2">
                              <Progress value={file.progress} className="w-16" />
                              <span className="text-xs">{file.progress}%</span>
                            </div>
                          )}
                          
                          {file.status === 'completed' && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(field.id, file.id)}
                                title={language === "en" ? "Delete document" : "Futa nyaraka"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          
                          {file.status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Password Setup Section */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {language === "en" ? "Set Up Your Account" : "Weka Akaunti Yako"}
              </CardTitle>
              <CardDescription>
                {language === "en" 
                  ? "Create your login credentials to access the dashboard"
                  : "Unda mamlaka yako ya kuingia kufikia dashibodi"
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                {language === "en" ? "Password" : "Nywila"} *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === "en" ? "Enter your password" : "Ingiza nywila yako"}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {password.length > 0 && password.length < 8 && (
                <p className="text-xs text-red-600">
                  {language === "en" 
                    ? "Password must be at least 8 characters long"
                    : "Nywila lazima iwe na herufi 8 au zaidi"
                  }
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {language === "en" ? "Confirm Password" : "Thibitisha Nywila"} *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={language === "en" ? "Confirm your password" : "Thibitisha nywila yako"}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-red-600">
                  {language === "en" 
                    ? "Passwords do not match"
                    : "Nywila hazifanani"
                  }
                </p>
              )}
            </div>
          </div>
          
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {language === "en" 
                ? "Your business email will be used as your username to access the dashboard."
                : "Barua pepe ya biashara yako itatumika kama jina la mtumiaji kufikia dashibodi."
              }
            </AlertDescription>
          </Alert>
          
          {password.length >= 8 && password === confirmPassword && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">
                {language === "en" 
                  ? "Password setup complete"
                  : "Mpangilio wa nywila umekamilika"
                }
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {language === "en" ? "Ready to Submit?" : "Tayari Kwasilisha?"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === "en"
                  ? "All required documents must be uploaded before proceeding"
                  : "Nyaraka zote zinazohitajika lazima zipakiwe kabla ya kuendelea"
                }
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!isFormComplete() || isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {language === "en" ? "Creating Account..." : "Inatengeneza Akaunti..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {language === "en" ? "Complete Application & Create Account" : "Kamilisha Ombi na Tengeneza Akaunti"}
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {language === "en"
            ? "All documents are securely encrypted and only accessible to authorized HEVA staff. Your privacy is protected. After submission, your account will be automatically created."
            : "Nyaraka zote zimefungwa kwa usalama na zinapatikana tu kwa wafanyakazi walioidhinishwa wa HEVA. Faragha yako imelindwa. Baada ya kwasilisha, akaunti yako itatengenezwa kiotomatiki."
          }
        </AlertDescription>
      </Alert>
    </div>
  );
}; 