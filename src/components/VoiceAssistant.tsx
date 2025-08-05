import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { useUserSettings } from "@/context/UserSettingsContext";

export const VoiceAssistant = () => {
  const { settings } = useUserSettings();
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if (!settings.voiceAssistant) return;
    setIsListening(true);
    
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      // In real app, this would process voice input
      console.log("Voice command processed");
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  if (!settings.voiceAssistant) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-center gap-2">
        {isListening && (
          <Badge variant="default" className="animate-pulse">
            Listening...
          </Badge>
        )}
        
        <Button
          onClick={isListening ? stopListening : startListening}
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg"
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>
      </div>
    </div>
  );
}; 