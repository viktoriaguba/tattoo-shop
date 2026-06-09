import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../store/authSlice';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Перемикач режиму: true = Вхід (Login), false = Реєстрація (Register)
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Визначаємо правильний ендпоінт залежно від режиму
    const endpoint = isLogin 
      ? 'http://localhost:5000/api/auth/login' 
      : 'http://localhost:5000/api/auth/register';

    // Для входу нам не потрібно відправляти поле name
    const bodyData = isLogin 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Сталася помилка при авторизації');
      }

      // Формуємо чистий об'єкт користувача з усіма полями для бази Neon
      const userPayload = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        phone: data.user.phone || '', // Якщо сервер ще не має цих полів, ставимо пусті
        city: data.user.city || ''
      };

      // Записуємо токен та користувача в Redux + LocalStorage
      dispatch(setUser({ token: data.token, user: userPayload }));
      
      // Після успішного входу залізобетонно направляємо в профіль
      navigate('/profile');
    } catch (err) {
      setError(err.message);
      console.error('Помилка авторизації:', err);
    }
  };

  return (
    <div style={{ backgroundColor: '#060606', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
      <Container maxWidth="xs">
        <Paper sx={{ p: 4, backgroundColor: '#0f0f0f', borderRadius: '24px', border: '1px solid #222', textAlign: 'center' }}>
          
          <Typography variant="h4" sx={{ fontWeight: '900', mb: 1, color: '#fff', textTransform: 'uppercase' }}>
            {isLogin ? 'Вхід в ' : 'Створення '}
            <span style={{ color: '#ff4081' }}>акаунту</span>
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
            {isLogin ? 'Введіть ваші дані для доступу до профілю' : 'Заповніть поля, щоб приєднатися до нас'}
          </Typography>

          {error && (
            <Typography variant="body2" sx={{ color: '#ff4081', mb: 2, fontWeight: '700' }}>
              ⚠️ {error}
            </Typography>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Поле "Ім'я" показуємо ТІЛЬКИ в режимі реєстрації */}
              {!isLogin && (
                <TextField
                  fullWidth
                  label="Ваше ім'я"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  sx={{
                    '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6) !important' },
                    '& .MuiOutlinedInput-root': {
                      '& input': { color: '#fff' },
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                      '&:hover fieldset': { borderColor: '#ff4081' },
                      '&.Mui-focused fieldset': { borderColor: '#ff4081' }
                    }
                  }}
                />
              )}

              <TextField
                fullWidth
                label="Електронна пошта"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6) !important' },
                  '& .MuiOutlinedInput-root': {
                    '& input': { color: '#fff' },
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                    '&:hover fieldset': { borderColor: '#ff4081' },
                    '&.Mui-focused fieldset': { borderColor: '#ff4081' }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Пароль"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                sx={{
                  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6) !important' },
                  '& .MuiOutlinedInput-root': {
                    '& input': { color: '#fff' },
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                    '&:hover fieldset': { borderColor: '#ff4081' },
                    '&.Mui-focused fieldset': { borderColor: '#ff4081' }
                  }
                }}
              />

              <Button type="submit" variant="contained" fullWidth sx={{ background: 'linear-gradient(135deg, #ff4081 0%, #bd00ff 100%)', fontWeight: '700', p: '12px', borderRadius: '12px', mt: 1 }}>
                {isLogin ? 'Увійти' : 'Зареєструватися'}
              </Button>
            </Box>
          </form>

          {/* Кнопка-перемикач між Входом та Реєстрацією */}
          <Button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }} 
            sx={{ mt: 3, color: '#666', textTransform: 'none', '&:hover': { color: '#ff4081' } }}
          >
            {isLogin ? 'Немає акаунту? Зареєструватися' : 'Вже є акаунт? Увійти'}
          </Button>

        </Paper>
      </Container>
    </div>
  );
}