import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();

  return (
    <Card sx={{ maxWidth: 345, bgcolor: '#1e1e1e', color: '#ffffff', borderRadius: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.5)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardMedia
        component="img"
        height="220"
        image={product.image || 'https://via.placeholder.com/300'}
        alt={product.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Chip label={product.category} size="small" sx={{ bgcolor: '#ff4081', color: '#ffffff', fontWeight: 'bold' }} />
          <Typography variant="body2" color="gray">
            В наявності: {product.stock} шт
          </Typography>
        </Box>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: '600', lineHeight: '1.2' }}>
          {product.title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2 }}>
          {product.description}
        </Typography>
        {product.attributes && Object.entries(product.attributes).map(([key, val]) => (
          <Typography key={key} variant="caption" display="block" sx={{ color: '#888888', fontStyle: 'italic' }}>
            • {key}: {val}
          </Typography>
        ))}
      </CardContent>
      <Box p={2} pt={0} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" sx={{ color: '#ff4081', fontWeight: 'bold' }}>
          {Number(product.price).toLocaleString()} грн
        </Typography>
        <Button 
          variant="contained" 
          sx={{ bgcolor: '#ff4081', '&:hover': { bgcolor: '#c51162' } }}
          onClick={() => dispatch(addToCart(product))}
        >
          Купити
        </Button>
      </Box>
    </Card>
  );
}