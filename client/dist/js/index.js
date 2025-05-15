// Logout işlemi
document.getElementById("logoutBtn")?.addEventListener("click", function () {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// Sidebar scroll ayarları
document.addEventListener('DOMContentLoaded', function () {
  const sidebarWrapper = document.querySelector('.sidebar-wrapper');
  if (sidebarWrapper && typeof OverlayScrollbarsGlobal?.OverlayScrollbars !== 'undefined') {
    OverlayScrollbarsGlobal.OverlayScrollbars(sidebarWrapper, {
      scrollbars: {
        theme: 'os-theme-light',
        autoHide: 'leave',
        clickScroll: true,
      },
    });
  }
});

// Token kontrolü
if (!localStorage.getItem("token") && !localStorage.getItem("companyId")) {
  window.location.href = "login.html";
}

// Sayfa başlığını güncelleme
function updatePageTitleByHref(href) {
  let title = 'Gösterge Paneli';
  if (href.includes('calendar')) title = 'Randevular';
  else if (href.includes('service')) title = 'Paketler';
  else if (href.includes('products')) title = 'Ürünler';
  else if (href.includes('personel')) title = 'Personeller';
  else if (href.includes('sales') && !href.includes('product')) title = 'Paket Satışı';
  else if (href.includes('product-sales')) title = 'Ürün Satışı';
  else if (href.includes('customers')) title = 'Müşteriler';
  else if (href.includes('payment-tracking')) title = 'Ödeme Takibi';
  else if (href.includes('cash-tracking')) title = 'Kasa Takibi';

  document.querySelector('.app-content-header h3').innerText = title;
  document.querySelector('.breadcrumb-item.active').innerText = title;
}
document.querySelectorAll('a[target="icerikFrame"]').forEach(link => {
  link.addEventListener('click', () => {
    updatePageTitleByHref(link.getAttribute('href'));
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.getElementById('icerikFrame');
  updatePageTitleByHref(iframe.getAttribute('src'));
});

// iframe yüksekliği
function resizeIframe(iframe) {
  try {
    iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
  } catch (e) {
    console.warn("iframe içeriğine erişilemedi:", e);
  }
}

// Kullanıcı adını token’dan çek
document.addEventListener("DOMContentLoaded", () => {
  let name = "Kullanıcı";
  const userToken = localStorage.getItem("token");
  const companyToken = localStorage.getItem("companyToken");

  if (userToken) {
    try {
      const decoded = jwt_decode(userToken);
      name = decoded.username || "Kullanıcı";
    } catch (e) {
      console.error("User token çözümlenemedi:", e);
    }
  } else if (companyToken) {
    try {
      const decoded = jwt_decode(companyToken);
      name = decoded.ownerName || decoded.companyName || "Şirket";
    } catch (e) {
      console.error("Company token çözümlenemedi:", e);
    }
  }

  document.querySelectorAll(".user-menu .nav-link span.d-none.d-md-inline").forEach(el => {
    el.textContent = name;
  });

  const dropdownInfo = document.querySelector(".user-header p");
  if (dropdownInfo) dropdownInfo.innerHTML = name;

  document.querySelectorAll(".direct-chat-name").forEach(el => {
    if (el.textContent.includes("Alexander Pierce")) el.textContent = name;
  });

  document.querySelectorAll("a.btn.fw-bold").forEach(el => {
    if (el.textContent.trim() === "Alexander Pierce") {
      el.textContent = name;
    }
  });
});

// Arama kutusunu toggle et
document.addEventListener("DOMContentLoaded", () => {
  const searchToggle = document.getElementById("searchToggle");
  const searchInput = document.getElementById("searchInput");

  searchToggle.addEventListener("click", () => {
    searchInput.classList.toggle("show");
  });
});

