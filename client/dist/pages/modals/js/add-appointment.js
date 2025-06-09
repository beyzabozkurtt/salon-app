const selectedServices = [];
let isHizmetEkleListenerBound = false;
let oncekiCustomerId = null;

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

async function handleAppointmentCreate(e) {
  e.preventDefault();

  const tekrarSayisi = parseInt(document.getElementById("tekrarSayisi")?.value || "0");
  const tekrarSikligi = parseInt(document.getElementById("tekrarSikligi")?.value || "0");

  const customerId = document.getElementById("customerIdHidden")?.value;
  const date = document.getElementById("appointmentDate")?.value;
  const startTime = document.getElementById("startTime")?.value;
  const endTime = document.getElementById("endTime")?.value;
  const notes = document.getElementById("notesInput")?.value || "";
  const hizmet = document.getElementById("hizmetSelect")?.value;
  const personel = document.getElementById("hizmetPersonelInput")?.value;
  const fiyat = document.getElementById("fiyatInput")?.value;
  const tekrarlayanMi = document.getElementById("repeatSwitch")?.checked;
  const paketId = document.getElementById("paketSelect")?.value;
  const paketPersonelId = document.getElementById("paketPersonelInput")?.value;

  if (!customerId) return alert("Lütfen bir müşteri seçin.");
  if (!date || !startTime || !endTime) return alert("Tarih ve saat boş olamaz.");

  const startISO = new Date(`${date.split(".").reverse().join("-")}T${startTime}`).toISOString();
  const endISO = new Date(`${date.split(".").reverse().join("-")}T${endTime}`).toISOString();

  const token = localStorage.getItem("companyToken");
  const config = { headers: { Authorization: "Bearer " + token } };

  const allRequestsToCheck = [];

  // 1. Paketli tekrarlar
  if (tekrarlayanMi && paketId && paketPersonelId) {
    try {
      const sessionRes = await axios.get(`http://localhost:5001/api/appointments/by-customer/${customerId}/package-usage`, config);
      const saleAppointments = sessionRes.data.filter(a => a.SaleId === Number(paketId));
      let sessionNumber = saleAppointments.length + 1;

      for (let i = 0; i <= tekrarSayisi; i++) {
        const start = new Date(`${date.split(".").reverse().join("-")}T${startTime}`);
        const end = new Date(`${date.split(".").reverse().join("-")}T${endTime}`);
        start.setDate(start.getDate() + i * tekrarSikligi);
        end.setDate(end.getDate() + i * tekrarSikligi);

        allRequestsToCheck.push({
          type: "paket",
          payload: {
            SaleId: paketId,
            CustomerId: customerId,
            UserId: paketPersonelId,
            date: start.toISOString(),
            endDate: end.toISOString(),
            sessionNumber,
            notes
          }
        });
        sessionNumber++;
      }
    } catch (err) {
      console.error("🔍 Paket seans kontrol hatası:", err);
      return alert("Paket bilgisi alınırken hata oluştu.");
    }
  }

  // 2. Hizmetli (tek seferlik) randevular
  const allServices = [...selectedServices];
  if (!tekrarlayanMi && hizmet && personel && fiyat) {
    allServices.push({ SingleServiceId: hizmet, UserId: personel, price: fiyat });
  }

  for (const s of allServices) {
    allRequestsToCheck.push({
      type: "hizmet",
      payload: {
        CustomerId: customerId,
        UserId: s.UserId,
        SingleServiceId: s.SingleServiceId,
        price: s.price,
        date: startISO,
        endDate: endISO,
        notes
      }
    });
  }

  if (allRequestsToCheck.length === 0) {
    return alert("Lütfen en az bir hizmet veya paket seçin.");
  }

  // 3. Tüm randevular için çakışma kontrolü
  for (const item of allRequestsToCheck) {
    const kontrolRes = await axios.post("http://localhost:5001/api/appointments/check-overlaps", {
      CustomerId: item.payload.CustomerId,
      UserId: item.payload.UserId,
      date: item.payload.date,
      endDate: item.payload.endDate
    }, config);

    if (kontrolRes.data.personelOverlap) {
      return alert("❌ En az bir randevu personel ile çakışıyor. Lütfen tarih ve saatleri kontrol edin.");
    }
  }

  // 4. Tüm randevuları sırayla kaydet
  try {
    for (const item of allRequestsToCheck) {
      if (item.type === "paket") {
        await axios.post("http://localhost:5001/api/appointments/from-package", {
          SaleId: item.payload.SaleId,
          CustomerId: item.payload.CustomerId,
          date: item.payload.date,
          endDate: item.payload.endDate,
          notes: item.payload.notes
        }, config);
      }

      if (item.type === "hizmet") {
        await axios.post("http://localhost:5001/api/salesingleservices", {
          SingleServiceId: item.payload.SingleServiceId,
          price: parseFloat(item.payload.price),
          CustomerId: item.payload.CustomerId,
          UserId: item.payload.UserId,
          date: item.payload.date,
          endDate: item.payload.endDate,
          notes: item.payload.notes
        }, config);
      }
    }

    alert("✅ Randevular başarıyla oluşturuldu.");
    bootstrap.Modal.getInstance(document.getElementById("appointmentModal"))?.hide();
    window.location.reload();

  } catch (err) {
    console.error("❌ Oluşturma hatası:", err);
    alert("❌ Randevular oluşturulurken hata oluştu.");
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
const hizmetSelectBox = document.getElementById("hizmetSelect");
const personelSelectBox = document.getElementById("hizmetPersonelInput");

const hizmetText = hizmetSelectBox.options[hizmetSelectBox.selectedIndex]?.textContent;
const personelText = personelSelectBox.options[personelSelectBox.selectedIndex]?.textContent;

info.innerHTML = `
  <strong>Hizmet:</strong> ${hizmetText} |
  <strong>Personel:</strong> ${personelText} |
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
  const currentId = selected?.id || "";

  customerIdInput.value = currentId;

  if (currentId && currentId !== oncekiCustomerId) {
    oncekiCustomerId = currentId;
    doldurMusteriPaketleri(currentId);
  }
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
export async function doldurMusteriPaketleri(customerId) {
  const paketSelect = document.getElementById("paketSelect");
  if (!paketSelect) return;

  paketSelect.innerHTML = `<option value="" selected hidden>Paket</option>`;
  if (!customerId) return;

  const token = localStorage.getItem("companyToken");
  const config = { headers: { Authorization: "Bearer " + token } };

  try {
    // 1. Tüm satışları al
    const paketRes = await axios.get(`http://localhost:5001/api/customers/${customerId}/packages`, config);
    const paketler = paketRes.data;

    // 2. Paket kullanım bilgilerini al
    const usageRes = await axios.get(`http://localhost:5001/api/appointments/by-customer/${customerId}/package-usage`, config);
    const kullanilanRandevular = usageRes.data;

    paketler.forEach(paket => {
      const totalSeans = paket.session || 0;
      const kullanilan = kullanilanRandevular.filter(r => r.SaleId === paket.saleId).length;
      const kalanSeans = totalSeans - kullanilan;

      // ❗ Sadece kalan seansı olan paketleri göster
      if (kalanSeans > 0) {
        const opt = document.createElement("option");
        const serviceName = paket?.name || paket?.Service?.name || "Hizmet Adı Eksik";
        opt.value = paket.saleId;
        opt.textContent = `${serviceName} | ${kalanSeans} seans kaldı`;

        if (paket?.serviceId) {
          opt.dataset.serviceid = paket.serviceId;
        }

        paketSelect.appendChild(opt);
      }
    });
  } catch (err) {
    console.error("❌ Paketler alınamadı:", err);
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
