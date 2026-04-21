import React, { useEffect, useContext, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  TextField,
  Grid,
  Chip,
  Avatar,
  Divider,
  Button,
  InputAdornment,
  Paper,
  alpha,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { BanContext } from "../context/BanContext";
import { useNotification } from "../components/Notification";
import { useNavigate } from "react-router-dom";

export const BanHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const banContext = useContext(BanContext);
  const { showNotification } = useNotification();

  const [search, setSearch] = useState("");

  if (!banContext) {
    throw new Error("BanContext не найден");
  }

  const {
    bans,
    isLoading,
    error,
    fetchBans,
    updateBan,
  } = banContext;

  // первый загруз
  useEffect(() => {
    fetchBans();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchBans(search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  const handleUnban = async (ban: any) => {
    const success = await updateBan(ban.id, {
      ...ban,
      isActive: false,
    });

    if (success) {
      showNotification("Пользователь разбанен", "success");
    } else {
      showNotification("Ошибка разбана", "error");
    }
  };

  if (isLoading && bans.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
      <Stack spacing={4}>
        <Typography variant="h4" fontWeight={700}>
          История банов
        </Typography>

        <Paper elevation={0} sx={{ p: 0.5, bgcolor: (theme) => alpha(theme.palette.common.black, 0.02), borderRadius: 2 }}>
          <TextField
            placeholder="Поиск (модератор, пользователь, причина)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.paper",
              },
            }}
          />
        </Paper>

        {error && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
              borderRadius: 2,
              border: 1,
              borderColor: "error.main",
            }}
          >
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        <Grid container spacing={3}>
          {bans.map((ban) => (
            <Grid size={{ xs: 12, md: 6 }} key={ban.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  transition: "all 0.2s ease-in-out",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar src={ban.moder?.profileImagePath} sx={{ width: 40, height: 40 }} />
                        <Typography fontWeight={500}>
                          {ban.moder?.userName || "Неизвестный"}
                        </Typography>
                      </Box>

                      <Typography color="text.secondary" variant="body2">
                        забанил
                      </Typography>

                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar src={ban.bannedUser?.profileImagePath} sx={{ width: 40, height: 40 }} />
                        <Typography fontWeight={500}>
                          {ban.bannedUser?.userName || "Неизвестный"}
                        </Typography>
                      </Box>

                      <Chip
                        icon={ban.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                        label={ban.isActive ? "Заблокирован" : "Разбанен"}
                        color={ban.isActive ? "error" : "success"}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        bgcolor: (theme) => alpha(theme.palette.common.black, 0.02),
                        borderRadius: 2,
                      }}
                    >
                      <Typography>
                        <b>Причина:</b> {ban.banReason || "Не указана"}
                      </Typography>
                    </Paper>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">Дата блокировки:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ban.createdAt ? new Date(ban.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'Дата не указана'}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="flex-end" gap={2}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PersonIcon />}
                        onClick={() => navigate(`/user-for-moder/${ban.bannedUserId}`)}
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          minWidth: 120,
                        }}
                      >
                        Профиль
                      </Button>
                      {ban.isActive && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleUnban(ban)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            minWidth: 120,
                          }}
                        >
                          Разбанить
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {bans.length === 0 && (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              bgcolor: (theme) => alpha(theme.palette.common.black, 0.01),
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography color="text.secondary">
              Ничего не найдено
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  );
};