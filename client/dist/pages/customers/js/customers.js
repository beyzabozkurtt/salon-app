// customers.js
import { loadPopup } from "../../../utils/popupLoader.js";
let currentPage = 1;
const itemsPerPage = 10;


let allCustomers = [];
const list = document.getElementById("customerList");
const searchInput = document.getElementById("searchInput");

const companyToken = localStorage.getItem("companyToken");
const axiosConfig = {
  headers: {
    Authorization: "Bearer " + companyToken,
  },
};

export async function init() {
  await loadPopup("create-customer");
  await loadPopup("update-customer");

  loadCustomers();

  document.getElementById("customerForm")?.addEventListener("submit", window.createCustomer);
  document.getElementById("updateForm")?.addEventListener("submit", window.updateCustomer);

  searchInput?.addEventListener("input", handleSearch);
}
window.addEventListener("customers-updated", () => {
  loadCustomers();
});

async function loadCustomers() {
  try {
    const res = await axios.get("http://localhost:5001/api/customers", axiosConfig);
    allCustomers = res.data;
    renderCustomerList(allCustomers);
  } catch (err) {
    alert("Müşteri listesi alınamadı.");
    console.error(err);
  }
}

function renderCustomerList(customers) {
  list.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, startIndex + itemsPerPage);

  paginatedCustomers.forEach((c) => {
    const row = document.createElement("tr");

    const formattedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString("tr-TR") : "";
    const lastAppointment = c.lastAppointmentDate ? new Date(c.lastAppointmentDate).toLocaleDateString("tr-TR") : "-";
    const appointmentCount = c.appointmentCount ?? 0;
    const banned = c.isBanned ? `<span class="text-danger">Var</span>` : `<span class="text-success">Yok</span>`;

    row.innerHTML = `
      <td class="text-start">${c.name || ""}</td>
      <td>${c.phone || ""}</td>
      <td>${c.email || ""}</td>
      <td>${formattedDate}</td>
      <td>${lastAppointment}</td>
      <td>${appointmentCount}</td>
      <td>${banned}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-light border me-1" onclick='editCustomer(${JSON.stringify(c)})' title="Düzenle">
          <i class="bi bi-search text-primary"></i>
        </button>
        <button class="btn btn-sm btn-light border" onclick='deleteCustomer(${c.id})' title="Sil">
          <i class="bi bi-trash text-danger"></i>
        </button>
      </td>
    `;
    list.appendChild(row);
  });

  if (customers.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="8" class="text-center text-muted">Hiçbir müşteri bulunamadı.</td>`;
    list.appendChild(emptyRow);
  }

  renderPagination(customers.length);
}
function renderPagination(totalItems) {
  const paginationContainer = document.getElementById("paginationContainer");
  const paginationInfo = document.getElementById("paginationInfo");
  if (!paginationContainer || !paginationInfo) return;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentStart = (currentPage - 1) * itemsPerPage + 1;
  const currentEnd = Math.min(currentPage * itemsPerPage, totalItems);

  // Sayfa numaraları
  let buttonsHtml = `<nav><ul class="pagination pagination-sm mb-0">`;

  // Sol ok
  buttonsHtml += `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <button class="page-link" onclick="changePage(${currentPage - 1})">
        <i class="bi bi-chevron-left"></i>
      </button>
    </li>
  `;

  // Sayfa numaraları (maks. 9 göster)
  const maxButtons = 9;
  let startPage = Math.max(currentPage - 4, 1);
  let endPage = Math.min(startPage + maxButtons - 1, totalPages);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(endPage - maxButtons + 1, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    buttonsHtml += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <button class="page-link" onclick="changePage(${i})">${i}</button>
      </li>
    `;
  }

  // Sağ ok
  buttonsHtml += `
    <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
      <button class="page-link" onclick="changePage(${currentPage + 1})">
        <i class="bi bi-chevron-right"></i>
      </button>
    </li>
  `;
  buttonsHtml += `</ul></nav>`;

  paginationContainer.innerHTML = buttonsHtml;

  // Dinamik bilgi yazdır
  paginationInfo.innerHTML = `
    Gösterilen: <strong>${currentStart} - ${currentEnd}</strong> / ${totalItems} (${totalPages} sayfa)
  `;
}



function handleSearch() {
  const value = searchInput.value.trim().toLowerCase();
  if (value.length < 3) {
    renderCustomerList(allCustomers);
    return;
  }
  const filtered = allCustomers.filter(c =>
    c.name.toLowerCase().includes(value) || (c.email || "").toLowerCase().includes(value)
  );
  renderCustomerList(filtered);
}

/*window.editCustomer = function (customer) {
  const updateForm = document.getElementById("updateForm");
  updateForm.name.value = customer.name;
  updateForm.email.value = customer.email;
  updateForm.phone.value = customer.phone;
  updateForm.birthDate.value = customer.birthDate || "";
  updateForm.gender.value = customer.gender || "";
  updateForm.reference.value = customer.reference || "";
  updateForm.notes.value = customer.notes || "";
  updateForm.id.value = customer.id;
  new bootstrap.Modal(document.getElementById("updateModal")).show();
};*/

window.editCustomer = function (customer) {
  if (customer?.id) {
    window.location.href = `customer-details.html?id=${customer.id}`;
  }
};

window.deleteCustomer = async function (id) {
  if (confirm("Müşteri silinsin mi?")) {
    try {
      await axios.delete(`http://localhost:5001/api/customers/${id}`, axiosConfig);
      loadCustomers();
    } catch (err) {
      alert("Müşteri silinemedi.");
      console.error(err);
    }
  }
};

window.goToPaymentDetails = function (id) {
  window.location.href = `payment-details.html?id=${id}`;
};
window.changePage = function (page) {
  currentPage = page;
  renderCustomerList(allCustomers);
};
