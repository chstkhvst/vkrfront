import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { Pending, CheckCircle } from "@mui/icons-material";
import { ReportContext } from "../context/ReportContext";
import { useNavigate } from "react-router-dom";
import { ReportGroupDTO, UserReportDTO } from "../client/apiClient";
import { useNotification } from '../components/Notification';

export const ReportsListPage: React.FC = () => {
    const context = useContext(ReportContext);
    const navigate = useNavigate();
    const { showNotification } = useNotification();


    const [search, setSearch] = useState("");
    const [banDialogOpen, setBanDialogOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<ReportGroupDTO | null>(null);

    const {
        reportGroups,
        isLoading,
        error,
        fetchGroupedReports,
    } = context!;

    useEffect(() => {
    fetchGroupedReports(); // грузим все группы
    }, []);

    const handleOpenBanDialog = (group: ReportGroupDTO) => {
        setSelectedGroup(group);
        setBanDialogOpen(true);
    };
    const handleConfirmBan = async () => {
        if (!selectedGroup) return;

        try {
            await handleUpdateReports(selectedGroup);
            // TODO: создать бан пользователя
            showNotification("Пользователь заблокирован", "success");
        } catch (e) {
            showNotification("Ошибка", "error");
        } finally {
            setBanDialogOpen(false);
            setSelectedGroup(null);
        }
    };
    const getStatusChip = (report: UserReportDTO) => {
        const name = report.reportStatus?.name || "Неизвестно";
        
        const color = report.reportStatusId === 1 ? "warning" : "success";
        const icon = report.reportStatusId === 1 ? <Pending fontSize="small" /> : <CheckCircle fontSize="small" />;

        return (
            <Chip
                label={name}
                color={color}
                size="small"
                variant="outlined"
                icon={icon}
            />
        );
    };
    const filteredGroups = reportGroups.filter((group) =>
        group.reportedUser?.userName
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
    const handleUpdateReports = async (group: ReportGroupDTO) => {
        // сделать для всех банов апдейт
    };
  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Жалобы пользователей
      </Typography>

      {/* Поиск */}
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Поиск по пользователю..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* Лоадер */}
      {isLoading && (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      )}

      {/* Ошибка */}
      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}

      {/* Список */}
      <Stack spacing={2}>
        {!isLoading &&
            filteredGroups.map((group) => (
            <Card key={group.reportedUserId}>
                <CardContent>
                <Stack spacing={2}>
                    
                    {/* HEADER */}
                    <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                    >
                    <Typography variant="h6">  
                        {"Жалобы на пользователя " + group.reportedUser?.userName}
                    </Typography>

                    <Chip
                        label={`Всего: ${group.count}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                    />
                    </Box>

                    {/* СПИСОК ЖАЛОБ */}
                    <Stack spacing={1}>
                    {group.reports?.map((report) => (
                        <Box
                        key={report.id}
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: "rgba(0,0,0,0.03)",
                        }}
                        >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Typography variant="body2" fontWeight={600}>
                            {report.sender?.userName || "Неизвестный пользователь"}
                            </Typography>
                            {getStatusChip(report)}
                        </Box>

                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                            {report.reportReason}
                        </Typography>
                        </Box>
                    ))}
                    </Stack>

                    {/* ACTIONS */}
                    <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    >
                    <Button
                        variant="text"
                        onClick={() => {
                        // TODO: перейти в профиль
                        }}
                    >
                        Перейти в профиль пользователя
                    </Button>

                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleOpenBanDialog(group)}
                            >
                            Заблокировать
                        </Button>

                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => handleUpdateReports(group)}
                            >
                            Отклонить жалобы
                        </Button>
                    </Stack>
                    </Stack>

                </Stack>
                </CardContent>
            </Card>
            ))}
        </Stack>

      {!isLoading && filteredGroups.length === 0 && (
        <Typography mt={4} textAlign="center" color="text.secondary">
          Ничего не найдено
        </Typography>
      )}
      <Dialog
            open={banDialogOpen}
            onClose={() => setBanDialogOpen(false)}
            >
            <DialogTitle sx={{ color: '#f44336' }}>
                Блокировка пользователя
            </DialogTitle>

            <DialogContent>
                <Typography>
                    Вы уверены, что хотите заблокировать пользователя{" "}
                    <b>{selectedGroup?.reportedUser?.userName}</b>?
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{ mt: 1, fontSize: '0.875rem' }}
                    >
                    Примечание: при блокировке пользователя все жалобы на него будут отмечены как рассмотренные.
                </Typography>
            </DialogContent>

            <DialogActions>
                <Button onClick={() => setBanDialogOpen(false)}>
                Нет
                </Button>

                <Button
                    onClick={handleConfirmBan}
                    variant="outlined"
                    color="error"
                    autoFocus
                >
                    Да, заблокировать
                </Button>
            </DialogActions>
        </Dialog>
    </Box>
  );
};
