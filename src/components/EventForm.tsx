import React, { useState, useRef, useEffect, useContext } from 'react';
import {
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Alert,
    Paper,
    FormHelperText,
    Tooltip,
    IconButton,
    Typography
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { MapPicker } from "../components/MapPicker";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useNotification } from '../components/Notification';

export interface EventFormData {
    name: string;
    description: string;
    categoryId: string;
    cityId: string;
    address: string;
    eventDateTime: string;
    eventPoints: number;
    participantsLimit: string;
}

export interface EventFormProps {
    mode: 'organizer' | 'volunteer' | 'edit';
    initialData?: Partial<EventFormData>;
    initialImage?: File;
    initialCoords?: { lat: number | null; lng: number | null };
    initialSelectedAddress?: any | null;
    eventCategories: any[];
    cities: any[];
    geocode: (value: string) => Promise<any[]>;
    reverseGeocode: (lat: number, lng: number) => Promise<any>;
    onSubmit: (data: {
        eventData: any;
        image: File | undefined;
        coords: { lat: number | null; lng: number | null };
    }) => Promise<boolean>;
    submitting: boolean;
    submitButtonText: string;
    submittingButtonText: string;
    title: string;
    onCancel: () => void;
    disabledFields?: string[]; // поля, которые нужно отключить в режиме редактирования
}

