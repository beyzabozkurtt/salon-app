document.addEventListener("DOMContentLoaded", () => {
  flatpickr(".flatpickr", {
    dateFormat: "d.m.Y",
    locale: "tr"
  });

  loadModal("../modals/add-expense.html", "addExpenseModal");
  fetchExpenses();
});

// 🔄 Modal yükle
async function loadModal(url, name) {
  const res = await fetch(url);
  const html = await res.text();
  document.getElementById("modal-container").innerHTML = html;
  window[name].init();
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
    fillCategorySummary(summary);
  } catch (err) {
    console.error("Masraflar alınamadı:", err);
  }
}

// 📊 Kategori tablosu doldur
function fillCategorySummary(summary) {
  const tbody = document.getElementById("category-summary-body");
  tbody.innerHTML = "";
  for (const kategori in summary) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${kategori}</td>
      <td>${summary[kategori].adet}</td>
      <td>${summary[kategori].toplam.toFixed(2)} TL</td>
    `;
    tbody.appendChild(tr);
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
