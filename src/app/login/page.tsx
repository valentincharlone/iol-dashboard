"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IOL_LOGO_GRADIENT } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) router.push("/dashboard");
    else setError("Usuario o contraseña incorrectos.");
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg border border-border text-sm text-text1 bg-card font-[inherit] outline-none focus:border-brand transition-colors";

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className={`w-12 h-12 rounded-xl ${IOL_LOGO_GRADIENT} inline-flex items-center justify-center text-white font-bold text-[15px] tracking-tight mb-4`}
          >
            IOL
          </div>
          <h1 className="text-[22px] font-bold text-text1 mb-1">Dashboard</h1>
          <p className="text-[13px] text-text3">
            Ingresá para ver tu portafolio
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-text2 uppercase tracking-[0.4px] mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text2 uppercase tracking-[0.4px] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputCls}
              />
            </div>

            {error && (
              <p className="text-[13px] text-loss bg-loss-bg rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`mt-1 rounded-lg py-3 text-sm font-semibold text-white border-none font-[inherit] transition-opacity ${
                loading
                  ? "bg-brand-light cursor-not-allowed"
                  : "bg-brand cursor-pointer hover:opacity-90"
              }`}
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
