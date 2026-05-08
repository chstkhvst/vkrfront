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
  InputAdornment,
  Paper,
} from "@mui/material";
import { Pending, CheckCircle, ExpandMore, ExpandLess } from "@mui/icons-material";
import { ReportContext } from "../context/ReportContext";
import { BanUserModal } from "../components/BanUserModal";
import { useNavigate } from "react-router-dom";
import { ReportGroupDTO, UserReportDTO } from "../client/apiClient";
import { useNotification } from '../components/Notification';
import Search from "@mui/icons-material/Search";

export const ReportsListPage: React.FC = () => {
    const context = useContext(ReportContext);
    const navigate = useNavigate();
    const { showNotification } = useNotification();


    const [search, setSearch] = useState("");
    const [banModalOpen, setBanModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<ReportGroupDTO | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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
        
        const success = await markReportsClosed(group.reportedUserId);
        if (success) {
            showNotification("Жалобы отмечены", "info");
        }
    };
    const hasPendingReports = (group: ReportGroupDTO) => {
        return group.reports?.some(r => r.reportStatusId === 1);
    };
    
    const toggleGroup = (groupId: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(groupId)) {
                newSet.delete(groupId);
            } else {
                newSet.add(groupId);
            }
            return newSet;
        });
    };
  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Жалобы пользователей
      </Typography>

      {/* Поиск */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: "1px solid rgba(148, 156, 255, 0.2)",
            borderRadius: 2,
            bgcolor: "rgba(148, 156, 255, 0.02)",
          }}
        >
          <TextField
            placeholder="Поиск " 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="medium"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#949cff" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "white",
                "&:hover fieldset": { borderColor: "#949cff" },
                "&.Mui-focused fieldset": { borderColor: "#949cff" },
              },
            }}
          />
        </Paper>
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
            filteredGroups.map((group) => {
                const reports = group.reports || [];
                const hasManyReports = reports.length > 2;
                const isExpanded = expandedGroups.has(group.reportedUserId!);
                const displayedReports = hasManyReports && !isExpanded 
                    ? reports.slice(0, 2) 
                    : reports;
                    
                return (
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
                                    {displayedReports.map((report: UserReportDTO) => (
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
                                
                                {/* КНОПКА РАЗВЕРНУТЬ/СВЕРНУТЬ */}
                                {hasManyReports && (
                                    <Box display="flex" justifyContent="center">
                                        <Button
                                            size="small"
                                            onClick={() => toggleGroup(group.reportedUserId!)}
                                            startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
                                        >
                                            {isExpanded ? "Свернуть" : `Показать еще ${reports.length - 2}`}
                                        </Button>
                                    </Box>
                                )}

                                {/* ACTIONS */}
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <Button
                                        variant="text"
                                        onClick={() => navigate(`/user-for-moder/${group.reportedUserId}`)}
                                    >
                                        Перейти в профиль пользователя
                                    </Button>

                                    <Stack direction="row" spacing={1}>
                                        {hasPendingReports(group) && (
                                            <>
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
                                            </>
                                        )}
                                    </Stack>
                                </Stack>

                            </Stack>
                        </CardContent>
                    </Card>
                );
            })}
        </Stack>
        <BanUserModal
            open={banModalOpen}
            onClose={handleCloseBanModal}
            userId={selectedGroup?.reportedUserId || ""}
            userName={selectedGroup?.reportedUser?.userName}
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