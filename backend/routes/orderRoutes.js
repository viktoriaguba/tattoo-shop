const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Ініціалізація відправника пошти через змінні .env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS // Твій 16-значний пароль додатка з Google
  }
});

// Ендпоінт для створення замовлення (POST /api/orders)
router.post('/', async (req, res) => {
  try {
    const { items, shippingDetails, totalPrice } = req.body;

    if (!items || !shippingDetails) {
      return res.status(400).json({ message: 'Відсутні обов\'язкові дані замовлення' });
    }

    // 1. Створюємо запис у базі даних (Це головне!)
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

    // 2. Генерація стильного темного HTML-шаблону листа для Адміна
    const adminEmailHtml = `
      <div style="background-color: #060606; color: #ffffff; padding: 30px; font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #ff4081; border-radius: 16px; box-shadow: 0 4px 20px rgba(255,64,129,0.2);">
        <h2 style="color: #ff4081; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px dashed #ff4081; padding-bottom: 15px; margin-top: 0; font-size: 20px;">
          ⚡ НОВЕ ЗАМОВЛЕННЯ
        </h2>
        <p style="color: #888; font-size: 12px; margin-top: -10px;">ID: ${newOrder.id}</p>
        
        <table style="width: 100%; margin-bottom: 25px; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="color: #777; padding: 6px 0; width: 130px;">Клієнт (ПІБ):</td>
            <td style="color: #fff; font-weight: bold; padding: 6px 0;">${newOrder.customerName}</td>
          </tr>
          <tr>
            <td style="color: #777; padding: 6px 0;">Телефон:</td>
            <td style="color: #00e676; font-weight: bold; padding: 6px 0;">${newOrder.phone}</td>
          </tr>
          <tr>
            <td style="color: #777; padding: 6px 0;">Email клієнта:</td>
            <td style="color: #eee; padding: 6px 0;">${newOrder.email || 'Не вказано'}</td>
          </tr>
          <tr>
            <td style="color: #777; padding: 6px 0;">Куди доставити:</td>
            <td style="color: #fff; padding: 6px 0;">м. ${newOrder.city}, ${newOrder.address}</td>
          </tr>
          <tr>
            <td style="color: #777; padding: 6px 0;">Коментар:</td>
            <td style="color: #aaa; font-style: italic; padding: 6px 0;">${newOrder.comment || 'Немає'}</td>
          </tr>
        </table>

        <h3 style="color: #bd00ff; text-transform: uppercase; font-size: 14px; margin-bottom: 10px; letter-spacing: 0.5px;">📋 СКЛАД ЗАМОВЛЕННЯ:</h3>
        <div style="background: #111; border-radius: 10px; padding: 5px 15px; border: 1px solid #222;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${items.map(item => `
              <tr style="border-bottom: 1px solid #222;">
                <td style="padding: 12px 0; color: #eee;">${item.title}</td>
                <td style="padding: 12px 0; color: #888; text-align: center; width: 60px;">x${item.quantity}</td>
                <td style="padding: 12px 0; color: #fff; font-weight: bold; text-align: right; width: 80px;">${item.price * item.quantity} ₴</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div style="margin-top: 30px; text-align: right;">
          <span style="color: #888; font-weight: bold; font-size: 13px; letter-spacing: 0.5px;">ЗАГАЛЬНА СУМА:</span>
          <div style="color: #ff4081; font-size: 26px; font-weight: 900; margin-top: 5px; filter: drop-shadow(0 0 5px rgba(255,64,129,0.3));">${totalPrice} грн</div>
        </div>
      </div>
    `;

    const adminEmailTarget = 'viktoriaguba89@gmail.com'; 

    // 3. Опції надсилання листа
    const adminMailOptions = {
      from: `"TATTOO SHOP" <${process.env.EMAIL_USER}>`,
      to: adminEmailTarget, 
      subject: `🔥 Нове замовлення від ${newOrder.customerName} — TATTOO SHOP`,
      html: adminEmailHtml
    };

    // 🔥 КРИТИЧНЕ ВИПРАВЛЕННЯ: Прибираємо await! 
    // Лист відправляється асинхронно на фоні, сервер не чекає на відповідь від Google
    transporter.sendMail(adminMailOptions).catch(mailError => {
      console.error('Помилка надсилання пошти у фоновому режимі:', mailError);
    });

    // 4. МИТТЄВО повертаємо відповідь клієнту, щоб додаток НЕ зависав!
    return res.status(201).json({
      success: true,
      orderId: newOrder.id, 
      message: 'Замовлення створено!'
    });

  } catch (error) {
    console.error('Помилка обробки замовлення бекендом:', error);
    return res.status(500).json({ 
      message: 'Помилка сервера при оформленні замовлення', 
      error: error.message 
    });
  }
});

module.exports = router;