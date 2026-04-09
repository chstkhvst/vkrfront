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
} from "@mui/material";
import { Pending, CheckCircle } from "@mui/icons-material";
import { ReportContext } from "../context/ReportContext";
import { BanUserModal } from "../components/BanUserModal";
import { useNavigate } from "react-router-dom";
import { ReportGroupDTO, UserReportDTO } from "../client/apiClient";
import { useNotification } from '../components/Notification';

export const ReportsListPage: React.FC = () => {
    const context = useContext(ReportContext);
    const navigate = useNavigate();
    const { showNotification } = useNotification();


    const [search, setSearch] = useState("");
    const [banModalOpen, setBanModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<ReportGroupDTO | null>(null);

    const {
        reportGroups,
        isLoading,
        error,
        fetchGroupedReports,
        markReportsClosed
    } = context!;

    useEffect(() => {
    fetchGroupedReports(); // грузим все группы
    }, []);

    const handleOpenBanModal = (group: ReportGroupDTO) => {
        setSelectedGroup(group);
        setBanModalOpen(true);
    };
    const handleCloseBanModal = () => {
        setBanModalOpen(false);
        setSelectedGroup(null);
    };

    const handleBanSuccess = async () => {
        await fetchGroupedReports();
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
        if (!group.reportedUserId) return;
        
        const success = await context!.markReportsClosed(group.reportedUserId);
        if (success) {
            showNotification("Жалобы отмечены", "info");
        }
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
                    {group.reports?.map((report: UserReportDTO) => (
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
                            onClick={() => handleOpenBanModal(group)}
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
        <BanUserModal
            open={banModalOpen}
            onClose={handleCloseBanModal}
            selectedGroup={selectedGroup}
            onBanSuccess={handleBanSuccess}
        />
      {!isLoading && filteredGroups.length === 0 && (
        <Typography mt={4} textAlign="center" color="text.secondary">
          Ничего не найдено
        </Typography>
      )}
    </Box>
  );
};
