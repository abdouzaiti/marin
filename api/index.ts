import type { IncomingMessage, ServerResponse } from "node:http";
import express, { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { broadcastRealtimeEvent } from "./realtime";

try {
  dotenv.config();
} catch {
  // ignore missing .env file in serverless environments
}

export const app = express();

app.use(express.json({ limit: "1mb" }));

let cachedAi: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!cachedAi) {
    cachedAi = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return cachedAi;
}

// ============================================================================
// Cookie & CSRF Helpers
// ============================================================================

const ACCESS_COOKIE = "marin_access_token";
const REFRESH_COOKIE = "marin_refresh_token";

function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

function setAuthCookies(res: Response, accessToken: string) {
  const attrs = "HttpOnly; Secure; SameSite=None; Partitioned; Path=/";
  res.setHeader("Set-Cookie", [
    `${ACCESS_COOKIE}=${encodeURIComponent(accessToken)}; Max-Age=2592000; ${attrs}`,
    `${REFRESH_COOKIE}=; Max-Age=0; ${attrs}`,
  ]);
}

function clearAuthCookies(res: Response) {
  const attrs = "HttpOnly; Secure; SameSite=None; Partitioned; Path=/; Max-Age=0";
  res.setHeader("Set-Cookie", [
    `${ACCESS_COOKIE}=; ${attrs}`,
    `${REFRESH_COOKIE}=; ${attrs}`,
  ]);
}

function addHostCandidate(hosts: Set<string>, raw?: string) {
  if (!raw) return;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "MY_APP_URL") return;
  try {
    const parsed = trimmed.includes("://") ? new URL(trimmed) : new URL(`https://${trimmed}`);
    if (parsed.host) {
      hosts.add(parsed.host.toLowerCase());
    }
  } catch {
    // ignore invalid host
  }
}

function getAllowedHosts(req: Request): Set<string> {
  const hosts = new Set<string>();
  if (req.headers.host) {
    hosts.add(req.headers.host.trim().toLowerCase());
  }
  const forwardedHost = req.headers["x-forwarded-host"];
  if (typeof forwardedHost === "string") {
    for (const part of forwardedHost.split(",")) {
      const clean = part.trim().toLowerCase();
      if (clean) hosts.add(clean);
    }
  }
  addHostCandidate(hosts, process.env.APP_URL);
  addHostCandidate(hosts, process.env.VERCEL_URL);
  addHostCandidate(hosts, process.env.VERCEL_BRANCH_URL);
  addHostCandidate(hosts, process.env.VERCEL_PROJECT_PRODUCTION_URL);
  return hosts;
}

function requireCsrfSafe(req: Request, res: Response, next: NextFunction) {
  const hasBearer = Boolean(req.headers.authorization?.startsWith("Bearer "));
  const hasAjaxHeader = req.headers["x-requested-with"] === "XMLHttpRequest";
  if (!hasBearer && !hasAjaxHeader) {
    return res.status(403).json({ error: "Missing required request header" });
  }

  const origin = req.headers.origin;
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      const allowedHosts = getAllowedHosts(req);
      const localProxy =
        allowedHosts.has("localhost:3000") ||
        allowedHosts.has("127.0.0.1:3000") ||
        allowedHosts.has("0.0.0.0:3000");
      const isTrustedHostedOrigin =
        localProxy &&
        (originHost.endsWith(".run.app") ||
          originHost.startsWith("localhost:") ||
          originHost.startsWith("127.0.0.1:"));
      const isVercelOrigin =
        Boolean(process.env.VERCEL) && originHost.endsWith(".vercel.app");

      if (!allowedHosts.has(originHost) && !isTrustedHostedOrigin && !isVercelOrigin) {
        return res.status(403).json({ error: "Cross-origin request rejected" });
      }
    } catch {
      return res.status(403).json({ error: "Invalid Origin header" });
    }
  }

  next();
}

// ============================================================================
// Supabase Configuration & Helpers (Only SUPABASE_URL + SUPABASE_ANON_KEY)
// ============================================================================

function getSupabaseConfig() {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    ""
  ).trim();
  const anonKey = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_KEY ||
    ""
  ).trim();
  return { url, anonKey };
}

function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

function createSupabaseAnonClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

type ValidRole = "guest" | "student" | "teacher" | "admin" | "developer";
type ValidRequestStatus = "none" | "pending" | "approved" | "rejected";

const VALID_ROLES: ValidRole[] = ["guest", "student", "teacher", "admin", "developer"];
const VALID_APPLICANT_ROLES: ("student" | "teacher")[] = ["student", "teacher"];
const VALID_REQUEST_STATUSES: ValidRequestStatus[] = [
  "none",
  "pending",
  "approved",
  "rejected",
];

interface DbProfileRow {
  id: string;
  email: string;
  username: string | null;
  password?: string | null;
  full_name: string;
  title: string;
  active_domain: string | null;
  xp: number;
  streak: number;
  completed_modules: string[] | null;
  role: string;
  requested_role?: string | null;
  request_status?: string | null;
  request_note?: string | null;
  created_at?: string | null;
}

function normalizeRole(role?: string | null): ValidRole {
  if (role && VALID_ROLES.includes(role as ValidRole)) {
    return role as ValidRole;
  }
  return "guest";
}

function normalizeRequestStatus(status?: string | null): ValidRequestStatus {
  if (status && VALID_REQUEST_STATUSES.includes(status as ValidRequestStatus)) {
    return status as ValidRequestStatus;
  }
  return "pending";
}

function mapDbRowToProfile(row: DbProfileRow) {
  return {
    id: row.id,
    email: row.email || "",
    username: row.username || undefined,
    password: row.password || undefined,
    name: row.full_name || row.email?.split("@")[0] || "Apprenant MARIN",
    title: row.title || "Apprenant Professionnel",
    activeDomain: row.active_domain || "المالية الذكية",
    xp: typeof row.xp === "number" ? row.xp : 0,
    streak: typeof row.streak === "number" ? row.streak : 1,
    completedModules: Array.isArray(row.completed_modules) ? row.completed_modules : [],
    enrolledPath: null,
    role: normalizeRole(row.role),
    requestedRole: row.requested_role ? normalizeRole(row.requested_role) : null,
    requestStatus: normalizeRequestStatus(row.request_status),
    requestNote: row.request_note || "",
    createdAt: row.created_at || undefined,
  };
}

