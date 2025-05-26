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

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.phone = convertedPhone;

  try {
    await axios.post("http://localhost:5001/api/customers", data, axiosConfig);
    form.reset();
    bootstrap.Modal.getInstance(document.getElementById("createModal")).hide();
    const event = new Event("customers-updated");
    window.dispatchEvent(event);
  } catch (err) {
    alert("Müşteri eklenirken hata oluştu.");
    console.error(err);
  }
};

// 💥 Bu fonksiyonu ihraç etmezsen modal çalışmaz
export function init() {
  const form = document.getElementById("customerForm");
  if (form) {
    form.addEventListener("submit", window.createCustomer);
  }
}
