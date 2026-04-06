import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Paper,
  alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Report, EventNote, People } from '@mui/icons-material';

export const AdminPanel = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: '20px',
          background: '#ffffff',
          border: '1px solid',
          borderColor: alpha('#949cff', 0.2),
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#949cff',
              mb: 0.5,
            }}
          >
            Панель модератора
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: alpha('#000', 0.6) }}
          >
            Управление системой и контентом
          </Typography>
        </Box>

        <Stack spacing={2}>
            <Button
                fullWidth
                variant="outlined"
                startIcon={<EventNote />}
                onClick={() => navigate('/events')}
                sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                borderRadius: '12px',
                borderColor: alpha('#949cff', 0.3),
                color: '#949cff',
                '&:hover': {
                    borderColor: '#949cff',
                    background: alpha('#949cff', 0.05),
                },
                }}
            >
                Мероприятия от организаций
            </Button>
            <Button
                fullWidth
                variant="outlined"
                startIcon={<EventNote />}
                onClick={() => navigate('/community-events')}
                sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                borderRadius: '12px',
                borderColor: alpha('#949cff', 0.3),
                color: '#949cff',
                '&:hover': {
                    borderColor: '#949cff',
                    background: alpha('#949cff', 0.05),
                },
                }}
            >
                Инициативы от волонтеров
            </Button>
            <Button
                fullWidth
                variant="outlined"
                startIcon={<Report />}
                onClick={() => navigate('/reports')}
                sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                borderRadius: '12px',
                borderColor: alpha('#949cff', 0.3),
                color: '#949cff',
                '&:hover': {
                    borderColor: '#949cff',
                    background: alpha('#949cff', 0.05),
                },
                }}
            >
                Жалобы
            </Button>

            <Button
                fullWidth
                variant="outlined"
                startIcon={<People />}
                onClick={() => navigate('/users')}
                sx={{
                justifyContent: 'flex-start',
                py: 1.5,
                borderRadius: '12px',
                borderColor: alpha('#949cff', 0.3),
                color: '#949cff',
                '&:hover': {
                    borderColor: '#949cff',
                    background: alpha('#949cff', 0.05),
                },
                }}
            >
                Пользователи
            </Button>
        </Stack>
      </Paper>
    </Container>
  );
};