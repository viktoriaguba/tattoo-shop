import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';

export default function CartModal({ open, onClose }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  };

  useEffect(() => {
    if (open) loadCart();
  }, [open]);

  useEffect(() => {
    window.addEventListener('storage', loadCart);
    return () => window.removeEventListener('storage', loadCart);
  }, []);

  const handleUpdateQuantity = (productId, amount) => {
    const updatedCart = cartItems.map(item => {
      if ((item.id || item._id) === productId) {
        const newQty = item.quantity + amount;
        return { ...item, quantity: newQty < 1 ? 1 : newQty };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleRemoveItem = (productId) => {
    const updatedCart = cartItems.filter(item => (item.id || item._id) !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('storage'));
  };

  const handleClearCart = () => {
    localStorage.removeItem('cart');
    setCartItems([]);
    window.dispatchEvent(new Event('storage'));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Будь ласка, увійдіть в акаунт, щоб оформити замовлення!");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id || item._id,
          title: item.title,
          price: item.price,
          quantity: item.quantity
        })),
        totalPrice: totalPrice
      };

      const response = await axios.post(
        'http://localhost:5000/api/orders', 
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Замовлення успішно оформлено!');
        handleClearCart();
        if (onClose) onClose();
      }
    } catch (err) {
      console.error("Помилка створення замовлення:", err);
      try {
        const responseAlt = await axios.post(
          'http://localhost:5000/api/orders/create',
          { items: cartItems, totalPrice },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (responseAlt.status === 200 || responseAlt.status === 201) {
          alert('Замовлення успішно оформлено!');
          handleClearCart();
          if (onClose) onClose();
        }
      } catch (altErr) {
        alert('Помилка сервера при оформленні замовлення.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth
      maxWidth="xs"
      onClick={(e) => e.stopPropagation()} // Захист від закриття при кліках всередині кошика
      PaperProps={{
        style: {
          backgroundColor: '#141414',
          color: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #262626',
          boxShadow: '0px 10px 30px rgba(0,0,0,0.7)',
          overflow: 'hidden'
        }
      }}
    >
      {/* ШАПКА КОШИКА (Фіксоване позиціонування елементів) */}
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', backgroundColor: '#141414' }}>
        <Typography style={{ fontSize: '20px', fontWeight: '700', color: '#ff4081', fontFamily: 'inherit' }}>
          Ваш Кошик ({cartItems.length})
        </Typography>
        <IconButton 
          onClick={() => { if (onClose) onClose(); }} 
          style={{ color: '#888888', padding: '4px', transition: 'color 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#888888'}
        >
          <CloseIcon style={{ fontSize: '24px' }} />
        </IconButton>
      </Box>

      <Divider style={{ backgroundColor: '#262626', margin: '0 24px' }} />

      {/* КОНТЕНТ З ТОВАРАМИ */}
      <DialogContent style={{ padding: '20px 24px', backgroundColor: '#141414', maxHeight: '360px', overflowY: 'auto' }}>
        {cartItems.length === 0 ? (
          <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
            <Typography style={{ color: '#666666', fontSize: '15px', textAlign: 'center' }}>
              Кошик порожній
            </Typography>
          </Box>
        ) : (
          cartItems.map((item) => {
            const itemId = item.id || item._id;
            return (
              <Box 
                key={itemId} 
                style={{ 
                  display: 'flex', 
                  gap: '14px', 
                  backgroundColor: '#1c1c1c', 
                  padding: '12px', 
                  borderRadius: '12px', 
                  marginBottom: '12px',
                  alignItems: 'center',
                  border: '1px solid #282828'
                }}
              >
                <img 
                  src={item.image || 'https://via.placeholder.com/65'} 
                  alt={item.title} 
                  style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#333' }}
                />

                <Box style={{ flexGrow: 1 }}>
                  <Typography style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </Typography>
                  <Typography style={{ fontSize: '13px', color: '#ff4081', fontWeight: '700', marginTop: '4px' }}>
                    {Number(item.price).toLocaleString()} грн
                  </Typography>

                  {/* СТИЛЬНІ КНОПКИ КІЛЬКОСТІ */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleUpdateQuantity(itemId, -1)}
                      style={{ color: '#ffffff', backgroundColor: '#2d2d2d', width: '22px', height: '22px', padding: 0 }}
                    >
                      <RemoveIcon style={{ fontSize: '12px' }} />
                    </IconButton>
                    
                    <Typography style={{ fontSize: '14px', fontWeight: '600', minWidth: '14px', textAlign: 'center', color: '#fff' }}>
                      {item.quantity}
                    </Typography>
                    
                    <IconButton 
                      size="small" 
                      onClick={() => handleUpdateQuantity(itemId, 1)}
                      style={{ color: '#ffffff', backgroundColor: '#2d2d2d', width: '22px', height: '22px', padding: 0 }}
                    >
                      <AddIcon style={{ fontSize: '12px' }} />
                    </IconButton>
                  </Box>
                </Box>

                <IconButton 
                  onClick={() => handleRemoveItem(itemId)} 
                  style={{ color: '#555555', transition: 'color 0.2s', padding: '8px' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef5350'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#555555'}
                >
                  <DeleteIcon style={{ fontSize: '20px' }} />
                </IconButton>
              </Box>
            );
          })
        )}
      </DialogContent>

      {/* НИЖНЯ ПАНЕЛЬ */}
      {cartItems.length > 0 && (
        <>
          <Divider style={{ backgroundColor: '#262626', margin: '0 24px' }} />
          <DialogActions style={{ flexDirection: 'column', padding: '20px 24px', gap: '16px', backgroundColor: '#141414' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Typography style={{ color: '#888888', fontSize: '14px' }}>Загальна сума:</Typography>
              <Typography style={{ fontWeight: '700', fontSize: '18px', color: '#ff4081' }}>
                {totalPrice.toLocaleString()} грн
              </Typography>
            </Box>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <Button 
                variant="contained" 
                fullWidth
                disabled={loading}
                style={{ 
                  backgroundColor: '#ff4081', 
                  color: '#ffffff', 
                  fontWeight: '700', 
                  textTransform: 'none', 
                  borderRadius: '8px', 
                  padding: '12px',
                  fontSize: '15px',
                  boxShadow: 'none'
                }}
                onClick={handleCheckout}
              >
                {loading ? 'Обробка...' : 'Оформити замовлення'}
              </Button>
              
              <Button 
                variant="text" 
                fullWidth
                style={{ color: '#666666', textTransform: 'none', fontSize: '13px', transition: 'color 0.2s' }}
                onClick={handleClearCart}
                onMouseEnter={(e) => e.currentTarget.style.color = '#999999'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
              >
                Очистити кошик
              </Button>
            </Box>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}