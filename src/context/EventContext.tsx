import { createContext, ReactNode, useEffect, useState } from "react"
import { 
    Client, 
    VolunteerEventDTO, 
    EventCategory,
    EventStatus,
    City,
    AttendanceStatus,
    EventAttendanceDTO,
    CreateEventAttendanceDTO
} from "../client/apiClient"

// Интерфейс для параметров фильтрации событий
export interface EventFilterParams {
    catId?: number;
    cityId?: number;
    keyWords?: string;
    dateTime?: Date;
}
type CreateEventData = {
    name: string;
    description: string;
    lat: number;
    lng: number;
    address: string;
    eventDateTime: Date;
    eventPoints: number;
    participantsLimit: number;
    eventCategoryId: number;
    cityId: number;
    image?: File;
};
// Интерфейс для контекста событий
interface VolunteerEventContextProps {
    // Состояния
    events: VolunteerEventDTO[];
    selectedEvent: VolunteerEventDTO | null;
    eventCategories: EventCategory[];
    eventStatuses: EventStatus[];
    cities: City[];
    attendanceStatuses: AttendanceStatus[];
    isLoading: boolean;
    error: string | null;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    setPageNumber: (page: number) => void;
    // Методы для работы с событиями
    fetchEvents: (filterParams?: EventFilterParams) => Promise<void>;
    fetchEventById: (id: number) => Promise<VolunteerEventDTO | null>;
    createEvent: (eventData: CreateEventData) => Promise<VolunteerEventDTO | null>;
    updateEvent: (id: number, eventData: VolunteerEventDTO) => Promise<boolean>;
    deleteEvent: (id: number, softDelete?: boolean) => Promise<boolean>;
    
    // Методы для работы с участниками
    fetchEventAttendees: (eventId: number) => Promise<EventAttendanceDTO[]>;
    registerForEvent: (eventId: number, userId: string) => Promise<boolean>;
    unregisterFromEvent: (attendanceId: number) => Promise<boolean>;
    updateAttendanceStatus: (attendanceId: number, statusId: number) => Promise<boolean>;
    checkUserAttendance: (eventId: number, userId: string) => Promise<EventAttendanceDTO | null>;
    getParticipantsCount: (eventId: number) => Promise<number>;
    
    // Методы для справочников
    fetchEventCategories: () => Promise<void>;
    fetchEventStatuses: () => Promise<void>;
    fetchCities: () => Promise<void>;
    fetchAttendanceStatuses: () => Promise<void>;
    
    // Методы для фильтрации
    setFilterParams: (params: EventFilterParams) => void;
    clearFilters: () => void;
    
    // Метод для выбора события
    selectEvent: (event: VolunteerEventDTO | null) => void;

}

// Создание контекста
export const VolunteerEventContext = createContext<VolunteerEventContextProps | undefined>(undefined);

