import React, { useState, useContext } from 'react';
import {
    Container,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Alert,
    Paper,
    Breadcrumbs,
    Link
} from '@mui/material';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { VolunteerEventContext } from '../context/EventContext';
import { Autocomplete } from '@mui/material';

export const CreateEventPage: React.FC = () => {
    const context = useContext(VolunteerEventContext);
    
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
    
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [image, setImage] = useState<File | undefined>(undefined);

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
        eventCategories,
        cities,
        createEvent
    } = context;

    const filteredCities = [...cities].sort((a, b) => {
        const aNameMatch = a.name!.toLowerCase().includes(citySearch.toLowerCase());
        const bNameMatch = b.name!.toLowerCase().includes(citySearch.toLowerCase());

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        return a.name!.localeCompare(b.name!);
    });

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEvent.name || !newEvent.categoryId || !newEvent.cityId) {
        setErrorMessage('Пожалуйста, заполните обязательные поля');
        return;
    }

    setSubmitting(true);
    setErrorMessage('');

    const eventData = {
        name: newEvent.name,
        description: newEvent.description || '',
        lat: 0, // TODO FIX
        lng: 0,
        address: newEvent.address || '',
        eventDateTime: newEvent.eventDateTime
            ? new Date(newEvent.eventDateTime)
            : new Date(),
        eventPoints: newEvent.eventPoints,
        participantsLimit: newEvent.participantsLimit
            ? Number(newEvent.participantsLimit)
            : 0,
        eventCategoryId: Number(newEvent.categoryId),
        cityId: Number(newEvent.cityId),
        image: image
    };

    const result = await createEvent(eventData);

    if (result) {
        setSuccess(true);
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
        setImage(undefined);
    } else {
        setErrorMessage('Ошибка при создании события');
    }

    setSubmitting(false);
    };

    if (success) {
        return <Navigate to="/events" replace />;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link component={RouterLink} to="/" color="inherit">
                    Главная
                </Link>
                <Link component={RouterLink} to="/events" color="inherit">
                    События
                </Link>
                <Typography color="text.primary">Создание события</Typography>
            </Breadcrumbs>

            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Создать новое событие
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Заполните информацию о событии
                </Typography>

                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {errorMessage}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Button variant="outlined" component="label">
                            {image ? `Файл: ${image.name}` : "Загрузить изображение"}
                            <input
                                type="file"
                                hidden
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    setImage(file);
                                }}
                            />
                        </Button>
                        <TextField
                            label="Название"
                            fullWidth
                            required
                            value={newEvent.name}
                            onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
                        />
                        
                        <TextField
                            label="Описание"
                            fullWidth
                            multiline
                            rows={4}
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Категория</InputLabel>
                            <Select
                                value={newEvent.categoryId}
                                label="Категория"
                                onChange={(e) => setNewEvent({...newEvent, categoryId: e.target.value})}
                            >
                                {eventCategories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.categoryName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Autocomplete
                            options={filteredCities}
                            getOptionLabel={(option) => `${option.name}${option.subject ? ` (${option.subject})` : ''}`}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Город"
                                    required
                                    onChange={(e) => setCitySearch(e.target.value)}
                                />
                            )}
                            value={cities.find(c => c.id === Number(newEvent.cityId)) || null}
                            onChange={(_, newValue) => {
                                setNewEvent({...newEvent, cityId: newValue?.id?.toString() || ''});
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                        />

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
                            label="Лимит участников (при наличии)"
                            type="number"
                            fullWidth
                            value={newEvent.participantsLimit}
                            onChange={(e) => setNewEvent({...newEvent, participantsLimit: e.target.value})}
                        />

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                            <Button 
                                component={RouterLink}
                                to="/events"
                                variant="outlined"
                            >
                                Отмена
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="primary"
                                disabled={submitting}
                            >
                                {submitting ? 'Создание...' : 'Создать событие'}
                            </Button>
                        </Box>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};