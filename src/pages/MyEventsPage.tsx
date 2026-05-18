import React, { useEffect, useState, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  PendingOutlined as PendingIcon,
  CheckCircleOutline as ApprovedIcon,
  CancelOutlined as DeclinedIcon,
  EventBusy as CancelledIcon,
  EventAvailable as EndedIcon,
  CalendarMonthOutlined as CalendarIcon,
  LocationOnOutlined as LocationIcon,
} from '@mui/icons-material';

import { AttendanceContext } from '../context/AttendanceContext';
import { VolunteerEventContext } from '../context/EventContext';
import { NotificationForUserContext } from '../context/NotificationForUserContext';
import { useAuth } from '../context/AuthContext';
import { ParticipantsList } from "../components/ParticipantsList";
import { CreateNotificationDTO, EventAttendanceDTO, VolunteerEventDTO, UpdateEventDTO } from '../client/apiClient';
import { useNotification } from '../components/Notification';
import { useNavigate, } from "react-router-dom";
import { SURFACE } from '../theme';

export const MyEventPage: React.FC = () => {
  const navigate = useNavigate();

  const context = useContext(AttendanceContext);
  const eventContext = useContext(VolunteerEventContext);
  const notificationContext = useContext(NotificationForUserContext);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [tab, setTab] = useState(0);
  const [data, setData] = useState<EventAttendanceDTO[]>([]);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEventDTO | null>(null);
  const [myEvents, setMyEvents] = useState<VolunteerEventDTO[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<VolunteerEventDTO | null>(null);

  const {
    fetchAttendancesByUserId,
    fetchAttendanceStatuses,
    isLoading,
    error,
  } = context!;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.user?.id;
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      const attendances = await fetchAttendancesByUserId(userId);
      setData(attendances);

      await fetchAttendanceStatuses();

      if (eventContext) {
        const events = await eventContext.getEventsByUserId(userId);
        setMyEvents(events);
      }
      setLoading(false);
    };

    load();
  }, []);

  if (!context || !eventContext || !notificationContext) {
    console.log(context);
    console.log(eventContext);

    return (
      <Container>
        <Typography color="error">Ошибка контекста</Typography>
      </Container>
    );
  }

  const isOrganizer = user?.role === 'organizer';

  const EVENT_STATUS = {
    ON_MODERATION: 1,
    APPROVED: 2,
    DECLINED: 3,
    CANCELLED: 4,
    ENDED: 5,
  };

  const getEventStatusIcon = (statusId: number | undefined, color: string) => {
  switch (statusId) {
    case EVENT_STATUS.ON_MODERATION:
      return <PendingIcon fontSize="small" sx={{ color }} />;
    case EVENT_STATUS.APPROVED:
      return <ApprovedIcon fontSize="small" sx={{ color }} />;
    case EVENT_STATUS.DECLINED:
      return <DeclinedIcon fontSize="small" sx={{ color }} />;
    case EVENT_STATUS.CANCELLED:
      return <CancelledIcon fontSize="small" sx={{ color }} />;
    case EVENT_STATUS.ENDED:
      return <EndedIcon fontSize="small" sx={{ color }} />;
    default:
      return undefined;
  }
};

