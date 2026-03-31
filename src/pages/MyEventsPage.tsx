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

export const MyEventPage: React.FC = () => {
  const context = useContext(AttendanceContext);
  const eventContext = useContext(VolunteerEventContext);
  const { user } = useAuth();

  const [tab, setTab] = useState(0);
  const [data, setData] = useState<EventAttendanceDTO[]>([]);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [organizedEvents, setOrganizedEvents] = useState<VolunteerEventDTO[]>([]);
  const {
  fetchAttendancesByUserId,
  fetchAttendanceStatuses,
  attendanceStatuses,
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
  const now = new Date();

  const organizerUpcoming = organizedEvents.filter(
    e => e.eventDateTime && new Date(e.eventDateTime) > now
  );

  const organizerHistory = organizedEvents.filter(
    e => e.eventDateTime && new Date(e.eventDateTime) <= now
  );

  const volunteerUpcoming = data.filter(
    a => a.attendanceStatusId === ATTENDANCE_STATUS.UPCOMING
  );

  const volunteerHistory = data.filter(
    a => a.attendanceStatusId !== ATTENDANCE_STATUS.UPCOMING
  );

  const handleCancel = async (attendance: EventAttendanceDTO) => {
    if (!attendance.id) return;

    const updated = new EventAttendanceDTO({
    ...attendance,
    attendanceStatusId: ATTENDANCE_STATUS.CANCELLED,
    });

    const success = await updateAttendance(attendance.id, updated);

    if (success) {
      setData(prev =>
        prev.map(a => (a.id === attendance.id ? updated : a))
      );
    }
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
        return tab === 0 ? volunteerUpcoming : volunteerHistory;
      } else if (isOrganizer) {
        return tab === 0 ? organizerUpcoming : organizerHistory;
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
                      onClick={() => handleCancel(a)}
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
                      setSelectedEventId(orgEvent.id!);
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
              {selectedEventId && participantsOpen && (
                  <ParticipantsList eventId={selectedEventId} />
              )}
          </DialogContent>

          <DialogActions>
              <Button onClick={() => setParticipantsOpen(false)}>
                  Закрыть
              </Button>
          </DialogActions>
      </Dialog>
    </Container>
  );
};