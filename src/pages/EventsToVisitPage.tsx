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
  EventAvailable as UpcomingIcon,
  Cancel as CancelledAttendanceIcon,
  CheckCircle as AttendedIcon,
  DoNotDisturb as NoShowIcon,
} from '@mui/icons-material';
import { AttendanceContext } from '../context/AttendanceContext';
import { VolunteerEventContext } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { EventAttendanceDTO } from '../client/apiClient';
import { useNotification } from '../components/Notification';

export const EventsToVisitPage: React.FC = () => {
  const context = useContext(AttendanceContext);
  const eventContext = useContext(VolunteerEventContext);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [tab, setTab] = useState(0);
  const [data, setData] = useState<EventAttendanceDTO[]>([]);
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
  const isEventInPast = (event: any) => {
    if (!event?.eventDateTime) return true;
    return new Date(event.eventDateTime) <= new Date();
  };
  const volunteerUpcoming = data
    .filter(a => 
      a.attendanceStatusId === ATTENDANCE_STATUS.UPCOMING && 
      !isEventInPast(a.volunteerEvent)
    )
    .sort((a, b) => 
      new Date(a.volunteerEvent?.eventDateTime || 0).getTime() - 
      new Date(b.volunteerEvent?.eventDateTime || 0).getTime()
    );
  const volunteerHistory = data
    .filter(a => 
      a.attendanceStatusId !== ATTENDANCE_STATUS.UPCOMING || 
      isEventInPast(a.volunteerEvent)
    )
    .sort((a, b) => 
      new Date(b.volunteerEvent?.eventDateTime || 0).getTime() - 
      new Date(a.volunteerEvent?.eventDateTime || 0).getTime()
    );
  const canCancelAttendance = (event: any) => {
    if (!event?.eventDateTime) return false;
    const eventDate = new Date(event.eventDateTime);
    const now = new Date();
    return eventDate > now;
  };
  const handleConfirmCancelAttendance = async () => {
      const userId = user?.user?.id;
      if (!attendanceToCancel?.id || !userId) return;

      const updated = new EventAttendanceDTO({
          ...attendanceToCancel,
          attendanceStatusId: 2,
      });

      const success = await updateAttendance(attendanceToCancel.id, updated);

      if (success) {
          const attendances = await fetchAttendancesByUserId(userId);
          setData(attendances);

          showNotification('Участие отменено', 'success');
      } else {
          showNotification('Ошибка при отмене участия', 'error');
      }

      setCancelAttendanceDialogOpen(false);
      setAttendanceToCancel(null);
  };

  const getCurrentList = () => {
    if (tab === 0) return volunteerUpcoming;
    return [...volunteerHistory].reverse();
  };

  const currentList = getCurrentList();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        События для посещения
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
          В настоящий момент Вы не зарегистрированы ни на одно мероприятие
        </Typography>
      )}

      <Grid container spacing={3}>
        {currentList.map((a: EventAttendanceDTO) => {
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
                  }}
                >
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
                    📍 {event?.address || 'Без адреса'}
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
                  {tab === 0 && canCancelAttendance(event) && (
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
                  {(tab === 0 && !canCancelAttendance(event))|| (tab === 1 && a.attendanceStatusId === ATTENDANCE_STATUS.UPCOMING)  && (
                    <Typography variant="caption" color="text.secondary">
                      Дождитесь обновления статуса от организатора
                    </Typography>
                  )}
                </CardActions>
              </Card>
            </GridLegacy>
          );
        })}
      </Grid>

      {/* Диалог подтверждения отмены участия */}
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