import React, { useContext, useEffect, useState } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

import { NotificationForUserContext } from "../context/NotificationForUserContext";

interface Props {
  userId: string;
}

const NotificationBell: React.FC<Props> = ({ userId }) => {
  const context = useContext(NotificationForUserContext);
  if (!context) throw new Error("NotificationContext not found");

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = context;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    console.log(userId);
    console.log(fetchUnreadCount(userId));
  }, [userId]);

  const handleOpen = async (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    await fetchNotifications(userId);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRead = async (id: number) => {
    await markAsRead(id, userId);
  };

  const handleReadAll = async () => {
    await markAllAsRead(userId);
  };

  return (
    <>
      {/* Иконка */}
    <IconButton onClick={handleOpen} color="secondary">
    <Badge badgeContent={unreadCount} color="error">
        <NotificationsIcon />
    </Badge>
    </IconButton>

      {/* Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 },
        }}
      >
        <Box px={2} py={1}>
          <Typography fontWeight={600}>Уведомления</Typography>
        </Box>

        <Divider />

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary">
              Нет уведомлений
            </Typography>
          </Box>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleRead(n.id!)}
              sx={{
                alignItems: "flex-start",
                whiteSpace: "normal",
                backgroundColor: n.isRead ? "inherit" : "rgba(0,0,0,0.05)",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={n.isRead ? 400 : 600}
                >
                  {n.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(n.createdAt!).toLocaleString()}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}

        <Divider />

        <Box p={1} display="flex" justifyContent="space-between">
          <Button size="small" onClick={handleReadAll}>
            Отметить все как прочитанные
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;