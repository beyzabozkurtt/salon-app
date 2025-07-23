let filterType = "this-month";
let startDate = null;
let endDate = null;
const token = localStorage.getItem("companyToken");
const axiosConfig = { headers: { Authorization: "Bearer " + token } };

document.addEventListener("DOMContentLoaded", () => {
  flatpickr(".flatpickr", { dateFormat: "d.m.Y", locale: "tr" });

  fetchMaasGunu();
  loadModal("../modals/add-expense.html", "addExpenseModal");
  setFilterType("this-month");

    document.getElementById("startDateLabel").addEventListener("click", () => {
      flatpickrInstance("startDateLabel", (selected) => {
        startDate = selected;
        document.getElementById("startDateLabel").textContent = formatTRDate(selected);
        toggleFilterButton();
        document.getElementById("endDateLabel").click(); // otomatik bitişi aç
      });
    });

    document.getElementById("endDateLabel").addEventListener("click", () => {
      flatpickrInstance("endDateLabel", (selected) => {
        endDate = selected;
        document.getElementById("endDateLabel").textContent = formatTRDate(selected);
        toggleFilterButton();
        fetchExpenses(convertToISO(startDate), convertToISO(endDate)); // otomatik filtrele
      });
    });


  document.getElementById("filterCustomRangeBtn").addEventListener("click", () => {
    if (startDate && endDate) {
      fetchExpenses(startDate, endDate);
    }
  });
});
async function showDatePicker(title) {
  const { value: dateStr } = await Swal.fire({
    title,
    input: "text",
    inputPlaceholder: "19.07.2025",
    inputLabel: "Gün.Ay.Yıl formatında",
    inputValue: new Date().toLocaleDateString("tr-TR"),
    didOpen: () => {
      const input = Swal.getInput();
      flatpickr(input, {
        dateFormat: "d.m.Y",
        defaultDate: new Date(),
        locale: "tr"
      });
    },
    confirmButtonText: "Tamam",
    cancelButtonText: "İptal",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) return "Tarih gerekli!";
      if (!convertToISO(value)) return "Geçerli bir tarih girin!";
      return null;
    }
  });

  return convertToISO(dateStr);
}
function formatReadableDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString("tr-TR");
}

function flatpickrInstance(targetId, onSelect) {
  const fp = flatpickr(document.createElement("input"), {
    dateFormat: "Y-m-d",
    defaultDate: "today",
    locale: "tr",
    onChange: function(selectedDates) {
      if (selectedDates.length > 0) {
        onSelect(selectedDates[0]);
        fp.destroy();
      }
    }
  });
  fp.open();
}

function formatTRDate(dateObj) {
  return dateObj.toLocaleDateString("tr-TR");
}


// 🔧 Filtre tipi seç
function setFilterType(type) {
  filterType = type;
  document.getElementById("dateFilterLabel").textContent = labelForFilter(type);
  document.getElementById("custom-date-wrapper").classList.toggle("d-none", type !== "custom");

  const range = getDateRange(type);
  fetchExpenses(range.startDate, range.endDate);
}

// 🔄 Tarih aralığı belirle
function getDateRange(type) {
  const now = new Date();
  let start, end;

  switch (type) {
    case "today":
      start = end = now;
      break;
    case "yesterday":
      start = end = new Date(now.setDate(now.getDate() - 1));
      break;
    case "this-month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "last-month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case "custom":
      return {
        startDate: convertToISO(startDate),
        endDate: convertToISO(endDate)
      };
  }

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0]
  };
}

function labelForFilter(type) {
  return {
    "today": "Bugün",
    "yesterday": "Dün",
    "this-month": "Bu Ay",
    "last-month": "Geçen Ay",
    "custom": "Özel Tarih"
  }[type] || "Filtre";
}

function toggleFilterButton() {
  const btn = document.getElementById("filterCustomRangeBtn");
  btn.classList.toggle("d-none", !startDate || !endDate);
}

