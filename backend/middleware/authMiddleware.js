const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
    if (!token) {
      return res.status(401).json({ message: "Користувач не авторизований" });
    }

    // Додаємо фолбек-ключ, щоб він збігався з генератором у server.js
    const secret = process.env.JWT_ACCESS_SECRET || 'SUPER_SECRET_FALLBACK_KEY_123';

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Помилка валідації JWT токена:", error.message);
    return res.status(401).json({ message: "Недійсний або прострочений токен" });
  }
};