window.addExpenseModal = {
  init: async function () {
    // 📅 Tarih seçici (flatpickr)
    flatpickr("#expense-date", {
      dateFormat: "d.m.Y",
      locale: "tr"
    });

    // 🧑 Personelleri getir ve dropdown'a doldur
    try {
      const token = localStorage.getItem("companyToken");
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

    // 📩 Form gönderme işlemi
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
        const token = localStorage.getItem("companyToken");
        if (!token) {
          alert("Şirket oturumu bulunamadı!");
          return;
        }

        await axios.post("http://localhost:5001/api/expenses", payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        alert("✅ Masraf başarıyla kaydedildi.");

        // Modal kapat ve formu temizle
        const modalEl = document.getElementById("createExpenseModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        e.target.reset();

        // Listeyi güncelle
        if (typeof fetchExpenses === "function") {
          fetchExpenses();
        }

      } catch (err) {
        console.error("❌ Masraf eklenemedi:", err);
        alert("❌ Masraf eklenemedi.");
      }
    });
  }
};
