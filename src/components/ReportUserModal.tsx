import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ReportContext } from "../context/ReportContext";
import { useNotification } from "./Notification";
import { CreateReportDTO } from "../client/apiClient";

interface ReportUserModalProps {
  open: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
  contextInfo?: {
    name?: string;
    id?: number | string;
  };
  onReportSuccess?: () => void;
}

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  open,
  onClose,
  reportedUserId,
  reportedUserName,
  contextInfo,
  onReportSuccess,
}) => {
  const reportContext = useContext(ReportContext);
  const { showNotification } = useNotification();
  
  const [reportReason, setReportReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReportReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReportReason(event.target.value);
    setError(null);
  };

  const handleConfirmReport = async () => {
    if (!reportReason.trim()) {
      setError("Пожалуйста, укажите причину жалобы");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
    const reportData = new CreateReportDTO({
        senderUserId: " ",
        reportedUserId: reportedUserId,
        reportReason: reportReason.trim(),
    });
    console.log(reportData)
    const newReport = await reportContext?.createReport(reportData);
    
    if (!newReport) {
        throw new Error("Не удалось отправить жалобу");
    }

    let successMessage = `Жалоба успешно отправлена`;
    showNotification(successMessage, "success");
    
    onReportSuccess?.();
    handleClose();
    } catch (err) {
        console.error("Ошибка при отправке жалобы:", err);
        setError(err instanceof Error ? err.message : "Произошла ошибка при отправке жалобы");
        showNotification("Ошибка при отправке жалобы", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportReason("");
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  // Формируем заголовок и текст в зависимости от контекста
  const getTitle = () => {
    return "Жалоба на пользователя";
  };

  const getDescription = () => {   
    return (
      <Typography variant="body1" gutterBottom>
        Вы хотите пожаловаться на пользователя <strong>{reportedUserName}</strong>?
      </Typography>
    );
  };

  const getPlaceholder = () => {
    return "Опишите причину жалобы";
  };

  return (
    <Dialog
      open={open}
      onClose={!isSubmitting ? handleClose : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ color: error }}>
        {getTitle()}
      </DialogTitle>

      <DialogContent>
        {getDescription()}

        <Typography
          color="text.secondary"
          sx={{ mt: 1, mb: 3, fontSize: '0.875rem' }}
        >
          Пожалуйста, подробно опишите причину жалобы.
        </Typography>

        <TextField
          autoFocus
          fullWidth
          required
          label="Причина жалобы"
          placeholder={getPlaceholder()}
          value={reportReason}
          onChange={handleReportReasonChange}
          disabled={isSubmitting}
          error={!!error}
          helperText={error || "Это поле обязательно для заполнения"}
          multiline
          rows={4}
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
          onClick={handleConfirmReport}
          variant="outlined"
          color="error"
          disabled={isSubmitting || !reportReason.trim()}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
        >
          {isSubmitting ? "Отправка..." : "Отправить жалобу"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};