const screenshotTabs = Array.from(document.querySelectorAll('[role="tab"]'));
const screenshotPanels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
const screenshotDialog = document.querySelector("#screenshot-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxCaption = document.querySelector("#lightbox-caption");

function activateScreenshotTab(tab, moveFocus = false) {
  const activePanelId = tab.getAttribute("aria-controls");

  screenshotTabs.forEach((screenshotTab) => {
    const isActive = screenshotTab === tab;
    screenshotTab.setAttribute("aria-selected", String(isActive));
    screenshotTab.tabIndex = isActive ? 0 : -1;
  });

  screenshotPanels.forEach((panel) => {
    panel.hidden = panel.id !== activePanelId;
  });

  if (moveFocus) {
    tab.focus();
  }
}

screenshotTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    activateScreenshotTab(tab);
    history.replaceState(null, "", `#${tab.getAttribute("aria-controls")}`);
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
    activateScreenshotTab(screenshotTabs[nextIndex], true);
    history.replaceState(null, "", `#${screenshotTabs[nextIndex].getAttribute("aria-controls")}`);
  });
});

const initialPanel = document.getElementById(window.location.hash.slice(1));
const initialTab = initialPanel && screenshotTabs.find((tab) => tab.getAttribute("aria-controls") === initialPanel.id);

if (initialTab) {
  activateScreenshotTab(initialTab);
}

document.querySelectorAll("[data-screenshot-src]").forEach((imageButton) => {
  imageButton.addEventListener("click", () => {
    lightboxImage.src = imageButton.dataset.screenshotSrc;
    lightboxImage.alt = imageButton.dataset.screenshotAlt;
    lightboxCaption.textContent = imageButton.dataset.screenshotAlt;
    screenshotDialog.showModal();
  });
});

document.querySelector(".screenshot-lightbox-close").addEventListener("click", () => {
  screenshotDialog.close();
});

screenshotDialog.addEventListener("click", (event) => {
  if (event.target === screenshotDialog) {
    screenshotDialog.close();
  }
});

screenshotDialog.addEventListener("close", () => {
  lightboxImage.removeAttribute("src");
});