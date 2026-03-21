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
} from '@mui/material';
import { Event, Person, Logout } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const navigate = useNavigate();
  const { user, currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAuthenticated = !!user;
  const userName = currentUser?.userName || 'Пользователь';

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

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(148,156,255,0.15)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>

          {/* ЛОГО */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Event
              sx={{
                color: '#949cff',
                background: 'rgba(148,156,255,0.15)',
                borderRadius: '8px',
                padding: '4px',
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#2b2f55',
                letterSpacing: '-0.02em',
              }}
            >
              Volunteering
            </Typography>
          </Box>

          {/* НАВИГАЦИЯ */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => navigate('/events')}>
              Мероприятия
            </Button>
          </Box>

          {/* ПРАВАЯ ЧАСТЬ */}
          {isAuthenticated ? (
            <>
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  px: 1,
                  py: 0.5,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Avatar>
                  {userName[0]}
                </Avatar>
                <Typography variant="body2">
                  {userName}
                </Typography>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={handleProfileClick}>
                  <Person sx={{ mr: 1 }} /> Профиль
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} /> Выйти
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={handleLogin}>
                Войти
              </Button>
              <Button 
                variant="contained" 
                color="secondary"
                onClick={handleRegister}
              >
                Регистрация
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};