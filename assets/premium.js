(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const header = document.querySelector("header");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const stage = document.querySelector(".hero-card");
  const studioWindow = document.querySelector(".studio-window");
  const pointerAura = document.getElementById("pointerAura");
  const pragueClock = document.getElementById("pragueClock");
  const mobilePragueClock = document.getElementById("mobilePragueClock");
  const sectionHud = document.getElementById("sectionHud");
  const sectionCurrent = document.getElementById("sectionCurrent");
  const sectionTotal = document.getElementById("sectionTotal");
  const sectionHudProgress = document.getElementById("sectionHudProgress");
  const sectionHudLabel = document.getElementById("sectionHudLabel");
  const railSections = [...document.querySelectorAll("main > section[id]")];

  document.body.classList.add("premium-ready");

  if (pragueClock || mobilePragueClock) {
    const clockFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Prague",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const syncClock = () => {
      const now = new Date();
      const formattedTime = clockFormatter.format(now);
      if (pragueClock) {
        pragueClock.textContent = `${formattedTime} / PRG`;
        pragueClock.dateTime = now.toISOString();
      }
      if (mobilePragueClock) {
        mobilePragueClock.textContent = formattedTime;
        mobilePragueClock.dateTime = now.toISOString();
      }
    };
    syncClock();
    window.setInterval(syncClock, 30000);
  }

  if (!reduceMotion && finePointer && pointerAura) {
    let auraFrame = 0;
    let auraX = -600;
    let auraY = -600;
    const renderAura = () => {
      pointerAura.style.transform = `translate3d(${auraX - 260}px,${auraY - 260}px,0)`;
      pointerAura.classList.add("is-active");
      auraFrame = 0;
    };
    window.addEventListener("pointermove", event => {
      auraX = event.clientX;
      auraY = event.clientY;
      if (!auraFrame) auraFrame = requestAnimationFrame(renderAura);
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => pointerAura.classList.remove("is-active"));
  }

  if (sectionHud && railSections.length) {
    let activeRailSection = railSections[0];
    let railLabelTimer = 0;
    sectionTotal.textContent = String(railSections.length).padStart(2, "0");

    const getRailLabel = section => {
      const source = section.querySelector(".sec-kicker") || section.querySelector("h2");
      return source?.textContent.trim() || (section.id === "top" ? "Web-ify" : section.id);
    };

    const syncRail = (section, animate = true) => {
      const index = Math.max(0, railSections.indexOf(section));
      activeRailSection = section;
      sectionCurrent.textContent = String(index + 1).padStart(2, "0");
      sectionHudProgress.style.transform = `scaleX(${(index + 1) / railSections.length})`;
      window.clearTimeout(railLabelTimer);
      if (animate) sectionHud.classList.add("is-changing");
      railLabelTimer = window.setTimeout(() => {
        sectionHudLabel.textContent = getRailLabel(section);
        sectionHud.classList.remove("is-changing");
      }, animate ? 120 : 0);
    };

    syncRail(activeRailSection, false);
    if ("IntersectionObserver" in window) {
      const railObserver = new IntersectionObserver(entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible && visible.target !== activeRailSection) syncRail(visible.target);
      }, { rootMargin: "-34% 0px -52% 0px", threshold: [0, .18, .42, .7] });
      railSections.forEach(section => railObserver.observe(section));
    }
    document.querySelectorAll(".lang-btn").forEach(button => {
      button.addEventListener("click", () => requestAnimationFrame(() => syncRail(activeRailSection, false)));
    });
  }

  const messageField = document.getElementById("message");
  const messageCounter = document.getElementById("messageCounter");
  const syncMessageCounter = () => {
    if (!messageField || !messageCounter) return;
    const limit = messageField.maxLength > 0 ? messageField.maxLength : 600;
    const length = messageField.value.length;
    messageCounter.textContent = `${length} / ${limit}`;
    messageCounter.classList.toggle("is-near-limit", length >= limit * .9);
  };
  messageField?.addEventListener("input", syncMessageCounter);
  syncMessageCounter();

  document.querySelectorAll(".field input,.field textarea,.field select").forEach(control => {
    const syncValueState = () => control.closest(".field")?.classList.toggle("has-value", Boolean(control.value));
    control.addEventListener("input", syncValueState);
    control.addEventListener("change", syncValueState);
    syncValueState();
  });

  const syncChrome = () => {
    const scrolled = window.scrollY > 28;
    header?.classList.toggle("scrolled", scrolled);
    themeMeta?.setAttribute(
      "content",
      document.body.classList.contains("light-mode") ? "#f3f7fc" : "#081225"
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
