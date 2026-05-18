import React, { useContext, useEffect, useState } from "react";
import {
  Container,Typography,Box,CircularProgress,Alert,Card,CardContent,Chip,Button,Dialog,DialogTitle,DialogContent,DialogActions,
  Divider, LinearProgress, Paper,TextField
} from "@mui/material";
import { 
  LocationOn, CalendarToday, LocationCity, Star, People,Category,CheckCircle, Cancel, HowToReg, Map, Flag,
  PendingOutlined as PendingIcon, CheckCircleOutline as ApprovedIcon,CancelOutlined as DeclinedIcon,EventBusy as CancelledIcon,EventAvailable as EndedIcon,
} from '@mui/icons-material';
import { useParams } from "react-router-dom";
import { VolunteerEventContext } from "../context/EventContext";
import { AttendanceContext } from "../context/AttendanceContext";
import { NotificationForUserContext } from "../context/NotificationForUserContext";
import { useNotification } from '../components/Notification';
import { useAuth } from "../context/AuthContext";
import { CreateNotificationDTO, EventAttendanceDTO, VolunteerEventDTO } from "../client/apiClient";
import { MapView } from "../components/MapView";
import { ReportUserModal } from "../components/ReportUserModal";
import { useLocation } from "react-router-dom";
import { SURFACE } from '../theme';