function mapRpcError(rawMessage?: string): { status: number; message: string } {
  const msg = rawMessage || "Erreur base de données.";
  if (msg.includes("Could not find the function public.marin_")) {
    return {
      status: 503,
      message:
        "Veuillez exécuter le script SQL mis à jour (supabase/schema.sql) dans Supabase SQL Editor.",
    };
  }
  if (msg.includes("EMAIL_EXISTS")) {
    return { status: 409, message: "Un compte avec cette adresse email existe déjà." };
  }
  if (msg.includes("USERNAME_EXISTS")) {
    return {
      status: 409,
      message: "Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.",
    };
  }
  if (msg.includes("INVALID_CREDENTIALS")) {
    return { status: 401, message: "Email, nom d'utilisateur ou mot de passe incorrect." };
  }
  if (msg.includes("PASSWORD_NOT_SET")) {
    return {
      status: 401,
      message:
        "Ce profil n'a pas encore de mot de passe enregistré dans la table profiles.",
    };
  }
  if (msg.includes("UNAUTHORIZED")) {
    return { status: 401, message: "Session invalide ou expirée." };
  }
  if (msg.includes("FORBIDDEN")) {
    return { status: 403, message: "Accès réservé exclusivement au rôle Développeur." };
  }
  if (msg.includes("CANNOT_DEMOTE_SELF")) {
    return {
      status: 400,
      message: "Vous ne pouvez pas retirer votre propre rôle Développeur.",
    };
  }
  if (msg.includes("ALREADY_ASSIGNED_ROLE")) {
    return { status: 400, message: "Votre compte possède déjà un rôle attribué." };
  }
  if (msg.includes("TEACHER_ACCESS_REQUIRED")) {
    return {
      status: 403,
      message: "Accès réservé exclusivement aux formateurs et développeurs.",
    };
  }
  if (msg.includes("NOT_CLASS_TEACHER")) {
    return {
      status: 403,
      message: "Vous n'êtes pas l'enseignant assigné à cette classe.",
    };
  }
  if (msg.includes("CLASS_NOT_FOUND")) {
    return { status: 404, message: "Classe introuvable." };
  }
  if (msg.includes("CLASS_NOT_ACTIVE")) {
    return { status: 400, message: "Cette classe n'est pas active actuellement." };
  }
  if (msg.includes("USER_NOT_FOUND")) {
    return { status: 404, message: "Utilisateur introuvable." };
  }
  return { status: 400, message: msg };
}

function extractAccessToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[ACCESS_COOKIE] || null;
}

interface AuthedRequest extends Request {
  accessToken?: string;
  tokenHash?: string;
  supabaseClient?: SupabaseClient;
  callerProfile?: DbProfileRow;
}

async function requireSupabaseAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: "Supabase is not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY.",
      code: "SUPABASE_NOT_CONFIGURED",
    });
  }

  const token = extractAccessToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const tokenHash = hashSessionToken(token);
    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.rpc("marin_get_session", {
      p_token_hash: tokenHash,
    });

    if (error) {
      const mapped = mapRpcError(error.message);
      return res.status(mapped.status).json({ error: mapped.message });
    }
    if (!data) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    req.accessToken = token;
    req.tokenHash = tokenHash;
    req.supabaseClient = supabase;
    req.callerProfile = data as DbProfileRow;
    next();
  } catch (err) {
    console.error("Session verification error:", err);
    return res.status(500).json({ error: "Authentication verification failed" });
  }
}

async function requireDeveloperAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.callerProfile || normalizeRole(req.callerProfile.role) !== "developer") {
    return res.status(403).json({
      error: "Accès réservé exclusivement au rôle Développeur.",
    });
  }
  next();
}

async function requireTeacherAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const role = normalizeRole(req.callerProfile?.role);
  if (role !== "teacher" && role !== "developer") {
    return res.status(403).json({
      error: "Accès réservé exclusivement aux formateurs et développeurs.",
    });
  }
  next();
}

// ============================================================================
// Bunny Stream Configuration & Helpers
// ============================================================================

function getBunnyConfig() {
  const libraryId = (process.env.BUNNY_STREAM_LIBRARY_ID || "").trim();
  const apiKey = (process.env.BUNNY_STREAM_API_KEY || "").trim();
  const cdnHostname = (process.env.BUNNY_STREAM_CDN_HOSTNAME || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const tokenKey = (process.env.BUNNY_STREAM_TOKEN_KEY || "").trim();
  return { libraryId, apiKey, cdnHostname, tokenKey };
}

function isBunnyConfigured(): boolean {
  const { libraryId, apiKey } = getBunnyConfig();
  return Boolean(libraryId && apiKey);
}

function formatVideoDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "00:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return hrs > 0 ? `${hrs}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
}

function buildBunnyUrls(
  libraryId: string,
  videoId: string,
  cdnHostname: string,
  tokenKey: string
) {
  let embedUrl = `https://iframe.mediadelivery.net/embed/${encodeURIComponent(
    libraryId
  )}/${encodeURIComponent(videoId)}`;
  if (tokenKey) {
    const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 6;
    const token = crypto
      .createHash("sha256")
      .update(`${tokenKey}${videoId}${expires}`)
      .digest("hex");
    embedUrl += `?token=${token}&expires=${expires}&responsive=true`;
  } else {
    embedUrl += `?responsive=true`;
  }

  const hlsUrl = cdnHostname
    ? `https://${cdnHostname}/${encodeURIComponent(videoId)}/playlist.m3u8`
    : undefined;
  const thumbnailUrl = cdnHostname
    ? `https://${cdnHostname}/${encodeURIComponent(videoId)}/thumbnail.jpg`
    : "/logo.png";

  return { embedUrl, hlsUrl, thumbnailUrl };
}

const VALID_BUNNY_ID_REGEX = /^[a-zA-Z0-9_-]{8,64}$/;
const VALID_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_USERNAME_REGEX = /^[a-zA-Z0-9_.-]{3,32}$/;
const VALID_MODULE_ID_REGEX = /^[a-zA-Z0-9_-]{1,80}$/;
const VALID_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ============================================================================
// Health & Configuration Status
// ============================================================================

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "MARIN Academy",
    supabaseConfigured: isSupabaseConfigured(),
    bunnyConfigured: isBunnyConfigured(),
  });
});

app.get("/api/auth/status", (_req, res) => {
  res.json({
    supabaseConfigured: isSupabaseConfigured(),
    bunnyConfigured: isBunnyConfigured(),
  });
});

// ============================================================================
// Profiles-Table Auth & Profile Routes (No Supabase Auth Required)
// ============================================================================

app.post("/api/auth/register", requireCsrfSafe, async (req: Request, res: Response) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: "Supabase n'est pas encore configuré sur le serveur.",
      code: "SUPABASE_NOT_CONFIGURED",
    });
  }

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      username,
      requestedRole,
      requestNote,
      activeDomain,
    } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof username !== "string"
    ) {
      return res.status(400).json({ error: "Invalid request payload" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const cleanRequestedRole: "student" | "teacher" =
      requestedRole === "teacher" ? "teacher" : "student";
    const cleanNote =
      typeof requestNote === "string" ? requestNote.trim().slice(0, 300) : "";
    const cleanDomain =
      typeof activeDomain === "string" && activeDomain.trim()
        ? activeDomain.trim().slice(0, 120)
        : "المالية الذكية";

    if (!VALID_EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: "Adresse email invalide." });
    }
    if (!VALID_USERNAME_REGEX.test(cleanUsername)) {
      return res.status(400).json({
        error:
          "Le nom d'utilisateur doit contenir entre 3 et 32 caractères alphanumériques.",
      });
    }
    if (password.length < 6 || password.length > 128) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir entre 6 et 128 caractères.",
      });
    }
    if (!fullName) {
      return res.status(400).json({ error: "Nom et prénom requis." });
    }

    const sessionToken = generateSessionToken();
    const tokenHash = hashSessionToken(sessionToken);
    const supabase = createSupabaseAnonClient();

    const { data, error } = await supabase.rpc("marin_register_profile", {
      p_email: cleanEmail,
      p_password: password,
      p_full_name: fullName,
      p_username: cleanUsername,
      p_requested_role: cleanRequestedRole,
      p_request_note: cleanNote,
      p_active_domain: cleanDomain,
      p_token_hash: tokenHash,
    });

    if (error || !data) {
      const mapped = mapRpcError(error?.message);
      return res.status(mapped.status).json({ error: mapped.message });
    }

    const profileRow = data as DbProfileRow;
    setAuthCookies(res, sessionToken);

    return res.status(201).json({
      user: {
        id: profileRow.id,
        email: profileRow.email,
      },
      profile: mapDbRowToProfile(profileRow),
      accessToken: sessionToken,
      needsEmailConfirmation: false,
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Erreur serveur lors de l'inscription." });
  }
});

