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
    DialogActions
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { VolunteerEventContext } from '../context/EventContext';

export const EventsListPage: React.FC = () => {
    const context = useContext(VolunteerEventContext);
    
    // Состояния для диалогов
    const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [participantsCount, setParticipantsCount] = useState<number>(0);

    useEffect(() => {
        if (context) {
            context.fetchEvents();
            context.fetchEventCategories();
            context.fetchCities();
            context.fetchEventStatuses();
            context.fetchAttendanceStatuses();
        }
    }, []);

    if (!context) {
        return (
            <Container>
                <Typography color="error">
                    Ошибка: Контекст не найден
                </Typography>
            </Container>
        );
    }

    const {
        filteredEvents,
        isLoading,
        error,
        deleteEvent,
        registerForEvent,
        getParticipantsCount
    } = context;

    const handleDeleteEvent = async (id: number) => {
        if (window.confirm('Вы уверены, что хотите удалить это событие?')) {
            await deleteEvent(id);
        }
    };

    const handleRegister = async (eventId: number) => {
        const testUserId = "test-user-123";
        const success = await registerForEvent(eventId, testUserId);
        if (success) {
            alert('Вы успешно зарегистрированы на событие!');
        }
    };

    const handleShowParticipants = async (eventId: number) => {
        const count = await getParticipantsCount(eventId);
        setParticipantsCount(count);
        setSelectedEventId(eventId);
        setParticipantsDialogOpen(true);
    };

    if (isLoading && filteredEvents.length === 0) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Заголовок и кнопка создания */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Список событий
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    component={RouterLink}
                    to="/events/add"
                >
                    Создать событие
                </Button>
            </Box>

            {/* Ошибки */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Список событий */}
            <Grid container spacing={3}>
                {filteredEvents.map((event) => (
                    <Grid size={12} key={event.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <Typography variant="h5" component="h2" gutterBottom>
                                        {event.name}
                                    </Typography>
                                    <Button 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleDeleteEvent(event.id!)}
                                    >
                                        Удалить
                                    </Button>
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
                            
                            <CardActions>
                                <Button 
                                    size="small" 
                                    color="success"
                                    onClick={() => handleRegister(event.id!)}
                                >
                                    Зарегистрироваться
                                </Button>
                                <Button 
                                    size="small" 
                                    color="info"
                                    onClick={() => handleShowParticipants(event.id!)}
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
        </Container>
    );
};