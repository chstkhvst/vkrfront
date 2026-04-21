import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { BanContext } from "../context/BanContext";
import { useNotification } from "./Notification";

interface BanUserModalProps {
  open: boolean;
  onClose: () => void;
  // selectedGroup: ReportGroupDTO | null;
  userId: string | null;
  userName?: string;
  onBanSuccess: () => Promise<void>;
}

export const BanUserModal: React.FC<BanUserModalProps> = ({
  open,
  onClose,
  userId,
  userName,
  // selectedGroup,
  
  onBanSuccess,
}) => {
  const banContext = useContext(BanContext);
  const { showNotification } = useNotification();
  
  const [banReason, setBanReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBanReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBanReason(event.target.value);
    setError(null);
  };

  const handleConfirmBan = async () => {
    if (!banReason.trim()) {
      setError("Пожалуйста, укажите причину блокировки");
      return;
    }

    if (!userId) {
      showNotification("Ошибка: пользователь не найден", "error");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      //бан 
        const createBanDTO = {
        bannedUserId: userId,
        banReason: banReason.trim(),
        };

        const newBan = await banContext?.createBan(createBanDTO as any);
      
        if (!newBan) {
            throw new Error("Не удалось создать бан");
        }
        await onBanSuccess();

        showNotification(
            `Пользователь ${userName} успешно заблокирован`,
            "success"
        );
        
        handleClose();
        } catch (err) {
        console.error("Ошибка при блокировке пользователя:", err);
        setError(err instanceof Error ? err.message : "Произошла ошибка при блокировке");
        showNotification("Ошибка при блокировке пользователя", "error");
        } finally {
        setIsSubmitting(false);
        }
  };

  const handleClose = () => {
    setBanReason("");
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={!isSubmitting ? handleClose : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ color: error }}>
        Блокировка пользователя
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Вы уверены, что хотите заблокировать пользователя{" "}
          <strong>{userName}</strong>?
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 1, mb: 3, fontSize: '0.875rem' }}
        >
          Примечание: при блокировке пользователя все жалобы на него будут отмечены как рассмотренные.
        </Typography>

        <TextField
          autoFocus
          fullWidth
          required
          label="Причина блокировки"
          placeholder="Укажите причину блокировки пользователя..."
          value={banReason}
          onChange={handleBanReasonChange}
          disabled={isSubmitting}
          error={!!error}
          helperText={error || "Это поле обязательно для заполнения"}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={isSubmitting}
        >
          Отмена
        </Button>

        <Button
          onClick={handleConfirmBan}
          variant="outlined"
          color="error"
          disabled={isSubmitting || !banReason.trim()}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
        >
          {isSubmitting ? "Блокировка..." : "Да, заблокировать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};