import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, UserRole } from "../types";

export const GUEST_PROFILE: UserProfile = {
  name: "Visiteur MARIN",
  email: "guest@marinacademy.pro",
  title: "Apprenant Professionnel",
  role: "guest",
  requestedRole: null,
  requestStatus: "none",
  requestNote: "",
  xp: 0,
  streak: 1,
  completedModules: [],
  enrolledPath: null,
  activeDomain: "المالية الذكية",
};

interface AuthUser {
  id: string;
  email?: string;
}

interface RegisterPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  requestedRole?: "student" | "teacher";
  requestNote?: string;
  activeDomain?: string;
}

interface LoginPayload {
  identifier: string;
  password: string;
}

interface UpdateProfilePayload {
  name?: string;
  title?: string;
  activeDomain?: string | null;
  username?: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
  profile?: UserProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile;
  setLocalProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  accessToken: string | null;
  authenticated: boolean;
  loading: boolean;
  supabaseConfigured: boolean;
  bunnyConfigured: boolean;
  role: UserRole;
  isDeveloper: boolean;
  isGuest: boolean;
  login: (payload: LoginPayload) => Promise<AuthResult>;
  register: (payload: RegisterPayload) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<AuthResult>;
  submitRoleRequest: (
    requestedRole: "student" | "teacher",
    requestNote?: string,
    activeDomain?: string
  ) => Promise<AuthResult>;
  completeModule: (moduleId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: GUEST_PROFILE,
  setLocalProfile: () => {},
  accessToken: null,
  authenticated: false,
  loading: true,
  supabaseConfigured: false,
  bunnyConfigured: false,
  role: "guest",
  isDeveloper: false,
  isGuest: true,
  login: async () => ({ ok: false }),
  register: async () => ({ ok: false }),
  logout: async () => {},
  updateProfile: async () => ({ ok: false }),
  submitRoleRequest: async () => ({ ok: false }),
  completeModule: async () => {},
  refreshSession: async () => {},
  getAuthHeaders: () => ({}),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(GUEST_PROFILE);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean>(false);
  const [bunnyConfigured, setBunnyConfigured] = useState<boolean>(false);

  const authHeaders = useCallback(
    (tokenOverride?: string | null): Record<string, string> => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      };
      const tok = tokenOverride !== undefined ? tokenOverride : accessToken;
      if (tok) {
        headers["Authorization"] = `Bearer ${tok}`;
      }
      return headers;
    },
    [accessToken]
  );

  const safeReadJson = async (res: Response): Promise<any | null> => {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return null;
    }
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const refreshSession = useCallback(async () => {
    try {
      const [statusRes, sessionRes] = await Promise.all([
        fetch("/api/auth/status", { credentials: "include" }),
        fetch("/api/auth/session", { credentials: "include" }),
      ]);

      if (statusRes.ok) {
        const statusData = await safeReadJson(statusRes);
        if (statusData) {
          setSupabaseConfigured(Boolean(statusData.supabaseConfigured));
          setBunnyConfigured(Boolean(statusData.bunnyConfigured));
        }
      }

      if (sessionRes.ok) {
        const data = await safeReadJson(sessionRes);
        if (data) {
          setSupabaseConfigured((prev) => Boolean(data.supabaseConfigured ?? prev));
          if (data.authenticated && data.user && data.profile) {
            setAuthenticated(true);
            setUser(data.user);
            setProfile(data.profile);
            setAccessToken(data.accessToken || null);
          } else {
            setAuthenticated(false);
            setUser(null);
            setProfile(GUEST_PROFILE);
            setAccessToken(null);
          }
        }
      }
    } catch (err) {
      console.error("Failed to hydrate auth session:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const register = async (payload: RegisterPayload): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: authHeaders(null),
        body: JSON.stringify(payload),
      });
      const data = await safeReadJson(res);
      if (!res.ok || !data) {
        return {
          ok: false,
          error: data?.error || "Erreur serveur lors de l'inscription.",
        };
      }

      if (data.needsEmailConfirmation) {
        return {
          ok: true,
          needsEmailConfirmation: true,
          profile: data.profile || undefined,
        };
      }

      if (data.user && data.profile) {
        setAuthenticated(true);
        setUser(data.user);
        setProfile(data.profile);
        setAccessToken(data.accessToken || null);
      }

      return { ok: true, profile: data.profile };
    } catch {
      return { ok: false, error: "Erreur réseau lors de l'inscription." };
    }
  };

  const login = async (payload: LoginPayload): Promise<AuthResult> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: authHeaders(null),
        body: JSON.stringify(payload),
      });
      const data = await safeReadJson(res);
      if (!res.ok || !data) {
        return {
          ok: false,
          error: data?.error || "Identifiants invalides ou serveur indisponible.",
        };
      }

      if (data.user && data.profile) {
        setAuthenticated(true);
        setUser(data.user);
        setProfile(data.profile);
        setAccessToken(data.accessToken || null);
      }

      return { ok: true, profile: data.profile };
    } catch {
      return { ok: false, error: "Erreur réseau lors de la connexion." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
      });
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      setAuthenticated(false);
      setUser(null);
      setProfile(GUEST_PROFILE);
      setAccessToken(null);
    }
  };

  const updateProfile = async (payload: UpdateProfilePayload): Promise<AuthResult> => {
    if (!authenticated) {
      setProfile((prev) => ({
        ...prev,
        ...payload,
      }));
      return { ok: true };
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await safeReadJson(res);
      if (!res.ok || !data) {
        return { ok: false, error: data?.error || "Erreur lors de la mise à jour." };
      }
      if (data.profile) {
        setProfile(data.profile);
      }
      return { ok: true, profile: data.profile };
    } catch {
      return { ok: false, error: "Erreur réseau lors de la mise à jour du profil." };
    }
  };

  const submitRoleRequest = async (
    requestedRole: "student" | "teacher",
    requestNote?: string,
    activeDomain?: string
  ): Promise<AuthResult> => {
    if (!authenticated) {
      return { ok: false, error: "Veuillez d'abord vous connecter." };
    }
    try {
      const res = await fetch("/api/profile/request-role", {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({ requestedRole, requestNote, activeDomain }),
      });
      const data = await safeReadJson(res);
      if (!res.ok || !data) {
        return { ok: false, error: data?.error || "Erreur lors de la demande." };
      }
      if (data.profile) {
        setProfile(data.profile);
      }
      return { ok: true, profile: data.profile };
    } catch {
      return { ok: false, error: "Erreur réseau lors de l'envoi de la demande." };
    }
  };

  const completeModule = async (moduleId: string) => {
    if (profile.completedModules.includes(moduleId)) {
      return;
    }

    setProfile((prev) => {
      if (prev.completedModules.includes(moduleId)) return prev;
      return {
        ...prev,
        xp: prev.xp + 100,
        completedModules: [...prev.completedModules, moduleId],
      };
    });

    if (!authenticated) return;

    try {
      const res = await fetch("/api/profile/complete-module", {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({ moduleId }),
      });
      if (res.ok) {
        const data = await safeReadJson(res);
        if (data?.profile) {
          setProfile(data.profile);
        }
      }
    } catch (err) {
      console.error("Failed to sync completed module:", err);
    }
  };

  const role: UserRole = profile.role || "guest";
  const isDeveloper = authenticated && role === "developer";
  const isGuest = !authenticated || role === "guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        setLocalProfile: setProfile,
        accessToken,
        authenticated,
        loading,
        supabaseConfigured,
        bunnyConfigured,
        role,
        isDeveloper,
        isGuest,
        login,
        register,
        logout,
        updateProfile,
        submitRoleRequest,
        completeModule,
        refreshSession,
        getAuthHeaders: () => authHeaders(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
