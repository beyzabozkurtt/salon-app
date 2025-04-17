const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = "gizliAnahtar"; // .env ile de saklayabilirsin

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(401).json({ error: "Kullanıcı bulunamadı" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Şifre hatalı" });

  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token, user });
};
