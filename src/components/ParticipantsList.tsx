import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Chip,
    CircularProgress,
    Alert,
} from "@mui/material";
import { AttendanceContext } from "../context/AttendanceContext";
import { EventAttendanceDTO } from "../client/apiClient";

type Props = {
    eventId: number;
};

const STATUS = {
    UPCOMING: 1,
    CANCELLED: 2,
    ATTENDED: 3,
    NO_SHOW: 4,
};

export const ParticipantsList: React.FC<Props> = ({ eventId }) => {
    const context = useContext(AttendanceContext);
    
    const [participants, setParticipants] = useState<EventAttendanceDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    
    // Ref для отслеживания монтирования компонента
    const isMounted = useRef(true);
    // Ref для предотвращения повторных загрузок с одинаковым eventId
    const lastLoadedEventId = useRef<number | null>(null);

    const {
        fetchAttendancesByEventId,
        updateAttendance,
        isLoading: contextLoading,
        error: contextError,
    } = context!;

    // Функция загрузки участников с защитой от дублирования
    const loadParticipants = useCallback(async () => {
        // Предотвращаем повторную загрузку для того же eventId
        if (lastLoadedEventId.current === eventId) {
            return;
        }

        try {
            setLoading(true);
            setLocalError(null);
            
            const data = await fetchAttendancesByEventId(eventId);
            
            if (isMounted.current) {
                setParticipants(data || []);
                lastLoadedEventId.current = eventId;
            }
        } catch (err) {
            if (isMounted.current) {
                setLocalError(err instanceof Error ? err.message : "Ошибка загрузки участников");
                console.error("Error loading participants:", err);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [eventId, fetchAttendancesByEventId]);

    // Загрузка при монтировании или изменении eventId
    useEffect(() => {
        isMounted.current = true;
        
        // Сбрасываем lastLoadedEventId при изменении eventId
        if (lastLoadedEventId.current !== eventId) {
            loadParticipants();
        }
        
        return () => {
            isMounted.current = false;
        };
    }, [eventId, loadParticipants]);

    // Обновление одного участника
    const updateStatus = useCallback(async (attendance: EventAttendanceDTO, statusId: number) => {
        if (!attendance.id) return;

        // Оптимистичное обновление UI
        const updated = new EventAttendanceDTO({
            ...attendance,
            attendanceStatusId: statusId,
        });
        
        setParticipants(prev =>
            prev.map(p => (p.id === attendance.id ? updated : p))
        );

        try {
            await updateAttendance(attendance.id, updated);
        } catch (err) {
            // Откат при ошибке
            if (isMounted.current) {
                setParticipants(prev =>
                    prev.map(p => (p.id === attendance.id ? attendance : p))
                );
                setLocalError("Ошибка при обновлении статуса");
                console.error("Error updating status:", err);
            }
        }
    }, [updateAttendance]);

    // Отметить всех
    const markAll = useCallback(async (statusId: number) => {
        if (participants.length === 0) return;

        // Сохраняем копию для возможного отката
        const originalParticipants = [...participants];
        
        // Оптимистичное обновление
        const updatedList = participants.map(p => ({
            ...p,
            attendanceStatusId: statusId,
        }));
        
        setParticipants(updatedList as EventAttendanceDTO[]);

        try {
            await Promise.all(
                updatedList.map(p => {
                    if (!p.id) return Promise.resolve();
                    
                    const updated = new EventAttendanceDTO({
                        ...p,
                        attendanceStatusId: statusId,
                    });
                    
                    return updateAttendance(p.id, updated);
                })
            );
        } catch (err) {
            // Откат при ошибке
            if (isMounted.current) {
                setParticipants(originalParticipants);
                setLocalError("Ошибка при массовом обновлении статусов");
                console.error("Error in mass update:", err);
            }
        }
    }, [participants, updateAttendance]);

    const getStatusLabel = useCallback((statusId?: number) => {
        switch (statusId) {
            case STATUS.ATTENDED:
                return "Присутствовал";
            case STATUS.NO_SHOW:
                return "Неявка";
            case STATUS.CANCELLED:
                return "Отменено";
            default:
                return "Ожидается";
        }
    }, []);

    const getStatusColor = useCallback((statusId?: number) => {
        switch (statusId) {
            case STATUS.ATTENDED:
                return "success";
            case STATUS.NO_SHOW:
                return "error";
            case STATUS.CANCELLED:
                return "default";
            default:
                return "warning";
        }
    }, []);

    // Показываем загрузку
    if (loading || contextLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    const displayError = localError || contextError;

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Участники ({participants.length})
            </Typography>

            {displayError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {displayError}
                </Alert>
            )}

            {/* Массовые действия - показываем только если есть участники */}
            {participants.length > 0 && (
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => markAll(STATUS.ATTENDED)}
                    >
                        Отметить всех как пришедших
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => markAll(STATUS.NO_SHOW)}
                    >
                        Отметить всех как неявку
                    </Button>
                </Box>
            )}

            {participants.length === 0 && !displayError && (
                <Typography color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                    Нет участников
                </Typography>
            )}

            <List>
                {participants.map(p => {
                    const user = p.user;

                    return (
                        <ListItem
                            key={p.id}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderBottom: "1px solid #eee",
                                "&:last-child": {
                                    borderBottom: "none",
                                },
                            }}
                        >
                            <ListItemText
                                primary={
                                    user?.fullname || 
                                    user?.userName || 
                                    `Пользователь ID: ${user?.id}` ||
                                    "Без имени"
                                }
                                secondary={user?.userName ? `@${user.userName}` : undefined}
                            />

                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                <Chip
                                    label={getStatusLabel(p.attendanceStatusId)}
                                    color={getStatusColor(p.attendanceStatusId)}
                                    variant="outlined"
                                    size="small"
                                />

                                {p.attendanceStatusId !== STATUS.ATTENDED && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="success"
                                        onClick={() => updateStatus(p, STATUS.ATTENDED)}
                                        title="Отметить как пришедшего"
                                    >
                                        ✔
                                    </Button>
                                )}
                            </Box>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};