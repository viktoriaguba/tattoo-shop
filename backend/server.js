const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const sequelize = require('./config/db');
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');
const Category = require('./models/Category');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// БІЛЬШ СТАБІЛЬНЕ НАЛАШТУВАННЯ ДЛЯ GMAIL СЕРВЕРА
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // viktoriaguba89@gmail.com
    pass: process.env.EMAIL_PASS  // Пароль додатка (16 знаків)
  },
  tls: {
    rejectUnauthorized: false // Запобігає блокуванню через локальні сертифікати SSL
  }
});

const generateAccessToken = (id, email, role, name) => {
  return jwt.sign({ id, email, role, name }, process.env.JWT_ACCESS_SECRET, { expiresIn: '24h' });
};

// --- МАРШРУТИ АВТЕНТИФІКАЦІЇ ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const candidate = await User.findOne({ where: { email } });
    if (candidate) return res.status(400).json({ message: 'Користувач з таким email вже існує' });

    const hashPassword = await bcrypt.hash(password, 7);
    
    const user = await User.create({ name, email, password: hashPassword, role: 'user' });
    const token = generateAccessToken(user.id, user.email, user.role, user.name);
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone || '',
        city: user.city || '',
        isVerified: user.is_verified
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при реєстрації', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Користувача не знайдено' });

    // ВИПРАВЛЕНО: Асинхронне порівняння паролів для стабільності на Render
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Вказано невірний пароль' });

    const token = generateAccessToken(user.id, user.email, user.role, user.name);
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        phone: user.phone || '',
        city: user.city || '',
        isVerified: user.is_verified
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при вході на сервері', error: error.message });
  }
});

// --- МАРШРУТ ОНОВЛЕННЯ ПРОФІЛЮ ---
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, city } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone !== undefined ? phone : user.phone,
      city: city !== undefined ? city : user.city
    });

    res.json({
      message: 'Профіль успішно оновлено',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        city: user.city || '',
        isVerified: user.is_verified
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка оновлення профілю', error: error.message });
  }
});

// --- СИСТЕМА ЗМІНИ ПАРОЛЯ КОРИСТУВАЧЕМ ---
app.put('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    // ВИПРАВЛЕНО: Змінено на асинхронний bcrypt.compare
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Старий пароль вказано невірно' });

    const hashPassword = await bcrypt.hash(newPassword, 7);
    user.password = hashPassword;
    await user.save();

    res.json({ message: 'Пароль успішно оновлено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка зміни пароля', error: error.message });
  }
});

// --- СИСТЕМА ВЕРИФІКАЦІЇ ПОШТИ ---
app.post('/api/auth/send-verification', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    user.verification_code = code;
    user.verification_code_expires = expires;
    await user.save();

    const mailOptions = {
      from: `"TATTOO SHOP" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '🧬 ПІДТВЕРДЖЕННЯ ОБЛІКОВОГО ЗАПИСУ | TATTOO SHOP',
      html: `
        <div style="background-color: #060606; color: #ffffff; padding: 40px; font-family: sans-serif; text-align: center; border-radius: 20px;">
          <h1 style="color: #ff4081; margin-bottom: 10px; font-weight: 900; letter-spacing: 2px;">TATTOO SHOP</h1>
          <p style="color: #aaa; font-size: 16px;">Твій код доступу для верифікації профілю. Не передавай його нікому.</p>
          <div style="background: linear-gradient(135deg, #ff4081 0%, #bd00ff 100%); display: inline-block; padding: 15px 40px; margin: 30px 0; border-radius: 12px;">
            <span style="font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: 6px;">${code}</span>
          </div>
          <p style="color: #555; font-size: 12px; margin-top: 20px;">Код дійсний протягом 15 хвилин.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Код успішно надіслано на пошту' });
  } catch (error) {
    console.error('=============================================');
    console.error('КРИТИЧНА ПОМИЛКА NODEMAILER ПРИ ВІДПРАВЦІ ЛИСТА:');
    console.error(error);
    console.error('=============================================');
    res.status(500).json({ message: 'Помилка відправки листа', error: error.message });
  }
});

