import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Grid,
  TextField,
  Pagination,
  Avatar,
  Divider,
  Button,
  Chip,
  Paper,
  InputAdornment,
} from "@mui/material";
import { Search, Star, Business, Person, Key } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAllUsers } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers(1, search);
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    fetchUsers(page, search);
  }, [page]);

  const fetchUsers = async (pageNumber: number, searchValue?: string) => {
    setIsLoading(true);
    try {
      const res = await getAllUsers(pageNumber, 12, searchValue || undefined);
      setUsers(res.items || []);
      setTotalPages(res.totalPages || 1);
      setPage(res.currentPage || 1);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header with search */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 600, color: "#1c022c" }}>
          Пользователи
        </Typography>
        
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid rgba(148, 156, 255, 0.2)",
            borderRadius: 2,
            bgcolor: "rgba(148, 156, 255, 0.02)",
          }}
        >
          <TextField
            label="Поиск по логину или ФИО"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="medium"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#949cff" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "white",
                "&:hover fieldset": { borderColor: "#949cff" },
                "&.Mui-focused fieldset": { borderColor: "#949cff" },
              },
            }}
          />
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                {/* User header */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Avatar
                    src={user.profileImagePath || undefined}
                    sx={{ width: 64, height: 64, border: "2px solid #949cff" }}
                  >
                    {!user.profileImagePath && user.userName?.[0]?.toUpperCase()}
                  </Avatar>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: "#1c022c",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.userName}
                    </Typography>
                    
                    {user.fullname && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.fullname}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* User stats */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
                  {user.volunteerProfile && (
                    <Chip
                      icon={<Star sx={{ fontSize: 16 }} />}
                      label={`${user.volunteerProfile.totalPoints} баллов`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(255, 215, 0, 0.1)",
                        color: "#f5a623",
                        fontWeight: 500,
                        alignSelf: "flex-start",
                      }}
                    />
                  )}

                  {user.organizerProfile?.organizationName && (
                    <Chip
                      icon={<Business sx={{ fontSize: 16 }} />}
                      label={user.organizerProfile.organizationName}
                      size="small"
                      sx={{
                        bgcolor: "rgba(76, 175, 80, 0.1)",
                        color: "#4caf50",
                        fontWeight: 500,
                        alignSelf: "flex-start",
                      }}
                    />
                  )}
                  {!(user.organizerProfile || user.volunteerProfile) && (
                    <Chip
                      icon={<Key sx={{ fontSize: 16 }} />}
                      label={"Модератор"}
                      size="small"
                      sx={{
                        bgcolor: "rgba(76, 175, 80, 0.1)",
                        color: "#4caf50",
                        fontWeight: 500,
                        alignSelf: "flex-start",
                      }}
                    />
                  )}
                </Box>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Person />}
                  onClick={() => navigate(`/user-for-moder/${user.id}`)}
                  sx={{
                    mt: "auto",
                    borderRadius: 2,
                    textTransform: "none",
                    borderColor: "#949cff",
                    color: "#949cff",
                    "&:hover": {
                      borderColor: "#7c84f4",
                      bgcolor: "rgba(148, 156, 255, 0.04)",
                    },
                  }}
                >
                  Посмотреть профиль
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};