window.addExpenseModal = {
  init: async function () {
    const token = localStorage.getItem("companyToken");

    // 📅 Tarih seçici (flatpickr)
    flatpickr("#expense-date", {
      dateFormat: "d.m.Y",
      locale: "tr"
    });

    // 📦 Masraf kategorilerini getir
    try {
      const res = await axios.get("http://localhost:5001/api/expense-categories", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const select = document.getElementById("expense-category");
      res.data.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.name;
        opt.textContent = cat.name;
        select.appendChild(opt);
      });

      if (res.data.length === 0) {
        const opt = document.createElement("option");
        opt.disabled = true;
        opt.selected = true;
        opt.textContent = "Önce kategori ekleyin";
        select.appendChild(opt);
      }
    } catch (err) {
      console.error("❌ Masraf kategorileri yüklenemedi:", err);
    }

    // 🧑 Personelleri getir
    try {
      const res = await axios.get("http://localhost:5001/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userSelect = document.getElementById("expense-user");
      res.data.forEach(user => {
        const opt = document.createElement("option");
        opt.value = user.id;
        opt.textContent = user.name;
        userSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("❌ Personel listesi yüklenemedi:", err);
    }

    // 📩 Form gönderme
    document.getElementById("expenseForm").addEventListener("submit", async function (e) {
      e.preventDefault();

      const tarihStr = document.getElementById("expense-date").value;
      const [gun, ay, yil] = tarihStr.split(".");
      const isoDate = `${yil}-${ay}-${gun}`;

      const amountValue = parseFloat(document.getElementById("expense-amount").value);
      if (isNaN(amountValue)) {
        alert("Lütfen geçerli bir tutar girin.");
        return;
      }

      const payload = {
        category: document.getElementById("expense-category").value,
        description: document.getElementById("expense-description").value,
        amount: amountValue,
        expenseDate: isoDate,
        paymentMethod: document.getElementById("expense-method").value,
        UserId: document.getElementById("expense-user").value || null
      };

      try {
const frequency = document.getElementById("expense-repeat-frequency").value;
const repeatCount = parseInt(document.getElementById("expense-repeat-count").value || 0);

// ilk masrafı ve tekrarlı masrafları tek tek oluştur
const requests = [];

for (let i = 0; i <= repeatCount; i++) {
  let date = new Date(isoDate);
  if (i > 0) {
    if (frequency === "monthly") {
      date.setMonth(date.getMonth() + i);
    } else if (frequency === "weekly") {
      date.setDate(date.getDate() + i * 7);
    } else if (frequency === "yearly") {
      date.setFullYear(date.getFullYear() + i);
    }
  }

  const clone = { ...payload, expenseDate: date.toISOString().split("T")[0] };
  requests.push(
    axios.post("http://localhost:5001/api/expenses", clone, {
      headers: { Authorization: `Bearer ${token}` }
    })
  );
}
  Swal.fire({
  toast: true,
  position: "top-end",
  icon: "success",
  title: "Kategori başarıyla eklendi!",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  background: "#d1e7dd",
  color: "#0f5132",
  didOpen: (toast) => {
    toast.style.zIndex = 99999;
  }
});
await Promise.all(requests);

        

        const modal = bootstrap.Modal.getInstance(document.getElementById("createExpenseModal"));
        modal.hide();
        e.target.reset();

        if (typeof fetchExpenses === "function") {
          fetchExpenses();
        }
      } catch (err) {
        console.error("❌ Masraf eklenemedi:", err);
        alert("❌ Masraf eklenemedi.");
      }
    });

    // 🔄 Yeni kategori modalını aç
document.getElementById("add-category-btn").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("addCategoryModal"));
  modal.show();
});


    // 🔄 Yeni kategori ekleme
document.getElementById("addCategoryForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("new-category-name").value.trim();
  if (!name) return alert("Kategori adı boş olamaz!");

  Swal.fire({
  toast: true,
  position: "top-end",
  icon: "success",
  title: "Kategori başarıyla eklendi!",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  background: "#d1e7dd",
  color: "#0f5132",
  didOpen: (toast) => {
    toast.style.zIndex = 99999;
  }
});

  try {
    const token = localStorage.getItem("companyToken");
    const res = await axios.post("http://localhost:5001/api/expense-categories", { name }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Yeni kategori dropdown'a eklenir
    const select = document.getElementById("expense-category");
    const option = document.createElement("option");
    option.value = res.data.name;
    option.textContent = res.data.name;
    select.appendChild(option);
    select.value = res.data.name;

    // Modal kapat, input sıfırla
    document.getElementById("new-category-name").value = "";
    const modal = bootstrap.Modal.getInstance(document.getElementById("addCategoryModal"));
    modal.hide();
  } catch (err) {
    console.error("Kategori eklenemedi:", err);
    alert("❌ Kategori eklenemedi.");
  }
});

  }
};