const getEventStatusSx = (statusId: number | undefined) => {
  switch (statusId) {
    case EVENT_STATUS.ON_MODERATION:
      return {
        bgcolor: SURFACE.softWarning,
        color: 'warning.main',
        border: 'none',
        '& .MuiChip-icon': {
          color: 'warning.main',
        },
      };
    case EVENT_STATUS.APPROVED:
      return {
        bgcolor: SURFACE.softSuccess,
        color: 'success.main',
        border: 'none',
        '& .MuiChip-icon': {
          color: 'success.main',
        },
      };
    case EVENT_STATUS.DECLINED:
      return {
        bgcolor: SURFACE.softError,
        color: 'error.main',
        border: 'none',
        '& .MuiChip-icon': {
          color: 'error.main',
        },
      };
    case EVENT_STATUS.CANCELLED:
      return {
        bgcolor: SURFACE.borderLight,
        color: 'text.secondary',
        border: 'none',
        '& .MuiChip-icon': {
          color: 'text.secondary',
        },
      };
    case EVENT_STATUS.ENDED:
      return {
        bgcolor: SURFACE.softSuccess,
        color: 'success.main',
        border: 'none',
        '& .MuiChip-icon': {
          color: 'success.main',
        },
      };
    default:
      return {
        bgcolor: SURFACE.softPrimary,
        color: 'primary.main',
        border: 'none',
        '& .MuiChip-icon': {
          color: 'primary.main',
        },
      };
  }
};

  const upcomingEvents = myEvents.filter(e => {
    if (!e.eventDateTime) return false;
    if (e.eventStatus?.id === EVENT_STATUS.CANCELLED) return false;
    if (e.eventStatus?.id === EVENT_STATUS.DECLINED) return false;

    const now = new Date();
    const event = new Date(e.eventDateTime);

    const todayLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const eventLocal = new Date(
      event.getFullYear(),
      event.getMonth(),
      event.getDate()
    );

    return eventLocal >= todayLocal;
  });

  const historyEvents = myEvents.filter(e => {
    if (!e.eventDateTime) return false;
    if (e.eventStatus?.id === EVENT_STATUS.CANCELLED) return true;
    if (e.eventStatus?.id === EVENT_STATUS.DECLINED) return true;

    const now = new Date();
    const event = new Date(e.eventDateTime);

    const todayLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const eventLocal = new Date(
      event.getFullYear(),
      event.getMonth(),
      event.getDate()
    );

    return eventLocal < todayLocal;
  });

  const canEditEvent = (eventDateTime: Date | undefined): boolean => {
    if (!eventDateTime) return false;

    const now = new Date();
    const event = new Date(eventDateTime);
    const diffMs = event.getTime() - now.getTime();

    return diffMs >= 24 * 60 * 60 * 1000;
  };

  const handleCancelEvent = async () => {
    if (!eventToCancel?.id) return;

    setCancelDialogOpen(false);

    // Отменяем все заявки
    if (isOrganizer) {
      const success = await context.markCancelled(eventToCancel.id);

      if (!success) {
        showNotification('Ошибка при отмене заявок участников', 'error');
        setEventToCancel(null);
        return;
      }
    }

    const dto = new UpdateEventDTO({
      id: eventToCancel.id,
      eventStatusId: 4,
    });

    const updateSuccess = await eventContext.updateEventByOrganizer(eventToCancel.id, dto);

    if (updateSuccess) {
      showNotification('Мероприятие успешно отменено', 'success');

      // рассылка уведов
      await notificationContext.createForEvent(
        new CreateNotificationDTO({
          recipientId: undefined,
          eventId: eventToCancel.id,
          message: `Мероприятие "${eventToCancel.name}" было отменено`,
          typeId: 1,
        })
      );

      // Обновляем список мероприятий
      if (user?.user?.id) {
        const events = await eventContext.getEventsByUserId(user.user.id);
        setMyEvents(events);
      }
    } else {
      showNotification('Ошибка при обновлении статуса мероприятия', 'error');
    }

    setCancelDialogOpen(false);
    setEventToCancel(null);
  };

  if (loading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const getCurrentList = () => {
    if (tab === 0) return upcomingEvents;
    return [...historyEvents].reverse();
  };

  const currentList = getCurrentList();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Мои мероприятия
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main',
            height: 3,
            borderRadius: 2,
          },
        }}
      >
        <Tab
          label="Активные"
          sx={{
            color: 'default',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          }}
        />

        <Tab
          label="История"
          sx={{
            color: 'default',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          }}
        />
      </Tabs>

      {error && <Alert severity="error">{error}</Alert>}

      {currentList.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          На данный момент мероприятий нет
        </Typography>
      )}

      <Grid container spacing={3}>
        {currentList.map((event: VolunteerEventDTO) => (
          <Grid size={12} key={event.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor:
               'rgba(255,255,255,0.78)',
              }}
            >
              <CardContent sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      wordBreak: 'break-word',
                      flex: 1,
                      minWidth: 0,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {event.name || 'Без названия'}
                  </Typography>

                  <Chip
                    icon={getEventStatusIcon(event.eventStatus?.id, getEventStatusSx(event.eventStatus?.id).color)}
                    label={" " + event.eventStatus?.name || 'Статус неизвестен'}
                    sx={{
                      ...getEventStatusSx(event.eventStatus?.id),
                      flexShrink: 0,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'text.secondary',
                    mb: 0.5,
                    minWidth: 0,
                  }}
                >
                  <CalendarIcon
                    sx={{
                      fontSize: 20,
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  />

                  <Typography color="inherit" noWrap>
                    {event.eventDateTime
                      ? new Date(event.eventDateTime).toLocaleString()
                      : 'Нет даты'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color: 'text.secondary',
                    minWidth: 0,
                  }}
                >
                  <LocationIcon
                    sx={{
                      fontSize: 20,
                      color: 'secondary.dark',
                      flexShrink: 0,
                    }}
                  />

                  <Typography 
                    color="inherit" 
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {event.address || 'Без адреса'}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', pt: 0, flexWrap: 'wrap', gap: 1 }}>
                {(event.eventStatus?.id === EVENT_STATUS.APPROVED ||
                  event.eventStatus?.id === EVENT_STATUS.ON_MODERATION) &&
                  tab === 0 &&
                  canEditEvent(event.eventDateTime) && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setEventToCancel(event);
                        setCancelDialogOpen(true);
                      }}
                    >
                      Отменить
                    </Button>
                  )}

                {isOrganizer && (
                  <>
                  {tab === 0 && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate(`/edit-event/${event.id}`)}
                      disabled={!canEditEvent(event.eventDateTime)}
                    >
                      Редактировать
                    </Button>
                  )}
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        setSelectedEvent(event);
                        setParticipantsOpen(true);
                      }}
                    >
                      Участники
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedEvent && participantsOpen && (
            <ParticipantsList
              eventId={selectedEvent.id!}
              eventDateTime={selectedEvent.eventDateTime!}
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setParticipantsOpen(false)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения отмены мероприятия */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle sx={{ color: 'error.main' }}>
          Отмена мероприятия
        </DialogTitle>

        <DialogContent>
          <Typography>
            Вы уверены, что хотите отменить мероприятие?
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 1, fontSize: '0.875rem' }}
          >
            Это действие нельзя отменить. Если на мероприятие есть зарегистрированные участники, их заявки будут отменены.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Нет, оставить
          </Button>

          <Button
            onClick={handleCancelEvent}
            variant="contained"
            color="error"
            autoFocus
          >
            Да, отменить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};