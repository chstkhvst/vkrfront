import React, { useContext } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { VolunteerEventContext } from '../context/EventContext';
import { useNotification } from '../components/Notification';
import { useAuth } from '../context/AuthContext';
import { EventForm } from '../components/EventForm';

export const CreateEventPage: React.FC = () => {
    const { userRole } = useAuth();
    const mode = userRole === 'organizer' ? 'organizer' : 'volunteer';
    const context = useContext(VolunteerEventContext);
    const { showNotification } = useNotification();
    const [submitting, setSubmitting] = React.useState(false);
    const [success, setSuccess] = React.useState(false);

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

    const handleSubmit = async ({ eventData, image }: { eventData: any; image: File | undefined; coords: any }) => {
        setSubmitting(true);
        
        const result = await createEvent({
            ...eventData,
            image: image
        });

        if (result) {
            console.log(result);
            setSuccess(true);
            showNotification('Ваша заявка отправлена на модерацию. Подробности в разделе "Мои мероприятия"', 'info');
            setSubmitting(false);
            return true;
        }
        
        setSubmitting(false);
        return false;
    };

    if (success) {
        return <Navigate to="/events" replace />;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                {mode === "organizer"
                    ? "Добавить мероприятие"
                    : "Предложить инициативу"}
            </Typography>
            
            <EventForm
                mode={mode}
                eventCategories={eventCategories}
                cities={cities}
                geocode={geocode}
                reverseGeocode={reverseGeocode}
                onSubmit={handleSubmit}
                submitting={submitting}
                submitButtonText="Создать мероприятие"
                submittingButtonText="Создание..."
                title={mode === "organizer" ? "Добавить мероприятие" : "Предложить инициативу"}
                onCancel={() => window.history.back()}
            />
        </Container>
    );
};