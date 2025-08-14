(function () {
  // Detect language (default EN), allow manual switch
  const langPref = (navigator.language || "en").toLowerCase().startsWith("ru") ? "RU" : "EN";
  let LANG = localStorage.getItem("siteLang") || langPref;

  // Elements
  const titleEl = document.getElementById("title");
  const taglineEl = document.getElementById("tagline");
  const emojisEl = document.getElementById("emojis");
  const aboutEl = document.getElementById("about");

  const igBtn = document.getElementById("igBtn");
  const tgBtn = document.getElementById("tgBtn");
  const sgBtn = document.getElementById("sgBtn");
  const ofBtn = document.getElementById("onlyfansBtn");

  const mainImg = document.getElementById("mainImg");
  const thumbs = document.getElementById("thumbs");

  const ruBtn = document.getElementById("ruBtn");
  const enBtn = document.getElementById("enBtn");

  const modal = document.getElementById("modal");
  const modalMsg = document.getElementById("modalMsg");
  const modalClose = document.getElementById("modalClose");

  const t = () => TEXTS[LANG];
  let currentIndex = 0;

  function renderTexts() {
    document.documentElement.lang = LANG.toLowerCase();
    document.title = LANG === "RU" ? "Знакомства • М." : "Dating • M.";
    titleEl.textContent = t().title;
    taglineEl.textContent = t().tagline;
    emojisEl.textContent = t().emojis || "";
    aboutEl.textContent = t().about;

    igBtn.href = t().instagram;
    tgBtn.href = t().telegram;
    sgBtn.href = t().signal;

    ruBtn.classList.toggle("active", LANG === "RU");
    enBtn.classList.toggle("active", LANG === "EN");
  }

  function renderGallery() {
    const list = t().photos || [];
    if (list.length === 0) {
      document.querySelector(".gallery").hidden = true;
      return;
    }
    document.querySelector(".gallery").hidden = false;

    // Main image
    currentIndex = 0;
    setMainImage(currentIndex);

    // Thumbs
    thumbs.innerHTML = "";
    if (list.length > 1) {
      thumbs.hidden = false;
      list.forEach((p, i) => {
        const th = document.createElement("button");
        th.className = "thumb";
        th.setAttribute("type", "button");
        th.dataset.index = i.toString();
        th.innerHTML = `<img src="${p.src}" alt="${p.alt || ""}">`;
        if (i === 0) th.classList.add("active");
        thumbs.appendChild(th);
      });
    } else {
      thumbs.hidden = true;
    }
  }

  function setMainImage(i) {
    const list = t().photos;
    currentIndex = (i + list.length) % list.length;
    const item = list[currentIndex];
    mainImg.src = item.src;
    mainImg.alt = item.alt || "";
    // update active thumb
    Array.from(thumbs.children).forEach((el, idx) => {
      el.classList.toggle("active", idx === currentIndex);
    });
  }

  // Events
  thumbs.addEventListener("click", (e) => {
    const btn = e.target.closest(".thumb");
    if (!btn) return;
    const idx = Number(btn.dataset.index || 0);
    setMainImage(idx);
  });

  // Keyboard navigation for main image
  document.addEventListener("keydown", (e) => {
    if (modal && !modal.hidden) return; // don't navigate when modal open
    if (["ArrowLeft","ArrowRight"].includes(e.key) && (t().photos||[]).length > 1) {
      e.key === "ArrowRight" ? setMainImage(currentIndex + 1) : setMainImage(currentIndex - 1);
    }
  });

  // OnlyFans modal (text only)
  ofBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modalMsg.textContent = t().onlyfansMsg;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  });
  modalClose.addEventListener("click", () => closeModal());
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  function closeModal(){
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  // Language switching
  ruBtn.addEventListener("click", () => { LANG = "RU"; localStorage.setItem("siteLang", LANG); renderTexts(); renderGallery(); });
  enBtn.addEventListener("click", () => { LANG = "EN"; localStorage.setItem("siteLang", LANG); renderTexts(); renderGallery(); });

  // Init
  renderTexts();
  renderGallery();
})();
