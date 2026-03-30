import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { VolunteerEventContext } from "../context/EventContext";
import { AttendanceContext } from "../context/AttendanceContext";
import { useNotification } from '../components/Notification';
import { useAuth } from "../context/AuthContext";
import { EventAttendanceDTO } from "../client/apiClient";
import { MapView } from "../components/MapView";

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams();
  const context = useContext(VolunteerEventContext);
  const attContext = useContext(AttendanceContext);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [participantsCount, setParticipantsCount] = useState<number>(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

//   if (!context || !attContext) {
//     return <Typography color="error">Ошибка контекста</Typography>;
//   }

    const { fetchEventById, updateEvent } = context!;
    const { createAttendance, getParticipantsCount } = attContext!;

    useEffect(() => {
        const load = async () => {
        if (!id) return;
        const data = await fetchEventById(Number(id));
        console.log('Event data:', data)
        setEvent(data);
        setLoading(false);
        if (data?.id) {
            const count = await getParticipantsCount(data.id);
            setParticipantsCount(count);
        }
        };
        load();
    }, [id]);

const handleRegister = async (eventId: number) => {
      if (!createAttendance || !user?.user?.id) {
          showNotification('Ошибка: пользователь не авторизован', 'error');
          return;
      }

      const attendanceData = {
          userId: user.user.id,
          eventId: eventId,
          attendanceStatusId: 1 //зарегистрирован
      };
      
      const existing = await attContext!.fetchAttendanceByUserAndEvent(
          user.user.id,
          eventId
      );
      
      let success = false;

      if (existing) {
          const updated = new EventAttendanceDTO({
              ...existing,
              attendanceStatusId: 1
          });

          success = await attContext!.updateAttendance(existing.id!, updated);
      } else {
          success = await createAttendance(attendanceData as any);
      }
      
      if (success) {
          showNotification('Вы успешно зарегистрированы на событие!', 'success');
          context?.fetchEventsForUser();
          setIsRegistered(true);
          // Обновляем количество участников для этого события
          const count = await getParticipantsCount(eventId);
          setParticipantsCount(count);
      } else {
          showNotification('Ошибка при регистрации на событие', 'error');
      }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!event) return <Alert severity="error">Событие не найдено</Alert>;

  return (
    <Container sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h4">{event.name}</Typography>
          {event.imagePath && (
            <Box
              component="img"
              src={event.imagePath}
              alt={event.name}
              sx={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'cover',
                borderRadius: 2,
                mt: 2,
                mb: 2,
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}

          <Typography sx={{ mt: 2 }}>{event.description}</Typography>

          <Box sx={{ mt: 2 }}>
            <Typography>📍 {event.address}</Typography>
            <Typography>
              📅 {new Date(event.eventDateTime).toLocaleString()}
            </Typography>
            <Typography>🏙 {event.city?.name}</Typography>
            <Typography>⭐ {event.eventPoints}</Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                  👥 Участники: {participantsCount} / {event.participantsLimit || '∞'}
              </Typography>
              {event.participantsLimit && (
                <Box sx={{ 
                  width: '100%', 
                  bgcolor: 'rgba(148,156,255,0.2)', 
                  borderRadius: 1, 
                  mt: 0.5,
                  height: 6 
                }}>
                  <Box sx={{ 
                    width: `${(participantsCount / event.participantsLimit) * 100}%`, 
                    bgcolor: '#949cff', 
                    borderRadius: 1, 
                    height: '100%' 
                  }} />
              </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Chip label={event.eventCategory?.name} />
            <Chip label={event.eventStatus?.name} />
          </Box>

          {/* КАРТА */}
          <Box
            sx={{
              mt: 3,
              height: 300,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {event.lat && event.lng ? (
              <MapView lat={event.lat} lng={event.lng} />
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(148,156,255,0.1)",
                }}
              >
                Нет координат
              </Box>
            )}
          </Box>

          {/* ВОЛОНТЕР */}
          {user?.role === "volunteer" && !isRegistered && (
            <Button sx={{ mt: 3 }} onClick={() => setConfirmOpen(true)}>
              Зарегистрироваться
            </Button>
          )}

          {/* МОДЕРАТОР */}
          {user?.role === "moderator" && event.eventStatusId === 1 && (
            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                onClick={() =>
                  updateEvent(event.id, {
                    ...event,
                    eventStatusId: 2,
                  })
                }
              >
                Одобрить
              </Button>
              <Button
                onClick={() =>
                  updateEvent(event.id, {
                    ...event,
                    eventStatusId: 3,
                  })
                }
              >
                Отклонить
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* CONFIRM */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Подтверждение</DialogTitle>
        <DialogContent>
          Записаться на "{event.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Нет</Button>
          <Button
            onClick={async () => {
              await handleRegister(event.id);
              setConfirmOpen(false);
            }}
          >
            Да
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};