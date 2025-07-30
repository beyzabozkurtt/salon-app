// personel.js

const list = document.getElementById("userList");
const createForm = document.getElementById("userForm");
const updateForm = document.getElementById("updateForm");
const token = localStorage.getItem("companyToken");
const axiosConfig = { headers: { Authorization: "Bearer " + token } };

// Personel listele
async function loadUsers() {
  try {
    const res = await axios.get("http://localhost:5001/api/users", axiosConfig);
    renderUsers(res.data);
  } catch (err) {
    alert("Personel verileri alınamadı.");
    console.error(err);
  }
}

// Listeyi doldur
function renderUsers(users) {
  list.innerHTML = "";

  if (users.length === 0) {
    list.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-3">Kayıt bulunamadı</td></tr>`;
    return;
  }

  users.forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.phone || "-"}</td>
      <td>${u.role}</td>
      <td>${u.userGender || "-"}</td>
      <td>${u.clientGender || "-"}</td>
      <td class="text-nowrap text-center" style="width: 100px;">
        <div class="d-flex justify-content-center align-items-center">
          <button class="btn btn-sm btn-light border me-1 d-flex align-items-center justify-content-center"
            onclick='editUser(${JSON.stringify(u)})' title="Düzenle">
            <i class="bi bi-pencil text-primary fs-6"></i>
          </button>
          <button class="btn btn-sm btn-light border d-flex align-items-center justify-content-center"
            onclick='deleteUser(${u.id})' title="Sil">
            <i class="bi bi-trash text-danger fs-6"></i>
          </button>
        </div>
      </td>
    `;
    list.appendChild(tr);
  });
}
document.getElementById("searchInput").addEventListener("input", function () {
  const searchTerm = this.value.toLowerCase();
  const rows = document.querySelectorAll("#userList tr");
  rows.forEach(row => {
    const name = row.querySelector("td")?.textContent?.toLowerCase() || "";
    row.style.display = name.includes(searchTerm) ? "" : "none";
  });
});

function populateTimeDropdowns() {
  const ids = ["dayStartTime", "dayEndTime", "updateDayStartTime", "updateDayEndTime"];

  ids.forEach((id) => {
    const select = document.getElementById(id);
    if (!select) return;

    // önce eski seçenekleri temizle
    select.innerHTML = "";

    for (let hour = 8; hour <= 23; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
        const option = document.createElement("option");
        option.value = timeStr;
        option.textContent = timeStr;
        select.appendChild(option);
      }
    }
  });
}


function getWorkingHoursFromForm() {
  const days = [
    { key: "monday", label: "Pazartesi" },
    { key: "tuesday", label: "Salı" },
    { key: "wednesday", label: "Çarşamba" },
    { key: "thursday", label: "Perşembe" },
    { key: "friday", label: "Cuma" },
    { key: "saturday", label: "Cumartesi" },
    { key: "sunday", label: "Pazar" }
  ];

  return days.map(day => ({
    day: day.label,
    startTime: document.querySelector(`[name='${day.key}Start']`)?.value || null,
    endTime: document.querySelector(`[name='${day.key}End']`)?.value || null,
    isClosed: document.querySelector(`[name='${day.key}Closed']`)?.checked || false
  }));
}


// Personel oluştur
createForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const raw = Object.fromEntries(new FormData(createForm));
  raw.salary = raw.salary && !isNaN(raw.salary) ? Number(raw.salary) : null;


  const data = {
    ...raw,
    hizmetPrimTipi: raw.hizmetPrimTipi || null,
    hizmetPrimDegeri: raw.hizmetPrimDegeri || null,
    urunPrimTipi: raw.urunPrimTipi || null,
    urunPrimDegeri: raw.urunPrimDegeri || null,
    paketPrimTipi: raw.paketPrimTipi || null,
    paketPrimDegeri: raw.paketPrimDegeri || null
  };

  const workingHours = getWorkingHoursFromForm();

  try {
    // 1️⃣ Önce personeli kaydet
    const res = await axios.post("http://localhost:5001/api/users", data, axiosConfig);
    const userId = res.data.id;

    // 2️⃣ Ardından çalışma saatlerini kaydet
    await axios.post("http://localhost:5001/api/user-working-hours", {
      UserId: userId,
      workingHours
    }, axiosConfig);

    // 3️⃣ Kapat ve yenile
    bootstrap.Modal.getInstance(document.getElementById("createModal")).hide();
    createForm.reset();
    loadUsers();
  } catch (err) {
    alert("Kayıt sırasında hata oluştu.");
    console.error(err);
  }
});


// Personel güncelle
updateForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const raw = Object.fromEntries(new FormData(updateForm));
  raw.salary = raw.salary && !isNaN(raw.salary) ? Number(raw.salary) : null;


  const data = {
    ...raw,
    hizmetPrimTipi: raw.hizmetPrimTipi || null,
    hizmetPrimDegeri: raw.hizmetPrimDegeri || null,
    urunPrimTipi: raw.urunPrimTipi || null,
    urunPrimDegeri: raw.urunPrimDegeri || null,
    paketPrimTipi: raw.paketPrimTipi || null,
    paketPrimDegeri: raw.paketPrimDegeri || null
  };

  try {
    await axios.put(`http://localhost:5001/api/users/${data.id}`, data, axiosConfig);
    bootstrap.Modal.getInstance(document.getElementById("updateModal")).hide();
    loadUsers();
  } catch (err) {
    alert("Güncelleme sırasında hata oluştu.");
    console.error(err);
  }
});


