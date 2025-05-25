export function init() {
  // Tarih ve Saat Seçiciler
  flatpickr("#appointmentDate", {
    dateFormat: "d.m.Y",
    locale: "tr",
  });

  flatpickr("#startTime", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    defaultDate: "12:00",
    position: "below"
  });

  flatpickr("#endTime", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    defaultDate: "12:30",
    position: "below"
  });

  // Modal Açma
  const openBtn = document.getElementById("openAppointmentModal");
  if (openBtn) {
    openBtn.addEventListener("click", () => {
      const modalEl = document.getElementById("appointmentModal");
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    });
  }

  // Repeat Switch Alanlarını Yönet
  const repeatSwitch = document.getElementById("repeatSwitch");
  const repeatFields = document.getElementById("repeatFields");
  const paketAlan = document.getElementById("paketAlan");
  const hizmetFormAlani = document.getElementById("hizmetFormAlani");

  const toggleAlanlar = (aktifMi) => {
    if (repeatFields && paketAlan && hizmetFormAlani) {
      repeatFields.style.display = aktifMi ? "flex" : "none";
      paketAlan.style.display = aktifMi ? "block" : "none";
      hizmetFormAlani.style.display = aktifMi ? "none" : "block";
    }
  };

  if (repeatSwitch && repeatFields && paketAlan && hizmetFormAlani) {
    repeatSwitch.addEventListener("change", function () {
      toggleAlanlar(this.checked);
    });
    toggleAlanlar(repeatSwitch.checked);
  }

  // Hizmet Ekleme
  const hizmetEkleBtn = document.getElementById("hizmetEkleBtn");
  const hizmetListesi = document.getElementById("hizmetListesi");

  if (hizmetEkleBtn && hizmetListesi) {
    hizmetEkleBtn.addEventListener("click", () => {
      const hizmet = document.getElementById("hizmetSelect").value;
      const personel = document.getElementById("personelInput").value;
      const fiyat = document.getElementById("fiyatInput").value;

      if (!hizmet || !personel || !fiyat) return;

      const card = document.createElement("div");
      card.className = "d-flex justify-content-between align-items-center border p-2 rounded mb-2";

      const info = document.createElement("div");
      info.innerHTML = `
        <strong>Hizmet:</strong> ${hizmet} |
        <strong>Personel:</strong> ${personel} |
        <strong>Fiyat:</strong> ${fiyat} ₺
      `;

      const btnGroup = document.createElement("div");
      btnGroup.className = "d-flex gap-2";

      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-outline-secondary";
      editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
      editBtn.addEventListener("click", () => {
        document.getElementById("hizmetSelect").value = hizmet;
        document.getElementById("personelInput").value = personel;
        document.getElementById("fiyatInput").value = fiyat;
        card.remove();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-outline-danger";
      deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
      deleteBtn.addEventListener("click", () => card.remove());

      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(deleteBtn);
      card.appendChild(info);
      card.appendChild(btnGroup);

      hizmetListesi.appendChild(card);

      // Formu temizle
      document.getElementById("hizmetSelect").value = "";
      document.getElementById("personelInput").value = "";
      document.getElementById("fiyatInput").value = "";
    });
  }
}
