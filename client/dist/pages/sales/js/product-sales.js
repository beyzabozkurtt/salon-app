const productSaleList = document.getElementById("productSaleList");
const editProductForm = document.getElementById("editProductForm");
const addProductForm = document.getElementById("addProductForm");

const editModal = new bootstrap.Modal(document.getElementById("editProductModal"));
const addModal = new bootstrap.Modal(document.getElementById("addProductModal"));
const stockWarningModal = new bootstrap.Modal(document.getElementById("stockWarningModal"));


const editUserSelect = document.getElementById("editUserSelect");
const addUserSelect = document.getElementById("addUserSelect");
const customerInput = document.getElementById("customerInput");
const productOptionsElement = document.getElementById("productOptions");

const customerDropdown = document.createElement("div");
customerDropdown.id = "customerDropdown";
customerDropdown.className = "list-group position-absolute w-100";
customerDropdown.style.zIndex = "1000";
customerDropdown.style.maxHeight = "200px";
customerDropdown.style.overflowY = "auto";
customerDropdown.style.display = "none";
customerInput.parentElement.appendChild(customerDropdown);

const token = localStorage.getItem("companyToken");
const axiosConfig = { headers: { Authorization: "Bearer " + token } };

let customerMap = {};
let productMap = {};
let productPriceMap = {};
let customers = [];
let pendingForceData = null;
let selectedDeleteId = null;

// Sil butonuna tıklanınca modalı aç
function openDeleteModal(id) {
  selectedDeleteId = id;
  const modal = new bootstrap.Modal(document.getElementById("deleteSaleModal"));
  modal.show();
}


// 🌟 Ürün inputuna özel autocomplete ve fiyat bağlama
function bindProductAutocomplete(inputEl, priceInputEl) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("position-relative", "w-100");

  const parent = inputEl.parentElement;
  parent.insertBefore(wrapper, inputEl);
  wrapper.appendChild(inputEl);

  const resultBox = document.createElement("div");
  resultBox.classList.add("autocomplete-results");
  resultBox.style.position = "absolute";
  resultBox.style.top = "100%";
  resultBox.style.left = "0";
  resultBox.style.right = "0";
  resultBox.style.zIndex = "1000";
  resultBox.style.backgroundColor = "#fff";
  resultBox.style.border = "1px solid #ccc";
  resultBox.style.borderRadius = "4px";
  resultBox.style.maxHeight = "160px";
  resultBox.style.overflowY = "auto";
  resultBox.style.display = "none";
  wrapper.appendChild(resultBox);

  // 💾 Seçilen ürünün birim fiyatını burada saklayalım
  let selectedUnitPrice = 0;

  inputEl.addEventListener("input", () => {
    const value = inputEl.value.toLowerCase().trim();
    resultBox.innerHTML = "";
    if (value.length < 3) {
      resultBox.style.display = "none";
      return;
    }

    Object.keys(productMap).forEach(label => {
      if (label.toLowerCase().includes(value)) {
        const item = document.createElement("div");
        item.textContent = label;
        item.style.padding = "8px";
        item.style.cursor = "pointer";
        item.classList.add("list-group-item", "list-group-item-action");
        item.addEventListener("click", () => {
          inputEl.value = label;
          selectedUnitPrice = productPriceMap[label] || 0;
          const quantityInput = wrapper.parentElement.querySelector(".quantity-input");
          const quantity = parseInt(quantityInput?.value);

          // 🧮 Tutarı hesapla
          if (!isNaN(quantity)) {
            priceInputEl.value = (selectedUnitPrice * quantity).toFixed(2);
          } else {
            priceInputEl.value = selectedUnitPrice;
          }

          // ✅ Uyarıyı anında temizle
          inputEl.setCustomValidity("");
          inputEl.classList.remove("is-invalid");

          resultBox.style.display = "none";
        });
        resultBox.appendChild(item);
      }
    });

    resultBox.style.display = "block";
  });

  document.addEventListener("click", e => {
    if (!wrapper.contains(e.target)) resultBox.style.display = "none";
  });

  // ✅ Adet değiştiğinde otomatik çarp
  const quantityInput = wrapper.parentElement.querySelector(".quantity-input");
  if (quantityInput) {
    quantityInput.addEventListener("input", () => {
      const quantity = parseInt(quantityInput.value);
      if (!isNaN(quantity) && selectedUnitPrice) {
        priceInputEl.value = (selectedUnitPrice * quantity).toFixed(2);
      }
    });
  }
}


