import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Імпортуємо виправлений Navbar
import Navbar from './components/Navbar'; 

// Імпорти сторінок твого додатка
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import AdminPage from './pages/AdminPage';
import Register from './pages/Register';
import Profile from './pages/Profile';
// Нова сторінка оформлення замовлення
import Checkout from './pages/Checkout'; 

export default function App() {
  return (
    <Router>
      {/* Навбар обов'язково лежить всередині Router */}
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        {/* Додаємо роут для чекауту */}
        <Route path="/checkout" element={<Checkout />} /> 
      </Routes>
    </Router>
  );
}