const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models'); // DİKKAT: config değil, models/index.js'den alınmalı!

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Salon App API Çalışıyor!'));

const PORT = process.env.PORT || 5000;

// Tabloları oluştur ve sunucuyu başlat
sequelize.sync({ alter: true }).then(() => {
  console.log("Veritabanı senkronize edildi.");
  app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor...`);
  });
}).catch((err) => {
  console.error("Sequelize bağlantı hatası:", err);
});
