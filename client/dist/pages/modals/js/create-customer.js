import Inputmask from "https://cdn.jsdelivr.net/npm/inputmask@5.0.8/dist/inputmask.es6.js";
const companyToken = localStorage.getItem("companyToken");
const axiosConfig = {
  headers: {
    Authorization: "Bearer " + companyToken,
  },
};

window.createCustomer = async function (e) {
  e.preventDefault();

  const form = e.target;
  const phoneInput = document.getElementById("phoneNumber");
  const countryCodeSelect = document.getElementById("countryCode");

  const phoneRaw = phoneInput.value.replace(/\s/g, "");
  const fullPhone = countryCodeSelect.value + phoneRaw;
  const convertedPhone = fullPhone.replace("+90", "0");
  const date = document.getElementById("birthDate")?.value;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.phone = convertedPhone;
  const birthRaw = data.birthDate;
  const parts = birthRaw.split(".");
  if (parts.length === 3) {
    data.birthDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
  }
  try {
    await axios.post("http://localhost:5001/api/customers", data, axiosConfig);
form.reset();

// Modalı kapat
const modalEl = document.getElementById("createModal");
const modalInstance = bootstrap.Modal.getInstance(modalEl);
modalInstance.hide();

// Backdrop ve body class'ını temizle
setTimeout(() => {
  document.body.classList.remove("modal-open");
  document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
}, 300);

// ✅ TOAST GÖSTER
Swal.fire({
  toast: true,
  position: "top-end",
  icon: "success",
  title: "Müşteri başarıyla eklendi!",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  background: "#d1e7dd",
  color: "#0f5132",
  didOpen: (toast) => {
    toast.style.zIndex = 99999;
  }
});

// Event dispatch
const event = new Event("customers-updated");
window.dispatchEvent(event);
  } catch (err) {
    alert("Müşteri eklenirken hata oluştu.");
    console.error(err);
  }
};
function initFlatpickrs() {
   flatpickr("#birthDate", {
    dateFormat: "d.m.Y",
    locale: "tr",
    maxDate: "today",
    allowInput: true, // ✔️ Manuel girişe izin verir
  });
  
}
function loadCountryCodes() {
  const countryCodeSelect = document.getElementById("countryCode");

  const countryCodes = [
    { name: "TR", code: "+90" },
    { name: "DE", code: "+49" },
    { name: "US", code: "+1" },
    { name: "UK", code: "+44" },
    { name: "FR", code: "+33" },
    { name: "NL", code: "+31" },
    { name: "IT", code: "+39" }
    // Diğerleri eklenebilir
  ];

  countryCodes.forEach(c => {
    const option = document.createElement("option");
    option.value = c.code;
    option.textContent = `${c.name} (${c.code})`;
    option.style.color = "#000";
    if (c.code === "+90") option.selected = true;
    countryCodeSelect.appendChild(option);
  });
}
function initPhoneMask() {
  const phoneInput = document.getElementById("phoneNumber");
  const countryCodeSelect = document.getElementById("countryCode");

  function applyMaskForCode(code) {
    let mask, placeholder;

    switch (code) {
      case "+90":
        mask = "(5##) ### ## ##"; // Türkiye: 5xx xxx xx xx
        placeholder = "_";
        break;
      case "+1":
        mask = "(###) ###-####"; // US
        placeholder = "_";
        break;
      case "+49":
        mask = "#### ### ####"; // Almanya örnek
        placeholder = "_";
        break;
      default:
        mask = "999999999999"; // Generic fallback
        placeholder = "_";
    }

    Inputmask.remove(phoneInput); // Eski maskeyi sil
Inputmask({
  mask: mask,
  placeholder: placeholder,
  showMaskOnHover: false,
  showMaskOnFocus: true,
  greedy: false,
  clearIncomplete: true,
  autoUnmask: true,
  definitions: {
    "#": {
      validator: "[0-9]",
      cardinality: 1,
      definitionSymbol: "#"
    }
  },
  onincomplete: function () {
    phoneInput.setCustomValidity("Lütfen geçerli bir telefon numarası girin");
  },
  oncomplete: function () {
    phoneInput.setCustomValidity("");
  }
}).mask(phoneInput);
  }

  applyMaskForCode(countryCodeSelect.value);

  countryCodeSelect.addEventListener("change", () => {
    phoneInput.value = "";
    applyMaskForCode(countryCodeSelect.value);
  });
}

// 💥 Bu fonksiyonu ihraç etmezsen modal çalışmaz
export function init() {
  const form = document.getElementById("customerForm");
  if (form) {
    form.removeEventListener("submit", window.createCustomer);
    form.addEventListener("submit", window.createCustomer);
  }
  document.getElementById("phoneNumber").addEventListener("keypress", function (e) {
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
});
  initFlatpickrs();
  loadCountryCodes();
  initPhoneMask();
}
