const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { body, validationResult } = require("express-validator");

const JWT_SECRET = "salonappsecret"; // güvenli bir ortam değişkeni olmalı

// REGISTER
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    res.json(user);
  }
);

// Giriş
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    // Kullanıcıyı bul
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Kullanıcı bulunamadı." });
  
    // Şifreyi karşılaştır
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Şifre yanlış." });
  
    // Token üret
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  });
  

module.exports = router;
