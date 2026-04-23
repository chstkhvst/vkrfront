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
  GridLegacy,
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
} from '@mui/icons-material';
import { AttendanceContext } from '../context/AttendanceContext';
import { VolunteerEventContext } from '../context/EventContext';
import { NotificationForUserContext } from '../context/NotificationForUserContext';
import { useAuth } from '../context/AuthContext';
import { ParticipantsList } from "../components/ParticipantsList";
import { CreateNotificationDTO, EventAttendanceDTO, VolunteerEventDTO } from '../client/apiClient';
import { useNotification } from '../components/Notification';

export const MyEventPage: React.FC = () => {
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

    useEffect(() => {
    const userId = user?.user?.id;
    if (!userId) return;
    const load = async () => {
      const attendances = await fetchAttendancesByUserId(userId);
      setData(attendances);

      await fetchAttendanceStatuses();

      if (eventContext) {
          const events = await eventContext.getEventsByUserId(userId);
          setMyEvents(events);
      }
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

  const getEventStatusIcon = (statusId: number | undefined) => {
  switch (statusId) {
    case EVENT_STATUS.ON_MODERATION:
      return <PendingIcon fontSize="small" />;
    case EVENT_STATUS.APPROVED:
      return <ApprovedIcon fontSize="small" />;
    case EVENT_STATUS.DECLINED:
      return <DeclinedIcon fontSize="small" />;
    case EVENT_STATUS.CANCELLED:
      return <CancelledIcon fontSize="small" />;
    case EVENT_STATUS.ENDED:
      return <EndedIcon fontSize="small" />;
    default:
      return undefined;
  }
};
const getEventStatusSx = (statusId: number | undefined) => {
  switch (statusId) {
    case EVENT_STATUS.ON_MODERATION:
      return { borderColor: '#ff9800', color: '#ff9800' };
    case EVENT_STATUS.APPROVED:
      return { borderColor: '#4caf50', color: '#4caf50' };
    case EVENT_STATUS.DECLINED:
      return { borderColor: '#f44336', color: '#f44336' };
    case EVENT_STATUS.CANCELLED:
      return { borderColor: '#5f6388', color: '#5f6388' };
    case EVENT_STATUS.ENDED:
      return { borderColor: '#5f6388', color: '#5f6388' };
    default:
      return { borderColor: '#949cff', color: '#949cff' };
  }
};
  const upcomingEvents = myEvents.filter(e => {
    if (!e.eventDateTime) return false;
    if (e.eventStatus?.id === EVENT_STATUS.CANCELLED) return false;

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

  const canCancelEvent = (eventDateTime: Date | undefined): boolean => {
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
      // Обновляем статус 
      const updatedEvent = new VolunteerEventDTO({
        ...eventToCancel,
        eventStatusId: 4, 
      });
      
      const updateSuccess = await eventContext.updateEvent(eventToCancel.id, updatedEvent);
      
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


  if (isLoading) {
    return (
      <Container sx={{ mt: 4 }}>
        <CircularProgress />
      </Container>
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
        sx={{ mb: 3 }}
      >
        <Tab label="Предстоящие" />
        <Tab label="История" />
      </Tabs>

      {error && <Alert severity="error">{error}</Alert>}

      {currentList.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          У вас пока нет созданных мероприятий
        </Typography>
      )}

      <Grid container spacing={3}>
        {currentList.map((event: VolunteerEventDTO) => (
          <GridLegacy item xs={12} key={event.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
                  <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                    {event.name || 'Без названия'}
                  </Typography>
                  <Chip
                    icon={getEventStatusIcon(event.eventStatus?.id)}
                    label={" " + event.eventStatus?.name || 'Статус неизвестен'}
                    variant="outlined"
                    sx={{
                      ...getEventStatusSx(event.eventStatus?.id),
                      flexShrink: 0,
                      '& .MuiChip-icon': {
                        fontSize: '1rem',
                      },
                    }}
                  />
                </Box>
                <Typography color="text.secondary">
                  📅 {event.eventDateTime
                    ? new Date(event.eventDateTime).toLocaleString()
                    : 'Нет даты'}
                </Typography>
                <Typography color="text.secondary">
                  📍 {event.address || 'Без адреса'}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                {(event.eventStatus?.id === EVENT_STATUS.APPROVED || event.eventStatus?.id === EVENT_STATUS.ON_MODERATION) && tab === 0 &&
                  canCancelEvent(event.eventDateTime) && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setEventToCancel(event);
                        setCancelDialogOpen(true);
                      }}
                    >
                      Отменить мероприятие
                    </Button>
                  )}
                {isOrganizer && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {/*АПДЕЙТ? */}}
                    >
                      Редактировать
                    </Button>
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
          </GridLegacy>
        ))}
      </Grid>
      <Dialog
          open={participantsOpen}
          onClose={() => setParticipantsOpen(false)}
          maxWidth="md"
          fullWidth
      >
          <DialogTitle>Участники события</DialogTitle>

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
        <DialogTitle sx={{ color: '#f44336' }}>
          Отмена мероприятия
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите отменить мероприятие?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: '0.875rem' }}>
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