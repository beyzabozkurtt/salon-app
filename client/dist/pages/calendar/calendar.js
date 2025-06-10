import { loadPopup } from '../../utils/popupLoader.js';

let calendar;
let flatpickrInstance;
let currentFilters = {
  service: '',
  singleService: '',
  staff: '',
  customer: '',
  status: ''
};

// 🧠 FLAG: init bir defadan fazla çağrılmasın diye kontrol
let isInitCalled = false;

// 🌟 Her yerden modalı açan tek fonksiyon
document.addEventListener("click", async function (e) {
  const btn = e.target.closest("#openAppointmentModal");
  if (!btn) return;

  let modalEl = document.getElementById("appointmentModal");
  if (!modalEl) {
    await loadPopup("add-appointment");
    modalEl = document.getElementById("appointmentModal");
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  // ✅ Sadece ilk seferde init çalıştır
if (!modalEl.dataset.inited) {
  setTimeout(() => {
    window.init?.();
    modalEl.dataset.inited = "true";
  }, 50);
}
});

document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');
  const dateInput = document.getElementById("datePicker");

  if (!calendarEl) return;

  await loadPopup("add-appointment"); // Modal önceden yüklensin

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridDay',
    height: "auto",
    slotMinTime: "08:00:00",
    slotMaxTime: "22:00:00",
    editable: true,
    nowIndicator: true,
    allDaySlot: false,
    headerToolbar: false,
    locale: 'tr',
    slotDuration: '00:30:00',
    selectable: true,
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
events: async function (fetchInfo, successCallback, failureCallback) {
  try {
    const token = localStorage.getItem("companyToken");

    const queryParams = new URLSearchParams();

    if (currentFilters.service) queryParams.append("service", currentFilters.service);
    if (currentFilters.singleService) queryParams.append("singleService", currentFilters.singleService);
    if (currentFilters.staff) queryParams.append("staff", currentFilters.staff);
    if (currentFilters.customer) queryParams.append("customer", currentFilters.customer);
    if (currentFilters.status) queryParams.append("status", currentFilters.status);

    const res = await fetch(`http://localhost:5001/api/appointments?${queryParams.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();

    const events = data.map(app => ({
      id: app.id,
      title: `${app.Customer?.name || "Müşteri"} - ${app.SingleService?.name || app.Service?.name || "Hizmet"}`,
      start: app.date,
      end: app.endDate,
      backgroundColor: app.Service?.color || app.SingleService?.color || getColorByStatus(app.status),
      borderColor: app.Service?.color || app.SingleService?.color || getColorByStatus(app.status),
extendedProps: {
  status: app.status,
  notes: app.notes,
  service: app.Service?.name,
  customer: app.Customer?.name,
  personel: app.User?.name,
  SaleId: app.SaleId, // 🔥 BUNU EKLE
  price: app.SaleSingleService?.price, // Hizmet fiyatı varsa gösterebilmen için
  paymentStatus: app.SaleSingleService?.Payments?.[0]?.status || "Bilinmiyor", // 🔥 Ödeme durumu
  sessionNumber: app.sessionNumber,
  customerPhone: app.Customer?.phone, // Telefon için
  SingleService: app.SingleService,   // Paket bilgisi için
  Service: app.Service                // Hizmet bilgisi için
}
    }));

    successCallback(events);
  } catch (err) {
    console.error("Randevular yüklenemedi:", err);
    failureCallback(err);
  }
},
eventDrop: async function (info) {
  const confirmChange = confirm("Bu randevunun saatini değiştirmek istediğinize emin misiniz?");
  if (!confirmChange) {
    info.revert(); // Geri al
    return;
  }

  const token = localStorage.getItem("companyToken");

  const newStart = info.event.start;
  const newEnd = info.event.end;

  try {
    const res = await fetch(`http://localhost:5001/api/appointments/${info.event.id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        date: newStart,
        endDate: newEnd
      })
    });

    if (!res.ok) throw new Error("Güncelleme başarısız");

    const updated = await res.json();
    console.log("✅ Randevu güncellendi:", updated);
  } catch (err) {
    console.error("❌ Güncelleme hatası:", err);
    info.revert(); // Hata olursa geri al
    alert("Bir hata oluştu. Lütfen tekrar deneyin.");
  }
},
eventResize: async function (info) {
  const confirmResize = confirm("Bu randevunun süresini değiştirmek istediğinize emin misiniz?");
  if (!confirmResize) {
    info.revert(); // Değişikliği geri al
    return;
  }

  const token = localStorage.getItem("companyToken");

  const newStart = info.event.start;
  const newEnd = info.event.end;

  try {
    const res = await fetch(`http://localhost:5001/api/appointments/${info.event.id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        date: newStart,
        endDate: newEnd
      })
    });

    if (!res.ok) throw new Error("Süre güncellemesi başarısız");

    const updated = await res.json();
    console.log("⏳ Süre güncellendi:", updated);
  } catch (err) {
    console.error("❌ Süre değiştirme hatası:", err);
    info.revert();
    alert("Bir hata oluştu. Lütfen tekrar deneyin.");
  }
},
eventResize: async function (info) {
  const confirmResize = confirm("Bu randevunun süresini değiştirmek istediğinize emin misiniz?");
  if (!confirmResize) {
    info.revert(); // Değişikliği geri al
    return;
  }

  const token = localStorage.getItem("companyToken");

  const newStart = info.event.start;
  const newEnd = info.event.end;

  try {
    const res = await fetch(`http://localhost:5001/api/appointments/${info.event.id}`, {
      method: 'PUT',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        date: newStart,
        endDate: newEnd
      })
    });

    if (!res.ok) throw new Error("Süre güncellemesi başarısız");

    const updated = await res.json();
    console.log("⏳ Süre güncellendi:", updated);
  } catch (err) {
    console.error("❌ Süre değiştirme hatası:", err);
    info.revert();
    alert("Bir hata oluştu. Lütfen tekrar deneyin.");
  }
},
eventClick: function(info) {
  const event = info.event;
  const p = event.extendedProps;

  const start = new Date(event.start);
  const end = new Date(event.end);
  const durationMin = Math.floor((end - start) / 60000);
  const zaman = start.toLocaleString('tr-TR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  let html = `
    <div><strong>Müşteri:</strong> ${p.customer || '-'}</div>
    <div><strong>Telefon:</strong> ${p.customerPhone || '-'}</div>
  `;

  if (p.SaleId) {
    // 🎯 PAKETLİ randevu
    html += `
      <div><strong>Paket:</strong> ${p.Service?.name || '-'}</div>   
      <div><strong>Seans:</strong> ${p.sessionNumber || '-'}</div>
      <div><strong>Zaman:</strong> ${zaman}</div>
      <div><strong>Süre:</strong> ${durationMin} dakika</div>
    `;
  } else {
    // 🎯 TEK HİZMET randevu
    html += `
      <div><strong>Hizmet:</strong> ${p.SingleService?.name || '-'}</div>      
      <div><strong>Zaman:</strong> ${zaman}</div>
      <div><strong>Süre:</strong> ${durationMin} dakika</div>
      <div><strong>Fiyat:</strong> ${p.price || 0} TL</div>
      <div><strong>Ödeme Durumu:</strong> ${p.paymentStatus || 'Bilinmiyor'}</div>
    `;
  }

  html += `
    <div><strong>Personel:</strong> ${p.personel || '-'}</div>
    <div><strong>Durum:</strong> ${p.status || '-'}</div>
    <div><strong>Notlar:</strong> ${p.notes || '-'}</div>
  `;

  document.getElementById("appointmentDetailContent").innerHTML = html;
  const modal = new bootstrap.Modal(document.getElementById("appointmentDetailModal"));
  modal.show();
},




    dateClick: function(info) {
      const selectedDate = info.date;
      const currentView = calendar.view.type;
      if (currentView === 'dayGridMonth' || currentView === 'timeGridWeek') {
        calendar.changeView('timeGridDay', selectedDate);
        return;
      }

      if (flatpickrInstance) {
        flatpickrInstance.setDate(selectedDate, true);
      }

      const startTimeInput = document.getElementById("startTime");
      const endTimeInput = document.getElementById("endTime");

      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');

      const startTime = `${hours}:${minutes}`;
      const endDate = new Date(selectedDate.getTime() + 30 * 60000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

      startTimeInput.value = startTime;
      endTimeInput.value = endTime;

      const modalEl = document.getElementById("appointmentModal");
      const modal = new bootstrap.Modal(modalEl);
      modal.show();

      // ✅ Sadece ilk seferde init çalıştır
if (!modalEl.dataset.inited) {
  setTimeout(() => {
    window.init?.();
    modalEl.dataset.inited = "true";
  }, 50);
}
    },
    dayHeaderContent: function(arg) {
      const currentView = calendar.view.type;
      const tarih = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(arg.date);
      const gun = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(arg.date);
      return {
        html: `<div style="text-align: center;font-weight: 600; font-size:14px;">${tarih} / ${gun.charAt(0).toUpperCase() + gun.slice(1)}</div>`
      };
    },
    datesSet: function () {
      const selectedDate = calendar.getDate();
      if (flatpickrInstance) {
        flatpickrInstance.setDate(selectedDate, false);
      }
      updateCustomHeader(selectedDate);
      const viewType = calendar.view.type;
      const header = document.getElementById("monthHeader");

      if (header) {
        if (viewType === "dayGridMonth") {
          const ay = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(selectedDate);
          const yil = new Intl.DateTimeFormat('tr-TR', { year: 'numeric' }).format(selectedDate);
          header.innerHTML = `${ay.charAt(0).toUpperCase() + ay.slice(1)}, ${yil}`;
        } else {
          header.innerHTML = "";
        }
      }
    }
  });

  calendar.render();

  flatpickrInstance = flatpickr(dateInput, {
    dateFormat: "d.m.Y",
    defaultDate: new Date(),
    locale: "tr",
    onChange: function (selectedDates) {
      if (selectedDates.length > 0) {
        calendar.gotoDate(selectedDates[0]);
      }
    }
  });

  document.getElementById("prevDateBtn")?.addEventListener("click", () => {
    calendar.prev();
  });

  document.getElementById("nextDateBtn")?.addEventListener("click", () => {
    calendar.next();
  });

  document.getElementById("goToday")?.addEventListener("click", () => {
    calendar.today();
  });

  document.querySelectorAll('.dropdown-item[data-view]').forEach(item => {
    item.addEventListener('click', function () {
      const view = this.getAttribute('data-view');
      calendar.changeView(view);
      document.getElementById('viewDropdown').textContent = this.textContent;
    });
  });

  document.querySelector(".bi-calendar3")?.addEventListener("click", () => {
    dateInput.focus();
  });


async function loadServicesToDropdown() {
  try {
    const token = localStorage.getItem("companyToken");
    const res = await fetch("http://localhost:5001/api/services", {

      headers: { Authorization: `Bearer ${token}` }
    });
    const services = await res.json();

    const select = document.getElementById("filterService");
    if (!select) return;

    select.innerHTML = `<option value="">Tümü</option>`;

    services.forEach(service => {
      const option = document.createElement("option");
      option.value = service.id;
      option.textContent = service.name;
      select.appendChild(option);
    });

    const serviceInput = document.getElementById("filterServiceInput");

if (serviceInput) {
  const list = services.map(s => s.name);
  new Awesomplete(serviceInput, {
    list,
    minChars: 1,
    autoFirst: true
  });

  // Seçilen input’u karşılık gelen ID’ye bağla
serviceInput.addEventListener("awesomplete-selectcomplete", function (e) {
  e.stopPropagation(); // 👈 dropdown'ın otomatik kapanmasını engeller
 e.preventDefault();
  const selectedName = e.text.value;
  const found = services.find(s => s.name === selectedName);
  document.getElementById("filterService").value = found ? found.id : "";
});

}

  } catch (err) {
    console.error("Hizmetler yüklenemedi:", err);
  }
}

async function loadSingleServicesToDropdown() {
  try {
    const token = localStorage.getItem("companyToken");
    const res = await fetch("http://localhost:5001/api/single-services", {

      headers: { Authorization: `Bearer ${token}` }
    });
    const services = await res.json();

    const select = document.getElementById("filterSingleService");
    if (!select) return;

    select.innerHTML = `<option value="">Tümü</option>`;

    services.forEach(service => {
      const option = document.createElement("option");
      option.value = service.id;
      option.textContent = service.name;
      select.appendChild(option);
    });
    const input = document.getElementById("filterSingleServiceInput");
if (input) {
  const list = services.map(s => s.name);
  new Awesomplete(input, {
    list,
    minChars: 1,
    autoFirst: true
  });

  input.addEventListener("awesomplete-selectcomplete", function (e) {
    e.stopPropagation();
    e.preventDefault();
    const selected = e.text.value;
    const found = services.find(s => s.name === selected);
    document.getElementById("filterSingleService").value = found ? found.id : "";
  });
}

  } catch (err) {
    console.error("Hizmetler yüklenemedi:", err);
  }
}

document.getElementById("applyFilters")?.addEventListener("click", () => {
  currentFilters.service = document.getElementById("filterService").value;
  currentFilters.singleService = document.getElementById("filterSingleService").value;
  currentFilters.staff = document.getElementById("filterStaff").value;
  currentFilters.customer = document.getElementById("filterCustomer").value;
  currentFilters.status = document.getElementById("filterStatus").value;

  calendar.refetchEvents(); // takvimi yeniden yükle
});

async function loadStaffToDropdown() {
  try {
    const token = localStorage.getItem("companyToken");
    const res = await fetch("http://localhost:5001/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const users = await res.json();

    const select = document.getElementById("filterStaff");
    if (!select) return;

    select.innerHTML = `<option value="">Tümü</option>`;

    users.forEach(user => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      select.appendChild(option);
    });

    console.log("👥 Personel listesi:", users);
  } catch (err) {
    console.error("Personel verileri yüklenemedi:", err);
  }
}
async function loadCustomersToDropdown() {
  try {
    const token = localStorage.getItem("companyToken");
    const res = await fetch("http://localhost:5001/api/customers", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const customers = await res.json();

    const select = document.getElementById("filterCustomer");
    if (!select) return;

    select.innerHTML = `<option value="">Tümü</option>`;

    customers.forEach(customer => {
      const option = document.createElement("option");
      option.value = customer.id;
      option.textContent = customer.name;
      select.appendChild(option);
    });

    const input = document.getElementById("filterCustomerInput");
if (input) {
  const list = customers.map(c => c.name);
  new Awesomplete(input, {
    list,
    minChars: 1,
    autoFirst: true
  });

  input.addEventListener("awesomplete-selectcomplete", function (e) {
    e.stopPropagation();
    e.preventDefault();
    const selected = e.text.value;
    const found = customers.find(c => c.name === selected);
    document.getElementById("filterCustomer").value = found ? found.id : "";
  });
}

  } catch (err) {
    console.error("Müşteriler yüklenemedi:", err);
  }
}
document.getElementById("resetFilters")?.addEventListener("click", () => {
  // 🎯 Inputları temizle
  ["filterServiceInput", "filterSingleServiceInput", "filterCustomerInput"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // 🎯 Selectleri temizle
  ["filterService", "filterSingleService", "filterCustomer", "filterStaff", "filterStatus"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  // 🎯 Filtre nesnesini sıfırla
  currentFilters = {
    service: '',
    singleService: '',
    staff: '',
    customer: '',
    status: ''
  };

  // 🎯 Takvimi yenile
  calendar.refetchEvents();
});



loadServicesToDropdown();
loadSingleServicesToDropdown();
loadStaffToDropdown();
loadCustomersToDropdown();

});

function updateCustomHeader(date) {
  const headerEl = document.getElementById("customHeader");
  if (!headerEl) return;
  const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
  const formatted = new Intl.DateTimeFormat('tr-TR', options).format(date);
  headerEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function getColorByStatus(status) {
  switch (status) {
    case 'bekliyor': return '#0d6efd';
    case 'tamamlandı': return '#198754';
    case 'iptal': return '#dc3545';
    default: return '#6c757d';
  }
}
