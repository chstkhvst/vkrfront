import React, { useEffect, useState, useContext } from 'react';
import { 
    Container, 
    Typography, 
    Card, 
    CardContent, 
    Box,
    Alert,
    CircularProgress,
    Grid,
    Pagination,
    Chip,
    Divider,
    TextField,
    Autocomplete,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from '@mui/material';
import {
  PendingOutlined as PendingIcon,
  CheckCircleOutline as ApprovedIcon,
  CancelOutlined as DeclinedIcon,
  EventBusy as CancelledIcon,
  EventAvailable as EndedIcon,
  Search,
  FilterList,
  FilterListOff,
} from '@mui/icons-material';
import { VolunteerEventContext } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';
import { CalendarToday, Category, LocationOn, Star } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export const CommunityEventsPage: React.FC = () => {
    const { user } = useAuth();
    const context = useContext(VolunteerEventContext);
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [cityId, setCityId] = useState<number | ''>('');
    const [citySearch, setCitySearch] = useState('');
    const [statusId, setStatusId] = useState<number | ''>('');
    const {
        communityEvents,
        isLoading,
        error,
        communityPageNumber,
        communityTotalPages,
        setCommunityPageNumber,
        eventCategories,
        cities,
        clearFilters,
    } = context!;

    useEffect(() => {
        context!.fetchCommunityEvents();
    }, [communityPageNumber]);

    useEffect(() => {
        const delay = setTimeout(() => {
            handleChangeFilters();
        }, 300);

        return () => clearTimeout(delay);
    }, [search]);

    if (isLoading && communityEvents.length === 0) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }
    const EVENT_STATUS = {
        ON_MODERATION: 1,
        APPROVED: 2,
        DECLINED: 3,
        CANCELLED: 4,
        ENDED: 5,
    };
    const getEventStatusIcon = (statusId: number | undefined) => {
        switch (statusId) {
        case EVENT_STATUS.ON_MODERATION:
            return <PendingIcon fontSize="small" />;
        case EVENT_STATUS.APPROVED:
            return <ApprovedIcon fontSize="small" />;
        case EVENT_STATUS.DECLINED:
            return <DeclinedIcon fontSize="small" />;
        case EVENT_STATUS.CANCELLED:
            return <CancelledIcon fontSize="small" />;
        case EVENT_STATUS.ENDED:
            return <EndedIcon fontSize="small" />;
        default:
            return undefined;
        }
    };
    const getEventStatusSx = (statusId: number | undefined) => {
      switch (statusId) {
        case EVENT_STATUS.ON_MODERATION:
          return { borderColor: '#ff9800', color: '#ff9800' };
        case EVENT_STATUS.APPROVED:
          return { borderColor: '#4caf50', color: '#4caf50' };
        case EVENT_STATUS.DECLINED:
          return { borderColor: '#f44336', color: '#f44336' };
        case EVENT_STATUS.CANCELLED:
          return { borderColor: '#5f6388', color: '#5f6388' };
        case EVENT_STATUS.ENDED:
          return { borderColor: '#5f6388', color: '#5f6388' };
        default:
          return { borderColor: '#949cff', color: '#949cff' };
      }
    };

    const filteredCities = [...cities].sort((a, b) => {
        const aNameMatch = a.name!.toLowerCase().includes(citySearch.toLowerCase());
        const bNameMatch = b.name!.toLowerCase().includes(citySearch.toLowerCase());

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
            return a.name!.localeCompare(b.name!);
    });

    const handleChangeFilters = (overrideParams?: any) => {
        const params = overrideParams ?? {
            keyWords: search || undefined,
            catId: categoryId || undefined,
            cityId: cityId || undefined,
            statusId: user?.role === "moderator" ? (statusId || undefined) : undefined
        };

        context!.setFilterParams(params);
        context!.fetchCommunityEvents(params);
    };
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
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center',  }}>
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
                            flex: '1 1 150px',
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
                    <FormControl size="small" sx={{ minWidth: 150, flex: '0 1 auto' }}>
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
                        sx={{ minWidth: 200, flex: '0 1 auto' }}
                    />
                    {/* статус ивента */}
                    {user?.role === "moderator" && (
                    <FormControl size="small" sx={{ minWidth: 150, flex: '0 1 auto' }}>
                        <InputLabel sx={{
                            color: '#5f6388',
                            '&.Mui-focused': {
                                color: '#949cff',
                            },
                        }}>Статус</InputLabel>
                        <Select
                            value={statusId}
                            label="Категория"
                            onChange={(e) => setStatusId(e.target.value as number)}
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
                        {context!.eventStatuses.map(status => 
                            ( <MenuItem key={status.id} value={status.id}> {status.eventStatusName} </MenuItem> ))}   
                        </Select>
                    </FormControl>
                    )}

                    {/* Применить */}
                    <Button
                        variant="contained"
                        startIcon={<FilterList />}
                        onClick={() => handleChangeFilters({
                            keyWords: search || undefined,
                            catId: categoryId || undefined,
                            cityId: cityId || undefined,
                            statusId: user?.role === "moderator" ? (statusId || undefined) : undefined
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
                                cityId: undefined,
                                statusId: undefined
                            };

                            setSearch('');
                            setCategoryId('');
                            setCityId('');
                            setStatusId('');
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
            <Typography variant="h4" sx={{ mb: 3 }}>
                Мероприятия волонтеров
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {communityEvents.map((event) => (
                    <Grid size={12} key={event.id}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'scale(1.01)',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                                }
                            }}
                            onClick={() => navigate(`/events/${event.id}`, { state: { isCommunity: true } })}
                        >
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
                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography
                                        variant="h5"
                                        component="h2"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#1c022c',
                                            flex: 1,
                                            pr: 2
                                        }}
                                    >
                                        {event.name}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        
                                        {event.eventCategory?.name && (
                                            <Chip
                                                icon={<Category sx={{ fontSize: 18 }} />}
                                                label={event.eventCategory.name}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(148, 156, 255, 0.1)',
                                                    fontWeight: 500,
                                                    border: '1px solid rgba(148, 156, 255, 0.3)'
                                                }}
                                            />
                                        )}

                                        {user?.role === "moderator" && event.eventStatus && (
                                            <Chip
                                                icon={getEventStatusIcon(event.eventStatus.id)}
                                                label={event.eventStatus.name}
                                                size="small"
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 500,
                                                    ...getEventStatusSx(event.eventStatus.id)
                                                }}
                                            />
                                        )}

                                    </Box>
                                </Box>

                                <Typography color="text.secondary" sx={{ mb: 2 }}>
                                    {event.description || 'Нет описания'}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LocationOn fontSize="small" />
                                        <Typography variant="body2">
                                            {event.address || 'Адрес не указан'}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CalendarToday fontSize="small" />
                                        <Typography variant="body2">
                                            {event.eventDateTime
                                                ? new Date(event.eventDateTime).toLocaleString()
                                                : 'Дата не указана'}
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
                    count={communityTotalPages}
                    page={communityPageNumber}
                    onChange={(_, value) => setCommunityPageNumber(value)}
                />
            </Box>
        </Container>
    );
};