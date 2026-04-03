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
    Autocomplete,  
    Chip,
    Divider
} from '@mui/material';
import { VolunteerEventContext } from '../context/EventContext';
import { AttendanceContext } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../components/Notification';
import { useNavigate } from 'react-router-dom';
import { CalendarToday, Category, FilterList, FilterListOff, LocationOn, Search, Star } from '@mui/icons-material';

export const EventsListPage: React.FC = () => {
    const context = useContext(VolunteerEventContext);
    const { user, isLoading: authLoading } = useAuth(); 
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    
    // Состояния для диалогов
    const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
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
        clearFilters,

        setPageNumber,  
    } = context!;
    
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

        if (user?.role != "moderator") {
            context!.fetchEventsForUser(params);
        } else {
            context!.fetchEvents(params);
        }
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
                        <Card 
                elevation={0} 
                sx={{ 
                    mb: 4, 
                    p: 3, 
                    background: 'linear-gradient(135deg, rgba(148, 156, 255, 0.05) 0%, rgba(124, 132, 244, 0.05) 100%)',
                    border: '1px solid rgba(148, 156, 255, 0.2)',
                    borderRadius: 3
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Поиск */}
                    <TextField
                        label="Поиск"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        size="small"
                        InputProps={{
                            startAdornment: <Search sx={{ mr: 1, color: '#949cff' }} fontSize="small" />
                        }}
                        sx={{
                            flex: '1 1 250px',
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'white',
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
                    <FormControl size="small" sx={{ minWidth: 180, flex: '0 1 auto' }}>
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
                                bgcolor: 'white',
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
                                        bgcolor: 'white',
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
                        sx={{ minWidth: 220, flex: '0 1 auto' }}
                    />

                    {/* Применить */}
                    <Button
                        variant="contained"
                        startIcon={<FilterList />}
                        onClick={() => handleChangeFilters({
                            keyWords: search || undefined,
                            catId: categoryId || undefined,
                            cityId: cityId || undefined
                        })}
                        sx={{
                            bgcolor: '#949cff',
                            '&:hover': {
                                bgcolor: '#7c84f4',
                            },
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        Применить
                    </Button>

                    {/* Сброс */}
                    <Button
                        variant="outlined"
                        startIcon={<FilterListOff />}
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
                        sx={{
                            borderColor: '#949cff',
                            color: '#949cff',
                            '&:hover': {
                                borderColor: '#7c84f4',
                                bgcolor: 'rgba(148, 156, 255, 0.05)',
                            },
                            textTransform: 'none'
                        }}
                    >
                        Сброс
                    </Button>
                </Box>
            </Card>
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
                            onClick={() => navigate(`/events/${event.id}`)} 
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
                                                            <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                        <Typography variant="h5" component="h2" sx={{ 
                                            fontWeight: 600,
                                            color: '#1c022c',
                                            flex: 1
                                        }}>
                                            {event.name}
                                        </Typography>
                                        {event.eventCategory?.name && (
                                            <Chip 
                                                icon={<Category sx={{ fontSize: 18 }} />}
                                                label={event.eventCategory.name} 
                                                size="small"
                                                sx={{ 
                                                    ml: 2,
                                                    bgcolor: 'rgba(148, 156, 255, 0.1)',
                                                    color: '#949cff',
                                                    fontWeight: 500,
                                                    border: '1px solid rgba(148, 156, 255, 0.3)'
                                                }}
                                            />
                                        )}
                                    </Box>
                                    
                                    <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                                        {event.description || 'Нет описания'}
                                    </Typography>

                                    <Divider sx={{ my: 2, borderColor: 'rgba(148, 156, 255, 0.1)' }} />

                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 3, 
                                        flexWrap: 'wrap',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <LocationOn sx={{ fontSize: 20, color: '#949cff' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {event.address || 'Адрес не указан'}
                                                </Typography>
                                            </Box>
                                            
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CalendarToday sx={{ fontSize: 20, color: '#949cff' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {event.eventDateTime 
                                                        ? new Date(event.eventDateTime).toLocaleString('ru-RU', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : 'Дата не указана'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1,
                                            bgcolor: 'rgba(255, 215, 0, 0.1)',
                                            px: 2,
                                            py: 1,
                                            borderRadius: 2,
                                            border: '1px solid rgba(255, 215, 0, 0.3)'
                                        }}>
                                            <Star sx={{ fontSize: 22, color: '#FFD700' }} />
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1c022c' }}>
                                                {event.eventPoints || 0}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                баллов
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>                                                        
                        </Card>
                    </Grid>
                ))}
            </Grid>
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