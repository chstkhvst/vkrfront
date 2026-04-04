import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Stack,
  alpha,
} from '@mui/material';
import { Event, Person, Logout, Add, KeyboardArrowDown } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const navigate = useNavigate();
  const { user, currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAuthenticated = !!user;
  const userName = currentUser?.userName || 'Пользователь';
  const isOrganizer = user?.role === 'organizer';
    const isVolunteer = user?.role === 'volunteer';
      const isModer = user?.role === 'moder';

  const handleLogin = () => navigate('/login');
  const handleLogout = async () => {
    await logout();
    setAnchorEl(null);
    navigate('/');
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  const handleRegister = () => navigate('/register');
  const handleCreateEvent = () => navigate('/events/add');  
  const handleCreateEventForUser = () => navigate('/events/add');

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: '#949cff',
        borderBottom: '1px solid',
        borderBottomColor: alpha('#ffed86', 0.2),
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1.5, px: { xs: 2, md: 0 } }}>

          {/* ЛОГО */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
            }}
          >
            <Box
              sx={{
                background: '#ffed86',
                borderRadius: '14px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Event sx={{ color: '#949cff', fontSize: '28px' }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: '#ffed86',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Volunteering
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: alpha('#ffed86', 0.8),
                  fontSize: '10px',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Волонтерская платформа
              </Typography>
            </Box>
          </Box>

          {/* НАВИГАЦИЯ*/}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="text"
              color="secondary"
              onClick={() => navigate('/events')}
            >
              Мероприятия от организаций
            </Button>
            <Button
              variant="text"
              color="secondary"
              onClick={() => navigate('/community-events')}
            >
              Инициативы от волонтеров
            </Button>
            {(isOrganizer || isVolunteer) && (
            <Button
              variant="text"
              color="secondary"
              onClick={() => navigate('/myevents')}
            >
              Мои мероприятия
            </Button>
            )}
            {isVolunteer && (
              <Button
                variant="text"
                color="secondary"
                onClick={() => navigate('/events-to-visit')}
              >
                Мои посещения
              </Button>
            )}
            {isOrganizer && (
              <Button
                variant="text"
                color="secondary"
                startIcon={<Add sx={{ fontSize: 20 }} />}
                onClick={handleCreateEvent}
              >
                Создать мероприятие
              </Button>
            )}
            {isVolunteer && (
              <Button
                variant="text"
                color="secondary"
                startIcon={<Add sx={{ fontSize: 20 }} />}
                onClick={handleCreateEvent}
              >
                Предложить мероприятие
              </Button>
            )}
          </Stack>

          {/* ПРАВАЯ ЧАСТЬ */}
          {isAuthenticated ? (
            <>
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  px: 2,
                  py: 0.8,
                  borderRadius: '40px',
                  background: alpha('#ffed86', 0.08),
                  border: '1px solid',
                  borderColor: alpha('#ffed86', 0.3),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: alpha('#ffed86', 0.15),
                    borderColor: alpha('#ffed86', 0.5),
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: '#ffed86',
                    color: '#949cff',
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  {userName[0].toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#ffed86', lineHeight: 1.3 }}>
                    {userName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha('#ffed86', 0.7), fontSize: '0.7rem' }}>
                    {isOrganizer ? 'Организатор' : 'Волонтер'}
                  </Typography>
                </Box>
                <KeyboardArrowDown sx={{ color: '#ffed86', fontSize: 18 }} />
              </Box>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    borderRadius: '16px',
                    minWidth: 240,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '1px solid',
                    borderColor: alpha('#949cff', 0.2),
                  }
                }}
              >
                <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderBottomColor: alpha('#949cff', 0.1) }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#949cff' }}>
                    {userName}
                  </Typography>
                </Box>
                <MenuItem onClick={handleProfileClick} sx={{ py: 1.5, px: 2.5, gap: 1.5 }}>
                  <Person sx={{ fontSize: 20, color: '#949cff' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Профиль
                  </Typography>
                </MenuItem>
                {isOrganizer && (
                  <MenuItem onClick={handleCreateEvent} sx={{ py: 1.5, px: 2.5, gap: 1.5 }}>
                    <Add sx={{ fontSize: 20, color: '#ffed86' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Добавить мероприятие
                    </Typography>
                  </MenuItem>
                )}
                {isVolunteer && (
                  <MenuItem onClick={handleCreateEvent} sx={{ py: 1.5, px: 2.5, gap: 1.5 }}>
                    <Add sx={{ fontSize: 20, color: '#ffed86' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Добавить мероприятие
                    </Typography>
                  </MenuItem>
                )}
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2.5, gap: 1.5 }}>
                  <Logout sx={{ fontSize: 20, color: '#f44336' }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Выйти
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleLogin}
              >
                Войти
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleRegister}
              >
                Регистрация
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};