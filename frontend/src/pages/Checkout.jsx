import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, Grid, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogContent
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// Стопроцентно робочий імпорт для Vite (виправляє SyntaxError)
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';

export default function Checkout() {
  const { isAuth, user, token } = useSelector((state) => state.auth || { isAuth: false, user: null, token: null });
  const navigate = useNavigate();

  // Стейт для товарів у замовленні
  const [cartItems, setCartItems] = useState([]);
  
  // Стейт для форми доставки
  const [shippingData, setShippingData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    address: '', // наприклад, Нова Пошта або адреса
    comment: ''
  });

  // Модалка успішного замовлення
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Завантажуємо кошик та ініціалізуємо дані користувача
  useEffect(() => {
    try {
      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(currentCart);
      
      // Якщо кошик порожній, повертаємо на каталог
      if (currentCart.length === 0) {
        alert('Ваш кошик порожній!');
        navigate('/catalog');
      }
    } catch (error) {
      console.error("Помилка при зчитуванні кошика:", error);
    }

    if (user) {
      setShippingData(prev => ({
        ...prev,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        city: user.city || ''
      }));
    }
  }, [user, navigate]);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  };

  const handleInputChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  // 2. Відправка замовлення на бекенд
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    if (!shippingData.name || !shippingData.phone || !shippingData.address) {
      alert("Будь ласка, заповніть обов'язкові поля (Ім'я, Телефон, Адреса доставки)");
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        items: cartItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity || 1
        })),
        shippingDetails: shippingData,
        totalPrice: calculateTotal()
      };

      // ПІДСТРАХОВКА: Спершу беремо токен з Redux, якщо його немає — з localStorage
      const activeToken = token || localStorage.getItem('token'); 

      if (!activeToken) {
        throw new Error('Ви не авторизовані або ваша сесія закінчилася. Будь ласка, увійдіть в акаунт знову.');
      }

      const response = await fetch('https://tattoo-shop-backend.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(orderPayload)
      });

      // Перехоплюємо помилку авторизації окремо для зручності
      if (response.status === 401) {
        throw new Error('Помилка авторизації (401 Unauthorized). Спробуйте вийти з акаунту та увійти знову.');
      }

      if (!response.ok) {
        throw new Error('Не вдалося сформувати замовлення. Спробуйте пізніше.');
      }

      const data = await response.json();
      
      setCreatedOrderId(data.orderId || data.id || 'Успішно');
      
      // Очищаємо кошик
      localStorage.removeItem('cart');
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated')); // Оновлюємо Badge в Навбарі

      setIsSuccessOpen(true);

    } catch (error) {
      console.error("Деталі помилки при створенні замовлення:", error);
      alert(error.message || 'Сталася помилка при оформленні замовлення.');
    } finally {
      // Кнопка гарантовано повернеться в робочий стан у будь-якому випадку
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setIsSuccessOpen(false);
    if (isAuth) {
      navigate('/profile');
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ backgroundColor: '#060606', minHeight: '100vh', padding: '60px 0 120px 0', color: '#fff', fontFamily: 'sans-serif' }}>
      <Container maxWidth="lg">
        
        <Typography variant="h4" sx={{ fontWeight: '900', color: '#fff', mb: 5, letterSpacing: '1px' }}>
          ОФОРМЛЕННЯ <span style={{ color: '#ff4081' }}>ЗАМОВЛЕННЯ</span>
        </Typography>

        <Grid container spacing={4}>
          
          {/* ЛІВА ЧАСТИНА: ФОРМА ДАНИХ ДОСТАВКИ */}
          <Grid item xs={12} md={7}>
            <Paper component="form" onSubmit={handleSubmitOrder} sx={{ p: 4, backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '24px' }}>
              <Typography variant="h6" sx={{ fontWeight: '800', color: '#fff', mb: 3, textTransform: 'uppercase', fontSize: '16px', letterSpacing: '1px' }}>
                📍 Інформація про доставку
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required fullWidth label="Ім'я одержувача" name="name" value={shippingData.name} onChange={handleInputChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} >
                  <TextField
                    required fullWidth label="Контактний телефон" name="phone" value={shippingData.phone} onChange={handleInputChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth label="Електронна пошта (для сповіщень)" name="email" value={shippingData.email} onChange={handleInputChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required fullWidth label="Місто" name="city" value={shippingData.city} onChange={handleInputChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required fullWidth label="Відділення НП / Адреса" name="address" placeholder="Напр: Нова Пошта №5" value={shippingData.address} onChange={handleInputChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputStyles}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth multiline rows={3} label="Коментар до замовлення" name="comment" value={shippingData.comment} onChange={handleInputChange}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={inputStyles}
                  />
                </Grid>
              </Grid>

              <Button 
                type="submit" fullWidth disabled={isSubmitting || cartItems.length === 0}
                sx={{ 
                  mt: 4, py: 2, background: 'linear-gradient(135deg, #ff4081 0%, #bd00ff 100%)', color: '#fff', fontWeight: '800', fontSize: '15px', borderRadius: '14px', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 20px rgba(255,64,129,0.35)', transition: 'all 0.3s ease',
                  '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 6px 25px rgba(255,64,129,0.5)' },
                  '&:disabled': { background: '#222', color: '#555' }
                }}
              >
                {isSubmitting ? 'Обробка замовлення...' : `ПІДТВЕРДИТИ ЗАМОВЛЕННЯ • ${calculateTotal()} грн`}
              </Button>
            </Paper>
          </Grid>

          {/* ПРАВА ЧАСТИНА: СУМАРНИЙ ЧЕК ТОВАРІВ */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 4, backgroundColor: 'rgba(12, 12, 12, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 64, 129, 0.15)', borderRadius: '24px' }}>
              <Typography variant="h6" sx={{ fontWeight: '800', color: '#fff', mb: 3, textTransform: 'uppercase', fontSize: '16px', letterSpacing: '1px' }}>
                📋 Склад замовлення
              </Typography>

              {cartItems.length === 0 ? (
                <Typography sx={{ color: '#555' }}>Товари відсутні</Typography>
              ) : (
                <>
                  <TableContainer sx={{ background: 'transparent', maxHeight: '350px', overflowY: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ color: '#777', fontWeight: '700', borderBottom: '1px solid #222', px: 0 }}>Товар</TableCell>
                          <TableCell align="center" sx={{ color: '#777', fontWeight: '700', borderBottom: '1px solid #222' }}>К-сть</TableCell>
                          <TableCell align="right" sx={{ color: '#777', fontWeight: '700', borderBottom: '1px solid #222', px: 0 }}>Сума</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cartItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell sx={{ color: '#eee', borderBottom: '1px solid #141414', py: 1.5, px: 0, fontWeight: '500', fontSize: '13px' }}>{item.title}</TableCell>
                            <TableCell align="center" sx={{ color: '#888', borderBottom: '1px solid #141414', py: 1.5 }}>x{item.quantity || 1}</TableCell>
                            <TableCell align="right" sx={{ color: '#fff', borderBottom: '1px solid #141414', py: 1.5, px: 0, fontWeight: '700', fontSize: '13px' }}>{item.price * (item.quantity || 1)} ₴</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 3, pt: 3, borderTop: '1px dashed #222' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>Доставка</Typography>
                      <Typography variant="body2" sx={{ color: '#00e676', fontWeight: '700' }}>За тарифами перевізника</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Typography variant="body1" sx={{ color: '#aaa', fontWeight: '700' }}>Всього до сплати:</Typography>
                      <Typography variant="h5" sx={{ color: '#ff4081', fontWeight: '900' }}>{calculateTotal()} грн</Typography>
                    </Box>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

        </Grid>
      </Container>

      {/* МОДАЛКА УСПІШНОГО ОФОРМЛЕННЯ ЗАМОВЛЕННЯ */}
      <Dialog 
        open={isSuccessOpen} 
        onClose={handleCloseSuccessDialog}
        slotProps={{
          backdrop: {
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }
          }
        }}
        PaperProps={{ 
          sx: { 
            bgcolor: '#0d0d0d', 
            color: '#fff', 
            border: '1px solid rgba(0, 230, 118, 0.25)', 
            borderRadius: '28px', 
            boxShadow: '0px 0px 35px rgba(0, 230, 118, 0.15)',
            p: 1, 
            textAlign: 'center', 
            maxWidth: '420px',
            backgroundImage: 'none'
          } 
        }}
      >
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
            <CheckCircleOutlineIcon sx={{ color: '#00e676', fontSize: '80px', filter: 'drop-shadow(0px 0px 15px rgba(0, 230, 118, 0.4))' }} />
          </Box>
          
          <Typography variant="h5" sx={{ fontWeight: '900', color: '#fff', mb: 2, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Замовлення прийнято!
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 4, px: 1, lineHeight: '1.6', fontSize: '14px' }}>
            Дякуємо за покупку! Замовлення <span style={{ color: '#bd00ff', fontWeight: '800', letterSpacing: '0.5px' }}>#{createdOrderId}</span> успішно згенеровано. Наш менеджер вже готує ТТН. Звіт відправлено на вказану пошту.
          </Typography>
          
          <Button 
            fullWidth 
            variant="contained" 
            onClick={handleCloseSuccessDialog}
            sx={{ 
              background: 'linear-gradient(135deg, #00e676 0%, #00b0ff 100%)', 
              color: '#000', 
              fontWeight: '900', 
              fontSize: '15px',
              py: 1.8, 
              borderRadius: '14px', 
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              boxShadow: '0px 5px 20px rgba(0, 230, 118, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-2px)',
                boxShadow: '0px 8px 25px rgba(0, 230, 118, 0.5)'
              } 
            }}
          >
            Чудово
          </Button>
        </DialogContent>
      </Dialog>

    </div>
  );
}

const inputStyles = {
  '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.5) !important', fontWeight: '600' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#ff4081 !important' },
  '& .MuiOutlinedInput-root': {
    '& input, & textarea': { color: '#ffffff !important', fontWeight: '500' },
    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1) !important', borderRadius: '12px' },
    '&:hover fieldset': { borderColor: '#ff4081 !important' },
    '&.Mui-focused fieldset': { borderColor: '#ff4081 !important' },
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    transition: 'all 0.3s ease'
  }
};