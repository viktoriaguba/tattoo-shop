const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, 
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    },
    connectTimeout: 10000 // 🔥 Зменшуємо таймаут підключення до 10 секунд
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Тестуємо підключення до Neon прямо при запуску сервера
sequelize.authenticate()
  .then(() => {
    console.log('✨ УСПІШНО: Бекенд підключився до бази даних Neon!');
    
    // Автоматично оновлюємо структуру таблиць, якщо вони застрягли
    return sequelize.sync({ alter: true }); 
  })
  .then(() => {
    console.log('📦 Таблиці Sequelize успішно синхронізовані з Neon.');
  })
  .catch(err => {
    console.error('❌ ПОМИЛКА: База даних Neon не відповідає:', err.message);
  });

module.exports = sequelize;