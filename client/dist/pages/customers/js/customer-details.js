// customer-details.js

const companyToken = localStorage.getItem("companyToken");
const axiosConfig = {
  headers: {
    Authorization: "Bearer " + companyToken,
  },
};
import { loadPopup } from "../../../utils/popupLoader.js";
let currentPage = 1;
const itemsPerPage = 10;
//sidebar
   document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const section = link.getAttribute('data-section');

    // Aktif linki güncelle
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    // Diğer content-section'ları gizle, ilgili olanı göster
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('d-none'));
    const target = document.getElementById('section-' + section);
    if (target) target.classList.remove('d-none');
  });
});

// URL'den müşteri id'sini al
const urlParams = new URLSearchParams(window.location.search);
const customerId = urlParams.get("id");

// Sayfa yüklendiğinde müşteri detaylarını çek
document.addEventListener("DOMContentLoaded", async () => {
  if (!customerId) return alert("Müşteri ID bulunamadı.");

  try {
    const res = await axios.get(`http://localhost:5001/api/customers/${customerId}`, axiosConfig);
    const customer = res.data;

    const bilgiContainer = document.querySelector("#section-bilgileri");
    if (!bilgiContainer) return;

    bilgiContainer.innerHTML = `
      <div class="card mt-3">
        <div class="card-body">
          <h5 class="card-title">${customer.name}</h5>
          <p><strong>Telefon:</strong> ${customer.phone || "-"}</p>
          <p><strong>Email:</strong> ${customer.email || "-"}</p>
          <p><strong>Doğum Tarihi:</strong> ${customer.birthDate || "-"}</p>
          <p><strong>Cinsiyet:</strong> ${customer.gender || "-"}</p>
          <p><strong>Kayıt Tarihi:</strong> ${new Date(customer.createdAt).toLocaleDateString("tr-TR")}</p>
        </div>
      </div>
    `;
  } catch (err) {
    alert("Müşteri bilgileri getirilemedi.");
    console.error(err);
  }
});
