document.addEventListener("DOMContentLoaded", () => {
  flatpickr(".flatpickr", {
    dateFormat: "d.m.Y",
    locale: "tr"
  });

  // editExpenseForm submit dinleyicisini bağla
  const editForm = document.getElementById("editExpenseForm");
  if (editForm) {
    editForm.addEventListener("submit", handleEditExpense);
  }

  loadModal("../modals/add-expense.html", "addExpenseModal");
  generateSalariesIfDue();
  calculateMonthlySalariesIfDue();
  fetchExpenses();
  fetchSalaries();
});

// 🔄 Modal yükle
async function loadModal(url, name) {
  const res = await fetch(url);
  const html = await res.text();
  document.getElementById("modal-container").innerHTML = html;

  // Modal yüklendikten sonra init varsa çalıştır
  if (window[name]?.init) {
    window[name].init();
  }

  // Eğer editExpenseModal yüklendiyse form olayını burada bağla
  if (name === "editExpenseModal") {
    document.getElementById("editExpenseForm").addEventListener("submit", handleEditExpense);
  }
}


// 📥 Masraf verilerini getir
async function fetchExpenses() {
  try {
    const token = localStorage.getItem("companyToken");
    const res = await axios.get("http://localhost:5001/api/expenses", {
    headers: {
        Authorization: `Bearer ${token}`,
    },
    });


    const data = res.data;
    const tbody = document.getElementById("expense-table-body");
    const summary = {};

    tbody.innerHTML = "";
    let total = 0;

    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
<tr>
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
</tr>
      `;
      tbody.appendChild(row);

      // Kategoriye göre özet için
      summary[item.category] = summary[item.category] || { adet: 0, toplam: 0 };
      summary[item.category].adet++;
      summary[item.category].toplam += parseFloat(item.amount);

      total += parseFloat(item.amount);
    });

    document.getElementById("total-amount").textContent = `Toplam tutar: ${total.toFixed(2)} TL`;
    //fillCategorySummary(summary);
  } catch (err) {
    console.error("Masraflar alınamadı:", err);
  }
}

// 📅 Ay sonu maaşları oluştur
async function generateMonthlySalaries() {
  const startDate = "2025-07-01"; // 🛠️ Test için sabit tuttuk
  const endDate = "2025-08-01";

  try {
    const res = await axios.post(
      `http://localhost:5001/api/salaries/generate-monthly?startDate=${startDate}&endDate=${endDate}`,
      {},
      axiosConfig
    );
    Swal.fire("Başarılı", res.data.message, "success");
    fetchSalaries();
  } catch (err) {
    console.error("Maaş oluşturma hatası:", err);
    Swal.fire("Hata", "Maaşlar oluşturulamadı", "error");
  }
}


async function calculateMonthlySalariesIfDue() {
  try {
    const now = new Date();
    const gun = now.getDate();
    const ay = now.getMonth() + 1;
    const yil = now.getFullYear();

    // Örneğin her ayın 1'i ise çalıştır
    if (gun === 1) {
      const start = `${yil}-${String(ay).padStart(2, '0')}-01`;
      const endDate = new Date(yil, ay, 1); // bir sonraki ayın 1’i
      const end = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-01`;

      await axios.post(
        `http://localhost:5001/api/salaries/generate-monthly?start=${start}&end=${end}`,
        {},
        axiosConfig
      );

      console.log("✅ Otomatik prim hesaplaması yapıldı.");
    }
  } catch (err) {
    console.error("❌ Prim hesaplama hatası:", err);
  }
}


async function generateSalariesIfDue() {
  try {
    await axios.post("http://localhost:5001/api/salaries/generate", {}, axiosConfig);
  } catch (err) {
    console.error("Maaş oluşturma hatası:", err);
  }
}


