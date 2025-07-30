import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface WhatsAppChatbotProps {
  language?: "en" | "sw";
}

export const WhatsAppChatbot = ({ language = "en" }: WhatsAppChatbotProps) => {
  const handleWhatsAppChat = () => {
    // 🔌 WhatsApp integration - Open chat with official WhatsApp bot
    const phoneNumber = "+254700000000"; // Replace with actual HEVA WhatsApp number
    const message = "Hello! I need help with my HEVA application.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleWhatsAppChat}
        size="lg"
        className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 shadow-lg"
        title={language === "en" ? "Chat with HEVA Support on WhatsApp" : "Ongea na Msaada wa HEVA kwenye WhatsApp"}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    </div>
  );
}; 