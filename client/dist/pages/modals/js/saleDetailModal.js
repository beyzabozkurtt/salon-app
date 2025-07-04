export async function viewSaleDetail(saleId, token) {
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
