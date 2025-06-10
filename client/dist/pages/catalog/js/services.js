const token = localStorage.getItem("companyToken");
const axiosConfig = { headers: { Authorization: "Bearer " + token } };

const packageColors = ["#33FF57", "#3357FF", "#FF33D4", "#FF8C00", "#800080"];
const singleColors = ["#FFD700", "#A52A2A", "#00CED1", "#708090", "#8B4513"];

// 🌈 Renk seçici
function renderColorOptions(containerId, hiddenInputId, colorList, selected = "") {
  const container = document.getElementById(containerId);
  const input = document.getElementById(hiddenInputId);
  container.innerHTML = "";

  colorList.forEach(color => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "color-circle";
    btn.style.backgroundColor = color;

    if (color === selected) {
      btn.classList.add("selected");
      input.value = color;
    }

    btn.onclick = () => {
      container.querySelectorAll(".color-circle").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      input.value = color;
    };

    container.appendChild(btn);
  });

  if (!selected && colorList.length > 0) {
    input.value = colorList[0];
    container.querySelector(".color-circle").classList.add("selected");
  }
}

// 📦 Paketli Hizmetleri Yükle
async function loadPackageServices() {
  const res = await axios.get("http://localhost:5001/api/services", axiosConfig);
  const list = document.getElementById("packageServiceList");
  list.innerHTML = "";

  if (res.data.length === 0) {
    list.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-3">Henüz paket eklenmedi</td></tr>`;
    return;
  }

  res.data.sort((a, b) => a.name.localeCompare(b.name));

  res.data.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>
        <div style="width: 22px; height: 22px; border-radius: 50%; background:${s.color}; border: 1px solid #ccc;"></div>
      </td>
      <td class="text-nowrap text-center" style="width: 100px;">
      <div class="d-flex justify-content-center align-items-center">    
        <button class="btn btn-sm btn-light border me-1 d-flex align-items-center justify-content-center"
          onclick='editPackage(${JSON.stringify(s)})' title="Düzenle">
          <i class="bi bi-pencil text-primary fs-6"></i>
        </button>
        <button class="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
          onclick="deletePackageService(${s.id})" title="Sil">
          <i class="bi bi-trash text-danger fs-6"></i>
        </button>
        </div>
      </td>
    `;
    list.appendChild(tr);
  });
}



// 🕐 Tek Seferlik Hizmetleri Yükle
async function loadSingleServices() {
  const res = await axios.get("http://localhost:5001/api/single-services", axiosConfig);
  const list = document.getElementById("singleServiceList");
  list.innerHTML = "";

  if (res.data.length === 0) {
    list.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">Henüz hizmet eklenmedi</td></tr>`;
    return;
  }

  res.data.sort((a, b) => a.name.localeCompare(b.name));

  res.data.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.name}</td>
      <td>${s.price.toFixed(2)} ₺</td>
      <td>${s.duration} dk</td>
      <td>
        <div style="width: 22px; height: 22px; border-radius: 50%; background:${s.color}; border: 1px solid #ccc;"></div>
      </td>
      <td class="text-nowrap text-center" style="width: 100px;">
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-sm btn-light border me-1 d-flex align-items-center justify-content-center"
            onclick='editSingle(${JSON.stringify(s)})' title="Düzenle">
            <i class="bi bi-pencil text-primary fs-6"></i>
          </button>
          <button class="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
            onclick="deleteSingleService(${s.id})" title="Sil">
            <i class="bi bi-trash text-danger fs-6"></i>
          </button>
        </div>
      </td>
    `;
    list.appendChild(tr);
  });
}


// 📤 Paketli Hizmet Ekleme
document.getElementById("createPackageForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  await axios.post("http://localhost:5001/api/services", data, axiosConfig);
  e.target.reset();
  bootstrap.Modal.getInstance(document.getElementById("createPackageModal")).hide();
  loadPackageServices();
});

// 📤 Tek Seferlik Hizmet Ekleme
document.getElementById("createSingleForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  data.price = parseFloat(data.price);
  data.duration = parseInt(data.duration);
  await axios.post("http://localhost:5001/api/single-services", data, axiosConfig);
  e.target.reset();
  bootstrap.Modal.getInstance(document.getElementById("createSingleModal")).hide();
  loadSingleServices();
});

//düzenlenin şeyleri
document.getElementById("editPackageForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  await axios.put(`http://localhost:5001/api/services/${data.id}`, data, axiosConfig);
  bootstrap.Modal.getInstance(document.getElementById("editPackageModal")).hide();
  loadPackageServices();
});

