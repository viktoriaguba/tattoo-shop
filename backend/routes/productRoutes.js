// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 1. Отримати всі тату-товари з бази даних
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Помилка при отриманні товарів', error: error.message });
  }
});

// 2. Додати новий товар у базу даних
router.post('/', async (req, res) => {
  try {
    const { title, description, price, stock, image, category, attributes } = req.body;
    
    const newProduct = await Product.create({
      title,
      description,
      price,
      stock,
      image,
      category,
      attributes
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: 'Помилка при створенні товару', error: error.message });
  }
});

// 3. ВИДАЛИТИ товар з бази даних (Виправлення помилки 404)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Шукаємо товар у базі Sequelize
    const product = await Product.findByPk(id);

    // Якщо товару з таким ID немає, повертаємо 404 з нормальним повідомленням
    if (!product) {
      return res.status(404).json({ message: 'Товар не знайдено в базі даних' });
    }

    // Видаляємо знайдений товар
    await product.destroy();

    res.status(200).json({ message: 'Товар успішно видалено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при видаленні товару', error: error.message });
  }
});

module.exports = router;