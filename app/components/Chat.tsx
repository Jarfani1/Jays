"use client";

import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Plus,
  MessageCircle,
  Settings,
  HelpCircle,
  Send,
  Sparkles,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  feedback?: "up" | "down";
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

const PARAGRAPH_COLORS = ["#1e3a5f", "#c94f76", "#1f7a6c", "#c2703f"];

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConv = conversations.find((c) => c.id === currentConvId);
  const messages = currentConv?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const startNewChat = () => {
    const newId = Date.now().toString();
    setConversations((prev) => [...prev, { id: newId, title: "New chat", messages: [] }]);
    setCurrentConvId(newId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    let convId = currentConvId;
    if (!convId) {
      convId = Date.now().toString();
      setConversations((prev) => [...prev, { id: convId!, title: "New chat", messages: [] }]);
      setCurrentConvId(convId);
    }

    const userMessage: Message = { role: "user", content: input };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, userMessage] }
          : c
      )
    );

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.text,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMessage] }
            : c
        )
      );

      if (messages.length === 0) {
        const title = userMessage.content.substring(0, 30) + (userMessage.content.length > 30 ? "..." : "");
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title } : c))
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                  },
                ],
              }
            : c
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx((prev) => (prev === idx ? null : prev)), 1500);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleFeedback = (idx: number, type: "up" | "down") => {
    if (!currentConvId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConvId
          ? {
              ...c,
              messages: c.messages.map((m, i) =>
                i === idx ? { ...m, feedback: m.feedback === type ? undefined : type } : m
              ),
            }
          : c
      )
    );
  };

  const handleRegenerate = async (idx: number) => {
    if (!currentConvId || regeneratingIdx !== null || loading) return;
    const convId = currentConvId;
    const history = messages.slice(0, idx);
    const lastUser = history[history.length - 1];
    if (!lastUser || lastUser.role !== "user") return;

    setRegeneratingIdx(idx);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: c.messages.map((m, i) =>
                  i === idx ? { role: "assistant", content: data.text } : m
                ),
              }
            : c
        )
      );
    } catch (error) {
      console.error("Error regenerating:", error);
    } finally {
      setRegeneratingIdx(null);
    }
  };

  const suggestedPrompts = [
    "Explain quantum computing",
    "Write a Python function",
    "Plan a trip to Japan",
    "Summarize a topic",
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f6fa] text-[#1e3348]">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 flex flex-col bg-[#1e3a5f] text-[#eef3f8] ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="border-b border-white/10 p-4">
          <button
            onClick={startNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f2a878] px-4 py-3 text-sm font-semibold text-[#1e3a5f] transition-colors hover:bg-[#f6bd97]"
          >
            <Plus size={18} />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2 p-3">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setCurrentConvId(conv.id)}
                className={`w-full rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                  currentConvId === conv.id
                    ? "bg-white/12 font-medium text-white"
                    : "text-[#a9c1da] hover:bg-white/8 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} />
                  <span className="truncate">{conv.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t border-white/10 p-3">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#a9c1da] transition-colors hover:bg-white/8 hover:text-white">
            <HelpCircle size={18} />
            Help & FAQ
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#a9c1da] transition-colors hover:bg-white/8 hover:text-white">
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_top_right,_rgba(232,130,158,0.14),_transparent_32%),#f3f6fa]">
        {/* Header */}
        <div className="border-b border-[#1e3a5f]/10 bg-[#f3f6fa]/85 backdrop-blur-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
                className="rounded-xl p-2 text-[#4d688a] transition-colors hover:bg-[#1e3a5f]/8 hover:text-[#1e3a5f]"
              >
                <Menu size={20} />
              </button>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9698c]">Thought partner</p>
                <h1 className="bg-gradient-to-r from-[#1e3a5f] via-[#e8829e] to-[#1f7a6c] bg-clip-text font-[family-name:var(--font-heading)] text-2xl font-extrabold tracking-tight text-transparent">
                  Ask Jay
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-5 py-8">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e3a5f] text-[#f2a878] shadow-[0_12px_30px_rgba(30,58,95,0.2)]">
                  <Sparkles size={25} strokeWidth={1.8} />
                </div>
                <h2 className="mb-2 text-3xl font-semibold tracking-tight text-[#1e3a5f]">A fresh page for thinking.</h2>
                <p className="mb-8 text-[#5b7290]">What would you like to explore today?</p>

                <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="rounded-2xl border border-[#1e3a5f]/10 bg-white/75 p-4 text-left shadow-[0_8px_24px_rgba(30,58,95,0.05)] transition-all hover:-translate-y-0.5 hover:border-[#e8829e] hover:bg-white hover:shadow-[0_12px_28px_rgba(30,58,95,0.1)]"
                    >
                      <p className="text-sm font-medium text-[#1e3a5f]">{prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 py-6 animate-in fade-in ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f] text-[#f2a878]">
                    <Sparkles size={17} />
                  </div>
                )}
                <div
                  className={`max-w-2xl space-y-2 ${
                    msg.role === "user"
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                    {msg.content
                    .split(/\n{2,}/)
                    .filter((p) => p.trim().length > 0)
                    .map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className="leading-relaxed whitespace-pre-wrap"
                        style={{
                          color: PARAGRAPH_COLORS[pIdx % PARAGRAPH_COLORS.length],
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}

                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1 pt-1">
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        aria-label="Copy response"
                        className="rounded-lg p-1.5 text-[#8ba0bb] transition-colors hover:bg-[#1e3a5f]/8 hover:text-[#1e3a5f]"
                      >
                        {copiedIdx === idx ? <Check size={15} /> : <Copy size={15} />}
                      </button>
                      <button
                        onClick={() => handleFeedback(idx, "up")}
                        aria-label="Good response"
                        className={`rounded-lg p-1.5 transition-colors hover:bg-[#1e3a5f]/8 ${
                          msg.feedback === "up" ? "text-[#1f7a6c]" : "text-[#8ba0bb] hover:text-[#1e3a5f]"
                        }`}
                      >
                        <ThumbsUp size={15} fill={msg.feedback === "up" ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => handleFeedback(idx, "down")}
                        aria-label="Bad response"
                        className={`rounded-lg p-1.5 transition-colors hover:bg-[#1e3a5f]/8 ${
                          msg.feedback === "down" ? "text-[#c94f76]" : "text-[#8ba0bb] hover:text-[#1e3a5f]"
                        }`}
                      >
                        <ThumbsDown size={15} fill={msg.feedback === "down" ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => handleRegenerate(idx)}
                        disabled={regeneratingIdx !== null || loading}
                        aria-label="Regenerate response"
                        className="rounded-lg p-1.5 text-[#8ba0bb] transition-colors hover:bg-[#1e3a5f]/8 hover:text-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RefreshCw size={15} className={regeneratingIdx === idx ? "animate-spin" : ""} />
                      </button>
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#cdeae4] text-sm font-semibold text-[#1f7a6c]">
                    You
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-4 py-6 animate-in fade-in">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f] text-[#f2a878]">
                  <Sparkles size={17} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#e8829e]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#f2a878]" style={{ animationDelay: "0.1s" }}></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-[#1f7a6c]" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[#1e3a5f]/10 bg-[#f3f6fa]/85 py-4 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-5">
            <form onSubmit={handleSubmit} className="flex gap-3 rounded-2xl border border-[#1e3a5f]/12 bg-white p-2 shadow-[0_10px_30px_rgba(30,58,95,0.08)]">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Gemini"
                disabled={loading}
                className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 py-3 text-[#1e3348] outline-none placeholder:text-[#8ba0bb] focus:ring-0 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex items-center justify-center rounded-xl bg-[#1f7a6c] px-4 py-3 font-medium text-white transition-colors hover:bg-[#186358] disabled:cursor-not-allowed disabled:bg-[#c3ccd6]"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
