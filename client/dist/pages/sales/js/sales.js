const token = localStorage.getItem("companyToken");
const axiosConfig = {
  headers: { Authorization: "Bearer " + token }
};

const saleForm = document.getElementById("saleForm");
const productForm = document.getElementById("productForm");
const customerSelect = document.getElementById("customerSelect");
const userSelect = document.getElementById("userSelect");
const serviceSelect = document.getElementById("serviceSelect");
const productSelect = document.getElementById("productSelect");
const productUserSelect = document.getElementById("productUserSelect");
const saleModal = new bootstrap.Modal(document.getElementById('saleModal'));
const productModal = new bootstrap.Modal(document.getElementById('productModal'));
const openProductBtn = document.getElementById("openProductModalBtn");
const paymentModal = new bootstrap.Modal(document.getElementById("paymentModal"));
const saleTableBody = document.getElementById("saleTableBody");


let currentEditingSaleId = null;
let currentCustomerId = null;


async function loadSales() {
  const res = await axios.get("http://localhost:5001/api/sales", axiosConfig);
  saleTableBody.innerHTML = "";

  for (const sale of res.data) {
    const statusRes = await axios.get(`http://localhost:5001/api/sales/${sale.id}/payments-status`, axiosConfig);
    const odemeVar = statusRes.data.odemeVar;

    const tr = document.createElement("tr");

    const customer = sale.Customer?.name || "-";
    const service = sale.Service?.name || "-";
    const price = `${sale.price}₺`;
    const session = `${sale.session} seans`;

    const btnGroup = document.createElement("td");
if (odemeVar) {
  btnGroup.innerHTML = `
    <div class="d-flex justify-content-center">
      <button class="btn btn-sm btn-light border d-flex justify-content-center align-items-center p-0" style="width:36px; height:36px;" onclick="openSaleDetail(${sale.id})" title="Detay">
        <i class="bi bi-search text-info fs-5 m-0 p-0"></i>
      </button>
    </div>
  `;
    }else {
      btnGroup.innerHTML = `
        <button class="btn btn-sm btn-primary me-1" onclick="editSale(${sale.id})">Düzenle</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSale(${sale.id})">Sil</button>
      `;
    }

    tr.innerHTML = `
      <td>${customer}</td>
      <td>${service}</td>
      <td>${price}</td>
      <td>${session}</td>
    `;
    tr.appendChild(btnGroup);
    saleTableBody.appendChild(tr);
  }
}

async function loadOptions() {
  const [customers, users, services] = await Promise.all([
    axios.get("http://localhost:5001/api/customers", axiosConfig),
    axios.get("http://localhost:5001/api/users", axiosConfig),
    axios.get("http://localhost:5001/api/services", axiosConfig)
  ]);
  customerSelect.innerHTML = customers.data.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  userSelect.innerHTML = users.data.map(u => `<option value="${u.id}">${u.name}</option>`).join("");
  serviceSelect.innerHTML = services.data.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
}



async function loadProductOptions() {
  const [products, users] = await Promise.all([
    axios.get("http://localhost:5001/api/products", axiosConfig),
    axios.get("http://localhost:5001/api/users", axiosConfig)
  ]);
  productSelect.innerHTML = products.data.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  productUserSelect.innerHTML = users.data.map(u => `<option value="${u.id}">${u.name}</option>`).join("");
}

saleForm.addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(saleForm);
  const data = Object.fromEntries(formData.entries());
  data.prePayment = document.getElementById("prePayment")?.value || 0;
  data.installment = document.getElementById("installmentCount")?.value || 0;
  data.prePaymentType = document.getElementById("prePaymentType")?.value || null;



  if (!data.id) {
    delete data.id;
    const res = await axios.post("http://localhost:5001/api/sales", data, axiosConfig);
    currentCustomerId = res.data.CustomerId;
  } else {
    await axios.put(`http://localhost:5001/api/sales/${data.id}`, data, axiosConfig);
    currentCustomerId = data.CustomerId;
  }

  saleForm.reset();
  openProductBtn.style.display = "none";
  saleModal.hide();
  await loadSales();
  loadSales();

  // ✅ TOAST BİLDİRİMİ
Swal.fire({
  toast: true,
  position: "top-end",
  icon: "success",
  title: "Paket satışı başarıyla kaydedildi!",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  background: "#d1e7dd",
  color: "#0f5132",
  didOpen: (toast) => {
    toast.style.zIndex = 99999;
  }
});
});

async function editSale(id) {
  const res = await axios.get(`http://localhost:5001/api/sales/${id}`, axiosConfig);
  const sale = res.data;

  await loadOptions();

  saleForm.CustomerId.value = sale.CustomerId;
  saleForm.UserId.value = sale.UserId;
  saleForm.ServiceId.value = sale.ServiceId;
  saleForm.price.value = sale.price;
  saleForm.session.value = sale.session;
  saleForm.id.value = sale.id;

  document.getElementById("prePayment").value = sale.prePayment || 0;
  document.getElementById("prePaymentType").value = sale.prePaymentType || "";
  document.getElementById("remainingAmount").value = (sale.price - (sale.prePayment || 0)).toFixed(2);
  document.getElementById("installmentCount").value = sale.installment || 0;

  document.getElementById("installmentsContainer").innerHTML = ""; // önce temizle
  saleModal.show(); // önce modalı göster
  await loadPendingInstallments(sale.id); // sonra taksit kutularını getir

  currentCustomerId = sale.CustomerId;
  openProductBtn.style.display = "inline-block";
  currentEditingSaleId = sale.id;
}



