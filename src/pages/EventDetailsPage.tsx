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
  Divider,
  LinearProgress,
  Paper
} from "@mui/material";
import { 
  LocationOn, 
  CalendarToday, 
  LocationCity, 
  Star, 
  People,
  Category,
  CheckCircle,
  Cancel,
  HowToReg,
  Map
} from '@mui/icons-material';
import { useParams } from "react-router-dom";
import { VolunteerEventContext } from "../context/EventContext";
import { AttendanceContext } from "../context/AttendanceContext";
import { useNotification } from '../components/Notification';
import { useAuth } from "../context/AuthContext";
import { EventAttendanceDTO } from "../client/apiClient";
import { MapView } from "../components/MapView";
import { useLocation } from "react-router-dom";

export const EventDetailsPage: React.FC = () => {
  const location = useLocation();
  const isCommunity = location.state?.isCommunity ?? true;
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
  const [processingStatus, setProcessingStatus] = useState<number | null>(null);

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

  const handleModeration = async (statusId: number) => {
  setProcessingStatus(statusId);

  const status = context!.eventStatuses.find(s => s.id === statusId);
  const actionName = status?.eventStatusName?.toLowerCase() || 'изменено';
  
  try {
    const success = await updateEvent(event.id, {
      ...event,
      eventStatusId: statusId,
    });
    
    if (success) {
      showNotification(`Событие ${actionName}`, 'success');
      const updatedEvent = await fetchEventById(Number(id));
      setEvent(updatedEvent);
    } else {
      showNotification(`Ошибка при ${actionName} события`, 'error');
    }
  } catch (error) {
    showNotification(`Ошибка при ${actionName} события`, 'error');
  } finally {
    setProcessingStatus(null);
  }
};
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!event) return <Alert severity="error">Событие не найдено</Alert>;

  const participantsRatio = event.participantsLimit 
    ? (participantsCount / event.participantsLimit) * 100 
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card 
        elevation={0}
        sx={{ 
          borderRadius: 3,
          border: '1px solid rgba(148, 156, 255, 0.2)',
          overflow: 'hidden'
        }}
      >
        {event.imagePath && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 400,
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
              }
            }}
          >
            <Box
              component="img"
              src={event.imagePath}
              alt={event.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </Box>
        )}
        
        <CardContent sx={{ p: 4 }}>
          {/* Заголовок и категория */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3, gap: 2, flexWrap: 'wrap' }}>
            <Typography 
              variant="h3" 
              component="h1"
              sx={{ 
                fontWeight: 700,
                color: '#1c022c',
                flex: 1,
                minWidth: 0
              }}
            >
              {event.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {event.eventCategory?.name && (
                <Chip 
                  icon={<Category sx={{ fontSize: 18 }} />}
                  label={event.eventCategory.name} 
                  sx={{ 
                    bgcolor: 'rgba(148, 156, 255, 0.1)',
                    color: '#949cff',
                    fontWeight: 500,
                    border: '1px solid rgba(148, 156, 255, 0.3)',
                    px: 1
                  }}
                />
              )}
              {event.eventStatus?.name && (
                <Chip 
                  label={event.eventStatus.name}
                  sx={{ 
                    bgcolor: event.eventStatusId === 2 
                      ? 'rgba(76, 175, 80, 0.1)' 
                      : event.eventStatusId === 3 
                      ? 'rgba(244, 67, 54, 0.1)'
                      : 'rgba(255, 152, 0, 0.1)',
                    color: event.eventStatusId === 2 
                      ? '#4caf50' 
                      : event.eventStatusId === 3 
                      ? '#f44336'
                      : '#ff9800',
                    border: `1px solid ${event.eventStatusId === 2 
                      ? 'rgba(76, 175, 80, 0.3)' 
                      : event.eventStatusId === 3 
                      ? 'rgba(244, 67, 54, 0.3)'
                      : 'rgba(255, 152, 0, 0.3)'}`,
                    fontWeight: 500,
                    px: 1
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Описание */}
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.8, fontSize: '1.1rem' }}
          >
            {event.description}
          </Typography>

          <Divider sx={{ my: 3, borderColor: 'rgba(148, 156, 255, 0.1)' }} />

          {/* Основная информация */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                fontWeight: 600,
                color: '#1c022c'
              }}
            >
              Детали события
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOn sx={{ fontSize: 24, color: '#949cff' }} />
                <Typography variant="body1" color="text.secondary">
                  {event.address}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarToday sx={{ fontSize: 24, color: '#949cff' }} />
                <Typography variant="body1" color="text.secondary">
                  {new Date(event.eventDateTime).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationCity sx={{ fontSize: 24, color: '#949cff' }} />
                <Typography variant="body1" color="text.secondary">
                  {event.city?.name}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {!isCommunity && (
                <Paper 
                  elevation={0}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}
                >
                  <Star sx={{ fontSize: 24, color: '#FFD700' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1c022c' }}>
                    {event.eventPoints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    баллов
                  </Typography>
                </Paper>
                )}
              </Box>
            </Box>
          </Box>

          {/* Участники */}
          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5, 
              mb: 3,
              borderRadius: 2,
              bgcolor: 'rgba(148, 156, 255, 0.05)',
              border: '1px solid rgba(148, 156, 255, 0.2)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <People sx={{ fontSize: 24, color: '#949cff' }} />
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                 {isCommunity
                    ? `Рекомендуемое количество участников: ${event.participantsLimit || 'не указано'}`
                    : `Участники: ${participantsCount} / ${event.participantsLimit || '∞'}`
                  }
              </Typography>
            </Box>
            {event.participantsLimit && (
              <LinearProgress 
                variant="determinate" 
                value={Math.min(participantsRatio, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(148, 156, 255, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: participantsRatio >= 90 
                      ? '#ff6b6b' 
                      : participantsRatio >= 70 
                      ? '#ffd93d' 
                      : '#949cff'
                  }
                }}
              />
            )}
          </Paper>

          {/* КАРТА */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Map sx={{ fontSize: 24, color: '#949cff' }} />
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1c022c'
                }}
              >
                Местоположение
              </Typography>
            </Box>
            <Box
              sx={{
                height: 350,
                borderRadius: 2,
                overflow: "hidden",
                border: '1px solid rgba(148, 156, 255, 0.2)'
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
                    bgcolor: "rgba(148,156,255,0.05)",
                    color: 'text.secondary'
                  }}
                >
                  Координаты не указаны
                </Box>
              )}
            </Box>
          </Box>

          {/* ВОЛОНТЕР */}
          {user?.role === "volunteer" && !isRegistered && !isCommunity &&(
            <Button 
              variant="contained"
              size="large"
              fullWidth
              startIcon={<HowToReg />}
              onClick={() => setConfirmOpen(true)}
              sx={{
                mt: 2,
                py: 1.5,
                bgcolor: '#949cff',
                '&:hover': {
                  bgcolor: '#7c84f4',
                },
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Зарегистрироваться на событие
            </Button>
          )}

          {/* МОДЕРАТОР */}
          {user?.role === "moderator" && event.eventStatusId === 1 && (
          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              color="success"
              startIcon={processingStatus === 2 ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              fullWidth
              onClick={() => handleModeration(2)}
              disabled={!!processingStatus}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {processingStatus === 2 ? "Обработка..." : "Одобрить событие"}
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={processingStatus === 3 ? <CircularProgress size={20} /> : <Cancel />}
              fullWidth
              onClick={() => handleModeration(3)}
              disabled={!!processingStatus}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderWidth: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-2px)',
                  bgcolor: 'rgba(244, 67, 54, 0.04)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              {processingStatus === 3 ? "Обработка..." : "Отклонить событие"}
            </Button>
          </Box>
        )}
        </CardContent>
      </Card>

      {/* CONFIRM */}
      <Dialog 
        open={confirmOpen} 
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Подтверждение регистрации</DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите зарегистрироваться на событие <strong>"{event.name}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setConfirmOpen(false)}
            sx={{ textTransform: 'none' }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              await handleRegister(event.id);
              setConfirmOpen(false);
            }}
            sx={{
              bgcolor: '#949cff',
              '&:hover': {
                bgcolor: '#7c84f4',
              },
              textTransform: 'none'
            }}
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};