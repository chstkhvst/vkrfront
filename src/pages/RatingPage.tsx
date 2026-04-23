import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Avatar,
  Divider,
  Chip,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import { Star, EmojiEvents } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

export const RatingPage: React.FC = () => {
  const { getRatingMonthly, getRatingAll } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    fetchRating();
  }, [tab]);

  const fetchRating = async () => {
    setIsLoading(true);
    try {
      const res =
        tab === 0
          ? await getRatingMonthly()
          : await getRatingAll();

      setUsers(res || []);
    } finally {
      setIsLoading(false);
    }
  };

  const hasBackground = (user: any) => {
    return user?.backgroundImagePath;
  };

  const getPlaceColor = (index: number) => {
    if (index === 0) return "#FFD700";
    if (index === 1) return "#C0C0C0";
    if (index === 2) return "#CD7F32";
    return "#949cff";
  };

  if (isLoading && users.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 700,
          color: "#1c022c",
          textAlign: "center",
        }}
      >
        Рейтинг пользователей
      </Typography>

      {/* Tabs */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
            },
          }}
        >
          <Tab label="За месяц" />
          <Tab label="За всё время" />
        </Tabs>
      </Box>

      <Stack spacing={3}>
        {users.map((user, index) => {
          const userHasBackground = hasBackground(user);
          const points = tab === 0
                ? user.volunteerProfile.monthlyPoints ?? 0
                : user.volunteerProfile?.totalPoints ?? 0;
          return (
            <Card
              key={user.id}
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 3,
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.12)",
                },
              }}
            >
              {/* Фон */}
              {userHasBackground && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 160,
                    backgroundImage: `url(${user.backgroundImagePath})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    zIndex: 0,
                  }}
                />
              )}

              {/* затемнение */}
              {userHasBackground && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 160,
                    background:
                      "linear-gradient(to top, rgba(28,2,44,0.85), rgba(28,2,44,0.4), transparent)",
                    zIndex: 1,
                  }}
                />
              )}

              <CardContent sx={{ position: "relative", zIndex: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {/* Место */}
                  <Box
                    sx={{
                      minWidth: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "rgba(0,0,0,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: getPlaceColor(index),
                      border: `2px solid ${getPlaceColor(index)}`,
                    }}
                  >
                    {index < 3 ? <EmojiEvents /> : index + 1}
                  </Box>

                  {/* Аватар */}
                  <Avatar
                    src={user.profileImagePath || undefined}
                    sx={{
                      width: 64,
                      height: 64,
                      border: "2px solid #949cff",
                    }}
                  >
                    {!user.profileImagePath && user.userName?.[0]?.toUpperCase()}
                  </Avatar> 
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: userHasBackground ? "white" : "#1c022c",
                        textShadow: userHasBackground ? "0 2px 4px rgba(0,0,0,0.3)" : "none",
                      }}
                    >
                      {user.userName}
                    </Typography>

                    {user.fullname && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: userHasBackground ? "rgba(255,255,255,0.9)" : "text.secondary",
                          textShadow: userHasBackground ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
                        }}
                      >
                        {user.fullname}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      backdropFilter: "blur(10px)",
                      backgroundColor: "rgba(255,255,255,0.85)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                    }}
                  >
                    <Chip
                      icon={<Star sx={{ fontSize: 16 }} />}
                      label={points}
                      sx={{
                        fontWeight: 600,
                        bgcolor: "transparent",
                        color: "#f5a623",
                      }}
                    />
                  </Box>
                </Stack>

                <Divider sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Container>
  );
};