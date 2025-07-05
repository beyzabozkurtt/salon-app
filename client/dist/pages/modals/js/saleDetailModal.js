export async function viewSaleDetail(saleId, token) {
    window.currentSaleId = saleId;

  const axiosConfig = {
    headers: { Authorization: "Bearer " + token }
  };

  const modalElement = document.getElementById("saleDetailModal");
  const modal = new bootstrap.Modal(modalElement);

  try {
    // 1. Satış detayını çek
    const saleRes = await axios.get(`http://localhost:5001/api/sales/${saleId}`, axiosConfig);
    const sale = saleRes.data;

    // 2. Ödeme taksitlerini çek
    const paymentRes = await axios.get(`http://localhost:5001/api/sales/${saleId}/payments-status`, axiosConfig);
    const { taksitler, totalPrice, customerName, serviceName } = paymentRes.data;

    // 3. Modal alanlarını doldur
    document.getElementById("detailCustomerName").textContent = customerName || "-";
    document.getElementById("detailServiceName").textContent = serviceName || "-";
    document.getElementById("detailTotalPrice").textContent = `${parseFloat(totalPrice).toFixed(2)}₺`;

// 0. taksiti bul
const onOdeme = taksitler.find(t => t.installmentNo === 0);

// Ön ödeme bilgilerini modal içine yaz
document.getElementById("detailPrePayment").textContent =
  onOdeme ? `${parseFloat(onOdeme.amount).toFixed(2)}₺` : "0₺";

document.getElementById("detailPrePaymentType").textContent =
  onOdeme?.paymentType || "-";

// Ödenmemiş (bekliyor veya gecikmiş) taksitlerin toplamını hesapla
const kalan = taksitler
  .filter(t => t.status !== "ödendi")
  .reduce((toplam, t) => toplam + parseFloat(t.amount), 0);

document.getElementById("detailRemainingAmount").textContent = `${kalan.toFixed(2)}₺`;




    document.getElementById("detailInstallmentCount").textContent = sale.installment || "-";

    // 4. Taksitler tablosunu doldur
    const tbody = document.getElementById("detailInstallmentsTableBody");
    tbody.innerHTML = "";

        taksitler.forEach(t => {
        const tr = document.createElement("tr");
        const no = t.installmentNo === 0 ? "Ön Ödeme" : t.installmentNo;
        const durumRenk =
            t.status === "ödendi" ? "success" :
            t.status === "bekliyor" ? "warning" : "danger";

        tr.innerHTML = `
            <td>${no}</td>
            <td>${parseFloat(t.amount).toFixed(2)}₺</td>
            <td>${new Date(t.dueDate).toLocaleDateString("tr-TR")}</td>
            <td><span class="badge bg-${durumRenk}">${t.status}</span></td>
        `;
        tbody.appendChild(tr);
        });


    // 5. Modalı aç
    modal.show();
  } catch (err) {
    console.error("Satış detayları alınamadı:", err);
    alert("Detaylar getirilemedi.");
  }
}

export function handleDeleteSale(token) {
  if (!window.currentSaleId) return;

  const confirmBtn = document.getElementById("confirmDeleteSale");

  confirmBtn.onclick = async () => {
    try {
      await axios.delete(`http://localhost:5001/api/sales/${window.currentSaleId}`, {
        headers: { Authorization: "Bearer " + token }
      });
      alert("Satış ve tüm ödemeleri silindi.");
      window.location.reload();
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme sırasında hata oluştu.");
    }
  };

  const warningModal = new bootstrap.Modal(document.getElementById("deleteWarningModal"));
  warningModal.show();
}


let currentSaleIdForDelete = null;

document.getElementById("deleteSaleBtn").addEventListener("click", () => {
  currentSaleIdForDelete = window.currentSaleId;
  const confirmModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
  confirmModal.show();
});

document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
  if (!currentSaleIdForDelete) return;

  try {
    await axios.delete(`http://localhost:5001/api/sales/${currentSaleIdForDelete}`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("companyToken") }
    });

    // modalları kapat
    bootstrap.Modal.getInstance(document.getElementById("confirmDeleteModal"))?.hide();
    bootstrap.Modal.getInstance(document.getElementById("saleDetailModal"))?.hide();

    // tabloyu güncelle (listeyi yeniden çek)
    if (typeof loadSales === "function") loadSales(); // dışarıdan global fonksiyon varsa tetikle

    alert("Satış ve ilişkili ödemeler başarıyla silindi.");
  } catch (err) {
    console.error("Silme işlemi başarısız:", err);
    alert("Silme işlemi başarısız oldu.");
  }
});

