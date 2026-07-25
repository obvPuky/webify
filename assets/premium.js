(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const header = document.querySelector("header");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const stage = document.querySelector(".hero-card");
  const studioWindow = document.querySelector(".studio-window");

  document.body.classList.add("premium-ready");

  const syncChrome = () => {
    const scrolled = window.scrollY > 28;
    header?.classList.toggle("scrolled", scrolled);
    themeMeta?.setAttribute(
      "content",
      document.body.classList.contains("light-mode") ? "#eee9df" : "#0a0a08"
    );
  };

  syncChrome();
  window.addEventListener("scroll", syncChrome, { passive: true });
  document.getElementById("themeToggle")?.addEventListener("click", syncChrome);
  document.getElementById("mobileThemeToggle")?.addEventListener("click", syncChrome);

  const revealFallback = () => {
    document.querySelectorAll(".reveal:not(.in)").forEach(node => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * .94 && rect.bottom > 0) {
        node.classList.add("in");
      }
    });
  };
  revealFallback();
  window.addEventListener("scroll", revealFallback, { passive: true });

  const observedSections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => {
        const active = link.getAttribute("href") === `#${visible.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-28% 0px -58% 0px", threshold: [0, .2, .55] });

    observedSections.forEach(section => sectionObserver.observe(section));
  }

  if (finePointer) {
    document.querySelectorAll(".card,.member,.blog-card,.stat-card,.service-panel").forEach(surface => {
      surface.addEventListener("pointermove", event => {
        const rect = surface.getBoundingClientRect();
        surface.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
        surface.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
  }

  if (!reduceMotion && finePointer && stage && studioWindow) {
    let frame = 0;
    let rotateX = 2;
    let rotateY = -5;

    const renderTilt = () => {
      studioWindow.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      frame = 0;
    };

    stage.addEventListener("pointermove", event => {
      const rect = stage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      rotateY = x * 8;
      rotateX = y * -7;
      if (!frame) frame = requestAnimationFrame(renderTilt);
    }, { passive: true });

    stage.addEventListener("pointerleave", () => {
      rotateX = 2;
      rotateY = -5;
      if (!frame) frame = requestAnimationFrame(renderTilt);
    });

  }

  document.querySelectorAll(".price-card-click").forEach(card => {
    card.addEventListener("pointerdown", () => card.classList.add("pressed"));
    card.addEventListener("pointerup", () => card.classList.remove("pressed"));
    card.addEventListener("pointercancel", () => card.classList.remove("pressed"));
    card.addEventListener("pointerleave", () => card.classList.remove("pressed"));
  });
})();
