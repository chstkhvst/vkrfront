import React, { useContext, useEffect, useState } from "react";
import { Container, CircularProgress, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { EventForm } from "../components/EventForm";
import { VolunteerEventContext } from "../context/EventContext";
import { AttendanceContext } from "../context/AttendanceContext";
import { UpdateEventDTO, CreateNotificationDTO } from "../client/apiClient";
import { useNotification } from '../components/Notification';
import { NotificationForUserContext } from "../context/NotificationForUserContext";

export const EditEventPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const context = useContext(VolunteerEventContext);
    const attendanceContext = useContext(AttendanceContext);
    const notificationContext = useContext(NotificationForUserContext);
    if (!context) throw new Error("VolunteerEventContext not found");

    const {
        fetchEventById,
        updateEventByOrganizer,
        eventCategories,
        cities,
        geocode,
        reverseGeocode,
        isLoading
    } = context;
    const { getParticipantsCount } = attendanceContext!;

    const [participantsCount, setParticipantsCount] = useState(0);

    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (!id) return;

            const data = await fetchEventById(Number(id));
            setEvent(data);

            if (data?.id) {
                const count = await getParticipantsCount(data.id);
                setParticipantsCount(count);
            }

            setLoading(false);
        };

        load();
    }, [id]);

    const canEditEvent = (eventDateTime: Date | undefined): boolean => {
        if (!eventDateTime) return false;

        const now = new Date();
        const eventDate = new Date(eventDateTime);
        const diffMs = eventDate.getTime() - now.getTime();

        return diffMs >= 24 * 60 * 60 * 1000;
    };

    const isEditable = canEditEvent(event?.eventDateTime);

    const handleSubmit = async ({ eventData, coords }: any) => {
        if (!id) return false;
        if (!isEditable) {
            return false;
        }
        if (coords.lat == null || coords.lng == null) {
            return false;
        }
        if (eventData.participantsLimit < participantsCount) {
            showNotification("Установиите лимит участников не менее, чем количество зарегистрированных на мероприятие пользователей", "error");
            return false;
        }
        try {
            setSubmitting(true);

            const dto = new UpdateEventDTO();
            dto.id = Number(id);

            if (eventData.description !== event.description) {
                dto.description = eventData.description;
            }

            if (eventData.address !== event.address) {
                dto.address = eventData.address;
            }

            if (coords.lat != null && coords.lng != null) {
                dto.lat = Number(coords.lat);
                dto.lng = Number(coords.lng);
            }

            if (eventData.participantsLimit !== event.participantsLimit) {
                dto.participantsLimit = eventData.participantsLimit;
            }

            if (eventData.eventDateTime !== event.eventDateTime) {
                dto.eventDateTime = eventData.eventDateTime;
            }

            const success = await updateEventByOrganizer(Number(id), dto);

            if (success) {
            showNotification('Данные изменены', 'success');
            // рассылка уведов
            await notificationContext!.createForEvent(
                new CreateNotificationDTO({
                recipientId: undefined,
                eventId: dto.id,
                message: `Данные о мероприятии "${eventData.name}" были изменены. Подробности в разделе "Мои посещения"`,
                typeId: 2,
                })
            );
                navigate(`/events/${event.id}`, { state: { isCommunity: false } });
            }

            return success;
        } catch (e) {
            console.error(e);
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !event || isLoading) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {!isEditable && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Редактирование невозможно менее чем за 24 часа до начала мероприятия
                </Alert>
            )}
            <EventForm
                mode="edit"
                title="Редактирование мероприятия"

                initialData={{
                    name: event.name,
                    description: event.description,
                    categoryId: event.eventCategoryId?.toString(),
                    cityId: event.cityId?.toString(),
                    address: event.address,
                    eventDateTime: event.eventDateTime
                        ? new Date(event.eventDateTime).toISOString().slice(0, 16)
                        : "",
                    eventPoints: event.eventPoints,
                    participantsLimit: event.participantsLimit?.toString()
                }}

                initialCoords={{
                    lat: event.lat,
                    lng: event.lng
                }}

                initialSelectedAddress={
                    event.address
                        ? {
                              display_name: event.address,
                              lat: event.lat,
                              lon: event.lng
                          }
                        : null
                }

                eventCategories={eventCategories}
                cities={cities}
                geocode={geocode}
                reverseGeocode={reverseGeocode}

                onSubmit={handleSubmit}
                submitting={submitting || !isEditable}

                submitButtonText="Сохранить"
                submittingButtonText="..."

                onCancel={() => navigate(`/events/${id}`)}

                disabledFields={[
                    "name",
                    "categoryId",
                    "cityId",
                    "eventPoints",
                    "image"
                ]}
            />
        </Container>
    );
};