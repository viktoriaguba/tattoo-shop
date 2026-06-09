const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/', async (req, res) => {
  console.log('=== [START] ОТРИМАНО НОВИЙ ЗАПИТ НА ЗАМОВЛЕННЯ ===');
  console.log('Body:', JSON.stringify(req.body, null, 2));

  try {
    const { items, shippingDetails, totalPrice } = req.body;

    if (!items || !shippingDetails) {
      console.log('=== [ERR] Відсутні дані ===');
      return res.status(400).json({ message: 'Відсутні обов\'язкові дані замовлення' });
    }

    // Створюємо логічний запобіжник: якщо БД зависне більше ніж на 5 секунд — скидаємо запит
    const dbTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DATABASE_TIMEOUT (База даних не відповіла за 5 секунд)')), 5000)
    );

    console.log('=== [STEP 1] Спроба запису в базу даних... ===');
    
    // Запускаємо створення замовлення з таймаутом
    const newOrder = await Promise.race([
      Order.create({
        customerName: shippingDetails.name,
        phone: shippingDetails.phone,
        email: shippingDetails.email,
        city: shippingDetails.city,
        address: shippingDetails.address,
        comment: shippingDetails.comment,
        totalPrice: totalPrice,
        items: items 
      }),
      dbTimeout
    ]);

    console.log('=== [STEP 2] Успішно записано в БД! ID:', newOrder.id);

    // Фонове надсилання пошти (без await)
    const adminEmailTarget = 'viktoriaguba89@gmail.com'; 
    const adminMailOptions = {
      from: `"TATTOO SHOP" <${process.env.EMAIL_USER}>`,
      to: adminEmailTarget, 
      subject: `🔥 Нове замовлення від ${newOrder.customerName} — TATTOO SHOP`,
      html: `<h2>Нове замовлення #${newOrder.id}</h2><p>Сума: ${totalPrice} грн</p>`
    };

    transporter.sendMail(adminMailOptions).catch(mailError => {
      console.error('📋 Фонова пошта видала помилку:', mailError.message);
    });

    console.log('=== [SUCCESS] Відправка відповіді 201 на фронтенд ===');
    return res.status(201).json({
      success: true,
      orderId: newOrder.id, 
      message: 'Замовлення створено!'
    });

  } catch (error) {
    console.error('❌ КРИТИЧНА ПОМИЛКА БЕКЕНДУ:', error.message);
    if (error.stack) console.error(error.stack);
    
    return res.status(500).json({ 
      message: 'Помилка сервера при оформленні замовлення', 
      error: error.message 
    });
  }
});

module.exports = router;