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
    selectAttendance: (attendance: EventAttendanceDTO | null) => void;
    markNoShow: (eventId: number) => Promise<boolean>;
    markCancelled: (eventId: number) => Promise<boolean>;
    markAttendance: (attendanceId: number) => Promise<boolean>;
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
        //setIsLoading(true);
        //setError(null);
        
        try {
            const result = await apiClient.getAttendanceByEventId(eventId);
            return result || [];
        } catch (error) {
            console.error(`Ошибка при загрузке участников события ${eventId}:`, error);
            setError("Не удалось загрузить участников события");
            return [];
        } finally {
            //setIsLoading(false);
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

    const markNoShow = async (eventId: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            await apiClient.markNoShow(eventId);
            // После успешной отметки обновляем список участников для этого события
            const updatedAttendances = await apiClient.getAttendanceByEventId(eventId);
            setAttendances(prev => 
                prev.map(a => a.eventId === eventId ? updatedAttendances.find(u => u.id === a.id) || a : a)
            );
            return true;
        } catch (error) {
            console.error(`Ошибка при отметке неявок для события ${eventId}:`, error);
            setError("Не удалось отметить неявки");
            return false;
        } finally {
            setIsLoading(false);
        }
    };
    const markCancelled = async (eventId: number): Promise<boolean> => {
        setIsLoading(true); 
        try {
            await apiClient.markCancelled(eventId);
            return true;
        } catch (error) {
            console.error(`Ошибка при отметке неявок для события ${eventId}:`, error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };
    const markAttendance = async (attendanceId: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            await apiClient.markAttendance(attendanceId);

            // обновляем конкретную запись локально
            const updated = await apiClient.getAttendanceById(attendanceId);

            if (updated) {
                setAttendances(prev =>
                    prev.map(a => a.id === attendanceId ? updated : a)
                );

                if (selectedAttendance?.id === attendanceId) {
                    setSelectedAttendance(updated);
                }
            }

            return true;
        } catch (error) {
            console.error(`Ошибка при отметке посещения ${attendanceId}:`, error);
            setError("Не удалось отметить посещение");
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
            markNoShow,
            markCancelled,
            markAttendance,
            
            // Метод для выбора
            selectAttendance
        }}>
            {children}
        </AttendanceContext.Provider>
    );
};