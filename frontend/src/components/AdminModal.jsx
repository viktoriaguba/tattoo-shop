import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, IconButton, Tabs, Tab, TextField, Button, List, Accordion, AccordionSummary, AccordionDetails, ListItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useSelector } from 'react-redux';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: 650 },
  bgcolor: '#141414',
  color: '#ffffff',
  boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(255, 64, 129, 0.2)',
  p: 4,
  borderRadius: 3,
  border: '1px solid rgba(255, 64, 129, 0.4)',
  outline: 'none',
  // Анімація вилітання вікна
  animation: 'modalPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
  '@keyframes modalPopIn': {
    '0%': { transform: 'translate(-50%, -40%) scale(0.8)', opacity: 0 },
    '100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }
  }
};

export default function AdminModal({ open, handleClose, refreshProducts }) {
  const { token } = useSelector((state) => state.auth);
  const [tabIndex, setTabIndex] = useState(0);
  const [allOrders, setAllOrders] = useState([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (open && tabIndex === 0) {
      fetchAllOrders();
    }
  }, [open, tabIndex]);

  const fetchAllOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:5000/api/orders', config);
      setAllOrders(response.data);
    } catch (error) {
      console.error('Помилка отримання замовлень:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const productData = { title, description, price, stock, image, category };
      const response = await axios.post('http://localhost:5000/api/products', productData, config);
      alert(response.data.message);
      setTitle(''); setDescription(''); setPrice(''); setStock(''); setImage(''); setCategory('');
      if (refreshProducts) refreshProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Помилка додавання товару');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff4081', display: 'flex', alignItems: 'center', gap: 1, letterSpacing: '0.5px' }}>
            <AdminPanelSettingsIcon sx={{ animation: 'pulseIcon 2s infinite' }} /> Панель Адміна
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: '#ffffff', '&:hover': { transform: 'rotate(90deg)', color: '#ff4081' }, transition: 'all 0.3s' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Tabs 
          value={tabIndex} 
          onChange={(e, v) => setTabIndex(v)} 
          textColor="secondary" 
          indicatorColor="secondary"
          sx={{ 
            mb: 3, 
            borderBottom: '1px solid #222',
            '& .MuiTab-root': { color: '#ffffff', fontWeight: 'bold', transition: 'all 0.3s' },
            '& .Mui-selected': { color: '#ff4081 !important' }
          }}
        >
          <Tab label="Усі замовлення" />
          <Tab label="Додати товар" />
        </Tabs>

        {/* ВКЛАДКА 1: УСІ ЗАМОВЛЕННЯ */}
        {tabIndex === 0 && (
          <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 0.5 }}>
            {allOrders.length === 0 ? (
              <Typography align="center" my={3} color="#aaa">Замовлень немає</Typography>
            ) : (
              allOrders.map((order, i) => (
                <Accordion 
                  key={order.id} 
                  sx={{ 
                    bgcolor: '#1c1c1c', 
                    color: '#ffffff', 
                    mb: 1.5, 
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px !important',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    animation: `fadeInUp 0.4s ease-out ${i * 0.05}s both`,
                    '&:hover': {
                      borderColor: 'rgba(255, 64, 129, 0.6)',
                      transform: 'translateX(4px)'
                    },
                    '&::before': { display: 'none' }
                  }}
                >
                  <AccordionSummary expandMoreIcon={<ExpandMoreIcon sx={{ color: '#ff4081' }} />}>
                    <Box display="flex" justifyContent="space-between" width="100%" pr={1}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#ff4081' }}>
                          Клієнт: {order.customerName}
                        </Typography>
                        <Typography variant="caption" color="#888">
                          {new Date(order.createdAt).toLocaleString('uk-UA')}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', alignSelf: 'center', color: '#fff' }}>
                        {Number(order.totalPrice).toLocaleString()} грн
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: '#0f0f0f', borderTop: '1px solid #2a2a2a', borderRadius: '0 0 8px 8px' }}>
                    <List disablePadding>
                      {order.items.map((item, idx) => (
                        <ListItem key={idx} sx={{ px: 1, py: 0.5, display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #222' }}>
                          <Typography variant="body2" color="#ccc">{item.title} <b style={{ color: '#ff4081' }}>x{item.quantity}</b></Typography>
                          <Typography variant="body2" sx={{ fontWeight: '500' }}>{(item.price * item.quantity).toLocaleString()} грн</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        )}

        {/* ВКЛАДКА 2: ДОДАТИ ТОВАР */}
        {tabIndex === 1 && (
          <Box component="form" onSubmit={handleAddProduct} display="flex" flexDirection="column" gap={2} sx={{ maxHeight: 400, overflow: 'auto', pr: 1, animation: 'fadeIn 0.3s ease' }}>
            {[
              { id: 'title', label: 'Назва товару', val: title, set: setTitle },
              { id: 'description', label: 'Опис товару', val: description, set: setDescription, multi: true }
            ].map(f => (
              <TextField 
                key={f.id} label={f.label} required fullWidth value={f.val} onChange={(e) => f.set(e.target.value)} multiline={f.multi} rows={f.multi ? 2 : 1}
                slotProps={{ input: { sx: { color: '#fff' } }, inputLabel: { sx: { color: '#888' } } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2a2a2a', transition: 'all 0.3s' }, '&:hover fieldset': { borderColor: '#555' }, '&.Mui-focused fieldset': { borderColor: '#ff4081', boxShadow: '0 0 10px rgba(255,64,129,0.2)' } } }}
              />
            ))}
            
            <Box display="flex" gap={2}>
              <TextField 
                label="Ціна (грн)" type="number" required fullWidth value={price} onChange={(e) => setPrice(e.target.value)}
                slotProps={{ input: { sx: { color: '#fff' } }, inputLabel: { sx: { color: '#888' } } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2a2a2a' }, '&.Mui-focused fieldset': { borderColor: '#ff4081' } } }}
              />
              <TextField 
                label="Кількість на складі" type="number" required fullWidth value={stock} onChange={(e) => setStock(e.target.value)}
                slotProps={{ input: { sx: { color: '#fff' } }, inputLabel: { sx: { color: '#888' } } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2a2a2a' }, '&.Mui-focused fieldset': { borderColor: '#ff4081' } } }}
              />
            </Box>

            <TextField 
              label="Категорія (напр. Машинки, Пігменти)" required fullWidth value={category} onChange={(e) => setCategory(e.target.value)}
              slotProps={{ input: { sx: { color: '#fff' } }, inputLabel: { sx: { color: '#888' } } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2a2a2a' }, '&.Mui-focused fieldset': { borderColor: '#ff4081' } } }}
            />
            <TextField 
              label="Посилання на зображення URL" required fullWidth value={image} onChange={(e) => setImage(e.target.value)}
              slotProps={{ input: { sx: { color: '#fff' } }, inputLabel: { sx: { color: '#888' } } }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#2a2a2a' }, '&.Mui-focused fieldset': { borderColor: '#ff4081' } } }}
            />

            <Button type="submit" variant="contained" sx={{ bgcolor: '#ff4081', '&:hover': { bgcolor: '#c51162', boxShadow: '0 0 20px #ff4081' }, fontWeight: 'bold', py: 1.2, borderRadius: 2, transition: 'all 0.3s' }}>
              ОПУБЛІКУВАТИ ТОВАР
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
}