app.post("/api/auth/login", requireCsrfSafe, async (req: Request, res: Response) => {
  if (!isSupabaseConfigured()) {
    return res.status(503).json({
      error: "Supabase n'est pas encore configuré sur le serveur.",
      code: "SUPABASE_NOT_CONFIGURED",
    });
  }

  try {
    const { identifier, password } = req.body || {};
    if (typeof identifier !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Identifiants requis." });
    }

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      return res.status(400).json({ error: "Identifiants requis." });
    }

    const sessionToken = generateSessionToken();
    const tokenHash = hashSessionToken(sessionToken);
    const supabase = createSupabaseAnonClient();

    const { data, error } = await supabase.rpc("marin_login_profile", {
      p_identifier: cleanIdentifier,
      p_password: password,
      p_token_hash: tokenHash,
    });

    if (error || !data) {
      const mapped = mapRpcError(error?.message);
      return res.status(mapped.status).json({ error: mapped.message });
    }

    const profileRow = data as DbProfileRow;
    setAuthCookies(res, sessionToken);

    return res.json({
      user: {
        id: profileRow.id,
        email: profileRow.email,
      },
      profile: mapDbRowToProfile(profileRow),
      accessToken: sessionToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
});

app.post("/api/auth/logout", requireCsrfSafe, async (req: Request, res: Response) => {
  const token = extractAccessToken(req);
  if (token && isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseAnonClient();
      await supabase.rpc("marin_logout_session", {
        p_token_hash: hashSessionToken(token),
      });
    } catch (err) {
      console.error("Logout session revoke error:", err);
    }
  }
  clearAuthCookies(res);
  res.json({ ok: true });
});

app.get("/api/auth/session", async (req: Request, res: Response) => {
  if (!isSupabaseConfigured()) {
    return res.json({
      authenticated: false,
      supabaseConfigured: false,
      user: null,
      profile: null,
      accessToken: null,
    });
  }

  try {
    const accessToken = extractAccessToken(req);
    if (accessToken) {
      const supabase = createSupabaseAnonClient();
      const { data, error } = await supabase.rpc("marin_get_session", {
        p_token_hash: hashSessionToken(accessToken),
      });
      if (!error && data) {
        const profileRow = data as DbProfileRow;
        return res.json({
          authenticated: true,
          supabaseConfigured: true,
          user: { id: profileRow.id, email: profileRow.email },
          profile: mapDbRowToProfile(profileRow),
          accessToken,
        });
      }
    }

    return res.json({
      authenticated: false,
      supabaseConfigured: true,
      user: null,
      profile: null,
      accessToken: null,
    });
  } catch (err) {
    console.error("Session check error:", err);
    return res.json({
      authenticated: false,
      supabaseConfigured: true,
      user: null,
      profile: null,
      accessToken: null,
    });
  }
});

app.get("/api/profile", requireSupabaseAuth, async (req: AuthedRequest, res: Response) => {
  res.json({
    profile: mapDbRowToProfile(req.callerProfile!),
  });
});

app.put(
  "/api/profile",
  requireCsrfSafe,
  requireSupabaseAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { name, title, activeDomain, username, password, newPassword } = req.body || {};

      let cleanName: string | null = null;
      if (typeof name === "string") {
        cleanName = name.trim();
        if (cleanName.length < 1 || cleanName.length > 100) {
          return res.status(400).json({ error: "Nom invalide." });
        }
      }

      let cleanTitle: string | null = null;
      if (typeof title === "string") {
        cleanTitle = title.trim();
        if (cleanTitle.length > 120) {
          return res.status(400).json({ error: "Titre trop long." });
        }
        cleanTitle = cleanTitle || "Apprenant Professionnel";
      }

      let cleanDomain: string | null = null;
      if (typeof activeDomain === "string") {
        cleanDomain = activeDomain.trim();
        if (cleanDomain.length > 120) {
          return res.status(400).json({ error: "Domaine invalide." });
        }
      }

      let cleanUsername: string | null = null;
      if (typeof username === "string" && username.trim().length > 0) {
        cleanUsername = username.trim();
        if (!VALID_USERNAME_REGEX.test(cleanUsername)) {
          return res.status(400).json({ error: "Nom d'utilisateur invalide." });
        }
      }

      let cleanPassword: string | null = null;
      const passCandidate = typeof newPassword === "string" ? newPassword : password;
      if (typeof passCandidate === "string" && passCandidate.trim().length > 0) {
        if (passCandidate.trim().length < 6 || passCandidate.trim().length > 128) {
          return res.status(400).json({
            error: "Le mot de passe doit contenir entre 6 et 128 caractères.",
          });
        }
        cleanPassword = passCandidate.trim();
      }

      const { data, error } = await req.supabaseClient!.rpc("marin_update_profile", {
        p_token_hash: req.tokenHash!,
        p_full_name: cleanName,
        p_title: cleanTitle,
        p_active_domain: cleanDomain,
        p_username: cleanUsername,
        p_new_password: cleanPassword,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.json({
        profile: mapDbRowToProfile(data as DbProfileRow),
      });
    } catch (err) {
      console.error("Update profile error:", err);
      return res.status(500).json({ error: "Erreur lors de la mise à jour du profil." });
    }
  }
);

app.post(
  "/api/profile/request-role",
  requireCsrfSafe,
  requireSupabaseAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { requestedRole, requestNote, activeDomain } = req.body || {};
      if (!VALID_APPLICANT_ROLES.includes(requestedRole)) {
        return res.status(400).json({
          error: "Vous pouvez uniquement demander le rôle Étudiant ou Formateur.",
        });
      }

      const cleanNote =
        typeof requestNote === "string" ? requestNote.trim().slice(0, 300) : "";
      const cleanDomain =
        typeof activeDomain === "string" && activeDomain.trim()
          ? activeDomain.trim().slice(0, 120)
          : null;

      const { data, error } = await req.supabaseClient!.rpc("marin_request_role", {
        p_token_hash: req.tokenHash!,
        p_requested_role: requestedRole,
        p_request_note: cleanNote,
        p_active_domain: cleanDomain,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.json({
        profile: mapDbRowToProfile(data as DbProfileRow),
      });
    } catch (err) {
      console.error("Role request error:", err);
      return res.status(500).json({ error: "Erreur lors de l'envoi de la demande." });
    }
  }
);

app.post(
  "/api/profile/complete-module",
  requireCsrfSafe,
  requireSupabaseAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { moduleId } = req.body || {};
      if (typeof moduleId !== "string" || !VALID_MODULE_ID_REGEX.test(moduleId.trim())) {
        return res.status(400).json({ error: "Identifiant de module invalide." });
      }

      const { data, error } = await req.supabaseClient!.rpc("marin_complete_module", {
        p_token_hash: req.tokenHash!,
        p_module_id: moduleId.trim(),
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.json({
        profile: mapDbRowToProfile(data as DbProfileRow),
      });
    } catch (err) {
      console.error("Complete module error:", err);
      return res.status(500).json({ error: "Erreur lors de la validation du module." });
    }
  }
);

// ============================================================================
// Developer Dashboard & Role Management Routes (Direct Profiles Table RPCs)
// ============================================================================

app.get(
  "/api/dev/dashboard",
  requireSupabaseAuth,
  requireDeveloperAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { data, error } = await req.supabaseClient!.rpc("marin_dev_dashboard", {
        p_token_hash: req.tokenHash!,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      const payload = data as {
        profiles?: DbProfileRow[];
        classes?: any[];
        enrollments?: { class_id: string; student_id: string }[];
      };

      const allProfiles = (Array.isArray(payload.profiles) ? payload.profiles : []).map(
        mapDbRowToProfile
      );
      const profileById = new Map(allProfiles.map((p) => [p.id, p]));

      const enrollments = Array.isArray(payload.enrollments) ? payload.enrollments : [];
      const enrollmentsByClass = new Map<string, string[]>();
      for (const row of enrollments) {
        const list = enrollmentsByClass.get(row.class_id) || [];
        list.push(row.student_id);
        enrollmentsByClass.set(row.class_id, list);
      }

      const rawClasses = Array.isArray(payload.classes) ? payload.classes : [];
      const classes = rawClasses.map((cls: any) => {
        const teacher = cls.teacher_id ? profileById.get(cls.teacher_id) : undefined;
        const studentIds = enrollmentsByClass.get(cls.id) || [];
        return {
          id: cls.id,
          title: cls.title,
          domain: cls.domain,
          teacherId: cls.teacher_id || null,
          teacherName: teacher?.name || "—",
          teacherEmail: teacher?.email || "",
          schedule: cls.schedule || "",
          capacity: typeof cls.capacity === "number" ? cls.capacity : 30,
          status: cls.status || "active",
          studentCount: studentIds.length,
          studentIds,
          createdAt: cls.created_at,
        };
      });

      const requests = allProfiles.filter(
        (u) => u.requestStatus === "pending" || u.role === "guest"
      );
      const teachers = allProfiles.filter((u) => u.role === "teacher");
      const students = allProfiles.filter((u) => u.role === "student");
      const staff = allProfiles.filter(
        (u) => u.role === "admin" || u.role === "developer"
      );

      return res.json({
        requests,
        teachers,
        students,
        staff,
        allUsers: allProfiles,
        classes,
        classesTableReady: true,
      });
    } catch (err) {
      console.error("Developer dashboard load error:", err);
      return res.status(500).json({ error: "Erreur lors du chargement du tableau développeur." });
    }
  }
);

app.post(
  "/api/dev/users",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireDeveloperAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const {
        firstName,
        lastName,
        username,
        email,
        password,
        role,
        title,
        activeDomain,
      } = req.body || {};

      if (
        typeof firstName !== "string" ||
        typeof lastName !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({ error: "Champs obligatoires manquants." });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const cleanUsername =
        typeof username === "string" && username.trim() ? username.trim() : null;
      const targetRole: ValidRole = VALID_ROLES.includes(role) ? role : "student";
      const cleanTitle =
        typeof title === "string" && title.trim() ? title.trim().slice(0, 120) : null;
      const cleanDomain =
        typeof activeDomain === "string" && activeDomain.trim()
          ? activeDomain.trim().slice(0, 120)
          : "المالية الذكية";

      if (!VALID_EMAIL_REGEX.test(cleanEmail)) {
        return res.status(400).json({ error: "Adresse email invalide." });
      }
      if (!cleanFullName) {
        return res.status(400).json({ error: "Nom complet requis." });
      }
      if (cleanUsername && !VALID_USERNAME_REGEX.test(cleanUsername)) {
        return res.status(400).json({ error: "Nom d'utilisateur invalide." });
      }
      if (password.length < 6 || password.length > 128) {
        return res.status(400).json({
          error: "Le mot de passe doit contenir entre 6 et 128 caractères.",
        });
      }

      const { data, error } = await req.supabaseClient!.rpc("marin_dev_create_user", {
        p_token_hash: req.tokenHash!,
        p_email: cleanEmail,
        p_password: password,
        p_full_name: cleanFullName,
        p_username: cleanUsername,
        p_role: targetRole,
        p_title: cleanTitle,
        p_active_domain: cleanDomain,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.status(201).json({
        user: mapDbRowToProfile(data as DbProfileRow),
      });
    } catch (err) {
      console.error("Developer create user error:", err);
      return res.status(500).json({ error: "Erreur lors de la création de l'utilisateur." });
    }
  }
);

app.patch(
  "/api/dev/users/:userId/role",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireDeveloperAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId || !VALID_UUID_REGEX.test(userId)) {
        return res.status(400).json({ error: "Identifiant utilisateur invalide." });
      }

      const { role, requestStatus } = req.body || {};
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: "Rôle sélectionné invalide." });
      }

      const nextStatus: string | null = VALID_REQUEST_STATUSES.includes(requestStatus)
        ? requestStatus
        : null;

      const { data, error } = await req.supabaseClient!.rpc("marin_dev_set_user_role", {
        p_token_hash: req.tokenHash!,
        p_target_user_id: userId,
        p_role: role,
        p_request_status: nextStatus,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.json({
        user: mapDbRowToProfile(data as DbProfileRow),
      });
    } catch (err) {
      console.error("Developer update user role error:", err);
      return res.status(500).json({ error: "Erreur lors de la modification du rôle." });
    }
  }
);

