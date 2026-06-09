import React from 'react';
import { Container, Box, Typography } from '@mui/material';

export default function About() {
  return (
    <div style={{ backgroundColor: '#060606', minHeight: '100vh', padding: '60px 0 120px 0', color: '#fff', fontFamily: 'sans-serif' }}>
      <Container maxWidth="lg">
        
        {/* ХЕДЕР СТОРІНКИ */}
        <Box sx={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ color: '#ff4081', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '3px' }}>
            // Наша місія
          </span>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: '900', 
              marginTop: '10px', 
              letterSpacing: '-1px',
              fontSize: { xs: '36px', md: '54px' },
              textShadow: '0 0 30px rgba(255, 64, 129, 0.2)'
            }}
          >
            Екосистема для <span style={{ color: '#ff4081' }}>професійних</span> тату-майстрів
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ color: '#888', maxWidth: '650px', margin: '20px auto 0 auto', fontSize: '16px', lineHeight: '1.6' }}
          >
            TATTOO SHOP — це простір, створений майстрами для майстрів. Ми забезпечуємо провідні студії України високоточним обладнанням, сертифікованими пігментами та 100% стерильними матеріалами.
          </Typography>
        </Box>

        {/* БЛОК СОЦІАЛЬНИХ МЕРЕЖ */}
        <Box sx={{ marginBottom: '80px', textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ fontWeight: '900', marginBottom: '40px', letterSpacing: '-0.5px' }}
          >
            Ми в <span style={{ color: '#ff4081' }}>соцмережах</span>
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: '30px',
              width: '100%'
            }}
          >
            {[
              {
                name: 'Telegram',
                link: 'https://t.me/your_tattoo_shop',
                sub: 'Анонси, знижки та чат майстрів',
                hoverClass: 'tg-hover',
                iconColor: '#0088cc',
                svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.24-5.54 3.65-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.97-.74 3.79-1.65 6.32-2.74 7.59-3.27 3.61-1.51 4.36-1.77 4.85-1.78.11 0 .35.03.5.16.13.12.17.29.18.42z"/></svg>
              },
              {
                name: 'Instagram',
                link: 'https://instagram.com/your_tattoo_shop',
                sub: 'Фотообзори та бекстейджі зі студій',
                hoverClass: 'insta-hover',
                iconColor: '#e1306c',
                svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              },
              {
                name: 'Facebook',
                link: 'https://facebook.com/your_tattoo_shop',
                sub: 'Офіційні новини та заходи бренду',
                hoverClass: 'fb-hover',
                iconColor: '#1877f2',
                svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.8z"/></svg>
              }
            ].map((social, idx) => (
              <a 
                href={social.link} 
                target="_blank" 
                rel="noopener noreferrer"
                key={idx}
                style={{ textDecoration: 'none', display: 'block', width: '100%', maxWidth: '300px' }}
              >
                <div 
                  className={`social-premium-card ${social.hoverClass}`}
                  style={{
                    padding: '35px 24px',
                    backgroundColor: 'rgba(15, 15, 15, 0.6)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    display: 'flex',
                    flexDirection: 'column', 
                    alignItems: 'center',      
                    justifyContent: 'center',  
                    textAlign: 'center',       
                    gap: '18px',
                    height: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  <div style={{
                    width: '58px',
                    height: '58px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: social.iconColor
                  }}>
                    {social.svg}
                  </div>
                  <div>
                    <Typography variant="h6" style={{ color: '#fff', fontWeight: '800', fontSize: '19px', margin: 0 }}>
                      {social.name}
                    </Typography>
                    <Typography variant="body2" style={{ color: '#777', fontSize: '13px', marginTop: '6px', lineHeight: '1.45' }}>
                      {social.sub}
                    </Typography>
                  </div>
                </div>
              </a>
            ))}
          </Box>
        </Box>

        {/* ЗАКЛИК ДО ДІЇ */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            padding: '60px 40px',
            borderRadius: '24px',
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 64, 129, 0.06) 0%, rgba(0,0,0,0) 70%)',
            border: '1px dashed rgba(255, 64, 129, 0.2)'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: '800', marginBottom: '15px', letterSpacing: '-0.5px' }}>
            Потрібна допомога з вибором обладнання?
          </Typography>
          <Typography variant="body1" sx={{ color: '#aaa', maxWidth: '500px', margin: '0 auto 30px auto', fontSize: '14.5px', lineHeight: '1.5' }}>
            Наші менеджери чудово знаються на технічних характеристиках машинок. Допоможемо зібрати твій ідеальний сет.
          </Typography>
          <a 
            href="/catalog" 
            className="cyber-about-btn"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ff4081 0%, #bd00ff 100%)',
              color: '#fff',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderRadius: '12px',
              padding: '12px 32px',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(255, 64, 129, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            Відкрити каталог
          </a>
        </Box>

      </Container>

      {/* КІБЕР СТИЛІ */}
      <style>{`
        .social-premium-card:hover {
          transform: translateY(-5px);
          background-color: rgba(255, 255, 255, 0.02) !important;
        }
        .tg-hover:hover { border-color: rgba(0, 136, 204, 0.4) !important; box-shadow: 0 15px 30px rgba(0, 136, 204, 0.2); }
        .insta-hover:hover { border-color: rgba(225, 48, 108, 0.4) !important; box-shadow: 0 15px 30px rgba(225, 48, 108, 0.2); }
        .fb-hover:hover { border-color: rgba(24, 119, 242, 0.4) !important; box-shadow: 0 15px 30px rgba(24, 119, 242, 0.2); }
        .cyber-about-btn:hover { box-shadow: 0 0 25px rgba(255, 64, 129, 0.5) !important; filter: brightness(1.1); transform: translateY(-1px); }
      `}</style>
    </div>
  );
}