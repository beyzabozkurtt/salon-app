// ✅ BU KALIR
const tableBody = document.getElementById("alacaklarTable");
const toplamTutarSpan = document.getElementById("toplamTutar");
const searchInput = document.getElementById("searchInput");
const token = localStorage.getItem("companyToken");
let allData = [];

async function loadAlacaklar() {
  const res = await fetch("http://localhost:5001/api/payments/cash-tracking", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    }
  });

  const result = await res.json();
  const innerData = result.data || result;
  allData = Array.isArray(innerData) ? innerData.filter(p => p.status === "gecikmiş" || p.status === "bekliyor") : [];

  renderAlacaklar();
}

function renderAlacaklar() {
  tableBody.innerHTML = "";
  let toplam = 0;
  const keyword = searchInput.value.trim().toLowerCase();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  allData.forEach(p => {
    const musteri = p.Sale?.Customer?.name || p.SaleSingleService?.Customer?.name || p.FallbackCustomer?.name || "-";
    const tel = p.Sale?.Customer?.phone || p.SaleSingleService?.Customer?.phone || p.FallbackCustomer?.phone || "-";
    const hizmet = p.Product?.name || p.Sale?.Service?.name || p.SaleSingleService?.SingleService?.name || "-";
    const tip = p.Sale ? "Paket satışı" : p.Product ? "Ürün" : p.SaleSingleService ? "Hizmet" : "Bilinmiyor";
    const tutar = parseFloat(p.amount || 0).toFixed(2) + " TL";

    const due = new Date(p.dueDate);
    due.setHours(0, 0, 0, 0);
    const farkGun = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    let gunBilgisi = "";
    let badgeClass = "text-muted";
    if (farkGun > 0) gunBilgisi = `${farkGun} gün sonra`;
    else if (farkGun === 0) gunBilgisi = `Bugün`;
    else {
      gunBilgisi = `${Math.abs(farkGun)} gün gecikti`;
      badgeClass = "text-danger fw-bold";
    }

    const planlanan = `${due.toLocaleDateString("tr-TR")} <span class="${badgeClass}">(${gunBilgisi})</span>`;
    const olusturulma = p.createdAt
      ? new Date(p.createdAt).toLocaleString("tr-TR")
      : p.dueDate
      ? new Date(p.dueDate).toLocaleString("tr-TR")
      : "-";

    const match = [musteri, tel, hizmet, tip, tutar].some(val => val.toLowerCase().includes(keyword));
    if (!match) return;

    toplam += parseFloat(p.amount || 0);

    tableBody.innerHTML += `
      <tr>
        <td>${musteri}</td>
        <td>${tel}</td>
        <td>${hizmet}</td>
        <td>${tip}</td>
        <td>${tutar}</td>
        <td>${planlanan}</td>
        <td>${olusturulma}</td>
        <td>
          <button class="btn btn-sm btn-outline-success me-1" onclick="modalAc('${p.id}')">+ Öde</button>
          <button class="btn btn-sm btn-outline-info me-1"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
        </td>
      </tr>
    `;
  });

  toplamTutarSpan.textContent = toplam.toFixed(2) + " TL";
}

function modalAc(paymentId) {
  if (window.paymentModal?.open) {
    window.paymentModal.open(paymentId);
  } else {
    alert("Ödeme modülü yüklenemedi.");
  }
}

searchInput.addEventListener("input", renderAlacaklar);
window.addEventListener("DOMContentLoaded", loadAlacaklar);
