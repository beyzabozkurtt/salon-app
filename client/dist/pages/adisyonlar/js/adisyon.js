const token = localStorage.getItem("companyToken");
    const config = {
      headers: {
        Authorization: "Bearer " + token
      }
    };

    async function loadAdisyon() {
      try {
        const res = await axios.get("http://localhost:5001/api/appointments", config);
        const tbody = document.getElementById("adisyonTableBody");
        tbody.innerHTML = "";

res.data.forEach(app => {
  const dateObj = new Date(app.date);
  const formattedDate = dateObj.toLocaleDateString('tr-TR');
  const formattedTime = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const isSingle = !!app.SingleServiceId;
  const typeLabel = isSingle ? "Hizmet" : "Paket";
  const serviceName = isSingle
    ? (app.SingleService?.name || '-')
    : (app.Service?.name || '-');

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${app.Customer?.name || '-'}</td>
    <td>${typeLabel}</td>
    <td>${serviceName}</td>
    <td>${formattedDate}</td>
    <td>${formattedTime}</td>
    <td>${app.status}</td>
    <td>${new Date(app.createdAt).toLocaleDateString('tr-TR')}</td>
    <td class="text-center">
      <button class="btn btn-sm btn-light border" onclick="goToDetail(${app.id})" title="Detay">
        <i class="bi bi-search text-info"></i>
      </button>
    </td>
  `;
  tbody.appendChild(tr);
});


      } catch (err) {
        console.error("Adisyon verisi alınamadı:", err);
      }
    }

    function goToDetail(id) {
      window.location.href = `adisyon-detail.html?id=${id}`;
    }

    loadAdisyon();
  // Arama özelliği (müşteri adına göre filtrele)
  document.getElementById("searchInput").addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();
    const rows = document.querySelectorAll("#adisyonTableBody tr");
    rows.forEach(row => {
      const name = row.querySelector("td")?.textContent?.toLowerCase() || "";
      row.style.display = name.includes(searchTerm) ? "" : "none";
    });
  });