let filterType = "this-month";
let startDate = null;
let endDate = null;

// Türkçe gün isimleri
const turkishDays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

// Flatpickr başlat ve localization ayarla
flatpickr.localize(flatpickr.l10ns.tr);
flatpickr("#startDateLabel", {
  enableTime: false,
  dateFormat: "Y-m-d",
  onChange: function (selectedDates) {
    startDate = selectedDates[0];
    document.getElementById("startDateLabel").innerText = selectedDates[0].toLocaleDateString("tr-TR");
    checkFilterReady();
  }
});
flatpickr("#endDateLabel", {
  enableTime: false,
  dateFormat: "Y-m-d",
  onChange: function (selectedDates) {
    endDate = selectedDates[0];
    document.getElementById("endDateLabel").innerText = selectedDates[0].toLocaleDateString("tr-TR");
    checkFilterReady();
  }
});

function checkFilterReady() {
  const btn = document.getElementById("getReportBtn");
  btn.classList.toggle("d-none", !(startDate && endDate));
}

function setFilterType(type) {
  filterType = type;
  document.getElementById("dateFilterLabel").innerText =
    type === "today" ? "Bugün" :
    type === "yesterday" ? "Dün" :
    type === "last-month" ? "Geçen Ay" :
    type === "custom" ? "Özel Tarih" : "Bu Ay";

  document.getElementById("custom-date-wrapper").classList.toggle("d-none", type !== "custom");
  if (type !== "custom") getDateRange();
}

function getDateRange() {
  const today = new Date();
  let start, end;

  if (filterType === "today") {
    start = end = today;
  } else if (filterType === "yesterday") {
    start = end = new Date(today.setDate(today.getDate() - 1));
  } else if (filterType === "this-month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  } else if (filterType === "last-month") {
    start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    end = new Date(today.getFullYear(), today.getMonth(), 0);
  }

  if (start && end) fetchSalesReport(start, end);
}

document.getElementById("getReportBtn").addEventListener("click", () => {
  if (startDate && endDate) fetchSalesReport(startDate, endDate);
});

function renderPieChart(paketToplam, hizmetToplam, urunToplam, masrafToplam) {
  Highcharts.chart('salesPieChart', {
    chart: { type: 'pie', backgroundColor: 'transparent' },
    title: { text: '' },
    tooltip: { pointFormat: '<b>{point.y:.0f} ₺</b> ({point.percentage:.1f}%)' },
    accessibility: { point: { valueSuffix: '₺' } },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        colors: [
          { radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 }, stops: [[0, '#00bcd4'], [1, '#007c91']] },
          { radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 }, stops: [[0, '#4caf50'], [1, '#2e7d32']] },
          { radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 }, stops: [[0, '#ffc107'], [1, '#ff9800']] },
          { radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 }, stops: [[0, '#f44336'], [1, '#b71c1c']] }
        ],
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y:.0f} ₺'
        }
      }
    },
    series: [{
      name: 'Tutar',
      colorByPoint: true,
      data: [
        { name: 'Paket Satışı', y: paketToplam },
        { name: 'Hizmet Satışı', y: hizmetToplam },
        { name: 'Ürün Satışı', y: urunToplam },
        { name: 'Giderler', y: masrafToplam }
      ]
    }]
  });
}
function updateColumnTotals() {
  let hizmet = 0, paket = 0, urun = 0, toplam = 0, tahsil = 0, masraf = 0;

  document.querySelectorAll("#salesReportTable tbody tr").forEach(row => {
    const cells = row.querySelectorAll("td");

    const temizle = (text) => parseFloat((text || "0").replace(/[^\d.-]+/g, ""));

    hizmet += temizle(cells[2]?.textContent);
    paket += temizle(cells[3]?.textContent);
    urun += temizle(cells[4]?.textContent);
    toplam += temizle(cells[5]?.textContent);
    tahsil += temizle(cells[6]?.textContent);
    masraf += temizle(cells[7]?.textContent);
  });

  document.getElementById("hizmetTotal").textContent = hizmet.toLocaleString() + " ₺";
  document.getElementById("paketTotal").textContent = paket.toLocaleString() + " ₺";
  document.getElementById("urunTotal").textContent = urun.toLocaleString() + " ₺";
  document.getElementById("genelTotal").textContent = toplam.toLocaleString() + " ₺";
  document.getElementById("tahsilTotal").textContent = tahsil.toLocaleString() + " ₺";
  document.getElementById("masrafTotal").textContent = masraf.toLocaleString() + " ₺";
}

