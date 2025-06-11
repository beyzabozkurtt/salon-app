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

      allData.forEach(p => {
        const musteri = p.Sale?.Customer?.name || p.FallbackCustomer?.name || "-";
        const tel = p.Sale?.Customer?.phone || p.FallbackCustomer?.phone || "-";
        const hizmet = p.Product?.name || p.Sale?.Service?.name || "-";
        const tip = p.Sale ? "Paket satışı" : p.Product ? "Ürün" : p.SingleService ? "Hizmet" : "Bilinmiyor";
        const tutar = parseFloat(p.amount || 0).toFixed(2) + " TL";

const due = new Date(p.dueDate);

due.setHours(0, 0, 0, 0);
now.setHours(0, 0, 0, 0);

const farkGun = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
let gunBilgisi = "";
let badgeClass = "text-muted";

if (farkGun > 0) {
  gunBilgisi = `${farkGun} gün sonra`;
} else if (farkGun === 0) {
  gunBilgisi = `Bugün`;
} else {
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
             <button class="btn btn-sm btn-outline-success me-1" onclick="modalAc('${p.id}', ${p.amount})">+ Öde</button>

              <button class="btn btn-sm btn-outline-info me-1"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
            </td>
          </tr>
        `;
      });

      toplamTutarSpan.textContent = toplam.toFixed(2) + " TL";
    }

    searchInput.addEventListener("input", renderAlacaklar);

    let aktifPaymentId = null;

async function modalAc(paymentId, tutar) {
  aktifPaymentId = paymentId;

  // Ödeme türlerini doldur
  const yontemSelect = document.getElementById("odemeYontemi");
  yontemSelect.innerHTML = "";

  try {
    const res = await fetch("http://localhost:5001/api/payments/types", {
      headers: { Authorization: "Bearer " + token }
    });
    const types = await res.json();
    types.forEach(type => {
      yontemSelect.innerHTML += `<option value="${type}">${type}</option>`;
    });
  } catch {
    yontemSelect.innerHTML = `<option value="nakit">nakit</option><option value="kart">kart</option>`;
  }

  // Personelleri doldur
  const personelSelect = document.getElementById("odemePersonel");
  personelSelect.innerHTML = "";

  try {
    const res = await fetch("http://localhost:5001/api/users", {
      headers: { Authorization: "Bearer " + token }
    });
    const users = await res.json();
    users.forEach(u => {
      personelSelect.innerHTML += `<option value="${u.id}">${u.name}</option>`;
    });
  } catch {
    personelSelect.innerHTML = `<option value="">Personel bulunamadı</option>`;
  }

  document.getElementById("odemeTutari").value = tutar;
  new bootstrap.Modal(document.getElementById("odemeModal")).show();
}

async function odemeYap() {
  const tutar = document.getElementById("odemeTutari").value;
  const yontem = document.getElementById("odemeYontemi").value;
  const userId = document.getElementById("odemePersonel").value;

  const now = new Date().toISOString();

  const body = {
    paymentDate: now,
    amount: parseFloat(tutar),
    paymentType: yontem,
    UserId: userId,
    status: "ödendi"
  };

  await fetch(`http://localhost:5001/api/payments/${aktifPaymentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(body)
  });

  location.reload();
}



    function exportToExcel() {
      const table = document.querySelector("table");
      const wb = XLSX.utils.table_to_book(table, { sheet: "Alacaklar" });
      XLSX.writeFile(wb, "alacaklar.xlsx");
    }

    window.addEventListener("DOMContentLoaded", loadAlacaklar);