// 🌟 Satışları yükle
async function loadProductSales() {
  const res = await axios.get("http://localhost:5001/api/sale-products", axiosConfig);
  res.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  productSaleList.innerHTML = "";

  res.data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.Customer?.name || "-"}</td>
      <td>${item.Product?.name || "-"} (${item.quantity})</td>
      <td>${formatDateTR(item.saleDate)}</td>
      <td>${item.price || "-"}₺</td>
      <td>${item.User?.name || "-"}</td>
      <td>${item.paymentMethod || "-"}</td>
      <td>${item.notes || "-"}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-primary me-1" onclick="openEditModal(${item.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="openDeleteModal(${item.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    productSaleList.appendChild(row);
  });
}
function formatDateTR(isoDate) {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}.${month}.${year}&nbsp;&nbsp;&nbsp;${hours}:${minutes}`;

}


// 🌟 Modal aç
function openAddProductModal() {
  loadAddModalDropdowns();
  addModal.show();
}

// 🌟 Dropdownları yükle
async function loadAddModalDropdowns() {
  const [productsRes, usersRes, customersRes] = await Promise.all([
    axios.get("http://localhost:5001/api/products", axiosConfig),
    axios.get("http://localhost:5001/api/users", axiosConfig),
    axios.get("http://localhost:5001/api/customers", axiosConfig)
  ]);

  const products = productsRes.data;
  productMap = {};
  productPriceMap = {};

  const productOptionsHTML = products.map(p => {
    const label = `${p.name}${p.barcode ? " • " + p.barcode : ""}`;
    productMap[label] = p.id;
    productPriceMap[label] = p.price;
    return `<option value="${label}"></option>`;
  }).join("");
  productOptionsElement.innerHTML = productOptionsHTML;

addUserSelect.innerHTML = `
  <option value="" disabled selected>Satıcı seçiniz</option>
  ${usersRes.data.map(u => `<option value="${u.id}">${u.name}</option>`).join("")}
`;


  customers = customersRes.data;
  customerMap = {};
  customers.forEach(c => customerMap[c.name] = c.id);
}

// 🌟 Satış kaydet
addProductForm.addEventListener("submit", async e => {

  e.preventDefault();

  const productRows = document.querySelectorAll("#productItems .d-flex");
  const selectedCustomerName = customerInput.value;
  const CustomerId = customerMap[selectedCustomerName] || null;
  const UserId = addUserSelect.value;
  const paymentMethod = addProductForm.paymentMethod.value;
  const notes = addProductForm.notes.value;
  const saleDate = document.getElementById("saleDate").value;
  const paymentCollected = document.getElementById("paymentCollected").checked;

  for (const row of productRows) {
    const inputs = row.querySelectorAll("input");
    const productLabel = inputs[0].value.trim();
    const quantity = parseInt(inputs[1].value);
    const price = parseFloat(inputs[2].value);
    const ProductId = productMap[productLabel];


if (!CustomerId) {
  customerInput.setCustomValidity("Lütfen bir müşteri seçin.");
  customerInput.reportValidity(); // ✨ Uyarıyı göster
  customerInput.classList.add("is-invalid");
  return;
} else {
  customerInput.setCustomValidity("");
  customerInput.classList.remove("is-invalid");
}
const productInputEl = inputs[0]; // 🔥 burası eksikti
    if (!ProductId) {
        productInputEl.setCustomValidity("Lütfen bir ürün seçin.");
        productInputEl.reportValidity(); // ✨ Uyarıyı göster
        productInputEl.classList.add("is-invalid");
      return;
    }else {
  productInputEl.setCustomValidity("");
  productInputEl.classList.remove("is-invalid");
}
if (!quantity || quantity < 1) {
  inputs[1].setCustomValidity("Lütfen adet girin.");
  inputs[1].reportValidity();
  return;
} else {
  inputs[1].setCustomValidity("");
}
const paymentSelect = addProductForm.paymentMethod;
const userSelect = addProductForm.UserId;

let formIsValid = true;

// 🔴 Ödeme yöntemi seçilmemişse
if (!paymentSelect.value) {
  paymentSelect.setCustomValidity("Lütfen bir ödeme yöntemi seçin.");
  paymentSelect.classList.add("is-invalid");
  formIsValid = false;
} else {
  paymentSelect.setCustomValidity("");
  paymentSelect.classList.remove("is-invalid");
}

// 🔴 Personel seçilmemişse
if (!userSelect.value) {
  userSelect.setCustomValidity("Lütfen bir personel seçin.");
  userSelect.classList.add("is-invalid");
  formIsValid = false;
} else {
  userSelect.setCustomValidity("");
  userSelect.classList.remove("is-invalid");
}

if (!formIsValid) {
  paymentSelect.reportValidity();
  userSelect.reportValidity();
  return; // işlemi durdur
}

    

try {
  await axios.post("http://localhost:5001/api/sale-products", {
    ProductId,
    quantity,
    price,
    UserId,
    CustomerId,
    SaleId: null,
    paymentMethod,
    notes,
    saleDate,
    paymentCollected
  }, axiosConfig);
} catch (err) {
  if (err.response && err.response.status === 409) {
    // 🔐 Modal'a geçici veriyi sakla
    pendingForceData = {
      ProductId,
      quantity,
      price,
      UserId,
      CustomerId,
      SaleId: null,
      paymentMethod,
      notes,
      saleDate,
      paymentCollected
    };
    stockWarningModal.show();
    await new Promise(resolve => window._resolveForceModal = resolve); // modal sonucu beklet
    if (!pendingForceData) continue; // kullanıcı iptal ettiyse bu satırı atla
    await axios.post("http://localhost:5001/api/sale-products", {
      ...pendingForceData,
      force: true
    }, axiosConfig);
    pendingForceData = null;
  } else {
    console.error("Satış hatası:", err);
    alert("Satış yapılamadı. Lütfen tekrar deneyin.");
    return;
  }
}


  }

  addProductForm.reset();
  addModal.hide();
  loadProductSales();

  // ✅ Toast mesajı
Swal.fire({
  toast: true,
  position: "top-end",
  icon: "success",
  title: "Ürün satışı başarıyla kaydedildi!",
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

// 🌟 Ürün düzenleme modalı
async function openEditModal(id) {
  const [res, usersRes, customersRes] = await Promise.all([
    axios.get(`http://localhost:5001/api/sale-products/single/${id}`, axiosConfig),
    axios.get("http://localhost:5001/api/users", axiosConfig),
    axios.get("http://localhost:5001/api/customers", axiosConfig)
  ]);

  const productSale = res.data;

  // Satış ID
  document.getElementById("editProductId").value = productSale.id;

  // Adet
  document.getElementById("editQuantity").value = productSale.quantity;

  // Notlar
  document.getElementById("editNotes").value = productSale.notes || "";

  // Ödeme Yöntemi
  // Ödeme Yöntemi
