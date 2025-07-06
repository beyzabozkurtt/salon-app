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
        await axios.post("http://localhost:5001/api/expenses", payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        alert("✅ Masraf başarıyla kaydedildi.");

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

    // 🔄 Yeni kategori ekleme
document.getElementById("addCategoryForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("new-category-name").value.trim();
  if (!name) return alert("Kategori adı boş olamaz!");

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