// 🧾 Satışa ait bekleyen taksitleri getir ve kutulara bas
async function loadPendingInstallments(saleId) {
  const res = await axios.get(`http://localhost:5001/api/payments/by-sale/${saleId}`, axiosConfig);
  const installments = res.data;
  const container = document.getElementById("installmentsContainer");
  container.innerHTML = "";

  installments.forEach((installment, i) => {
    const div = document.createElement("div");
    div.className = "form-row mb-2";
    div.innerHTML = `
      <div class="form-group col-md-6">
        <label>Taksit ${installment.installmentNo} Tutarı (₺):</label>
        <input type="number" class="form-control" value="${installment.amount}" readonly>
      </div>
      <div class="form-group col-md-6">
        <label>Taksit ${installment.installmentNo} Tarihi:</label>
        <input type="date" class="form-control" value="${installment.dueDate.split('T')[0]}">
      </div>
    `;
    container.appendChild(div);
  });
}

async function loadModal(htmlPath, jsPath, callback) {
  // Eğer modal zaten varsa, doğrudan callback çalıştır
  const existing = document.querySelector(`[src="${jsPath}"]`);
  if (document.querySelector(`#${getModalIdFromPath(htmlPath)}`)) {
    if (callback) await callback();
    return;
  }

  // HTML’i yükle
  const html = await fetch(htmlPath).then(res => res.text());
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  // JS’i yükle
  const script = document.createElement("script");
  script.type = "module";
  script.src = jsPath;
  document.body.appendChild(script);

  // Modül yüklenince callback çalıştır
  script.onload = async () => {
    if (callback) await callback();
  };
}

function getModalIdFromPath(path) {
  const fileName = path.split("/").pop();
  return fileName.replace(".html", "");
}



async function deleteSale(id) {
  if (confirm("Bu satışı silmek istiyor musun?")) {
    await axios.delete(`http://localhost:5001/api/sales/${id}`, axiosConfig);
    loadSales();
  }
}

openProductBtn.addEventListener("click", async () => {
  await loadProductOptions();
  document.getElementById("productSaleId").value = currentEditingSaleId;
  document.getElementById("productCustomerId").value = currentCustomerId;
  productModal.show();
});

productForm.addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(productForm);
  const data = Object.fromEntries(formData.entries());
  const saleId = document.getElementById("productSaleId").value;
  const customerId = document.getElementById("productCustomerId").value;

  await axios.post("http://localhost:5001/api/sale-products", {
    
    ...data,
    SaleId: saleId,
    CustomerId: customerId
  }, axiosConfig);

  productForm.reset();
  productModal.hide();
});

function openCreateModal() {
  saleForm.reset();
  document.getElementById("saleId").value = "";
  openProductBtn.style.display = "none";
  currentEditingSaleId = null;
  currentCustomerId = null;
  loadOptions();
  saleModal.show();
}




// Sayfa yüklendiğinde ilk veriler yüklensin
loadSales();
loadOptions();

// Ön ödeme girildiğinde kalan tutarı hesapla
document.getElementById("prePayment").addEventListener("input", () => {
  const price = parseFloat(document.getElementById("price").value) || 0;
  const prePayment = parseFloat(document.getElementById("prePayment").value) || 0;
  const remaining = Math.max(price - prePayment, 0);
  document.getElementById("remainingAmount").value = remaining.toFixed(2);
});

function calculateRemainingAmount() {
  const price = parseFloat(document.getElementById("price").value) || 0;
  const prePayment = parseFloat(document.getElementById("prePayment").value) || 0;

  const remaining = Math.max(price - prePayment, 0);
  document.getElementById("remainingAmount").value = remaining.toFixed(2);
}
window.openSaleDetail = async function (saleId) {
  const token = localStorage.getItem("companyToken");

  await loadModal(
    "../../modals/saleDetailModal.html",
    "../../modals/js/saleDetailModal.js",
    async () => {
      const { viewSaleDetail } = await import("../../modals/js/saleDetailModal.js");
      viewSaleDetail(saleId, token);
    }
  );
};
// 🔥 Silme işlemi için global fonksiyon
window.handleDeleteSaleWithConfirm = async function () {
  const token = localStorage.getItem("companyToken");
  const { handleDeleteSale } = await import("../../modals/js/saleDetailModal.js");
  handleDeleteSale(token);
};



// Fiyat değiştiğinde de tetikle
document.getElementById("price").addEventListener("input", calculateRemainingAmount);

// Ön ödeme değiştiğinde de tetikle
document.getElementById("prePayment").addEventListener("input", calculateRemainingAmount);

document.addEventListener("DOMContentLoaded", calculateRemainingAmount);
calculateRemainingAmount();



document.getElementById("generateInstallments").addEventListener("click", () => {
  const remaining = parseFloat(document.getElementById("remainingAmount").value) || 0;
  const count = parseInt(document.getElementById("installmentCount").value) || 0;
  const container = document.getElementById("installmentsContainer");

  container.innerHTML = ""; // Önce temizle

  if (count < 1 || remaining <= 0) return;

  const today = new Date();

  for (let i = 0; i < count; i++) {
    const tutar = (remaining / count).toFixed(2);
    const odemeTarihi = new Date(today);
    odemeTarihi.setMonth(today.getMonth() + i + 1); // her ay bir sonraki

    const div = document.createElement("div");
    div.className = "form-row mb-2";

    div.innerHTML = `
      <div class="form-group col-md-6">
        <label>Taksit ${i + 1} Tutarı (₺):</label>
        <input type="number" class="form-control" value="${tutar}" readonly>
      </div>
      <div class="form-group col-md-6">
        <label>Taksit ${i + 1} Tarihi:</label>
        <input type="date" class="form-control" value="${odemeTarihi.toISOString().split('T')[0]}">
      </div>
    `;

    container.appendChild(div);
  }



});
