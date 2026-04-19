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

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: 3, py: 4 }}>
      <Stack spacing={4}>
        {/* HEADER */}
        <Card
          elevation={0}
          sx={{
            border: 1,
            borderColor: hasActiveBan ? "error.main" : "divider",
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                src={user.profileImagePath || ""}
                sx={{ width: 80, height: 80 }}
              />
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {user.fullname || "Без имени"}
                </Typography>
                <Typography color="text.secondary">
                  @{user.userName}
                </Typography>
                <Typography color="text.secondary">
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