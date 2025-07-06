const companyToken = localStorage.getItem("companyToken");
const axiosConfig = {
  headers: {
    Authorization: "Bearer " + companyToken,
  },
};

import { loadPopup } from "../../../utils/popupLoader.js";
let currentAppointmentPage = 1;
const appointmentsPerPage = 10;
let allAppointments = [];


document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.getAttribute('data-section');
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('d-none'));
    const target = document.getElementById('section-' + section);
    if (target) target.classList.remove('d-none');
  });
});

const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get("id");

document.addEventListener("DOMContentLoaded", async () => {
  if (!customerId) return alert("Müşteri ID bulunamadı.");

  try {
    const res = await axios.get(`http://localhost:5001/api/customers/${customerId}`, axiosConfig);
    const customer = res.data;
    await loadCustomerAppointments(customerId);
    await loadCustomerSales(customerId, customer);
    await loadCustomerPackageSales(customerId, customer);
    await loadCustomerPayments(customerId, customer);
    await loadCustomerDebts(customerId, customer);



    const bilgiContainer = document.querySelector("#section-bilgileri");
    if (!bilgiContainer) return;

   bilgiContainer.innerHTML = `
  <div class="card shadow-sm">
    <div class="card-header bg-light">
      <div class="d-flex align-items-center gap-3">
        <div class="rounded-circle bg-white border d-flex justify-content-center align-items-center" style="width: 48px; height: 48px;">
          <i class="bi bi-person fs-4 text-secondary"></i>
        </div>
        <h5 class="mb-0 fw-semibold">${customer.name}</h5>
      </div>
    </div>

    <div class="card-body p-3">
      <div class="row mb-3">
        <div class="col-4 fw-semibold fs-6">Email:</div>
        <div class="col-8 fs-6">${customer.email || "-"}</div>
      </div>
      <div class="row mb-3">
        <div class="col-4 fw-semibold fs-6">Telefon:</div>
        <div class="col-8 fs-6">${customer.phone || "-"}</div>
      </div>

      <div class="row mb-3">
        <div class="col-4 fw-semibold fs-6">Doğum Tarihi:</div>
        <div class="col-8 fs-6">${customer.birthDate || "-"}</div>
      </div>
      <div class="row mb-3">
        <div class="col-4 fw-semibold fs-6">Cinsiyet:</div>
        <div class="col-8 fs-6">${customer.gender || "-"}</div>
      </div>
      <div class="row mb-3">
        <div class="col-4 fw-semibold fs-6">Referans:</div>
        <div class="col-8 fs-6">${customer.reference || "-"}</div>
      </div>
      <div class="row mb-4">
        <div class="col-4 fw-semibold fs-6">Kayıt Tarihi:</div>
        <div class="col-8 fs-6">${new Date(customer.createdAt).toLocaleDateString("tr-TR")}</div>
      </div>

      <div class="d-flex justify-content-center gap-3 mt-4 border-top pt-4">
        <button id="updateBtn" class="btn btn-outline-primary px-4 py-2">
          <i class="bi bi-pencil me-1"></i> Güncelle
        </button>
        <button id="blockBtn" class="btn btn-outline-warning px-4 py-2">
          <i class="bi bi-slash-circle me-1"></i> Engelle
        </button>
        <button id="deleteBtn" class="btn btn-outline-danger px-4 py-2">
          <i class="bi bi-trash me-1"></i> Sil
        </button>
      </div>
    </div>
  </div>
`;

    // Buton eventleri
    document.getElementById("updateBtn").addEventListener("click", async () => {
  try {
    // Popup'ı yükle (zaten yüklendiyse tekrar eklemez)
    await loadPopup("update-customer");

    // Form ve modal'ı al
    const updateForm = document.getElementById("updateForm");
    const updateModalEl = document.getElementById("updateModal");
    const updateModal = new bootstrap.Modal(updateModalEl);

    if (!updateForm || !updateModalEl) {
      return alert("Güncelleme formu yüklenemedi.");
    }

    // Form alanlarını doldur
    updateForm.querySelector('input[name="id"]').value = customer.id;
    updateForm.querySelector('input[name="name"]').value = customer.name || "";
    updateForm.querySelector('input[name="email"]').value = customer.email || "";
    updateForm.querySelector('input[name="phone"]').value = customer.phone || "";
    updateForm.querySelector('input[name="birthDate"]').value = customer.birthDate || "";
    updateForm.querySelector('select[name="gender"]').value = customer.gender || "";
    updateForm.querySelector('select[name="reference"]').value = customer.reference || "";
    updateForm.querySelector('textarea[name="notes"]').value = customer.notes || "";

    // Popup'ı aç
    updateModal.show();
    
    if (!updateForm.dataset.listenerAdded) {
    updateForm.addEventListener("submit", window.updateCustomer);
    updateForm.dataset.listenerAdded = "true";
    
  }

  } catch (err) {
    console.error("Popup yüklenirken hata:", err);
    alert("Güncelleme popup'ı açılamadı.");
  }
});

    document.getElementById("blockBtn").addEventListener("click", () => {
      if (confirm("Bu müşteriyi engellemek istiyor musunuz?")) {
        alert("Müşteri engellendi.");
      }
    });

    document.getElementById("deleteBtn").addEventListener("click", async () => {
      if (confirm("Bu müşteriyi silmek istiyor musunuz?")) {
        try {
          await axios.delete(`http://localhost:5001/api/customers/${customerId}`, axiosConfig);
          alert("Müşteri silindi.");
          window.location.href = "customers.html";
        } catch (err) {
          alert("Silme işlemi başarısız.");
          console.error(err);
        }
      }
    });

        // ✅ Ödeme sonrası yenileme fonksiyonunu buraya koy:
    window.refreshPayments = function () {
      loadCustomerDebts(customerId, customer);
      loadCustomerPayments(customerId, customer);
    };

  } catch (err) {
    alert("Müşteri bilgileri getirilemedi.");
    console.error(err);
  }
});

