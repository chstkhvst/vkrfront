import { createContext, ReactNode, useEffect, useState } from "react"
import { 
    Client, 
    EventAttendanceDTO,
    CreateEventAttendanceDTO,
    AttendanceStatus
} from "../client/apiClient"

// Интерфейс для контекста посещаемости
interface AttendanceContextProps {
    // Состояния
    attendances: EventAttendanceDTO[];
    selectedAttendance: EventAttendanceDTO | null;
    isLoading: boolean;
    error: string | null;

    attendanceStatuses: AttendanceStatus[];
    fetchAttendanceStatuses: () => Promise<void>;
    
    fetchAllAttendances: () => Promise<void>;
    fetchAttendanceById: (id: number) => Promise<EventAttendanceDTO | null>;
    fetchAttendancesByUserId: (userId: string) => Promise<EventAttendanceDTO[]>;
    fetchAttendancesByEventId: (eventId: number) => Promise<EventAttendanceDTO[]>;
    fetchAttendanceByUserAndEvent: (userId: string, eventId: number) => Promise<EventAttendanceDTO | null>;
    getParticipantsCount: (eventId: number) => Promise<number>;
    createAttendance: (attendanceData: CreateEventAttendanceDTO) => Promise<boolean>;
    updateAttendance: (id: number, attendanceData: EventAttendanceDTO) => Promise<boolean>;
    deleteAttendance: (id: number) => Promise<boolean>;
    softDeleteAttendance: (id: number) => Promise<boolean>;
    selectAttendance: (attendance: EventAttendanceDTO | null) => void;
}

// Создание контекста
export const AttendanceContext = createContext<AttendanceContextProps | undefined>(undefined);

// Провайдер контекста
export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Состояния
    const [attendances, setAttendances] = useState<EventAttendanceDTO[]>([]);
    const [selectedAttendance, setSelectedAttendance] = useState<EventAttendanceDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [attendanceStatuses, setAttendanceStatuses] = useState<AttendanceStatus[]>([]);
    
    // Инициализация клиента API
    const apiClient = new Client(process.env.REACT_APP_API_URL || '');

    const fetchAttendanceStatuses = async (): Promise<void> => {
        try {
            const result = await apiClient.getAttendanceStatuses();
            setAttendanceStatuses(result || []);
        } catch (error) {
            console.error("Ошибка при загрузке статусов:", error);
        }
    };
    // Получение всех записей о посещаемости
    const fetchAllAttendances = async (): Promise<void> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await apiClient.getAttendanceAll();
            setAttendances(result || []);
        } catch (error) {
            console.error("Ошибка при загрузке записей о посещаемости:", error);
            setError("Не удалось загрузить список участников");
        } finally {
            setIsLoading(false);
        }
    };

    // Получение записи по ID
    const fetchAttendanceById = async (id: number): Promise<EventAttendanceDTO | null> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const data = await apiClient.getAttendanceById(id);
            return data;
        } catch (error) {
            console.error(`Ошибка при загрузке записи с ID ${id}:`, error);
            setError("Не удалось загрузить информацию об участии");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Получение записей по ID пользователя
    const fetchAttendancesByUserId = async (userId: string): Promise<EventAttendanceDTO[]> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await apiClient.getByUserId(userId);
            return result || [];
        } catch (error) {
            console.error(`Ошибка при загрузке записей пользователя ${userId}:`, error);
            setError("Не удалось загрузить мероприятия пользователя");
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Получение записей по ID события
    const fetchAttendancesByEventId = async (eventId: number): Promise<EventAttendanceDTO[]> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await apiClient.getAttendanceByEventId(eventId);
            return result || [];
        } catch (error) {
            console.error(`Ошибка при загрузке участников события ${eventId}:`, error);
            setError("Не удалось загрузить участников события");
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Получение записи по пользователю и событию
    const fetchAttendanceByUserAndEvent = async (userId: string, eventId: number): Promise<EventAttendanceDTO | null> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await apiClient.getByUserAndEvent(userId, eventId);
            return result;
        } catch (error) {
            console.error(`Ошибка при проверке участия:`, error);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Получение количества участников события
    const getParticipantsCount = async (eventId: number): Promise<number> => {
        try {
            const count = await apiClient.countParticipants(eventId);
            return count;
        } catch (error) {
            console.error(`Ошибка при подсчете участников события ${eventId}:`, error);
            return 0;
        }
    };

    // Создание новой записи о посещаемости
    const createAttendance = async (attendanceData: CreateEventAttendanceDTO): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            await apiClient.create(attendanceData);
            await fetchAllAttendances();
            return true;
        } catch (error) {
            console.error("Ошибка при создании записи о посещаемости:", error);
            setError("Не удалось зарегистрировать участника");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Обновление записи о посещаемости
    const updateAttendance = async (id: number, attendanceData: EventAttendanceDTO): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            await apiClient.update(id, attendanceData);

            setAttendances(prev =>
                prev.map(a => a.id === id ? attendanceData : a)
            );
            
            if (selectedAttendance?.id === id) {
                setSelectedAttendance(attendanceData);
            }
            
            return true;
        } catch (error) {
            console.error(`Ошибка при обновлении записи с ID ${id}:`, error);
            setError("Не удалось обновить статус участия");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Полное удаление записи
    const deleteAttendance = async (id: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            await apiClient.delete(id);
            await fetchAllAttendances();
            
            if (selectedAttendance?.id === id) {
                setSelectedAttendance(null);
            }
            
            return true;
        } catch (error) {
            console.error(`Ошибка при удалении записи с ID ${id}:`, error);
            setError("Не удалось удалить запись");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Мягкое удаление записи
    const softDeleteAttendance = async (id: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            await apiClient.softDelete(id);
            await fetchAllAttendances();
            
            if (selectedAttendance?.id === id) {
                setSelectedAttendance(null);
            }
            
            return true;
        } catch (error) {
            console.error(`Ошибка при отмене регистрации ${id}:`, error);
            setError("Не удалось отменить регистрацию");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Выбор записи
    const selectAttendance = (attendance: EventAttendanceDTO | null): void => {
        setSelectedAttendance(attendance);
    };

    return (
        <AttendanceContext.Provider value={{
            // Состояния
            attendances,
            selectedAttendance,
            isLoading,
            error,
            
            attendanceStatuses,

            fetchAttendanceStatuses,
            fetchAllAttendances,
            fetchAttendanceById,
            fetchAttendancesByUserId,
            fetchAttendancesByEventId,
            fetchAttendanceByUserAndEvent,
            getParticipantsCount,
            createAttendance,
            updateAttendance,
            deleteAttendance,
            softDeleteAttendance,
            
            // Метод для выбора
            selectAttendance
        }}>
            {children}
        </AttendanceContext.Provider>
    );
};