// 🧾 Personel maaş giderlerini getir
async function fetchSalaries() {
  try {
    const res = await axios.get("http://localhost:5001/api/salaries", axiosConfig);
    const data = res.data;
    const tbody = document.getElementById("salary-table-body");
    tbody.innerHTML = "";

    data.forEach(item => {
      const toplam = (item.salary || 0) + (item.hizmetPrim || 0) + (item.urunPrim || 0) + (item.paketPrim || 0);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.User?.name || "-"}</td>
        <td>${item.salary?.toFixed(2) || "0.00"} TL</td>
        <td>${item.urunPrim?.toFixed(2) || "0.00"} TL</td>
        <td>${item.paketPrim?.toFixed(2) || "0.00"} TL</td>
        <td>${item.hizmetPrim?.toFixed(2) || "0.00"} TL</td>
        <td class="fw-bold">${toplam.toFixed(2)} TL</td>
        <td>
          <button class="btn btn-sm btn-light border" onclick="yenidenHesapla(${item.id})">
            <i class="bi bi-arrow-repeat text-primary"></i>
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
}



// 📅 Yardımcı formatlayıcılar
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

// 🧠 '13.12.2025' → '2025-12-13' dönüştür
function convertToISO(dateStr) {
  const parts = dateStr.split(".");
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  const isoDate = `${year}-${month}-${day}`;
  const testDate = new Date(isoDate);

  if (isNaN(testDate)) {
    console.warn("❌ Geçersiz tarih:", dateStr);
    return null;
  }

  return isoDate;
}


async function populateEditUsers() {
  const token = localStorage.getItem("companyToken");
  const select = document.getElementById("edit-expense-user");
  if (!select) return;

  try {
    const res = await axios.get("http://localhost:5001/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    });

    select.innerHTML = `<option disabled selected>Harcayan seçin</option>`;
    res.data.forEach(user => {
      const opt = document.createElement("option");
      opt.value = user.id;
      opt.textContent = user.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Kullanıcılar alınamadı", err);
  }
}
async function populateEditCategories() {
  const token = localStorage.getItem("companyToken");
  const select = document.getElementById("edit-expense-category");
  if (!select) return;

  try {
    const res = await axios.get("http://localhost:5001/api/expense-categories", {
      headers: { Authorization: `Bearer ${token}` }
    });

    select.innerHTML = `<option disabled selected>Kategori seçin</option>`;
    res.data.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.name;
      opt.textContent = cat.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Kategoriler alınamadı", err);
  }
}


window.editExpense = async function (item) {
  const modalEl = document.getElementById("editExpenseModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  await populateEditUsers();
  await populateEditCategories();

  // inputları doldur
  document.getElementById("edit-expense-id").value = item.id;
  document.getElementById("edit-expense-category").value = item.category;
  document.getElementById("edit-expense-description").value = item.description || "";
  document.getElementById("edit-expense-amount").value = item.amount;
  document.getElementById("edit-expense-user").value = item.UserId;
  document.getElementById("edit-expense-method").value = item.paymentMethod || "";

  flatpickr("#edit-expense-date", {
    dateFormat: "d.m.Y",
    locale: "tr",
    defaultDate: new Date(item.expenseDate),
    allowInput: true
  });

  // 🔥 Modal DOM'a tam yüklendikten sonra formu bağla
  modalEl.addEventListener("shown.bs.modal", () => {
    const form = document.getElementById("editExpenseForm");
    if (form) {
      form.addEventListener("submit", handleEditExpense);
      console.log("🟢 Form başarıyla bağlandı.");
    } else {
      console.warn("🚫 Form bulunamadı.");
    }
  }, { once: true }); // sadece bir kere bağla
};




async function handleEditExpense(e) {
  e.preventDefault();

  const token = localStorage.getItem("companyToken");
  const id = document.getElementById("edit-expense-id").value;

  const rawDate = document.getElementById("edit-expense-date").value;
  const isoDate = convertToISO(rawDate);

  if (!isoDate) {
    alert("Geçersiz tarih girdiniz.");
    return;
  }

  const updatedExpense = {
    expenseDate: isoDate,
    category: document.getElementById("edit-expense-category").value,
    description: document.getElementById("edit-expense-description").value,
    amount: parseFloat(document.getElementById("edit-expense-amount").value),
    paymentMethod: document.getElementById("edit-expense-method").value,
    UserId: document.getElementById("edit-expense-user").value,
    notes: document.getElementById("edit-expense-notes")?.value || null
  };

  try {
    await axios.put(`http://localhost:5001/api/expenses/${id}`, updatedExpense, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const modal = bootstrap.Modal.getInstance(document.getElementById("editExpenseModal"));
    modal.hide();
    await fetchExpenses();
          // ✅ Başarılı güncelleme bildirimi
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Masraf başarıyla güncellendi!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#d1e7dd",
        color: "#0f5132",
        didOpen: (toast) => {
          toast.style.zIndex = 99999;
        }
      });

  } catch (err) {
    console.error("❌ Masraf güncellenemedi:", err);
    alert("Güncelleme sırasında bir hata oluştu.");
  }
}



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
      const token = localStorage.getItem("companyToken");
      await axios.delete(`http://localhost:5001/api/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchExpenses();

      // ✅ Başarılı silme bildirimi
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Masraf başarıyla silindi!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#d1e7dd",
        color: "#0f5132",
        didOpen: (toast) => {
          toast.style.zIndex = 99999;
        }
      });
    } catch (err) {
      console.error("Silme hatası:", err);
      Swal.fire("Hata!", "Masraf silinemedi.", "error");
    }
  }
};

const token = localStorage.getItem("companyToken");
const axiosConfig = { headers: { Authorization: "Bearer " + token } };

// Maaş günü bilgisi çekilsin
async function fetchMaasGunu() {
  try {
    const res = await axios.get("http://localhost:5001/api/companies/maas-gunu", axiosConfig);
    document.getElementById("maasGunuText").textContent = res.data.maasGunu;
  } catch (err) {
    console.error("Maaş günü alınamadı:", err);
  }
}

// Maaş günü güncelle
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

// Sayfa yüklendiğinde çağır
window.addEventListener("DOMContentLoaded", fetchMaasGunu);