// 📦 Masraf verilerini çek
async function fetchExpenses(startDate, endDate) {
  try {
    const res = await axios.get(`http://localhost:5001/api/expenses?startDate=${startDate}&endDate=${endDate}`, axiosConfig);
    const data = res.data;
    const tbody = document.getElementById("expense-table-body");
    const summary = {};
    let total = 0;
    tbody.innerHTML = "";

    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.category}</td>
        <td>${item.description || "-"}</td>
        <td>${parseFloat(item.amount).toFixed(2)} TL</td>
        <td>${item.User?.name || "-"}</td>
        <td>${item.paymentMethod || "-"}</td>
        <td>${formatDate(item.expenseDate)}</td>
        <td>${formatDateTime(item.createdAt)}</td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-light border me-1" onclick='editExpense(${JSON.stringify(item)})'>
            <i class="bi bi-pencil text-primary"></i>
          </button>
          <button class="btn btn-sm btn-light border" onclick='deleteExpense(${item.id})'>
            <i class="bi bi-trash text-danger"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);

      summary[item.category] = summary[item.category] || { adet: 0, toplam: 0 };
      summary[item.category].adet++;
      summary[item.category].toplam += parseFloat(item.amount);
      total += parseFloat(item.amount);
    });

    document.getElementById("total-amount").textContent = `Toplam tutar: ${total.toFixed(2)} TL`;
    fillCategorySummary(summary);
    const chartData = Object.entries(summary).map(([kategori, { toplam }]) => ({
    kategori,
    toplam
}));
renderAnimatedExpenseChart(chartData);

  } catch (err) {
    console.error("Masraflar alınamadı:", err);
  }
}
// 📤 Masrafları CSV olarak dışa aktar
document.getElementById("exportBtn").addEventListener("click", () => {
  const rows = document.querySelectorAll("#expense-table-body tr");
  if (rows.length === 0) {
    Swal.fire("Uyarı", "Dışa aktarılacak veri bulunamadı.", "warning");
    return;
  }

  let csv = "Kategori;Açıklama;Tutar;Masraf Sahibi;Ödeme Yöntemi;Tarih;Oluşturulma\n";

  rows.forEach(row => {
    const cols = row.querySelectorAll("td");
    let rowData = [];
    for (let i = 0; i < cols.length - 1; i++) {
      rowData.push(cols[i].innerText.trim().replace(/\n/g, " "));
    }
    csv += rowData.join(";") + "\n";
  });

  // UTF-8 BOM ekle
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "masraflar.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});


// 📥 Özet tabloyu doldur
function fillCategorySummary(summary) {
  const tbody = document.querySelector("#kategori tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  for (const category in summary) {
    const { adet, toplam } = summary[category];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${category}</td>
      <td>${adet}</td>
      <td>${toplam.toFixed(2)} TL</td>
    `;
    tbody.appendChild(row);
  }
}

// 🔧 Modal yükle
async function loadModal(url, name) {
  const res = await fetch(url);
  const html = await res.text();
  document.getElementById("modal-container").innerHTML = html;
  if (window[name]?.init) window[name].init();
}

// 🧾 Maaş günü bilgisi
async function fetchMaasGunu() {
  try {
    const res = await axios.get("http://localhost:5001/api/companies/maas-gunu", axiosConfig);
    document.getElementById("maasGunuText").textContent = res.data.maasGunu;
  } catch (err) {
    console.error("Maaş günü alınamadı:", err);
  }
}

function guncelleMaasGunu() {
  Swal.fire({
    title: "Maaş Günü Güncelle",
    input: "number",
    inputLabel: "Her ayın kaçında?",
    inputPlaceholder: "1-31 arasında bir gün",
    inputAttributes: { min: 1, max: 31 },
    showCancelButton: true,
    confirmButtonText: "Kaydet",
    cancelButtonText: "İptal"
  }).then(async (result) => {
    if (result.isConfirmed && result.value >= 1 && result.value <= 31) {
      try {
        await axios.put("http://localhost:5001/api/companies/maas-gunu", { maasGunu: result.value }, axiosConfig);
        document.getElementById("maasGunuText").textContent = result.value;
        Swal.fire("Başarılı", "Maaş günü güncellendi", "success");
      } catch (err) {
        Swal.fire("Hata", "Güncelleme başarısız", "error");
      }
    }
  });
}

// 🧹 Yardımcılar
function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR");
}

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString("tr-TR");
}

function convertToISO(dateStr) {
  const parts = dateStr.split(".");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const testDate = new Date(isoDate);
  return isNaN(testDate) ? null : isoDate;
}


// ❌ Silme işlemi
window.deleteExpense = async function (id) {
  const result = await Swal.fire({
    title: "Emin misiniz?",
    text: "Bu masraf kalıcı olarak silinecek!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Evet, sil",
    cancelButtonText: "Vazgeç"
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`http://localhost:5001/api/expenses/${id}`, axiosConfig);
      const range = getDateRange(filterType);
      await fetchExpenses(range.startDate, range.endDate);
      Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Masraf silindi", showConfirmButton: false, timer: 2000 });
    } catch (err) {
      Swal.fire("Hata!", "Masraf silinemedi.", "error");
    }
  }
};

function renderAnimatedExpenseChart(expenseData) {
  Highcharts.chart('expenseChart', {
    chart: {
      type: 'pie',
      animation: Highcharts.svg, // IE < 10 için fallback
      backgroundColor: 'transparent'
    },
    title: { text: '' },
    tooltip: {
      pointFormat: '<b>{point.y:.2f} TL</b> ({point.percentage:.1f}%)'
    },
    accessibility: {
      point: { valueSuffix: 'TL' }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        startAngle: -90,
        endAngle: 90,
        center: ['50%', '75%'],
        size: '100%',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.y:.0f} TL',
          style: {
            fontWeight: 'bold',
            color: 'black'
          }
        }
      }
    },
    series: [{
      name: 'Tutar',
      colorByPoint: true,
      data: expenseData.map(item => ({
        name: item.kategori,
        y: item.toplam
      }))
    }]
  });
}
