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

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Недійсний або прострочений токен токен" });
  }
};