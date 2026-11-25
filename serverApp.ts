import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import dotenv from "dotenv";

try {
  dotenv.config();
} catch {
  // ignore missing .env file in serverless environments
}

const app = express();

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

function setAuthCookies(res: Response, accessToken: string, refreshToken?: string) {
  const attrs = "HttpOnly; Secure; SameSite=None; Partitioned; Path=/";
  const cookieList = [
    `${ACCESS_COOKIE}=${encodeURIComponent(accessToken)}; Max-Age=3600; ${attrs}`,
  ];
  if (refreshToken) {
    cookieList.push(
      `${REFRESH_COOKIE}=${encodeURIComponent(refreshToken)}; Max-Age=2592000; ${attrs}`
    );
  }
  res.setHeader("Set-Cookie", cookieList);
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

function createSupabaseAnonClient(accessToken?: string): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    ...(accessToken
      ? {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        }
      : {}),
  });
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

const PROFILE_SELECT_FIELDS =
  "id, email, username, full_name, title, active_domain, xp, streak, completed_modules, role, requested_role, request_status, request_note, created_at";

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

function mapDbProfileToClient(row: DbProfileRow | null, user: User) {
  const fallbackName =
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "Apprenant MARIN";
  if (!row) {
    const reqRole = user.user_metadata?.requested_role as string | undefined;
    return {
      id: user.id,
      email: user.email || "",
      username: (user.user_metadata?.username as string) || undefined,
      name: fallbackName,
      title: "Apprenant Professionnel",
      activeDomain: (user.user_metadata?.active_domain as string) || "المالية الذكية",
      xp: 0,
      streak: 1,
      completedModules: [] as string[],
      enrolledPath: null,
      role: "guest" as ValidRole,
      requestedRole:
        reqRole && VALID_APPLICANT_ROLES.includes(reqRole as "student" | "teacher")
          ? (reqRole as ValidRole)
          : ("student" as ValidRole),
      requestStatus: "pending" as ValidRequestStatus,
      requestNote: (user.user_metadata?.request_note as string) || "",
    };
  }
  return mapDbRowToProfile(row);
}

async function ensureProfileRow(
  client: SupabaseClient,
  user: User,
  overrides?: {
    fullName?: string;
    username?: string;
    requestedRole?: "student" | "teacher";
    requestNote?: string;
    activeDomain?: string;
  }
): Promise<DbProfileRow | null> {
  const { data: existing, error: selectErr } = await client
    .from("profiles")
    .select(PROFILE_SELECT_FIELDS)
    .eq("id", user.id)
    .maybeSingle();

  if (!selectErr && existing) {
    return existing as DbProfileRow;
  }

  const fullName =
    overrides?.fullName ||
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "Apprenant MARIN";
  const username =
    overrides?.username ||
    (user.user_metadata?.username as string) ||
    null;
  const rawRequested =
    overrides?.requestedRole || (user.user_metadata?.requested_role as string);
  const requestedRole = VALID_APPLICANT_ROLES.includes(rawRequested as "student" | "teacher")
    ? rawRequested
    : "student";

  const { data: inserted, error: insertErr } = await client
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email || "",
        full_name: fullName,
        username: username || null,
        active_domain:
          overrides?.activeDomain ||
          (user.user_metadata?.active_domain as string) ||
          "المالية الذكية",
        role: "guest",
        requested_role: requestedRole,
        request_status: "pending",
        request_note:
          overrides?.requestNote ||
          (user.user_metadata?.request_note as string) ||
          "",
      },
      { onConflict: "id" }
    )
    .select(PROFILE_SELECT_FIELDS)
    .single();

  if (insertErr) {
    console.warn("Unable to upsert profile row:", insertErr.message);
    return null;
  }
  return inserted as DbProfileRow;
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
  authUser?: User;
  accessToken?: string;
  userSupabase?: SupabaseClient;
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
    const supabase = createSupabaseAnonClient(token);
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    req.authUser = data.user;
    req.accessToken = token;
    req.userSupabase = supabase;
    next();
  } catch (err) {
    console.error("Supabase auth verification error:", err);
    return res.status(500).json({ error: "Authentication verification failed" });
  }
}

