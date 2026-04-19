import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  CircularProgress,
  TextField,
  Avatar,
  Divider,
  Grid,
  Chip,
  IconButton,
} from "@mui/material";
import { Edit, Save, Cancel, PhotoCamera } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../components/Notification";
import { useNavigate } from "react-router-dom";

export const ProfilePage: React.FC = () => {
  const { currentUser, isLoading: authLoading, updateProfile } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [image, setImage] = useState<File | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    fullName: "",
    organizationName: "",
    ogrn: "",
  });

  useEffect(() => {
    if (currentUser) {
      console.log(currentUser)
      setFormData({
        userName: currentUser.userName || "",
        fullName: currentUser.fullname || "",
        organizationName: currentUser.organizerProfile?.organizationName || "",
        ogrn: currentUser.organizerProfile?.ogrn || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        userName: formData.userName,
        fullName: formData.fullName,
        organizationName: formData.organizationName,
        ogrn: formData.ogrn,
        image,
      });

      showNotification("Профиль обновлен", "success");
      setIsEditing(false);
      setImage(undefined);
    } catch {
      showNotification("Ошибка обновления", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setFormData({
        userName: currentUser.userName || "",
        fullName: currentUser.fullname || "",
        organizationName: currentUser.organizerProfile?.organizationName || "",
        ogrn: currentUser.organizerProfile?.ogrn || "",
      });
    }
    setImage(undefined);
    setIsEditing(false);
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Stack spacing={3}>
        {/* HEADER */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={3}>
                    <Box position="relative">
                    <Avatar
                        src={
                        image
                            ? URL.createObjectURL(image)
                            : currentUser?.profileImagePath
                        }
                        sx={{ width: 100, height: 100 }}
                    />

                    {isEditing && (
                        <>
                        <input
                            hidden
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setImage(file);
                            }}
                        />
                        <label htmlFor="avatar-upload">
                            <IconButton
                            component="span"
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                backgroundColor: "white",
                            }}
                            >
                            <PhotoCamera />
                            </IconButton>
                        </label>
                        </>
                    )}
                    </Box>

                    <Box>
                    {isEditing ? (
                        <TextField
                        label="Логин"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        size="small"
                        />
                    ) : (
                        <Typography variant="h5">
                        {currentUser?.userName}
                        </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary">
                        {currentUser?.email}
                    </Typography>
                    </Box>
                    {currentUser?.volunteerProfile && (
                      <Stack direction="row" spacing={1}>
                        <Chip
                          label={`Баллы: ${currentUser.volunteerProfile.totalPoints || 0}`}
                          color="primary"
                        />

                        {currentUser.volunteerProfile.rank && (
                          <Chip
                            label={currentUser.volunteerProfile.rank.name}
                            color="secondary"
                          />
                        )}
                      </Stack>
                    )}
                  </Box>
                <Stack direction="row" spacing={2}>
                  {(currentUser?.volunteerProfile || currentUser?.organizerProfile) && (
                    <Button
                    variant="contained"
                    onClick={() => navigate("/myevents")}
                    >
                    Мои мероприятия
                    </Button>
                  )}
                    {currentUser?.volunteerProfile && (
                    <Button
                        variant="contained"
                        onClick={() => navigate("/events-to-visit")}
                    >
                        Мои посещения
                    </Button>
                    )}
                </Stack>
                </Box>
          </CardContent>
        </Card>

        {/* FORM */}
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  label="Полное имя"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  disabled={!isEditing}
                />
              </Grid>

              {currentUser?.organizerProfile && (
                <>
                  <Grid size={12}>
                    <TextField
                      label="Организация"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      fullWidth
                      size="small"
                      disabled={!isEditing}
                    />
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      label="ОГРН"
                      name="ogrn"
                      value={formData.ogrn}
                      fullWidth
                      size="small"
                      disabled
                    />
                  </Grid>
                </>
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* ACTIONS */}
            {!isEditing ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
              >
                Редактировать
              </Button>
            ) : (
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                >
                  Отмена
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? <CircularProgress size={20} /> : "Сохранить"}
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};