(function () {
  // Detect language (default EN)
  const langPref = (navigator.language || "en").toLowerCase().startsWith("ru") ? "RU" : "EN";
  let LANG = localStorage.getItem("siteLang") || langPref;
  const t = () => TEXTS[LANG];

  // Elements
  const titleEl = document.getElementById("title");
  const taglineEl = document.getElementById("tagline");
  const aboutEl = document.getElementById("about");
  const ctaEl = document.getElementById("cta");
  const igBtn = document.getElementById("igBtn");
  const tgBtn = document.getElementById("tgBtn");
  const sgBtn = document.getElementById("sgBtn");
  const ofBtn = document.getElementById("onlyfansBtn");
  const gallery = document.getElementById("gallery");
  const ruBtn = document.getElementById("ruBtn");
  const enBtn = document.getElementById("enBtn");

  function renderTexts() {
    titleEl.textContent = t().title;
    taglineEl.textContent = t().tagline;
    aboutEl.textContent = t().about;
    ctaEl.textContent = t().cta;
    igBtn.href = t().instagram;
    tgBtn.href = t().telegram;
    sgBtn.href = t().signal;
    ruBtn.classList.toggle("active", LANG === "RU");
    enBtn.classList.toggle("active", LANG === "EN");
    document.documentElement.lang = LANG.toLowerCase();
    document.title = LANG === "RU" ? "Знакомства • М." : "Dating • M.";
  }

  function renderGallery() {
    gallery.innerHTML = "";
    t().photos.forEach((p, idx) => {
      const fig = document.createElement("figure");
      fig.className = `ph ${p.class || "ph--std"}`;
      fig.dataset.index = idx.toString();
      fig.innerHTML = `<img src="${p.src}" alt="${p.alt || ""}" loading="lazy">`;
      gallery.appendChild(fig);
    });
  }

  // Lightbox (for photos)
  const overlay = document.getElementById("overlay");
  const overlayClose = document.getElementById("overlayClose");
  const overlayContent = document.getElementById("overlayContent");
  const overlayCaption = document.getElementById("overlayCaption");
  const overlayNav = document.getElementById("overlayNav");
  const prevImgBtn = document.getElementById("prevImg");
  const nextImgBtn = document.getElementById("nextImg");
  let currentIndex = 0;

  function openImage(index) {
    const list = t().photos;
    currentIndex = (index + list.length) % list.length;
    const item = list[currentIndex];
    overlayContent.innerHTML = `<img class="overlay__content-img" src="${item.src}" alt="${item.alt || ""}">`;
    overlayCaption.textContent = item.alt || "";
    overlayNav.hidden = false;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeOverlay() {
    overlay.hidden = true;
    overlayContent.innerHTML = "";
    overlayCaption.textContent = "";
    document.body.style.overflow = "";
  }
  function nextImage() { openImage(currentIndex + 1); }
  function prevImage() { openImage(currentIndex - 1); }

  gallery.addEventListener("click", (e) => {
    const fig = e.target.closest(".ph");
    if (!fig) return;
    const idx = Number(fig.dataset.index || 0);
    openImage(idx);
  });
  overlayClose.addEventListener("click", closeOverlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener("keydown", (e) => {
    if (overlay.hidden) return;
    if (e.key === "Escape") closeOverlay();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  });
  nextImgBtn.addEventListener("click", nextImage);
  prevImgBtn.addEventListener("click", prevImage);

  // OnlyFans custom modal (no browser alert)
  ofBtn.addEventListener("click", (e) => {
    e.preventDefault();
    overlayContent.innerHTML = `
      <div style="display:grid;place-items:center;gap:12px;padding:24px">
        <div style="font-size:clamp(18px,3vw,26px);text-align:center;line-height:1.4">
          ${t().onlyfansMsg}
        </div>
      </div>
    `;
    overlayCaption.textContent = "";
    overlayNav.hidden = true;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
  });

  // Language switching
  ruBtn.addEventListener("click", () => { LANG = "RU"; localStorage.setItem("siteLang", LANG); renderTexts(); renderGallery(); });
  enBtn.addEventListener("click", () => { LANG = "EN"; localStorage.setItem("siteLang", LANG); renderTexts(); renderGallery(); });

  // Init
  renderTexts();
  renderGallery();
})();
