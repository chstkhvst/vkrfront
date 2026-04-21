import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Avatar,
  Divider,
  Grid,
  Chip,
  Paper,
  alpha,
} from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import ReportIcon from "@mui/icons-material/Report";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const UserForModer: React.FC = () => {
  const { id } = useParams();
  const { getUserById } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

              {hasActiveBan && (
                <Chip
                  label="Заблокирован"
                  color="error"
                  sx={{ ml: "auto", fontWeight: 600 }}
                />
              )}
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* ПРОФИЛИ */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
              <CardContent>
                <Typography fontWeight={600} mb={2}>
                  Профили
                </Typography>

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
                <Typography fontWeight={600} mb={2}>
                  Нарушения
                </Typography>

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
                          <Typography>
                            <b>Причина:</b> {ban.banReason || "Не указана"}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            {ban.createdAt
                              ? new Date(ban.createdAt).toLocaleDateString()
                              : "Дата неизвестна"}
                          </Typography>

                          <Chip
                            label={ban.isActive ? "Активен" : "Разбанен"}
                            color={ban.isActive ? "error" : "success"}
                            size="small"
                          />
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
        </Grid>
      </Stack>
    </Box>
  );
};