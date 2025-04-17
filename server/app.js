const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// 👇 Route tanımları
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes')); // 🔥 EKLENDİ
app.use("/api/auth", require("./routes/authRoutes"));
app.get('/', (req, res) => res.send('💡 Salon API 5001 çalışıyor!'));

sequelize.sync({ alter: true }).then(() => {
  console.log("✅ Veritabanı senkronize.");
  app.listen(PORT, () => {
    console.log(`🚀 Sunucu ${PORT} portunda çalışıyor...`);
  });
}).catch(err => console.error("❌ Sequelize bağlantı hatası:", err));