document.getElementById("editSingleForm").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.price = parseFloat(data.price);
  data.duration = parseInt(data.duration);
  await axios.put(`http://localhost:5001/api/single-services/${data.id}`, data, axiosConfig);
  bootstrap.Modal.getInstance(document.getElementById("editSingleModal")).hide();
  loadSingleServices();
});


//düzenle fonksiyonları
function editPackage(service) {
  const form = document.getElementById("editPackageForm");
  form.id.value = service.id;
  form.name.value = service.name;
  renderColorOptions("editPackageColorOptions", "editPackageColor", packageColors, service.color);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("editPackageModal")).show();
}

function editSingle(service) {
  const form = document.getElementById("editSingleForm");
  form.id.value = service.id;
  form.name.value = service.name;
  form.price.value = service.price;
  form.duration.value = service.duration;
  renderColorOptions("editSingleColorOptions", "editSingleColor", singleColors, service.color);
  bootstrap.Modal.getOrCreateInstance(document.getElementById("editSingleModal")).show();
}


// 🗑️ Silme Fonksiyonları
async function deletePackageService(id) {
  if (confirm("Bu paketi silmek istiyor musunuz?")) {
    await axios.delete(`http://localhost:5001/api/services/${id}`, axiosConfig);
    loadPackageServices();
  }
}

async function deleteSingleService(id) {
  if (confirm("Bu hizmeti silmek istiyor musunuz?")) {
    await axios.delete(`http://localhost:5001/api/single-services/${id}`, axiosConfig);
    loadSingleServices();
  }
}
// 🔍 Paketli hizmet arama
document.getElementById("searchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const rows = document.querySelectorAll("#packageServiceList tr");
  rows.forEach(row => {
    const nameCell = row.querySelector("td");
    const name = nameCell ? nameCell.textContent.toLowerCase() : "";
    row.style.display = name.includes(searchTerm) ? "" : "none";
  });
});

// 🔍 Tek seferlik hizmet arama
document.getElementById("singleSearchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const rows = document.querySelectorAll("#singleServiceList tr");
  rows.forEach(row => {
    const nameCell = row.querySelector("td");
    const name = nameCell ? nameCell.textContent.toLowerCase() : "";
    row.style.display = name.includes(searchTerm) ? "" : "none";
  });
});


// 📦 Sayfa Yüklenince
document.addEventListener("DOMContentLoaded", () => {
  renderColorOptions("packageColorOptions", "selectedPackageColor", packageColors);
  renderColorOptions("singleColorOptions", "selectedSingleColor", singleColors);
  loadPackageServices();
  loadSingleServices();
});
const height = Math.min(window.innerHeight * 0.4, 500);
document.querySelectorAll('.scroll-container').forEach(el => {
  el.style.maxHeight = height + "px";
});
document.addEventListener("DOMContentLoaded", () => {
  const serviceTypeSelect = document.getElementById("serviceTypeSelect");
  const packageSection = document.getElementById("packageServicesSection");
  const singleSection = document.getElementById("singleServicesSection");

  // Sayfa yüklendiğinde başlangıç görünümünü ayarla
  serviceTypeSelect.value = "package";
  packageSection.style.display = "block";
  singleSection.style.display = "none";

  // Seçim değiştiğinde görünümü güncelle
  serviceTypeSelect.addEventListener("change", () => {
    if (serviceTypeSelect.value === "package") {
      packageSection.style.display = "block";
      singleSection.style.display = "none";
    } else {
      packageSection.style.display = "none";
      singleSection.style.display = "block";
    }
  });
});
