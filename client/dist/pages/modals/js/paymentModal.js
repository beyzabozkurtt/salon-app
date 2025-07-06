// modals/paymentModal.js

window.paymentModal = (() => {
  let currentPaymentId = null;
  let odemeModal = null;

  async function open(id) {
    currentPaymentId = id;

    if (!odemeModal) {
      const modalEl = document.getElementById("odemeModal");
      if (modalEl) {
        odemeModal = new bootstrap.Modal(modalEl);
      } else {
        alert("Modal bulunamadı.");
        return;
      }
    }

    await fillDropdowns();

    const res = await fetch(`http://localhost:5001/api/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("companyToken")}`
      }
    });

    const payment = await res.json();

    document.getElementById("odemeTutari").value = payment.amount || "";
    document.getElementById("odemeTutari").readOnly = true;
    document.getElementById("odemeYontemi").value =  "";
    document.getElementById("odemePersonel").value = "";

    odemeModal.show();
  }

  async function fillDropdowns() {
    const [users, yontemler] = await Promise.all([
      fetch("http://localhost:5001/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("companyToken")}`
        }
      }).then(res => res.json()),
      Promise.resolve(["nakit", "kredi kartı", "havale", "online ödeme"])
    ]);

    const odemeYontemi = document.getElementById("odemeYontemi");
    const odemePersonel = document.getElementById("odemePersonel");

    odemeYontemi.innerHTML =
      `<option value="" disabled selected>Ödeme türü seçiniz</option>` +
      yontemler.map(y => `<option value="${y}">${y}</option>`).join("");

    odemePersonel.innerHTML =
      `<option value="" disabled selected>Personel seçiniz</option>` +
      users.map(u => `<option value="${u.id}">${u.name}</option>`).join("");

    // ✅ Kullanıcı seçim yaptığında uyarı kalksın
    odemeYontemi.addEventListener("change", () => clearValidation(odemeYontemi));
    odemePersonel.addEventListener("change", () => clearValidation(odemePersonel));
  }

  function clearValidation(field) {
    field.classList.remove("is-invalid");
    bootstrap.Tooltip.getInstance(field)?.dispose();
  }

  function showValidation(field, message) {
    field.classList.add("is-invalid");
    field.setAttribute("data-bs-toggle", "tooltip");
    field.setAttribute("title", message);
    new bootstrap.Tooltip(field).show();
  }

function showSuccessToast() {
  if (typeof Swal !== "undefined") {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Ödeme başarıyla alındı!",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: "#d1e7dd",
      color: "#0f5132",
      didOpen: (toast) => {
        toast.style.zIndex = 99999;
      }
    });
  } else {
    // fallback
    const alertBox = document.getElementById("odemeSuccessAlert");
    alertBox.classList.remove("d-none");
    setTimeout(() => alertBox.classList.add("d-none"), 2500);
  }
}



  async function odemeYap() {
    const amount = document.getElementById("odemeTutari").value;
    const paymentTypeEl = document.getElementById("odemeYontemi");
    const userIdEl = document.getElementById("odemePersonel");

    const paymentType = paymentTypeEl.value;
    const userId = userIdEl.value;

    let hasError = false;

    if (!paymentType) {
      showValidation(paymentTypeEl, "Lütfen ödeme türü seçin.");
      hasError = true;
    }

    if (!userId) {
      showValidation(userIdEl, "Lütfen bir personel seçin.");
      hasError = true;
    }

    if (hasError) return;

    await fetch(`http://localhost:5001/api/payments/pay/${currentPaymentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("companyToken")}`
      },
      body: JSON.stringify({ paymentType, userId })
    });

    odemeModal?.hide();
    sessionStorage.setItem("odemeBasarili", "1");
    location.reload();


  }


  return { open, odemeYap };
})();
if (typeof Swal === "undefined") {
  console.warn("SweetAlert2 yüklü değil, toast gösterilemez.");
}
