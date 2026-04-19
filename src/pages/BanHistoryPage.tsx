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
} from "@mui/material";
import { BanContext } from "../context/BanContext";
import { useNotification } from "../components/Notification";

export const BanHistoryPage: React.FC = () => {
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
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={600}>
          История банов
        </Typography>

        <TextField
          label="Поиск (модератор, пользователь, причина)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />

        {error && (
          <Typography color="error">{error}</Typography>
        )}

        <Grid container spacing={3}>
          {bans.map((ban) => (
            <Grid size={12} key={ban.id}>
              <Card
                sx={{
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box display="flex" alignItems="center" gap={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar src={ban.moder?.profileImagePath} />
                        <Typography>
                          {ban.moder?.userName || "Неизвестный"}
                        </Typography>
                      </Box>

                      <Typography color="text.secondary">
                        забанил
                      </Typography>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar src={ban.bannedUser?.profileImagePath} />
                        <Typography>
                          {ban.bannedUser?.userName || "Неизвестный"}
                        </Typography>
                      </Box>

                      <Chip
                        label={ban.isActive ? "Активен" : "Разбанен"}
                        color={ban.isActive ? "error" : "success"}
                      />
                    </Box>

                    <Typography>
                      <b>Причина:</b> {ban.banReason || "Не указана"}
                    </Typography>

                    <Divider />

                    {ban.isActive && (
                      <Box display="flex" justifyContent="flex-end">
                        <Button
                          variant="contained"
                          color="success"
                          onClick={() => handleUnban(ban)}
                        >
                          Разбанить
                        </Button>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {bans.length === 0 && (
          <Typography color="text.secondary">
            Ничего не найдено
          </Typography>
        )}
      </Stack>
    </Box>
  );
};