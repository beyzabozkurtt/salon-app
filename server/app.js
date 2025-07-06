const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/config');
const paymentRoutes = require('./routes/paymentRoutes');
const saleSingleServiceRoutes = require('./routes/saleSingleServiceRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes'); // bunu da buraya aldık




const app = express();
const PORT = process.env.PORT || 5001;

// ✅ Middleware'ler en üste
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }));
app.use(bodyParser.json()); // 👈 Bu üstte olacak (veya alternatif olarak express.json())

// ✅ Route Tanımları
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/products', require('./routes/productsRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sales', require('./routes/saleRoutes'));
app.use('/api/sale-products', require('./routes/saleProductRoutes'));
app.use('/api/payments', paymentRoutes);
app.use('/api/working-hours', require('./routes/workingHoursRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/single-services', require('./routes/singleServiceRoutes'));
app.use('/api/salesingleservices', saleSingleServiceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use("/api/expenses", require("./routes/expenseRoutes"));



// 🎯 Kontrol route'u
app.get('/', (req, res) => res.send('💡 Salon API çalışıyor!'));

// 🔁 Senkronizasyon
sequelize.authenticate()
  .then(() => {
    console.log('✅ Veritabanına başarıyla bağlanıldı.');
    return sequelize.sync();
  })
  .then(() => {
    console.log("✅ Veritabanı senkronize edildi.");
    app.listen(PORT, () => {
      console.log(`🚀 Sunucu ${PORT} portunda ${process.env.NODE_ENV || 'development'} modunda çalışıyor...`);
    });
  })
  .catch(err => {
    console.error("❌ Sequelize bağlantı hatası:", err);
  });
