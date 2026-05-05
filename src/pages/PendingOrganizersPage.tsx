import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Grid,
  Avatar,
  Divider,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import { Business, CheckCircle } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

export const PendingOrganizersPage: React.FC = () => {
  const { getPendingOrganizers, approveOrganizer } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingOrganizers();
      setUsers(data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setApprovingId(userId);
    try {
      await approveOrganizer(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } finally {
      setApprovingId(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: 600, color: "#1c022c" }}
      >
        Заявки организаторов
      </Typography>

      {users.length === 0 && (
        <Typography color="text.secondary">
          Нет заявок на рассмотрение
        </Typography>
      )}

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={user.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={2}>
                  {/* Header */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={user.profileImagePath || undefined}
                      sx={{ width: 56, height: 56, border: "2px solid #949cff" }}
                    >
                      {user.userName?.[0]?.toUpperCase()}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.userName}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                      >
                        {user.fullname}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Organization info */}
                  <Stack spacing={1}>
                    <Chip
                      icon={<Business />}
                      label={user.organizerProfile?.organizationName}
                      sx={{
                        bgcolor: "rgba(76, 175, 80, 0.1)",
                        color: "#4caf50",
                        fontWeight: 500,
                        alignSelf: "flex-start",
                      }}
                    />

                    <Typography variant="body2" color="text.secondary">
                      ОГРН: {user.organizerProfile?.ogrn}
                    </Typography>
                  </Stack>

                  {/* Action */}
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CheckCircle />}
                    disabled={approvingId === user.id}
                    onClick={() => handleApprove(user.id)}
                    sx={{
                      mt: "auto",
                      borderRadius: 2,
                      textTransform: "none",
                      bgcolor: "#949cff",
                      "&:hover": {
                        bgcolor: "#7c84f4",
                      },
                    }}
                  >
                    {approvingId === user.id
                      ? "Одобрение..."
                      : "Одобрить"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};