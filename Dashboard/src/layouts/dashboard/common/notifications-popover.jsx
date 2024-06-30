import io from 'socket.io-client';
import { throttle } from 'lodash';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { faker } from '@faker-js/faker';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import WarningIcon from '@mui/icons-material/Warning';
import ListSubheader from '@mui/material/ListSubheader';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const socket = io('https://lora-placa-solar-server-proxy.onrender.com');

export default function NotificationsPopover() {
  const [notifications, setNotifications] = useState([]);
  const recentNotifications = useRef(new Set());

  const handleNewAlert = throttle((data) => {
    const newNotification = {
      id: faker.string.uuid(),
      title: 'Alerta de Monitoramento',
      description: data.mensagem,
      avatar: null,
      type: 'alert',
      createdAt: new Date(),
      isUnRead: true,
    };

    // Check if the same alert is already in the recent notifications
    if (recentNotifications.current.has(data.mensagem)) {
      return;
    }

    // Add new notification
    setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);

    // Update the recent notifications set
    recentNotifications.current.add(data.mensagem);

    // Remove the notification from the recent set after 1 minute
    setTimeout(() => {
      recentNotifications.current.delete(data.mensagem);
    }, 60000); 
  }, 60000); 

  useEffect(() => {
    socket.on('alerta', handleNewAlert);

    return () => {
      socket.off('alerta', handleNewAlert);
    };
  }, [handleNewAlert]);

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length;

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({
        ...notification,
        isUnRead: false,
      }))
    );
  };

  return (
    <>
      <IconButton color={open ? 'primary' : 'default'} onClick={handleOpen}>
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="mdi:bell-ring-outline" />
        </Badge>
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            ml: 0.75,
            width: 360,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notificações</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Você tem {totalUnRead} mensagens não lidas
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title="Marcar como lida">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="mdi:check-all" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                Nova
              </ListSubheader>
            }
          >
            {notifications.slice(0, 2).map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple>
            Ver Todas
          </Button>
        </Box>
      </Popover>
    </>
  );
}

function NotificationItem({ notification }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', py: 1, px: 2 }}>
      <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
      <Box>
        <Typography variant="subtitle2">{notification.title}</Typography>
        <Typography variant="body2">{notification.description}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {format(new Date(notification.createdAt), 'dd/MM/yyyy HH:mm:ss')}
        </Typography>
      </Box>
    </Box>
  );
}

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
  }).isRequired,
};