app.put(
  "/api/dev/users/:userId",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireDeveloperAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      if (!userId || !VALID_UUID_REGEX.test(userId)) {
        return res.status(400).json({ error: "Identifiant utilisateur invalide." });
      }

      const { fullName, email, username, role, title, activeDomain, password } = req.body || {};

      const { data, error } = await req.supabaseClient!.rpc("marin_dev_update_user_full", {
        p_token_hash: req.tokenHash!,
        p_target_user_id: userId,
        p_full_name: typeof fullName === "string" ? fullName.trim() : null,
        p_email: typeof email === "string" ? email.trim().toLowerCase() : null,
        p_username: typeof username === "string" && username.trim() ? username.trim() : null,
        p_role: VALID_ROLES.includes(role) ? role : null,
        p_title: typeof title === "string" ? title.trim().slice(0, 120) : null,
        p_active_domain: typeof activeDomain === "string" ? activeDomain.trim().slice(0, 120) : null,
        p_new_password: typeof password === "string" && password.trim() ? password.trim() : null,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.json({
        user: mapDbRowToProfile(data as DbProfileRow),
      });
    } catch (err) {
      console.error("Developer update user full error:", err);
      return res.status(500).json({ error: "Erreur lors de la modification de l'utilisateur." });
    }
  }
);

