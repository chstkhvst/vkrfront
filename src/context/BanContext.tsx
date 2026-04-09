import { createContext, ReactNode, useState } from "react";
import {
  Client,
  BanDTO,
  CreateBanDTO,
} from "../client/apiClient";

interface BanContextProps {
  bans: BanDTO[];
  selectedBan: BanDTO | null;
  
  isLoading: boolean;
  error: string | null;
  
  searchKeywords: string;
  setSearchKeywords: (value: string) => void;
  
  // Методы
  fetchBans: () => Promise<void>;
  fetchBanById: (id: number) => Promise<BanDTO | null>;
  isUserBanned: (userId: string) => Promise<boolean>;
  createBan: (data: CreateBanDTO) => Promise<BanDTO | null>;
  updateBan: (id: number, data: BanDTO) => Promise<boolean>;
  
  selectBan: (ban: BanDTO | null) => void;
}

export const BanContext = createContext<BanContextProps | undefined>(undefined);

export const BanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bans, setBans] = useState<BanDTO[]>([]);
  const [selectedBan, setSelectedBan] = useState<BanDTO | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeywords, setSearchKeywords] = useState<string>("");
  
  const apiClient = new Client(process.env.REACT_APP_API_URL || "");
  
  // Получить все баны
  const fetchBans = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getBans();
      setBans(data || []);
    } catch (err) {
      console.error("Ошибка при загрузке банов:", err);
      setError("Не удалось загрузить баны");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Получить бан по ID
  const fetchBanById = async (id: number): Promise<BanDTO | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getBanById(id);
      return data;
    } catch (err) {
      console.error("Ошибка при загрузке бана:", err);
      setError("Не удалось загрузить бан");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Проверить, забанен ли пользователь
  const isUserBanned = async (userId: string): Promise<boolean> => {
    try {
      const isBanned = await apiClient.isUserBanned(userId);
      return isBanned;
    } catch (err) {
      console.error("Ошибка при проверке бана пользователя:", err);
      return false;
    }
  };
  
  // Создать бан
  const createBan = async (data: CreateBanDTO): Promise<BanDTO | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiClient.createBan(data);
      await fetchBans(); // Обновляем список
      return result;
    } catch (err) {
      console.error("Ошибка при создании бана:", err);
      setError("Не удалось создать бан");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Обновить бан
  const updateBan = async (id: number, data: BanDTO): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient.updateBan(id, data);
      await fetchBans(); // Обновляем список
      return true;
    } catch (err) {
      console.error("Ошибка при обновлении бана:", err);
      setError("Не удалось обновить бан");
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Выбрать бан
  const selectBan = (ban: BanDTO | null) => {
    setSelectedBan(ban);
  };
  
  return (
    <BanContext.Provider
      value={{
        bans,
        selectedBan,
        isLoading,
        error,
        searchKeywords,
        setSearchKeywords,
        
        fetchBans,
        fetchBanById,
        isUserBanned,
        createBan,
        updateBan,
        
        selectBan,
      }}
    >
      {children}
    </BanContext.Provider>
  );
};