app.post('/api/auth/verify-email', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    if (!user.verification_code || user.verification_code !== code || new Date(user.verification_code_expires) < new Date()) {
      return res.status(400).json({ message: 'Невірний або застарілий код підтвердження' });
    }

    user.is_verified = true;
    user.verification_code = null;
    user.verification_code_expires = null;
    await user.save();

    res.json({ 
      message: 'Email успішно підтверджено!',
      isVerified: true 
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка верифікації', error: error.message });
  }
});

// --- АДМІНІСТРАТИВНА ПАНЕЛЬ ---
app.get('/api/admin/users', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ заборонено. Ви не адмін.' });

    const users = await User.findAll({ attributes: { exclude: ['password'] } });

    const usersWithOrders = await Promise.all(users.map(async (u) => {
      const orders = await Order.findAll({ where: { customerName: u.name }, order: [['createdAt', 'DESC']] });
      return { ...u.toJSON(), orders };
    }));

    res.json(usersWithOrders);
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання даних адміном', error: error.message });
  }
});

app.put('/api/admin/users/:id/password', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ заборонено' });
    const { newPassword } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    const hashPassword = await bcrypt.hash(newPassword, 7);
    user.password = hashPassword;
    await user.save();

    res.json({ message: `Пароль для користувача ${user.name} успішно змінено!` });
  } catch (error) {
    res.status(500).json({ message: 'Помилка зміни пароля адміном', error: error.message });
  }
});

app.delete('/api/admin/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ заборонено' });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    await user.destroy();
    res.json({ message: `Користувача ${user.name} успішно видалено` });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при видаленні користувача', error: error.message });
  }
});

// --- МАРШРУТИ ДЛЯ КАТЕГОРІЙ ---
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання категорій' });
  }
});

app.post('/api/categories', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ заборонено' });
    const { name } = req.body;
    const newCategory = await Category.create({ name });
    res.status(201).json({ message: 'Категорію успішно додано!', category: newCategory });
  } catch (error) {
    res.status(500).json({ message: 'Помилка створення категорії або вона вже існує' });
  }
});

app.put('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ заборонено' });
    const { name } = req.body;
    
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Категорію не знайдено' });

    await category.update({ name: name || category.name });
    res.json({ message: 'Категорію успішно оновлено!', category });
  } catch (error) {
    res.status(500).json({ message: 'Помилка оновлення категорії', error: error.message });
  }
});

app.delete('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ заборонено' });
    
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Категорію не знайдено' });

    await category.destroy();
    res.json({ message: `Категорію "${category.name}" успішно видалено!` });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при видаленні категорії', error: error.message });
  }
});

// --- МАРШРУТИ ДЛЯ ТОВАРІВ ---
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Помилка бази даних товарів' });
  }
});

app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Доступ заборонено' });
    const { title, description, price, stock, image, category } = req.body;
    const newProduct = await Product.create({ 
      title, 
      description, 
      price: parseFloat(price), 
      stock: parseInt(stock), 
      image, 
      category, 
      attributes: {} 
    });
    res.status(201).json({ message: 'Товар успішно додано!', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Помилка додавання товару' });
  }
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ заборонено. Ви не адмін.' });
    }

    const productId = req.params.id;
    const { title, description, price, stock, image, category } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Товар не знайдено в базі даних' });
    }

    await product.update({
      title: title !== undefined ? title : product.title,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? parseFloat(price) : product.price,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      image: image !== undefined ? image : product.image,
      category: category !== undefined ? category : product.category
    });

    res.json({ message: `Товар "${product.title}" успішно оновлено!`, product });
  } catch (error) {
    console.error('Помилка оновлення товару:', error);
    res.status(500).json({ message: 'Помилка сервера при оновленні товару', error: error.message });
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ заборонено. Ви не адмін.' });
    }

    const productId = req.params.id;
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Товар не знайдено в базі даних' });
    }

    await product.destroy();
    res.json({ message: `Товар "${product.title}" успішно видалено!` });
  } catch (error) {
    res.status(500).json({ message: 'Помилка при видаленні товару', error: error.message });
  }
});

