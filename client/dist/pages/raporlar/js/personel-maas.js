let selectedDate = new Date();
const token = localStorage.getItem("companyToken");
const axiosConfig = { headers: { Authorization: "Bearer " + token } };

// Sayfa yüklendiğinde
window.addEventListener("DOMContentLoaded", () => {
  fetchMaasGunu();
  generateSalariesIfDue();
  fetchSalaries();

  const filterSelect = document.getElementById("filter-type");
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      fetchSalaries();
    });
  }
});


function getSalaryDateRange() {
  const today = new Date();
  let start, end;

  switch (currentFilterType) {
    case "custom":
      if (!customStart || !customEnd) return null;
      start = customStart;
      end = customEnd;
      break;

    case "today":
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;

    case "yesterday":
      start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      break;

    case "last-month":
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;

    case "this-month":
    default:
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0]
  };
}


async function fetchMaasGunu() {
  try {
    const res = await axios.get("http://localhost:5001/api/companies/maas-gunu", axiosConfig);
    const box = document.getElementById("maasGunuText");
    if (box) box.textContent = res.data.maasGunu;

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
        console.error("Maaş günü güncelleme hatası:", err);
      }
    }
  });
}

async function generateSalariesIfDue() {
  try {
    await axios.post("http://localhost:5001/api/salaries/generate", {}, axiosConfig);
  } catch (err) {
    console.error("Maaş oluşturma hatası:", err);
  }
}

async function fetchSalaries() {
  try {
    const { startDate, endDate } = getSalaryDateRange();
    const res = await axios.get(`http://localhost:5001/api/prims/summary?startDate=${startDate}&endDate=${endDate}`, axiosConfig);

    const data = res.data;
    const tbody = document.getElementById("salary-table-body");
    tbody.innerHTML = "";

    data.forEach(item => {
      const toplam = item.total || 0;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.User?.name || "-"}</td>
        <td>${item.salary?.toFixed(2) || "0.00"} TL</td>
        <td>${item.urunPrim?.toFixed(2) || "0.00"} TL</td>
        <td>${item.paketPrim?.toFixed(2) || "0.00"} TL</td>
        <td>${item.hizmetPrim?.toFixed(2) || "0.00"} TL</td>
        <td class="fw-bold">${toplam.toFixed(2)} TL</td>
          <td>
            <button class="btn btn-sm btn-outline-secondary" onclick="openDetailModal(${item.User?.id})">
              <i class="bi bi-search"></i>
            </button>
         </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Maaş giderleri alınamadı:", err);
  }
}

window.yenidenHesapla = async function (id) {
  try {
    await axios.get(`http://localhost:5001/api/salaries/calculate/${id}`, axiosConfig);
    fetchSalaries();
    Swal.fire("Başarılı", "Maaş yeniden hesaplandı", "success");
  } catch (err) {
    console.error("Yeniden hesaplama hatası:", err);
    Swal.fire("Hata", "Hesaplama başarısız", "error");
  }
};
// Güncel seçimi tut
let currentFilterType = "this-month";
let customStart = null;
let customEnd = null;

function setFilterType(type) {
  currentFilterType = type;

  const labelMap = {
    "today": "Bugün",
    "yesterday": "Dün",
    "this-month": "Bu Ay",
    "last-month": "Geçen Ay",
    "custom": "Özel Tarih"
  };

  document.getElementById("dateFilterLabel").textContent = labelMap[type] || "Tarih";

    if (type === "custom") {
      customStart = null;
      customEnd = null;
      document.getElementById("startDateLabel").textContent = "Henüz seçilmedi";
      document.getElementById("endDateLabel").textContent = "Henüz seçilmedi";
      document.getElementById("filterCustomRangeBtn").classList.add("d-none");
      document.getElementById("custom-date-wrapper").classList.remove("d-none");

    // 🧭 Başlangıç Tarihi Seçimi
document.getElementById("startDateLabel").addEventListener("click", async () => {
  document.getElementById("endDateLabel").addEventListener("click", async () => {
  const { value: endDate } = await Swal.fire({
    title: 'Bitiş Tarihi Seçin',
    input: 'text',
    inputAttributes: { autocomplete: 'off' },
    didOpen: () => {
      flatpickr(Swal.getInput(), {
        locale: 'tr',
        dateFormat: 'Y-m-d',
        minDate: customStart || new Date(),
        defaultDate: customEnd || new Date()
      });
    },
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "İptal",
    preConfirm: (value) => {
      if (!value) {
        Swal.showValidationMessage("Lütfen tarih seçin");
      }
      return value;
    }
  });

  if (endDate) {
    customEnd = new Date(endDate);
    document.getElementById("endDateLabel").textContent = customEnd.toLocaleDateString("tr-TR");
    document.getElementById("filterCustomRangeBtn").classList.remove("d-none");
  }
});

  const { value: startDate } = await Swal.fire({
    title: 'Başlangıç Tarihi Seçin',
    input: 'text',
    inputAttributes: { autocomplete: 'off' },
    didOpen: () => {
      flatpickr(Swal.getInput(), {
        locale: 'tr',
        dateFormat: 'Y-m-d',
        defaultDate: new Date()
      });
    },
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "İptal",
    preConfirm: (value) => {
      if (!value) {
        Swal.showValidationMessage("Lütfen tarih seçin");
      }
      return value;
    }
  });

  if (startDate) {
    customStart = new Date(startDate);
    document.getElementById("startDateLabel").textContent = customStart.toLocaleDateString("tr-TR");

    // ✅ Başlangıç seçilince hemen bitişi göster
    const { value: endDate } = await Swal.fire({
      title: 'Bitiş Tarihi Seçin',
      input: 'text',
      inputAttributes: { autocomplete: 'off' },
      didOpen: () => {
        flatpickr(Swal.getInput(), {
          locale: 'tr',
          dateFormat: 'Y-m-d',
          minDate: customStart,
          defaultDate: new Date()
        });
      },
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "İptal",
      preConfirm: (value) => {
        if (!value) {
          Swal.showValidationMessage("Lütfen tarih seçin");
        }
        return value;
      }
    });

    if (endDate) {
      customEnd = new Date(endDate);
      document.getElementById("endDateLabel").textContent = customEnd.toLocaleDateString("tr-TR");
      document.getElementById("filterCustomRangeBtn").classList.remove("d-none");
    }
  }
});



  } else {
    // Diğer filtreler
    document.getElementById("custom-date-wrapper").classList.add("d-none");
    fetchSalaries();
  }
}


// Mevcut koddaki `getSalaryDateRange()` fonksiyonunu şu satırla değiştir:
function getSalaryDateRange() {
  const today = new Date();
  let start, end;

  switch (currentFilterType) {
    case "custom":
      if (!customStart || !customEnd) return null;
      start = customStart;
      end = customEnd;
      break;
    case "today":
      start = end = new Date();
      break;
    case "yesterday":
      start = new Date();
      start.setDate(start.getDate() - 1);
      end = new Date(start);
      break;
    case "last-month":
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case "this-month":
    default:
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }

  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0]
  };
}
document.getElementById("filterCustomRangeBtn").addEventListener("click", () => {
  const range = getSalaryDateRange();
  if (!range) {
    Swal.fire("Eksik bilgi", "Tarih aralığı seçilmedi", "warning");
    return;
  }

  fetchSalaries();
});

