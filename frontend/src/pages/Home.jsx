import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HandymanIcon from '@mui/icons-material/Handyman';

export default function Home() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [rawMousePos, setRawMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 80;
      const y = (e.clientY / window.innerHeight - 0.5) * 80;
      setMousePos({ x, y });
      setRawMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ backgroundColor: '#060606', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', paddingBottom: '120px', position: 'relative', overflow: 'hidden' }}>
      
      {/* 1. ПОТУЖНІ ФОНОВІ ПАРАЛАКС-СФЕРИ */}
      <div 
        className="intense-parallax-bg" 
        style={{ 
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
        }}
      >
        <div className="neon-blob blob-pink"></div>
        <div className="neon-blob blob-blue"></div>
        <div className="neon-blob blob-purple"></div>
      </div>

      {/* 2. ЖИВИЙ ЛІХТАРИК, ЩО СЛІДУЄ ЗА КУРСОРОМ */}
      <div 
        className="mouse-flashlight"
        style={{
          left: `${rawMousePos.x}px`,
          top: `${rawMousePos.y}px`
        }}
      />

      {/* ГОЛОВНИЙ БЛОК (HERO) */}
      <Box 
        sx={{ 
          padding: '140px 0 60px 0',
          textAlign: 'center',
          position: 'relative',
          zIndex: 2
        }}
      >
        <Container maxWidth="md">
          {/* АКУРАТНИЙ, СТИЛЬНИЙ ЗАГОЛОВОК */}
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: '800', 
              letterSpacing: '2px', 
              marginBottom: '20px',
              fontSize: { xs: '2.4rem', md: '4rem' },
              textTransform: 'uppercase',
              lineHeight: 1.2,
              color: '#ffffff'
            }}
          >
            Ласкаво просимо до <br />
            <span className="premium-neon-text">
              TATTOO SHOP
            </span>
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ color: '#777777', fontWeight: '400', lineHeight: '1.7', maxWidth: '560px', margin: '0 auto 45px auto', fontSize: '15px', letterSpacing: '0.3px' }}
          >
            Ваш надійний партнер у світі професійного тату-обладнання, високоточних інструментів та преміальних витратних матеріалів.
          </Typography>

          <Button 
            variant="contained" 
            onClick={() => navigate('/catalog')}
            sx={{ 
              backgroundColor: '#ff4081', 
              color: '#fff', 
              fontWeight: 'bold', 
              fontSize: '14px',
              letterSpacing: '1px',
              padding: '14px 45px', 
              borderRadius: '30px',
              textTransform: 'uppercase',
              boxShadow: '0 4px 20px rgba(255, 64, 129, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                backgroundColor: '#e91e63',
                transform: 'translateY(-2px)',
                boxShadow: '0 0 25px #ff4081',
              }
            }}
          >
            Каталог товарів
          </Button>
        </Container>
      </Box>

      {/* СЕКЦІЯ КОМПАКТНИХ СТИЛЬНИХ КАРТОК */}
      <Container maxWidth="lg" sx={{ marginTop: '50px', position: 'relative', zIndex: 2 }}>
        
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ fontWeight: '800', marginBottom: '50px', letterSpacing: '3px', textTransform: 'uppercase', color: '#ff4081' }}
        >
          // Наші переваги
        </Typography>

        <Grid container spacing={4} alignItems="stretch">
          
          {/* КАРТКА 1 */}
          <Grid item xs={12} md={4}>
            <div className="premium-cyber-card">
              <div className="icon-badge-glow pink-glow">
                <HandymanIcon sx={{ fontSize: 24, color: '#fff' }} />
              </div>
              <h3 className="card-title">Обладнання</h3>
              <p className="card-text">
                Сертифіковані тату-машинки, оригінальні пігменти та блоки живлення від провідних брендів для вашої безпечної роботи.
              </p>
              <div className="card-footer-tag">Преміум якість</div>
            </div>
          </Grid>

          {/* КАРТКА 2 */}
          <Grid item xs={12} md={4}>
            <div className="premium-cyber-card">
              <div className="icon-badge-glow green-glow">
                <SecurityIcon sx={{ fontSize: 24, color: '#fff' }} />
              </div>
              <h3 className="card-title">Гарантія</h3>
              <p className="card-text">
                Надаємо повне сервісне, гарантійне та післягарантійне обслуговування всієї купленої техніки та електроніки.
              </p>
              <div className="card-footer-tag tag-green">100% Безпека</div>
            </div>
          </Grid>

          {/* КАРТКА 3 */}
          <Grid item xs={12} md={4}>
            <div className="premium-cyber-card">
              <div className="icon-badge-glow blue-glow">
                <LocalShippingIcon sx={{ fontSize: 24, color: '#fff' }} />
              </div>
              <h3 className="card-title">Доставка</h3>
              <p className="card-text">
                Оперативна відправка в день замовлення. Спеціалізована упаковка для збереження стерильності та крихких вузлів.
              </p>
              <div className="card-footer-tag tag-blue">1-2 дні по Україні</div>
            </div>
          </Grid>

        </Grid>
      </Container>

      {/* ОНОВЛЕНІ ЛЕГКІ СТИЛІ */}
      <style>{`
        /* --- ПРЕМІУМ НЕОНОВИЙ НАПИС (Чистий та стриманий) --- */
        .premium-neon-text {
          color: #ff4081;
          font-weight: 900;
          letter-spacing: 4px;
          /* Створюємо ефект м'якої дорогої вивіски за рахунок нашарування розмиття */
          text-shadow: 
            0 0 10px rgba(255, 64, 129, 0.5),
            0 0 30px rgba(255, 64, 129, 0.2);
          animation: gentlePulse 4s infinite alternate ease-in-out;
        }

        /* Плавне "дихання" неону замість бігаючих кольорів */
        @keyframes gentlePulse {
          0% {
            opacity: 0.95;
            text-shadow: 0 0 10px rgba(255, 64, 129, 0.5), 0 0 30px rgba(255, 64, 129, 0.2);
          }
          100% {
            opacity: 1;
            text-shadow: 0 0 15px rgba(255, 64, 129, 0.7), 0 0 40px rgba(255, 64, 129, 0.4);
          }
        }

        /* --- ФОНОВІ ЕФЕКТИ --- */
        .intense-parallax-bg {
          position: absolute;
          top: -10%;
          left: -10%;
          width: 120%;
          height: 120%;
          z-index: 1;
          pointer-events: none;
          transition: transform 0.25s cubic-bezier(0.1, 0.25, 0.1, 1);
        }

        .neon-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.18;
          animation: blobPulse 15s infinite alternate ease-in-out;
        }

        .blob-pink { width: 450px; height: 450px; background: #ff4081; top: 15%; left: 10%; }
        .blob-blue { width: 550px; height: 550px; background: #00b0ff; bottom: 15%; right: 10%; animation-delay: -4s; }
        .blob-purple { width: 400px; height: 400px; background: #aa00ff; top: 40%; left: 45%; animation-delay: -8s; }

        @keyframes blobPulse {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.15) translate(30px, -5px); }
          100% { transform: scale(0.95) translate(-10px, 30px); }
        }

        .mouse-flashlight {
          position: fixed;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255, 64, 129, 0.06) 0%, transparent 70%);
          z-index: 1;
          pointer-events: none;
          transform: translate(-50%, -50%);
        }

        /* --- СУПЕРМАТОВІ КІБЕР-КАРТКИ --- */
        .premium-cyber-card {
          background-color: rgba(15, 15, 15, 0.65);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 20px;
          padding: 35px 28px;
          height: 100%;
          min-height: 290px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .premium-cyber-card:hover {
          transform: translateY(-8px) scale(1.02);
          background-color: rgba(22, 22, 22, 0.8);
          border-color: rgba(255, 64, 129, 0.5);
          box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 25px rgba(255, 64, 129, 0.2);
        }

        .icon-badge-glow {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          transition: all 0.4s ease;
        }
        .premium-cyber-card:hover .icon-badge-glow {
          transform: scale(1.1) rotate(8deg);
        }

        .pink-glow { background: linear-gradient(135deg, #ff4081, #ae11ff); box-shadow: 0 4px 15px rgba(255, 64, 129, 0.4); }
        .green-glow { background: linear-gradient(135deg, #2e7d32, #4acf50); box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3); }
        .blue-glow { background: linear-gradient(135deg, #0288d1, #00b0ff); box-shadow: 0 4px 15px rgba(2, 136, 209, 0.3); }

        .card-title { font-size: 21px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; letter-spacing: -0.2px; }
        .card-text { font-size: 14px; color: #888888; line-height: 1.6; margin: 0 0 20px 0; flex-grow: 1; transition: color 0.3s ease; }
        .premium-cyber-card:hover .card-text { color: #cccccc; }

        .card-footer-tag { font-size: 11px; font-weight: 700; color: #ff4081; text-transform: uppercase; letter-spacing: 1px; margin-top: auto; }
        .tag-green { color: #4acf50; }
        .tag-blue { color: #00b0ff; }
      `}</style>

    </div>
  );
}