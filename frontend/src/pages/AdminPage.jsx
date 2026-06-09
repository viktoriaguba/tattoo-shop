import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Tabs, Tab, Box, TextField, Button, 
  List, ListItem, Accordion, AccordionSummary, AccordionDetails, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ButtonGroup,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

// Залізобетонні стилі інпутів: Яскраві підказки, великий шрифт та виправлення ліній
const darkInputStyles = {
  '& .MuiInputBase-root': {
    backgroundColor: '#161616 !important',
  },
  '& .MuiInputBase-input': {
    color: '#ffffff !important',
    fontSize: '16px',
    padding: '12px 14px',
  },
  '& .MuiInputLabel-root': {
    color: '#e0e0e0 !important',
    fontSize: '15px',
    transform: 'translate(14px, 12px) scale(1)',
  },
  '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.MuiInputLabel-shrink': {
    color: '#ff4081 !important',
    fontWeight: 'bold',
    fontSize: '14px',
    transform: 'translate(14px, -9px) scale(1) !important',
  },
  '& input:-webkit-autofill': {
    WebkitTextFillColor: '#ffffff !important',
    WebkitBoxShadow: '0 0 0px 1000px #161616 inset !important',
    transition: 'background-color 5000s ease-in-out 0s',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': { 
      borderColor: '#444',
      borderWidth: '1px' 
    },
    '&:hover fieldset': { borderColor: '#666' },
    '&.Mui-focused fieldset': { 
      borderColor: '#ff4081',
      borderWidth: '2px'
    },
    '& .MuiOutlinedInput-notchedOutline legend': {
      fontSize: '10.5px', // Забезпечує правильний виріз у рамці під лейбл
    }
  }
};

// Стилі спеціально для випадаючого списку (Select Menu) у модалках
const darkSelectMenuProps = {
  PaperProps: {
    sx: {
      bgcolor: '#1a1a1a',
      color: '#fff',
      border: '1px solid #333',
      '& .MuiMenuItem-root': {
        fontSize: '15px',
        py: 1.5,
        '&:hover': { bgcolor: '#333' },
        '&.Mui-selected': { bgcolor: '#ff4081', color: '#fff', '&:hover': { bgcolor: '#c51162' } }
      }
    }
  }
};

