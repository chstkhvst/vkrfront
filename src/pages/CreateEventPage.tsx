import React, { useState, useContext, useRef  } from 'react';
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
import { MapPicker } from "../components/MapPicker";
import { useNotification } from '../components/Notification';
import { useAuth } from '../context/AuthContext';

export const CreateEventPage: React.FC = () => {
    const { userRole } = useAuth();
    const mode = userRole === 'organizer' ? 'organization' : 'volunteer';
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

    const { showNotification } = useNotification();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [image, setImage] = useState<File | undefined>(undefined);
    const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
    const [coords, setCoords] = useState<{
        lat: number | null;
        lng: number | null;
    }>({
        lat: null,
        lng: null
    });
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const debounceRef = useRef<any>(null);

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
        createEvent,
        geocode,
        reverseGeocode
    } = context;

    const filteredCities = [...cities].sort((a, b) => {
        const aNameMatch = a.name!.toLowerCase().includes(citySearch.toLowerCase());
        const bNameMatch = b.name!.toLowerCase().includes(citySearch.toLowerCase());

        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        return a.name!.localeCompare(b.name!);
    });

    const handleSearch = (value: string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            if (!value) return;

            const data = await geocode(value);
            setSuggestions(data);
        }, 600);
    };

    const handleMapLocationSelect = async (lat: number, lng: number) => {
        console.log("CLICK", lat, lng);

        const result = await reverseGeocode(lat, lng);
        console.log("REVERSE RESULT", result);
        if (!result) return;
        const option = {
            lat: result.lat,
            lon: result.lon,
            display_name: result.display_name
        };

        setSelectedAddress(option);

        setNewEvent(prev => ({
            ...prev,
            address: result.display_name || ""
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEvent.name || !newEvent.address || !newEvent.categoryId || !newEvent.cityId || !coords.lat || !coords.lng) {
            setErrorMessage('Пожалуйста, заполните обязательные поля');
            return;
        }

        setSubmitting(true);
        setErrorMessage('');

        const eventData = {
            name: newEvent.name,
            description: newEvent.description || '',
            lat: (coords.lat).toString(),
            lng: coords.lng.toString(),
            address: newEvent.address || '',
            eventDateTime: newEvent.eventDateTime
                ? new Date(newEvent.eventDateTime)
                : new Date(),
            eventPoints: mode === "organization" ? newEvent.eventPoints : 0,
            participantsLimit: newEvent.participantsLimit
                ? Number(newEvent.participantsLimit)
                : 0,
            eventCategoryId: Number(newEvent.categoryId),
            cityId: Number(newEvent.cityId),
            image: image
        };

        const result = await createEvent(eventData);

        if (result) {
            console.log(result);
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
            showNotification('Ваша заявка отправлена на модерацию. Подробности в разделе "Мои мероприятия"', 'info');
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
                <Typography variant="h4">
                    {mode === "organization"
                        ? "Добавить мероприятие"
                        : "Предложить инициативу"}
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

                        <Autocomplete
                            options={suggestions}
                            value={selectedAddress}
                            getOptionLabel={(option) => option.display_name || ""}
                            isOptionEqualToValue={(option, value) =>
                                option.lat === value.lat && option.lon === value.lon
                            }
                            onInputChange={(_, value, reason) => {
                                if (reason === "input") {
                                    handleSearch(value);
                                }
                            }}

                            onChange={(_, value) => {
                                if (!value) return;

                                const lat = parseFloat(value.lat);
                                const lng = parseFloat(value.lon);

                                setCoords({ lat, lng });
                                setSelectedAddress(value);

                                setNewEvent({
                                    ...newEvent,
                                    address: value.display_name
                                });
                            }}

                            renderInput={(params) => (
                                <TextField {...params} label="Поиск адреса" fullWidth />
                            )}
                        />
                        <Box sx={{ height: 300, mt: 2, borderRadius: 2, overflow: "hidden" }}>
                            <MapPicker 
                                coords={coords} 
                                setCoords={setCoords}
                                onLocationSelect={handleMapLocationSelect}
                            />
                        </Box>

                        <TextField
                            label="Дата и время"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={newEvent.eventDateTime}
                            onChange={(e) => setNewEvent({...newEvent, eventDateTime: e.target.value})}
                        />

                        {mode === "organization" && (
                            <TextField
                                label="Баллы"
                                type="number"
                                fullWidth
                                value={newEvent.eventPoints}
                                onChange={(e) =>
                                    setNewEvent({ ...newEvent, eventPoints: Number(e.target.value) })
                                }
                            />
                        )}

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