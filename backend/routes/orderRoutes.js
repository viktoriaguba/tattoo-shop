const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Ендпоінт для створення замовлення (POST /api/orders)
router.post('/', async (req, res) => {
  console.log('=== [START] Отримано запит на створення замовлення ===');
  console.log('Дані з фронтенду:', JSON.stringify(req.body, null, 2));
  
  try {
    const { items, shippingDetails, totalPrice } = req.body;

    // Валідація вхідних даних
    if (!items || !shippingDetails) {
      console.log('=== [WARN] Запит відхилено: відсутні items або shippingDetails ===');
      return res.status(400).json({ message: 'Відсутні обов\'язкові дані замовлення' });
    }

    console.log('=== [DATABASE] Спроба запису в базу даних... ===');

    // Створюємо запис у базі даних (Sequelize)
    const newOrder = await Order.create({
      customerName: shippingDetails.name,
      phone: shippingDetails.phone,
      email: shippingDetails.email,
      city: shippingDetails.city,
      address: shippingDetails.address,
      comment: shippingDetails.comment,
      totalPrice: totalPrice,
      items: items // Sequelize автоматично збереже масив об'єктів у JSON/JSONB
    });

    console.log('=== [SUCCESS] Замовлення успішно створено в БД! ID:', newOrder.id);

    // Миттєво повертаємо успіх на фронтенд
    return res.status(201).json({
      success: true,
      orderId: newOrder.id, 
      message: 'Замовлення успішно створено!'
    });

  } catch (error) {
    console.error('❌ КРИТИЧНА ПОМИЛКА ПРИ СТВОРЕННІ ЗАМОВЛЕННЯ:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    
    return res.status(500).json({ 
      message: 'Помилка сервера при оформленні замовлення', 
      error: error.message 
    });
  }
});

module.exports = router;