"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "@/src/lib/endpoints";
import { clearToken, getToken, setToken } from "@/src/lib/api";
import type { User, UserRole } from "@/src/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
  }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // 🟢 SOLUCIÓN: Calculamos el estado inicial de forma segura.
  // Esto se ejecuta UNA sola vez al montar, evitando el doble render.
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      // Si NO hay token, no necesitamos "cargar" nada (false).
      // Si HAY token, sí necesitamos cargar los datos del usuario (true).
      return !getToken();
    }
    // Durante la renderización en el servidor (SSR), asumimos que está cargando por seguridad
    return true;
  });

  useEffect(() => {
    const token = getToken();

    // 🟢 Solo hacemos la petición si existe un token.
    // Si no hay token, `loading` ya es `false` gracias al estado inicial,
    // por lo que YA NO necesitamos llamar a setLoading(false) aquí.
    if (token) {
      authApi
        .me()
        .then(setUser)
        .catch(() => {
          clearToken();
          setUser(null); // Buena práctica: asegurar que el usuario sea null si falla
        })
        .finally(() => setLoading(false));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedUser } = await authApi.login({
      email,
      password,
    });
    setToken(token);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const register = useCallback(
    async (payload: {
      email: string;
      password: string;
      name: string;
      role?: UserRole;
    }) => {
      const { token, user: newUser } = await authApi.register(payload);
      setToken(token);
      setUser(newUser);
      return newUser;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
