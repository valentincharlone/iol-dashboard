"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Sparkles, X, ArrowUp, Square, RotateCcw } from "lucide-react";

const SUGERENCIAS = [
  "¿Qué posición me está rindiendo peor?",
  "¿Cuánto tengo en CEDEARs vs bonos?",
  "¿Qué se movió más hoy?",
];

export function PortfolioChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, stop, error, regenerate } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = status === "submitted" || status === "streaming";

  // Auto-scroll al último mensaje
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, status]);

  // Foco al abrir + cerrar con Escape
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Cerrar asistente" : "Abrir asistente"}
        className={`fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-brand text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 ${
          open ? "max-sm:hidden" : ""
        }`}
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Asistente de cartera"
          className="fixed z-40 flex flex-col bg-card border border-border shadow-2xl
                     inset-0 sm:inset-auto sm:bottom-20 sm:right-5 sm:w-[400px] sm:h-[min(600px,calc(100dvh-7rem))] sm:rounded-card"
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Sparkles size={16} className="text-brand" />
            <span className="font-semibold text-[14px] text-text1 flex-1">
              Asistente de cartera
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="p-1 text-text3 hover:text-text1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col gap-2 pt-2">
                <p className="text-[13px] text-text2 mb-1">
                  Preguntame lo que quieras sobre tu cartera.
                </p>
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-[13px] px-3 py-2 rounded-lg border border-border bg-surface2 text-text1 hover:border-brand-border hover:bg-brand-muted transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "px-3 py-2 rounded-2xl rounded-br-md bg-brand text-white"
                      : "text-text1"
                  }`}
                >
                  {m.parts.map((part, i) => {
                    if (part.type === "text") {
                      return (
                        <p key={i} className="whitespace-pre-wrap">
                          {part.text}
                        </p>
                      );
                    }
                    if (part.type === "tool-getPortfolio" && part.state !== "output-available") {
                      return (
                        <p key={i} className="text-[12px] text-text3 italic">
                          Leyendo tu cartera…
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}

            {status === "submitted" && (
              <p className="text-[12px] text-text3 italic">Pensando…</p>
            )}

            {error && (
              <div className="flex items-center gap-2 text-[12px] text-loss bg-loss-bg rounded-lg px-3 py-2">
                <span className="flex-1">Algo falló al responder.</span>
                <button
                  onClick={() => regenerate()}
                  className="flex items-center gap-1 font-medium hover:underline"
                >
                  <RotateCcw size={12} /> Reintentar
                </button>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu pregunta…"
              className="flex-1 min-w-0 rounded-lg border border-border bg-surface2 px-3 py-2 text-[16px] sm:text-[13px] text-text1 outline-none focus:border-brand transition-colors font-[inherit]"
            />
            {busy ? (
              <button
                type="button"
                onClick={() => stop()}
                aria-label="Detener"
                className="w-9 h-9 shrink-0 rounded-lg bg-surface2 border border-border text-text2 flex items-center justify-center"
              >
                <Square size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Enviar"
                className="w-9 h-9 shrink-0 rounded-lg bg-brand text-white flex items-center justify-center disabled:opacity-40"
              >
                <ArrowUp size={16} />
              </button>
            )}
          </form>
        </div>
      )}
    </>
  );
}
