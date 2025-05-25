// popupLoader.js
export async function loadPopup(name) {
  try {
    // HTML dosyasını fetch et
    const res = await fetch(`/client/dist/pages/modals/${name}.html`);
    const html = await res.text();

    // HTML'i DOM'a yerleştir
    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    // CSS dosyasını yükle (daha önce yüklenmemişse)
    const cssPath = `/client/dist/pages/modals/css/${name}.css`;
    if (!document.querySelector(`link[href="${cssPath}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssPath;
      document.head.appendChild(link);
    }

    // JS modülünü içe aktar
    const module = await import(`/client/dist/pages/modals/js/${name}.js`);

    // DOM'a eklendikten sonra çalışacak her şey
    requestAnimationFrame(() => {
      // varsa modülün init fonksiyonunu çalıştır
      if (module && typeof module.init === "function") {
        module.init();
      }

      // Sekme (tab) geçişlerini elle Bootstrap ile bağla
      const tabTriggers = container.querySelectorAll('[data-bs-toggle="tab"]');
      tabTriggers.forEach(trigger => {
        const tab = new bootstrap.Tab(trigger);
        trigger.addEventListener("click", (e) => {
          e.preventDefault();
          tab.show();
        });
      });
    });

  } catch (err) {
    console.error(`[popupLoader] ${name} yüklenemedi:`, err);
  }
}