// Провайдер контекста
export const VolunteerEventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Состояния
    const [events, setEvents] = useState<VolunteerEventDTO[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<VolunteerEventDTO | null>(null);
    const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
    const [eventStatuses, setEventStatuses] = useState<EventStatus[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [attendanceStatuses, setAttendanceStatuses] = useState<AttendanceStatus[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    
    // Текущие параметры фильтрации
    const [filterParams, setFilterParamsState] = useState<EventFilterParams>({});
    const changePage = (newPage: number) => {
    setPageNumber(newPage);
};

    // Инициализация клиента API
    const apiClient = new Client(process.env.REACT_APP_API_URL || '');

    // Загрузка справочников при монтировании
    useEffect(() => {
        fetchEventCategories();
        fetchEventStatuses();
        fetchCities();
        fetchAttendanceStatuses();
    }, []);

    useEffect(() => {
    fetchEvents(filterParams);
    }, [pageNumber, pageSize, filterParams]);

    // Получение всех событий с фильтрацией
    const fetchEvents = async (params?: EventFilterParams): Promise<void> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await apiClient.getPagedEvents(
                pageNumber,
                pageSize,
                params?.catId,
                params?.cityId,
                params?.keyWords,
                params?.dateTime
            );

            setEvents(result.items || []);
            setTotalPages(result.totalPages || 1);
            
        } catch (error) {
            console.error("Ошибка при загрузке событий:", error);
            setError("Не удалось загрузить список событий");
        } finally {
            setIsLoading(false);
        }
    };

    // Получение события по ID
    const fetchEventById = async (id: number): Promise<VolunteerEventDTO | null> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const data = await apiClient.getEventById(id);
            return data;
        } catch (error) {
            console.error(`Ошибка при загрузке события с ID ${id}:`, error);
            setError("Не удалось загрузить информацию о событии");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Создание нового события
const createEvent = async (eventData: CreateEventData): Promise<VolunteerEventDTO | null> => {
    setIsLoading(true);
    setError(null);

    try { //    ДОБАВЛЕНИЕ С КАРТИНКАМИ ПРАВКА
        const fileParam = eventData.image
            ? { data: eventData.image, fileName: eventData.image.name }
            : { data: new Blob(), fileName: "" }; 

        const createdEvent = await apiClient.createEvent(
            eventData.name,
            eventData.description,
            eventData.lat,
            eventData.lng,
            eventData.address,
            eventData.eventDateTime,
            eventData.eventPoints,
            eventData.participantsLimit,
            fileParam,
            eventData.eventCategoryId,
            eventData.cityId,
        );

        await fetchEvents(filterParams);
        return createdEvent;
    } catch (error) {
        console.error("Ошибка при создании события:", error);
        setError("Не удалось создать событие");
        return null;
    } finally {
        setIsLoading(false);
    }
};

    // Обновление события
    const updateEvent = async (id: number, eventData: VolunteerEventDTO): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            await apiClient.updateEvent(id, eventData);
            // Обновляем список событий
            await fetchEvents(filterParams);
            return true;
        } catch (error) {
            console.error(`Ошибка при обновлении события с ID ${id}:`, error);
            setError("Не удалось обновить событие");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Удаление события
    const deleteEvent = async (id: number, softDelete: boolean = true): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            if (softDelete) {
                await apiClient.softDeleteEvent(id);
            } else {
                await apiClient.deleteEvent(id);
            }
            // Обновляем список событий
            await fetchEvents(filterParams);
            
            // Если удалено выбранное событие, сбрасываем выбор
            if (selectedEvent?.id === id) {
                setSelectedEvent(null);
            }
            
            return true;
        } catch (error) {
            console.error(`Ошибка при удалении события с ID ${id}:`, error);
            setError("Не удалось удалить событие");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Получение участников события
    const fetchEventAttendees = async (eventId: number): Promise<EventAttendanceDTO[]> => {
        try {
            return await apiClient.getAttendanceByEventId(eventId);
        } catch (error) {
            console.error(`Ошибка при загрузке участников события ${eventId}:`, error);
            setError("Не удалось загрузить список участников");
            return [];
        }
    };

    // Регистрация на событие
    const registerForEvent = async (eventId: number, userId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Создаем через fromJS с простым объектом
            const attendanceData = CreateEventAttendanceDTO.fromJS({
                userId: userId,
                eventId: eventId,
                attendanceStatusId: 1
                
            });
            
            await apiClient.create(attendanceData);
            return true;
        } catch (error) {
            console.error(`Ошибка при регистрации на событие ${eventId}:`, error);
            setError("Не удалось зарегистрироваться на событие");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Отмена регистрации
    const unregisterFromEvent = async (attendanceId: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            await apiClient.softDelete(attendanceId);
            return true;
        } catch (error) {
            console.error(`Ошибка при отмене регистрации ${attendanceId}:`, error);
            setError("Не удалось отменить регистрацию");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Обновление статуса участия
    const updateAttendanceStatus = async (attendanceId: number, statusId: number): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const attendance = await apiClient.getAttendanceById(attendanceId);
            attendance.attendanceStatusId = statusId;
            await apiClient.update(attendanceId, attendance);
            return true;
        } catch (error) {
            console.error(`Ошибка при обновлении статуса участия ${attendanceId}:`, error);
            setError("Не удалось обновить статус участия");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Проверка участия пользователя в событии
    const checkUserAttendance = async (eventId: number, userId: string): Promise<EventAttendanceDTO | null> => {
        try {
            return await apiClient.getByUserAndEvent(userId, eventId);
        } catch (error) {
            console.error(`Ошибка при проверке участия пользователя в событии ${eventId}:`, error);
            return null;
        }
    };

    // Получение количества участников
    const getParticipantsCount = async (eventId: number): Promise<number> => {
        try {
            return await apiClient.countParticipants(eventId);
        } catch (error) {
            console.error(`Ошибка при подсчете участников события ${eventId}:`, error);
            return 0;
        }
    };

    // Загрузка категорий событий
    const fetchEventCategories = async (): Promise<void> => {
        try {
            const data = await apiClient.getEventCategories();
            setEventCategories(data || []);
        } catch (error) {
            console.error("Ошибка при загрузке категорий событий:", error);
        }
    };

    // Загрузка статусов событий
    const fetchEventStatuses = async (): Promise<void> => {
        try {
            const data = await apiClient.getEventStatuses();
            setEventStatuses(data || []);
        } catch (error) {
            console.error("Ошибка при загрузке статусов событий:", error);
        }
    };

    // Загрузка городов
    const fetchCities = async (): Promise<void> => {
        try {
            const data = await apiClient.getCities();
            setCities(data || []);
        } catch (error) {
            console.error("Ошибка при загрузке городов:", error);
        }
    };

    // Загрузка статусов участия
    const fetchAttendanceStatuses = async (): Promise<void> => {
        try {
            const data = await apiClient.getAttendanceStatuses();
            setAttendanceStatuses(data || []);
        } catch (error) {
            console.error("Ошибка при загрузке статусов участия:", error);
        }
    };

    // Установка параметров фильтрации
    const setFilterParams = (params: EventFilterParams): void => {
        setFilterParamsState(params);
        setPageNumber(1);
    };
    // Очистка фильтров
    const clearFilters = (): void => {
        setFilterParamsState({});
        setPageNumber(1);
    };

    // Выбор события
    const selectEvent = (event: VolunteerEventDTO | null): void => {
        setSelectedEvent(event);
    };

    return (
        <VolunteerEventContext.Provider value={{
            // Состояния
            events,
            selectedEvent,
            eventCategories,
            eventStatuses,
            cities,
            attendanceStatuses,
            isLoading,
            error,
            
            // для пагинации
            pageNumber,
            pageSize,
            totalPages,
            setPageNumber: changePage,
            // Методы для работы с событиями
            fetchEvents,
            fetchEventById,
            createEvent,
            updateEvent,
            deleteEvent,
            
            // Методы для работы с участниками
            fetchEventAttendees,
            registerForEvent,
            unregisterFromEvent,
            updateAttendanceStatus,
            checkUserAttendance,
            getParticipantsCount,
            
            // Методы для справочников
            fetchEventCategories,
            fetchEventStatuses,
            fetchCities,
            fetchAttendanceStatuses,
            
            // Методы для фильтрации
            setFilterParams,
            clearFilters,
            
            // Метод для выбора события
            selectEvent
        }}>
            {children}
        </VolunteerEventContext.Provider>
    );
};