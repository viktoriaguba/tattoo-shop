import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Typography, Slider, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from 'axios';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Всі');
  const [priceRange, setPriceRange] = useState([0, 60000]);
  const [sortBy, setSortBy] = useState('newest');

  // Завантаження товарів та категорій з сервера при запуску
  useEffect(() => {
    axios.get('https://tattoo-shop-backend.onrender.com/api/products')
      .then(res => setProducts(res.data || []))
      .catch(err => console.error("Помилка завантаження товарів:", err));
      
    axios.get('https://tattoo-shop-backend.onrender.com/api/categories')
      .then(res => setCategories(res.data || []))
      .catch(err => console.error("Помилка завантаження категорій:", err));
  }, []);

  // Автономний обробник додавання до кошика через localStorage
  const handleAddToCart = (product) => {
    const pId = product.id || product._id;
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingIndex = currentCart.findIndex(item => (item.id || item._id) === pId);
    
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += 1;
    } else {
      currentCart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('storage'));
  };

  // Фільтрація та сортування товарів на клієнті
  const filteredProducts = (products || []).filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'Всі' || p.category === selectedCategory;
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return matchSearch && matchCat && matchPrice;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Рендер карток товарів
  const renderProductCards = () => {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
        {filteredProducts.map((product) => (
          <div 
            key={product.id || product._id} 
            className="premium-product-card"
            style={{ 
              flex: '1 1 calc(33.333% - 16px)',
              minWidth: '280px',
              maxWidth: 'calc(33.333% - 16px)',
              minHeight: '510px', 
              maxHeight: '510px', 
              backgroundColor: 'rgba(20, 20, 20, 0.65)',
              backdropFilter: 'blur(14px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxSizing: 'border-box',
              position: 'relative',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Контейнер зображення товару з ефектом зуму */}
            <div style={{ width: '100%', height: '220px', minHeight: '220px', overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <img 
                src={product.image || 'https://via.placeholder.com/300'} 
                alt={product.title} 
                className="product-card-img"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
              />
            </div>

            {/* Контент картки */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1, boxSizing: 'border-box' }}>
              <span style={{ color: '#ff4081', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
                // {product.category || 'Матеріали'}
              </span>

              <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '800', margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '1.3em', letterSpacing: '-0.2px' }}>
                {product.title}
              </h3>

              <p style={{ color: '#888', fontSize: '13.5px', margin: '0 0 20px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '4.5em', lineHeight: '1.6' }}>
                {product.description}
              </p>

              {/* Нижня частина: ціна + кнопка */}
              <div style={{ marginTop: 'auto', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#fff', fontSize: '19px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                    {Number(product.price).toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '700', color: '#ff4081' }}>грн</span>
                  </span>
                </div>
                
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<ShoppingCartIcon style={{ fontSize: '16px' }} />}
                  onClick={() => handleAddToCart(product)}
                  className="cyber-card-btn"
                  sx={{ 
                    background: 'linear-gradient(135deg, #ff4081 0%, #bd00ff 100%)', 
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    boxShadow: '0 4px 12px rgba(255, 64, 129, 0.2)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  В кошик
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#060606', minHeight: '100vh', padding: '60px 0 120px 0', color: '#fff', fontFamily: 'sans-serif' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          
          {/* БЛОК ФІЛЬТРАЦІЇ */}
          <Grid item xs={12} md={3}>
            <div 
              style={{ 
                padding: '28px 24px', 
                backgroundColor: 'rgba(15, 15, 15, 0.65)', 
                backdropFilter: 'blur(14px)',
                color: '#fff', 
                border: '1px solid rgba(255, 255, 255, 0.04)', 
                borderRadius: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '24px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                position: 'sticky',
                top: '105px' // Комфортна позиція при фіксованому навбарі
              }}
            >
              <Typography style={{ fontSize: '16px', fontWeight: '800', color: '#ff4081', margin: '0', letterSpacing: '2px', textTransform: 'uppercase' }}>
                // Фільтрація
              </Typography>
              
              {/* ПОШУК */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Пошук товару</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <SearchIcon style={{ position: 'absolute', left: '14px', color: '#ff4081', fontSize: '18px' }} />
                  <input 
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Введіть назву інструменту..."
                    className="custom-catalog-input"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      backgroundColor: 'rgba(255,255,255,0.02)', 
                      color: '#ffffff', 
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </div>
              </div>

              {/* КАТЕГОРІЇ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Категорія</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="custom-catalog-input"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: 'rgba(255,255,255,0.02)', 
                      color: '#ffffff', 
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      appearance: 'none',
                      WebkitAppearance: 'none'
                    }}
                  >
                    <option value="Всі" style={{ backgroundColor: '#0c0c0c', color: '#fff' }}>Всі категорії</option>
                    {categories.map(c => (
                      <option key={c.id || c._id} value={c.name} style={{ backgroundColor: '#0c0c0c', color: '#fff' }}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#ff4081', pointerEvents: 'none', fontSize: '12px' }}>▼</span>
                </div>
              </div>

              {/* СЛАЙДЕР ЦІНИ */}
              <Box style={{ padding: '0 2px' }}>
                <Typography style={{ fontSize: '12px', marginBottom: '12px', color: '#888', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Ціновий діапазон
                </Typography>
                <Slider 
                  value={priceRange} 
                  onChange={(e, val) => setPriceRange(val)} 
                  min={0} 
                  max={60000} 
                  valueLabelDisplay="auto"
                  sx={{ 
                    color: '#ff4081', 
                    height: 4,
                    '& .MuiSlider-thumb': { 
                      height: 16, 
                      width: 16, 
                      backgroundColor: '#060606', 
                      border: '2px solid #ff4081',
                      boxShadow: '0 0 8px rgba(255, 64, 129, 0.5)',
                      '&:hover, &.Mui-focused': { boxShadow: '0 0 15px #ff4081' } 
                    },
                    '& .MuiSlider-track': { background: 'linear-gradient(90deg, #ff4081, #bd00ff)' },
                    '& .MuiSlider-rail': { backgroundColor: 'rgba(255,255,255,0.08)', opacity: 1 },
                    '& .MuiSlider-valueLabel': { backgroundColor: '#ff4081', color: '#fff', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px' }
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: '#aaa', fontWeight: '600' }}>
                  <span>{priceRange[0].toLocaleString()} ₴</span>
                  <span>{priceRange[1].toLocaleString()} ₴</span>
                </div>
              </Box>

              {/* СОРТУВАННЯ */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Сортування</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="custom-catalog-input"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      backgroundColor: 'rgba(255,255,255,0.02)', 
                      color: '#ffffff', 
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      appearance: 'none',
                      WebkitAppearance: 'none'
                    }}
                  >
                    <option value="newest" style={{ backgroundColor: '#0c0c0c', color: '#fff' }}>Спочатку нові надходження</option>
                    <option value="price-asc" style={{ backgroundColor: '#0c0c0c', color: '#fff' }}>Від дешевих до дорогих</option>
                    <option value="price-desc" style={{ backgroundColor: '#0c0c0c', color: '#fff' }}>Від дорогих до дешевих</option>
                  </select>
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#ff4081', pointerEvents: 'none', fontSize: '12px' }}>▼</span>
                </div>
              </div>
            </div>
          </Grid>

          {/* КОЛОНКА ТОВАРІВ */}
          <Grid item xs={12} md={9}>
            <Typography variant="h4" style={{ fontWeight: '900', marginBottom: '35px', color: '#fff', letterSpacing: '-0.5px' }}>
              Каталог обладнання
            </Typography>
            
            {filteredProducts.length === 0 ? (
              <div style={{ padding: '80px 0', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                <Typography style={{ color: '#666', fontSize: '16px', fontWeight: '600' }}>
                  Упс! Жодного інструменту за такими критеріями не знайдено.
                </Typography>
              </div>
            ) : (
              renderProductCards()
            )}
          </Grid>

        </Grid>
      </Container>

      {/* ЧИСТІ ГЛОБАЛЬНІ СТИЛІ ЕФЕКТІВ */}
      <style>{`
        .custom-catalog-input:focus {
          border-color: rgba(255, 64, 129, 0.6) !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 0 20px rgba(255, 64, 129, 0.15) !important;
        }
        .custom-catalog-input::placeholder {
          color: #555 !important;
        }

        /* Ефекти карток */
        .premium-product-card:hover {
          transform: translateY(-6px);
          border-color: rgba(255, 64, 129, 0.4) !important;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 64, 129, 0.15);
        }
        .premium-product-card:hover .product-card-img {
          transform: scale(1.06);
        }
        
        /* Кнопка */
        .cyber-card-btn:hover {
          filter: brightness(1.1);
          box-shadow: 0 0 20px rgba(255, 64, 129, 0.5) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}