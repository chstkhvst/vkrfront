import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Avatar,
  Grid,
  Chip,
  Paper,
  alpha,
  Button,
  IconButton,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import ReportIcon from "@mui/icons-material/Report";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { VolunteerEventContext } from "../context/EventContext";
import { BanContext } from "../context/BanContext";
import { useNavigate } from "react-router-dom";
import { BanUserModal } from "../components/BanUserModal";
import { ChevronRight } from "@mui/icons-material";

export const UserForModer: React.FC = () => {
  const { id } = useParams();
  const { getUserById } = useAuth();

  const eventContext = useContext(VolunteerEventContext);
  const banContext = useContext(BanContext);
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [showEvents, setShowEvents] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const data = await getUserById(id);
        console.log("Ответ API:", data);
        setUser(data);
      } catch {
        setError("Ошибка загрузки пользователя");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box textAlign="center" mt={5}>
        <Typography color="error">
          {error || "Пользователь не найден"}
        </Typography>
      </Box>
    );
  }

  const hasActiveBan = user.bans?.some((b: any) => b.isActive);
  // Проверка наличия фона
  const hasBackground = user?.backgroundImagePath;

  const loadEvents = async () => {
    if (!id || !eventContext) return;

    try {
      setEventsLoading(true);
      const data = await eventContext.getEventsByUserId(id);
      setEvents(data);
      setShowEvents(true);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleOpenBanModal = () => {
    setBanModalOpen(true);
  };

  const handleCloseBanModal = () => {
    setBanModalOpen(false);
  };

  const handleBanSuccess = async () => {
    if (!id) return;
    const updated = await getUserById(id);
    setUser(updated);
  };

  const handleUnban = async () => {
    const activeBan = user.bans?.find((b: any) => b.isActive);
    if (!activeBan) return;

    await banContext!.updateBan(activeBan.id, {
      ...activeBan,
      isActive: false,
    });

    const updated = await getUserById(id!);
    setUser(updated);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: 3, py: 4 }}>
      <Stack spacing={4}>
        {/* HEADER */}
        <Card
          elevation={0}
          sx={{
            position: "relative",
            backgroundImage: user?.backgroundImagePath
              ? `url(${user.backgroundImagePath})`
              : "none",
            backgroundColor: !user?.backgroundImagePath
              ? "rgba(255,255,255, 0.5)"
              : "transparent",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: hasBackground ? 240 : "auto",
            border: 1,
            borderColor: hasActiveBan ? "error.main" : "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Градиентный оверлей */}
          {hasBackground && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(to top, rgba(103, 58, 183, 0.7) 0%, rgba(103, 58, 183, 0.3) 50%, transparent 100%)",
                zIndex: 1,
              }}
            />
          )}

          <CardContent sx={{ position: "relative", zIndex: 2, py: 4 }}>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                src={user.profileImagePath || ""}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  border: "4px solid white",
                  boxShadow: 3,
                }}
              />
              
              <Box
                sx={{
                  backdropFilter: hasBackground ? "blur(12px)" : "none",
                  backgroundColor: hasBackground ? "rgba(255, 255, 255, 0.25)" : "transparent",
                  border: hasBackground ? "1px solid rgba(255, 255, 255, 0.3)" : "none",
                  borderRadius: 2,
                  p: 2,
                  display: "inline-block",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{
                    color: hasBackground ? "white" : "text.primary",
                    textShadow: hasBackground ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                  }}
                >
                  {user.fullname || "Без имени"}
                </Typography>
                <Typography
                  sx={{
                    color: hasBackground ? "rgba(255,255,255,0.95)" : "text.secondary",
                    textShadow: hasBackground ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                  }}
                >
                  @{user.userName}
                </Typography>
                <Typography
                  sx={{
                    color: hasBackground ? "rgba(255,255,255,0.95)" : "text.secondary",
                    textShadow: hasBackground ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* ПРОФИЛИ */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography fontWeight={600}>
                  Профили
                </Typography>

                {hasActiveBan && (
                  <Chip
                    label="Заблокирован"
                    color="error"
                    size="small"
                  />
                )}
              </Stack>

                <Stack spacing={1.5}>
                  <Box display="flex" gap={1}>
                    <Chip
                      label="Волонтёр"
                      color={user.volunteerProfile ? "primary" : "default"}
                    />
                    <Chip
                      label="Организатор"
                      color={user.organizerProfile ? "primary" : "default"}
                    />
                  </Box>

                  {!user.volunteerProfile && !user.organizerProfile && (
                    <Typography color="text.secondary">
                      Нет профилей
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* СТАТИСТИКА */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
              <CardContent>
                <Typography fontWeight={600} mb={1}>
                  Нарушения
                </Typography>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
  
                {/* Левая часть */}
                <Stack direction="row" spacing={2}>
                  <Chip
                    icon={<BlockIcon />}
                    label={`Баны: ${user.bans?.length || 0}`}
                    color={user.bans?.length ? "error" : "default"}
                  />
                  <Chip
                    icon={<ReportIcon />}
                    label={`Жалобы: ${user.userReports?.length || 0}`}
                    color={user.userReports?.length ? "warning" : "default"}
                  />
                </Stack>

                  {/* Правая часть */}
                  <Stack direction="column" spacing={1} alignItems="center">
                    {hasActiveBan ? (
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={handleUnban}
                      >
                        Разблокировать
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleOpenBanModal}
                      >
                        Заблокировать
                      </Button>
                    )}

                  </Stack>

                </Stack>
            </CardContent>
          </Card>
        </Grid>

          {/* БАНЫ */}
          <Grid size={{ xs: 12 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
              <CardContent>
                <Typography fontWeight={600} mb={2}>
                  Баны
                </Typography>

                <Stack spacing={2}>
                  {user.bans?.length ? (
                    user.bans.map((ban: any) => (
                      <Paper
                        key={ban.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: (theme) => alpha(theme.palette.common.black, 0.02),
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography>
                              <b>Причина:</b> {ban.banReason || "Не указана"}
                            </Typography>

                            <Chip
                              label={ban.isActive ? "Активен" : "Разбанен"}
                              color={ban.isActive ? "error" : "success"}
                              size="small"
                            />
                          </Stack>
                            <Typography variant="body2" color="text.secondary">
                              {ban.createdAt
                                ? new Date(ban.createdAt).toLocaleDateString()
                                : "Дата неизвестна"}
                            </Typography>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      Баны отсутствует
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* ЖАЛОБЫ */}
          <Grid size={{ xs: 12 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
              <CardContent>
                <Typography fontWeight={600} mb={2}>
                  Жалобы
                </Typography>

                <Stack spacing={2}>
                  {user.userReports?.length ? (
                    user.userReports.map((report: any) => (
                      <Paper
                        key={report.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: (theme) => alpha(theme.palette.common.black, 0.02),
                        }}
                      >
                        <Typography>
                          {report.reportReason || "Без описания"}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      Жалоб нет
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Button
            variant="text"
            sx={{ ml: "auto" }}
            onClick={loadEvents}
          >
            Показать мероприятия
          </Button>
          {showEvents && (
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
                <CardContent>
                  <Typography fontWeight={600} mb={2}>
                    Мероприятия пользователя
                  </Typography>

                  {eventsLoading ? (
                    <CircularProgress />
                  ) : (
                    <Stack spacing={2}>
                      {events.length ? (
                        events.map((event: any) => (
                          <Paper
                            key={event.id}
                            variant="outlined"
                            sx={{ p: 2, borderRadius: 2 }}
                          >
                            <Stack spacing={1}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Box flex={1}>
                                  <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                      📅 {event.eventDateTime
                                        ? new Date(event.eventDateTime).toLocaleString()
                                        : "Нет даты"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      📍 {event.address || "Без адреса"}
                                    </Typography>
                                  </Stack>
                                </Box>
                                
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/events/${event.id}`)}
                                  sx={{ color: "primary.main" }}
                                >
                                  <ChevronRight />
                                </IconButton>
                              </Box>
                            </Stack>
                          </Paper>
                        ))
                      ) : (
                        <Typography color="text.secondary">
                          Пользователь не организовывал или не предлагал ни одного мероприятия
                        </Typography>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
        <BanUserModal
          open={banModalOpen}
          onClose={handleCloseBanModal}
          userId={user?.id}
          userName={user?.userName}
          onBanSuccess={handleBanSuccess}
        />
      </Stack>
    </Box>
  );
};