// --- 🛒 МАРШРУТ ОФОРМЛЕННЯ ЗАМОВЛЕННЯ ---
app.post('/api/orders', async (req, res) => {
  try {
    const { totalPrice, items, shippingDetails } = req.body;

    if (!shippingDetails || !items || items.length === 0) {
      return res.status(400).json({ message: 'Відсутні обов\'язкові дані замовлення' });
    }

    let customerName = "Гість (Тест)";
    let customerEmail = "Не вказано";
    
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if (decoded) {
          customerName = decoded.name || decoded.email;
          customerEmail = decoded.email;
        }
      } catch (jwtError) {
        console.log("Замовлення оформлено гостем (недійсний токен)");
      }
    }

    if (shippingDetails.name) customerName = shippingDetails.name;
    if (shippingDetails.email) customerEmail = shippingDetails.email;

    const newOrder = await Order.create({ 
      customerName: customerName, 
      phone: shippingDetails.phone,
      email: customerEmail,
      city: shippingDetails.city,
      address: shippingDetails.address,
      comment: shippingDetails.comment || '',
      totalPrice: parseFloat(totalPrice), 
      items: items 
    });

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #222; color: #ffffff; font-size: 14px;">${item.title}</td>
        <td style="padding: 12px; border-bottom: 1px solid #222; color: #aaaaaa; text-align: center; font-size: 14px;">${item.quantity || 1} шт.</td>
        <td style="padding: 12px; border-bottom: 1px solid #222; color: #ff4081; text-align: right; font-weight: bold; font-size: 14px;">${item.price * (item.quantity || 1)} грн</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"TATTOO SHOP CRM" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `🚨 НОВЕ ЗАМОВЛЕННЯ №${newOrder.id.substring(0, 8)}... | TATTOO SHOP`,
      html: `
        <div style="background-color: #060606; color: #ffffff; padding: 40px; font-family: 'Segoe UI', Roboto, sans-serif; border-radius: 20px; max-width: 600px; margin: 0 auto; border: 2px solid #ff4081; box-shadow: 0 0 20px rgba(255, 64, 129, 0.2);">
          <h2 style="color: #ff4081; border-bottom: 2px dashed #ff4081; padding-bottom: 15px; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 0; font-size: 22px; text-align: center;">⚡ НОВЕ ЗАМОВЛЕННЯ НА САЙТІ ⚡</h2>
          <p style="color: #777; font-size: 12px; text-align: center; margin-top: -5px; margin-bottom: 25px;">Повний ID: ${newOrder.id}</p>
          <h3 style="color: #bd00ff; margin-bottom: 12px; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px;">📍 Дані доставки:</h3>
          <div style="background: #111; border-radius: 10px; padding: 15px; margin-bottom: 25px; border: 1px solid #1a1a1a; line-height: 1.6;">
            <p style="margin: 4px 0; font-size: 14px;"><b style="color: #888;">Покупець:</b> <span style="color: #fff; font-weight: 600;">${customerName}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><b style="color: #888;">Контактний телефон:</b> <span style="color: #00e676; font-weight: bold;">${shippingDetails.phone || 'Не вказано'}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><b style="color: #888;">Email для зв'язку:</b> <span style="color: #eee;">${customerEmail}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><b style="color: #888;">Місто доставки:</b> <span style="color: #fff;">м. ${shippingDetails.city || 'Не вказано'}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><b style="color: #888;">Відділення / Адреса:</b> <span style="color: #fff;">${shippingDetails.address || 'Не вказано'}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><b style="color: #888;">Коментар клієнта:</b> <span style="color: #aaa; font-style: italic;">${shippingDetails.comment || 'Відсутній'}</span></p>
          </div>
          <h3 style="color: #bd00ff; margin-bottom: 12px; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px;">🛒 Склад замовлення:</h3>
          <table style="width: 100%; border-collapse: collapse; background: #0c0c0c; border-radius: 12px; overflow: hidden; border: 1px solid #1a1a1a;">
            <thead>
              <tr style="background-color: #141414;">
                <th style="padding: 12px; text-align: left; color: #666; font-size: 12px; text-transform: uppercase;">Товар</th>
                <th style="padding: 12px; color: #666; font-size: 12px; text-transform: uppercase; text-align: center;">К-сть</th>
                <th style="padding: 12px; text-align: right; color: #666; font-size: 12px; text-transform: uppercase;">Ціна</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div style="text-align: right; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #222;">
            <span style="font-size: 14px; color: #888; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Разом до сплати:</span>
            <div style="font-size: 30px; font-weight: 900; color: #ff4081; margin-top: 5px;">${totalPrice} грн</div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(201).json({ 
      success: true,
      message: 'Замовлення успішно оформлено', 
      orderId: newOrder.id 
    });
  } catch (error) {
    console.error('Помилка при створенні замовлення:', error);
    res.status(500).json({ message: 'Помилка створення замовлення', error: error.message });
  }
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      return res.json(await Order.findAll({ order: [['createdAt', 'DESC']] }));
    }
    res.json(await Order.findAll({ where: { customerName: req.user.name }, order: [['createdAt', 'DESC']] }));
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання замовлень' });
  }
});

// --- СИНХРОНІЗАЦІЯ ТА АВТО-ЗАПОВНЕННЯ ДАНИХ (SEEDER) ---
const PORT = process.env.PORT || 5000;
async function startServer() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); 
    console.log('--- Базу даних Neon успішно синхронізовано ({ alter: true }) ---');
    
    // 1. АВТОМАТИЧНЕ СТВОРЕННЯ АДМІНІСТРАТОРА (якщо немає)
    const adminEmail = 'viktoriaguba89@gmail.com';
    const adminExist = await User.findOne({ where: { email: adminEmail } });
    if (!adminExist) {
      const adminPasswordHash = await bcrypt.hash('1234567', 7);
      await User.create({
        name: 'Вікторія (Admin)',
        email: adminEmail,
        password: adminPasswordHash,
        role: 'admin',
        is_verified: true,
        phone: '+380999999999',
        city: 'Дніпро'
      });
      console.log('--- Створено головного адміністратора: viktoriaguba89@gmail.com / Пароль: 1234567 ---');
    }

    // 2. АВТОМАТИЧНЕ СТВОРЕННЯ КАТЕГОРІЙ (якщо немає)
    const catCount = await Category.count();
    if (catCount === 0) {
      await Category.bulkCreate([
        { name: 'Машинки' }, 
        { name: 'Пігменти' }, 
        { name: 'Розхідники' }
      ]);
      console.log('--- Стартові категорії створено ---');
    }

    // 3. АВТОМАТИЧНЕ СТВОРЕННЯ ДЕМО-ТОВАРІВ (якщо немає)
    const productCount = await Product.count();
    if (productCount === 0) {
      await Product.bulkCreate([
        {
          title: 'Татту машинка Xion S',
          description: 'Професійна роторна машинка для перманентного макіяжу та художнього татуювання. Ергономічний дизайн.',
          price: 18500.00,
          stock: 5,
          image: 'https://images.unsplash.com/photo-1598211686290-a8ef209d87c5?w=500',
          category: 'Машинки',
          attributes: {}
        },
        {
          title: 'Пігмент Eternal Ink Lining Black',
          description: 'Ідеальний чорний пігмент для створення чітких контурів. Об\'єм 30 мл. Стерильний та безпечний.',
          price: 650.00,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1611605698335-8b15d27e83f9?w=500',
          category: 'Пігменти',
          attributes: {}
        },
        {
          title: 'Картриджі Kwadron 0.30 3RL',
          description: 'Преміальні тату модулі (картриджі) з довгою заточкою. В упаковці 20 штук. Гострі та точні голки.',
          price: 1200.00,
          stock: 12,
          image: 'https://images.unsplash.com/photo-1590246814883-57c511e76523?w=500',
          category: 'Розхідники',
          attributes: {}
        }
      ]);
      console.log('--- Стартові товари додано в магазин! ---');
    }

    app.listen(PORT, () => console.log(`--- Сервер працює на порту ${PORT} ---`));
  } catch (error) {
    console.error('Помилка запуска:', error);
  }
}
startServer();