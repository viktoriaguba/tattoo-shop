import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Badge, IconButton, Button, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import InfoIcon from '@mui/icons-material/Info';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authState = useSelector((state) => state.auth || {});
  const isAuth = authState.isAuth || false;
  const user = authState.user || null;

  const [totalItems, setTotalItems] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false); // Стан для мобільного меню

  const updateCartBadge = () => {
    try {
      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      const count = currentCart.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setTotalItems(count);
    } catch (error) {
      console.error("Помилка при зчитуванні кошика:", error);
      setTotalItems(0);
    }
  };

  useEffect(() => {
    updateCartBadge();
    window.addEventListener('storage', updateCartBadge);
    window.addEventListener('cartUpdated', updateCartBadge);
    return () => {
      window.removeEventListener('storage', updateCartBadge);
      window.removeEventListener('cartUpdated', updateCartBadge);
    };
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; 
    } catch (error) {
      navigate('/');
    }
  };

  const navigateToProfileSection = (sectionId) => {
    setMobileOpen(false); // Закриваємо мобільне меню при кліку
    if (!isAuth) {
      navigate('/register');
      return;
    }
    navigate('/profile');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'rgba(10, 10, 10, 0.85)', 
          backdropFilter: 'blur(16px)', 
          borderBottom: '1px solid rgba(255, 64, 129, 0.15)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
          height: '75px',
          justifyContent: 'center',
          zIndex: 1200
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, md: 5 } }}>
          
          {/* МОБІЛЬНА КНОПКА ГАМБУРГЕРА (Показується тільки на xs та sm екранах) */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' }, color: '#ff4081' }}
          >
            <MenuIcon sx={{ fontSize: '28px' }} />
          </IconButton>

          {/* НЕОНОВИЙ ЛОГОТИП */}
          <Box 
            onClick={() => { navigate('/'); setMobileOpen(false); }} 
            className="neon-logo-wrapper"
            sx={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
          >
            <span className="logo-icon-flash">⚡</span>
            <Typography 
              variant="h6" 
              className="neon-text-flicker"
              sx={{ fontWeight: '900', color: '#ff4081', letterSpacing: '2px', fontSize: { xs: '16px', sm: '19px' } }}
            >
              TATTOO SHOP
            </Typography>
          </Box>

          {/* ДЕСКТОПНЕ НАВІГАЦІЙНЕ МЕНЮ (Приховується на мобільних за допомогою display: none) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '8px' }}>
            {['Головна', 'Каталог', 'Про нас'].map((label, index) => {
              const paths = ['/', '/catalog', '/about'];
              return (
                <Button 
                  key={label}
                  component={Link} 
                  to={paths[index]} 
                  className="modern-nav-btn"
                  sx={{ 
                    fontWeight: '700', fontSize: '13px', letterSpacing: '1px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase',
                    px: 2, py: 1, borderRadius: '8px', transition: 'all 0.3s ease',
                    '&:hover': { color: '#fff', background: 'rgba(255,255,255,0.03)' }
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>

          {/* ПРАВА ЧАСТИНА (ПРОФІЛЬ ТА КОШИК) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: '8px', md: '12px' } }}>
            
            {/* КНОПКА КОШИКА (Завжди видима, адаптовані падінги) */}
            <IconButton 
              onClick={() => navigateToProfileSection('profile-cart-section')}
              className="action-icon-btn cart-btn-glow"
              sx={{ color: '#fff', p: { xs: '8px', md: '10px' }, background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}
              title="Мій Кошик"
            >
              <Badge 
                badgeContent={totalItems} 
                sx={{ '& .MuiBadge-badge': { backgroundColor: '#ff4081', color: '#fff', fontWeight: '800' } }}
              >
                <ShoppingCartIcon sx={{ fontSize: { xs: '20px', md: '21px' } }} />
              </Badge>
            </IconButton>

            {/* ДЕСКТОПНА ПАНЕЛЬ КОРИСТУВАЧА (Приховується на xs та sm) */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              {isAuth && user ? (
                <Box className="user-control-capsule">
                  {user.role === 'admin' && (
                    <IconButton onClick={() => navigate('/admin')} className="capsule-icon-btn admin-glow" title="Панель адміна">
                      <AdminPanelSettingsIcon sx={{ fontSize: '20px' }} />
                    </IconButton>
                  )}
                  
                  <Box onClick={() => navigate('/profile')} className="user-identity-badge" sx={{ cursor: 'pointer' }}>
                    <AccountCircleIcon sx={{ color: user.role === 'admin' ? '#ff4081' : '#00b0ff', fontSize: '18px' }} />
                    <Typography variant="body2" className="user-name-text">
                      {user.name || 'Профіль'}
                    </Typography>
                  </Box>
                  
                  <IconButton 
                    onClick={() => navigateToProfileSection('profile-orders-section')} 
                    className="capsule-icon-btn history-glow" 
                    title="Історія замовлень"
                  >
                    <HistoryIcon sx={{ fontSize: '20px' }} />
                  </IconButton>
                  
                  <IconButton onClick={handleLogout} className="capsule-icon-btn logout-glow" title="Вийти з акаунту">
                    <LogoutIcon sx={{ fontSize: '19px' }} />
                  </IconButton>
                </Box>
              ) : (
                <Button 
                  variant="contained" size="small" onClick={() => navigate('/register')} className="cyber-login-btn"
                  sx={{ 
                    background: 'linear-gradient(135deg, #ff4081 0%, #bd00ff 100%)', color: '#fff', fontWeight: '700',
                    borderRadius: '12px', px: 3, py: '8px', textTransform: 'uppercase', fontSize: '12px',
                    boxShadow: '0 4px 15px rgba(255, 64, 129, 0.35)'
                  }}
                >
                  Увійти
                </Button>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* МОБІЛЬНЕ ВИСУВНЕ МЕНЮ (DRAWER) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Кращий рендеринг на мобільних
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '280px', 
            background: '#0a0a0a', 
            color: '#fff',
            borderRight: '1px solid rgba(255, 64, 129, 0.15)',
            p: 2
          },
        }}
      >
        {/* Кнопка закриття меню */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={handleDrawerToggle} sx={{ color: '#fff' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Навігаційні посилання всередині шторки */}
        <List sx={{ pt: 0 }}>
          {[
            { label: 'Головна', path: '/', icon: <HomeIcon /> },
            { label: 'Каталог', path: '/catalog', icon: <StorefrontIcon /> },
            { label: 'Про нас', path: '/about', icon: <InfoIcon /> }
          ].map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton 
                component={Link} 
                to={item.path} 
                onClick={handleDrawerToggle}
                sx={{ borderRadius: '10px', mb: 1, '&:hover': { background: 'rgba(255,255,255,0.05)' } }}
              >
                <ListItemIcon sx={{ color: '#ff4081', minWidth: '40px' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: '700', fontSize: '15px' } } }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.08)', my: 2 }} />

        {/* Секція профілю користувача всередині шторки */}
        <Box sx={{ mt: 'auto', mb: 2 }}>
          {isAuth && user ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box 
                onClick={() => { navigate('/profile'); handleDrawerToggle(); }}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', cursor: 'pointer' }}
              >
                <AccountCircleIcon sx={{ color: user.role === 'admin' ? '#ff4081' : '#00b0ff', fontSize: '26px' }} />
                <Typography sx={{ fontWeight: '800', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name || 'Мій Профіль'}
                </Typography>
              </Box>

              {user.role === 'admin' && (
                <Button 
                  fullWidth variant="text" startIcon={<AdminPanelSettingsIcon />} onClick={() => { navigate('/admin'); handleDrawerToggle(); }}
                  sx={{ color: '#ff4081', justifyContent: 'flex-start', fontWeight: '700', borderRadius: '10px', py: 1 }}
                >
                  Адмін Панель
                </Button>
              )}

              <Button 
                fullWidth variant="text" startIcon={<HistoryIcon />} onClick={() => navigateToProfileSection('profile-orders-section')}
                sx={{ color: '#00b0ff', justifyContent: 'flex-start', fontWeight: '700', borderRadius: '10px', py: 1 }}
              >
                Історія замовлень
              </Button>

              <Button 
                fullWidth variant="contained" startIcon={<LogoutIcon />} onClick={handleLogout}
                sx={{ mt: 2, background: 'rgba(255, 77, 77, 0.15)', color: '#ff4d4d', fontWeight: '700', borderRadius: '10px', py: 1.2, boxShadow: 'none', '&:hover': { background: 'rgba(255, 77, 77, 0.25)' } }}
              >
                Вийти
              </Button>
            </Box>
          ) : (
            <Button 
              fullWidth variant="contained" onClick={() => { navigate('/register'); handleDrawerToggle(); }}
              sx={{ 
                background: 'linear-gradient(135deg, #ff4081 0%, #bd00ff 100%)', color: '#fff', fontWeight: '800',
                borderRadius: '12px', py: 1.5, textTransform: 'uppercase', fontSize: '13px'
              }}
            >
              Увійти в акаунт
            </Button>
          )}
        </Box>
      </Drawer>

      {/* КІБЕРПАНК СТИЛІ */}
      <style>{`
        .neon-logo-wrapper:hover .logo-icon-flash { transform: scale(1.2) rotate(15deg); color: #ff4081; }
        .logo-icon-flash { color: #fff; font-size: 20px; transition: all 0.3s ease; display: inline-block; }
        .neon-text-flicker { animation: neonFlicker 3s infinite alternate; }
        @keyframes neonFlicker {
          0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { text-shadow: 0 0 8px rgba(255, 64, 129, 0.6); }
          20%, 24%, 55% { text-shadow: none; opacity: 0.7; }
        }
        .modern-nav-btn { position: relative; }
        .modern-nav-btn::after { content: ''; position: absolute; bottom: 2px; left: 15%; width: 0; height: 2px; background: #ff4081; transition: width 0.3s ease; }
        .modern-nav-btn:hover::after { width: 70%; }
        .user-control-capsule { display: flex; align-items: center; gap: 4px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); padding: 4px; border-radius: 14px; height: 44px; }
        .user-identity-badge { display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.04); padding: 0 14px; height: 100%; border-radius: 10px; }
        .user-name-text { color: #ffffff; font-weight: 700; font-size: 13px; }
        .capsule-icon-btn { color: rgba(255, 255, 255, 0.6) !important; padding: 6px !important; }
        .admin-glow:hover { color: #ff4081 !important; }
        .history-glow:hover { color: #00b0ff !important; }
        .logout-glow:hover { color: #ff4d4d !important; }
        .cart-btn-glow:hover { background: rgba(255, 64, 129, 0.1) !important; color: #ff4081 !important; }
        .cyber-login-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255, 64, 129, 0.5); }
      `}</style>

      {/* Відступ, щоб контент сторінок не перекривався фіксованою шапкою */}
      <Box sx={{ height: '75px' }} />
    </>
  );
}