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
    <div class="input-group " style="max-width: 230px;">
  <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
  <input type="text" id="searchAppointments" class="form-control border-start-0" placeholder="Randevu ara..." />
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


