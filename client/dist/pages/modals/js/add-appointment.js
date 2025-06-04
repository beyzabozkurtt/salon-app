const selectedServices = [];
let isHizmetEkleListenerBound = false;

let isListenerBound = false;
export function init() {
  setupCustomerAutocomplete();
  doldurTekSeferlikHizmetler();
  doldurPersoneller();
  initFlatpickrs();
  setupTabs();
  setupHizmetEkle();


  // Hizmet seçilince fiyatı otomatik doldur
  const hizmetSelect = document.getElementById("hizmetSelect");
  const fiyatInput = document.getElementById("fiyatInput");

  if (hizmetSelect && fiyatInput) {
    hizmetSelect.addEventListener("change", function () {
      const selectedOption = hizmetSelect.options[hizmetSelect.selectedIndex];
      const fiyat = selectedOption.dataset.fiyat;
      if (fiyat) {
        fiyatInput.value = fiyat;
      }
    });
  }
 const submitBtn = document.querySelector("#appointmentModal button.btn-success");

if (submitBtn && !isListenerBound) {
  submitBtn.addEventListener("click", handleAppointmentCreate);
  isListenerBound = true;
}

}

function initFlatpickrs() {
  flatpickr("#appointmentDate", {
    dateFormat: "d.m.Y",
    locale: "tr",
    defaultDate: new Date(),
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
}

function setupTabs() {
  const tabButtons = document.querySelectorAll("#appointmentTabs .nav-link");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab-target");
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      tabPanes.forEach(p => p.classList.remove("active"));
      document.getElementById(targetId)?.classList.add("active");
    });
  });
}

// 1. Önce fonksiyonu dışarı tanımlıyoruz:
async function handleAppointmentCreate(e) {
  e.preventDefault();

  const customerId = document.getElementById("customerIdHidden")?.value;
  const date = document.getElementById("appointmentDate")?.value;
  const startTime = document.getElementById("startTime")?.value;
  const endTime = document.getElementById("endTime")?.value;
  const notes = document.getElementById("notesInput")?.value || "";

  const hizmet = document.getElementById("hizmetSelect")?.value;
  const personel = document.getElementById("hizmetPersonelInput")?.value;
  const fiyat = document.getElementById("fiyatInput")?.value;

  if (!customerId) return alert("Lütfen bir müşteri seçin.");
  if (!date || !startTime || !endTime) return alert("Lütfen tarih ve saat bilgilerini girin.");

  const startISO = new Date(`${date.split(".").reverse().join("-")}T${startTime}`).toISOString();
  const endISO = new Date(`${date.split(".").reverse().join("-")}T${endTime}`).toISOString();

  const token = localStorage.getItem("companyToken");
  const config = { headers: { Authorization: "Bearer " + token } };

  const hizmetListesiBoşMu = !hizmet || !personel || !fiyat;

  // ❗ YENİ: Hem selectedServices'i al hem de son formdaki veriyi ekle
  const allServices = [...selectedServices];

  if (!hizmetListesiBoşMu) {
    allServices.push({
      SingleServiceId: hizmet,
      UserId: personel,
      price: fiyat
    });
  }

  if (allServices.length === 0) {
    return alert("Lütfen en az bir hizmet girin.");
  }

  // ❗ ÇAKIŞMA KONTROLLERİ
  for (const s of allServices) {
    const kontrolUrl = `http://localhost:5001/api/appointments/check-overlaps`;

    const kontrolParams = {
      CustomerId: customerId,
      UserId: s.UserId,
      date: startISO,
      endDate: endISO
    };

    if (s.SingleServiceId) kontrolParams.SingleServiceId = s.SingleServiceId;
    if (s.ServiceId) kontrolParams.ServiceId = s.ServiceId;

    try {
      const kontrol = await axios.post(kontrolUrl, kontrolParams, config);
      const result = kontrol.data;

      if (result.customerOverlap) {
        return alert("❌ Bu müşteri bu saat aralığında aynı hizmetten zaten randevu almış.");
      }

      if (result.personelOverlap) {
        return alert("❌ Seçilen personelin bu saat aralığında başka bir randevusu var.");
      }

    } catch (err) {
      console.error("❌ Randevu çakışma kontrolü hatası:", err);
      alert("Randevu çakışma kontrolü sırasında bir hata oluştu.");
      return;
    }
  }

  // 🔄 KAYIT İŞLEMİ
  try {
    for (const s of allServices) {
      await axios.post("http://localhost:5001/api/salesingleservices", {
        SingleServiceId: s.SingleServiceId,
        price: parseFloat(s.price),
        CustomerId: customerId,
        UserId: s.UserId,
        date: startISO,
        endDate: endISO,
        notes
      }, config);
    }

    alert("✅ Randevu başarıyla oluşturuldu!");
    bootstrap.Modal.getInstance(document.getElementById("appointmentModal"))?.hide();
    window.location.reload();

  } catch (err) {
    console.error("❌ Oluşturma hatası:", err);
    alert("Bir hata oluştu. Lütfen tekrar deneyin.");
  }
}




