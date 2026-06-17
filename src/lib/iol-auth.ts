// src/lib/iol-auth.ts
// Maneja el ciclo de vida del bearer token de la API de IOL.
// El token dura 15 minutos; se refresca automáticamente con el refresh_token.
// El par access+refresh se persiste en .iol-token.json para sobrevivir reinicios del servidor.

import { readFile, writeFile, unlink } from "fs/promises";
import { join } from "path";

const IOL_TOKEN_URL = "https://api.invertironline.com/token";
const TOKEN_FILE = join(process.cwd(), ".iol-token.json");

export interface IOLTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number; // timestamp ms
}

// Cache en memoria (válido mientras corre el proceso Next.js)
let cachedTokens: IOLTokens | null = null;
// Deduplicador: si ya hay un fetch en vuelo, los llamadores concurrentes esperan el mismo Promise.
let inflightFetch: Promise<IOLTokens> | null = null;

async function readTokensFromFile(): Promise<IOLTokens | null> {
  try {
    const raw = await readFile(TOKEN_FILE, "utf-8");
    return JSON.parse(raw) as IOLTokens;
  } catch {
    return null;
  }
}

async function writeTokensToFile(tokens: IOLTokens): Promise<void> {
  try {
    await writeFile(TOKEN_FILE, JSON.stringify(tokens), "utf-8");
  } catch {
    // no bloquear si el sistema de archivos falla
  }
}

/**
 * Obtiene un par de tokens frescos usando usuario + contraseña.
 */
async function fetchTokens(
  username: string,
  password: string,
): Promise<IOLTokens> {
  const body = new URLSearchParams({
    username,
    password,
    grant_type: "password",
  });

  const res = await fetch(IOL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IOL auth error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    // expires_in viene en segundos; restamos 60s de margen
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  };
}

/**
 * Refresca el bearer token usando el refresh_token existente.
 */
async function refreshTokens(refreshToken: string): Promise<IOLTokens> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const res = await fetch(IOL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    // Si falla el refresh, volvemos a autenticar desde cero
    cachedTokens = null;
    throw new Error(`IOL refresh error ${res.status}`);
  }

  const data = await res.json();
  const tokens: IOLTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  };
  await writeTokensToFile(tokens);
  return tokens;
}

/**
 * Invalida el caché en memoria y en disco.
 * Llamar cuando la API devuelve 401 para forzar re-login en el próximo intento.
 */
export function invalidateTokens(): void {
  cachedTokens = null;
  inflightFetch = null;
  unlink(TOKEN_FILE).catch(() => {});
}

/**
 * Devuelve siempre un bearer token válido.
 * Refresca automáticamente si está por vencer.
 */
export async function getValidToken(): Promise<string> {
  const username = process.env.IOL_USERNAME;
  const password = process.env.IOL_PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Faltan IOL_USERNAME o IOL_PASSWORD en las variables de entorno.",
    );
  }

  // 1. Memoria
  if (cachedTokens && Date.now() < cachedTokens.expires_at) {
    return cachedTokens.access_token;
  }

  // 2. Disco (sobrevive reinicios del servidor)
  if (!cachedTokens) {
    const fromFile = await readTokensFromFile();
    if (fromFile && Date.now() < fromFile.expires_at) {
      cachedTokens = fromFile;
      return cachedTokens.access_token;
    }
    // Si está vencido en disco, igual lo usamos para el refresh
    if (fromFile) cachedTokens = fromFile;
  }

  // 3. Refresh o login completo — un único fetch en vuelo
  if (!inflightFetch) {
    if (cachedTokens) {
      inflightFetch = refreshTokens(cachedTokens.refresh_token).catch(() => {
        cachedTokens = null;
        return fetchTokens(username, password);
      });
    } else {
      inflightFetch = fetchTokens(username, password);
    }
    inflightFetch = inflightFetch.finally(() => {
      inflightFetch = null;
    });
  }

  cachedTokens = await inflightFetch;
  await writeTokensToFile(cachedTokens);
  return cachedTokens.access_token;
}
