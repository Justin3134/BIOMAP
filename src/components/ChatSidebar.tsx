import { useState, useRef, useEffect } from "react";
import { ResearchProject } from "@/types/research";
import { Send, X, Sparkles, MessageSquare } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  basedOn?: string[]; // Project titles this answer is based on
}

interface ChatSidebarProps {
  contextProjects: ResearchProject[];
  onRemoveContext: (projectId: string) => void;
  onAskAboutText?: (text: string) => void;
}

const SMART_PROMPTS = [
  { label: "Failure risks", prompt: "What are the biggest failure risks?" },
  { label: "Cheapest version", prompt: "What would be the cheapest version of this?" },
  { label: "Combine ideas", prompt: "How can I combine this with my idea?" },
  { label: "What's weak", prompt: "What's missing or weak in this approach?" },
  { label: "First steps", prompt: "What should I do first?" },
  { label: "2-week plan", prompt: "If I only have 2 weeks, what changes?" },
];

const ChatSidebar = ({ contextProjects, onRemoveContext, onAskAboutText }: ChatSidebarProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMockResponse = (userMessage: string): ChatMessage => {
    // Mock AI response based on context
    const projectTitles = contextProjects.map(p => p.title);
    
    const responses: Record<string, string> = {
      "failure risks": `Based on the selected research, the main failure risks include: scaling challenges when moving from lab to field conditions, unexpected environmental interactions, and regulatory approval timelines. Most similar projects encountered difficulties with reproducibility outside controlled settings.`,
      "cheapest": `Looking at similar approaches, the most cost-effective path would be to start with computational modeling before any wet lab work. Projects that validated hypotheses in silico first saved 40-60% on initial costs.`,
      "combine": `Your idea could integrate well with the enzyme optimization techniques from the selected research. Consider adapting their substrate specificity methods while maintaining your unique approach to delivery mechanisms.`,
      "weak": `The main gaps in this approach are: limited long-term stability data, potential off-target effects not fully characterized, and scalability concerns for commercial production.`,
      "first": `Based on successful similar projects, your first steps should be: 1) Literature review of the specific pathway, 2) Identify 2-3 model organisms for initial testing, 3) Design preliminary assays for proof-of-concept.`,
      "2 weeks": `For a 2-week sprint: Focus solely on proof-of-concept using existing protocols from similar research. Skip optimization—just demonstrate feasibility. Use the enzyme systems already validated in the literature.`,
    };

    const lowerMessage = userMessage.toLowerCase();
    let responseContent = "Based on the selected research context, I can help you explore this further. Could you be more specific about what aspect you'd like to understand better?";
    
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        responseContent = response;
        break;
      }
    }

    if (contextProjects.length === 0) {
      responseContent = "Please select at least one research project from the canvas to provide context for our discussion. Click on any project node to add it to the context.";
    }

    return {
      id: Date.now().toString(),
      role: "assistant",
      content: responseContent,
      basedOn: contextProjects.length > 0 ? projectTitles : undefined,
    };
  };

  const handleSend = async (message?: string) => {
    const messageToSend = message || input.trim();
    if (!messageToSend) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageToSend,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponse = generateMockResponse(messageToSend);
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-[360px] h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-serif font-semibold text-foreground">Research Assistant</h2>
        </div>
        
        {/* Context Indicator */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">
            {contextProjects.length > 0 ? "Asking about:" : "No context selected"}
          </span>
          {contextProjects.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {contextProjects.map(project => (
                <span
                  key={project.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  <span className="max-w-[120px] truncate">{project.title}</span>
                  <button
                    onClick={() => onRemoveContext(project.id)}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/70 italic">
              Click a project node to add context
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Select research projects and ask questions about them
            </p>
          </div>
        )}
        
        {messages.map(message => (
          <div
            key={message.id}
            className={`${
              message.role === "user" 
                ? "ml-8" 
                : "mr-4"
            }`}
          >
            <div
              className={`rounded-xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
            
            {/* Based on chips */}
            {message.basedOn && message.basedOn.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">Based on:</span>
                {message.basedOn.map((title, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 bg-accent/20 text-accent-foreground rounded-full"
                  >
                    {title.length > 25 ? title.slice(0, 25) + "..." : title}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="mr-4">
            <div className="bg-secondary rounded-xl px-4 py-3 inline-block">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Smart Prompts */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {SMART_PROMPTS.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSend(item.prompt)}
              disabled={contextProjects.length === 0}
              className="px-2.5 py-1 text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={contextProjects.length > 0 ? "Ask about selected research..." : "Select a project first..."}
            disabled={contextProjects.length === 0}
            className="flex-1 bg-secondary border-0 rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || contextProjects.length === 0}
            className="p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
