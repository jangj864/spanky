const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
function closeMenu() {
  menu.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
});
nav.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
window.matchMedia("(min-width: 801px)").addEventListener("change", closeMenu);

// Shared, manual galleries: keyboard, buttons, indicators and touch gestures.
document.querySelectorAll("[data-carousel]").forEach((gallery) => {
  const slides = [...gallery.querySelectorAll("[data-slide]")];
  const indicators = [...gallery.querySelectorAll("[data-indicator]")];
  let current = 0;
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
    });
    indicators.forEach((button, i) =>
      button.setAttribute("aria-pressed", String(i === current)),
    );
    gallery.querySelector("[data-slide-count]").textContent =
      `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  }
  gallery
    .querySelector("[data-previous]")
    .addEventListener("click", () => show(current - 1));
  gallery
    .querySelector("[data-next]")
    .addEventListener("click", () => show(current + 1));
  indicators.forEach((button, i) =>
    button.addEventListener("click", () => show(i)),
  );
  gallery.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    show(current + (event.key === "ArrowRight" ? 1 : -1));
  });
  let startX = 0;
  gallery.addEventListener(
    "touchstart",
    (event) => {
      startX = event.changedTouches[0].clientX;
    },
    { passive: true },
  );
  gallery.addEventListener(
    "touchend",
    (event) => {
      const delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 50) show(current + (delta < 0 ? 1 : -1));
    },
    { passive: true },
  );
});
