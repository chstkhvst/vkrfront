import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  EventAvailable as UpcomingIcon,
  Cancel as CancelledAttendanceIcon,
  CheckCircle as AttendedIcon,
  DoNotDisturb as NoShowIcon,
  Flag,
  CalendarMonthOutlined as CalendarIcon,
  LocationOnOutlined as LocationIcon,
} from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import { AttendanceContext } from '../context/AttendanceContext';
import { VolunteerEventContext } from '../context/EventContext';
import { useAuth } from '../context/AuthContext';
import { EventAttendanceDTO } from '../client/apiClient';
import { useNotification } from '../components/Notification';
import { ReportUserModal } from '../components/ReportUserModal';
import { SURFACE } from '../theme';

export const EventsToVisitPage: React.FC = () => {
  const context = useContext(AttendanceContext);
  const eventContext = useContext(VolunteerEventContext);
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);
  const [data, setData] = useState<EventAttendanceDTO[]>([]);
  const [cancelAttendanceDialogOpen, setCancelAttendanceDialogOpen] = useState(false);
  const [attendanceToCancel, setAttendanceToCancel] = useState<EventAttendanceDTO | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReportEvent, setSelectedReportEvent] = useState<any>(null);

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

const getAttendanceStatusIcon = (statusId: number | undefined, color: string) => {
  switch (statusId) {
    case ATTENDANCE_STATUS.UPCOMING:
      return <UpcomingIcon fontSize="small" sx={{ color }} />;
    case ATTENDANCE_STATUS.CANCELLED:
      return <CancelledAttendanceIcon fontSize="small" sx={{ color }} />;
    case ATTENDANCE_STATUS.ATTENDED:
      return <AttendedIcon fontSize="small" sx={{ color }} />;
    case ATTENDANCE_STATUS.NO_SHOW:
      return <NoShowIcon fontSize="small" sx={{ color }} />;
    default:
      return undefined;
  }
};

  const getAttendanceStatusSx = (statusId: number | undefined) => {
    switch (statusId) {
      case ATTENDANCE_STATUS.UPCOMING:
        return { 
          bgcolor: SURFACE.softPrimary,
          color: 'primary.main',
          border: 'none',
          '& .MuiChip-icon': {
            color: 'primary.main',
          },
        };
      case ATTENDANCE_STATUS.CANCELLED:
        return { 
          bgcolor: SURFACE.softError,
          color: 'error.main',
          border: 'none',
          '& .MuiChip-icon': {
            color: 'error.main',
          },
        };
      case ATTENDANCE_STATUS.ATTENDED:
        return { 
          bgcolor: SURFACE.softSuccess,
          color: 'success.main',
          border: 'none',
          '& .MuiChip-icon': {
            color: 'success.main',
          },
        };
      case ATTENDANCE_STATUS.NO_SHOW:
        return { 
          bgcolor: SURFACE.softWarning,
          color: 'text.secondary',
          border: 'none',
          '& .MuiChip-icon': {
            color: 'text.secondary',
          },
        };
      default:
        return { 
          bgcolor: SURFACE.borderLight,
          color: 'text.secondary',
          border: 'none',
          '& .MuiChip-icon': {
            color: 'text.secondary',
          },
        };
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
    return [...volunteerHistory];
  };

  const currentList = getCurrentList();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Мероприятия для посещения
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
          label="Предстоящие"
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
        {currentList.map((a: EventAttendanceDTO) => {
          const event = a.volunteerEvent;
          return (
            <Grid size={12} key={a.id}>
              <Card 
                sx={{ 
                  position: 'relative',
                  cursor: tab === 0 ? 'pointer' : 'default',
                  transition: tab === 0 ? 'transform 0.2s ease, box-shadow 0.2s ease' : 'none',
                  '&:hover': tab === 0 ? {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                  } : {},
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: tab === 0 ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.72)',
                }}
                onClick={() => {
                  if (tab === 0 && event?.id) {
                    navigate(`/events/${event.id}`, { state: { isCommunity: false } });
                  }
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      wordBreak: 'break-word',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {event?.name || 'Без названия'}
                  </Typography>

                  {tab === 1 && event?.userId && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReportEvent(event);
                        setReportModalOpen(true);
                      }}
                      sx={{
                        flexShrink: 0,
                        p: 0.5,
                        ml: 0.5,
                        '&:hover': {
                          bgcolor: 'rgba(211, 47, 47, 0.04)',
                        }
                      }}
                    >
                      <Flag sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </Box>

                <Chip
                  icon={getAttendanceStatusIcon(a.attendanceStatusId, getAttendanceStatusSx(a.attendanceStatusId).color)}
                  label={a.attendanceStatus?.name || 'Статус неизвестен'}
                  sx={{
                    ...getAttendanceStatusSx(a.attendanceStatusId),
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
                      {event?.eventDateTime
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
                      {event?.address || 'Без адреса'}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0, flexWrap: 'wrap', gap: 1 }}>
                  {tab === 0 && canCancelAttendance(event) && (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAttendanceToCancel(a);
                        setCancelAttendanceDialogOpen(true);
                      }}
                    >
                      Отменить участие
                    </Button>
                  )}
                  {(tab === 0 && !canCancelAttendance(event)) || (tab === 1 && a.attendanceStatusId === ATTENDANCE_STATUS.UPCOMING) && (
                    <Typography variant="caption" color="text.secondary">
                      Дождитесь обновления статуса от организатора
                    </Typography>
                  )}
                </CardActions>
              </Card>
            </Grid>
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
            variant="text"
            color="error"
            autoFocus
          >
            Да
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Модальное окно жалобы */}
      <ReportUserModal
        open={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setSelectedReportEvent(null);
        }}
        reportedUserId={selectedReportEvent?.userId || ''}
        reportedUserName={
          selectedReportEvent?.user?.organizerProfile?.organizationName || 
          selectedReportEvent?.user?.userName || 
          ''
        }
        contextInfo={{
          name: selectedReportEvent?.name,
          id: selectedReportEvent?.id
        }}
        onReportSuccess={() => {
          setReportModalOpen(false);
          setSelectedReportEvent(null);
          showNotification('Жалоба отправлена, спасибо за обратную связь', 'info');
        }}
      />
    </Container>
  );
};