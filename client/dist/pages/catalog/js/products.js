const list = document.getElementById("productList");
const form = document.getElementById("productForm");
const modal = new bootstrap.Modal(document.getElementById("productModal"));
const token = localStorage.getItem("companyToken");
const axiosConfig = { headers: { Authorization: "Bearer " + token } };

// Ürünleri Yükle
async function loadProducts() {
  try {
    const res = await axios.get("http://localhost:5001/api/products", axiosConfig);
    list.innerHTML = "";

    if (res.data.length === 0) {
      list.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">Henüz ürün eklenmedi</td></tr>`;
      return;
    }

    res.data.sort((a, b) => a.name.localeCompare(b.name));

    res.data.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${Number(p.price).toFixed(2)} ₺</td>
        <td>${p.stock || 0}</td>
        <td>${p.barcode || "-"}</td>
        <td class="text-nowrap text-center" style="width: 100px;">
          <div class="d-flex justify-content-center align-items-center">
            <button class="btn btn-sm btn-light border me-1 d-flex align-items-center justify-content-center"
              onclick='editProduct(${JSON.stringify(p)})' title="Düzenle">
              <i class="bi bi-pencil text-primary fs-6"></i>
            </button>
            <button class="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
              onclick="deleteProduct(${p.id})" title="Sil">
              <i class="bi bi-trash text-danger fs-6"></i>
            </button>
          </div>
        </td>
      `;
      list.appendChild(tr);
    });
  } catch (err) {
    alert("❌ Ürünler yüklenemedi!");
    console.error(err);
  }
}

// Ürün Sil
async function deleteProduct(id) {
  if (confirm("Bu ürünü silmek istiyor musunuz?")) {
    try {
      await axios.delete(`http://localhost:5001/api/products/${id}`, axiosConfig);
      loadProducts();
    } catch (err) {
      alert("❌ Silme işlemi başarısız!");
      console.error(err);
    }
  }
}

// Ürün Ekle/Güncelle
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const id = data.id;

  data.price = parseFloat(data.price);
  data.stock = parseInt(data.stock);

  try {
    if (id) {
      await axios.put(`http://localhost:5001/api/products/${id}`, data, axiosConfig);
    } else {
      await axios.post("http://localhost:5001/api/products", data, axiosConfig);
    }
    form.reset();
    modal.hide();
    loadProducts();
  } catch (err) {
    alert("❌ Kayıt başarısız!");
    console.error(err);
  }
});

// Modal Aç – Yeni
function openCreateModal() {
  form.reset();
  form.id.value = "";
  document.getElementById("productModalTitle").textContent = "Yeni Ürün";
  modal.show();
}

// Modal Aç – Güncelle
function editProduct(product) {
  form.id.value = product.id;
  form.name.value = product.name;
  form.price.value = product.price;
  form.stock.value = product.stock || 0;
  form.barcode.value = product.barcode || "";
  document.getElementById("productModalTitle").textContent = "Ürünü Düzenle";
  modal.show();
}

// 🔍 Arama Kutusu
document.getElementById("productSearchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const rows = document.querySelectorAll("#productList tr");
  rows.forEach(row => {
    const name = row.querySelector("td")?.textContent.toLowerCase() || "";
    row.style.display = name.includes(searchTerm) ? "" : "none";
  });
});

loadProducts();
