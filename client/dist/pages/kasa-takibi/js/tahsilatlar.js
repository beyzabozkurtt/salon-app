const tableBody = document.getElementById("tahsilatTable");
const toplamTutarSpan = document.getElementById("toplamTutar");
const searchInput = document.getElementById("searchInput");
const token = localStorage.getItem("companyToken");

let allData = [];

async function loadTahsilatlar() {
  const res = await fetch("http://localhost:5001/api/payments/cash-tracking", {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    }
  });
  const result = await res.json();
  const innerData = result.data || result;
  allData = Array.isArray(innerData)
    ? innerData.filter(p => p.status === "ödendi")
    : [];

  // Tarihe göre sırala (en yeni en üstte)
  allData.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

  renderTahsilatlar();
}

function renderTahsilatlar() {
  tableBody.innerHTML = "";
  let toplam = 0;
  const keyword = searchInput.value.trim().toLowerCase();

  allData.forEach(p => {
    const musteri = (
      p.Sale?.Customer?.name ||
      p.SaleSingleService?.Customer?.name ||
      p.FallbackCustomer?.name ||
      "-"
    ).toLowerCase();

    const tel = (
      p.Sale?.Customer?.phone ||
      p.SaleSingleService?.Customer?.phone ||
      p.FallbackCustomer?.phone ||
      "-"
    ).toLowerCase();

    const odeme = (p.paymentType || "-").toLowerCase();

    const kaynak = p.Sale
      ? "Paket satışı"
      : p.Product
      ? "Ürün satışı"
      : p.SaleSingleService
      ? "Hizmet satışı"
      : "Bilinmiyor";

    const urun = (
      p.Product?.name ||
      p.Sale?.Service?.name ||
      p.SaleSingleService?.SingleService?.name ||
      "-"
    ).toLowerCase();

    const user = (p.User?.name || "-").toLowerCase();

    const match = [musteri, tel, odeme, kaynak, urun, user].some(val =>
      val.includes(keyword)
    );
    if (!match) return;

const tarih = p.paymentDate
  ? `${new Date(p.paymentDate).toLocaleDateString("tr-TR")} - ${new Date(p.paymentDate).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit"
    })}`
  : "-";



    const tutar = parseFloat(p.amount || 0).toFixed(2) + " TL";
    toplam += parseFloat(p.amount || 0);

    tableBody.innerHTML += `
      <tr>
        <td>${musteri}</td>
        <td>${tarih}</td>
        <td>${p.paymentType || "-"}</td>
        <td>${tutar}</td>
        <td>${kaynak}</td>
        <td>${p.Product?.name || p.Sale?.Service?.name || p.SaleSingleService?.SingleService?.name || "-"}</td>
        <td>${p.User?.name || "-"}</td>
      </tr>
    `;
  });

  toplamTutarSpan.textContent = toplam.toFixed(2) + " TL";
}

searchInput.addEventListener("input", renderTahsilatlar);

function exportToExcel() {
  const table = document.querySelector("table");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Tahsilatlar" });
  XLSX.writeFile(wb, "tahsilatlar.xlsx");
}

window.addEventListener("DOMContentLoaded", loadTahsilatlar);
