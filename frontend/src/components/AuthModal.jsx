import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, IconButton, Tab, Tabs } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';
import axios from 'axios';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: '#1e1e1e',
  color: '#ffffff',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  border: '1px solid #333'
};

export default function AuthModal({ open, handleClose }) {
  const dispatch = useDispatch();
  const [tabIndex, setTabIndex] = useState(0); // 0 - Логін, 1 - Реєстрація
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = tabIndex === 0 ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
    const payload = tabIndex === 0 ? { email, password } : { name, email, password };

    try {
      const response = await axios.post(url, payload);
      dispatch(setUser({ user: response.data.user, token: response.data.token }));
      alert(tabIndex === 0 ? `Вітаємо, ${response.data.user.name}!` : 'Реєстрація успішна!');
      handleClose();
    } catch (error) {
      console.error('Помилка автентифікації:', error);
      alert(error.response?.data?.message || 'Щось пішло не так');
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Tabs 
            value={tabIndex} 
            onChange={handleTabChange} 
            textColor="secondary" 
            indicatorColor="secondary"
            sx={{ '& .MuiTab-root': { color: '#ffffff', fontWeight: 'bold' } }}
          >
            <Tab label="Вхід" />
            <Tab label="Реєстрація" />
          </Tabs>
          <IconButton onClick={handleClose} sx={{ color: '#ffffff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box component="form" onSubmit={handleSubmit} mt={3} display="flex" flexDirection="column" gap={2}>
          {tabIndex === 1 && (
            <TextField
              label="Ім'я"
              variant="outlined"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              slotProps={{
                input: { sx: { color: '#ffffff' } },
                inputLabel: { sx: { color: '#b0b0b0' } }
              }}
              sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#444' }, '&:hover fieldset': { borderColor: '#ff4081' } } }}
            />
          )}

          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            slotProps={{
              input: { sx: { color: '#ffffff' } },
              inputLabel: { sx: { color: '#b0b0b0' } }
            }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#444' }, '&:hover fieldset': { borderColor: '#ff4081' } } }}
          />

          <TextField
            label="Пароль"
            type="password"
            variant="outlined"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: { sx: { color: '#ffffff' } },
              inputLabel: { sx: { color: '#b0b0b0' } }
            }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#444' }, '&:hover fieldset': { borderColor: '#ff4081' } } }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ bgcolor: '#ff4081', '&:hover': { bgcolor: '#c51162' }, mt: 2, fontWeight: 'bold', py: 1.2 }}
          >
            {tabIndex === 0 ? 'УВІЙТИ' : 'ЗАРЕЄСТРУВАТИСЯ'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}