async function openDetailModal(userId) {
  const { startDate, endDate } = getSalaryDateRange();

  try {
    const res = await axios.get(`http://localhost:5001/api/prims/details?UserId=${userId}&startDate=${startDate}&endDate=${endDate}`, axiosConfig);
    const detaylar = res.data;

    let html = `
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Müşteri</th>
            <th>Satış Tipi</th>
            <th>Satış Tutarı</th>
            <th>Prim Tutarı</th>
            <th>İşlem</th>
          </tr>
        </thead>
        <tbody>
    `;

    detaylar.forEach(satir => {
      html += `
        <tr>
          <td>${new Date(satir.date).toLocaleDateString("tr-TR")}</td>
          <td>${satir.customerName}</td>
          <td>${satir.type}</td>
          <td>
          ${Number(satir.saleAmount || 0).toFixed(2)} TL
          ${satir.type === "ürün" && satir.quantity ? ` (${satir.quantity} adet)` : ""}
          </td>
          <td>${Number(satir.primAmount || 0).toFixed(2)} TL</td>
          <td>
            <button class="btn btn-sm btn-light border" onclick="deletePrim(${satir.id})">
              <i class="bi bi-trash text-danger"></i>
            </button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;

    Swal.fire({
      title: "Prim Detayları",
      width: "800px",
      html: html,
      confirmButtonText: "Kapat"
    });
  } catch (err) {
    console.error("Prim detayları alınamadı:", err);
    Swal.fire("Hata", "Detaylar yüklenemedi", "error");
  }
}
document.getElementById("exportSalaryBtn").addEventListener("click", () => {
  const rows = document.querySelectorAll("#salary-table-body tr");
  if (rows.length === 0) {
    Swal.fire("Uyarı", "Dışa aktarılacak veri bulunamadı.", "warning");
    return;
  }

  let csv = "Personel;Maaş;Ürün Primi;Paket Primi;Hizmet Primi;Toplam\n";

  rows.forEach(row => {
    const cols = row.querySelectorAll("td");
    const data = [
      cols[0].innerText.trim(), // personel
      cols[1].innerText.trim(), // maaş
      cols[2].innerText.trim(), // ürün primi
      cols[3].innerText.trim(), // paket primi
      cols[4].innerText.trim(), // hizmet primi
      cols[5].innerText.trim()  // toplam
    ];
    csv += data.join(";") + "\n";
  });

  const bom = "\uFEFF"; // UTF-8 BOM
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "personel_maas_giderleri.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
async function deletePrim(id) {
    const token = localStorage.getItem("companyToken");
  const config = { headers: { Authorization: "Bearer " + token } };
  const result = await Swal.fire({
    title: "Emin misiniz?",
    text: "Bu prim kaydı silinecek!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Evet, sil",
    cancelButtonText: "Vazgeç"
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`http://localhost:5001/api/prims/${id}`, axiosConfig);

      Swal.fire({
        icon: "success",
        title: "Silindi",
        text: "Prim kaydı başarıyla silindi.",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end"
      });

      // Tabloyu yeniden yükle (detayları yeniden çağırman gerekebilir)
      if (typeof selectedUserId !== "undefined") {
        await loadPrimDetails(selectedUserId); // örnek fonksiyon
      }
    } catch (err) {
      Swal.fire("Hata", "Silme işlemi başarısız oldu.", "error");
    }
  }
}