app.post(
  "/api/dev/classes",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireDeveloperAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { title, domain, teacherId, schedule, capacity, status } = req.body || {};
      if (typeof title !== "string" || title.trim().length < 2 || title.trim().length > 140) {
        return res.status(400).json({ error: "Nom de classe invalide." });
      }
      const cleanDomain =
        typeof domain === "string" && domain.trim()
          ? domain.trim().slice(0, 120)
          : "المالية الذكية";
      const cleanTeacherId =
        typeof teacherId === "string" && VALID_UUID_REGEX.test(teacherId)
          ? teacherId
          : null;
      const cleanSchedule =
        typeof schedule === "string" ? schedule.trim().slice(0, 140) : "";
      const cleanCapacity =
        typeof capacity === "number" && capacity >= 1 && capacity <= 500
          ? Math.floor(capacity)
          : 30;
      const cleanStatus =
        status === "draft" || status === "archived" ? status : "active";

      const { data, error } = await req.supabaseClient!.rpc("marin_dev_create_class", {
        p_token_hash: req.tokenHash!,
        p_title: title.trim(),
        p_domain: cleanDomain,
        p_teacher_id: cleanTeacherId,
        p_schedule: cleanSchedule,
        p_capacity: cleanCapacity,
        p_status: cleanStatus,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.status(201).json({ classroom: data });
    } catch (err) {
      console.error("Create class error:", err);
      return res.status(500).json({ error: "Erreur lors de la création de la classe." });
    }
  }
);

app.put(
  "/api/dev/classes/:classId",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireDeveloperAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { classId } = req.params;
      if (!classId || !VALID_UUID_REGEX.test(classId)) {
        return res.status(400).json({ error: "Identifiant de classe invalide." });
      }

      const { title, domain, teacherId, schedule, capacity, status } = req.body || {};

      const { data, error } = await req.supabaseClient!.rpc("marin_dev_update_class", {
        p_token_hash: req.tokenHash!,
        p_class_id: classId,
        p_title: typeof title === "string" && title.trim().length >= 2 ? title.trim().slice(0, 140) : null,
        p_domain: typeof domain === "string" && domain.trim() ? domain.trim().slice(0, 120) : null,
        p_teacher_id:
          typeof teacherId === "string" && VALID_UUID_REGEX.test(teacherId) ? teacherId : null,
        p_clear_teacher: teacherId === null || teacherId === "",
        p_schedule: typeof schedule === "string" ? schedule.trim().slice(0, 140) : null,
        p_capacity:
          typeof capacity === "number" && capacity >= 1 && capacity <= 500
            ? Math.floor(capacity)
            : null,
        p_status:
          status === "active" || status === "draft" || status === "archived" ? status : null,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.json({ classroom: data });
    } catch (err) {
      console.error("Update class error:", err);
      return res.status(500).json({ error: "Erreur lors de la modification de la classe." });
    }
  }
);

app.delete(
  "/api/dev/classes/:classId",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireDeveloperAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { classId } = req.params;
      if (!classId || !VALID_UUID_REGEX.test(classId)) {
        return res.status(400).json({ error: "Identifiant de classe invalide." });
      }

      const { error } = await req.supabaseClient!.rpc("marin_dev_delete_class", {
        p_token_hash: req.tokenHash!,
        p_class_id: classId,
      });

      if (error) {
        const mapped = mapRpcError(error.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.json({ ok: true });
    } catch (err) {
      console.error("Delete class error:", err);
      return res.status(500).json({ error: "Erreur lors de la suppression de la classe." });
    }
  }
);

app.put(
  "/api/dev/classes/:classId/enrollments",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireDeveloperAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { classId } = req.params;
      if (!classId || !VALID_UUID_REGEX.test(classId)) {
        return res.status(400).json({ error: "Identifiant de classe invalide." });
      }

      const { studentIds } = req.body || {};
      if (!Array.isArray(studentIds)) {
        return res.status(400).json({ error: "Liste des étudiants invalide." });
      }

      const cleanStudentIds = Array.from(
        new Set(
          studentIds.filter(
            (id): id is string => typeof id === "string" && VALID_UUID_REGEX.test(id)
          )
        )
      );

      const { error } = await req.supabaseClient!.rpc("marin_dev_set_class_enrollments", {
        p_token_hash: req.tokenHash!,
        p_class_id: classId,
        p_student_ids: cleanStudentIds,
      });

      if (error) {
        const mapped = mapRpcError(error.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.json({ ok: true, studentIds: cleanStudentIds });
    } catch (err) {
      console.error("Update enrollments error:", err);
      return res.status(500).json({ error: "Erreur lors de la mise à jour des inscriptions." });
    }
  }
);

// ============================================================================
// Teacher Class Management & Student Access Control Routes
// ============================================================================