export const EventForm: React.FC<EventFormProps> = ({
    mode,
    initialData = {},
    initialImage,
    initialCoords = { lat: null, lng: null },
    initialSelectedAddress = null,
    eventCategories,
    cities,
    geocode,
    reverseGeocode,
    onSubmit,
    submitting,
    submitButtonText,
    submittingButtonText,
    title,
    onCancel,
    disabledFields = []
}) => {
    const [formData, setFormData] = useState<EventFormData>({
        name: initialData.name || '',
        description: initialData.description || '',
        categoryId: initialData.categoryId || '',
        cityId: initialData.cityId || '',
        address: initialData.address || '',
        eventDateTime: initialData.eventDateTime || '',
        eventPoints: initialData.eventPoints || 10,
        participantsLimit: initialData.participantsLimit || ''
    });
    const { showNotification } = useNotification();
    const [errorMessage, setErrorMessage] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [image, setImage] = useState<File | undefined>(initialImage);
    const [selectedAddress, setSelectedAddress] = useState<any | null>(initialSelectedAddress);
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState<{
        lat: number | null;
        lng: number | null;
    }>(initialCoords);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    
    const debounceRef = useRef<any>(null);
    
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        categoryId: '',
        cityId: '',
        eventDateTime: '',
        eventPoints: '',
        participantsLimit: ''
    });

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
            if (!value.trim()) {
                setSuggestions([]);
                setOpen(false);
                return;
            }

            const data = await geocode(value);
            setSuggestions(data);
            if (data.length > 0) {
                setOpen(true);
            }
        }, 600);
    };

    const handleMapLocationSelect = async (lat: number, lng: number) => {
        try {
            console.log("CLICK", lat, lng);

            const result = await reverseGeocode(lat, lng);

            if (!result) return;

            const option = {
                lat: result.lat,
                lon: result.lon,
                display_name: result.display_name
            };

            setSelectedAddress(option);

            setFormData(prev => ({
                ...prev,
                address: result.display_name || ""
            }));

        } catch (err: any) {
            console.error("REVERSE ERROR", err);

            if (err?.status === 400) {
                if (err?.response?.includes("Location must be within Russia")) {
                    showNotification("Можно выбирать только локации в пределах РФ", "error");
                } else {
                    showNotification("Некорректная локация", "error");
                }
            } else {
                showNotification("Ошибка сервера", "error");
            }
        }
    };

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

    const validateAllFields = (): boolean => {
        const errors = {
            name: validateName(formData.name),
            categoryId: validateCategory(formData.categoryId),
            cityId: validateCity(formData.cityId),
            eventDateTime: validateEventDate(formData.eventDateTime),
            eventPoints: validateEventPoints(formData.eventPoints),
            participantsLimit: validateParticipantsLimit(formData.participantsLimit)
        };
        
        setFieldErrors(errors);
        
        if (!coords.lat || !coords.lng) {
            setErrorMessage('Пожалуйста, укажите местоположение на карте');
            return false;
        }
        
        if (!formData.address) {
            setErrorMessage('Пожалуйста, укажите адрес проведения');
            return false;
        }
        
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

        setErrorMessage('');

        const eventData = {
            name: formData.name.trim(),
            description: formData.description || '',
            lat: (coords.lat as number).toString(),
            lng: (coords.lng as number).toString(),
            address: formData.address || '',
            eventDateTime: formData.eventDateTime
                ? new Date(formData.eventDateTime)
                : new Date(),
            eventPoints: mode === "organizer" ? formData.eventPoints : 0,
            participantsLimit: formData.participantsLimit
                ? Number(formData.participantsLimit)
                : 0,
            eventCategoryId: Number(formData.categoryId),
            cityId: Number(formData.cityId),
        };

        const success = await onSubmit({
            eventData,
            image,
            coords
        });

        if (!success) {
            setErrorMessage('Ошибка при сохранении события');
        }
    };

    const handleNameChange = (value: string) => {
        setFormData({...formData, name: value});
        setFieldErrors({...fieldErrors, name: validateName(value)});
    };

    const handleDateChange = (value: string) => {
        setFormData({...formData, eventDateTime: value});
        setFieldErrors({...fieldErrors, eventDateTime: validateEventDate(value)});
    };

    const handlePointsChange = (value: number) => {
        setFormData({...formData, eventPoints: value});
        setFieldErrors({...fieldErrors, eventPoints: validateEventPoints(value)});
    };

    const handleLimitChange = (value: string) => {
        setFormData({...formData, participantsLimit: value});
        setFieldErrors({...fieldErrors, participantsLimit: validateParticipantsLimit(value)});
    };

    const handleCategoryChange = (value: string) => {
        setFormData({...formData, categoryId: value});
        setFieldErrors({...fieldErrors, categoryId: validateCategory(value)});
    };

    const handleCityChange = (value: string) => {
        setFormData({...formData, cityId: value});
        setFieldErrors({...fieldErrors, cityId: validateCity(value)});
    };

    const isFieldDisabled = (fieldName: string) => {
        return disabledFields.includes(fieldName);
    };

    return (
        <Paper sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {mode !== "edit" && (
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
                    )}
                    
                    <TextField
                        label="Название"
                        fullWidth
                        required
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        error={!!fieldErrors.name}
                        helperText={fieldErrors.name}
                        disabled={isFieldDisabled('name')}
                    />
                    
                    <TextField
                        label="Описание"
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        helperText="Расскажите подробнее о мероприятии (необязательно)"
                        disabled={isFieldDisabled('description')}
                    />

                    <FormControl fullWidth required error={!!fieldErrors.categoryId} disabled={isFieldDisabled('categoryId')}>
                        <InputLabel>Категория</InputLabel>
                        <Select
                            value={formData.categoryId}
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

                    <FormControl fullWidth required error={!!fieldErrors.cityId} disabled={isFieldDisabled('cityId')}>
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
                            value={cities.find(c => c.id === Number(formData.cityId)) || null}
                            onChange={(_, newValue) => {
                                handleCityChange(newValue?.id?.toString() || '');
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                            onInputChange={(_, value) => {
                                setCitySearch(value);
                            }}
                            disabled={isFieldDisabled('cityId')}
                        />
                        {fieldErrors.cityId && (
                            <FormHelperText>{fieldErrors.cityId}</FormHelperText>
                        )}
                    </FormControl>

                    <Autocomplete
                        open={open}
                        onOpen={() => setOpen(true)}
                        onClose={() => setOpen(false)}
                        filterOptions={(x) => x}
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

                            setFormData({
                                ...formData,
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
                        disabled={isFieldDisabled('address')}
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
                        value={formData.eventDateTime}
                        onChange={(e) => handleDateChange(e.target.value)}
                        error={!!fieldErrors.eventDateTime}
                        helperText={fieldErrors.eventDateTime || 'Выберите дату и время проведения мероприятия'}
                        disabled={isFieldDisabled('eventDateTime')}
                    />

                    {mode === "organizer" && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TextField
                                    label="Баллы"
                                    type="number"
                                    fullWidth
                                    required
                                    value={formData.eventPoints.toString()}
                                    onChange={(e) => handlePointsChange(Number(e.target.value))}
                                    error={!!fieldErrors.eventPoints}
                                    inputProps={{ step: 1, min: 10, max: 100 }}
                                    disabled={isFieldDisabled('eventPoints')}
                                />
                                <Tooltip title="Оцените стоимость участия в мероприятии от 10 до 100 баллов. Значение может быть скорректировано модератором" arrow>
                                    <IconButton size="small">
                                        <HelpOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    )}

                    <TextField
                        label="Лимит участников"
                        type="number"
                        fullWidth
                        required
                        value={formData.participantsLimit}
                        onChange={(e) => handleLimitChange(e.target.value)}
                        error={!!fieldErrors.participantsLimit}
                        helperText={fieldErrors.participantsLimit || 'Укажите лимит участников (от 1 до 200)'}
                        inputProps={{ min: 1, max: 200, step: 1 }}
                        disabled={isFieldDisabled('participantsLimit')}
                    />

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                        <Button onClick={onCancel} variant="outlined">
                            Отмена
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            disabled={submitting}
                        >
                            {submitting ? submittingButtonText : submitButtonText}
                        </Button>
                    </Box>
                </Box>
            </form>
        </Paper>
    );
};