// Düzenleme için modalı aç
function editUser(user) {
  updateForm.id.value = user.id;
  updateForm.name.value = user.name || "";
  updateForm.email.value = user.email || "";
  updateForm.phone.value = user.phone || "";
  updateForm.role.value = user.role || "personel";
  updateForm.userGender.value = user.userGender || "";
  updateForm.clientGender.value = user.clientGender || "";
  updateForm.salary.value = user.salary || "";

  // Yeni eklenen hak ediş bilgileri
updateForm.hizmetPrimTipi.value = user.hizmetTl != null ? 'tl' : user.hizmetYuzde != null ? 'yuzde' : "";
updateForm.hizmetPrimDegeri.value = user.hizmetTl ?? user.hizmetYuzde ?? "";
updateForm.urunPrimTipi.value = user.urunTl != null ? 'tl' : user.urunYuzde != null ? 'yuzde' : "";
updateForm.urunPrimDegeri.value = user.urunTl ?? user.urunYuzde ?? "";
updateForm.paketPrimTipi.value = user.paketTl != null ? 'tl' : user.paketYuzde != null ? 'yuzde' : "";
updateForm.paketPrimDegeri.value = user.paketTl ?? user.paketYuzde ?? "";


  // Gerekirse aktifliklerini kontrol et
  togglePrimInput(updateForm.urunPrimTipi, 'urun');
  togglePrimInput(updateForm.hizmetPrimTipi, 'hizmet');
  togglePrimInput(updateForm.paketPrimTipi, 'paket');
  workingHourArray = []; // sıfırla

  if (user.workingHours?.length) {
    user.workingHours.forEach(item => {
      workingHourArray.push({
        day: item.day,
        startTime: item.startTime,
        endTime: item.endTime
      });
    });
    renderWorkingHours("update");
  }
  bootstrap.Modal.getOrCreateInstance(document.getElementById("updateModal")).show();
}


function setPrim(form, prefix, tl, yuzde) {
  const tipi = tl != null ? 'tl' : yuzde != null ? 'yuzde' : "";
  const deger = tl != null ? tl : yuzde != null ? yuzde : "";
  form[`${prefix}PrimTipi`].value = tipi;
  form[`${prefix}PrimDegeri`].value = deger;
  form[`${prefix}PrimDegeri`].disabled = !tipi;
}


// Personel sil
async function deleteUser(id) {
  if (confirm("Silmek istiyor musun?")) {
    try {
      await axios.delete(`http://localhost:5001/api/users/${id}`, axiosConfig);
      loadUsers();
    } catch (err) {
      alert("Silme sırasında hata oluştu.");
      console.error(err);
    }
  }
}

// Komisyon ayarlarını aç/kapat
function toggleKomisyon(containerId = 'komisyonContainer') {
  const div = document.getElementById(containerId);
  div.style.display = div.style.display === "none" ? "block" : "none";
}


// Yüzdelik selectleri doldur
function populatePercentageOptions() {
  const selects = document.querySelectorAll(".percentage-select");
  selects.forEach((select) => {
    for (let i = 0; i <= 100; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `${i}%`;
      select.appendChild(option);
    }
  });
}

// Sayfa yüklendiğinde
window.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  populatePercentageOptions();
  populateTimeDropdowns();
  document.getElementById("workingHoursContainer").style.display = "none";
  document.getElementById("komisyonContainer").style.display = "none";

  const phoneInput = document.querySelector("#phoneInput");
  if (phoneInput) {
    const iti = window.intlTelInput(phoneInput, {
      initialCountry: "tr",
      preferredCountries: ["tr", "de", "us"],
      separateDialCode: true,
      utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17/build/js/utils.js",
    });

    createForm?.addEventListener("submit", () => {
      phoneInput.value = iti.getNumber();
    });
    

  }
});