app.get(
  "/api/teacher/dashboard",
  requireSupabaseAuth,
  requireTeacherAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { data, error } = await req.supabaseClient!.rpc("marin_teacher_dashboard", {
        p_token_hash: req.tokenHash!,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      const rawRequests = Array.isArray(data.requests) ? data.requests : [];
      const requests = rawRequests.map((r: any) => {
        const studentName =
          (typeof r.student_name === "string" && r.student_name.trim()) ||
          (typeof r.studentName === "string" && r.studentName.trim()) ||
          (typeof r.full_name === "string" && r.full_name.trim()) ||
          (typeof r.username === "string" && r.username.trim()) ||
          (typeof r.student_email === "string" && r.student_email.split("@")[0]) ||
          (typeof r.studentEmail === "string" && r.studentEmail.split("@")[0]) ||
          "Étudiant";

        const studentEmail =
          r.student_email || r.studentEmail || r.email || "";

        const studentUsername =
          r.student_username || r.studentUsername || r.username || "";

        const createdAt =
          r.created_at || r.createdAt || r.request_date || r.updated_at || r.updatedAt || new Date().toISOString();

        return {
          ...r,
          id: r.id,
          classId: r.class_id || r.classId,
          class_id: r.class_id || r.classId,
          classTitle: r.class_title || r.classTitle,
          class_title: r.class_title || r.classTitle,
          classDomain: r.class_domain || r.classDomain || "المالية الذكية",
          class_domain: r.class_domain || r.classDomain || "المالية الذكية",
          studentId: r.student_id || r.studentId,
          student_id: r.student_id || r.studentId,
          studentName,
          student_name: studentName,
          studentEmail,
          student_email: studentEmail,
          studentUsername,
          student_username: studentUsername,
          studentTitle: r.student_title || r.studentTitle || "Apprenant Professionnel",
          studentDomain: r.student_domain || r.studentDomain || "المالية الذكية",
          studentXp: r.student_xp ?? r.studentXp ?? 0,
          message: r.message || r.request_message || "",
          status: r.status || "pending",
          createdAt,
          created_at: createdAt,
          updatedAt: r.updated_at || r.updatedAt || createdAt,
          updated_at: r.updated_at || r.updatedAt || createdAt,
        };
      });

      const rawEnrolled = Array.isArray(data.enrolledStudents) ? data.enrolledStudents : [];
      const enrolledStudents = rawEnrolled.map((s: any) => {
        const studentName =
          (typeof s.student_name === "string" && s.student_name.trim()) ||
          (typeof s.studentName === "string" && s.studentName.trim()) ||
          (typeof s.full_name === "string" && s.full_name.trim()) ||
          (typeof s.username === "string" && s.username.trim()) ||
          (typeof s.student_email === "string" && s.student_email.split("@")[0]) ||
          "Étudiant";

        return {
          ...s,
          id: s.id,
          classId: s.class_id || s.classId,
          class_id: s.class_id || s.classId,
          classTitle: s.class_title || s.classTitle,
          class_title: s.class_title || s.classTitle,
          studentId: s.student_id || s.studentId,
          student_id: s.student_id || s.studentId,
          studentName,
          student_name: studentName,
          studentEmail: s.student_email || s.studentEmail || s.email || "",
          student_email: s.student_email || s.studentEmail || s.email || "",
          studentTitle: s.student_title || s.studentTitle || "Apprenant Professionnel",
          studentDomain: s.student_domain || s.studentDomain || "المالية الذكية",
          studentXp: s.student_xp ?? s.studentXp ?? 0,
          status: s.status || "approved",
          enrolledAt: s.enrolled_at || s.enrolledAt || s.created_at || new Date().toISOString(),
          enrolled_at: s.enrolled_at || s.enrolledAt || s.created_at || new Date().toISOString(),
        };
      });

      const rawClasses = Array.isArray(data.classes) ? data.classes : [];
      const classes = rawClasses.map((c: any) => ({
        ...c,
        id: c.id,
        title: c.title,
        domain: c.domain,
        description: c.description || "",
        teacherId: c.teacher_id ?? c.teacherId,
        teacher_id: c.teacher_id ?? c.teacherId,
        schedule: c.schedule || "",
        capacity: typeof c.capacity === "number" ? c.capacity : 30,
        status: c.status || "active",
        studentCount: c.student_count ?? c.studentCount ?? 0,
        student_count: c.student_count ?? c.studentCount ?? 0,
        pendingCount: c.pending_count ?? c.pendingCount ?? 0,
        pending_count: c.pending_count ?? c.pendingCount ?? 0,
        createdAt: c.created_at || c.createdAt || new Date().toISOString(),
        created_at: c.created_at || c.createdAt || new Date().toISOString(),
      }));

      return res.json({
        teacher: data.teacher,
        classes,
        requests,
        enrolledStudents,
      });
    } catch (err) {
      console.error("Teacher dashboard load error:", err);
      return res.status(500).json({ error: "Erreur lors du chargement de l'espace formateur." });
    }
  }
);

app.post(
  "/api/teacher/classes",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireTeacherAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { title, domain, schedule, capacity, status, description } = req.body || {};
      if (typeof title !== "string" || title.trim().length < 2 || title.trim().length > 140) {
        return res.status(400).json({ error: "Nom de classe invalide (2 à 140 caractères)." });
      }
      const cleanDomain =
        typeof domain === "string" && domain.trim()
          ? domain.trim().slice(0, 120)
          : "المالية الذكية";
      const cleanSchedule =
        typeof schedule === "string" ? schedule.trim().slice(0, 140) : "";
      const cleanCapacity =
        typeof capacity === "number" && capacity >= 1 && capacity <= 500
          ? Math.floor(capacity)
          : 30;
      const cleanStatus = ["active", "draft", "archived"].includes(status)
        ? status
        : "active";
      const cleanDescription =
        typeof description === "string" ? description.trim().slice(0, 2000) : "";

      const { data, error } = await req.supabaseClient!.rpc("marin_teacher_create_class", {
        p_token_hash: req.tokenHash!,
        p_title: title.trim(),
        p_domain: cleanDomain,
        p_schedule: cleanSchedule,
        p_capacity: cleanCapacity,
        p_status: cleanStatus,
        p_description: cleanDescription,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      broadcastRealtimeEvent({
        type: "class:created",
        classId: data.id,
        teacherId: req.callerProfile?.id,
      });

      return res.status(201).json({ class: data });
    } catch (err) {
      console.error("Teacher create class error:", err);
      return res.status(500).json({ error: "Erreur lors de la création de la classe." });
    }
  }
);

app.put(
  "/api/teacher/classes/:classId",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireTeacherAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { classId } = req.params;
      if (!classId || !VALID_UUID_REGEX.test(classId)) {
        return res.status(400).json({ error: "Identifiant de classe invalide." });
      }

      const { title, domain, schedule, capacity, status, description } = req.body || {};

      const { data, error } = await req.supabaseClient!.rpc("marin_teacher_update_class", {
        p_token_hash: req.tokenHash!,
        p_class_id: classId,
        p_title: typeof title === "string" && title.trim() ? title.trim().slice(0, 140) : null,
        p_domain: typeof domain === "string" && domain.trim() ? domain.trim().slice(0, 120) : null,
        p_schedule: typeof schedule === "string" ? schedule.trim().slice(0, 140) : null,
        p_capacity: typeof capacity === "number" ? Math.floor(capacity) : null,
        p_status: ["active", "draft", "archived"].includes(status) ? status : null,
        p_description: typeof description === "string" ? description.trim().slice(0, 2000) : null,
      });

      if (error || !data) {
        const mapped = mapRpcError(error?.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      broadcastRealtimeEvent({
        type: "class:updated",
        classId,
        teacherId: req.callerProfile?.id,
      });

      return res.json({ class: data });
    } catch (err) {
      console.error("Teacher update class error:", err);
      return res.status(500).json({ error: "Erreur lors de la modification de la classe." });
    }
  }
);

app.delete(
  "/api/teacher/classes/:classId",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireTeacherAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { classId } = req.params;
      if (!classId || !VALID_UUID_REGEX.test(classId)) {
        return res.status(400).json({ error: "Identifiant de classe invalide." });
      }

      const { error } = await req.supabaseClient!.rpc("marin_teacher_delete_class", {
        p_token_hash: req.tokenHash!,
        p_class_id: classId,
      });

      if (error) {
        const mapped = mapRpcError(error.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      broadcastRealtimeEvent({
        type: "class:deleted",
        classId,
        teacherId: req.callerProfile?.id,
      });

      return res.json({ ok: true, classId });
    } catch (err) {
      console.error("Teacher delete class error:", err);
      return res.status(500).json({ error: "Erreur lors de la suppression de la classe." });
    }
  }
);

app.post(
  "/api/teacher/classes/:classId/access",
  requireCsrfSafe,
  requireSupabaseAuth,
  requireTeacherAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { classId } = req.params;
      const { studentId, decision } = req.body || {};

      if (!classId || !VALID_UUID_REGEX.test(classId)) {
        return res.status(400).json({ error: "Identifiant de classe invalide." });
      }
      if (!studentId || !VALID_UUID_REGEX.test(studentId)) {
        return res.status(400).json({ error: "Identifiant étudiant invalide." });
      }
      if (!["approved", "rejected", "removed"].includes(decision)) {
        return res.status(400).json({ error: "Décision invalide (approved, rejected, removed)." });
      }

      const { data, error } = await req.supabaseClient!.rpc("marin_teacher_set_student_access", {
        p_token_hash: req.tokenHash!,
        p_class_id: classId,
        p_student_id: studentId,
        p_decision: decision,
      });

      if (error) {
        const mapped = mapRpcError(error.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      broadcastRealtimeEvent({
        type: "access:decided",
        classId,
        studentId,
        teacherId: req.callerProfile?.id,
        decision,
      });

      return res.json({ ok: true, access: data });
    } catch (err) {
      console.error("Teacher set student access error:", err);
      return res.status(500).json({ error: "Erreur lors de la décision d'accès." });
    }
  }
);

