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
  Paper,
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
  const [backgroundImage, setBackgroundImage] = useState<File | undefined>();
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
        backgroundImage
      });

      showNotification("Профиль обновлен", "success");
      setIsEditing(false);
      setImage(undefined);
      setBackgroundImage(undefined);
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
    setBackgroundImage(undefined);
  };

  if (authLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  // Проверка наличия фона
  const hasBackground = backgroundImage || currentUser?.backgroundImagePath;

  return (
    <Box p={3}>
      <Stack spacing={3}>
        {/* HEADER */}
        <Card
          sx={{
            position: "relative",
            backgroundImage: backgroundImage
              ? `url(${URL.createObjectURL(backgroundImage)})`
              : currentUser?.backgroundImagePath
              ? `url(${currentUser.backgroundImagePath})`
              : "none",  
            backgroundColor: !backgroundImage && !currentUser?.backgroundImagePath 
              ? "rgba(255,255,255, 0.5)"  
              : "transparent",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: 240,
          }}
        >
          {/* Градиентный оверлей */}
          {hasBackground && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(to top, rgba(103, 58, 183, 0.7) 0%, rgba(103, 58, 183, 0.3) 50%, transparent 100%)",
                zIndex: 1,
              }}
            />
          )}

          {/* Кнопка загрузки фона */}
          {isEditing && (
            <>
              <input
                hidden
                id="background-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setBackgroundImage(file);
                }}
              />
              <label htmlFor="background-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    zIndex: 3,
                    backgroundColor: "rgba(255,255,255,0.9)",
                    "&:hover": { backgroundColor: "white" },
                    boxShadow: 2,
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </>
          )}

          <CardContent sx={{ position: "relative", zIndex: 2, py: 4 }}>
            <Box display="flex" alignItems="flex-end" justifyContent="space-between">
                <Box display="flex" alignItems="flex-end" gap={3}>
                    <Box position="relative">
                    <Avatar
                        src={
                        image
                            ? URL.createObjectURL(image)
                            : currentUser?.profileImagePath
                        }
                        sx={{
                          width: 120,
                          height: 120,
                          border: "4px solid white",
                          boxShadow: 3,
                        }}
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
                                boxShadow: 2,
                                "&:hover": { backgroundColor: "#f5f5f5" },
                            }}
                            >
                            <PhotoCamera />
                            </IconButton>
                        </label>
                        </>
                    )}
                    </Box>

                    <Box pb={1}>
                      <Box
                        sx={{
                          backdropFilter: hasBackground ? "blur(12px)" : "none",
                          backgroundColor: hasBackground ? "rgba(255, 255, 255, 0.25)" : "transparent",
                          border: hasBackground ? "1px solid rgba(255, 255, 255, 0.3)" : "none",
                          borderRadius: 2,
                          p: 2,
                          display: "inline-block",
                        }}
                      >
                        <Box>
                          {isEditing ? (
                            <TextField
                              label="Логин"
                              name="userName"
                              value={formData.userName}
                              onChange={handleChange}
                              size="small"
                              sx={{
                                backgroundColor: "white",
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            <Typography
                              variant="h5"
                              sx={{
                                color: hasBackground ? "white" : "text.primary",
                                fontWeight: 600,
                                textShadow: hasBackground ? "0 2px 4px rgba(0,0,0,0.2)" : "none",
                              }}
                            >
                              {currentUser?.userName}
                            </Typography>
                          )}

                          <Typography
                            variant="body2"
                            sx={{
                              color: hasBackground ? "rgba(255,255,255,0.95)" : "text.secondary",
                              textShadow: hasBackground ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                            }}
                          >
                            {currentUser?.email}
                          </Typography>
                        </Box>
                      </Box>

                      {currentUser?.volunteerProfile && (
                        <Stack direction="row" spacing={1} mt={2}>
                        <Chip
                          label={`Баллы: ${currentUser.volunteerProfile.totalPoints || 0}`}
                          color="primary"
                          sx={{
                            color: "secondary.main",
                            fontWeight: 600,
                            boxShadow: 1,
                          }}
                        />

                          {currentUser.volunteerProfile.rank && (
                            <Chip
                              label={currentUser.volunteerProfile.rank.name}
                          color="primary"
                          sx={{
                            color: "secondary.main",
                            fontWeight: 600,
                            boxShadow: 1,
                          }}
                            />
                          )}
                        </Stack>
                      )}
                    </Box>
                  </Box>
              </Box>
            </CardContent>
        </Card>

        {/* FORM */}
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={12}>
                <TextField
                  label="ФИО"
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
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Box>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2}>
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
              </Box>

              {(currentUser?.volunteerProfile || currentUser?.organizerProfile) && (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/myevents")}
                  >
                    Мои мероприятия
                  </Button>
                  {currentUser?.volunteerProfile && (
                    <Button
                      variant="contained"
                      onClick={() => navigate("/events-to-visit")}
                    >
                      Мои посещения
                    </Button>
                  )}
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};