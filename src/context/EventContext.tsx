import { createContext, ReactNode, useEffect, useState } from "react"
import { 
    Client, 
    VolunteerEventDTO, 
    EventCategory,
    EventStatus,
    City,
    GeocodeResult
} from "../client/apiClient"

// Интерфейс для параметров фильтрации событий
export interface EventFilterParams {
    catId?: number;
    cityId?: number;
    keyWords?: string;
    dateTime?: Date;
    statusId?: number;
}
type CreateEventData = {
    name: string;
    description: string;
    lat: string;
    lng: string;
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
    communityEvents: VolunteerEventDTO[];
    selectedEvent: VolunteerEventDTO | null;
    eventCategories: EventCategory[];
    eventStatuses: EventStatus[];
    cities: City[];

    isLoading: boolean;
    error: string | null;
    pageNumber: number;
    communityPageNumber: number;
    pageSize: number;
    totalPages: number;
    communityTotalPages: number;
    setPageNumber: (page: number) => void;
    setCommunityPageNumber: (page: number) => void;
    // Методы для работы с событиями
    fetchEvents: (filterParams?: EventFilterParams) => Promise<void>;
    fetchEventsForUser: (filterParams?: EventFilterParams) => Promise<void>;
    fetchCommunityEvents: (filterParams?: EventFilterParams) => Promise<void>;
    fetchEventById: (id: number) => Promise<VolunteerEventDTO | null>;
    getEventsByUserId: (userId: string) => Promise<VolunteerEventDTO[]>;
    createEvent: (eventData: CreateEventData) => Promise<VolunteerEventDTO | null>;
    updateEvent: (id: number, eventData: VolunteerEventDTO) => Promise<boolean>;
    deleteEvent: (id: number, softDelete?: boolean) => Promise<boolean>;
    
    geocode: (query: string) => Promise<GeocodeResult[]>;
    reverseGeocode: (lat: number, lon: number) => Promise<GeocodeResult | null>;

    // Методы для справочников
    fetchEventCategories: () => Promise<void>;
    fetchEventStatuses: () => Promise<void>;
    fetchCities: () => Promise<void>;
    
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
    const [communityEvents, setCommunityEvents] = useState<VolunteerEventDTO[]>([]); 
    const [selectedEvent, setSelectedEvent] = useState<VolunteerEventDTO | null>(null);
    const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
    const [eventStatuses, setEventStatuses] = useState<EventStatus[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [communityPageNumber, setCommunityPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [communityTotalPages, setCommunityTotalPages] = useState(1);
    
    // Текущие параметры фильтрации
    const [filterParams, setFilterParamsState] = useState<EventFilterParams>({});
    const changePage = (newPage: number) => {
        setPageNumber(newPage);
    };
    const changeCommunityPage = (newPage: number) => {
        setCommunityPageNumber(newPage);
    };

    // Инициализация клиента API
    const apiClient = new Client(process.env.REACT_APP_API_URL || '');

    // Загрузка справочников при монтировании
    useEffect(() => {
        fetchEventCategories();
        fetchEventStatuses();
        fetchCities();
    }, []);

    // useEffect(() => {
    // fetchEvents(filterParams);
    // }, [pageNumber, pageSize, filterParams]);

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
                params?.dateTime,
                params?.statusId,
            );
            console.log(result);
            setEvents(result.items || []);
            setTotalPages(result.totalPages || 1);
            
        } catch (error) {
            console.error("Ошибка при загрузке событий:", error);
            setError("Не удалось загрузить список событий");
        } finally {
            setIsLoading(false);
        }
    };
    const fetchEventsForUser = async ( params?: EventFilterParams): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiClient.getPagedForUser(
                pageNumber,
                pageSize,
                params?.catId,
                params?.cityId,
                params?.keyWords,
                params?.dateTime
            );
            console.log(result);

            setEvents(result.items || []);
            setTotalPages(result.totalPages || 1);

        } catch (error) {
            console.error("Ошибка при загрузке событий пользователя:", error);
            setError("Не удалось загрузить список событий");
        } finally {
            setIsLoading(false);
        }
    };
    const fetchCommunityEvents = async (params?: EventFilterParams): Promise<void> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await apiClient.getPagedCommunityEvents(
                communityPageNumber,
                pageSize,
                params?.catId,
                params?.cityId,
                params?.keyWords,
                params?.dateTime,
                params?.statusId
            );
            console.log(result);
            
            setCommunityEvents(result.items || []);
            setCommunityTotalPages(result.totalPages || 1);
            
        } catch (error) {
            console.error("Ошибка при загрузке событий от волонтеров:", error);
            setError("Не удалось загрузить список событий волонтеров");
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
    const getEventsByUserId = async (userId: string): Promise<VolunteerEventDTO[]> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const result = await apiClient.getEventsByUserId(userId);
            return result || [];
        } catch (error) {
            console.error(`Ошибка при загрузке событий пользователя ${userId}:`, error);
            setError("Не удалось загрузить события пользователя");
            return [];
        } finally {
            setIsLoading(false);
        }
    };
    const geocode = async (query: string): Promise<GeocodeResult[]> => {
        try {
            if (!query) return [];

            const data = await apiClient.geocode(query);
            return data || [];
        } catch (error) {
            console.error("Ошибка геокодинга:", error);
            return [];
        }
    };
    const reverseGeocode = async (lat: number, lon: number): Promise<GeocodeResult | null> => {
        try {
            const data = await apiClient.reverseGeocode(lat, lon);
            return data || null;
        } catch (error) {
            console.error("Ошибка reverse geocode:", error);
            return null;
        }
    };

    // Создание нового события
    const createEvent = async (eventData: CreateEventData): Promise<VolunteerEventDTO | null> => {
        setIsLoading(true);
        setError(null);

        try { 
            const fileParam = eventData.image
                ? { data: eventData.image, fileName: eventData.image.name }
                : { data: new Blob(), fileName: "" }; 
            console.log(eventData);
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

            //await fetchEvents(filterParams);
            return createdEvent;
        } catch (error: any) {
            console.error("Ошибка при создании события:", error);

        console.error("message:", error?.message);
        console.error("status:", error?.status);
        console.error("response:", error?.response);
        console.error("headers:", error?.headers);
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

    // Установка параметров фильтрации
    const setFilterParams = (params: EventFilterParams): void => {
        setFilterParamsState(params);
        setPageNumber(1);
        setCommunityPageNumber(1);
    };
    // Очистка фильтров
    const clearFilters = (): void => {
        setFilterParamsState({});
        setPageNumber(1);
        setCommunityPageNumber(1);
    };

    // Выбор события
    const selectEvent = (event: VolunteerEventDTO | null): void => {
        setSelectedEvent(event);
    };

    return (
        <VolunteerEventContext.Provider value={{
            // Состояния
            events,
            communityEvents,
            selectedEvent,
            eventCategories,
            eventStatuses,
            cities,
            isLoading,
            error,
            
            // для пагинации
            pageNumber,
            communityPageNumber,
            pageSize,
            totalPages,
            communityTotalPages,
            setPageNumber: changePage,
            setCommunityPageNumber: changeCommunityPage,
            // Методы для работы с событиями
            fetchEvents,
            fetchEventById,
            createEvent,
            updateEvent,
            deleteEvent,
            getEventsByUserId,
            fetchEventsForUser,
            fetchCommunityEvents,
            
            geocode,
            reverseGeocode,

            // Методы для справочников
            fetchEventCategories,
            fetchEventStatuses,
            fetchCities,

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