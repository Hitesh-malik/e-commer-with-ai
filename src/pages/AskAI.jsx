import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

export default function AskAI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      id: crypto?.randomUUID?.() ?? "1",
      role: "assistant",
      text: "Hello, I’m your personal AI! Ask anything about products, categories, prices, or UI.",
      time: Date.now(),
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");

  const listRef = useRef(null);

  // ✅ Prefer env var; fallback for local
  const baseUrl = import.meta.env.VITE_BASE_URL ?? "http://localhost:8080";

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  // ✅ Extracted API method (from your chatscope code)
  const processMessageToAI = useCallback(async (chatMessage) => {
    const url = `${baseUrl}/api/chat/ask?message=${encodeURIComponent(
      chatMessage
    )}`;

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      let errMsg = "Failed to get response from TeluskoBot";

      // Try JSON error, else plain text
      try {
        const errorData = await response.json();
        errMsg =
          errorData.error?.message || errorData.message || errMsg;
      } catch {
        try {
          errMsg = await response.text();
        } catch {
          // ignore
        }
      }

      throw new Error(errMsg);
    }

    // Try JSON first; fallback to text
    const contentType = response.headers.get("content-type") || "";
    let botMessageText = "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      botMessageText =
        typeof data === "string"
          ? data
          : data.response ?? data.message ?? JSON.stringify(data);
    } else {
      botMessageText = await response.text();
    }

    return botMessageText;
  }, [baseUrl]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setError("");

    const userMsg = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      role: "user",
      text,
      time: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const botText = await processMessageToAI(text);

      const aiReply = {
        id: crypto?.randomUUID?.() ?? String(Date.now() + 1),
        role: "assistant",
        text: botText,
        time: Date.now(),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, processMessageToAI]);

  const onKeyDown = (e) => {
    // Enter sends, Shift+Enter makes newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const headerBadge = useMemo(
    () => (
      <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-xs text-blue-800 dark:text-blue-200">
        <span className="h-2 w-2 rounded-full bg-blue-600" />
        AI Assistant
      </span>
    ),
    []
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="
          mt-8
          rounded-2xl border border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-900
          shadow-lg shadow-black/5 dark:shadow-black/30
          overflow-hidden
        "
        style={{ height: "calc(100dvh - 210px)" }}
      >
        <div className="h-full flex flex-col">
          {/* Header bar */}
          <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 backdrop-blur flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600/15 dark:bg-blue-500/15 flex items-center justify-center border border-blue-200/50 dark:border-blue-900/50">
                🤖
              </div>
              <div>
                <div className="font-semibold leading-tight">AI Assistant</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {isTyping ? "Typing…" : "Online • Replies instantly"}
                </div>
              </div>
            </div>

            {headerBadge}
          </div>

          {/* Error (if any) */}
          {error && (
            <div className="mx-4 sm:mx-6 mt-4 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Messages area */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-gray-50 dark:bg-gray-950"
          >
            <div className="space-y-3">
              {messages.map((m) => (
                <MessageBubble key={m.id} role={m.role} text={m.text} />
              ))}

              {/* Typing indicator bubble */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-3 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200">
                    AI is typing…
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input bar */}
          <div className="shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="Type your message here..."
                disabled={isTyping}
                className="
                  flex-1 resize-none rounded-2xl
                  border border-gray-200 dark:border-gray-800
                  bg-gray-50 dark:bg-gray-950
                  px-4 py-3 text-sm outline-none
                  focus:border-gray-400 dark:focus:border-gray-600
                  disabled:opacity-70
                "
              />

              <button
                onClick={send}
                disabled={isTyping || !input.trim()}
                className="
                  rounded-2xl px-4 py-3 text-sm font-medium
                  bg-blue-600 text-white hover:bg-blue-700
                  transition disabled:opacity-60 disabled:hover:bg-blue-600
                "
              >
                Send
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Enter = send • Shift+Enter = new line
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

/* ------------------ UI bubble component ------------------ */
function MessageBubble({ role, text }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          max-w-[85%] sm:max-w-[70%]
          rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
          ${
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100"
          }
        `}
      >
        {text}
      </div>
    </motion.div>
  );
}
