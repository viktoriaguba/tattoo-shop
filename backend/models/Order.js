const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Гість (Тест)"
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false // Масив об'єктів товарів: [{ id, title, price, quantity }]
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Нове' // Нове, В обробці, Виконано
  }
});

module.exports = Order;