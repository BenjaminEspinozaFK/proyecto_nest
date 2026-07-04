import React, { useEffect, useState, useCallback } from "react";
import {
  IconButton,
  Badge,
  Menu,
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { notificationService } from "../services/notificationService";
import { Notification } from "../types/notification";
import { useSocket } from "../hooks/useSocket";

interface NotificationBellProps {
  userId?: string;
  isAdmin: boolean;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  isAdmin,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);
  const socket = useSocket(userId, isAdmin);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Error obteniendo notificaciones sin leer:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Error obteniendo notificaciones:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      fetchUnreadCount();
      if (open) {
        fetchNotifications();
      }
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, [socket, open, fetchUnreadCount, fetchNotifications]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Error marcando notificación como leída:", err);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marcando todas como leídas:", err);
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: "text.secondary" }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 480,
            borderRadius: "16px",
          },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1.5,
          }}
        >
          <Typography variant="subtitle1" fontWeight="600">
            Notificaciones
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: "none" }}
            >
              Marcar todas como leídas
            </Button>
          )}
        </Box>

        <Divider />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 3, px: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No tienes notificaciones.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 380, overflowY: "auto" }}>
            {notifications.map((notification) => (
              <Box
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  bgcolor: notification.read
                    ? "transparent"
                    : (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(102, 126, 234, 0.12)"
                          : "rgba(102, 126, 234, 0.08)",
                  "&:hover": {
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.03)",
                  },
                  borderBottom: (theme) =>
                    `1px solid ${
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.06)"
                    }`,
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {notification.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {notification.message}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  {new Date(notification.createdAt).toLocaleString("es-CL")}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
