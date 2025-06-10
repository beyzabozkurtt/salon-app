const days = ['Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz'];
let pendingSync = null; // modal için veri saklama

const token = localStorage.getItem("companyToken");

function generateTimeOptions(selected = "09:00") {
  let html = '';
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      const time = `${hour}:${minute}`;
      const selectedAttr = time === selected ? 'selected' : '';
      html += `<option value="${time}" ${selectedAttr}>${time}</option>`;
    }
  }
  return html;
}

function attachSyncListener(namePrefix) {
  const elements = document.querySelectorAll(`[name^="${namePrefix}-"]`);
  elements.forEach(el => {
    el.addEventListener('change', function () {
      const value = this.value;
      const [prefix, day] = this.name.split('-');
      pendingSync = { namePrefix, value, source: this };
      const modal = new bootstrap.Modal(document.getElementById('applyAllModal'));
      modal.show();
    });
  });
}

document.getElementById("confirmYes").addEventListener("click", () => {
  const { namePrefix, value } = pendingSync;
  const elements = document.querySelectorAll(`[name^="${namePrefix}-"]`);
  elements.forEach(el => el.value = value);
  bootstrap.Modal.getInstance(document.getElementById('applyAllModal')).hide();
});

document.getElementById("confirmNo").addEventListener("click", () => {
  bootstrap.Modal.getInstance(document.getElementById('applyAllModal')).hide();
});

days.forEach(day => {
  const container = document.getElementById('working-hours-list');
  const row = document.createElement("div");
  row.className = "row align-items-center mb-2";
  row.innerHTML = `
    <div class="col-md-1 fw-bold">${day}</div>
    <div class="col-md-2">
      <select class="form-select" name="isOpen-${day}">
        <option value="true" selected>Açık</option>
        <option value="false">Kapalı</option>
      </select>
    </div>
    <div class="col-md-2">
      <select class="form-select" name="startTime-${day}">
        ${generateTimeOptions("09:00")}
      </select>
    </div>
    <div class="col-md-2">
      <select class="form-select" name="endTime-${day}">
        ${generateTimeOptions("21:00")}
      </select>
    </div>
    <div class="col-md-2 mola-col">
      <select class="form-select" name="breakStart-${day}">
        ${generateTimeOptions("13:00")}
      </select>
    </div>
    <div class="col-md-2 mola-col">
      <select class="form-select" name="breakEnd-${day}">
        ${generateTimeOptions("14:00")}
      </select>
    </div>
  `;
  container.appendChild(row);
});

attachSyncListener("startTime");
attachSyncListener("endTime");
attachSyncListener("breakStart");
attachSyncListener("breakEnd");

let showBreaks = false;
function toggleAllBreaks() {
  showBreaks = !showBreaks;
  const all = document.querySelectorAll('.mola-col');
  all.forEach(el => {
    el.style.display = showBreaks ? 'block' : 'none';
  });
  document.querySelector('.toggle-btn').innerText = showBreaks
    ? '➖ Mola Saatlerini Gizle'
    : '➕ Mola Saatlerini Göster';
}

document.getElementById("working-hours-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const data = days.map(day => {
    return {
      day,
      isOpen: document.querySelector(`[name="isOpen-${day}"]`).value === "true",
      startTime: document.querySelector(`[name="startTime-${day}"]`).value,
      endTime: document.querySelector(`[name="endTime-${day}"]`).value,
      breakStart: document.querySelector(`[name="breakStart-${day}"]`).value,
      breakEnd: document.querySelector(`[name="breakEnd-${day}"]`).value,
    };
  });

  try {
    const response = await fetch("http://localhost:5001/api/working-hours", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    alert(result.message || "Başarıyla güncellendi.");
  } catch (err) {
    console.error("Hata:", err);
    alert("Bir hata oluştu.");
  }
});