import React, { createContext, useContext, useEffect, useState } from "react";
import { Client, LoginModel, RegisterModel, AuthResponse, UserDTO } from "../client/apiClient"
const TOKEN_KEY = "jwtToken";

const client = new Client("", {
  fetch: (url, options: any = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  },
});

interface AuthContextType {
  user: AuthResponse | null;
  currentUser: UserDTO | null;
  isLoading: boolean;
  userRole: string | null;

  login: (data: LoginModel) => Promise<void>;
  register: (data: RegisterModel) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  getUserRole: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [currentUser, setCurrentUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

 const getUserRole = (): string | null => {
  if (user?.role) return user.role;
  
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      return parsedUser.role || null;
    } catch {
      return null;
    }
  }
  return null;
};
  const fetchCurrentUser = async () => {
    try {
      const result = await client.profileGET();
      setCurrentUser(result);
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserRole(parsedUser.role || null);
      }

      fetchCurrentUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (data: LoginModel) => {
    const response = await client.login(data);

    localStorage.setItem(TOKEN_KEY, response.token!);
    localStorage.setItem("user", JSON.stringify(response));

    setUser(response);
    setUserRole(response.role || null);
    await fetchCurrentUser();
  };

  const register = async (data: RegisterModel) => {
    const response = await client.register(data);

    localStorage.setItem(TOKEN_KEY, response.token!);
    localStorage.setItem("user", JSON.stringify(response));

    setUser(response);
    setUserRole(response.role || null);
    await fetchCurrentUser();
  };

  const logout = async () => {
    try {
      await client.logout();
    } catch {}

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");

    setUser(null);
    setCurrentUser(null);
    setUserRole(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser,
        isLoading,
        userRole,
        login,
        register,
        logout,
        fetchCurrentUser,
        getUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};