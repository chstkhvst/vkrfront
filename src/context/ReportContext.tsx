import { createContext, ReactNode, useState } from "react";
import {
  Client,
  UserReportDTO,
  ReportStatus,
  CreateReportDTO,
  ReportGroupDTO,
} from "../client/apiClient";

interface ReportContextProps {
  reports: UserReportDTO[];
  reportGroups: ReportGroupDTO[];
  selectedReport: UserReportDTO | null;
  reportStatuses: ReportStatus[];

  isLoading: boolean;
  error: string | null;

  searchKeywords: string;
  setSearchKeywords: (value: string) => void;

  // Методы
  fetchReports: () => Promise<void>;
  fetchGroupedReports: (statusId?: number, keywords?: string) => Promise<void>;
  fetchReportById: (id: number) => Promise<UserReportDTO | null>;
  fetchReportsBySender: (senderId: string) => Promise<UserReportDTO[]>;
  fetchReportsByReported: (reportedId: string) => Promise<UserReportDTO[]>;
  fetchReportsByStatus: (statusId: number) => Promise<void>;

  createReport: (data: CreateReportDTO) => Promise<UserReportDTO | null>;
  updateReport: (id: number, data: UserReportDTO) => Promise<UserReportDTO | null>;

  fetchReportStatuses: () => Promise<void>;

  selectReport: (report: UserReportDTO | null) => void;
}

export const ReportContext = createContext<ReportContextProps | undefined>(undefined);

export const ReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<UserReportDTO[]>([]);
  const [reportGroups, setReportGroups] = useState<ReportGroupDTO[]>([]);
  const [selectedReport, setSelectedReport] = useState<UserReportDTO | null>(null);
  const [reportStatuses, setReportStatuses] = useState<ReportStatus[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKeywords, setSearchKeywords] = useState<string>("");

  const apiClient = new Client(process.env.REACT_APP_API_URL || "");

  // Получить все жалобы
  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getReports();
      setReports(data || []);
    } catch (err) {
      console.error("Ошибка при загрузке жалоб:", err);
      setError("Не удалось загрузить жалобы");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchGroupedReports = async (
    statusId?: number,
    keywords?: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      let data;

      if (statusId !== undefined && keywords) {
        data = await apiClient.getGroupedReports(statusId, keywords);
      } else if (statusId !== undefined) {
        data = await apiClient.getGroupedReports(statusId);
      } else if (keywords) {
        data = await apiClient.getGroupedReports(undefined, keywords);
      } else {
        data = await apiClient.getGroupedReports();
      }

      setReportGroups(data || []);
    } catch (err) {
      console.error("Ошибка при загрузке сгруппированных жалоб:", err);
      setError("Ошибка загрузки");
    } finally {
      setIsLoading(false);
    }
  };

  // По ID
  const fetchReportById = async (id: number): Promise<UserReportDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getReportById(id);
      return data;
    } catch (err) {
      console.error("Ошибка при загрузке жалобы:", err);
      setError("Не удалось загрузить жалобу");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // По отправителю
  const fetchReportsBySender = async (senderId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getReportBySenderId(senderId);
      return data || [];
    } catch (err) {
      console.error("Ошибка при загрузке жалоб отправителя:", err);
      setError("Ошибка загрузки");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // По тому на кого жалоба
  const fetchReportsByReported = async (reportedId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getReportByReportedId(reportedId);
      return data || [];
    } catch (err) {
      console.error("Ошибка при загрузке жалоб:", err);
      setError("Ошибка загрузки");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // По статусу
const fetchReportsByStatus = async (statusId: number): Promise<void> => {
  setIsLoading(true);
  setError(null);

  try {
    const data = await apiClient.getByStatus(statusId);
    setReports(data || []);
  } catch (err) {
    console.error("Ошибка при загрузке жалоб по статусу:", err);
    setError("Ошибка загрузки");
  } finally {
    setIsLoading(false);
  }
};

  // Создание
  const createReport = async (data: CreateReportDTO): Promise<UserReportDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.createReport(data);
      await fetchReports();
      return result;
    } catch (err) {
      console.error("Ошибка при создании жалобы:", err);
      setError("Не удалось создать жалобу");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление
  const updateReport = async (
    id: number,
    data: UserReportDTO
  ): Promise<UserReportDTO | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.updateReport(id, data);
      await fetchReports();
      return result;
    } catch (err) {
      console.error("Ошибка при обновлении жалобы:", err);
      setError("Не удалось обновить жалобу");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Статусы
  const fetchReportStatuses = async () => {
    try {
      const data = await apiClient.getReportStatuses();
      setReportStatuses(data || []);
    } catch (err) {
      console.error("Ошибка при загрузке статусов жалоб:", err);
    }
  };

  // Выбор
  const selectReport = (report: UserReportDTO | null) => {
    setSelectedReport(report);
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        reportGroups,
        selectedReport,
        reportStatuses,
        isLoading,
        error,
        searchKeywords,
        setSearchKeywords,

        fetchReports,
        fetchGroupedReports,
        fetchReportById,
        fetchReportsBySender,
        fetchReportsByReported,
        fetchReportsByStatus,

        createReport,
        updateReport,

        fetchReportStatuses,

        selectReport,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};