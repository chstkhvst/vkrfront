import React, { useEffect, useState, useContext } from 'react';
import { 
    Container, 
    Typography, 
    Button, 
    Card, 
    CardContent, 
    CardActions,
    Box,
    Alert,
    CircularProgress,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar, //ИСПРАВИТЬ АЛЕРТЫ
    TextField,
    Select, 
    MenuItem,
    FormControl,
    InputLabel, 
    Pagination,
    Autocomplete  
} from '@mui/material';
import { VolunteerEventContext } from '../context/EventContext';
import { AttendanceContext } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/Notification';
import { EventAttendanceDTO } from '../client/apiClient';
import { useNavigate } from 'react-router-dom';

export const EventsListPage: React.FC = () => {
    const context = useContext(VolunteerEventContext);
    const attContext = useContext(AttendanceContext);
    const { user, isLoading: authLoading } = useAuth(); 
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    
    // Состояния для диалогов
    const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [participantsCount, setParticipantsCount] = useState<number>(0);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [cityId, setCityId] = useState<number | ''>('');
    const [citySearch, setCitySearch] = useState('');
    const {
        events,
        isLoading,
        error,

        pageNumber,
        totalPages,

        eventCategories,
        cities,
        setFilterParams,
        clearFilters,

        setPageNumber,  
    } = context!;
    
    const {
        createAttendance,
        getParticipantsCount,  
    } = attContext!;

     useEffect(() => {
        const delay = setTimeout(() => {
            handleChangeFilters();
        }, 300);

        return () => clearTimeout(delay);
    }, [search]);


    // useEffect(() => {
    //     if (!user) return;
    //     console.log(user)
    //     if (user?.role === "volunteer") {
    //         context!.fetchEventsForUser();
    //     } else {
    //         context!.fetchEvents();
    //     }
    // }, [pageNumber, user?.role]);

    useEffect(() => {
        
        if(authLoading) return;

        //if (!user) return;
        console.log(user)
        if (user?.role === "moderator") {
            context!.fetchEvents();
        } else {
            context!.fetchEventsForUser();
        }
    }, [pageNumber, user?.role, authLoading]);


    const filteredCities = [...cities].sort((a, b) => {
        const aNameMatch = a.name!.toLowerCase().includes(citySearch.toLowerCase());
        const bNameMatch = b.name!.toLowerCase().includes(citySearch.toLowerCase());

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
            return a.name!.localeCompare(b.name!);
    });

    const handleChangeFilters = (overrideParams?: any) => {
        console.log("labuba");
        const params = overrideParams ?? {
            keyWords: search || undefined,
            catId: categoryId || undefined,
            cityId: cityId || undefined
        };

        context!.setFilterParams(params);

        if (user?.role === "volunteer") {
            context!.fetchEventsForUser(params);
        } else {
            context!.fetchEvents(params);
        }
    };

    const handleRegister = async (eventId: number) => {
        if (!createAttendance || !user?.user?.id) {
            showNotification('Ошибка: пользователь не авторизован', 'error');
            return;
        }

        const attendanceData = {
            userId: user.user.id,
            eventId: eventId,
            attendanceStatusId: 1 //зарегистрирован
        };
        
        const existing = await attContext!.fetchAttendanceByUserAndEvent(
            user.user.id,
            eventId
        );
        
        let success = false;

        if (existing) {
            const updated = new EventAttendanceDTO({
                ...existing,
                attendanceStatusId: 1
            });

            success = await attContext!.updateAttendance(existing.id!, updated);
        } else {
            success = await createAttendance(attendanceData as any);
        }
        
        if (success) {
            showNotification('Вы успешно зарегистрированы на событие!', 'success');
            context?.fetchEventsForUser();
            // Обновляем количество участников для этого события
            const count = await getParticipantsCount(eventId);
            if (selectedEventId === eventId) {
                setParticipantsCount(count);
            }
        } else {
            showNotification('Ошибка при регистрации на событие', 'error');
        }
    };
    
    const handleShowParticipants = async (eventId: number) => {
        const count = await getParticipantsCount(eventId);
        setParticipantsCount(count);
        setSelectedEventId(eventId);
        setParticipantsDialogOpen(true);
    };

    if (isLoading && events.length === 0) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {/* Поиск */}
            <TextField
                label="Поиск"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#949cff',
                        },
                        '&:hover fieldset': {
                            borderColor: '#7c84f4',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#949cff',
                        },                       
                    },
                    '& .MuiInputLabel-root': {
                        color: '#5f6388',
                        '&.Mui-focused': {
                            color: '#949cff',
                        },
                    },
                }}
            />

            {/* Категория */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{
                    color: '#5f6388',
                    '&.Mui-focused': {
                        color: '#949cff',
                    },
                }}>Категория</InputLabel>
                <Select
                    value={categoryId}
                    label="Категория"
                    onChange={(e) => setCategoryId(e.target.value as number)}
                    sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#949cff',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7c84f4',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#949cff',
                        },
                    }}
                >
                    {eventCategories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.categoryName}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {/* Город */}
            <Autocomplete
                options={filteredCities}
                getOptionLabel={(option) => `${option.name}${option.subject ? ` (${option.subject})` : ''}`}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Город"
                        size="small"
                        onChange={(e) => setCitySearch(e.target.value)}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#949cff',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#7c84f4',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#949cff',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: '#5f6388',
                                '&.Mui-focused': {
                                    color: '#949cff',
                                },
                            },
                        }}
                    />
                )}
                value={cities.find(c => c.id === cityId) || null}
                onChange={(_, newValue) => {
                    setCityId(newValue?.id || '');
                }}
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                sx={{ minWidth: 200 }}
            />

            {/* Применить */}
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleChangeFilters({
                    keyWords: search || undefined,
                    catId: categoryId || undefined,
                    cityId: cityId || undefined
                })}

            >
                Применить
            </Button>

            {/* Сброс */}
            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                const params = {
                    keyWords: undefined,
                    catId: undefined,
                    cityId: undefined
                };

                setSearch('');
                setCategoryId('');
                setCityId('');
                clearFilters();
                handleChangeFilters(params);
            }}

            >
                Сброс
            </Button>
        </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" color="#1c022c">
                    Все мероприятия
                </Typography>
            </Box>

            {/* Ошибки */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Список событий */}
            <Grid container spacing={3}>
                {events
                .map((event) => (
                    <Grid size={12} key={event.id}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer',
                                transition: 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                transform: 'scale(1.01)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                background: 'rgba(148, 156, 255, 0.01)',
                                }
                            }}
                            onClick={() => navigate(`/events/${event.id}`)} //TODO FIX
                        >
                            {/*</Card><Card sx={{ bgcolor: 'rgba(148, 156, 255, 0.3)' }}>*/}
                            {event.imagePath && (
                                <Box
                                    component="img"
                                    src={event.imagePath}
                                    alt={event.name}
                                    sx={{
                                        width: '100%',
                                        height: 200,
                                        objectFit: 'cover',
                                    }}
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            )}
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <Typography variant="h5" component="h2" gutterBottom>
                                        {event.name}
                                    </Typography>
                                </Box>
                                
                                <Typography color="text.secondary" paragraph>
                                    {event.description || 'Нет описания'}
                                </Typography>

                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="body2">
                                            📍 {event.address || 'Адрес не указан'}
                                        </Typography>
                                        <Typography variant="body2">
                                            📅 {event.eventDateTime 
                                                ? new Date(event.eventDateTime).toLocaleString() 
                                                : 'Дата не указана'}
                                        </Typography>
                                        <Typography variant="body2">
                                            🏷️ Категория: {event.eventCategory?.name || 'Не указана'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="body2">
                                            🏙️ Город: {event.city?.name || 'Не указан'}
                                        </Typography>
                                        <Typography variant="body2">
                                            ⭐ Баллы: {event.eventPoints || 0}
                                        </Typography>
                                        <Typography variant="body2">
                                            👥 Лимит: {event.participantsLimit || 'Не ограничено'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                {user?.role === 'volunteer' && (
                                    <Button 
                                        variant="contained"
                                        color="primary"
                                        sx={{ opacity: 0.9 }}
                                        onClick={(e) => {
                                        e.stopPropagation(); 
                                        handleRegister(event.id!);
                                        }}
                                    >
                                        Зарегистрироваться
                                    </Button>
                                )}
                                <Button 
                                    variant="contained"
                                    color="primary"
                                    sx={{ opacity: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        handleShowParticipants(event.id!);
                                    }}
                                >
                                    Участники
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Диалог с количеством участников */}
            <Dialog open={participantsDialogOpen} onClose={() => setParticipantsDialogOpen(false)}>
                <DialogTitle>Участники события</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Количество зарегистрированных участников: <strong>{participantsCount}</strong>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setParticipantsDialogOpen(false)}>Закрыть</Button>
                </DialogActions>
            </Dialog>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                    count={totalPages}
                    page={pageNumber}
                    onChange={(_, value) => setPageNumber(value)}
                    color="primary"
                />
            </Box>
        </Container>
    );
};