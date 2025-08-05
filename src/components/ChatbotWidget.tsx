import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Loader2,
  HelpCircle,
  FileText,
  Calculator,
  TrendingUp
} from "lucide-react";
import { useChatbot } from "@/context/ChatbotContext";

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'file';
}

interface QuickReply {
  id: string;
  text: string;
  action?: string;
}

interface ChatbotWidgetProps {
  language?: "en" | "sw";
  className?: string;
}

export const ChatbotWidget = ({ 
  language = "en", 
  className = "" 
}: ChatbotWidgetProps) => {
  const { messages, isOpen, setIsOpen, sendMessage } = useChatbot();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickReplies: QuickReply[] = [
    {
      id: 'eligibility',
      text: language === "en" ? "Am I eligible?" : "Je, ninastahili?",
      action: 'eligibility_check'
    },
    {
      id: 'documents',
      text: language === "en" ? "What documents do I need?" : "Nyaraka zipi ninazohitaji?",
      action: 'document_requirements'
    },
    {
      id: 'score',
      text: language === "en" ? "How is my credit score calculated?" : "Alama yangu ya mkopo inahesabiwa vipi?",
      action: 'score_calculation'
    },
    {
      id: 'timeline',
      text: language === "en" ? "How long does approval take?" : "Inachukua muda gani kuidhinisha?",
      action: 'approval_timeline'
    }
  ];



  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    setInputValue("");
    setIsTyping(true);
    
    try {
      await sendMessage(inputValue);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = async (quickReply: QuickReply) => {
    setIsTyping(true);
    
    try {
      await sendMessage(quickReply.text);
    } catch (error) {
      console.error("Error sending quick reply:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className={`fixed bottom-4 left-4 z-50 ${className}`}>
      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 h-96 mb-4 shadow-xl border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm">HEVA Assistant</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {language === "en" ? "Online" : "Mtandaoni"}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 h-full flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">
                          {language === "en" ? "Typing..." : "Inaandika..."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Quick Replies */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2">
                  {language === "en" ? "Quick questions:" : "Maswali ya haraka:"}
                </p>
                <div className="flex flex-wrap gap-1">
                  {quickReplies.map((reply) => (
                    <Button
                      key={reply.id}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={language === "en" ? "Type your message..." : "Andika ujumbe wako..."}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className="w-14 h-14 rounded-full shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>
    </div>
  );
}; 