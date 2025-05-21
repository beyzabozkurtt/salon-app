export async function loadPopup(name) {
  try {
    // 1. HTML dosyasını al
    const res = await fetch(`../modals/${name}.html`);
    const html = await res.text();
    document.body.insertAdjacentHTML("beforeend", html);

    // 2. JS dosyasını import et (dynamic import)
    const module = await import(`../modals/js/${name}.js`);
    if (module && typeof module.init === "function") {
      module.init(); // opsiyonel başlatıcı fonksiyon
    }
  } catch (err) {
    console.error(`${name} popup yüklenemedi:`, err);
  }
}
