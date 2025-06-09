import { loadPopup } from '../../utils/popupLoader.js';

let calendar;
let flatpickrInstance;

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
        const res = await fetch('http://localhost:5001/api/appointments', {
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
            personel: app.User?.name
          }
        }));

        successCallback(events);
      } catch (err) {
        console.error("Randevular yüklenemedi:", err);
        failureCallback(err);
      }
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
