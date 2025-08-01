import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, Loader2, MessageCircle, X, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Mic, MicOff } from "lucide-react";


interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      message: "Hi! I'm your KPI Assistant. Ask me anything about your project data, teams, or analytics!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const WEBHOOK_URL = "https://soumya07yt.app.n8n.cloud/webhook/kpissssada";
const {
  transcript,
  listening,
  resetTranscript,
  browserSupportsSpeechRecognition
} = useSpeechRecognition();

useEffect(() => {
  // When speech ends and transcript is ready
  if (!listening && transcript) {
    setInput(transcript);
    resetTranscript();
  }
}, [listening, transcript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const minimizeChatbot = () => {
    setIsMinimized(true);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: input.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.message,
          timestamp: userMessage.timestamp.toISOString(),
          source: "dashboard_chatbot",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Simulate typing delay for better UX
      setTimeout(() => {
        const botReply = Array.isArray(data) ? data[0]?.output : data.output || data.message || JSON.stringify(data);

const botMessage: ChatMessage = {
  id: (Date.now() + 1).toString(),
  message: botReply || "Sorry, I didn’t get that.",
  isUser: false,
  timestamp: new Date(),
};

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      
      setTimeout(() => {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: "Sorry, I couldn't process your request. Please check your connection and try again.",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
        
        toast({
          title: "Connection Error",
          description: "Failed to connect to KPI assistant",
          variant: "destructive",
        });
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChatbot}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300 ease-out",
            "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
            "hover:scale-110 hover:shadow-xl animate-pulse",
            "border-2 border-primary/20"
          )}
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </Button>
        
        {/* Notification dot */}
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full animate-bounce">
          <div className="h-full w-full bg-destructive rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card 
        className={cn(
          "w-96 h-[500px] flex flex-col shadow-2xl border-0",
          "bg-background/95 backdrop-blur-md",
          "transition-all duration-500 ease-out",
          isMinimized ? "h-16" : "h-[500px]",
          "animate-scale-in"
        )}
      >
        <CardHeader className="pb-3 px-4 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="relative">
                <Bot className="h-5 w-5" />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-background"></div>
              </div>
              KPI Assistant
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={minimizeChatbot}
                className="h-8 w-8 p-0 hover:bg-white/20 text-primary-foreground"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChatbot}
                className="h-8 w-8 p-0 hover:bg-white/20 text-primary-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <p className="text-primary-foreground/80 text-sm">
              Online • Ask about your projects & KPIs
            </p>
          )}
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="flex flex-col flex-1 gap-4 p-0">
            <ScrollArea className="px-4 py-2 h-[340px] overflow-y-auto">

              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-3 animate-fade-in",
                      message.isUser ? "flex-row-reverse" : "flex-row"
                    )}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                      message.isUser 
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg" 
                        : "bg-muted text-muted-foreground border-2 border-border"
                    )}>
                      {message.isUser ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2 transition-all duration-200",
                      message.isUser
                        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground ml-auto shadow-md" 
                        : "bg-muted/50 text-foreground border border-border/50"
                    )}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(isLoading || isTyping) && (
                  <div className="flex items-start gap-3 animate-fade-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="bg-muted/50 rounded-2xl px-4 py-3 flex items-center gap-2 border border-border/50">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-border/20 bg-muted/20">
              <div className="flex gap-2">
  <Input
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyPress={handleKeyPress}
    placeholder="Ask about KPIs, teams, projects..."
    disabled={isLoading}
    className="flex-1 border-border/50 focus:border-primary/50 bg-background/50"
  />
  
  {/* Mic Button */}
  <Button
    type="button"
    size="icon"
    variant="ghost"
    onClick={() => {
      if (!browserSupportsSpeechRecognition) {
        toast({
          title: "Voice not supported",
          description: "Your browser does not support speech recognition.",
          variant: "destructive",
        });
        return;
      }

      if (listening) {
        SpeechRecognition.stopListening();
      } else {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: false });
      }
    }}
    className={cn(
      "border rounded-full px-1",
      listening ? "bg-green-100" : "hover:bg-muted/40"
    )}
  >
    {listening ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
  </Button>

  <Button 
    onClick={sendMessage} 
    disabled={!input.trim() || isLoading}
    size="sm"
    className={cn(
      "px-3 transition-all duration-200",
      "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      !input.trim() || isLoading ? "" : "hover:scale-105 hover:shadow-md"
    )}
  >
    {isLoading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Send className="h-4 w-4" />
    )}
  </Button>
</div>

<p className="text-xs text-muted-foreground mt-2 text-center">
  Powered by AI{" "}
  <a
    href="https://www.soumyaroy.site"
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary hover:text-primary/80"
  >
    ❤️Soumya
  </a>{" "}
  • Real-time KPI insights
</p>

            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}