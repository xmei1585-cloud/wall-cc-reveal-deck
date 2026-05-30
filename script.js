(function () {
  function typesetMath(container) {
    if (typeof renderMathInElement === "function") {
      renderMathInElement(container || document.body, {
        delimiters: [
          { left: "$$", right: "$$", display: true },
          { left: "$", right: "$", display: false },
          { left: "\\(", right: "\\)", display: false },
          { left: "\\[", right: "\\]", display: true }
        ],
        throwOnError: false
      });
    }
  }

  function setupPageNumber() {
    var pageNumber = document.querySelector(".deck-page-number");
    if (!pageNumber) {
      pageNumber = document.createElement("div");
      pageNumber.className = "deck-page-number";
      pageNumber.setAttribute("aria-label", "Slide number");
      document.body.appendChild(pageNumber);
    }

    function updatePageNumber() {
      pageNumber.textContent = String(Reveal.getSlidePastCount() + 1);
    }

    updatePageNumber();
    Reveal.on("slidechanged", updatePageNumber);
    Reveal.on("ready", updatePageNumber);
  }

  function setTags(container, tags) {
    container.innerHTML = "";
    tags.split("|").filter(Boolean).forEach(function (tag) {
      var item = document.createElement("span");
      item.textContent = tag;
      container.appendChild(item);
    });
  }

  function activateCard(card) {
    var group = card.closest("[data-interaction]");
    if (!group) return;
    if (card.dataset.zone) {
      group.dataset.activeZone = card.dataset.zone;
    }

    group.querySelectorAll("[data-card]").forEach(function (item) {
      item.classList.toggle("is-active", item === card);
      if (item.tagName === "BUTTON") {
        item.setAttribute("aria-pressed", item === card ? "true" : "false");
      }
    });

    var panel = group.querySelector("[data-detail-panel]");
    if (!panel) return;

    var title = panel.querySelector("[data-detail-title]");
    var text = panel.querySelector("[data-detail-text]");
    var tags = panel.querySelector("[data-detail-tags]");

    if (title) title.textContent = card.dataset.title || "";
    if (text) text.textContent = card.dataset.detail || "";
    if (tags) setTags(tags, card.dataset.tags || "");
    typesetMath(panel);
  }

  document.querySelectorAll("[data-interaction]").forEach(function (group) {
    group.querySelectorAll("[data-card]").forEach(function (card) {
      card.addEventListener("click", function () {
        activateCard(card);
      });
      card.addEventListener("mouseenter", function () {
        activateCard(card);
      });
    });
  });

  var overlay = document.querySelector(".zoom-overlay");
  var zoomContent = document.querySelector(".zoom-content");
  var zoomClose = document.querySelector(".zoom-close");

  function closeZoom() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    zoomContent.innerHTML = "";
  }

  document.querySelectorAll(".zoomable").forEach(function (item) {
    item.addEventListener("click", function (event) {
      if (event.target.closest("button")) return;
      var clone = item.cloneNode(true);
      clone.classList.remove("fragment", "visible", "current-fragment", "zoomable");
      clone.removeAttribute("style");
      zoomContent.innerHTML = "";
      zoomContent.appendChild(clone);
      typesetMath(zoomContent);
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
    });
  });

  zoomClose.addEventListener("click", closeZoom);
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) closeZoom();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeZoom();
    }
  });

  var plugins = [];
  if (window.RevealNotes) plugins.push(RevealNotes);
  if (window.RevealMath) plugins.push(RevealMath.KaTeX());

  Reveal.initialize({
    width: 1280,
    height: 720,
    margin: 0.035,
    hash: true,
    controls: true,
    progress: true,
    slideNumber: false,
    center: false,
    transition: "fade",
    backgroundTransition: "fade",
    katex: {
      version: "0.16.22",
      throwOnError: false
    },
    plugins: plugins
  }).then(setupPageNumber);
})();