const paymentMethodValue = (productSale.paymentMethod || "").toLowerCase();
const paymentSelect = document.getElementById("editPaymentMethod");
const options = paymentSelect.options;

let matched = false;
for (let i = 0; i < options.length; i++) {
  if (options[i].textContent.toLowerCase() === paymentMethodValue) {
    paymentSelect.selectedIndex = i;
    matched = true;
    break;
  }
}
if (!matched) {
  paymentSelect.selectedIndex = 0;
}


  // Personel listesi
  const editUserSelect = document.getElementById("editUserSelect");
  editUserSelect.innerHTML = usersRes.data
    .map(u => `<option value="${u.id}">${u.name}</option>`)
    .join("");
  editUserSelect.value = productSale.UserId;

  // Müşteri alanı
  const editCustomerInput = document.getElementById("editCustomerInput");
  editCustomerInput.value = productSale.Customer?.name || "";

  // Müşteri autocomplete listesi
  window.editCustomerMap = {};
  customersRes.data.forEach(c => {
    window.editCustomerMap[c.name] = c.id;
  });

  // Modalı göster
  editModal.show();
}



// 🌟 Satışı güncelle
editProductForm.addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(editProductForm).entries());
  const CustomerId = window.editCustomerMap[document.getElementById("editCustomerInput").value.trim()] || null;

  if (!CustomerId) {
    alert("Lütfen geçerli bir müşteri seçin.");
    return;
  }

  data.CustomerId = CustomerId;

  await axios.put(`http://localhost:5001/api/sale-products/${data.id}`, data, axiosConfig);
  editModal.hide();
  loadProductSales();
});


document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
  if (!selectedDeleteId) return;

  try {
    await axios.delete(`http://localhost:5001/api/sale-products/${selectedDeleteId}`, axiosConfig);
    selectedDeleteId = null;

    // Modalı kapat
    const modal = bootstrap.Modal.getInstance(document.getElementById("deleteSaleModal"));
    modal.hide();

    // Listeyi yenile
    loadProductSales();
  } catch (err) {
    console.error("Silme hatası:", err);
  }
});

