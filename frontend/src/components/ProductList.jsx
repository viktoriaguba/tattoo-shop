import React from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function ProductList({ products }) {
  return (
    <Grid container spacing={3}>
      {(products || []).map((product) => (
        <Grid item xs={12} sm={6} md={4} key={product.id || product._id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              bgcolor: '#1e1e1e', 
              borderRadius: 3, 
              border: '1px solid #2a2a2a',
              backgroundImage: 'none',
              boxShadow: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 20px rgba(255, 64, 129, 0.15)',
                borderColor: '#ff4081'
              }
            }}
          >
            <CardMedia
              component="img"
              height="200"
              image={product.image || 'https://via.placeholder.com/300'}
              alt={product.title}
              sx={{ objectFit: 'cover' }}
            />

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
              <Typography variant="caption" sx={{ color: '#ff4081', fontWeight: 'bold', textTransform: 'uppercase', mb: 1 }}>
                {product.category || 'Матеріали'}
              </Typography>

              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#fff', 
                  fontWeight: 'bold', 
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '1.3em'
                }}
              >
                {product.title}
              </Typography>

              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#aaa', 
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '3em'
                }}
              >
                {product.description}
              </Typography>

              <Box sx={{ mt: 'auto', pt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  {Number(product.price).toLocaleString()} грн
                </Typography>
                
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<ShoppingCartIcon />}
                  sx={{ 
                    bgcolor: '#ff4081', 
                    color: '#fff',
                    fontWeight: 'bold',
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2,
                    '&:hover': { bgcolor: '#c51162' }
                  }}
                >
                  В кошик
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}