async function fetchSalesReport(start, end) {
  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  let toplamPaket = 0;
  let toplamHizmet = 0;
  let toplamUrun = 0;
  let toplamTahsil = 0;
  let toplamMasraf = 0;

  try {
    const res = await fetch(`http://localhost:5001/api/reports/sales?start=${startStr}&end=${endStr}`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("companyToken") }
    });

    const data = await res.json();
    console.log("✅ Gelen veri:", data);

    const tbody = document.querySelector("#salesReportTable tbody");
    tbody.innerHTML = "";

    const tarihListesi = [];
    const paketListesi = [];
    const hizmetListesi = [];
    const urunListesi = [];
    const tahsilListesi = [];
    const masrafListesi = [];

    data.forEach(item => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="text-center">${item.tarih}</td>
        <td class="text-center">${item.gun}</td>
        <td class="text-center fw-semibold">${item.hizmet} ₺</td>
        <td class="text-center fw-semibold">${item.paket} ₺</td>
        <td class="text-center fw-semibold">${item.urun} ₺</td>
        <td class="text-center fw-bold text-primary">${item.toplam} ₺</td>
        <td class="text-center fw-bold text-success">${item.tahsil} ₺</td>
        <td class="text-center fw-bold text-danger">${item.masraf} ₺</td>
      `;
      tbody.appendChild(tr);

      toplamPaket += item.paket;
      toplamHizmet += item.hizmet;
      toplamUrun += item.urun;
      toplamTahsil += item.tahsil;
      toplamMasraf += item.masraf;

      tarihListesi.push(item.tarih);
      paketListesi.push(item.paket);
      hizmetListesi.push(item.hizmet);
      urunListesi.push(item.urun);
      tahsilListesi.push(item.tahsil);
      masrafListesi.push(item.masraf);
      updateColumnTotals();
    });

    // Kartlara yaz
    document.getElementById("paketToplam").innerText = `${toplamPaket.toLocaleString()} ₺`;
    document.getElementById("hizmetToplam").innerText = `${toplamHizmet.toLocaleString()} ₺`;
    document.getElementById("urunToplam").innerText = `${toplamUrun.toLocaleString()} ₺`;
    document.getElementById("tahsilToplam").innerText = `${toplamTahsil.toLocaleString()} ₺`;
    document.getElementById("masrafToplam").innerText = `${toplamMasraf.toLocaleString()} ₺`;

    // Pie Chart
    renderPieChart(toplamPaket, toplamHizmet, toplamUrun, toplamMasraf);

    // Column Chart (With Data Labels)
Highcharts.chart('dailyLineChart', {
  chart: {
    type: 'line',
    backgroundColor: 'transparent'
  },
  title: { text: '' },
  xAxis: {
    categories: tarihListesi,
    crosshair: true
  },
  yAxis: {
    min: 0,
    title: { text: 'Tutar (₺)' }
  },
  tooltip: {
    shared: true,
    useHTML: true,
    valueSuffix: ' ₺'
  },
  plotOptions: {
    line: {
      dataLabels: {
        enabled: true,
        format: '{point.y:.0f} ₺'
      }
    }
  },
  series: [
    { name: 'Paket', data: paketListesi, color: '#673AB7' },
    { name: 'Hizmet', data: hizmetListesi, color: '#03A9F4' },
    { name: 'Ürün', data: urunListesi, color: '#FFC107' },
    { name: 'Tahsilat', data: tahsilListesi, color: '#4CAF50' },
    { name: 'Gider', data: masrafListesi, color: '#F44336' }
  ]
});


  } catch (err) {
    console.error("❌ Hata:", err);
    alert("Sunucudan veri alınamadı.");
  }
}

// Sayfa yüklenince çalıştır
setFilterType("this-month");
