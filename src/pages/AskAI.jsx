import { useEffect, useMemo, useRef, useState } from "react";
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

  const listRef = useRef(null);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = {
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      role: "user",
      text,
      time: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // ✅ Dummy AI reply (you can connect backend API later)
    setTimeout(() => {
      const aiReply = {
        id: crypto?.randomUUID?.() ?? String(Date.now() + 1),
        role: "assistant",
        text:
          "Sure! I can help with that. If you want, I can generate a clean product description and image prompt for your item.",
        time: Date.now(),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 650);
  };

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
      {/* Chat shell */}
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
        style={{ height: "calc(100dvh - 210px)" }} // ✅ responsive screen height like screenshot
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
                  Online • Replies instantly
                </div>
              </div>
            </div>

            {headerBadge}
          </div>

          {/* Messages area (scroll inside only) */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-gray-50 dark:bg-gray-950"
          >
            <div className="space-y-3">
              {messages.map((m) => (
                <MessageBubble key={m.id} role={m.role} text={m.text} />
              ))}
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
                className="
                  flex-1 resize-none rounded-2xl
                  border border-gray-200 dark:border-gray-800
                  bg-gray-50 dark:bg-gray-950
                  px-4 py-3 text-sm outline-none
                  focus:border-gray-400 dark:focus:border-gray-600
                "
              />

              <button
                onClick={send}
                className="
                  rounded-2xl px-4 py-3 text-sm font-medium
                  bg-blue-600 text-white hover:bg-blue-700
                  transition
                "
              >
                Send
              </button>
            </div>

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
          rounded-2xl px-4 py-3 text-sm leading-relaxed
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