// ============================================================================
// Student Real Classes & Access Request Routes
// ============================================================================

app.get(
  "/api/student/classes",
  async (req: Request, res: Response) => {
    try {
      const token = extractAccessToken(req);
      const tokenHash = token ? hashSessionToken(token) : null;
      const supabase = createSupabaseAnonClient();

      const { data, error } = await supabase.rpc("marin_student_classes_dashboard", {
        p_token_hash: tokenHash || "",
      });

      if (error) {
        const mapped = mapRpcError(error.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      return res.json(data || { classes: [], myClasses: [] });
    } catch (err) {
      console.error("Student classes load error:", err);
      return res.status(500).json({ error: "Erreur lors du chargement des classes." });
    }
  }
);

app.post(
  "/api/student/classes/:classId/request-access",
  requireCsrfSafe,
  requireSupabaseAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { classId } = req.params;
      const { message } = req.body || {};

      if (!classId || !VALID_UUID_REGEX.test(classId)) {
        return res.status(400).json({ error: "Identifiant de classe invalide." });
      }

      const cleanMessage =
        typeof message === "string" ? message.trim().slice(0, 500) : "";

      const { data, error } = await req.supabaseClient!.rpc("marin_student_request_access", {
        p_token_hash: req.tokenHash!,
        p_class_id: classId,
        p_message: cleanMessage,
      });

      if (error) {
        const mapped = mapRpcError(error.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      broadcastRealtimeEvent({
        type: "access:requested",
        classId,
        studentId: req.callerProfile?.id,
      });

      return res.json({ ok: true, request: data });
    } catch (err) {
      console.error("Student request access error:", err);
      return res.status(500).json({ error: "Erreur lors de la demande d'accès." });
    }
  }
);

app.delete(
  "/api/student/classes/:classId/request-access",
  requireCsrfSafe,
  requireSupabaseAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { classId } = req.params;
      if (!classId || !VALID_UUID_REGEX.test(classId)) {
        return res.status(400).json({ error: "Identifiant de classe invalide." });
      }

      const { error } = await req.supabaseClient!.rpc("marin_student_cancel_request", {
        p_token_hash: req.tokenHash!,
        p_class_id: classId,
      });

      if (error) {
        const mapped = mapRpcError(error.message);
        return res.status(mapped.status).json({ error: mapped.message });
      }

      broadcastRealtimeEvent({
        type: "access:decided",
        classId,
        studentId: req.callerProfile?.id,
        decision: "cancelled",
      });

      return res.json({ ok: true, cancelled: true });
    } catch (err) {
      console.error("Student cancel request error:", err);
      return res.status(500).json({ error: "Erreur lors de l'annulation de la demande." });
    }
  }
);

// ============================================================================
// Bunny Stream API Routes
// ============================================================================

app.get("/api/bunny/videos", async (_req: Request, res: Response) => {
  const { libraryId, apiKey, cdnHostname, tokenKey } = getBunnyConfig();
  if (!libraryId || !apiKey) {
    return res.json({ configured: false, courses: [] });
  }

  try {
    const response = await fetch(
      `https://video.bunnycdn.com/library/${encodeURIComponent(
        libraryId
      )}/videos?page=1&itemsPerPage=50&orderBy=date`,
      {
        headers: {
          AccessKey: apiKey,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Bunny Stream list error:", response.status, errorText);
      return res.status(502).json({
        configured: true,
        error: "Impossible de récupérer les vidéos Bunny Stream.",
        courses: [],
      });
    }

    const payload = await response.json();
    const items: any[] = Array.isArray(payload?.items) ? payload.items : [];

    const courses = items
      .filter((v) => v && typeof v.guid === "string" && VALID_BUNNY_ID_REGEX.test(v.guid))
      .map((video) => {
        const videoId: string = video.guid;
        const { embedUrl, hlsUrl, thumbnailUrl } = buildBunnyUrls(
          libraryId,
          videoId,
          cdnHostname,
          tokenKey
        );
        const duration = formatVideoDuration(Number(video.length || 0));
        const domainMeta = Array.isArray(video.metaTags)
          ? video.metaTags.find((m: any) => m?.property === "domain")?.value
          : undefined;
        const instructorMeta = Array.isArray(video.metaTags)
          ? video.metaTags.find((m: any) => m?.property === "instructor")?.value
          : undefined;
        const descMeta = Array.isArray(video.metaTags)
          ? video.metaTags.find((m: any) => m?.property === "description")?.value
          : undefined;

        return {
          id: `bunny-${videoId}`,
          title: String(video.title || "Cours MARIN Academy"),
          domain: String(domainMeta || "Formations Certifiantes"),
          instructor: String(instructorMeta || "MARIN Academy"),
          instructorAvatar: "/logo.png",
          thumbnail: thumbnailUrl,
          views: `${Number(video.views || 0)} vues`,
          uploadedAt: video.dateUploaded
            ? new Date(video.dateUploaded).toLocaleDateString("fr-FR")
            : "Nouveau",
          duration,
          description: String(
            descMeta || "Formation vidéo hébergée en haute définition sur Bunny Stream."
          ),
          rating: 4.9,
          isBunnyStream: true,
          lessons: [
            {
              id: `bunny-lesson-${videoId}`,
              title: String(video.title || "Leçon vidéo"),
              duration,
              videoUrl: hlsUrl || embedUrl,
              bunnyVideoId: videoId,
              embedUrl,
              hlsUrl,
              transcript: "",
              chapters: [],
            },
          ],
        };
      });

    return res.json({ configured: true, courses });
  } catch (err) {
    console.error("Bunny Stream fetch error:", err);
    return res.status(500).json({
      configured: true,
      error: "Erreur lors de la communication avec Bunny Stream.",
      courses: [],
    });
  }
});

app.get("/api/bunny/embed/:videoId", (req: Request, res: Response) => {
  const { videoId } = req.params;
  if (!videoId || !VALID_BUNNY_ID_REGEX.test(videoId)) {
    return res.status(400).json({ error: "Identifiant vidéo Bunny Stream invalide." });
  }

  const { libraryId, cdnHostname, tokenKey } = getBunnyConfig();
  if (!libraryId) {
    return res.status(503).json({
      configured: false,
      error: "BUNNY_STREAM_LIBRARY_ID non configuré.",
    });
  }

  const urls = buildBunnyUrls(libraryId, videoId, cdnHostname, tokenKey);
  return res.json({ configured: true, ...urls });
});

app.post(
  "/api/bunny/videos",
  requireCsrfSafe,
  requireSupabaseAuth,
  async (req: AuthedRequest, res: Response) => {
    const role = normalizeRole(req.callerProfile?.role);
    if (!["teacher", "admin", "developer"].includes(role)) {
      return res.status(403).json({
        error: "Seuls les formateurs, administrateurs ou développeurs peuvent publier des vidéos.",
      });
    }

    const { libraryId, apiKey } = getBunnyConfig();
    if (!libraryId || !apiKey) {
      return res.status(503).json({
        configured: false,
        error: "Bunny Stream n'est pas configuré.",
      });
    }

    try {
      const { title } = req.body || {};
      if (typeof title !== "string" || title.trim().length < 2 || title.trim().length > 150) {
        return res.status(400).json({ error: "Titre de vidéo invalide." });
      }

      const response = await fetch(
        `https://video.bunnycdn.com/library/${encodeURIComponent(libraryId)}/videos`,
        {
          method: "POST",
          headers: {
            AccessKey: apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ title: title.trim() }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Bunny create video failed:", response.status, errText);
        return res
          .status(502)
          .json({ error: "Impossible de créer la vidéo sur Bunny Stream." });
      }

      const created = await response.json();
      const videoId: string = created.guid;
      const expirationTime = Math.floor(Date.now() / 1000) + 3600;
      const signature = crypto
        .createHash("sha256")
        .update(`${libraryId}${apiKey}${expirationTime}${videoId}`)
        .digest("hex");

      return res.status(201).json({
        videoId,
        libraryId,
        expirationTime,
        signature,
        tusEndpoint: "https://video.bunnycdn.com/tusupload",
      });
    } catch (err) {
      console.error("Bunny create video error:", err);
      return res.status(500).json({ error: "Erreur lors de la création de la vidéo." });
    }
  }
);

// ============================================================================
// Existing AI Endpoints
// ============================================================================

app.post("/api/ai/generate-path", async (req, res) => {
  try {
    const { domain, currentLevel, goal, weeklyHours } = req.body;

    const prompt = `Create a personalized professional training curriculum for the domain: "${domain}".
User's current level: "${currentLevel}".
User's career goal: "${goal}".
Available weekly study hours: ${weeklyHours}.

Return a JSON object with:
- title: string (Curriculum title)
- description: string
- estimatedWeeks: number
- difficulty: string
- modules: array of objects, each containing:
  - id: string
  - title: string
  - description: string
  - duration: string
  - topics: array of strings
  - practicalProject: string
`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedWeeks: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                  practicalProject: { type: Type.STRING },
                },
                required: [
                  "id",
                  "title",
                  "description",
                  "duration",
                  "topics",
                  "practicalProject",
                ],
              },
            },
          },
          required: ["title", "description", "estimatedWeeks", "difficulty", "modules"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error generating path:", error);
    res.status(500).json({ error: error.message || "Failed to generate path" });
  }
});

