import { createContext, useContext, useState, ReactNode } from "react";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'file';
}

interface ChatbotContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  setIsOpen: (open: boolean) => void;
  sendMessage: (text: string) => Promise<void>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider = ({ children }: ChatbotProviderProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your HEVA assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your HEVA assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };

  const sendChatMessage = async (message: string): Promise<string> => {
    // 🔌 Placeholder for backend call
    console.log("Sending chat message:", message);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple response logic
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('eligible') || lowerMessage.includes('stahili')) {
      return "To check your eligibility, you need to be a Kenyan citizen over 18, have a valid ID, business registration, and be willing to share financial data. Would you like to start the eligibility check?";
    }
    
    if (lowerMessage.includes('document') || lowerMessage.includes('nyaraka')) {
      return "You'll need: ID documents, business registration, M-Pesa statements (6 months), utility bills (3 months), and optionally bank statements. All documents should be clear and recent.";
    }
    
    if (lowerMessage.includes('score') || lowerMessage.includes('alama')) {
      return "Your credit score is calculated based on: financial consistency (30%), digital presence (25%), business performance (25%), and payment history (20%). We analyze your M-Pesa, bank, and utility payment patterns.";
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('muda')) {
      return "Approval timelines vary: Grants take 2-4 weeks, loans 1-2 weeks, and investments 4-8 weeks. The process includes document review, credit assessment, and final approval.";
    }
    
    return "I'm here to help! You can ask me about eligibility, required documents, credit scoring, or application timelines. What would you like to know?";
  };

  const sendMessage = async (text: string) => {
    // Add user message
    addMessage({ text, sender: 'user' });
    
    try {
      const response = await sendChatMessage(text);
      addMessage({ text: response, sender: 'bot' });
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage({ 
        text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
        sender: 'bot' 
      });
    }
  };

  const value: ChatbotContextType = {
    messages,
    isOpen,
    addMessage,
    clearMessages,
    setIsOpen,
    sendMessage
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
}; 