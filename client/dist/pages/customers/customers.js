// customers.js
import { loadPopup } from "../../utils/popupLoader.js";

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

  customers.forEach((c) => {
    const item = document.createElement("li");
    item.className = "list-group-item d-flex justify-content-between align-items-center";
    item.innerHTML = `
      <span class="text-dark">${c.name} • ${c.email}</span>
      <div>
        <button class="btn btn-sm btn-info me-2" onclick='goToPaymentDetails(${c.id})'>Detay</button>
        <button class="btn btn-sm btn-primary me-2" onclick='editCustomer(${JSON.stringify(c)})'>Düzenle</button>
        <button class="btn btn-sm btn-danger" onclick='deleteCustomer(${c.id})'>Sil</button>
      </div>
    `;
    list.appendChild(item);
  });

  if (customers.length === 0) {
    list.innerHTML = `<li class="list-group-item text-center text-muted">Hiçbir müşteri bulunamadı.</li>`;
  }
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

window.editCustomer = function (customer) {
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