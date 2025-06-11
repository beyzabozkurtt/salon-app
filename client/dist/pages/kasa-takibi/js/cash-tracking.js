let allPayments = [];

const token = localStorage.getItem("companyToken");
const fetchConfig = {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token
  }
};

async function loadCashTracking() {
  const res = await fetch("http://localhost:5001/api/payments/cash-tracking", fetchConfig);
  allPayments = await res.json();
  populateFilters(allPayments);
  renderTable();
}

function populateFilters(data) {
  const labelSet = new Set();
  const userSet = new Set();
  const labelSelect = document.getElementById("filterLabel");
  const userSelect = document.getElementById("filterUser");

  labelSelect.innerHTML = `<option value="">Tümü</option>`;
  userSelect.innerHTML = `<option value="">Tümü</option>`;

  data.forEach(p => {
    const label = p.Product?.name || p.Sale?.Service?.name;
    const user = p.User?.name;
    if (label && !labelSet.has(label)) {
      labelSelect.innerHTML += `<option value="${label}">${label}</option>`;
      labelSet.add(label);
    }
    if (user && !userSet.has(user)) {
      userSelect.innerHTML += `<option value="${user}">${user}</option>`;
      userSet.add(user);
    }
  });
}

function renderTable() {
  const tbody = document.getElementById("cash-table");
  tbody.innerHTML = "";

  const paymentStart = document.getElementById("paymentDateStart").value;
  const paymentEnd = document.getElementById("paymentDateEnd").value;
  const dueStart = document.getElementById("dueDateStart").value;
  const dueEnd = document.getElementById("dueDateEnd").value;
  const statusFilter = document.getElementById("filterStatus").value;
  const labelFilter = document.getElementById("filterLabel").value;
  const paymentTypeFilter = document.getElementById("filterPaymentType").value;
  const userFilter = document.getElementById("filterUser").value;

  const now = new Date();
  let toplam = 0, odenen = 0, kalan = 0;

  allPayments.forEach(p => {
    let status = p.status;
    const due = new Date(p.dueDate);
    if (status === 'bekliyor' && due < now) status = 'gecikmiş';

    const label = p.Product?.name || p.Sale?.Service?.name || "-";
    const customer = p.Sale?.Customer?.name || p.FallbackCustomer?.name || "-";
    const user = p.User?.name || "-";

    const payDate = p.paymentDate ? new Date(p.paymentDate) : null;
    const dueDate = p.dueDate ? new Date(p.dueDate) : null;

    const pass = (!paymentStart || !payDate || new Date(paymentStart) <= payDate) &&
                 (!paymentEnd || !payDate || new Date(paymentEnd) >= payDate) &&
                 (!dueStart || !dueDate || new Date(dueStart) <= dueDate) &&
                 (!dueEnd || !dueDate || new Date(dueEnd) >= dueDate) &&
                 (!statusFilter || status === statusFilter) &&
                 (!labelFilter || label === labelFilter) &&
                 (!paymentTypeFilter || p.paymentType === paymentTypeFilter) &&
                 (!userFilter || user === userFilter);

    if (!pass) return;

    const amount = parseFloat(p.amount);
    toplam += amount;
    if (status === "ödendi") odenen += amount;
    else kalan += amount;

    const row = document.createElement("tr");
row.innerHTML = `
  <td>${user}</td>
  <td>${customer}</td>
  <td>${label}</td>
  <td>${p.paymentDate ? new Date(p.paymentDate).toLocaleString('tr-TR') : "-"}</td>
  <td>${dueDate ? dueDate.toLocaleDateString('tr-TR') : "-"}</td>
  <td>${p.installmentNo || "-"}</td>
  <td>${amount.toFixed(2)}₺</td>
  <td>${p.paymentType || "-"}</td>
  <td><span class="badge-status ${getBadgeClass(status)}">${status}</span></td>
`;

    tbody.appendChild(row);
  });

  document.getElementById("total").textContent = `${toplam.toFixed(2)}₺`;
  document.getElementById("paid").textContent = `${odenen.toFixed(2)}₺`;
  document.getElementById("unpaid").textContent = `${kalan.toFixed(2)}₺`;
}

document.querySelectorAll("select, input[type='date']").forEach(el =>
  el.addEventListener("change", renderTable)
);

loadCashTracking();

function exportToExcel() {
  const table = document.querySelector("table");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Kasa Takibi" });
  XLSX.writeFile(wb, "kasa_takibi.xlsx");
}
function getBadgeClass(status) {
  switch (status) {
    case "ödendi": return "badge-ödendi";
    case "gecikmiş": return "badge-gecikmiş";
    case "bekliyor": return "badge-bekliyor";
    default: return "badge-secondary";
  }
}