// 🌟 Yeni ürün satırı ekle
function addProductRow() {
  const container = document.getElementById("productItems");
  const row = document.createElement("div");
  row.className = "d-flex gap-2 align-items-center mb-2";
  row.innerHTML = `
    <input type="text" class="form-control product-search-input" placeholder="Ürün adı veya barkoduyla arayın" required autocomplete="off" />
    <input type="number" class="form-control quantity-input" placeholder="0" style="width: 70px;" required />
    <span>ad</span>
    <input type="number" class="form-control price-input" placeholder="Tutar" style="width: 120px;" required />
    <span>TL</span>
    <button type="button" class="btn btn-danger" onclick="removeProductRow(this)">🗑️</button>
  `;
  container.appendChild(row);

  // ✅ Yeni eklenen satırdaki inputları seç ve bind işlemini uygula
  const productInput = row.querySelector(".product-search-input");
  const priceInput = row.querySelector(".price-input");
  bindProductAutocomplete(productInput, priceInput);
}

// 🌟 Satırı sil
function removeProductRow(btn) {
  btn.parentElement.remove();
}

// 🌟 Takvim ve müşteri
document.addEventListener("DOMContentLoaded", () => {
  // 📅 Takvim kur
  const fp = flatpickr("#saleDate", {
    dateFormat: "d.m.Y",
    position: "auto right",
    defaultDate: new Date(),
    clickOpens: false
  });

  document.getElementById("calendarTrigger").addEventListener("click", () => fp.open());

  // 📦 Ürün satışlarını yükle
  loadProductSales();
  window.openAddProductModal = openAddProductModal;

  // ✅ Ödeme yöntemi seçildiğinde uyarıyı temizle
  const paymentSelect = addProductForm.paymentMethod;
  paymentSelect.addEventListener("change", () => {
    paymentSelect.setCustomValidity("");
    paymentSelect.classList.remove("is-invalid");
  });

  // (İsteğe bağlı) Personel seçimi için uyarı temizleme
  const userSelect = addProductForm.UserId;
  userSelect.addEventListener("change", () => {
    userSelect.setCustomValidity("");
    userSelect.classList.remove("is-invalid");
  });

  // İlk ürün satırındaki autocomplete bağlama (zaten vardı)
  const firstProductInput = document.querySelector("#productItems .product-search-input");
  const firstPriceInput = document.querySelector("#productItems .price-input");
  if (firstProductInput && firstPriceInput) {
    bindProductAutocomplete(firstProductInput, firstPriceInput);
  }
});
// 🌟 Müşteri autocomplete
customerInput.addEventListener("input", () => {
    customerInput.setCustomValidity("");
  customerInput.classList.remove("is-invalid");
  const val = customerInput.value.toLowerCase();
  customerDropdown.innerHTML = "";
  if (val.length < 3) {
    customerDropdown.style.display = "none";
    return;
  }


  
  const filtered = customers.filter(c => c.name.toLowerCase().includes(val));
  filtered.forEach(c => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "list-group-item list-group-item-action";
    option.textContent = `${c.name} • ${c.phone || ""}`;
    option.addEventListener("click", () => {
      customerInput.value = c.name;
      customerMap[c.name] = c.id;
      customerDropdown.innerHTML = "";
      customerDropdown.style.display = "none";
    });
    customerDropdown.appendChild(option);
  });

  customerDropdown.style.display = "block";
});

// 🌟 Dış tıklamada müşteri dropdown kapanır
document.addEventListener("click", e => {
  if (!customerDropdown.contains(e.target) && e.target !== customerInput) {
    customerDropdown.style.display = "none";
  }
});
  const firstProductInput = document.querySelector("#productItems .product-search-input");
  const firstPriceInput = document.querySelector("#productItems .price-input");
  if (firstProductInput && firstPriceInput) {
    bindProductAutocomplete(firstProductInput, firstPriceInput);
  }

  // 🌟 Modal butonları kontrolü (sayfanın en altına koyabilirsin)
document.getElementById("confirmForceSale").addEventListener("click", () => {
  stockWarningModal.hide();
  if (window._resolveForceModal) window._resolveForceModal(true);
});

document.getElementById("cancelForceSale").addEventListener("click", () => {
  stockWarningModal.hide();
  pendingForceData = null;
  if (window._resolveForceModal) window._resolveForceModal(false);
});