app.post("/api/ai/chat-tutor", async (req, res) => {
  try {
    const { domain, moduleTitle, userQuestion } = req.body;

    const systemInstruction = `You are MARIN Academy AI, an expert professional training tutor specialized in "${domain}".
You are currently assisting a student studying "${moduleTitle}".
Be encouraging, precise, professional, and practical. Provide concrete examples and industry standards.`;

    const chat = getAiClient().chats.create({
      model: "gemini-3.7-flash",
      config: {
        systemInstruction,
      },
    });

    const response = await chat.sendMessage({
      message: userQuestion,
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in chat tutor:", error);
    res.status(500).json({ error: error.message || "Failed to get AI tutor response" });
  }
});

app.post("/api/ai/generate-quiz", async (req, res) => {
  try {
    const { domain, moduleTitle, topic } = req.body;

    const prompt = `Generate a 5-question professional certification quiz for domain "${domain}", module "${moduleTitle}", focusing on "${topic}".
Return a JSON array of questions, each with:
- id: string
- question: string
- options: array of 4 strings
- correctAnswerIndex: number (0-3)
- explanation: string
`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
            },
            required: ["id", "question", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
    });

    const quiz = JSON.parse(response.text || "[]");
    res.json({ quiz });
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz" });
  }
});

app.post("/api/ai/evaluate-simulation", async (req, res) => {
  try {
    const { domain, scenarioTitle, userAction } = req.body;

    const prompt = `You are evaluating a professional practical simulation for "${domain}" in the scenario "${scenarioTitle}".
The student took the following action or response: "${userAction}"

Evaluate this action professionally. Return a JSON object with:
- score: number (0 to 100)
- feedback: string (constructive critique)
- strengths: array of strings
- improvements: array of strings
- expertTip: string
`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            expertTip: { type: Type.STRING },
          },
          required: ["score", "feedback", "strengths", "improvements", "expertTip"],
        },
      },
    });

    const evaluation = JSON.parse(response.text || "{}");
    res.json(evaluation);
  } catch (error: any) {
    console.error("Error evaluating simulation:", error);
    res.status(500).json({ error: error.message || "Failed to evaluate simulation" });
  }
});

app.post("/api/ai/career-advice", async (req, res) => {
  try {
    const { completedCourses, careerGoal } = req.body;

    const prompt = `Analyze the student's completed courses: ${JSON.stringify(
      completedCourses || []
    )} and target career goal: "${careerGoal}".
Provide career guidance and recommendations in JSON format with:
- readinessScore: number (0 to 100)
- missingSkills: array of strings
- recommendedCertifications: array of strings
- marketDemandSummary: string
- interviewTips: array of strings
`;

    const response = await getAiClient().models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readinessScore: { type: Type.NUMBER },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedCertifications: { type: Type.ARRAY, items: { type: Type.STRING } },
            marketDemandSummary: { type: Type.STRING },
            interviewTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            "readinessScore",
            "missingSkills",
            "recommendedCertifications",
            "marketDemandSummary",
            "interviewTips",
          ],
        },
      },
    });

    const advice = JSON.parse(response.text || "{}");
    res.json(advice);
  } catch (error: any) {
    console.error("Error getting career advice:", error);
    res.status(500).json({ error: error.message || "Failed to get career advice" });
  }
});

// ============================================================================
// Vercel Serverless Entrypoint (Zero Relative Imports)
// ============================================================================

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const rawUrl = req.url || "/api";
  try {
    const parsed = new URL(rawUrl, "http://localhost");
    const vercelPath = parsed.searchParams.get("__vercel_path");
    if (vercelPath !== null) {
      parsed.searchParams.delete("__vercel_path");
      const cleanPath = vercelPath.replace(/^\/+/, "");
      const qs = parsed.searchParams.toString();
      req.url = `/api/${cleanPath}${qs ? `?${qs}` : ""}`;
    } else if (!parsed.pathname.startsWith("/api")) {
      const qs = parsed.search;
      req.url = `/api${parsed.pathname.startsWith("/") ? "" : "/"}${parsed.pathname}${qs}`;
    }
  } catch {
    if (!rawUrl.startsWith("/api")) {
      req.url = `/api${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
    }
  }

  const anyReq = req as IncomingMessage & {
    body?: unknown;
    _body?: boolean;
    readableEnded?: boolean;
  };
  const bodyDescriptor = Object.getOwnPropertyDescriptor(anyReq, "body");
  if (
    bodyDescriptor &&
    "value" in bodyDescriptor &&
    bodyDescriptor.value !== undefined &&
    (anyReq.readable === false || anyReq.readableEnded === true)
  ) {
    anyReq._body = true;
  }

  return app(req as any, res as any);
}
