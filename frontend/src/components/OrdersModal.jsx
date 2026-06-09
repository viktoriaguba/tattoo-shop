import React, { useEffect, useState } from 'react';
import { Modal, Box, Typography, IconButton, List, ListItem, Divider, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useSelector } from 'react-redux';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: 600 },
  bgcolor: '#1e1e1e',
  color: '#ffffff',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  border: '1px solid #333'
};

export default function OrdersModal({ open, handleClose }) {
  const { token, isAuth } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && isAuth) {
      fetchOrders();
    }
  }, [open, isAuth]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:5000/api/orders', config);
      setOrders(response.data);
    } catch (error) {
      console.error('Помилка завантаження замовлень:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff4081', display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingBagIcon /> Мої замовлення
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: '#ffffff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ bgcolor: '#333', mb: 2 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" my={5}>
            <CircularProgress color="secondary" />
          </Box>
        ) : orders.length === 0 ? (
          <Typography variant="body1" textAlign="center" sx={{ color: '#aaa', my: 4 }}>
            Ви ще не здійснили жодного замовлення.
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 1 }}>
            {orders.map((order) => (
              <Accordion 
                key={order.id} 
                sx={{ 
                  bgcolor: '#2a2a2a', 
                  color: '#ffffff', 
                  mb: 1.5, 
                  borderRadius: '8px !important',
                  border: '1px solid #444',
                  '&:before': { display: 'none' } 
                }}
              >
                <AccordionSummary expandMoreIcon={<ExpandMoreIcon sx={{ color: '#ff4081' }} />}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" pr={2}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#b0b0b0' }}>
                        Замовлення від {new Date(order.createdAt).toLocaleDateString('uk-UA')}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#aaa' }}>
                        ID: ...{order.id.substring(0, 8)}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#ff4081' }}>
                      {Number(order.totalPrice).toLocaleString()} грн
                    </Typography>
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails sx={{ bgcolor: '#1e1e1e', borderTop: '1px solid #444', p: 2 }}>
                  <List disablePadding>
                    {order.items.map((item, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#ffffff', maxWidth: '75%' }}>
                          {item.title} <span style={{ color: '#ff4081', fontWeight: 'bold' }}>x{item.quantity}</span>
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: '500', color: '#b0b0b0' }}>
                          {(item.price * item.quantity).toLocaleString()} грн
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>
    </Modal>
  );
}