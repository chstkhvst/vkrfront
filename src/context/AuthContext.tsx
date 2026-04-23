import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  Client, 
  LoginModel, 
  RegisterModel, 
  AuthResponse, 
  UserDTO, FileParameter, UserForModerDTO, UserDTOPaginatedResponse } from "../client/apiClient"
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
  updateProfile: (data: {
    userName?: string;
    fullName?: string;
    organizationName?: string;
    ogrn?: string;
    image?: File;
    backgroundImage?: File;
  }) => Promise<void>;
  getUserById: (id: string) => Promise<UserForModerDTO>;
  getAllUsers: (page?: number, pageSize?: number, search?: string) => Promise<UserDTOPaginatedResponse>;
  getRatingMonthly: () => Promise<UserDTO[]>;
  getRatingAll: () => Promise<UserDTO[]>;
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
  const updateProfile = async (data: {
    userName?: string;
    fullName?: string;
    organizationName?: string;
    ogrn?: string;
    image?: File;
    backgroundImage?: File;
  }) => {
    if (!currentUser) return;

    const imageParam: FileParameter = data.image
      ? { data: data.image, fileName: data.image.name }
      : { data: new Blob(), fileName: "" }; 
    const backgroundParam: FileParameter = data.backgroundImage
    ? { data: data.backgroundImage, fileName: data.backgroundImage.name }
    : { data: new Blob(), fileName: "" };

    await client.profilePUT(
      data.fullName ?? currentUser.fullname ?? "",
      data.userName ?? currentUser.userName ?? "",
      currentUser.profileImagePath ?? "",
      data.organizationName ?? currentUser.organizerProfile?.organizationName ?? "",
      data.ogrn ?? currentUser.organizerProfile?.ogrn ?? "",
      imageParam,
      backgroundParam
    );

    await fetchCurrentUser();
  };
  const getUserById = async (id: string): Promise<UserForModerDTO> => {
    return await client.account(id);
  };

  const getAllUsers = async (
    page: number = 1,
    pageSize: number = 10,
    search?: string
  ): Promise<UserDTOPaginatedResponse> => {
    return await client.all(page, pageSize, search);
  };
  const getRatingMonthly = async (): Promise<UserDTO[]> => {
    return await client.ratingmonthly();
  };
  const getRatingAll = async (): Promise<UserDTO[]> => {
    return await client.rating();
  };
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
        updateProfile,
        getUserById,
        getAllUsers,
        getRatingMonthly,
        getRatingAll,
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