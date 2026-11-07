const screenshotTabs = Array.from(document.querySelectorAll('[role="tab"]'));
const screenshotPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const gallerySubtitle = document.querySelector("#gallery-subtitle");
const screenshotDialog = document.querySelector("#screenshot-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");

const PANEL_SUBTITLES = {
  "panel-admin": "Web portal used by administrators and managers.",
  "panel-mswdo": "Web portal used by MSWDO staff for evacuation center coordination and relief management.",
  "panel-responders": "Mobile application used by emergency responders (BFP, MDRRMO, PNP).",
  "panel-residents": "Mobile application used by Barangay Wawa residents for flood alerts and emergency SOS."
};

const PANEL_HASHES = {
  "panel-admin": "admin",
  "panel-mswdo": "mswdo",
  "panel-responders": "responders",
  "panel-residents": "residents"
};

function activateScreenshotTab(tab, moveFocus = false) {
  if (!tab) return;
  const activePanelId = tab.getAttribute("aria-controls");

  screenshotTabs.forEach((screenshotTab) => {
    const isActive = screenshotTab === tab;
    screenshotTab.setAttribute("aria-selected", String(isActive));
    screenshotTab.classList.toggle("is-active", isActive);
    screenshotTab.tabIndex = isActive ? 0 : -1;
  });

  screenshotPanels.forEach((panel) => {
    const isTarget = panel.id === activePanelId;
    panel.hidden = !isTarget;
    if (isTarget) {
      panel.removeAttribute("hidden");
    }
  });

  if (gallerySubtitle && PANEL_SUBTITLES[activePanelId]) {
    gallerySubtitle.textContent = PANEL_SUBTITLES[activePanelId];
  }

  if (moveFocus) {
    tab.focus();
  }
}

screenshotTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    activateScreenshotTab(tab);
    const panelId = tab.getAttribute("aria-controls");
    const hash = PANEL_HASHES[panelId] || panelId;
    history.replaceState(null, "", `#${hash}`);
  });

  tab.addEventListener("keydown", (event) => {
    let nextIndex = index;

    if (event.key === "ArrowRight") {
      nextIndex = (index + 1) % screenshotTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (index - 1 + screenshotTabs.length) % screenshotTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = screenshotTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTab = screenshotTabs[nextIndex];
    activateScreenshotTab(nextTab, true);
    const panelId = nextTab.getAttribute("aria-controls");
    const hash = PANEL_HASHES[panelId] || panelId;
    history.replaceState(null, "", `#${hash}`);
  });
});

function resolveTabFromHash() {
  const hash = window.location.hash.slice(1).toLowerCase();
  if (!hash) return null;

  if (hash === "admin" || hash === "mdrrmo" || hash === "mdrrmo-portal" || hash === "panel-admin") {
    return document.querySelector("#tab-admin");
  }
  if (hash === "mswdo" || hash === "mswdo-portal" || hash === "panel-mswdo") {
    return document.querySelector("#tab-mswdo");
  }
  if (hash === "responders" || hash === "responders-app" || hash === "panel-responders") {
    return document.querySelector("#tab-responders");
  }
  if (hash === "residents" || hash === "residents-app" || hash === "panel-residents") {
    return document.querySelector("#tab-residents");
  }
  return null;
}

const initialTab = resolveTabFromHash() || document.querySelector("#tab-admin");
if (initialTab) {
  activateScreenshotTab(initialTab);
}

// ==========================================================================
// Fullscreen Lightbox Modal with Next / Back & Active Panel Cycling
// ==========================================================================
let currentPanelButtons = [];
let currentImageIndex = -1;

function updateLightboxContent(index) {
  if (!currentPanelButtons.length) return;
  currentImageIndex = (index + currentPanelButtons.length) % currentPanelButtons.length;
  const targetBtn = currentPanelButtons[currentImageIndex];
  if (!targetBtn) return;

  const src = targetBtn.dataset.screenshotSrc || targetBtn.querySelector("img")?.src;
  const alt = targetBtn.dataset.screenshotAlt || targetBtn.querySelector("img")?.alt || "Screenshot";

  if (lightboxImage) {
    lightboxImage.style.opacity = "0.4";
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightboxImage.onload = () => {
      lightboxImage.style.opacity = "1";
    };
  }
  if (lightboxCaption) {
    lightboxCaption.textContent = alt;
  }
  const counterEl = document.querySelector("#lightbox-counter");
  if (counterEl) {
    counterEl.textContent = `${currentImageIndex + 1} / ${currentPanelButtons.length}`;
  }
}

function openLightboxForButton(button) {
  const panel = button.closest(".gallery-panel") || document.querySelector(".gallery-panel:not([hidden])") || document;
  currentPanelButtons = Array.from(panel.querySelectorAll("[data-screenshot-src]"));
  currentImageIndex = currentPanelButtons.indexOf(button);
  if (currentImageIndex === -1) currentImageIndex = 0;

  updateLightboxContent(currentImageIndex);

  if (screenshotDialog && typeof screenshotDialog.showModal === "function") {
    screenshotDialog.showModal();
    document.body.style.overflow = "hidden";
  }
}

// Attach click to all gallery thumbnail buttons
document.querySelectorAll("[data-screenshot-src]").forEach((imageButton) => {
  imageButton.addEventListener("click", () => {
    openLightboxForButton(imageButton);
  });
});

// Navigation controls: Floating Arrow buttons
const prevBtn = document.querySelector("#lightbox-prev-btn");
const nextBtn = document.querySelector("#lightbox-next-btn");

if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); updateLightboxContent(currentImageIndex - 1); });
if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); updateLightboxContent(currentImageIndex + 1); });

// Close / Exit button
const closeButton = document.querySelector(".screenshot-lightbox-close");
if (closeButton) {
  closeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    if (screenshotDialog) screenshotDialog.close();
  });
}

// Close on backdrop or outside stage click
if (screenshotDialog) {
  screenshotDialog.addEventListener("click", (event) => {
    if (
      event.target === screenshotDialog ||
      event.target.classList.contains("lightbox-stage") ||
      event.target.classList.contains("lightbox-image-wrap")
    ) {
      screenshotDialog.close();
    }
  });

  screenshotDialog.addEventListener("close", () => {
    document.body.style.overflow = "";
    if (lightboxImage) {
      lightboxImage.removeAttribute("src");
    }
  });
}

// Keyboard navigation (ArrowLeft = Back, ArrowRight = Next, Escape = Exit)
document.addEventListener("keydown", (event) => {
  if (!screenshotDialog || !screenshotDialog.open) return;

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    updateLightboxContent(currentImageIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    updateLightboxContent(currentImageIndex + 1);
  }
});

// Touch swipe support for mobile / tablet gestures
let touchStartX = 0;
let touchEndX = 0;

if (screenshotDialog) {
  screenshotDialog.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  screenshotDialog.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) {
        updateLightboxContent(currentImageIndex - 1); // Swiped right -> Previous
      } else {
        updateLightboxContent(currentImageIndex + 1); // Swiped left -> Next
      }
    }
  }, { passive: true });
}