async function requireDeveloperAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const profileRow = await ensureProfileRow(req.userSupabase!, req.authUser!);
    if (!profileRow || normalizeRole(profileRow.role) !== "developer") {
      return res.status(403).json({
        error: "Accès réservé exclusivement au rôle Développeur.",
      });
    }
    req.callerProfile = profileRow;
    next();
  } catch (err) {
    console.error("Developer role verification error:", err);
    return res.status(500).json({ error: "Erreur de vérification des droits." });
  }
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
// Supabase Auth & Profile Routes
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

    const supabase = createSupabaseAnonClient();

    // Check username availability first if helper RPC exists
    const { data: existingUsernameEmail } = await supabase.rpc(
      "get_email_by_username",
      { p_username: cleanUsername }
    );
    if (existingUsernameEmail && typeof existingUsernameEmail === "string") {
      return res.status(409).json({
        error: "Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre.",
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          username: cleanUsername,
          requested_role: cleanRequestedRole,
          request_note: cleanNote,
          active_domain: cleanDomain,
        },
      },
    });

    if (error) {
      const msg = error.message || "Erreur lors de l'inscription.";
      if (msg.toLowerCase().includes("rate limit")) {
        return res.status(429).json({
          error:
            "Limite d'envoi d'emails Supabase atteinte. Désactivez 'Confirm email' dans Supabase Dashboard → Authentication → Providers → Email pour tester plusieurs comptes librement.",
        });
      }
      return res.status(400).json({ error: msg });
    }

    if (!data.user) {
      return res.status(400).json({ error: "Impossible de créer le compte." });
    }

    if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return res
        .status(409)
        .json({ error: "Un compte avec cette adresse email existe déjà." });
    }

    if (data.session) {
      const userClient = createSupabaseAnonClient(data.session.access_token);
      const profileRow = await ensureProfileRow(userClient, data.user, {
        fullName,
        username: cleanUsername,
        requestedRole: cleanRequestedRole,
        requestNote: cleanNote,
        activeDomain: cleanDomain,
      });
      setAuthCookies(res, data.session.access_token, data.session.refresh_token);
      return res.status(201).json({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        profile: mapDbProfileToClient(profileRow, data.user),
        accessToken: data.session.access_token,
        needsEmailConfirmation: false,
      });
    }

    return res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile: mapDbProfileToClient(null, data.user),
      accessToken: null,
      needsEmailConfirmation: true,
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

    const supabase = createSupabaseAnonClient();
    let loginEmail = cleanIdentifier.toLowerCase();

    if (!cleanIdentifier.includes("@")) {
      const { data: resolvedEmail, error: rpcError } = await supabase.rpc(
        "get_email_by_username",
        { p_username: cleanIdentifier }
      );
      if (rpcError || !resolvedEmail || typeof resolvedEmail !== "string") {
        return res.status(401).json({ error: "Identifiants incorrects." });
      }
      loginEmail = resolvedEmail.toLowerCase();
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error || !data.session || !data.user) {
      const errMsg = error?.message || "Email ou mot de passe incorrect.";
      if (errMsg.toLowerCase().includes("email not confirmed")) {
        return res.status(401).json({
          error:
            "Email non confirmé. Vérifiez votre boîte mail ou désactivez 'Confirm email' dans Supabase → Authentication → Providers → Email.",
        });
      }
      return res.status(401).json({
        error: errMsg,
      });
    }

    const userClient = createSupabaseAnonClient(data.session.access_token);
    const profileRow = await ensureProfileRow(userClient, data.user);
    setAuthCookies(res, data.session.access_token, data.session.refresh_token);

    return res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile: mapDbProfileToClient(profileRow, data.user),
      accessToken: data.session.access_token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Erreur serveur lors de la connexion." });
  }
});

