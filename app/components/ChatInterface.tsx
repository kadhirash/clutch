"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Send, User, Bot } from "lucide-react";
import { chatAction, ChatActionState } from "../actions/chat";
import { BusinessEntity } from "../types/ai-chat";
import { AiMessage } from "./AiMessage";

interface ChatInterfaceProps {
    chatId?: string;
    initialMessage?: string; // The first AI response from the panic button
    userLocation: { latitude: number; longitude: number } | null;
    onUpdateBusiness: (business: BusinessEntity) => void;
    onUpdateChatId: (chatId: string) => void;
}

interface Message {
    id: string;
    role: "user" | "ai";
    text: string;
}

export function ChatInterface({
    chatId: initialChatId,
    initialMessage,
    userLocation,
    onUpdateBusiness,
    onUpdateChatId
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatId, setChatId] = useState(initialChatId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize with the first AI message if provided
    useEffect(() => {
        if (initialMessage && messages.length === 0) {
            setMessages([
                { id: "init", role: "ai", text: initialMessage }
            ]);
        }
    }, [initialMessage, messages.length]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("query", text);
            if (chatId) formData.append("chatId", chatId);
            if (userLocation) {
                formData.append("latitude", userLocation.latitude.toString());
                formData.append("longitude", userLocation.longitude.toString());
            }

            const state: ChatActionState = await chatAction({} as ChatActionState, formData);

            if (state.error) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", text: "Sorry, I ran into an issue. Please try again." }]);
            } else {
                if (state.chatId) {
                    setChatId(state.chatId);
                    onUpdateChatId(state.chatId);
                }

                if (state.aiResponse) {
                    setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", text: state.aiResponse || "" }]);
                }

                if (state.businesses && state.businesses.length > 0) {
                    // Update the main view with the new business
                    onUpdateBusiness(state.businesses[0]);
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: "ai", text: "Something went wrong. Try again?" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend(input);
    };

    return (
        <div className="w-full max-w-2xl mx-auto mt-6 md:mt-8 bg-card-bg/50 border border-border rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col h-[55vh] min-h-[320px] max-h-[520px] sm:h-[420px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                        <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === "user" ? "bg-accent" : "bg-neutral-700"}
            `}>
                            {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`
              p-3 rounded-2xl max-w-[80%] text-sm md:text-base
              ${msg.role === "user"
                                ? "bg-accent/20 text-foreground rounded-tr-none"
                                : "bg-neutral-800 text-foreground/90 rounded-tl-none"
                            }
            `}>
                            {msg.role === "ai" ? (
                                <AiMessage text={msg.text} variant="bubble" />
                            ) : (
                                msg.text
                            )}
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2 text-foreground/50 text-sm ml-12"
                    >
                        <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 border-t border-border bg-card-bg">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <div className="relative flex-1 min-w-0">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask follow-up questions..."
                            className="w-full bg-neutral-900 border border-neutral-800 text-foreground placeholder:text-neutral-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-neutral-700 transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-3 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent text-white rounded-full transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
