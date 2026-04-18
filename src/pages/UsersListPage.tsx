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
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

export const UsersListPage: React.FC = () => {
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
      const res = await getAllUsers(pageNumber, 10, searchValue || undefined);

      setUsers(res.items || []);
      console.log(res.items);
      setTotalPages(res.totalPages || 1);
      setPage(res.currentPage || 1);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Фильтр */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          p: 3,
          background:
            "linear-gradient(135deg, rgba(148, 156, 255, 0.05) 0%, rgba(124, 132, 244, 0.05) 100%)",
          border: "1px solid rgba(148, 156, 255, 0.2)",
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Поиск (логин / ФИО)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <Search sx={{ mr: 1, color: "#949cff" }} fontSize="small" />
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "white",
                "& fieldset": { borderColor: "#949cff" },
                "&:hover fieldset": { borderColor: "#7c84f4" },
                "&.Mui-focused fieldset": { borderColor: "#949cff" },
              },
              "& .MuiInputLabel-root": {
                color: "#5f6388",
                "&.Mui-focused": { color: "#949cff" },
              },
            }}
          />
        </Box>
      </Card>

      {/* Заголовок */}
      <Typography variant="h4" sx={{ mb: 3, color: "#1c022c" }}>
        Пользователи
      </Typography>

      {/* Список */}
      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid size={12} key={user.id}>
            <Card
              sx={{
                transition: "0.3s",
                "&:hover": {
                  transform: "scale(1.01)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Avatar
                    src={user.profileImagePath || undefined}
                    sx={{ width: 56, height: 56 }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#1c022c" }}
                    >
                      {user.userName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {user.fullname || " "}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />
                {user.volunteerProfile && (
                  <Typography variant="body2" color="text.secondary">
                    Баллы: {user.volunteerProfile.totalPoints}
                  </Typography>
                )}

                {user.organizerProfile && (
                  <Typography variant="body2" color="text.secondary">
                    Организация:{" "}
                    {user.organizerProfile.organizationName || "—"}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Пагинация */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          siblingCount={0}
          boundaryCount={1}
        />
      </Box>
    </Container>
  );
};