app.post("/api/auth/logout", requireCsrfSafe, (_req: Request, res: Response) => {
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
    const cookies = parseCookies(req.headers.cookie);
    let accessToken = extractAccessToken(req);
    const refreshToken = cookies[REFRESH_COOKIE];

    if (accessToken) {
      const supabase = createSupabaseAnonClient(accessToken);
      const { data, error } = await supabase.auth.getUser(accessToken);
      if (!error && data.user) {
        const profileRow = await ensureProfileRow(supabase, data.user);
        return res.json({
          authenticated: true,
          supabaseConfigured: true,
          user: { id: data.user.id, email: data.user.email },
          profile: mapDbProfileToClient(profileRow, data.user),
          accessToken,
        });
      }
    }

    if (refreshToken) {
      const supabase = createSupabaseAnonClient();
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      if (!error && data.session && data.user) {
        accessToken = data.session.access_token;
        setAuthCookies(res, data.session.access_token, data.session.refresh_token);
        const userClient = createSupabaseAnonClient(accessToken);
        const profileRow = await ensureProfileRow(userClient, data.user);
        return res.json({
          authenticated: true,
          supabaseConfigured: true,
          user: { id: data.user.id, email: data.user.email },
          profile: mapDbProfileToClient(profileRow, data.user),
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
  try {
    const profileRow = await ensureProfileRow(req.userSupabase!, req.authUser!);
    res.json({
      profile: mapDbProfileToClient(profileRow, req.authUser!),
    });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: "Impossible de charger le profil." });
  }
});

app.put(
  "/api/profile",
  requireCsrfSafe,
  requireSupabaseAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const { name, title, activeDomain, username } = req.body || {};

      const updates: Record<string, string | null> = {
        updated_at: new Date().toISOString(),
      };

      if (typeof name === "string") {
        const cleanName = name.trim();
        if (cleanName.length < 1 || cleanName.length > 100) {
          return res.status(400).json({ error: "Nom invalide." });
        }
        updates.full_name = cleanName;
      }

      if (typeof title === "string") {
        const cleanTitle = title.trim();
        if (cleanTitle.length > 120) {
          return res.status(400).json({ error: "Titre trop long." });
        }
        updates.title = cleanTitle || "Apprenant Professionnel";
      }

      if (typeof activeDomain === "string") {
        const cleanDomain = activeDomain.trim();
        if (cleanDomain.length > 120) {
          return res.status(400).json({ error: "Domaine invalide." });
        }
        updates.active_domain = cleanDomain || null;
      }

      if (typeof username === "string" && username.trim().length > 0) {
        const cleanUsername = username.trim();
        if (!VALID_USERNAME_REGEX.test(cleanUsername)) {
          return res.status(400).json({ error: "Nom d'utilisateur invalide." });
        }
        updates.username = cleanUsername;
      }

      const { data, error } = await req.userSupabase!
        .from("profiles")
        .update(updates)
        .eq("id", req.authUser!.id)
        .select(PROFILE_SELECT_FIELDS)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({
        profile: mapDbProfileToClient(data as DbProfileRow, req.authUser!),
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

      const existing = await ensureProfileRow(req.userSupabase!, req.authUser!);
      if (existing && normalizeRole(existing.role) !== "guest") {
        return res.status(400).json({
          error: "Votre compte possède déjà un rôle attribué.",
        });
      }

      const cleanNote =
        typeof requestNote === "string" ? requestNote.trim().slice(0, 300) : "";
      const updates: Record<string, string> = {
        requested_role: requestedRole,
        request_status: "pending",
        request_note: cleanNote,
        updated_at: new Date().toISOString(),
      };
      if (typeof activeDomain === "string" && activeDomain.trim()) {
        updates.active_domain = activeDomain.trim().slice(0, 120);
      }

      const { data, error } = await req.userSupabase!
        .from("profiles")
        .update(updates)
        .eq("id", req.authUser!.id)
        .select(PROFILE_SELECT_FIELDS)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({
        profile: mapDbProfileToClient(data as DbProfileRow, req.authUser!),
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

      const cleanModuleId = moduleId.trim();
      const existing = await ensureProfileRow(req.userSupabase!, req.authUser!);
      const currentModules = Array.isArray(existing?.completed_modules)
        ? existing.completed_modules
        : [];
      const currentXp = typeof existing?.xp === "number" ? existing.xp : 0;

      if (currentModules.includes(cleanModuleId)) {
        return res.json({
          profile: mapDbProfileToClient(existing, req.authUser!),
        });
      }

      const updatedModules = [...currentModules, cleanModuleId];
      const updatedXp = currentXp + 100;

      const { data, error } = await req.userSupabase!
        .from("profiles")
        .update({
          completed_modules: updatedModules,
          xp: updatedXp,
          updated_at: new Date().toISOString(),
        })
        .eq("id", req.authUser!.id)
        .select(PROFILE_SELECT_FIELDS)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({
        profile: mapDbProfileToClient(data as DbProfileRow, req.authUser!),
      });
    } catch (err) {
      console.error("Complete module error:", err);
      return res.status(500).json({ error: "Erreur lors de la validation du module." });
    }
  }
);

// ============================================================================
// Developer Dashboard & Role Management Routes (No Service Role Key Required)
// ============================================================================

app.get(
  "/api/dev/dashboard",
  requireSupabaseAuth,
  requireDeveloperAuth,
  async (req: AuthedRequest, res: Response) => {
    try {
      const [profilesRes, classesRes, enrollmentsRes] = await Promise.all([
        req.userSupabase!
          .from("profiles")
          .select(PROFILE_SELECT_FIELDS)
          .order("created_at", { ascending: false }),
        req.userSupabase!
          .from("classes")
          .select("id, title, domain, teacher_id, schedule, capacity, status, created_at")
          .order("created_at", { ascending: false }),
        req.userSupabase!
          .from("class_enrollments")
          .select("class_id, student_id"),
      ]);

      if (profilesRes.error) {
        return res.status(400).json({ error: profilesRes.error.message });
      }

      const allProfiles = ((profilesRes.data || []) as DbProfileRow[]).map(mapDbRowToProfile);
      const profileById = new Map(allProfiles.map((p) => [p.id, p]));

      const enrollments = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : [];
      const enrollmentsByClass = new Map<string, string[]>();
      for (const row of enrollments as { class_id: string; student_id: string }[]) {
        const list = enrollmentsByClass.get(row.class_id) || [];
        list.push(row.student_id);
        enrollmentsByClass.set(row.class_id, list);
      }

      const rawClasses = Array.isArray(classesRes.data) ? classesRes.data : [];
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
        classesTableReady: !classesRes.error,
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
        typeof title === "string" && title.trim()
          ? title.trim().slice(0, 120)
          : targetRole === "teacher"
            ? "Formateur Expert"
            : targetRole === "admin"
              ? "Administrateur"
              : targetRole === "developer"
                ? "Développeur Plateforme"
                : "Apprenant Professionnel";
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

      // Use isolated anon client so developer's own session cookies/JWT are untouched
      const anonClient = createSupabaseAnonClient();
      const { data: signUpData, error: signUpErr } = await anonClient.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanFullName,
            username: cleanUsername || undefined,
            requested_role: targetRole === "teacher" ? "teacher" : "student",
            active_domain: cleanDomain,
          },
        },
      });

      if (signUpErr) {
        return res.status(400).json({ error: signUpErr.message });
      }
      if (!signUpData.user) {
        return res.status(400).json({ error: "Impossible de créer l'utilisateur." });
      }
      if (
        Array.isArray(signUpData.user.identities) &&
        signUpData.user.identities.length === 0
      ) {
        return res
          .status(409)
          .json({ error: "Un utilisateur avec cette adresse email existe déjà." });
      }

      // Update profile using Developer's authenticated JWT (authorized via is_developer() RLS)
      const { data: updatedProfile, error: upsertErr } = await req.userSupabase!
        .from("profiles")
        .upsert(
          {
            id: signUpData.user.id,
            email: cleanEmail,
            username: cleanUsername,
            full_name: cleanFullName,
            title: cleanTitle,
            active_domain: cleanDomain,
            role: targetRole,
            requested_role: targetRole === "guest" ? "student" : targetRole,
            request_status: targetRole === "guest" ? "pending" : "approved",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select(PROFILE_SELECT_FIELDS)
        .single();

      if (upsertErr) {
        return res.status(400).json({ error: upsertErr.message });
      }

      return res.status(201).json({
        user: mapDbRowToProfile(updatedProfile as DbProfileRow),
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

      if (userId === req.authUser!.id && role !== "developer") {
        return res.status(400).json({
          error: "Vous ne pouvez pas retirer votre propre rôle Développeur.",
        });
      }

      const nextStatus: ValidRequestStatus = VALID_REQUEST_STATUSES.includes(requestStatus)
        ? requestStatus
        : role === "guest"
          ? "rejected"
          : "approved";

      const { data, error } = await req.userSupabase!
        .from("profiles")
        .update({
          role,
          request_status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select(PROFILE_SELECT_FIELDS)
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
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

      const { data, error } = await req.userSupabase!
        .from("classes")
        .insert({
          title: title.trim(),
          domain: cleanDomain,
          teacher_id: cleanTeacherId,
          schedule: cleanSchedule,
          capacity: cleanCapacity,
          status: cleanStatus,
        })
        .select("id, title, domain, teacher_id, schedule, capacity, status, created_at")
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
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
      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (typeof title === "string" && title.trim().length >= 2) {
        updates.title = title.trim().slice(0, 140);
      }
      if (typeof domain === "string" && domain.trim()) {
        updates.domain = domain.trim().slice(0, 120);
      }
      if (teacherId === null || teacherId === "") {
        updates.teacher_id = null;
      } else if (typeof teacherId === "string" && VALID_UUID_REGEX.test(teacherId)) {
        updates.teacher_id = teacherId;
      }
      if (typeof schedule === "string") {
        updates.schedule = schedule.trim().slice(0, 140);
      }
      if (typeof capacity === "number" && capacity >= 1 && capacity <= 500) {
        updates.capacity = Math.floor(capacity);
      }
      if (status === "active" || status === "draft" || status === "archived") {
        updates.status = status;
      }

      const { data, error } = await req.userSupabase!
        .from("classes")
        .update(updates)
        .eq("id", classId)
        .select("id, title, domain, teacher_id, schedule, capacity, status, created_at")
        .single();

      if (error) {
        return res.status(400).json({ error: error.message });
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

      const { error } = await req.userSupabase!
        .from("classes")
        .delete()
        .eq("id", classId);

      if (error) {
        return res.status(400).json({ error: error.message });
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

      const { error: delErr } = await req.userSupabase!
        .from("class_enrollments")
        .delete()
        .eq("class_id", classId);

      if (delErr) {
        return res.status(400).json({ error: delErr.message });
      }

      if (cleanStudentIds.length > 0) {
        const rows = cleanStudentIds.map((studentId) => ({
          class_id: classId,
          student_id: studentId,
        }));
        const { error: insErr } = await req.userSupabase!
          .from("class_enrollments")
          .insert(rows);
        if (insErr) {
          return res.status(400).json({ error: insErr.message });
        }
      }

      return res.json({ ok: true, studentIds: cleanStudentIds });
    } catch (err) {
      console.error("Update enrollments error:", err);
      return res.status(500).json({ error: "Erreur lors de la mise à jour des inscriptions." });
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
    const profileRow = await ensureProfileRow(req.userSupabase!, req.authUser!);
    const role = normalizeRole(profileRow?.role);
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

export default app;
