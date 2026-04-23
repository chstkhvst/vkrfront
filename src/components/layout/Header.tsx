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
  useTheme,
} from '@mui/material';
import { 
  Event, 
  Person, 
  Logout, 
  Add, 
  KeyboardArrowDown, 
  Settings,
  EmojiEvents,
  Group,
  CalendarToday,
  History,
  ListAlt,
  Dashboard
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Состояния для выпадающих меню
  const [catalogAnchorEl, setCatalogAnchorEl] = useState<null | HTMLElement>(null);
  const [myEventsAnchorEl, setMyEventsAnchorEl] = useState<null | HTMLElement>(null);

  const isAuthenticated = !!user;
  const userName = currentUser?.userName || 'Пользователь';
  const isOrganizer = user?.role === 'organizer';
  const isVolunteer = user?.role === 'volunteer';
  const isModer = user?.role === 'moderator';

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

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: theme.palette.primary.main,
        borderBottom: '1px solid',
        borderBottomColor: alpha(theme.palette.secondary.main, 0.2),
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
                background: theme.palette.secondary.main,
                borderRadius: '14px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Event sx={{ color: theme.palette.primary.main, fontSize: '28px' }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: theme.palette.secondary.main,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Volunteering
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: alpha(theme.palette.secondary.main, 0.8),
                  fontSize: '10px',
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                Волонтерская платформа
              </Typography>
            </Box>
          </Box>

          {/* НАВИГАЦИЯ */}
          {isAuthenticated && (
            <Stack direction="row" spacing={2} alignItems="center">
              
              {/* КАТАЛОГ МЕРОПРИЯТИЙ (для волонтеров и организаторов) */}
              {(isVolunteer || isOrganizer) && (
                <>
                  <Button
                    color="secondary"
                    endIcon={<KeyboardArrowDown />}
                    onClick={(e) => setCatalogAnchorEl(e.currentTarget)}
                    sx={{ fontWeight: 500 }}
                  >
                    Каталог мероприятий
                  </Button>
                  
                  <Menu
                    anchorEl={catalogAnchorEl}
                    open={Boolean(catalogAnchorEl)}
                    onClose={() => setCatalogAnchorEl(null)}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        borderRadius: '16px',
                        minWidth: 260,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <MenuItem 
                      onClick={() => {
                        navigate('/events');
                        setCatalogAnchorEl(null);
                      }}
                      sx={{ py: 1.5, px: 2.5, gap: 1.5 }}
                    >
                      <Event sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Мероприятия организаций
                      </Typography>
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => {
                        navigate('/community-events');
                        setCatalogAnchorEl(null);
                      }}
                      sx={{ py: 1.5, px: 2.5, gap: 1.5 }}
                    >
                      <Group sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Инициативы волонтеров
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              )}

              {/* МОИ МЕРОПРИЯТИЯ (для волонтеров) */}
              {isVolunteer && (
                <>
                  <Button
                    color="secondary"
                    endIcon={<KeyboardArrowDown />}
                    onClick={(e) => setMyEventsAnchorEl(e.currentTarget)}
                    sx={{ fontWeight: 500 }}
                  >
                    Мои мероприятия
                  </Button>
                  
                  <Menu
                    anchorEl={myEventsAnchorEl}
                    open={Boolean(myEventsAnchorEl)}
                    onClose={() => setMyEventsAnchorEl(null)}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        borderRadius: '16px',
                        minWidth: 260,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <MenuItem 
                      onClick={() => {
                        navigate('/myevents');
                        setMyEventsAnchorEl(null);
                      }}
                      sx={{ py: 1.5, px: 2.5, gap: 1.5 }}
                    >
                      <ListAlt sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Предложенные мной
                      </Typography>
                    </MenuItem>
                    
                    <MenuItem 
                      onClick={() => {
                        navigate('/events-to-visit');
                        setMyEventsAnchorEl(null);
                      }}
                      sx={{ py: 1.5, px: 2.5, gap: 1.5 }}
                    >
                      <History sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Мои посещения
                      </Typography>
                    </MenuItem>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <MenuItem 
                      onClick={() => {
                        navigate('/events/add');
                        setMyEventsAnchorEl(null);
                      }}
                      sx={{ py: 1.5, px: 2.5, gap: 1.5 }}
                    >
                      <Add sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Предложить мероприятие
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              )}

              {/* МОИ МЕРОПРИЯТИЯ (для организаторов) */}
              {isOrganizer && (
                <>
                  <Button
                    color="secondary"
                    endIcon={<KeyboardArrowDown />}
                    onClick={(e) => setMyEventsAnchorEl(e.currentTarget)}
                    sx={{ fontWeight: 500 }}
                  >
                    Мои мероприятия
                  </Button>
                  
                  <Menu
                    anchorEl={myEventsAnchorEl}
                    open={Boolean(myEventsAnchorEl)}
                    onClose={() => setMyEventsAnchorEl(null)}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    PaperProps={{
                      sx: {
                        mt: 1,
                        borderRadius: '16px',
                        minWidth: 260,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <MenuItem 
                      onClick={() => {
                        navigate('/myevents');
                        setMyEventsAnchorEl(null);
                      }}
                      sx={{ py: 1.5, px: 2.5, gap: 1.5 }}
                    >
                      <ListAlt sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Мои мероприятия
                      </Typography>
                    </MenuItem>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <MenuItem 
                      onClick={() => {
                        navigate('/events/add');
                        setMyEventsAnchorEl(null);
                      }}
                      sx={{ py: 1.5, px: 2.5, gap: 1.5 }}
                    >
                      <Add sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Создать мероприятие
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              )}

              {/* РЕЙТИНГ (для волонтеров и организаторов) */}
              {(isVolunteer || isOrganizer) && (
                <Button
                  color="secondary"
                  startIcon={<EmojiEvents sx={{ fontSize: 20 }} />}
                  onClick={() => navigate('/rating')}
                  sx={{ fontWeight: 500 }}
                >
                  Рейтинг
                </Button>
              )}

              {/* ПАНЕЛЬ АДМИНИСТРАТОРА (для модера) */}
              {isModer && (
                <Button
                  color="secondary"
                  startIcon={<Dashboard sx={{ fontSize: 20 }} />}
                  onClick={() => navigate('/admin-panel')}
                  sx={{ fontWeight: 500 }}
                >
                  Панель администратора
                </Button>
              )}
            </Stack>
          )}

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
                  background: alpha(theme.palette.secondary.main, 0.08),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.secondary.main, 0.3),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: alpha(theme.palette.secondary.main, 0.15),
                    borderColor: alpha(theme.palette.secondary.main, 0.5),
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    bgcolor: theme.palette.secondary.main,
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontSize: '1rem',
                  }}
                >
                  {userName[0].toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.secondary.main, lineHeight: 1.3 }}>
                    {userName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: alpha(theme.palette.secondary.main, 0.7), fontSize: '0.7rem' }}>
                    {isOrganizer && 'Организатор'}
                    {isModer && 'Модератор'}
                    {isVolunteer && 'Волонтер'}
                  </Typography>
                </Box>
                <KeyboardArrowDown sx={{ color: theme.palette.secondary.main, fontSize: 18 }} />
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
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  }
                }}
              >
                <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderBottomColor: alpha(theme.palette.primary.main, 0.1) }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {userName}
                  </Typography>
                </Box>
                <MenuItem onClick={handleProfileClick} sx={{ py: 1.5, px: 2.5, gap: 1.5 }}>
                  <Person sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Профиль
                  </Typography>
                </MenuItem>
                
                {(isOrganizer || isVolunteer) && (
                  <MenuItem onClick={handleCreateEvent} sx={{ py: 1.5, px: 2.5, gap: 1.5 }}>
                    <Add sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {isOrganizer ? 'Создать мероприятие' : 'Предложить мероприятие'}
                    </Typography>
                  </MenuItem>
                )}
                
                {isModer && (
                  <MenuItem onClick={() => navigate('/admin-panel')} sx={{ py: 1.5, px: 2.5, gap: 1.5 }}>
                    <Settings sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Панель администратора
                    </Typography>
                  </MenuItem>
                )}
                <Divider sx={{ my: 1 }} />
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2.5, gap: 1.5 }}>
                  <Logout sx={{ fontSize: 20, color: theme.palette.error.main }} />
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