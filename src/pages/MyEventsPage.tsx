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
  EventAvailable as UpcomingIcon,
  Cancel as CancelledAttendanceIcon,
  CheckCircle as AttendedIcon,
  DoNotDisturb as NoShowIcon,
} from '@mui/icons-material';
import { AttendanceContext } from '../context/AttendanceContext';
import { VolunteerEventContext } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { ParticipantsList } from "../components/ParticipantsList";
import { EventAttendanceDTO, VolunteerEventDTO } from '../client/apiClient';
import { useNotification } from '../components/Notification';

export const MyEventPage: React.FC = () => {
  const context = useContext(AttendanceContext);
  const eventContext = useContext(VolunteerEventContext);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [tab, setTab] = useState(0);
  const [data, setData] = useState<EventAttendanceDTO[]>([]);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEventDTO | null>(null);
  const [organizedEvents, setOrganizedEvents] = useState<VolunteerEventDTO[]>([]);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<VolunteerEventDTO | null>(null);
  const [cancelAttendanceDialogOpen, setCancelAttendanceDialogOpen] = useState(false);
  const [attendanceToCancel, setAttendanceToCancel] = useState<EventAttendanceDTO | null>(null);
  const {
    fetchAttendancesByUserId,
    fetchAttendanceStatuses,
    updateAttendance,
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

      if (user?.role === 'organizer' && eventContext) {
          const events = await eventContext.getEventsByUserId(userId);
          setOrganizedEvents(events);
      }
   };

    load();
    }, []);
    
  if (!context || !eventContext) {
    console.log(context);
    console.log(eventContext);
    return (
      <Container>
        <Typography color="error">Ошибка контекста</Typography>
      </Container>
    );
  }
  
  const isVolunteer = user?.role === 'volunteer';
  const isOrganizer = user?.role === 'organizer';

  const ATTENDANCE_STATUS = {
    UPCOMING: 1,
    CANCELLED: 2,
    ATTENDED: 3,
    NO_SHOW: 4,
  };

  const getAttendanceStatusIcon = (statusId: number | undefined) => {
    switch (statusId) {
      case ATTENDANCE_STATUS.UPCOMING:
        return <UpcomingIcon fontSize="small" />;
      case ATTENDANCE_STATUS.CANCELLED:
        return <CancelledAttendanceIcon fontSize="small" />;
      case ATTENDANCE_STATUS.ATTENDED:
        return <AttendedIcon fontSize="small" />;
      case ATTENDANCE_STATUS.NO_SHOW:
        return <NoShowIcon fontSize="small" />;
      default:
        return undefined;
    }
  };
  const getAttendanceStatusSx = (statusId: number | undefined) => {
  switch (statusId) {
    case ATTENDANCE_STATUS.UPCOMING:
      return { borderColor: '#949cff', color: '#949cff' };
    case ATTENDANCE_STATUS.CANCELLED:
      return { borderColor: '#f44336', color: '#f44336' };
    case ATTENDANCE_STATUS.ATTENDED:
      return { borderColor: '#4caf50', color: '#4caf50' };
    case ATTENDANCE_STATUS.NO_SHOW:
      return { borderColor: '#5f6388', color: '#5f6388' };
    default:
      return { borderColor: '#5f6388', color: '#5f6388' };
  }
};

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
  const organizerUpcoming = organizedEvents.filter(e => {
    if (!e.eventDateTime) return false;

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

  const organizerHistory = organizedEvents.filter(e => {
    if (!e.eventDateTime) return false;

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
  const volunteerUpcoming = data.filter(
    a => a.attendanceStatusId === ATTENDANCE_STATUS.UPCOMING
  );

  const volunteerHistory = data.filter(
    a => a.attendanceStatusId !== ATTENDANCE_STATUS.UPCOMING
  );

  const canCancelEvent = (eventDateTime: Date | undefined): boolean => {
    if (!eventDateTime) return false;
    
    const now = new Date();
    const event = new Date(eventDateTime);
    const diffMs = event.getTime() - now.getTime();
    
    return diffMs >= 24 * 60 * 60 * 1000; 
  };

  const handleConfirmCancelAttendance = async () => {
    if (!attendanceToCancel?.id) return;
    
    const updated = new EventAttendanceDTO({
      ...attendanceToCancel,
      attendanceStatusId: ATTENDANCE_STATUS.CANCELLED,
    });

    const success = await updateAttendance(attendanceToCancel.id, updated);

    if (success) {
      setData(prev =>
        prev.map(a => (a.id === attendanceToCancel.id ? updated : a))
      );
      showNotification('Участие отменено', 'success');
    } else {
      showNotification('Ошибка при отмене участия', 'error');
    }
    
    setCancelAttendanceDialogOpen(false);
    setAttendanceToCancel(null);
  };

    const handleCancelEvent = async () => {
    if (!eventToCancel?.id) return;
    
    //Отменяем все заявки участников
    const success = await context.markCancelled(eventToCancel.id);
    
    if (success) {
      const updatedEvent = new VolunteerEventDTO({
        ...eventToCancel,
        eventStatusId: 4, 
      });
      
      // статус мероприятия
      const updateSuccess = await eventContext.updateEvent(eventToCancel.id, updatedEvent);
      
      if (updateSuccess) {
        showNotification('Мероприятие успешно отменено', 'success');
        // Обновляем список мероприятий
        if (user?.user?.id) {
          const events = await eventContext.getEventsByUserId(user.user.id);
          setOrganizedEvents(events);
        }
      } else {
        showNotification('Ошибка при обновлении статуса мероприятия', 'error');
      }
    } else {
      showNotification('Ошибка при отмене заявок участников', 'error');
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
      if (isVolunteer) {
          if (tab === 0) return volunteerUpcoming;
          // Реверс для истории волонтера
          return [...volunteerHistory].reverse();
      } 
      
      if (isOrganizer) {
          if (tab === 0) return organizerUpcoming;
          // Реверс для истории организатора
          return [...organizerHistory].reverse();
      }
      
      return [];
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
          {isVolunteer && 'Вы еще не зарегистрированы ни на одно мероприятие'}
          {isOrganizer && 'У вас пока нет созданных мероприятий'}
        </Typography>
      )}

      <Grid container spacing={3}>
        {isVolunteer && currentList.map((a: EventAttendanceDTO) => {
        const event = a.volunteerEvent;
          return (
            <GridLegacy item xs={12} key={a.id}>
              <Card>
                <CardContent
                sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
            }}>
                  <Typography variant="h6">
                    {event?.name || 'Без названия'}
                  </Typography>

                  <Typography color="text.secondary">
                    📅{' '}
                    {event?.eventDateTime
                      ? new Date(event.eventDateTime).toLocaleString()
                      : 'Нет даты'}
                  </Typography>

                  <Typography color="text.secondary">
                     {event?.address || 'Без адреса'}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Chip
                      icon={getAttendanceStatusIcon(a.attendanceStatusId)}
                      label={a.attendanceStatus?.name}
                      variant="outlined"
                      sx={{
                        ...getAttendanceStatusSx(a.attendanceStatusId),
                        '& .MuiChip-icon': {
                          fontSize: '1rem',
                        },
                      }}
                    />
                  </Box>
                </CardContent>

                <CardActions
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    pb: 2,
                }}
                >
                  {tab === 0 && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        setAttendanceToCancel(a);
                        setCancelAttendanceDialogOpen(true);
                      }}
                    >
                      Отменить участие
                    </Button>
                  )}
                </CardActions>
              </Card>
            </GridLegacy>
          );
        })}
        {isOrganizer && currentList.map((orgEvent: VolunteerEventDTO) => (
          <GridLegacy item xs={12} key={orgEvent.id}>
            <Card sx={{ 
              // bgcolor: 'rgba(148, 156, 255, 0.2)',
            }}>
              <CardContent >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
                <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
                  {orgEvent.name || 'Без названия'}
                </Typography>
                <Chip
                  icon={ getEventStatusIcon(orgEvent.eventStatus?.id)}
                  label={" " + orgEvent.eventStatus?.name || 'Статус неизвестен'}
                  variant="outlined"
                  sx={{
                    ...getEventStatusSx(orgEvent.eventStatus?.id),
                    flexShrink: 0,
                    '& .MuiChip-icon': {
                      fontSize: '1rem',
                    },
                  }}
                />
              </Box>
                <Typography color="text.secondary">
                  📅 {orgEvent.eventDateTime
                    ? new Date(orgEvent.eventDateTime).toLocaleString()
                    : 'Нет даты'}
                </Typography>
                <Typography color="text.secondary">
                   {orgEvent.address || 'Без адреса'}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  {(orgEvent.eventStatus?.id === EVENT_STATUS.APPROVED || orgEvent.eventStatus?.id === EVENT_STATUS.ON_MODERATION) && tab === 0 &&
                  canCancelEvent(orgEvent.eventDateTime) && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setEventToCancel(orgEvent);
                        setCancelDialogOpen(true);
                      }}
                    >
                      Отменить мероприятие
                    </Button>
                  )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {/* Переход на редактирование */}}
                >
                  Редактировать
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                      setSelectedEvent(orgEvent);
                      setParticipantsOpen(true);
                  }}
                >
                  Участники
                </Button>
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
            Это действие нельзя отменить. Все заявки участников будут отменены.
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
      <Dialog
        open={cancelAttendanceDialogOpen}
        onClose={() => setCancelAttendanceDialogOpen(false)}
      >
        <DialogTitle sx={{ color: '#f44336' }}>
          Отмена участия
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите отменить участие в мероприятии?
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: '0.875rem' }}>
            Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelAttendanceDialogOpen(false)}>
            Нет
          </Button>
          <Button 
            onClick={handleConfirmCancelAttendance} 
            variant="contained" 
            color="error"
            autoFocus
          >
            Да
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};