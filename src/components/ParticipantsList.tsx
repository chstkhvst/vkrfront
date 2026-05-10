import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    IconButton,
    Tooltip,
    InputAdornment
} from "@mui/material";

import {
    Check,
    Close,
    Search,
    Flag
} from "@mui/icons-material";

import { AttendanceContext } from "../context/AttendanceContext";
import { EventAttendanceDTO } from "../client/apiClient";
import { useNotification } from '../components/Notification';
import { SURFACE } from '../theme'
import { ReportUserModal } from "./ReportUserModal";

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

    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [selectedReportedUser, setSelectedReportedUser] = useState<any>(null);

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
                    (data || []).filter(
                        p => p.attendanceStatusId !== STATUS.CANCELLED
                    )
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

        return (
            fullname.includes(search) ||
            username.includes(search)
        );
    });

    const canMarkAttendance = (() => {
        if (!eventDateTime) return false;

        const now = new Date();
        const event = new Date(eventDateTime);

        const diffMs = event.getTime() - now.getTime();

        return diffMs <= 2 * 60 * 60 * 1000;
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
    }, [eventId, markNoShow]);

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

    const getStatusData = useCallback((statusId?: number) => {
        switch (statusId) {
            case STATUS.ATTENDED:
                return {
                    label: "Присутствовал",
                    color: "#5fa777",
                    background: SURFACE.softSuccess,
                };

            case STATUS.NO_SHOW:
                return {
                    label: "Неявка",
                    color: "#d96b7d",
                    background: SURFACE.softError,
                };

            default:
                return {
                    label: "Ожидается",
                    color: "#d6a63f",
                    background: SURFACE.softWarning,
                };
        }
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 3,
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    mb: 2.5,
                    flexWrap: "wrap",
                }}
            >
                <Box>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        Участники
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Зарегистрировано: {filteredParticipants.length}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        flexWrap: "wrap",
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Поиск"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            width: 240,
                            backgroundColor: "#fff",
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {canMarkAttendance && (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleOpenConfirmDialog}
                            disabled={
                                markingAllNoShow ||
                                activeParticipants.every(
                                    p =>
                                        p.attendanceStatusId === STATUS.ATTENDED ||
                                        p.attendanceStatusId === STATUS.NO_SHOW
                                )
                            }
                            startIcon={
                                markingAllNoShow
                                    ? <CircularProgress size={16} />
                                    : undefined
                            }
                            sx={{
                                whiteSpace: "nowrap",
                            }}
                        >
                            {markingAllNoShow
                                ? "Отметка..."
                                : "Отметить оставшихся"}
                        </Button>
                    )}
                </Box>
            </Box>

            {filteredParticipants.length === 0 && (
                <Typography
                    color="text.secondary"
                    sx={{
                        textAlign: "center",
                        py: 5,
                    }}
                >
                    Нет участников
                </Typography>
            )}

            <List
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    p: 0,
                }}
            >
                {filteredParticipants.map(p => {
                    const user = p.user;

                    const isFinal =
                        p.attendanceStatusId === STATUS.ATTENDED ||
                        p.attendanceStatusId === STATUS.NO_SHOW;

                    const status = getStatusData(
                        p.attendanceStatusId
                    );

                    return (
                        <ListItem
                            key={p.id}
                            sx={{
                                border: `1px solid ${SURFACE.borderLight}`,
                                borderRadius: 3,
                                px: 4,
                                py: 1.5,
                                backgroundColor: "#fff",
                                transition: "background-color 0.18s ease",

                                "&:hover": {
                                    backgroundColor: SURFACE.softPrimary,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                {/* LEFT */}
                                <Box
                                    sx={{
                                        minWidth: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0.3,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            flexWrap: "wrap",
                                            minWidth: 0,
                                        }}
                                    >
                                        <Typography
                                            fontWeight={600}
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {
                                                user?.fullname ||
                                                user?.userName ||
                                                `Пользователь ID: ${user?.id}` ||
                                                "Без имени"
                                            }
                                        </Typography>   
                                        <IconButton
    size="small"
    color="error"
    onClick={(e) => {
        e.stopPropagation();

        setSelectedReportedUser(user);
        setReportModalOpen(true);
    }}
    sx={{
        flexShrink: 0,
        p: 0.4,

        "&:hover": {
            bgcolor: "rgba(211, 47, 47, 0.04)",
        },
    }}
>
    <Flag sx={{ fontSize: 17 }} />
</IconButton>
                                    </Box>

                                    {user?.userName && (
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            @{user.userName}
                                        </Typography>
                                    )}
                                </Box>

                                {/* RIGHT */}
                                {!isFinal && canMarkAttendance && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Tooltip title="Отметить неявку">
                                            <IconButton
                                                onClick={() => handleMarkNoShowSingle(p)}
                                                size="small"
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    backgroundColor: SURFACE.softError,
                                                    color: "#d96b7d",

                                                    "&:hover": {
                                                        backgroundColor: "#ffe4e8",
                                                    },
                                                }}
                                            >
                                                <Close fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Отметить присутствие">
                                            <IconButton
                                                onClick={() => handleMarkAttendance(p)}
                                                size="small"
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    backgroundColor: SURFACE.softSuccess,
                                                    color: "#5fa777",

                                                    "&:hover": {
                                                        backgroundColor: "#dff0e5",
                                                    },
                                                }}
                                            >
                                                <Check fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                                {isFinal && (
                                <Box
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 0.7,
                                    px: 0.9,
                                    py: 0.2,
                                    height: 22,
                                    borderRadius: 999,
                                    backgroundColor: status.background,
                                    flexShrink: 0,
                                }}
                                >
                                    <Box
                                        sx={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            backgroundColor: status.color,
                                            flexShrink: 0,
                                        }}
                                    />

                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: status.color,
                                            fontWeight: 600,
                                            lineHeight: 1,
                                            fontSize: 11,
                                        }}
                                    >
                                        {status.label}
                                    </Typography>
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
                <DialogTitle>
                    Отметка всех участников
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        Вы уверены, что хотите отметить всех
                        неотмеченных участников как неявившихся?
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setConfirmDialogOpen(false)}
                    >
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
            <ReportUserModal
                open={reportModalOpen}
                onClose={() => {
                    setReportModalOpen(false);
                    setSelectedReportedUser(null);
                }}
                reportedUserId={selectedReportedUser?.id || ""}
                reportedUserName={
                    selectedReportedUser?.fullname ||
                    selectedReportedUser?.userName ||
                    "Пользователь"
                }
                onReportSuccess={() => {
                    setReportModalOpen(false);
                    setSelectedReportedUser(null);

                    showNotification(
                        "Жалоба отправлена",
                        "success"
                    );
                }}
            />
        </Box>
    );
};