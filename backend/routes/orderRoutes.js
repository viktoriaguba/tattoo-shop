const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// ТУМБЛЕР ПОШТИ: Якщо Render блокує порти, ставимо false. 
// Це повністю вимкне Nodemailer, і сервер взагалі не буде гальмувати через Google.
const ENABLE_EMAIL = false; 

let transporter = null;

if (ENABLE_EMAIL) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS 
    }
  });
}

// Ендпоінт для створення замовлення (POST /api/orders)
router.post('/', async (req, res) => {
  console.log('=== [START] Отримано запит на замовлення ===');
  
  try {
    const { items, shippingDetails, totalPrice } = req.body;

    if (!items || !shippingDetails) {
      return res.status(400).json({ message: 'Відсутні обов\'язкові дані замовлення' });
    }

    // 🔥 КРОК 1: МИТТЄВО повертаємо відповідь фронтенду!
    // Сервер віддає статус 201 ОДРАЗУ. Фронтенд отримає сигнал успіху і НЕ буде виснути.
    res.status(201).json({
      success: true,
      message: 'Замовлення прийнято в обробку!'
    });

    // 🔥 КРОК 2: Усі важкі операції (БД та Пошта) робимо ПІСЛЯ відповіді у setImmediate
    setImmediate(async () => {
      try {
        console.log('=== [BACKGROUND] Спроба запису в базу даних... ===');
        
        const newOrder = await Order.create({
          customerName: shippingDetails.name,
          phone: shippingDetails.phone,
          email: shippingDetails.email,
          city: shippingDetails.city,
          address: shippingDetails.address,
          comment: shippingDetails.comment,
          totalPrice: totalPrice,
          items: items 
        });

        console.log('=== [BACKGROUND] Запис в БД успішний! ID:', newOrder.id);

        // Якщо пошта увімкнена, намагаємося відправити
        if (ENABLE_EMAIL && transporter) {
          console.log('=== [BACKGROUND] Спроба відправки листа... ===');
          const adminMailOptions = {
            from: `"TATTOO SHOP" <${process.env.EMAIL_USER}>`,
            to: 'viktoriaguba89@gmail.com', 
            subject: `🔥 Нове замовлення від ${shippingDetails.name}`,
            html: `<h2>Нове замовлення від ${shippingDetails.name}</h2>`
          };

          await transporter.sendMail(adminMailOptions);
          console.log('=== [BACKGROUND] Лист успішно надіслано! ===');
        }

      } catch (bgError) {
        // Усі помилки бази даних чи пошти виведуться сюди, 
        // але запит клієнта вже давно завершився успіхом!
        console.error('❌ Помилка у фоновому потоці замовлення:', bgError.message);
      }
    });

  } catch (error) {
    console.error('❌ Головна помилка маршруту:', error.message);
    // Якщо трапилася помилка до відправки res.status (малоімовірно), повертаємо 500
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
  }
});

module.exports = router;