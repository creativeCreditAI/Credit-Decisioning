import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Star,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useUserSettings } from "@/context/UserSettingsContext";

interface FeedbackData {
  overallExperience: number;
  applicationProcess: number;
  userInterface: number;
  customerSupport: number;
  suggestions: string;
  category: "general" | "application" | "technical" | "support";
}

export const FeedbackForm = () => {
  const { currentLanguage } = useUserSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [feedback, setFeedback] = useState<FeedbackData>({
    overallExperience: 0,
    applicationProcess: 0,
    userInterface: 0,
    customerSupport: 0,
    suggestions: "",
    category: "general"
  });

  const handleRatingChange = (field: keyof FeedbackData, value: number) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    try {
      console.log("Submitting feedback:", feedback);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage({ type: 'success', text: 'Thank you for your feedback!' });
      setIsSubmitted(true);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit feedback. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number, field: keyof FeedbackData) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(field, star)}
            className={`p-1 transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank you for your feedback!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback helps us make HEVA better for everyone.
          </p>
          <Button onClick={() => setIsSubmitted(false)}>
            Submit Another Feedback
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Feedback & Suggestions
        </CardTitle>
        <CardDescription>
          Help us improve HEVA by sharing your experience
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rate your experience</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Overall Experience</Label>
                {renderStars(feedback.overallExperience, "overallExperience")}
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Application Process</Label>
                {renderStars(feedback.applicationProcess, "applicationProcess")}
              </div>
              
              <div className="flex items-center justify-between">
                <Label>User Interface</Label>
                {renderStars(feedback.userInterface, "userInterface")}
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Customer Support</Label>
                {renderStars(feedback.customerSupport, "customerSupport")}
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label>Feedback Category</Label>
            <Select 
              value={feedback.category} 
              onValueChange={(value: any) => setFeedback(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="application">Application Process</SelectItem>
                <SelectItem value="technical">Technical Issues</SelectItem>
                <SelectItem value="support">Customer Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Suggestions Section */}
          <div className="space-y-3">
            <Label>Additional suggestions</Label>
            <Textarea
              value={feedback.suggestions}
              onChange={(e) => setFeedback(prev => ({ ...prev, suggestions: e.target.value }))}
              placeholder="Share your ideas for improving HEVA..."
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit Feedback
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 