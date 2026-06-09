const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Ініціалізація відправника пошти
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// Ендпоінт для створення замовлення (POST /api/orders)
router.post('/', async (req, res) => {
  try {
    const { items, shippingDetails, totalPrice } = req.body;

    if (!items || !shippingDetails) {
      return res.status(400).json({ message: 'Відсутні обов\'язкові дані замовлення' });
    }

    // 1. НАЙВАЖЛИВІШЕ: Створюємо запис у базі даних
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

    // 2. МИТТЄВО ПОВЕРТАЄМО ВІДПОВІДЬ НА ФРОНТЕНД!
    // Клієнт одразу побачить вікно успіху, а кошик очиститься.
    res.status(201).json({
      success: true,
      orderId: newOrder.id, 
      message: 'Замовлення успішно створено!'
    });

    // 3. ВІДПРАВКА ЛИСТА У ПОВНІСТЮ ІЗОЛЬОВАНОМУ ФОНОВОМУ ПОТОЦІ
    // setImmediate гарантує, що цей код виконається ПІСЛЯ того, як відповідь пішла клієнту
    setImmediate(async () => {
      // Керування відправкою: якщо хочеш тимчасово вимкнути пошту, щоб Render не ламався — зміни true на false
      const enableEmail = true; 

      if (!enableEmail) return;

      try {
        const adminEmailHtml = `
          <div style="background-color: #060606; color: #ffffff; padding: 30px; font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ff4081; border-radius: 16px;">
            <h2 style="color: #ff4081; text-transform: uppercase;">⚡ НОВЕ ЗАМОВЛЕННЯ #${newOrder.id}</h2>
            <p><b>Клієнт:</b> ${newOrder.customerName}</p>
            <p><b>Телефон:</b> ${newOrder.phone}</p>
            <p><b>Сума:</b> ${totalPrice} грн</p>
          </div>
        `;

        const adminMailOptions = {
          from: `"TATTOO SHOP" <${process.env.EMAIL_USER}>`,
          to: 'viktoriaguba89@gmail.com', 
          subject: `🔥 Нове замовлення від ${newOrder.customerName} — TATTOO SHOP`,
          html: adminEmailHtml
        };

        // Тут може відбуватися Connection Timeout, але він уже в окремому ізольованому траї
        await transporter.sendMail(adminMailOptions);
        console.log(`📧 Фоновий лист для замовлення #${newOrder.id} успішно надіслано.`);

      } catch (mailError) {
        // Якщо Google знову скине підключення, ми просто запишемо це в логи, 
        // але замовлення в базі вже створено і користувач щасливий!
        console.error('⚠️ Помилка надсилання фонової пошти (ігнорується):', mailError.message);
      }
    });

  } catch (error) {
    console.error('❌ КРИТИЧНА ПОМИЛКА СТВОРЕННЯ ЗАМОВЛЕННЯ В БД:', error);
    return res.status(500).json({ 
      message: 'Помилка сервера при оформленні замовлення', 
      error: error.message 
    });
  }
});

module.exports = router;