export const EventDetailsPage: React.FC = () => {
  const location = useLocation();
  const isCommunity = location.state?.isCommunity ?? true;
  const { id } = useParams();
  const context = useContext(VolunteerEventContext);
  const attContext = useContext(AttendanceContext);
  const notificationContext = useContext(NotificationForUserContext);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [participantsCount, setParticipantsCount] = useState<number>(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<number | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editPointsMode, setEditPointsMode] = useState(false);
  const [points, setPoints] = useState<number>(10);

  const { fetchEventById, updateEventByModerator } = context!;
  const { createAttendance, getParticipantsCount } = attContext!;

  useEffect(() => {
      const load = async () => {
      if (!id) return;
      const data = await fetchEventById(Number(id));
      console.log('Event data:', data)
      
      setEvent(data);
      setPoints(data?.eventPoints ?? 10);
      setLoading(false);
      if (data?.id) {
          const count = await getParticipantsCount(data.id);
          setParticipantsCount(count);
      }
      };
      load();
  }, [id]);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!user?.user?.id || !event?.id) return;
      
      const existing = await attContext!.fetchAttendanceByUserAndEvent(
        user.user.id,
        event.id
      );
      setIsRegistered(!!existing && existing.attendanceStatusId === 1);
    };
    
    if (event) {
      checkRegistration();
    }
  }, [event, user?.user?.id]);

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
          bgcolor: SURFACE.borderLight,
          color: 'text.secondary',
          border: 'none',
          '& .MuiChip-icon': {
            color: 'text.secondary',
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
          showNotification('Вы успешно зарегистрированы на мероприятие!', 'success');
          context?.fetchEventsForUser();
          setIsRegistered(true);
          // Обновляем количество участников
          const count = await getParticipantsCount(eventId);
          setParticipantsCount(count);
      } else {
          showNotification('Ошибка при регистрации на мероприятие', 'error');
      }
  };

  const handleModeration = async (statusId: number) => {
    setProcessingStatus(statusId);

    const status = context!.eventStatuses.find(s => s.id === statusId);
    const actionName = status?.eventStatusName?.toLowerCase() || 'изменено';

    try {
      const updated = new VolunteerEventDTO({
        ...event,
        eventStatusId: statusId,
        eventPoints: editPointsMode ? points : event.eventPoints,
      });

      const success = await updateEventByModerator(event.id, updated);

      if (success) {
        showNotification(`Мероприятие ${actionName}`, 'success');

        // Отправка уведомления создателю 
        if (event.user?.id && notificationContext) {
          const notificationMessage = statusId === 2 
            ? `Ваше мероприятие "${event.name}" одобрено модератором`
            : statusId === 3 
            ? `Ваше мероприятие "${event.name}" отклонено модератором`
            : `Статус мероприятия "${event.name}" изменен на "${actionName}"`;

          const dto = new CreateNotificationDTO({
            recipientId: event.user.id,
            message: notificationMessage,
            eventId: event.id
          });
          
          if (statusId === 2) dto.typeId = 3;
          else if (statusId === 3) dto.typeId = 4;
          else dto.typeId = 1;

          try {
            await notificationContext.createNotification(dto);
          } catch (notifError) {
            console.error('Ошибка при отправке уведомления:', notifError);
          }
        }

        const updatedEvent = await fetchEventById(Number(id));
        setEvent(updatedEvent);
        setPoints(updatedEvent?.eventPoints ?? points);
        setEditPointsMode(false);
      } else {
        showNotification(`Ошибка при ${actionName} мероприятия`, 'error');
      }
    } catch (error) {
      showNotification(`Ошибка при ${actionName} мероприятия`, 'error');
    } finally {
      setProcessingStatus(null);
    }
  };
  
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!event) return <Alert severity="error">Мероприятие не найдено</Alert>;

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
                icon={<Category sx={{ fontSize: 18, color: 'primary.main' }} />}
                label={event.eventCategory.name} 
                sx={{ 
                  bgcolor: SURFACE.softPrimary,
                  color: 'primary.main',
                  fontWeight: 500,
                  border: 'none',
                  '& .MuiChip-icon': {
                    color: 'primary.main',
                  },
                }}
              />
            )}
            {event.eventStatus?.name && (
              <Chip 
                icon={getEventStatusIcon(event.eventStatusId, getEventStatusSx(event.eventStatusId).color)}
                label={event.eventStatus.name}
                sx={{
                  fontWeight: 500,
                  ...getEventStatusSx(event.eventStatusId),
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
          {/* Организатор */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <People sx={{ fontSize: 24, color: '#949cff' }} />
              <Typography variant="body1" color="text.secondary">
                {isCommunity ? (
                  event.user?.userName ? (
                    event.user.fullName 
                      ? `Инициатива предложена: ${event.user.userName} (${event.user.fullName})`
                      : `Инициатива предложена: ${event.user.userName}`
                  ) : ' '
                ) : ( 
                  event.user?.organizerProfile?.organizationName 
                    ? `Организатор: ${event.user?.organizerProfile.organizationName}`
                    : ' '
                )}
              </Typography>
            </Box>
            {user?.user?.id && event.user?.id && user.user.id !== event.user.id && user?.role !== "moderator" && (
              <Button
                size="small"
                color="error"
                startIcon={<Flag sx={{ fontSize: 18 }} />}
                onClick={() => setReportModalOpen(true)}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: 'rgba(211, 47, 47, 0.04)',
                  }
                }}
              >
                Пожаловаться
              </Button>
            )}
          </Box>
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
              Подробности мероприятия
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

                  {!editPointsMode ? (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1c022c' }}>
                        {event.eventPoints}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        баллов
                      </Typography>

                      {user?.role === "moderator" && event.eventStatusId === 1 && (
                        <Button
                          size="small"
                          onClick={() => setEditPointsMode(true)}
                          sx={{
                            ml: 1,
                            textTransform: 'none',
                            color: '#949cff',
                            fontWeight: 500,
                            minWidth: 0,
                            px: 1
                          }}
                        >
                          Изменить
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <TextField
                        type="number"
                        size="small"
                        value={points}
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          if (value >= 0 && value <= 100) {
                            setPoints(value);
                          }
                        }}
                        onBlur={() => {
                          if (points < 10) setPoints(10);
                          if (points > 100) setPoints(100);
                        }}
                        inputProps={{ min: 10, max: 100 }}
                        sx={{ width: 90 }}
                      />

                      <Typography variant="body2" color="text.secondary">
                        баллов
                      </Typography>

                      <Button
                        size="small"
                        onClick={() => {
                          setEvent((prev: any) => ({
                            ...prev,
                            eventPoints: points,
                          }));
                          setEditPointsMode(false);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Ок
                      </Button>

                      <Button
                        size="small"
                        onClick={() => {
                          setPoints(event.eventPoints);
                          setEditPointsMode(false);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Отмена
                      </Button>
                    </>
                  )}
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
                  bgcolor: '#949cff',
                },
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Зарегистрироваться на мероприятие
            </Button>
          )}

        {/* МОДЕРАТОР */}
        {user?.role === "moderator" && event.eventStatusId === 1 && (
          <Box sx={{ mt: 3 }}>

            {/* КНОПКИ МОДЕРАЦИИ */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                color="success"
                startIcon={
                  processingStatus === 2
                    ? <CircularProgress size={20} color="inherit" />
                    : <CheckCircle />
                }
                fullWidth
                onClick={() => handleModeration(2)}
                disabled={!!processingStatus}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    bgcolor: 'rgba(76, 175, 80, 0.04)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                {processingStatus === 2 ? "Обработка..." : "Одобрить мероприятие"}
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={
                  processingStatus === 3
                    ? <CircularProgress size={20} color="inherit" />
                    : <Cancel />
                }
                fullWidth
                onClick={() => handleModeration(3)}
                disabled={!!processingStatus}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    bgcolor: 'rgba(244, 67, 54, 0.04)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                {processingStatus === 3 ? "Обработка..." : "Отклонить мероприятие"}
              </Button>
            </Box>

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
            Вы действительно хотите зарегистрироваться на мероприятие <strong>"{event.name}"</strong>?
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
      {/* Модальное окно жалобы */}
      <ReportUserModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedUserId={event.user?.id || ''}
        reportedUserName={
          !isCommunity 
            ? (event.user?.organizerProfile?.organizationName || event.user?.userName )
            : (event.user?.userName)
        }
        contextInfo={{
          name: event.name,
          id: event.id
        }}
        onReportSuccess={() => {
          setReportModalOpen(false);
          showNotification('Жалоба отправлена, спасибо за обратную связь', 'info');
        }}
      />
    </Container>
  );
};