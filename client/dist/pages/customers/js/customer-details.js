const companyToken = localStorage.getItem("companyToken");
const axiosConfig = {
  headers: {
    Authorization: "Bearer " + companyToken,
  },
};

import { loadPopup } from "../../../utils/popupLoader.js";

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



