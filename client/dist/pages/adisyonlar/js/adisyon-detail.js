const token = localStorage.getItem("companyToken");
const config = { headers: { Authorization: "Bearer " + token } };
const urlParams = new URLSearchParams(window.location.search);
const appointmentId = urlParams.get("id");
let currentStatus = "";

// Randevu detayı yükle
async function loadAppointment() {
  try {
    const res = await axios.get(`http://localhost:5001/api/appointments/${appointmentId}`, config);
    const data = res.data;

    document.getElementById("customerName").textContent = data.Customer?.name || "-";
    document.getElementById("packageName").textContent = data.serviceName || "-";
    document.getElementById("sessionInfo").textContent = `${data.sessionNumber || "-"}. seans`;
    document.getElementById("duration").value = data.duration || "";

    const dateObj = new Date(data.date);
    document.getElementById("appointmentDate").value = dateObj.toISOString().split("T")[0];
    document.getElementById("appointmentHour").value = dateObj.getHours();
    document.getElementById("appointmentMinute").value = dateObj.getMinutes();

    currentStatus = data.status;
    document.querySelectorAll("#statusGroup button").forEach(btn => {
      if (btn.dataset.status === currentStatus) btn.classList.add("active");

      btn.addEventListener("click", () => {
        document.querySelectorAll("#statusGroup button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentStatus = btn.dataset.status;
      });
    });

    await loadUsers(data.UserId);
    await loadCustomerPackages(data.CustomerId);
    await loadSessionHistory(data.CustomerId);
    await loadPaymentInfo(data.CustomerId);


  } catch (err) {
    alert("Detay verisi alınamadı.");
    console.error(err);
  }
}

// Personelleri doldur
async function loadUsers(selectedId) {
  try {
    const res = await axios.get("http://localhost:5001/api/users", config);
    const select = document.getElementById("personelSelect");
    res.data.forEach(user => {
      const opt = document.createElement("option");
      opt.value = user.id;
      opt.textContent = user.name;
      if (user.id === selectedId) opt.selected = true;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("Kullanıcılar yüklenemedi:", err);
  }
}

// Müşteri paketleri
async function loadCustomerPackages(customerId) {
  try {
    const [salesRes, appointmentsRes] = await Promise.all([
      axios.get(`http://localhost:5001/api/sales/by-customer/${customerId}`, config),
      axios.get("http://localhost:5001/api/appointments", config)
    ]);

    const sales = salesRes.data;
    const allAppointments = appointmentsRes.data;
    const list = document.getElementById("packageList");
    list.innerHTML = "";

    sales.forEach(sale => {
      const serviceName = sale.Service?.name || "Paket";
      const totalSession = sale.session || 0;

      const kullanilan = allAppointments.filter(r =>
        r.CustomerId == sale.CustomerId &&
        r.ServiceId == sale.ServiceId &&
        r.SaleId == sale.id &&
        r.status !== "iptal"
      ).length;

      const kalan = totalSession - kullanilan;

      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div>
          <strong>${serviceName}</strong> • ${kalan} seans 
        </div>
        <span class="badge text-bg-primary">${parseFloat(sale.price).toFixed(2)}₺</span>
      `;
      list.appendChild(li);
    });

    if (sales.length === 0) {
      list.innerHTML = `<li class="list-group-item text-muted">Satın alınmış paket yok.</li>`;
    }
  } catch (err) {
    console.error("Paket verileri alınamadı:", err);
  }
}

// Güncelleme butonu
document.getElementById("saveBtn").addEventListener("click", async () => {
  const selectedDate = document.getElementById("appointmentDate").value;
  const hour = document.getElementById("appointmentHour").value.padStart(2, '0');
  const minute = document.getElementById("appointmentMinute").value.padStart(2, '0');
  const fullDateTime = `${selectedDate}T${hour}:${minute}:00`;

  const duration = parseInt(document.getElementById("duration").value);
  const endDate = new Date(new Date(fullDateTime).getTime() + duration * 60000).toISOString();

  try {
    await axios.put(`http://localhost:5001/api/appointments/${appointmentId}`, {
      date: fullDateTime,
      endDate: endDate,
      status: currentStatus,
      UserId: document.getElementById("personelSelect").value
    }, config);

    alert("✅ Güncelleme başarılı!");
  } catch (err) {
    console.error("❌ Güncelleme hatası:", err);
    alert("❌ Kaydetme başarısız.");
  }
});


async function loadSessionHistory(customerId) {
  try {
    const res = await axios.get(`http://localhost:5001/api/appointments/by-customer/${customerId}/package-usage`, config);
    const list = document.getElementById("sessionHistory");
    list.innerHTML = "";

    res.data.forEach(a => {
      const dateText = new Date(a.date).toLocaleDateString("tr-TR");
      const seansNo = a.sessionNumber || "-";
      const serviceName = a.Service?.name || "-";

      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `<strong>${seansNo}. Seans</strong> • ${serviceName} — ${dateText}`;
      list.appendChild(li);
    });

    if (res.data.length === 0) {
      list.innerHTML = `<li class="list-group-item text-muted">Henüz kullanım yok.</li>`;
    }
  } catch (err) {
    console.error("Seans geçmişi yüklenemedi:", err);
  }
}


async function loadPaymentInfo(customerId) {
  try {
    const res = await axios.get(`http://localhost:5001/api/payments/by-customer/${customerId}`, config);
    const list = document.getElementById("paymentList");
    list.innerHTML = "";

    if (res.data.length === 0) {
      list.innerHTML = `<tr><td colspan="2" class="text-muted">Ödeme planı bulunamadı.</td></tr>`;
      return;
    }
res.data
  .filter(payment => payment.status === 'bekliyor' || payment.status === 'gecikmiş')
  .forEach(payment => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${parseFloat(payment.amount).toFixed(2)}₺</td>
      <td>${new Date(payment.dueDate).toLocaleDateString("tr-TR")}</td>
      <td>
        <span class="badge bg-${payment.status === 'gecikmiş' ? 'danger' : 'warning'}">${payment.status}</span>
      </td>
    `;
    list.appendChild(tr);
  });

  } catch (err) {
    console.error("Ödeme bilgileri getirilemedi:", err);
  }
}


loadAppointment();