//müşteri randevularını yükle
async function loadCustomerAppointments(customerId) {
  try {
    const res = await axios.get(`http://localhost:5001/api/appointments/by-customer/${customerId}/package-usage`, axiosConfig);
    allAppointments = res.data; // GLOBAL'E ATANIYOR

    const randevuContainer = document.querySelector("#section-randevular");
    if (!randevuContainer) return;

    const customerRes = await axios.get(`http://localhost:5001/api/customers/${customerId}`, axiosConfig);
    const customer = customerRes.data;

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
  <div class="d-flex align-items-center gap-3">
    <div class="rounded-circle bg-white border d-flex justify-content-center align-items-center" style="width: 42px; height: 42px;">
      <span class="fw-bold text-uppercase">${customer.name?.charAt(0) || "?"}</span>
    </div>
    <h5 class="mb-0">${customer.name}</h5>
  </div>
  <div class="d-flex align-items-center gap-2">
        <div class="input-group" style="max-width: 250px;">
          <span class="input-group-text"><i class="bi bi-search text-muted"></i></span>
          <input type="text" id="searchAppointments" class="form-control" placeholder="Satış ara..." />
        </div>
    <button class="btn btn-outline-secondary btn-sm" id="refreshAppointments" title="Yenile">
      <i class="bi bi-arrow-clockwise"></i>
    </button>
    <button class="btn btn-outline-secondary btn-sm" id="filterAppointments" title="Filtrele">
      <i class="bi bi-funnel"></i>
    </button>
  </div>
</div>


      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle shadow-sm" id="appointmentTable">
          <thead class="table-light text-center">
            <tr>
              <th>Tarih</th>
              <th>Hizmet</th>
              <th>Personel</th>
              <th>Seans</th>
              <th>Not</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      <div id="appointmentPagination" class="mt-3"></div>
      <div id="appointmentInfo" class="text-muted text-center small mt-1"></div>

    `;

    randevuContainer.innerHTML = html;

    renderAppointmentList(allAppointments);
    renderAppointmentPagination(allAppointments.length);

    document.getElementById("searchAppointments").addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const filtered = allAppointments.filter(app => {
        const hizmet = app.Service?.name || app.SingleService?.name || "-";
        const personel = app.User?.name || "-";
        const not = app.notes?.trim() || "-";
        return (
          hizmet.toLowerCase().includes(query) ||
          personel.toLowerCase().includes(query) ||
          not.toLowerCase().includes(query)
        );
      });
      renderAppointmentList(filtered);
      renderAppointmentPagination(filtered.length);
    });

    document.getElementById("refreshAppointments").addEventListener("click", () => {
      loadCustomerAppointments(customerId);
    });

    document.getElementById("filterAppointments").addEventListener("click", () => {
      alert("Filtreleme özelliği henüz aktif değil 🙈");
    });

  } catch (err) {
    console.error("Randevular yüklenirken hata:", err);
    document.querySelector("#section-randevular").innerHTML = "<div class='alert alert-danger'>Randevular yüklenemedi.</div>";
  }
}

function renderAppointmentList(appointments) {
  const tbody = document.querySelector("#appointmentTable tbody");
  tbody.innerHTML = "";

  const startIndex = (currentAppointmentPage - 1) * appointmentsPerPage;
  const paginated = appointments.slice(startIndex, startIndex + appointmentsPerPage);

  paginated.forEach(app => {
    const start = new Date(app.date);
    const end = new Date(app.endDate);
    const tarih = `${start.toLocaleDateString("tr-TR")} ${start.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}-${end.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}`;
    const hizmet = app.Service?.name || app.SingleService?.name || "-";
    const personel = app.User?.name || "-";
    const not = app.notes?.trim() || "-";
    const durumRenk =
      app.status === "tamamlandı" ? "text-success" :
      app.status === "iptal" ? "text-danger" : "text-warning";

    tbody.innerHTML += `
      <tr>
        <td class="text-nowrap">${tarih}</td>
        <td>${hizmet}</td>
        <td>${personel}</td>
        <td class="text-center">${app.sessionNumber || "-"}</td>
        <td>${not}</td>
        <td class="${durumRenk} fw-semibold text-center">${app.status}</td>
      </tr>`;
  });
}

function renderAppointmentPagination(totalItems) {
  const container = document.getElementById("appointmentPagination");
  const infoContainer = document.getElementById("appointmentInfo");
  if (!container || !infoContainer) return;

  const totalPages = Math.ceil(totalItems / appointmentsPerPage);
  let html = `<nav><ul class="pagination pagination-sm justify-content-center mb-0">`;

  html += `
    <li class="page-item ${currentAppointmentPage === 1 ? "disabled" : ""}">
      <button class="page-link" onclick="changeAppointmentPage(${currentAppointmentPage - 1})">&laquo;</button>
    </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentAppointmentPage ? "active" : ""}">
        <button class="page-link" onclick="changeAppointmentPage(${i})">${i}</button>
      </li>`;
  }

  html += `
    <li class="page-item ${currentAppointmentPage === totalPages ? "disabled" : ""}">
      <button class="page-link" onclick="changeAppointmentPage(${currentAppointmentPage + 1})">&raquo;</button>
    </li>
  </ul></nav>`;

  container.innerHTML = html;

  // Bilgilendirme metni
  const start = (currentAppointmentPage - 1) * appointmentsPerPage + 1;
  const end = Math.min(currentAppointmentPage * appointmentsPerPage, totalItems);
  infoContainer.innerText = `Gösterilen: ${start} - ${end} / ${totalItems} kayıt (${totalPages} sayfa)`;
}


window.changeAppointmentPage = function (page) {
  currentAppointmentPage = page;
  renderAppointmentList(allAppointments);
  renderAppointmentPagination(allAppointments.length);
};

let allSales = [];
let currentSalePage = 1;
const salesPerPage = 10;

async function loadCustomerSales(customerId, customer) {
  try {
    const res = await axios.get(`http://localhost:5001/api/sale-products`, axiosConfig);
    allSales = res.data.filter(item => item.CustomerId == customerId);

    const satisContainer = document.querySelector("#section-satislar");
    if (!satisContainer) return;

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle bg-white border d-flex justify-content-center align-items-center" style="width: 42px; height: 42px;">
            <span class="fw-bold text-uppercase">${customer.name?.charAt(0) || "?"}</span>
          </div>
          <h5 class="mb-0">${customer.name}</h5>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="input-group" style="max-width: 250px;">
            <span class="input-group-text"><i class="bi bi-search text-muted"></i></span>
            <input type="text" id="searchSales" class="form-control" placeholder="Satış ara..." />
          </div>
          <button class="btn btn-outline-secondary btn-sm" id="refreshSales" title="Yenile">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="filterSales" title="Filtrele">
            <i class="bi bi-funnel"></i>
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle shadow-sm" id="saleTable">
          <thead class="table-light text-center">
            <tr>
              <th>Ürün</th>
              <th>Adet</th>
              <th>Toplam Fiyat</th>
              <th>Ödeme</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      <div id="salePagination" class="mt-3"></div>
      <div id="saleInfo" class="text-muted text-center small mt-1"></div>
    `;

    satisContainer.innerHTML = html;

    renderSaleList(allSales);
    renderSalePagination(allSales.length);

    document.getElementById("refreshSales").addEventListener("click", () => {
      loadCustomerSales(customerId, customer); // tekrar müşteri yollanmalı
    });

    document.getElementById("filterSales").addEventListener("click", () => {
      alert("Filtre özelliği henüz hazır değil 🧙‍♂️");
    });

    document.getElementById("searchSales").addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const filtered = allSales.filter(s => {
        return (
          s.Product?.name?.toLowerCase().includes(query) ||
          s.notes?.toLowerCase().includes(query) ||
          s.paymentMethod?.toLowerCase().includes(query)
        );
      });
      renderSaleList(filtered);
      renderSalePagination(filtered.length);
    });

  } catch (err) {
    console.error("Satışlar yüklenirken hata:", err);
    document.querySelector("#section-satislar").innerHTML = "<div class='alert alert-danger'>Satışlar yüklenemedi.</div>";
  }
}


function renderSaleList(sales) {
  const tbody = document.querySelector("#saleTable tbody");
  tbody.innerHTML = "";

  const startIndex = (currentSalePage - 1) * salesPerPage;
  const paginated = sales.slice(startIndex, startIndex + salesPerPage);

  paginated.forEach(sale => {
    const total = (parseFloat(sale.price) * parseInt(sale.quantity)).toFixed(2);
    tbody.innerHTML += `
      <tr>
        <td>${sale.Product?.name || "-"}</td>
        <td class="text-center">${sale.quantity}</td>
        <td class="text-end">${parseFloat(sale.price).toFixed(2)} ₺</td>
        <td class="text-center">${sale.paymentMethod || "-"}</td>
        <td>${sale.notes || "-"}</td>
      </tr>`;
  });
}

function renderSalePagination(totalItems) {
  const container = document.getElementById("salePagination");
  const infoContainer = document.getElementById("saleInfo");
  if (!container || !infoContainer) return;

  const totalPages = Math.ceil(totalItems / salesPerPage);
  let html = `<nav><ul class="pagination pagination-sm justify-content-center mb-0">`;

  html += `
    <li class="page-item ${currentSalePage === 1 ? "disabled" : ""}">
      <button class="page-link" onclick="changeSalePage(${currentSalePage - 1})">&laquo;</button>
    </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentSalePage ? "active" : ""}">
        <button class="page-link" onclick="changeSalePage(${i})">${i}</button>
      </li>`;
  }

  html += `
    <li class="page-item ${currentSalePage === totalPages ? "disabled" : ""}">
      <button class="page-link" onclick="changeSalePage(${currentSalePage + 1})">&raquo;</button>
    </li>
  </ul></nav>`;

  container.innerHTML = html;

  const start = (currentSalePage - 1) * salesPerPage + 1;
  const end = Math.min(currentSalePage * salesPerPage, totalItems);
  infoContainer.innerText = `Gösterilen: ${start} - ${end} / ${totalItems} kayıt (${totalPages} sayfa)`;
}

window.changeSalePage = function (page) {
  currentSalePage = page;
  renderSaleList(allSales);
  renderSalePagination(allSales.length);
};
//paket satışlarını yükle
let allPackageSales = [];
let currentPackageSalePage = 1;
const packageSalesPerPage = 10;

async function loadCustomerPackageSales(customerId, customer) {
  try {
    const res = await axios.get(`http://localhost:5001/api/sales/by-customer/${customerId}`, axiosConfig);
    allPackageSales = res.data;

    const container = document.querySelector("#section-paketsatislar");
    if (!container) return;

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle bg-white border d-flex justify-content-center align-items-center" style="width: 42px; height: 42px;">
            <span class="fw-bold text-uppercase">${customer.name?.charAt(0) || "?"}</span>
          </div>
          <h5 class="mb-0">${customer.name}</h5>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="input-group" style="max-width: 250px;">
            <span class="input-group-text"><i class="bi bi-search text-muted"></i></span>
            <input type="text" id="searchPackageSales" class="form-control" placeholder="Satış ara..." />
          </div>
          <button class="btn btn-outline-secondary btn-sm" id="refreshPackageSales" title="Yenile">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="filterPackageSales" title="Filtrele">
            <i class="bi bi-funnel"></i>
          </button>
        </div>
      </div>
    `;

    html += `
      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle shadow-sm" id="packageSaleTable">
          <thead class="table-light text-center">
            <tr>
              <th>Hizmet</th>
              <th>Seans</th>
              <th>Taksit</th>
              <th>Fiyat</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div id="packageSalePagination" class="mt-3"></div>
      <div id="packageSaleInfo" class="text-muted text-center small mt-1"></div>
    `;

    container.innerHTML = html;

    renderPackageSaleList(allPackageSales);
    renderPackageSalePagination(allPackageSales.length);

    document.getElementById("refreshPackageSales").addEventListener("click", () => {
      loadCustomerPackageSales(customerId, customer);
    });

    document.getElementById("filterPackageSales").addEventListener("click", () => {
      alert("Filtre özelliği henüz aktif değil 🙈");
    });

    document.getElementById("searchPackageSales").addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const filtered = allPackageSales.filter(s =>
        (s.Service?.name || "").toLowerCase().includes(query)
      );
      renderPackageSaleList(filtered);
      renderPackageSalePagination(filtered.length);
    });

  } catch (err) {
    console.error("Paket satışlar yüklenirken hata:", err);
    document.querySelector("#section-paketsatislar").innerHTML = `<div class='alert alert-danger'>Paket satışlar yüklenemedi.</div>`;
  }
}

function renderPackageSaleList(sales) {
  const tbody = document.querySelector("#packageSaleTable tbody");
  tbody.innerHTML = "";

  const startIndex = (currentPackageSalePage - 1) * packageSalesPerPage;
  const paginated = sales.slice(startIndex, startIndex + packageSalesPerPage);

  paginated.forEach(sale => {
    const tarih = new Date(sale.createdAt).toLocaleDateString("tr-TR");
    tbody.innerHTML += `
      <tr>
        <td>${sale.Service?.name || "-"}</td>
        <td class="text-center">${sale.session || "-"}</td>
        <td class="text-center">${sale.installment || "-"}</td>
        <td class="text-end">${parseFloat(sale.price).toFixed(2)} ₺</td>
        <td class="text-nowrap">${tarih}</td>
      </tr>
    `;
  });
}

function renderPackageSalePagination(totalItems) {
  const container = document.getElementById("packageSalePagination");
  const infoContainer = document.getElementById("packageSaleInfo");
  if (!container || !infoContainer) return;

  const totalPages = Math.ceil(totalItems / packageSalesPerPage);
  let html = `<nav><ul class="pagination pagination-sm justify-content-center mb-0">`;

  html += `
    <li class="page-item ${currentPackageSalePage === 1 ? "disabled" : ""}">
      <button class="page-link" onclick="changePackageSalePage(${currentPackageSalePage - 1})">&laquo;</button>
    </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentPackageSalePage ? "active" : ""}">
        <button class="page-link" onclick="changePackageSalePage(${i})">${i}</button>
      </li>`;
  }

  html += `
    <li class="page-item ${currentPackageSalePage === totalPages ? "disabled" : ""}">
      <button class="page-link" onclick="changePackageSalePage(${currentPackageSalePage + 1})">&raquo;</button>
    </li>
  </ul></nav>`;

  container.innerHTML = html;

  const start = (currentPackageSalePage - 1) * packageSalesPerPage + 1;
  const end = Math.min(currentPackageSalePage * packageSalesPerPage, totalItems);
  infoContainer.innerText = `Gösterilen: ${start} - ${end} / ${totalItems} kayıt (${totalPages} sayfa)`;
}

window.changePackageSalePage = function (page) {
  currentPackageSalePage = page;
  renderPackageSaleList(allPackageSales);
  renderPackageSalePagination(allPackageSales.length);
};
//ödemeler 
// Ödeme Sekmesi İçin Global Değişkenler
let allPayments = [];
let currentPaymentPage = 1;
const paymentsPerPage = 10;

async function loadCustomerPayments(customerId, customer) {
  try {
    const res = await axios.get(`http://localhost:5001/api/payments/by-customer/${customerId}`, axiosConfig);
    allPayments = res.data.filter(p => p.status === "ödendi");


    const container = document.querySelector("#section-odemeler");
    if (!container) return;

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle bg-white border d-flex justify-content-center align-items-center" style="width: 42px; height: 42px;">
            <span class="fw-bold text-uppercase">${customer.name?.charAt(0) || "?"}</span>
          </div>
          <h5 class="mb-0">${customer.name}</h5>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="input-group" style="max-width: 250px;">
            <span class="input-group-text"><i class="bi bi-search text-muted"></i></span>
            <input type="text" id="searchPayments" class="form-control" placeholder="Ödeme ara..." />
          </div>
          <button class="btn btn-outline-secondary btn-sm" id="refreshPayments" title="Yenile">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="filterAppointments" title="Filtrele">
      <i class="bi bi-funnel"></i>
    </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle shadow-sm" id="paymentTable">
          <thead class="table-light text-center">
            <tr>
              <th>Taksit No</th>
              <th>Tutar</th>
              <th>Vade</th>
              <th>Durum</th>
              <th>Ödeme Tarihi</th>
              <th>Ödeme Tipi</th>
              <th>Kullanıcı</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <div id="paymentPagination" class="mt-3"></div>
      <div id="paymentInfo" class="text-muted text-center small mt-1"></div>
    `;

    container.innerHTML = html;

    renderPaymentList(allPayments);
    renderPaymentPagination(allPayments.length);

    document.getElementById("refreshPayments").addEventListener("click", () => {
      loadCustomerPayments(customerId, customer);
    });

    document.getElementById("searchPayments").addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const filtered = allPayments.filter(p =>
        (p.paymentType || "").toLowerCase().includes(query) ||
        (p.User?.name || "").toLowerCase().includes(query)
      );
      renderPaymentList(filtered);
      renderPaymentPagination(filtered.length);
    });

  } catch (err) {
    console.error("Ödemeler yüklenirken hata:", err);
    document.querySelector("#section-odemeler").innerHTML = `<div class='alert alert-danger'>Ödemeler yüklenemedi.</div>`;
  }
}

function renderPaymentList(payments) {
  const tbody = document.querySelector("#paymentTable tbody");
  tbody.innerHTML = "";

  const startIndex = (currentPaymentPage - 1) * paymentsPerPage;
  const paginated = payments.slice(startIndex, startIndex + paymentsPerPage);

  paginated.forEach(p => {
    const vade = new Date(p.dueDate).toLocaleDateString("tr-TR");
    const odemeTarihi = p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("tr-TR") : "-";
    const statusBadge = p.status === "ödendi" ? "success" : p.status === "gecikmiş" ? "danger" : "warning";
    tbody.innerHTML += `
      <tr>
        <td class="text-center">${p.installmentNo || "-"}</td>
        <td class="text-end">${parseFloat(p.amount).toFixed(2)} ₺</td>
        <td class="text-nowrap">${vade}</td>
        <td class="text-center"><span class="badge bg-${statusBadge}">${p.status}</span></td>
        <td class="text-nowrap">${odemeTarihi}</td>
        <td class="text-center">${p.paymentType || "-"}</td>
        <td class="text-center">${p.User?.name || "-"}</td>
      </tr>
    `;
  });
}

function renderPaymentPagination(totalItems) {
  const container = document.getElementById("paymentPagination");
  const infoContainer = document.getElementById("paymentInfo");
  if (!container || !infoContainer) return;

  const totalPages = Math.ceil(totalItems / paymentsPerPage);
  let html = `<nav><ul class="pagination pagination-sm justify-content-center mb-0">`;

  html += `
    <li class="page-item ${currentPaymentPage === 1 ? "disabled" : ""}">
      <button class="page-link" onclick="changePaymentPage(${currentPaymentPage - 1})">&laquo;</button>
    </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentPaymentPage ? "active" : ""}">
        <button class="page-link" onclick="changePaymentPage(${i})">${i}</button>
      </li>`;
  }

  html += `
    <li class="page-item ${currentPaymentPage === totalPages ? "disabled" : ""}">
      <button class="page-link" onclick="changePaymentPage(${currentPaymentPage + 1})">&raquo;</button>
    </li>
  </ul></nav>`;

  container.innerHTML = html;

  const start = (currentPaymentPage - 1) * paymentsPerPage + 1;
  const end = Math.min(currentPaymentPage * paymentsPerPage, totalItems);
  infoContainer.innerText = `Gösterilen: ${start} - ${end} / ${totalItems} kayıt (${totalPages} sayfa)`;
}

window.changePaymentPage = function (page) {
  currentPaymentPage = page;
  renderPaymentList(allPayments);
  renderPaymentPagination(allPayments.length);
};
//borclar
let allDebts = [];
let currentDebtPage = 1;
const debtsPerPage = 10;

async function loadCustomerDebts(customerId, customer) {
  try {
    const res = await axios.get(`http://localhost:5001/api/payments/by-customer/${customerId}`, axiosConfig);
    allDebts = res.data.filter(p => p.status === "bekliyor" || p.status === "gecikmiş");

    const container = document.querySelector("#section-borclar");
    if (!container) return;

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle bg-white border d-flex justify-content-center align-items-center" style="width: 42px; height: 42px;">
            <span class="fw-bold text-uppercase">${customer.name?.charAt(0) || "?"}</span>
          </div>
          <h5 class="mb-0">${customer.name}</h5>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="input-group" style="max-width: 250px;">
            <span class="input-group-text"><i class="bi bi-search text-muted"></i></span>
            <input type="text" id="searchDebts" class="form-control" placeholder="Borç ara..." />
          </div>
          <button class="btn btn-outline-secondary btn-sm" id="refreshDebts" title="Yenile">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="filterAppointments" title="Filtrele">
      <i class="bi bi-funnel"></i>
    </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered table-hover align-middle shadow-sm" id="debtTable">
          <thead class="table-light text-center">
            <tr>
              <th>Taksit No</th>
              <th>Tutar</th>
              <th>Vade</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>

      <div id="debtPagination" class="mt-3"></div>
      <div id="debtInfo" class="text-muted text-center small mt-1"></div>
    `;

    container.innerHTML = html;

    renderDebtList(allDebts);
    renderDebtPagination(allDebts.length);

    document.getElementById("refreshDebts").addEventListener("click", () => {
      loadCustomerDebts(customerId, customer);
    });

    document.getElementById("searchDebts").addEventListener("input", function () {
      const query = this.value.toLowerCase();
      const filtered = allDebts.filter(p =>
        (p.description || "").toLowerCase().includes(query) ||
        (p.User?.name || "").toLowerCase().includes(query)
      );
      renderDebtList(filtered);
      renderDebtPagination(filtered.length);
    });

  } catch (err) {
    console.error("Borçlar yüklenirken hata:", err);
    container.innerHTML = "<div class='alert alert-danger'>Borçlar yüklenemedi.</div>";
  }
}

function renderDebtList(debts) {
  const tbody = document.querySelector("#debtTable tbody");
  tbody.innerHTML = "";

  const startIndex = (currentDebtPage - 1) * debtsPerPage;
  const paginated = debts.slice(startIndex, startIndex + debtsPerPage);

  paginated.forEach(p => {
    const vade = new Date(p.dueDate).toLocaleDateString("tr-TR");
    const odemeTarihi = p.paymentDate ? new Date(p.paymentDate).toLocaleDateString("tr-TR") : "-";
    const statusBadge = p.status === "gecikmiş" ? "danger" : "warning";

    tbody.innerHTML += `
      <tr>
        <td class="text-center">${p.installmentNo || "-"}</td>
        <td class="text-center">${parseFloat(p.amount).toFixed(2)} ₺</td>
        <td class="text-center">${vade}</td>
        <td class="text-center"><span class="badge bg-${statusBadge}">${p.status}</span></td>
        <td class="text-center">
        <td class="text-center">
          <button class="btn btn-sm btn-outline-success ms-2 pay-btn" data-payment-id="${p.id}">
            Ödeme Yap
          </button>
        </td>

        </td>
      </tr>`;
  });

  // Butonlara listener ekle
setTimeout(() => {
document.querySelectorAll(".pay-btn").forEach(btn => {
  btn.addEventListener("click", async e => {
    const paymentId = btn.dataset.paymentId;

    try {
      await loadPopup("paymentModal"); // ✅ Modalı yükle
      if (window.paymentModal?.open) {
        window.paymentModal.open(paymentId); // ✅ Aç
      } else {
        alert("Ödeme modülü henüz yüklenmedi.");
      }
    } catch (err) {
      console.error("Ödeme popup yüklenemedi:", err);
      alert("Ödeme popup'ı yüklenirken hata oluştu.");
    }
  });
});

}, 0);

}


function renderDebtPagination(totalItems) {
  const container = document.getElementById("debtPagination");
  const infoContainer = document.getElementById("debtInfo");
  if (!container || !infoContainer) return;

  const totalPages = Math.ceil(totalItems / debtsPerPage);
  let html = `<nav><ul class="pagination pagination-sm justify-content-center mb-0">`;

  html += `
    <li class="page-item ${currentDebtPage === 1 ? "disabled" : ""}">
      <button class="page-link" onclick="changeDebtPage(${currentDebtPage - 1})">&laquo;</button>
    </li>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <li class="page-item ${i === currentDebtPage ? "active" : ""}">
        <button class="page-link" onclick="changeDebtPage(${i})">${i}</button>
      </li>`;
  }

  html += `
    <li class="page-item ${currentDebtPage === totalPages ? "disabled" : ""}">
      <button class="page-link" onclick="changeDebtPage(${currentDebtPage + 1})">&raquo;</button>
    </li>
  </ul></nav>`;

  container.innerHTML = html;

  const start = (currentDebtPage - 1) * debtsPerPage + 1;
  const end = Math.min(currentDebtPage * debtsPerPage, totalItems);
  infoContainer.innerText = `Gösterilen: ${start} - ${end} / ${totalItems} kayıt (${totalPages} sayfa)`;
}

window.changeDebtPage = function (page) {
  currentDebtPage = page;
  renderDebtList(allDebts);
  renderDebtPagination(allDebts.length);
};
document.addEventListener("DOMContentLoaded", () => {
  if (window.performance?.navigation?.type === 1 && sessionStorage.getItem("odemeBasarili") === "1") {
    sessionStorage.removeItem("odemeBasarili");

    if (typeof Swal !== "undefined") {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Ödeme başarıyla alındı!",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        background: "#d1e7dd",
        color: "#0f5132",
        didOpen: (toast) => {
          toast.style.zIndex = 99999;
        }
      });
    }
  }
});
