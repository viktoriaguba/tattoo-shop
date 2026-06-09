const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user' // Може бути 'user' або 'admin'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: ''
  },
  // --- НАШІ ОНОВЛЕНІ ПОЛЯ ДЛЯ ВЕРИФІКАЦІЇ ПОШТИ ---
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified' // Збігається з колонкою в базі Neon
  },
  verification_code: {
    type: DataTypes.STRING(6),
    allowNull: true,
    field: 'verification_code' // Збігається з колонкою в базі Neon
  },
  verification_code_expires: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verification_code_expires' // Збігається з колонкою в базі Neon
  }
}, {
  // Додаткові налаштування, щоб Sequelize не перейменовував таблицю автоматично
  tableName: 'Users', 
  timestamps: true
});

module.exports = User;