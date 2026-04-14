import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField  
} from "@mui/material";
import { AttendanceContext } from "../context/AttendanceContext";
import { EventAttendanceDTO } from "../client/apiClient";
import { useNotification } from '../components/Notification';
type Props = {
    eventId: number;
    eventDateTime: Date;
};

const STATUS = {
    UPCOMING: 1,
    CANCELLED: 2,
    ATTENDED: 3,
    NO_SHOW: 4,
};

export const ParticipantsList: React.FC<Props> = ({ eventId, eventDateTime }) => {
    const context = useContext(AttendanceContext);
    
    const [participants, setParticipants] = useState<EventAttendanceDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [markingAllNoShow, setMarkingAllNoShow] = useState(false);
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const isMounted = useRef(true);

    const {
        fetchAttendancesByEventId,
        updateAttendance,
        markNoShow,
        markAttendance
    } = context!;

    const loadParticipants = async () => {
        try {
            setLoading(true);

            const data = await fetchAttendancesByEventId(eventId);

            if (isMounted.current) {
                setParticipants(
                    (data || []).filter(p => p.attendanceStatusId !== STATUS.CANCELLED)
                );
            }
        } catch {
            if (isMounted.current) {
                showNotification("Ошибка загрузки участников", "error");
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMounted.current = true;

        loadParticipants();

        return () => {
            isMounted.current = false;
        };
    }, [eventId]);

    const activeParticipants = participants.filter(
        p => p.attendanceStatusId !== STATUS.CANCELLED
    );
    const filteredParticipants = activeParticipants.filter(p => {
        const search = searchTerm.toLowerCase().trim();
        if (!search) return true;
        
        const fullname = p.user?.fullname?.toLowerCase() || "";
        const username = p.user?.userName?.toLowerCase() || "";
        
        return fullname.includes(search) || username.includes(search);
    });
    const canMarkAttendance = (() => {
        if (!eventDateTime) return false;

        const now = new Date();
        const event = new Date(eventDateTime);

        const diffMs = event.getTime() - now.getTime();

        return diffMs <= 2 * 60 * 60 * 1000; // 2 часа
    })();

    const handleOpenConfirmDialog = useCallback(() => {
        setConfirmDialogOpen(true);
    }, []);
    const handleMarkAllAsNoShow = useCallback(async () => {
        setMarkingAllNoShow(true);
        try {
            await markNoShow(eventId);
            await loadParticipants(); 
            showNotification("Неявки успешно отмечены", "success");
        } catch {
            showNotification("Ошибка при отметке неявок", "error");
        } finally {
            setMarkingAllNoShow(false);
        }
    }, [eventId, markNoShow, loadParticipants]);
    
   const handleMarkAttendance = async (attendance: EventAttendanceDTO) => {
        if (!attendance.id) return;

        try {
            await markAttendance(attendance.id);
            await loadParticipants();
        } catch {
            showNotification("Ошибка при отметке посещения", "error");
        }
    };

    const handleMarkNoShowSingle = async (attendance: EventAttendanceDTO) => {
        if (!attendance.id) return;

        const updated = new EventAttendanceDTO({
            ...attendance,
            attendanceStatusId: STATUS.NO_SHOW,
        });

        try {
            await updateAttendance(attendance.id, updated);
            await loadParticipants();
        } catch {
            showNotification("Ошибка при отметке неявки", "error");
        }
    };

    const getStatusLabel = useCallback((statusId?: number) => {
        switch (statusId) {
            case STATUS.ATTENDED:
                return "Присутствовал";
            case STATUS.NO_SHOW:
                return "Неявка";
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
            default:
                return "warning";
        }
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {filteredParticipants.length === 0 &&  (
                <Typography color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
                    Нет участников
                </Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">
                    Участники ({filteredParticipants.length})
                </Typography>
                    <TextField
                    size="small"
                    placeholder="Поиск по имени или логину"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 250 }}
                />
                {canMarkAttendance && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleOpenConfirmDialog}
                        disabled={markingAllNoShow || activeParticipants.every(p => 
                            p.attendanceStatusId === STATUS.ATTENDED || 
                            p.attendanceStatusId === STATUS.NO_SHOW
                        )}
                        startIcon={markingAllNoShow ? <CircularProgress size={20} /> : null}
                    >
                        {markingAllNoShow ? "Отметка..." : "Отметить оставшихся как неявку"}
                    </Button>
                )}
            </Box>

            <List sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {filteredParticipants.map(p => {
                const user = p.user;
                const isFinal =
                p.attendanceStatusId === STATUS.ATTENDED ||
                p.attendanceStatusId === STATUS.NO_SHOW;

                return (
                <ListItem
                    key={p.id}
                    sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    }}
                >
                    {/* Левая часть */}
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography fontWeight={500}>
                        {user?.fullname ||
                        user?.userName ||
                        `Пользователь ID: ${user?.id}` ||
                        "Без имени"}
                    </Typography>

                    {user?.userName && (
                        <Typography variant="body2" color="text.secondary">
                        @{user.userName}
                        </Typography>
                    )}
                    </Box>

                    {/* Правая часть */}
                    <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                    >
                    <Chip
                        label={getStatusLabel(p.attendanceStatusId)}
                        color={getStatusColor(p.attendanceStatusId)}
                        variant="outlined"
                    />

                    {!isFinal && canMarkAttendance && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleMarkAttendance(p)}
                        >
                            Присутствовал
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleMarkNoShowSingle(p)}
                        >
                            Неявка
                        </Button>
                        </Box>
                    )}
                    </Box>
                </ListItem>
                );
            })}
            </List>
            <Dialog
                open={confirmDialogOpen}
                onClose={() => setConfirmDialogOpen(false)}
            >
                <DialogTitle sx={{ color: '#f44336' }}>
                    Отметка всех участников
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите отметить всех неотмеченных участников как неявившихся?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)}>
                        Отмена
                    </Button>
                    <Button 
                        onClick={handleMarkAllAsNoShow} 
                        variant="contained" 
                        color="error"
                        autoFocus
                    >
                        Подтвердить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};