function togglePrimInput(selectElement, prefix) {
  const input = document.querySelector(`input[name='${prefix}PrimDegeri']`);
  if (selectElement.value === "") {
    input.value = "";
    input.disabled = true;
  } else {
    input.disabled = false;
  }
}
function toggleWorkingHours(containerId = 'workingHoursContainer') {
  const div = document.getElementById(containerId);
  div.style.display = div.style.display === "none" ? "block" : "none";
}

let workingHourArray = [];

function addWorkingHour(mode = "create") {
  const prefix = mode === "create" ? "" : "update";

const startSelect = document.getElementById(`${prefix}DayStartTime`) || document.getElementById("dayStartTime");
const endSelect = document.getElementById(`${prefix}DayEndTime`) || document.getElementById("dayEndTime");
const checkboxes = document.querySelectorAll(`.${prefix}day-checkbox:checked`) || document.querySelectorAll(".day-checkbox:checked");


  if (!startSelect || !endSelect) {
    console.error("Başlangıç veya bitiş saati alanı bulunamadı.");
    return;
  }

  const start = startSelect.value;
  const end = endSelect.value;

  if (!checkboxes.length || !start || !end) {
    alert("Lütfen gün ve saat bilgilerini eksiksiz girin.");
    return;
  }

  checkboxes.forEach(cb => {
    const day = cb.value;
    if (workingHourArray.some(item => item.day === day)) return;

    workingHourArray.push({
      day,
      startTime: start,
      endTime: end
    });
  });

  renderWorkingHours(mode);
  clearWorkingHourInputs(mode);
}

function toggleWorkingHours(containerId = 'workingHoursContainer') {
  const div = document.getElementById(containerId);
  const other = document.getElementById("komisyonContainer");

  // Diğerini kapat
  if (other) other.style.display = "none";

  // Tıklananı aç/kapat
  div.style.display = div.style.display === "none" ? "block" : "none";
}

function toggleKomisyon(containerId = 'komisyonContainer') {
  const div = document.getElementById(containerId);
  const other = document.getElementById("workingHoursContainer");

  // Diğerini kapat
  if (other) other.style.display = "none";

  // Tıklananı aç/kapat
  div.style.display = div.style.display === "none" ? "block" : "none";
}

function resetWorkingAndKomisyonPanels(mode = "create") {
  const workingDiv = document.getElementById(mode === "create" ? "workingHoursContainer" : "updateWorkingHoursContainer");
  const komisyonDiv = document.getElementById(mode === "create" ? "komisyonContainer" : "updateKomisyonContainer");

  if (workingDiv) workingDiv.style.display = "none";
  if (komisyonDiv) komisyonDiv.style.display = "none";
}



function clearWorkingHourInputs(mode = "create") {
  const prefix = mode === "create" ? "" : "update";

  document.querySelectorAll(`.${prefix}day-checkbox`).forEach(cb => cb.checked = false);
  const selectAll = document.getElementById(`${prefix}SelectAllDays`);
  if (selectAll) selectAll.checked = false;

  const startSelect = document.getElementById(`${prefix}DayStartTime`);
  const endSelect = document.getElementById(`${prefix}DayEndTime`);
  if (startSelect) startSelect.selectedIndex = 0;
  if (endSelect) endSelect.selectedIndex = 0;
}



function renderWorkingHours(mode = "create") {
  const tbody = document.getElementById(mode === "create" ? "workingHourList" : "updateWorkingHourList");
  tbody.innerHTML = "";

  workingHourArray.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.day}</td>
      <td>${item.startTime}</td>
      <td>${item.endTime}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="removeWorkingHour(${index}, '${mode}')">Sil</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}




function updateTime(index, field, value) {
  workingHourArray[index][field] = value;
}
// Ekle: Tümünü seç kutusu işlevi
function toggleSelectAllDays(checkbox) {
  const allDayCheckboxes = document.querySelectorAll(".day-checkbox");
  allDayCheckboxes.forEach(cb => {
    cb.checked = checkbox.checked;
  });
}

function removeWorkingHour(index, mode = "create") {
  workingHourArray.splice(index, 1);
  renderWorkingHours(mode);
}

function getWorkingHoursFromForm() {
  return workingHourArray;
}

