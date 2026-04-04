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
    Divider
} from '@mui/material';
import { VolunteerEventContext } from '../context/EventContext';
import { useNavigate } from 'react-router-dom';
import { CalendarToday, Category, LocationOn, Star } from '@mui/icons-material';

export const CommunityEventsPage: React.FC = () => {
    const context = useContext(VolunteerEventContext);
    const navigate = useNavigate();

    const {
        communityEvents,
        isLoading,
        error,
        pageNumber,
        totalPages,
        setPageNumber
    } = context!;

    useEffect(() => {
        context!.fetchCommunityEvents();
    }, [pageNumber]);

    if (isLoading && communityEvents.length === 0) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h5">
                                        {event.name}
                                    </Typography>

                                    {event.eventCategory?.name && (
                                        <Chip
                                            icon={<Category />}
                                            label={event.eventCategory.name}
                                        />
                                    )}
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
                    count={totalPages}
                    page={pageNumber}
                    onChange={(_, value) => setPageNumber(value)}
                />
            </Box>
        </Container>
    );
};