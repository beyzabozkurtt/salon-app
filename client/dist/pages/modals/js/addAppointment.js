export function init() {
  // Flatpickr başlat
  flatpickr("#appointmentDate", {
    dateFormat: "d.m.Y",
    locale: "tr",
    minDate: "today"
  });

  flatpickr("#startTime", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true
  });

  flatpickr("#endTime", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true
  });

  // Modal açma
  const modalEl = document.getElementById("appointmentModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}