function setupHizmetEkle() {
  const hizmetEkleBtn = document.getElementById("hizmetEkleBtn");
  const hizmetListesi = document.getElementById("hizmetListesi");

  if (hizmetEkleBtn && hizmetListesi && !isHizmetEkleListenerBound) {
    isHizmetEkleListenerBound = true;

    hizmetEkleBtn.addEventListener("click", () => {
      const hizmet = document.getElementById("hizmetSelect").value;
      const personel = document.getElementById("hizmetPersonelInput").value;
      const fiyat = document.getElementById("fiyatInput").value;

      // Eğer boşsa ekleme yapma!
      if (!hizmet || !personel || !fiyat) {
        return alert("Lütfen hizmet, personel ve fiyat alanlarını doldurun.");
      }

      // Dizide tut
      selectedServices.push({
        SingleServiceId: hizmet,
        UserId: personel,
        price: fiyat
      });

      // Kart yapısı
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

      // ✏️ DÜZENLE
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-outline-secondary";
      editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
      editBtn.addEventListener("click", () => {
        document.getElementById("hizmetSelect").value = hizmet;
        document.getElementById("hizmetPersonelInput").value = personel;
        document.getElementById("fiyatInput").value = fiyat;

        const index = Array.from(hizmetListesi.children).indexOf(card);
        selectedServices.splice(index, 1);
        card.remove();
      });

      // 🗑️ SİL
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-outline-danger";
      deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
      deleteBtn.addEventListener("click", () => {
        const index = Array.from(hizmetListesi.children).indexOf(card);
        selectedServices.splice(index, 1);
        card.remove();
      });

      btnGroup.appendChild(editBtn);
      btnGroup.appendChild(deleteBtn);
      card.appendChild(info);
      card.appendChild(btnGroup);

      hizmetListesi.appendChild(card);

      // Formu temizle
      document.getElementById("hizmetSelect").value = "";
      document.getElementById("hizmetPersonelInput").value = "";
      document.getElementById("fiyatInput").value = "";
    });
  }
}


export async function doldurPersoneller() {
  const token = localStorage.getItem("companyToken");
  const axiosConfig = { headers: { Authorization: "Bearer " + token } };

  try {
    const res = await axios.get("http://localhost:5001/api/users", axiosConfig);
    console.log("👥 Personel listesi:", res.data);

    const ids = ["personelInput", "hizmetPersonelInput", "paketPersonelInput"]; // Hepsi burada listelensin

    ids.forEach(id => {
      const dropdown = document.getElementById(id);
      if (!dropdown) return;

      dropdown.innerHTML = `<option value="" selected hidden>Personel</option>`;
      res.data.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name;
        dropdown.appendChild(opt);
      });
    });

  } catch (err) {
    console.error("🚫 Personel listesi alınamadı:", err);
  }
}




function setupCustomerAutocomplete() {
  const customerInput = document.getElementById("customerInput");
  const customerIdInput = document.getElementById("customerIdHidden");

  if (!customerInput || !customerIdInput || typeof Awesomplete === "undefined") {
    console.warn("Awesomplete tanımlı değil veya alanlar eksik.");
    return;
  }

  const awesomplete = new Awesomplete(customerInput, {
    minChars: 2,
    autoFirst: true,
    maxItems: 10
  });

  customerInput.addEventListener("input", async function () {
    const val = this.value.trim();
    if (val.length < 2) return;

    const token = localStorage.getItem("companyToken");
    const axiosConfig = { headers: { Authorization: "Bearer " + token } };

    try {
      const res = await axios.get(`http://localhost:5001/api/customers?search=${val}`, axiosConfig);
      const list = res.data;
      awesomplete.list = list.map(c => c.name);
      customerInput.dataset.customerList = JSON.stringify(list);
    } catch (err) {
      console.error("Müşteri verisi alınamadı", err);
    }
  });

  customerInput.addEventListener("change", () => {
    const list = JSON.parse(customerInput.dataset.customerList || "[]");
    const selected = list.find(c => c.name === customerInput.value.trim());
    customerIdInput.value = selected?.id || "";
  });
}

export async function doldurTekSeferlikHizmetler() {
  const token = localStorage.getItem("companyToken");
  if (!token) {
    console.error("❌ Token yok!");
    return;
  }

  const axiosConfig = {
    headers: { Authorization: "Bearer " + token }
  };

  try {
    const res = await axios.get("http://localhost:5001/api/single-services", axiosConfig);
    const hizmetSelect = document.getElementById("hizmetSelect");

    if (!hizmetSelect) {
      console.error("❌ hizmetSelect DOM’da bulunamadı!");
      return;
    }

    hizmetSelect.innerHTML = '<option selected hidden>Hizmet</option>';
    res.data.forEach(service => {
      const opt = document.createElement("option");
      opt.value = service.id;
      opt.textContent = service.name;
      opt.dataset.fiyat = service.price || ""; // Fiyat backend’de `price` ise
      hizmetSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("❌ API çağrısı başarısız:", err);
  }
}
// Repeat Alanlarını Yönet
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
// global olarak erişim için init'i pencereye atıyoruz
window.init = init;