export default function AdminPage() {
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]); 
  const [usersList, setUsersList] = useState([]);

  const [productSearch, setProductSearch] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState(''); 
  const [category, setCategory] = useState('');
  const [uploadMode, setUploadMode] = useState('file'); 
  const [imagePreview, setImagePreview] = useState(null); 

  const [newCatName, setNewCatName] = useState('');

  const [editingProduct, setEditingProduct] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editUploadMode, setEditUploadMode] = useState('url');
  const [editImagePreview, setEditImagePreview] = useState(null);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatName, setEditCatName] = useState('');

  const [selectedUserOrders, setSelectedUserOrders] = useState(null);
  const [passwordTargetUser, setPasswordTargetUser] = useState(null);
  const [adminNewPassword, setAdminNewPassword] = useState('');

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAdminData();
  }, [token, user]);

  const loadAdminData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const resOrders = await axios.get('http://localhost:5000/api/orders', config);
      const resCats = await axios.get('http://localhost:5000/api/categories');
      const resUsers = await axios.get('http://localhost:5000/api/admin/users', config);
      const resProducts = await axios.get('http://localhost:5000/api/products'); 

      setOrders(resOrders.data || []);
      setCategories(resCats.data || []);
      setUsersList(resUsers.data || []);
      setProducts(resProducts.data || []);
    } catch (err) {
      console.error("Помилка завантаження даних в адмінку:", err);
    }
  };

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEdit) {
        setEditImagePreview(URL.createObjectURL(file));
        const reader = new FileReader();
        reader.onloadend = () => setEditImage(reader.result);
        reader.readAsDataURL(file);
      } else {
        setImagePreview(URL.createObjectURL(file));
        const reader = new FileReader();
        reader.onloadend = () => setImage(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!image) return alert('Будь ласка, додайте фото товару!');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/products', { title, description, price, stock, image, category }, config);
      alert('Товар успішно опубліковано!');
      setTitle(''); setDescription(''); setPrice(''); setStock(''); setImage(''); setCategory(''); setImagePreview(null);
      loadAdminData(); 
    } catch (err) {
      alert('Помилка при додаванні товару');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити товар "${name}"?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/products/${id}`, config);
      alert('Товар видалено!');
      loadAdminData();
    } catch (err) {
      alert('Не вдалося видалити товар. Перевірте роути на бекенді.');
    }
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setEditTitle(product.title);
    setEditDescription(product.description);
    setEditPrice(product.price);
    setEditStock(product.stock);
    setEditCategory(product.category);
    setEditImage(product.image);
    setEditImagePreview(product.image.startsWith('data:') ? product.image : null);
    setEditUploadMode(product.image.startsWith('data:') ? 'file' : 'url');
  };

  const handleUpdateProduct = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, {
        title: editTitle,
        description: editDescription,
        price: editPrice,
        stock: editStock,
        image: editImage,
        category: editCategory
      }, config);
      alert('Товар оновлено!');
      setEditingProduct(null);
      loadAdminData();
    } catch (err) {
      alert('Помилка оновлення товару');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/categories', { name: newCatName }, config);
      alert('Категорію створено!');
      setNewCatName('');
      loadAdminData();
    } catch (err) {
      alert('Помилка створення категорії');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Видалити категорію "${name}"?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/categories/${id}`, config);
      alert('Категорію видалено!');
      loadAdminData();
    } catch (err) {
      alert('Помилка видалення категорії');
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/categories/${editingCategory.id}`, { name: editCatName }, config);
      alert('Категорію перейменовано!');
      setEditingCategory(null);
      loadAdminData();
    } catch (err) {
      alert('Помилка редагування категорії');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Ви впевнені, що хочете видалити акаунт ${name}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, config);
      alert('Користувача успішно видалено!');
      loadAdminData();
    } catch (err) {
      alert('Не вдалося видалити користувача.');
    }
  };

  const handleAdminChangePassword = async () => {
    if (!adminNewPassword.trim()) return alert('Введіть пароль');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/admin/users/${passwordTargetUser.id}/password`, { newPassword: adminNewPassword }, config);
      alert(`Пароль для користувача ${passwordTargetUser.name} оновлено!`);
      setPasswordTargetUser(null);
      setAdminNewPassword('');
    } catch (err) {
      alert('Помилка оновлення пароля');
    }
  };

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: '#121212', minHeight: '92vh', py: 6, color: '#fff' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff4081', mb: 4 }}>
          Панель Управління Магазином
        </Typography>
        <Grid container spacing={4}>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper sx={{ bgcolor: '#1e1e1e', borderRadius: 3, border: '1px solid #2a2a2a', overflow: 'hidden' }}>
              <Tabs 
                orientation="vertical" 
                value={tabIndex} 
                onChange={(e, v) => setTabIndex(v)} 
                sx={{ 
                  '& .MuiTab-root': { color: '#fff', alignItems: 'flex-start', fontWeight: 'bold', p: 2, textTransform: 'none' }, 
                  '& .Mui-selected': { color: '#ff4081 !important' },
                  '& .MuiTabs-indicator': { bgcolor: '#ff4081' }
                }}
              >
                <Tab label="Всі замовлення" />
                <Tab label="Додати товар" />
                <Tab label="Керування категоріями" />
                <Tab label="Користувачі системи" />
              </Tabs>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <Paper sx={{ p: 4, bgcolor: '#1e1e1e', color: '#fff', border: '1px solid #2a2a2a', borderRadius: 3, minHeight: 400 }}>
              
              {tabIndex === 0 && (
                <Box>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Історія замовлень клієнтів</Typography>
                  {(orders || []).map(o => (
                    <Accordion key={o.id} sx={{ bgcolor: '#111', color: '#fff', mb: 2, border: '1px solid #222', backgroundImage: 'none' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#ff4081' }} />}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: '#ff4081', fontWeight: 'bold' }}>Клієнт: {o.customerName}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{o.totalPrice} грн</Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List disablePadding>
                          {(o.items || []).map((item, idx) => (
                            <ListItem key={idx} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', py: 1 }}>
                              <Typography variant="body2">{item.title} <b>x{item.quantity}</b></Typography>
                              <Typography variant="body2" color="#ff4081">{(item.price * item.quantity).toLocaleString()} грн</Typography>
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                  {orders.length === 0 && <Typography color="#888">Замовлень немає</Typography>}
                </Box>
              )}

              {tabIndex === 1 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  
                  <Box component="form" onSubmit={handleAddProduct} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Нова картка товару</Typography>
                    
                    <TextField label="Назва" required fullWidth value={title} onChange={(e) => setTitle(e.target.value)} sx={darkInputStyles} />
                    <TextField label="Опис" required fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} sx={darkInputStyles} />
                    
                    <Box sx={{ display: 'flex', gap: 3.5 }}>
                      <TextField label="Ціна (грн)" type="number" required fullWidth value={price} onChange={(e) => setPrice(e.target.value)} sx={darkInputStyles} />
                      <TextField label="Кількість на складі" type="number" required fullWidth value={stock} onChange={(e) => setStock(e.target.value)} sx={darkInputStyles} />
                    </Box>

                    <TextField 
                      select label="Категорія" required fullWidth value={category} onChange={(e) => setCategory(e.target.value)}
                      slotProps={{ select: { sx: { '& .MuiSelect-icon': { color: '#fff' } } } }} sx={darkInputStyles}
                      SelectProps={darkSelectMenuProps}
                    >
                      {(categories || []).map(c => (
                        <MenuItem key={c.id} value={c.name}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#bbb', fontWeight: 'bold' }}>Спосіб фото:</Typography>
                      <ButtonGroup size="small">
                        <Button onClick={() => setUploadMode('file')} variant={uploadMode === 'file' ? 'contained' : 'outlined'} startIcon={<ImageIcon />} sx={{ bgcolor: uploadMode === 'file' ? '#ff4081' : 'transparent', color: '#fff', borderColor: '#444' }}>Файл</Button>
                        <Button onClick={() => setUploadMode('url')} variant={uploadMode === 'url' ? 'contained' : 'outlined'} startIcon={<LinkIcon />} sx={{ bgcolor: uploadMode === 'url' ? '#ff4081' : 'transparent', color: '#fff', borderColor: '#444' }}>URL</Button>
                      </ButtonGroup>
                    </Box>

                    {uploadMode === 'file' ? (
                      <Box>
                        {!imagePreview ? (
                          <Paper variant="outlined" sx={{ backgroundColor: '#111', border: '2px dashed #444', borderRadius: '10px', p: 4, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: '#ff4081' } }} component="label">
                            <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, false)} />
                            <CloudUploadIcon sx={{ color: '#ff4081', fontSize: 40, mb: 1 }} />
                            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold' }}>Виберіть зображення</Typography>
                          </Paper>
                        ) : (
                          <Paper sx={{ p: 2, bgcolor: '#111', border: '1px solid #444', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box component="img" src={imagePreview} sx={{ width: 90, height: 90, objectFit: 'cover', borderRadius: '8px' }} />
                            <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} onClick={() => { setImage(''); setImagePreview(null); }}>Видалити</Button>
                          </Paper>
                        )}
                      </Box>
                    ) : (
                      <TextField label="Посилання на фото (URL)" required fullWidth value={image} onChange={(e) => setImage(e.target.value)} sx={darkInputStyles} />
                    )}

                    <Button type="submit" variant="contained" sx={{ bgcolor: '#ff4081', '&:hover': { bgcolor: '#c51162' }, fontWeight: 'bold', py: 1.5 }}>
                      ОПУБЛІКУВАТИ ТОВАР
                    </Button>
                  </Box>

                  <hr style={{ borderColor: '#333' }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff4081' }}>Наявні товари у базі ({products.length})</Typography>
                    
                    <TextField 
                      label="Швидкий пошук товарів..." 
                      fullWidth 
                      value={productSearch} 
                      onChange={(e) => setProductSearch(e.target.value)} 
                      sx={darkInputStyles} 
                    />

                    <TableContainer component={Paper} sx={{ bgcolor: '#111', border: '1px solid #222', backgroundImage: 'none', maxHeight: 400, overflowY: 'auto' }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow sx={{ '& th': { bgcolor: '#1a1a1a !important', color: '#ff4081', fontWeight: 'bold' } }}>
                            <TableCell width="70">Фото</TableCell>
                            <TableCell>Назва</TableCell>
                            <TableCell>Категорія</TableCell>
                            <TableCell width="100">Ціна</TableCell>
                            <TableCell width="80">Склад</TableCell>
                            <TableCell width="120" align="center">Дії</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredProducts.map((p) => (
                            <TableRow key={p.id} hover sx={{ '& td': { color: '#fff', borderColor: '#222' } }}>
                              <TableCell>
                                <img src={p.image} alt="" style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 4, border: '1px solid #333' }} />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>{p.title}</TableCell>
                              <TableCell sx={{ color: '#aaa' }}>{p.category || 'Немає'}</TableCell>
                              <TableCell>{p.price} грн</TableCell>
                              <TableCell>{p.stock} шт</TableCell>
                              <TableCell align="center">
                                <ButtonGroup size="small">
                                  <IconButton sx={{ color: '#00b0ff' }} onClick={() => openEditProductModal(p)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton sx={{ color: '#ff4081' }} onClick={() => handleDeleteProduct(p.id, p.title)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </ButtonGroup>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredProducts.length === 0 && (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ color: '#888', py: 4 }}>Товарів не знайдено</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                </Box>
              )}

              {tabIndex === 2 && (
                <Box>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Керування категоріями</Typography>
                  <Box component="form" onSubmit={handleAddCategory} sx={{ display: 'flex', gap: 3.5, mb: 4 }}>
                    <TextField label="Назва нової категорії" required fullWidth value={newCatName} onChange={(e) => setNewCatName(e.target.value)} sx={darkInputStyles} />
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#ff4081', '&:hover': { bgcolor: '#c51162' }, fontWeight: 'bold', px: 4 }}>СТВОРТИ</Button>
                  </Box>

                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#ff4081', fontWeight: 'bold' }}>Поточні категорії на сайті:</Typography>
                  <List>
                    {(categories || []).map(c => (
                      <ListItem 
                        key={c.id} 
                        sx={{ bgcolor: '#111', mb: 1, borderRadius: 2, border: '1px solid #222', p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Typography sx={{ fontWeight: '500', fontSize: '16px' }}>{c.name}</Typography>
                        <Box>
                          <IconButton sx={{ color: '#00b0ff' }} onClick={() => { setEditingCategory(c); setEditCatName(c.name); }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton sx={{ color: '#ff4081' }} onClick={() => handleDeleteCategory(c.id, c.name)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {tabIndex === 3 && (
                <Box>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>Керування користувачами (База Neon)</Typography>
                  <TableContainer component={Paper} sx={{ bgcolor: '#111', border: '1px solid #222', backgroundImage: 'none' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#1a1a1a' }}>
                        <TableRow sx={{ '& th': { color: '#ff4081', fontWeight: 'bold' } }}>
                          <TableCell>Користувач</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Роль</TableCell>
                          <TableCell align="center">Управління</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {usersList.map((u) => (
                          <TableRow key={u.id} sx={{ '& td': { color: '#fff', borderColor: '#222' } }}>
                            <TableCell sx={{ fontWeight: '500' }}>{u.name}</TableCell>
                            <TableCell sx={{ color: '#ccc' }}>{u.email}</TableCell>
                            <TableCell sx={{ color: u.role === 'admin' ? '#ff4081' : '#00b0ff', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>{u.role}</TableCell>
                            <TableCell align="center">
                              <ButtonGroup size="small" variant="outlined">
                                <Button sx={{ color: '#00b0ff', borderColor: '#222' }} onClick={() => setSelectedUserOrders(u)}>Покупки ({u.orders?.length || 0})</Button>
                                <Button sx={{ color: '#bd00ff', borderColor: '#222' }} onClick={() => setPasswordTargetUser(u)}>Пароль</Button>
                                {u.id !== user?.id && <Button sx={{ color: '#ff4081', borderColor: '#222' }} onClick={() => handleDeleteUser(u.id, u.name)}>Видалити</Button>}
                              </ButtonGroup>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* 🛠️ ФІКСОВАНА МОДАЛКА: РЕДАГУВАННЯ ТОВАРУ */}
      <Dialog 
        open={Boolean(editingProduct)} 
        onClose={() => setEditingProduct(null)} 
        slotProps={{ backdrop: { style: { backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(6px)' } } }}
        PaperProps={{ 
          sx: { 
            bgcolor: '#121212 !important', // ТОТАЛЬНЕ ВИПРАВЛЕННЯ БІЛОГО ФОНУ З ГРАФІКА
            color: '#fff !important', 
            minWidth: 550, 
            border: '1px solid #2a2a2a', 
            borderRadius: 3, 
            p: 1.5, 
            backgroundImage: 'none' 
          } 
        }}
      >
        <DialogTitle sx={{ color: '#ff4081', fontWeight: 'bold', fontSize: '22px', pb: 2, borderBottom: '1px solid #222' }}>
          Редагування товару
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, pt: '25px !important', bgcolor: '#121212' }}>
          <TextField label="Назва товару" fullWidth value={editTitle} onChange={(e) => setEditTitle(e.target.value)} sx={darkInputStyles} />
          <TextField label="Опис" fullWidth multiline rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} sx={darkInputStyles} />
          
          <Box sx={{ display: 'flex', gap: 3.5 }}>
            <TextField label="Ціна (грн)" type="number" fullWidth value={editPrice} onChange={(e) => setEditPrice(e.target.value)} sx={darkInputStyles} />
            <TextField label="Кількість на складі" type="number" fullWidth value={editStock} onChange={(e) => setEditStock(e.target.value)} sx={darkInputStyles} />
          </Box>
          
          <TextField 
            select label="Категорія товару" fullWidth value={editCategory} onChange={(e) => setEditCategory(e.target.value)} 
            slotProps={{ select: { sx: { '& .MuiSelect-icon': { color: '#fff' } } } }} sx={darkInputStyles}
            SelectProps={darkSelectMenuProps}
          >
            {categories.map(c => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: '#bbb', fontWeight: 'bold' }}>Спосіб фото:</Typography>
            <ButtonGroup size="small">
              <Button onClick={() => setEditUploadMode('file')} variant={editUploadMode === 'file' ? 'contained' : 'outlined'} sx={{ bgcolor: editUploadMode === 'file' ? '#ff4081' : 'transparent', color: '#fff', borderColor: '#444' }}>Файл</Button>
              <Button onClick={() => setEditUploadMode('url')} variant={editUploadMode === 'url' ? 'contained' : 'outlined'} sx={{ bgcolor: editUploadMode === 'url' ? '#ff4081' : 'transparent', color: '#fff', borderColor: '#444' }}>URL</Button>
            </ButtonGroup>
          </Box>
          
          {editUploadMode === 'file' ? (
            <Paper variant="outlined" sx={{ backgroundColor: '#111', border: '2px dashed #444', borderRadius: '8px', p: 3, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: '#ff4081' } }} component="label">
              <input type="file" accept="image/*" hidden onChange={(e) => handleFileChange(e, true)} />
              <CloudUploadIcon sx={{ color: '#ff4081', fontSize: 32, mb: 0.5 }} />
              <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'bold' }}>Змінити файл фото</Typography>
            </Paper>
          ) : (
            <TextField label="Посилання на фото (URL)" fullWidth value={editImage} onChange={(e) => setEditImage(e.target.value)} sx={darkInputStyles} />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #222', mt: 1, gap: 1.5, bgcolor: '#121212' }}>
          <Button onClick={() => setEditingProduct(null)} sx={{ color: '#aaa', textTransform: 'none', fontSize: '15px', fontWeight: 'bold', '&:hover': { color: '#fff' } }}>
            Скасувати
          </Button>
          <Button onClick={handleUpdateProduct} variant="contained" sx={{ bgcolor: '#ff4081', '&:hover': { bgcolor: '#c51162' }, fontWeight: 'bold', px: 3, py: 1 }}>
            ЗБЕРЕГТИ ЗМІНИ
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🛠️ ФІКСОВАНА МОДАЛКА: РЕДАГУВАННЯ КАТЕГОРІЇ */}
      <Dialog 
        open={Boolean(editingCategory)} 
        onClose={() => setEditingCategory(null)} 
        slotProps={{ backdrop: { style: { backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(6px)' } } }}
        PaperProps={{ sx: { bgcolor: '#121212 !important', color: '#fff', minWidth: 400, border: '1px solid #2a2a2a', borderRadius: 3, backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ color: '#ff4081', fontWeight: 'bold', borderBottom: '1px solid #222', pb: 1.5 }}>Редагувати назву категорії</DialogTitle>
        <DialogContent sx={{ pt: '25px !important', bgcolor: '#121212' }}>
          <TextField label="Нова назва" fullWidth value={editCatName} onChange={(e) => setEditCatName(e.target.value)} sx={darkInputStyles} />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #222', bgcolor: '#121212' }}>
          <Button onClick={() => setEditingCategory(null)} sx={{ color: '#aaa', fontWeight: 'bold' }}>Скасувати</Button>
          <Button onClick={handleUpdateCategory} variant="contained" sx={{ bgcolor: '#00b0ff', '&:hover': { bgcolor: '#0081cb' }, fontWeight: 'bold' }}>Оновити</Button>
        </DialogActions>
      </Dialog>

      {/* ФІКСОВАНА МОДАЛКА: ПОКУПКИ КОНКРЕТНОГО ЮЗЕРА */}
      <Dialog 
        open={Boolean(selectedUserOrders)} 
        onClose={() => setSelectedUserOrders(null)} 
        slotProps={{ backdrop: { style: { backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(6px)' } } }}
        PaperProps={{ sx: { bgcolor: '#121212 !important', color: '#fff', minWidth: 450, border: '1px solid #2a2a2a', borderRadius: 3, backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ color: '#ff4081', fontWeight: 'bold' }}>Чеки покупок: {selectedUserOrders?.name}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#2a2a2a', pt: 2, bgcolor: '#121212' }}>
          {selectedUserOrders?.orders && selectedUserOrders.orders.length > 0 ? (
            selectedUserOrders.orders.map((o) => (
              <Box key={o.id} sx={{ p: 2, bgcolor: '#111', border: '1px solid #222', borderRadius: 2, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#ff4081', fontWeight: 'bold', mb: 1 }}>Замовлення на суму: {o.totalPrice} грн</Typography>
                <List disablePadding>
                  {o.items?.map((item, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: '#aaa', pl: 1 }}>• {item.title} (x{item.quantity}) — {item.price * item.quantity} грн</Typography>
                  ))}
                </List>
              </Box>
            ))
          ) : (
            <Typography color="#888">Історія замовлень порожня.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#121212' }}>
          <Button onClick={() => setSelectedUserOrders(null)} sx={{ color: '#fff' }}>Закрити</Button>
        </DialogActions>
      </Dialog>

      {/* ФІКСОВАНА МОДАЛКА: ЗМІНА ПАРОЛЯ АДМІНОМ */}
      <Dialog 
        open={Boolean(passwordTargetUser)} 
        onClose={() => setPasswordTargetUser(null)} 
        slotProps={{ backdrop: { style: { backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(6px)' } } }}
        PaperProps={{ sx: { bgcolor: '#121212 !important', color: '#fff', border: '1px solid #2a2a2a', borderRadius: 3, backgroundImage: 'none' } }}
      >
        <DialogTitle sx={{ color: '#ff4081', fontWeight: 'bold' }}>Пароль для {passwordTargetUser?.name}</DialogTitle>
        <DialogContent sx={{ bgcolor: '#121212' }}>
          <TextField margin="dense" label="Новий пароль" type="text" fullWidth value={adminNewPassword} onChange={(e) => setAdminNewPassword(e.target.value)} sx={{ mt: 2, ...darkInputStyles }} />
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#121212' }}>
          <Button onClick={() => setPasswordTargetUser(null)} sx={{ color: '#aaa' }}>Скасувати</Button>
          <Button onClick={handleAdminChangePassword} sx={{ color: '#ff4081', fontWeight: 'bold' }}>Зберегти</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}