let calendar;
let flatpickrInstance;

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const dateInput = document.getElementById("datePicker");

  // FullCalendar başlat
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
    events: [],
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    firstDay: 1,
dayHeaderContent: function(arg) {
  const currentView = calendar.view.type;

  if (currentView === 'dayGridMonth') {
    // 🔥 Sadece gün adı (Pazartesi, Salı...) yaz
    const gun = new Intl.DateTimeFormat('tr-TR', {
      weekday: 'long'
    }).format(arg.date);

    return {
      html: `<div style="text-align: center;font-weight: 600; font-size:14px;">${gun.charAt(0).toUpperCase() + gun.slice(1)}</div>`
    };
  }

  if (currentView === 'timeGridWeek') {
    const tarih = new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(arg.date);

    const gun = new Intl.DateTimeFormat('tr-TR', {
      weekday: 'long'
    }).format(arg.date);

    return {
      html: `
        <div style="display: flex; flex-direction: column; text-align: center; line-height: 1.2;">
          <span style="font-weight: 600; font-size:14px;">${tarih}</span>
          <span style="font-weight: 400;font-size:14px;">${gun.charAt(0).toUpperCase() + gun.slice(1)}</span>
        </div>
      `
    };
  }

  // Gün görünümü
  const tarih = new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(arg.date);

  const gun = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long'
  }).format(arg.date);

  return {
    html: `<div>${tarih} / ${gun.charAt(0).toUpperCase() + gun.slice(1)}</div>`
  };
},

    datesSet: function () {
      const selectedDate = calendar.getDate();
      if (flatpickrInstance) {
        flatpickrInstance.setDate(selectedDate, false);
      }
      updateCustomHeader(selectedDate);
        // 🔥 Sadece ay görünümünde Mayıs 2025 başlığı göster
  const viewType = calendar.view.type;
  const header = document.getElementById("monthHeader");

 if (header) {
  if (viewType === "dayGridMonth") {
    const ay = new Intl.DateTimeFormat('tr-TR', { month: 'long' }).format(selectedDate);
    const yil = new Intl.DateTimeFormat('tr-TR', { year: 'numeric' }).format(selectedDate);

    header.innerHTML = `${ay.charAt(0).toUpperCase() + ay.slice(1)}, ${yil}`;
  } else {
    header.innerHTML = ""; // Diğer görünümlerde gizle
  }
}
    }
  });

  calendar.render();

  // Flatpickr başlat (calendar render edildikten sonra)
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

  // Geri (←) butonu
  document.getElementById("prevDateBtn").addEventListener("click", () => {
    calendar.prev();
  });

  // İleri (→) butonu
  document.getElementById("nextDateBtn").addEventListener("click", () => {
    calendar.next();
  });

  // Bugün butonu
  document.getElementById("goToday").addEventListener("click", () => {
    calendar.today();
  });

  // Görünüm dropdown (Gün / Hafta / Ay)
  document.querySelectorAll('.dropdown-item[data-view]').forEach(item => {
    item.addEventListener('click', function () {
      const view = this.getAttribute('data-view');
      calendar.changeView(view);
      document.getElementById('viewDropdown').textContent = this.textContent;
    });
  });

  // Takvim ikonuna tıklama
  const calendarIcon = document.querySelector(".bi-calendar3");
  if (calendarIcon) {
    calendarIcon.addEventListener("click", () => {
      dateInput.focus();
    });
  }
});

// Tarih başlığını güncelle
function updateCustomHeader(date) {
  const headerEl = document.getElementById("customHeader");
  if (!headerEl) return;
  const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
  const formatted = new Intl.DateTimeFormat('tr-TR', options).format(date);
  headerEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
