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
  GridLegacy
} from '@mui/material';
import { AttendanceContext } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { EventAttendanceDTO } from '../client/apiClient';

export const MyEventPage: React.FC = () => {
  const context = useContext(AttendanceContext);
  const { user } = useAuth();

  const [tab, setTab] = useState(0);
  const [data, setData] = useState<EventAttendanceDTO[]>([]);
    useEffect(() => {
    const userId = user?.user?.id;
    if (!userId) return;

    const load = async () => {
        const attendances = await fetchAttendancesByUserId(userId);
        setData(attendances);
        await fetchAttendanceStatuses();
    };

    load();
    }, [user?.user?.id]);


  if (!context) {
    return (
      <Container>
        <Typography color="error">Ошибка контекста</Typography>
      </Container>
    );
  }

  const {
    fetchAttendancesByUserId,
    fetchAttendanceStatuses,
    attendanceStatuses,
    updateAttendance,
    isLoading,
    error,
  } = context;

  const STATUS = {
    UPCOMING: 1,
    CANCELLED: 2,
    ATTENDED: 3,
    NO_SHOW: 4,
  };

  const getStatusName = (id?: number) => {
    return (
      attendanceStatuses.find(s => s.id === id)?.attendanceStatusName ||
      'Неизвестно'
    );
  };

  const upcoming = data.filter(
    a => a.attendanceStatusId === STATUS.UPCOMING
  );

  const history = data.filter(
    a => a.attendanceStatusId !== STATUS.UPCOMING
  );

  const handleCancel = async (attendance: EventAttendanceDTO) => {
    if (!attendance.id) return;

    const updated = new EventAttendanceDTO({
    ...attendance,
    attendanceStatusId: STATUS.CANCELLED,
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

  const list = tab === 0 ? upcoming : history;

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

      {list.length === 0 && (
        <Typography color="text.secondary">
          Ничего не найдено
        </Typography>
      )}

      <Grid container spacing={3}>
        {list.map(a => {
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
                      label={getStatusName(a.attendanceStatusId)}
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
      </Grid>
    </Container>
  );
};