export async function loadPopup(name) {
  try {
    // HTML dosyasını fetch et
    const res = await fetch(`/client/dist/pages/modals/${name}.html`);
    const html = await res.text();

    // HTML'i DOM'a yerleştir
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // CSS dosyasını yükle (eğer daha önce yüklenmemişse)
    const cssPath = `/client/dist/pages/modals/css/${name}.css`;
    if (!document.querySelector(`link[href="${cssPath}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath;
      document.head.appendChild(link);
    }

    // JS modülünü içe aktar
    const module = await import(`/client/dist/pages/modals/js/${name}.js`);

    // DOM yüklendikten sonra işlemleri başlat
    setTimeout(() => {
      if (module && typeof module.init === "function") {
        module.init();
      }

      // 🔥 Sekme görünürlüğünü elle tetikle
      const activeTab = document.querySelector('.modal.show .nav-link.active');
      const targetId = activeTab?.getAttribute('data-bs-target');
      const targetPane = document.querySelector(targetId);
      if (targetPane) {
        targetPane.classList.add('show', 'active');
      }
    }, 0);
  } catch (err) {
    console.error(`[popupLoader] ${name} yüklenemedi:`, err);
  }
}
