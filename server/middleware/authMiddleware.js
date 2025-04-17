const jwt = require("jsonwebtoken");
const JWT_SECRET = "salonappsecret";

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: "Token yok." });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Geçersiz token." });
  }
};
