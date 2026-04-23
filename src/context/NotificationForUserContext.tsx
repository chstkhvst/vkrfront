import { createContext, ReactNode, useState } from "react";
import {
  Client,
  NotificationDTO,
  CreateNotificationDTO,
} from "../client/apiClient";

interface NotificationForUserContextProps {
    notifications: NotificationDTO[];
    unreadCount: number;

    isLoading: boolean;
    error: string | null;

    // методы
    fetchNotifications: (recipientId: string) => Promise<void>;
    fetchUnreadNotifications: (recipientId: string) => Promise<void>;
    fetchUnreadCount: (recipientId: string) => Promise<void>;

    createNotification: (data: CreateNotificationDTO) => Promise<void>;
    createForEvent: (data: CreateNotificationDTO) => Promise<void>;

    markAsRead: (notificationId: number, recipientId: string) => Promise<void>;
    markAllAsRead: (recipientId: string) => Promise<void>;
}

export const NotificationForUserContext = createContext<NotificationForUserContextProps | undefined>(undefined);

export const NotificationForUserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const apiClient = new Client(process.env.REACT_APP_API_URL || "");

    // все уведомления
    const fetchNotifications = async (recipientId: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await apiClient.getByRecipientId(recipientId);
            setNotifications(data || []);
        } catch (err) {
            console.error("Ошибка при загрузке уведомлений:", err);
            setError("Не удалось загрузить уведомления");
        } finally {
            setIsLoading(false);
        }
    };

    // только непрочитанные
    const fetchUnreadNotifications = async (recipientId: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await apiClient.getUnreadByRecipientId(recipientId);
            setNotifications(data || []);
        } catch (err) {
            console.error("Ошибка при загрузке непрочитанных уведомлений:", err);
            setError("Не удалось загрузить уведомления");
        } finally {
            setIsLoading(false);
        }
    };

    // количество непрочитанных
    const fetchUnreadCount = async (recipientId: string): Promise<void> => {
        try {
            const count = await apiClient.unreadCount(recipientId);
            setUnreadCount(count || 0);
        } catch (err) {
            console.error("Ошибка при получении количества уведомлений:", err);
        }
    };

    // создать одно уведомление
    const createNotification = async (data: CreateNotificationDTO): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            await apiClient.createNotification(data);
        } catch (err) {
            console.error("Ошибка при создании уведомления:", err);
            setError("Не удалось создать уведомление");
        } finally {
            setIsLoading(false);
        }
    };

    // создать для события
    const createForEvent = async (data: CreateNotificationDTO): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            await apiClient.createForEvent(data);
        } catch (err) {
            console.error("Ошибка при создании уведомлений:", err);
            setError("Не удалось создать уведомления");
        } finally {
            setIsLoading(false);
        }
    };

    // отметить одно
    const markAsRead = async (notificationId: number, recipientId: string): Promise<void> => {
        try {
            await apiClient.markAsRead(notificationId);

        // обновляем локально
            setNotifications(prev =>
            prev.map(n => {
                if (n.id === notificationId) {
                return new NotificationDTO({
                    ...n,
                    isRead: true,
                });
                }
                return n;
            })
        );

            await fetchUnreadCount(recipientId);
        } catch (err) {
            console.error("Ошибка при отметке уведомления:", err);
        }
    };

    // отметить все
    const markAllAsRead = async (recipientId: string): Promise<void> => {
        try {
            await apiClient.markAllAsRead(recipientId);

            setNotifications(prev =>
            prev.map(n =>
                new NotificationDTO({
                ...n,
                isRead: true,
                })
            )
            );

            setUnreadCount(0);
        } catch (err) {
            console.error("Ошибка при отметке всех уведомлений:", err);
        }
    };

return (
    <NotificationForUserContext.Provider
      value={{
        notifications,
        unreadCount,

        isLoading,
        error,

        fetchNotifications,
        fetchUnreadNotifications,
        fetchUnreadCount,

        createNotification,
        createForEvent,

        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationForUserContext.Provider>
  );
};