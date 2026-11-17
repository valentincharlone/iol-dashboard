"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";

export function PortfolioChat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-[600px] flex-col rounded-xl border">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : ""}>
            {m.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <p key={i} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                );
              }
              if (part.type === "tool-getPortfolio") {
                return part.state === "output-available" ? null : (
                  <p key={i} className="text-sm text-neutral-500">
                    Leyendo tu cartera…
                  </p>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="¿Qué posición me está rindiendo peor?"
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button
          disabled={status !== "ready"}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
