let calendar;
let flatpickrInstance;

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const dateInput = document.getElementById("datePicker");

  // Flatpickr başlat
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
  datesSet: function () {
  const selectedDate = calendar.getDate();
  flatpickrInstance.setDate(selectedDate, false);
  updateCustomHeader(selectedDate); // başlığı güncelle
}

  });

  calendar.render();

  // Geri (←) butonu
  document.getElementById("prevDateBtn").addEventListener("click", () => {
    calendar.prev();
    flatpickrInstance.setDate(calendar.getDate(), false);
  });

  // İleri (→) butonu
  document.getElementById("nextDateBtn").addEventListener("click", () => {
    calendar.next();
    flatpickrInstance.setDate(calendar.getDate(), false);
  });

  // Bugün butonu
  document.getElementById("goToday").addEventListener("click", () => {
    calendar.today();
    flatpickrInstance.setDate(calendar.getDate(), false);
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
function updateCustomHeader(date) {
  const headerEl = document.getElementById("customHeader");
  const options = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
  const formatted = new Intl.DateTimeFormat('tr-TR', options).format(date);
  headerEl.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}