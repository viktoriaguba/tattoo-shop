import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, TextField, Button, Paper, Avatar, Chip, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserSuccess, logout } from '../store/authSlice';

export default function Profile() {
  const { isAuth, user, token } = useSelector((state) => state.auth || { isAuth: false, user: null, token: null });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    email: '',
    city: ''
  });

  // Модалки
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Стейты для Кошика та Історії замовлень
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // 1. Завантаження даних профілю
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        city: user.city || ''
      });
    }
  }, [user, isEditing]);

  // 2. Завантаження кошика з localStorage та історії замовлень з бекенду
  useEffect(() => {
    if (isAuth) {
      loadCart();
      fetchOrders();
    }
  }, [isAuth]);

  const loadCart = () => {
    try {
      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(currentCart);
    } catch (error) {
      console.error("Помилка зчитування кошика:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await fetch('https://tattoo-shop-backend.onrender.com/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Помилка отримання замовлень:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Керування кількістю в кошику
  const updateQuantity = (id, delta) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQty = (item.quantity || 1) + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cartUpdated')); // Оновлюємо Badge в Навбарі
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);
    window.dispatchEvent(new Event('cartUpdated')); // Оновлюємо Badge в Навбарі
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  };

  if (!isAuth) {
    return (
      <div style={{ backgroundColor: '#060606', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
        <Box sx={{ textAlign: 'center', p: 4, backgroundColor: '#0f0f0f', borderRadius: '20px', border: '1px solid #222' }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: '700' }}>Ви не увійшли в профіль</Typography>
          <Button variant="contained" onClick={() => navigate('/register')} sx={{ background: 'linear-gradient(135deg, #ff4081 0%, #bd00ff 100%)', fontWeight: '700' }}>
            Створити аккаунт
          </Button>
        </Box>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (!token) {
        alert('Сесія застаріла. Будь ласка, переувійдіть в акаунт.');
        handleLogoutClick();
        return;
      }

      const response = await fetch('https://tattoo-shop-backend.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(editData)
      });

      if (response.status === 401 || response.status === 403) {
        alert('Помилка авторизації. Переувійдіть в профіль.');
        handleLogoutClick();
        return;
      }

      if (!response.ok) throw new Error('Не вдалося зберегти дані');

      const data = await response.json();
      const updatedUser = data.user || { ...user, ...editData };
      dispatch(updateUserSuccess(updatedUser));
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert('Сталася помилка при збереженні даних.');
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      return alert('Будь ласка, заповніть обидва поля');
    }
    try {
      const response = await fetch('https://tattoo-shop-backend.onrender.com/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Помилка при зміні пароля');
      }

      alert('Пароль успішно змінено!');
      setOpenPasswordDialog(false);
      setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      if (!token) {
        alert('Сесія застаріла. Будь ласка, переувійдіть в акаунт.');
        handleLogoutClick();
        return;
      }

      const response = await fetch('https://tattoo-shop-backend.onrender.com/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Помилка сервера: ${response.status}`);
      }

      alert('Код підтвердження надіслано на вашу електронну пошту!');
      setOpenVerifyDialog(true);
    } catch (err) {
      console.error(err);
      alert(`Не вдалося надіслати код. Причина: ${err.message}`);
    }
  };

  const handleVerifyCodeSubmit = async () => {
    if (verificationCode.trim().length !== 6) {
      return alert('Введіть коректний 6-значний код');
    }
    try {
      const response = await fetch('https://tattoo-shop-backend.onrender.com/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: verificationCode })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Невірний або застарілий код.');
      }

      alert('Email успішно підтверджено!');
      setOpenVerifyDialog(false);
      setVerificationCode('');
      dispatch(updateUserSuccess({ ...user, isVerified: true }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogoutClick = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div style={{ backgroundColor: '#060606', minHeight: '100vh', padding: '60px 0 120px 0', color: '#fff', fontFamily: 'sans-serif' }}>
      <Container maxWidth="lg">
        {/* ВЕРХНЯ ЧАСТИНА: ПРОФІЛЬ */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: '40px', alignItems: 'flex-start', mb: 5 }}>
          
          {/* ЛІВА ЧАСТИНА — СТАТУС-КАРТКА */}
          <Paper sx={{ p: 4, width: { xs: '100%', md: '300px' }, backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '24px', textAlign: 'center', boxSizing: 'border-box' }}>
            <Avatar sx={{ width: 90, height: 90, margin: '0 auto 20px auto', fontSize: '30px', fontWeight: '900', background: 'linear-gradient(135deg, #ff4081 0%, #bd00ff 100%)', color: '#fff' }}>
              {user?.name ? user.name[0] : 'U'}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: '800', color: '#fff' }}>{user?.name}</Typography>
            <Typography variant="body2" sx={{ color: '#ff4081', mt: 0.5, textTransform: 'uppercase', fontWeight: '800', fontSize: '11px', letterSpacing: '1px' }}>
              {user?.role === 'admin' ? 'Administrator' : 'Tattoo Artist'}
            </Typography>
            
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {user?.isVerified ? (
                <Chip label="✓   Email підтверджено" sx={{ backgroundColor: 'rgba(0, 230, 118, 0.08)', color: '#00e676', fontWeight: '700', border: '1px solid rgba(0, 230, 118, 0.15)', fontSize: '12px' }} />
              ) : (
                <Chip label="⚠️   Email не підтверджено" onClick={handleSendVerificationEmail} sx={{ backgroundColor: 'rgba(255, 23, 68, 0.08)', color: '#ff1744', fontWeight: '700', border: '1px solid rgba(255, 23, 68, 0.2)', fontSize: '12px', '&:hover': { bgcolor: 'rgba(255, 23, 68, 0.2)' }, cursor: 'pointer' }} />
              )}
            </Box>

            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button fullWidth variant="outlined" onClick={() => setOpenPasswordDialog(true)} sx={{ color: '#ccc', borderColor: '#333', fontWeight: '700', textTransform: 'none', borderRadius: '12px', '&:hover': { borderColor: '#bd00ff', color: '#fff' } }}>
                Змінити пароль
              </Button>
              <Button fullWidth onClick={handleLogoutClick} sx={{ color: '#555', '&:hover': { color: '#ff4081' }, fontWeight: '700', textTransform: 'none' }}>
                Вийти з облікового запису
              </Button>
            </Box>
          </Paper>

          {/* ПРАВА ЧАСТИНА — ФОРМА ДАНИХ */}
          <Paper sx={{ p: 4, flex: 1, backgroundColor: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '24px', boxSizing: 'border-box', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: '15px' }}>
              <Typography variant="h5" sx={{ fontWeight: '900', color: '#fff' }}>
                ПЕРСОНАЛЬНІ <span style={{ color: '#ff4081' }}>ДАНІ</span>
              </Typography>
              
              {isEditing ? (
                <Box sx={{ display: 'flex', gap: '12px' }}>
                  <Button variant="outlined" onClick={() => setIsEditing(false)} sx={{ color: '#fff', borderColor: '#333', fontWeight: '700' }}>Скасувати</Button>
                  <Button variant="contained" onClick={handleSave} sx={{ backgroundColor: '#ff4081', color: '#fff', fontWeight: '700', '&:hover': { backgroundColor: '#bd00ff' } }}>Зберегти</Button>
                </Box>
              ) : (
                <Button variant="outlined" onClick={() => setIsEditing(true)} sx={{ color: '#ff4081', borderColor: '#ff4081', fontWeight: '700', '&:hover': { borderColor: '#bd00ff', color: '#bd00ff' } }}>Редагувати дані</Button>
              )}
            </Box>

            <Grid container spacing={3}>
              {[
                { label: "Ім'я", name: 'name' },
                { label: 'Contatct Number', name: 'phone' },
                { label: 'Електронна пошта', name: 'email' },
                { label: 'Місто розташування', name: 'city' }
              ].map((field) => (
                <Grid item xs={12} sm={6} key={field.name}>
                  <TextField
                    fullWidth label={field.label} name={field.name} type="text" disabled={!isEditing}
                    value={isEditing ? editData[field.name] : (user?.[field.name] || '—')}
                    onChange={handleInputChange} slotProps={{ inputLabel: { shrink: true } }}
                    sx={{
                      '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.6) !important', fontWeight: '600' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#ff4081 !important' },
                      '& .MuiOutlinedInput-root': {
                        '& input': { color: '#ffffff !important', WebkitTextFillColor: '#ffffff !important', fontWeight: '500' },
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15) !important' },
                        '&:hover fieldset': { borderColor: isEditing ? '#ff4081 !important' : 'rgba(255, 255, 255, 0.3) !important' },
                        '&.Mui-focused fieldset': { borderColor: '#ff4081 !important' },
                        backgroundColor: isEditing ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                        transition: 'background-color 0.3s ease',
                        '&.Mui-disabled fieldset': { borderColor: 'rgba(255, 255, 255, 0.05) !important' }
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>

        {/* ==================================================== */}
        {/* БЛОК 1: 🛒 ТВІЙ КОШИК (ЕКСКЛЮЗИВНИЙ НЕОН-СТИЛЬ) */}
        {/* ==================================================== */}
        <Paper id="profile-cart-section" sx={{ p: 4, mb: 5, backgroundColor: 'rgba(12, 12, 12, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 64, 129, 0.15)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(255, 64, 129, 0.05)' }}>
          <Typography variant="h5" sx={{ fontWeight: '900', color: '#fff', mb: 3, display: 'flex', alignItems: 'center', gap: '10px' }}>
            🛒 ТВІЙ <span style={{ color: '#ff4081' }}>КОШИК</span>
          </Typography>

          {cartItems.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>Кошик порожній. Обери найкраще приладдя для тату в нашому каталозі!</Typography>
              <Button variant="outlined" onClick={() => navigate('/catalog')} sx={{ color: '#ff4081', borderColor: '#ff4081', '&:hover': { borderColor: '#bd00ff' } }}>Перейти до каталогу</Button>
            </Box>
          ) : (
            <>
              <TableContainer sx={{ background: 'transparent' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#aaa', fontWeight: '700', borderBottom: '1px solid #222' }}>Товар</TableCell>
                      <TableCell align="center" sx={{ color: '#aaa', fontWeight: '700', borderBottom: '1px solid #222' }}>Ціна</TableCell>
                      <TableCell align="center" sx={{ color: '#aaa', fontWeight: '700', borderBottom: '1px solid #222' }}>Кількість</TableCell>
                      <TableCell align="center" sx={{ color: '#aaa', fontWeight: '700', borderBottom: '1px solid #222' }}>Сума</TableCell>
                      <TableCell align="center" sx={{ color: '#aaa', fontWeight: '700', borderBottom: '1px solid #222' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.01)' } }}>
                        <TableCell sx={{ color: '#fff', borderBottom: '1px solid #141414', fontWeight: '600' }}>{item.title}</TableCell>
                        <TableCell align="center" sx={{ color: '#fff', borderBottom: '1px solid #141414' }}>{item.price} грн</TableCell>
                        <TableCell align="center" sx={{ borderBottom: '1px solid #141414' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <IconButton size="small" onClick={() => updateQuantity(item.id, -1)} sx={{ color: '#aaa', border: '1px solid #333' }}><RemoveIcon fontSize="small" /></IconButton>
                            <Typography sx={{ color: '#fff', minWidth: '25px', textAlign: 'center', fontWeight: '700' }}>{item.quantity || 1}</Typography>
                            <IconButton size="small" onClick={() => updateQuantity(item.id, 1)} sx={{ color: '#aaa', border: '1px solid #333' }}><AddIcon fontSize="small" /></IconButton>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ color: '#ff4081', fontWeight: '700', borderBottom: '1px solid #141414' }}>{item.price * (item.quantity || 1)} грн</TableCell>
                        <TableCell align="center" sx={{ borderBottom: '1px solid #141414' }}>
                          <IconButton onClick={() => removeItem(item.id)} sx={{ color: '#555', '&:hover': { color: '#ff1744' } }}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 3, borderTop: '1px dashed #222', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ color: '#aaa', fontWeight: '700' }}>
                  ЗАГАЛЬНА ВАРТІСТЬ: <span style={{ color: '#ff4081', fontSize: '24px', fontWeight: '900', marginLeft: '10px' }}>{calculateTotal()} грн</span>
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/checkout')}
                  sx={{ background: 'linear-gradient(135deg, #ff4081 0%, #bd00ff 100%)', color: '#fff', fontWeight: '800', px: 4, py: 1.5, borderRadius: '12px', boxShadow: '0 4px 20px rgba(255,64,129,0.4)', '&:hover': { transform: 'translateY(-1px)' } }}
                >
                  Перейти до оформлення
                </Button>
              </Box>
            </>
          )}
        </Paper>

        {/* ==================================================== */}
        {/* БЛОК 2: 📦 ІСТОРІЯ ЗАМОВЛЕНЬ */}
        {/* ==================================================== */}
        <Paper id="profile-orders-section" sx={{ p: 4, backgroundColor: 'rgba(12, 12, 12, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(189, 0, 255, 0.15)', borderRadius: '24px', boxShadow: '0 8px 32px rgba(189, 0, 255, 0.05)' }}>
          <Typography variant="h5" sx={{ fontWeight: '900', color: '#fff', mb: 3, display: 'flex', alignItems: 'center', gap: '10px' }}>
            📦 ІСТОРІЯ <span style={{ color: '#bd00ff' }}>ЗАМОВЛЕНЬ</span>
          </Typography>

          {loadingOrders ? (
            <Typography sx={{ color: '#666' }}>Завантаження історії...</Typography>
          ) : orders.length === 0 ? (
            <Typography sx={{ color: '#666', py: 2 }}>Ви ще не здійснювали замовлень на нашому сайті.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {orders.map((order) => (
                <Box key={order.id} sx={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderLeft: '4px solid #bd00ff', borderRadius: '14px', p: 3, transition: 'all 0.2s', '&:hover': { borderColor: '#333' } }}>
                  <Grid container spacing={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Grid item xs={12} sm={4}>
                      <Typography sx={{ color: '#fff', fontWeight: '800', fontSize: '15px' }}>Замовлення №{order.id}</Typography>
                      <Typography sx={{ color: '#555', fontSize: '12px', mt: 0.5 }}>{new Date(order.createdAt).toLocaleString('uk-UA')}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={5}>
                      <Box sx={{ color: '#aaa', fontSize: '13px' }}>
                        {Array.isArray(order.items) ? order.items.map((it, idx) => (
                          <div key={idx} style={{ color: '#eee', padding: '2px 0' }}>• {it.title} <span style={{ color: '#666' }}>(x{it.quantity || 1})</span></div>
                        )) : 'Деталі замовлення в обробці'}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography sx={{ color: '#555', fontSize: '12px' }}>Сума замовлення</Typography>
                      <Typography sx={{ color: '#ff4081', fontWeight: '900', fontSize: '18px', mt: 0.5 }}>{order.totalPrice} грн</Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </Paper>

      </Container>

      {/* МОДАЛКА: ЗМІНА ПАРОЛЯ */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} PaperProps={{ sx: { bgcolor: '#0f0f0f', color: '#fff', border: '1px solid #222', borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#ff4081' }}>Зміна пароля доступу</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: '320px', mt: 1 }}>
          <TextField 
            label="Поточний пароль" type="password" fullWidth
            value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
            slotProps={{ input: { sx: { color: '#fff' } }, inputLabel: { sx: { color: '#888' } } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#ff4081' } } }}
          />
          <TextField 
            label="Новий пароль" type="password" fullWidth
            value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            slotProps={{ input: { sx: { color: '#fff' } }, inputLabel: { sx: { color: '#888' } } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#ff4081' } } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)} sx={{ color: '#aaa' }}>Скасувати</Button>
          <Button onClick={handleChangePasswordSubmit} sx={{ color: '#ff4081', fontWeight: 'bold' }}>Оновити</Button>
        </DialogActions>
      </Dialog>

      {/* МОДАЛКА: ВЕРИФІКАЦІЯ EMAIL */}
      <Dialog open={openVerifyDialog} onClose={() => setOpenVerifyDialog(false)} PaperProps={{ sx: { bgcolor: '#0f0f0f', color: '#fff', border: '1px solid #222', borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#ff4081' }}>Підтвердження Email</DialogTitle>
        <DialogContent sx={{ minWidth: '320px', mt: 1 }}>
          <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>Ми відправили секретний ключ на вашу адресу. Введіть його сюди:</Typography>
          <TextField 
            label="6-значний код" fullWidth placeholder="000000"
            value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}
            slotProps={{ input: { sx: { color: '#fff', letterSpacing: '4px', textAlign: 'center', fontSize: '18px' } }, inputLabel: { sx: { color: '#888' } } }}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#333' }, '&:hover fieldset': { borderColor: '#ff4081' } } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVerifyDialog(false)} sx={{ color: '#aaa' }}>Закрити</Button>
          <Button onClick={handleVerifyCodeSubmit} sx={{ color: '#ff4081', fontWeight: 'bold' }}>Підтвердити</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}