import React, { useEffect, useState, useContext } from 'react';
import { 
    Container, 
    Typography, 
    Button, 
    Card, 
    CardContent, 
    CardActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Alert,
    CircularProgress,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { VolunteerEventContext } from '../context/EventContext';
import { CreateVolunteerEventDTO } from '../client/apiClient';

export const EventsListPage: React.FC = () => {
    const context = useContext(VolunteerEventContext);
    
    // Состояния для диалогов
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [participantsCount, setParticipantsCount] = useState<number>(0);
    
    // Состояния для формы создания
    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        categoryId: '',
        cityId: '',
        address: '',
        eventDateTime: '',
        eventPoints: 10,
        participantsLimit: ''
    });

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
                    Ошибка: Контекст не найден. Оберните компонент в VolunteerEventProvider.
                </Typography>
            </Container>
        );
    }

    const {
        filteredEvents,
        eventCategories,
        cities,
        isLoading,
        error,
        fetchEvents,
        createEvent,
        deleteEvent,
        registerForEvent,
        getParticipantsCount
    } = context;

    const handleCreateEvent = async () => {
        if (!newEvent.name || !newEvent.categoryId || !newEvent.cityId) {
            alert('Пожалуйста, заполните обязательные поля');
            return;
        }

        const eventData = new CreateVolunteerEventDTO();
        eventData.name = newEvent.name;
        eventData.description = newEvent.description || undefined;
        eventData.eventCategoryId = Number(newEvent.categoryId);
        eventData.cityId = Number(newEvent.cityId);
        eventData.address = newEvent.address || undefined;
        eventData.eventDateTime = newEvent.eventDateTime ? new Date(newEvent.eventDateTime) : new Date();
        eventData.eventPoints = newEvent.eventPoints;
        eventData.participantsLimit = newEvent.participantsLimit ? Number(newEvent.participantsLimit) : undefined;

        const result = await createEvent(eventData);
        if (result) {
            setCreateDialogOpen(false);
            setNewEvent({
                name: '',
                description: '',
                categoryId: '',
                cityId: '',
                address: '',
                eventDateTime: '',
                eventPoints: 10,
                participantsLimit: ''
            });
        }
    };

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
                    onClick={() => setCreateDialogOpen(true)}
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

            {/* Диалог создания события */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Создать новое событие</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Название *"
                            fullWidth
                            value={newEvent.name}
                            onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                        />
                        
                        <TextField
                            label="Описание"
                            fullWidth
                            multiline
                            rows={3}
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Категория *</InputLabel>
                            <Select
                                value={newEvent.categoryId}
                                label="Категория *"
                                onChange={(e) => setNewEvent({...newEvent, categoryId: e.target.value})}
                            >
                                {eventCategories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.categoryName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Город *</InputLabel>
                            <Select
                                value={newEvent.cityId}
                                label="Город *"
                                onChange={(e) => setNewEvent({...newEvent, cityId: e.target.value})}
                            >
                                {cities.map(city => (
                                    <MenuItem key={city.id} value={city.id}>
                                        {city.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Адрес"
                            fullWidth
                            value={newEvent.address}
                            onChange={(e) => setNewEvent({...newEvent, address: e.target.value})}
                        />

                        <TextField
                            label="Дата и время"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={newEvent.eventDateTime}
                            onChange={(e) => setNewEvent({...newEvent, eventDateTime: e.target.value})}
                        />

                        <TextField
                            label="Баллы"
                            type="number"
                            fullWidth
                            value={newEvent.eventPoints}
                            onChange={(e) => setNewEvent({...newEvent, eventPoints: Number(e.target.value)})}
                        />

                        <TextField
                            label="Лимит участников (оставьте пустым если нет лимита)"
                            type="number"
                            fullWidth
                            value={newEvent.participantsLimit}
                            onChange={(e) => setNewEvent({...newEvent, participantsLimit: e.target.value})}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Отмена</Button>
                    <Button onClick={handleCreateEvent} variant="contained" color="primary">
                        Создать
                    </Button>
                </DialogActions>
            </Dialog>

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