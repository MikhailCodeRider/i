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
  
  const imageModal = document.getElementById("imageModal");
  const zoomedImg = document.getElementById("zoomedImg");
  const imageModalClose = document.getElementById("imageModalClose");

  const t = () => TEXTS[LANG];
  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function renderTexts() {
    try {
      const texts = t();
      if (!texts) {
        console.error('Text configuration not found for language:', LANG);
        return;
      }
      
      document.documentElement.lang = LANG.toLowerCase();
      document.title = LANG === "RU" ? "Знакомства • М." : "Dating • M.";
      
      if (titleEl) titleEl.textContent = texts.title || "";
      if (taglineEl) taglineEl.textContent = texts.tagline || "";
      if (emojisEl) emojisEl.textContent = texts.emojis || "";
      if (aboutEl) aboutEl.textContent = texts.about || "";

      if (igBtn && texts.instagram) igBtn.href = texts.instagram;
      if (tgBtn && texts.telegram) tgBtn.href = texts.telegram;
      if (sgBtn && texts.signal) sgBtn.href = texts.signal;

      if (ruBtn) ruBtn.classList.toggle("active", LANG === "RU");
      if (enBtn) enBtn.classList.toggle("active", LANG === "EN");
    } catch (error) {
      console.error('Error rendering texts:', error);
    }
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
        th.setAttribute("role", "tab");
        th.setAttribute("aria-selected", i === 0 ? "true" : "false");
        th.setAttribute("aria-label", `View photo ${i + 1}: ${p.alt || "Photo"}`);
        th.dataset.index = i.toString();
        th.innerHTML = `<img src="${p.src}" alt="">`;
        if (i === 0) th.classList.add("active");
        thumbs.appendChild(th);
      });
    } else {
      thumbs.hidden = true;
    }
  }

  function setMainImage(i) {
    const list = t().photos;
    if (!list || list.length === 0) return;
    
    currentIndex = (i + list.length) % list.length;
    const item = list[currentIndex];
    
    // Show loading state
    const mainPhoto = document.querySelector('.main-photo');
    let spinner = mainPhoto.querySelector('.loading-spinner');
    if (!spinner) {
      spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      mainPhoto.appendChild(spinner);
    }
    mainImg.classList.add('loading');
    
    // Create new image to preload
    const newImg = new Image();
    newImg.onload = () => {
      mainImg.src = item.src;
      mainImg.alt = item.alt || "";
      mainImg.classList.remove('loading');
      if (spinner) spinner.remove();
    };
    newImg.onerror = () => {
      console.warn(`Failed to load image: ${item.src}`);
      mainImg.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250"><rect width="400" height="250" fill="%23151821"/><text x="200" y="125" text-anchor="middle" fill="%239aa4b2" font-family="system-ui" font-size="16">Image not available</text></svg>';
      mainImg.alt = "Image not available";
      mainImg.classList.remove('loading');
      if (spinner) spinner.remove();
    };
    newImg.src = item.src;
    
    // Update active thumb
    Array.from(thumbs.children).forEach((el, idx) => {
      const isActive = idx === currentIndex;
      el.classList.toggle("active", isActive);
      el.setAttribute("aria-selected", isActive ? "true" : "false");
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
      e.preventDefault();
      e.key === "ArrowRight" ? setMainImage(currentIndex + 1) : setMainImage(currentIndex - 1);
    }
  });

  // Touch navigation for gallery
  mainImg.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  mainImg.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const photos = t().photos || [];
    if (photos.length <= 1) return;
    
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next image
        setMainImage(currentIndex + 1);
      } else {
        // Swipe right - previous image
        setMainImage(currentIndex - 1);
      }
    }
  }

  // OnlyFans modal (text only)
  ofBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modalMsg.textContent = t().onlyfansMsg;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  });
  modalClose.addEventListener("click", () => closeModal());
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => { 
    if (e.key === "Escape") {
      if (!modal.hidden) closeModal();
      if (!imageModal.hidden) closeImageModal();
    }
  });
  function closeModal(){
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  // Image zoom functionality
  const mainPhoto = document.querySelector('.main-photo');
  
  function openImageZoom() {
    if (!mainImg.src || mainImg.src.includes('data:image/svg+xml')) return;
    zoomedImg.src = mainImg.src;
    zoomedImg.alt = mainImg.alt;
    imageModal.hidden = false;
    document.body.style.overflow = "hidden";
    imageModalClose.focus();
  }
  
  mainImg.addEventListener("click", openImageZoom);
  mainPhoto.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openImageZoom();
    }
  });

  imageModalClose.addEventListener("click", closeImageModal);
  imageModal.addEventListener("click", (e) => { 
    if (e.target === imageModal || e.target.classList.contains('image-modal__backdrop')) {
      closeImageModal();
    }
  });

  function closeImageModal() {
    imageModal.hidden = true;
    document.body.style.overflow = "";
  }

  // Language switching
  ruBtn.addEventListener("click", () => { LANG = "RU"; localStorage.setItem("siteLang", LANG); renderTexts(); renderGallery(); });
  enBtn.addEventListener("click", () => { LANG = "EN"; localStorage.setItem("siteLang", LANG); renderTexts(); renderGallery(); });

  // Init
  renderTexts();
  renderGallery();
})();
