import React, { useState, useContext, useRef } from 'react';
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
    Link,
    FormHelperText,
    Tooltip,
    IconButton
} from '@mui/material';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import { VolunteerEventContext } from '../context/EventContext';
import { Autocomplete } from '@mui/material';
import { MapPicker } from "../components/MapPicker";
import { useNotification } from '../components/Notification';
import { useAuth } from '../context/AuthContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export const CreateEventPage: React.FC = () => {
    const { userRole } = useAuth();
    const mode = userRole === 'organizer' ? 'organizer' : 'volunteer';
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
    
    // Состояния для валидации полей
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        categoryId: '',
        cityId: '',
        eventDateTime: '',
        eventPoints: '',
        participantsLimit: ''
    });

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

    // Функции валидации
    const validateName = (name: string): string => {
        if (!name.trim()) return 'Название обязательно для заполнения';
        if (name.length < 3) return 'Название должно содержать минимум 3 символа';
        if (name.length > 100) return 'Название не должно превышать 100 символов';
        return '';
    };

    const validateEventDate = (dateTime: string): string => {
        if (!dateTime) return 'Дата и время обязательны для заполнения';
        
        const selectedDate = new Date(dateTime);
        const now = new Date();
        
        if (isNaN(selectedDate.getTime())) return 'Укажите корректную дату и время';
        
        // Очищаем время для сравнения только дат
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const eventDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        
        if (eventDay < today) return 'Дата мероприятия не может быть раньше сегодняшнего дня';
        
        return '';
    };

    const validateEventPoints = (points: number): string => {
        if (mode !== 'organizer') return '';
        
        if (isNaN(points)) return 'Баллы должны быть числом';
        if (points < 10) return 'Минимальное количество баллов - 10';
        if (points > 100) return 'Максимальное количество баллов - 100';
        if (!Number.isInteger(points)) return 'Баллы должны быть целым числом';
        return '';
    };

    const validateParticipantsLimit = (limit: string): string => {
        if (!limit || limit === '') return 'Лимит участников обязателен для заполнения';
        
        const numLimit = Number(limit);
        if (isNaN(numLimit)) return 'Лимит должен быть числом';
        if (!Number.isInteger(numLimit)) return 'Лимит должен быть целым числом';
        if (numLimit < 1) return 'Лимит участников должен быть не менее 1';
        if (numLimit > 200) return 'Лимит участников не может превышать 200';
        return '';
    };

    const validateCategory = (categoryId: string): string => {
        if (!categoryId) return 'Выберите категорию мероприятия';
        return '';
    };

    const validateCity = (cityId: string): string => {
        if (!cityId) return 'Выберите город проведения';
        return '';
    };

    // Валидация всех полей перед отправкой
    const validateAllFields = (): boolean => {
        const errors = {
            name: validateName(newEvent.name),
            categoryId: validateCategory(newEvent.categoryId),
            cityId: validateCity(newEvent.cityId),
            eventDateTime: validateEventDate(newEvent.eventDateTime),
            eventPoints: validateEventPoints(newEvent.eventPoints),
            participantsLimit: validateParticipantsLimit(newEvent.participantsLimit)
        };
        
        setFieldErrors(errors);
        
        // Проверяем координаты и адрес
        if (!coords.lat || !coords.lng) {
            setErrorMessage('Пожалуйста, укажите местоположение на карте');
            return false;
        }
        
        if (!newEvent.address) {
            setErrorMessage('Пожалуйста, укажите адрес проведения');
            return false;
        }
        
        // Проверяем, есть ли ошибки
        const hasErrors = Object.values(errors).some(error => error !== '');
        
        if (hasErrors) {
            const firstError = Object.values(errors).find(error => error !== '');
            setErrorMessage(firstError || 'Пожалуйста, исправьте ошибки в форме');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateAllFields()) {
            return;
        }

        setSubmitting(true);
        setErrorMessage('');

        const eventData = {
            name: newEvent.name.trim(),
            description: newEvent.description || '',
            lat: (coords.lat as number).toString(),  
            lng: (coords.lng as number).toString(), 
            address: newEvent.address || '',
            eventDateTime: newEvent.eventDateTime
                ? new Date(newEvent.eventDateTime)
                : new Date(),
            eventPoints: mode === "organizer" ? newEvent.eventPoints : 0,
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

    const handleNameChange = (value: string) => {
        setNewEvent({...newEvent, name: value});
        setFieldErrors({...fieldErrors, name: validateName(value)});
    };

    const handleDateChange = (value: string) => {
        setNewEvent({...newEvent, eventDateTime: value});
        setFieldErrors({...fieldErrors, eventDateTime: validateEventDate(value)});
    };

    const handlePointsChange = (value: number) => {
        setNewEvent({...newEvent, eventPoints: value});
        setFieldErrors({...fieldErrors, eventPoints: validateEventPoints(value)});
    };

    const handleLimitChange = (value: string) => {
        setNewEvent({...newEvent, participantsLimit: value});
        setFieldErrors({...fieldErrors, participantsLimit: validateParticipantsLimit(value)});
    };

    const handleCategoryChange = (value: string) => {
        setNewEvent({...newEvent, categoryId: value});
        setFieldErrors({...fieldErrors, categoryId: validateCategory(value)});
    };

    const handleCityChange = (value: string) => {
        setNewEvent({...newEvent, cityId: value});
        setFieldErrors({...fieldErrors, cityId: validateCity(value)});
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    {mode === "organizer"
                        ? "Добавить мероприятие"
                        : "Предложить инициативу"}
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
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file && file.size > 5 * 1024 * 1024) {
                                        setErrorMessage('Размер изображения не должен превышать 5MB');
                                        return;
                                    }
                                    if (file && !file.type.startsWith('image/')) {
                                        setErrorMessage('Пожалуйста, загрузите изображение');
                                        return;
                                    }
                                    setImage(file);
                                    setErrorMessage('');
                                }}
                            />
                        </Button>
                        
                        <TextField
                            label="Название"
                            fullWidth
                            required
                            value={newEvent.name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            error={!!fieldErrors.name}
                        />
                        
                        <TextField
                            label="Описание"
                            fullWidth
                            multiline
                            rows={4}
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                            helperText="Расскажите подробнее о мероприятии (необязательно)"
                        />

                        <FormControl fullWidth required error={!!fieldErrors.categoryId}>
                            <InputLabel>Категория</InputLabel>
                            <Select
                                value={newEvent.categoryId}
                                label="Категория"
                                onChange={(e) => handleCategoryChange(e.target.value)}
                            >
                                {eventCategories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.categoryName}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fieldErrors.categoryId && (
                                <FormHelperText>{fieldErrors.categoryId}</FormHelperText>
                            )}
                        </FormControl>

                        <FormControl fullWidth required error={!!fieldErrors.cityId}>
                            <Autocomplete
                                options={filteredCities}
                                getOptionLabel={(option) => `${option.name}${option.subject ? ` (${option.subject})` : ''}`}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Город"
                                        required
                                        error={!!fieldErrors.cityId}
                                    />
                                )}
                                value={cities.find(c => c.id === Number(newEvent.cityId)) || null}
                                onChange={(_, newValue) => {
                                    handleCityChange(newValue?.id?.toString() || '');
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value?.id}
                                onInputChange={(_, value) => {
                                    setCitySearch(value);
                                }}
                            />
                            {fieldErrors.cityId && (
                                <FormHelperText>{fieldErrors.cityId}</FormHelperText>
                            )}
                        </FormControl>

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
                                console.log("AUTOCOMPLETE SELECT", { lat, lng });
                                setCoords({ lat, lng });
                                setSelectedAddress(value);

                                setNewEvent({
                                    ...newEvent,
                                    address: value.display_name
                                });
                            }}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="Поиск адреса" 
                                    fullWidth 
                                    required
                                    helperText="Начните вводить адрес или выберите на карте ниже"
                                />
                            )}
                        />
                        <Box sx={{ height: 300, mt: 2, borderRadius: 2, overflow: "hidden" }}>
                            <MapPicker 
                                coords={coords} 
                                setCoords={setCoords}
                                onLocationSelect={handleMapLocationSelect}
                            />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            * Кликните по карте, чтобы указать точное местоположение
                        </Typography>

                        <TextField
                            label="Дата и время"
                            type="datetime-local"
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            value={newEvent.eventDateTime}
                            onChange={(e) => handleDateChange(e.target.value)}
                            error={!!fieldErrors.eventDateTime}
                            helperText={fieldErrors.eventDateTime || 'Выберите дату и время проведения мероприятия'}
                        />

                        {mode === "organizer" && (
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <TextField
                                        label="Баллы *"
                                        type="number"
                                        fullWidth
                                        required
                                        value={newEvent.eventPoints}
                                        onChange={(e) => handlePointsChange(Number(e.target.value))}
                                        error={!!fieldErrors.eventPoints}
                                        inputProps={{ step: 1, min: 10, max: 100 }}
                                    />
                                    <Tooltip title="Оцените стоимость участия в мероприятии от 10 до 100 баллов. Значение может быть скорректировано модератором" arrow>
                                        <IconButton size="small">
                                            <HelpOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                {fieldErrors.eventPoints ? (
                                    <FormHelperText error>{fieldErrors.eventPoints}</FormHelperText>
                                ) : (
                                    <FormHelperText>
                                        Оцените стоимость участия в мероприятии от 10 до 100 баллов. Значение может быть скорректировано модератором
                                    </FormHelperText>
                                )}
                            </Box>
                        )}

                        <TextField
                            label="Лимит участников"
                            type="number"
                            fullWidth
                            required
                            value={newEvent.participantsLimit}
                            onChange={(e) => handleLimitChange(e.target.value)}
                            error={!!fieldErrors.participantsLimit}
                            helperText={fieldErrors.participantsLimit || 'Укажите лимит участников (от 1 до 200)'}
                            inputProps={{ min: 1, max: 200, step: 1 }}
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