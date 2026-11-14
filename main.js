/* =========================================================
   VUUT PORTFOLIO — interactive profile and motion system
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navbar = document.querySelector(".navbar");
  const navLinks = document.querySelectorAll(".nav-link");
  const revealItems = document.querySelectorAll(".reveal");
  const cursor = document.querySelector(".cursor-glow");
  const music = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");
  const backToTop = document.querySelector(".back-to-top");
  const year = document.getElementById("year");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation.
  const closeMenu = () => {
    if (!menuToggle || !navbar) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    navbar.classList.remove("open"); document.body.classList.remove("menu-open");
  };
  if (menuToggle && navbar) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
      menuToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
      navbar.classList.toggle("open", !open); document.body.classList.toggle("menu-open", !open);
    });
    navLinks.forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 760) closeMenu(); });
  }

  // Current section and header state.
  const sections = [...document.querySelectorAll("main section[id]")];
  const updateScrollUI = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 20); backToTop?.classList.toggle("visible", y > 500);
    let current = "home";
    sections.forEach(section => { if (y >= section.offsetTop - 180) current = section.id; });
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
  };
  updateScrollUI(); window.addEventListener("scroll", updateScrollUI, { passive: true });

  // Replayable reveal: content enters and leaves as it crosses the viewport.
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    }), { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });
    revealItems.forEach(item => observer.observe(item));
    const skillsSection = document.querySelector(".skills");
    if (skillsSection) {
      const bars = [...skillsSection.querySelectorAll(".skill-bar span")];
      const circles = [...skillsSection.querySelectorAll(".circle")];
      const skillObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Reset first, then animate to the saved value on every re-entry.
          bars.forEach(bar => { bar.style.width = "0"; });
          circles.forEach(circle => circle.style.setProperty("--percent", "0%"));
          requestAnimationFrame(() => requestAnimationFrame(() => {
            bars.forEach(bar => { bar.style.width = bar.dataset.width || "0"; });
            circles.forEach(circle => circle.style.setProperty("--percent", `${circle.dataset.percent || 0}%`));
          }));
        } else {
          bars.forEach(bar => { bar.style.width = "0"; });
          circles.forEach(circle => circle.style.setProperty("--percent", "0%"));
        }
      }), { threshold: .18 });
      skillObserver.observe(skillsSection);
    }
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
    document.querySelectorAll(".skill-bar span").forEach(bar => bar.style.width = bar.dataset.width || "0");
    document.querySelectorAll(".circle").forEach(circle => circle.style.setProperty("--percent", `${circle.dataset.percent || 0}%`));
  }

  // Four-switch creative profile. Add the matching image files in /images.
  const moods = [
    { title: "VISUAL THINKER", caption: "DESIGN • OBSERVE • CONNECT", image: "visual-thinker.jpg", alt: "Vuut — Visual Thinker portrait" },
    { title: "CONFUSED THINKER", caption: "QUESTION • EXPLORE • DISCOVER", image: "confused-thinker.jpg", alt: "Vuut — Confused Thinker portrait" },
    { title: "DREAMER", caption: "IMAGINE • COLLECT • CREATE", image: "dreamer.jpg", alt: "Vuut — Dreamer portrait" },
    { title: "FOCUSED CREATOR", caption: "FOCUS • REFINE • BUILD", image: " focused-creator.jpg", alt: "Vuut — Focused Creator portrait" }
  ];
  const moodCard = document.querySelector(".mood-card");
  const moodImage = document.querySelector(".mood-image");
  const moodTitle = document.querySelector(".mood-label");
  const moodCaption = document.querySelector(".mood-caption");
  const moodCount = document.querySelector(".mood-count");
  const moodButtons = document.querySelectorAll(".mood-dot");
  const setMood = index => {
    const mood = moods[index]; if (!mood || !moodImage) return;
    moodImage.classList.add("is-changing");
    window.setTimeout(() => {
      moodImage.src = mood.image; moodImage.alt = mood.alt;
      moodImage.onload = () => moodImage.classList.remove("is-changing");
      moodImage.onerror = () => { moodImage.src = "images/mood-visual-thinker.jpg"; moodImage.classList.remove("is-changing"); moodImage.alt = `${mood.alt} — using the default portrait until its mood image is added`; };
      if (moodTitle) moodTitle.innerHTML = `${mood.title} <span>✦</span>`;
      if (moodCaption) moodCaption.textContent = mood.caption;
      if (moodCount) moodCount.textContent = `${String(index + 1).padStart(2,"0")} / 04`;
      if (moodCard) moodCard.dataset.mood = String(index);
      moodButtons.forEach((button, i) => {
        const active = i === index; button.classList.toggle("active", active); button.setAttribute("aria-pressed", String(active));
      });
    }, 160);
  };
  moodButtons.forEach(button => button.addEventListener("click", () => setMood(Number(button.dataset.moodIndex))));

  // Six flip-door cards: click/tap to reveal the personal reminder or compliment.
  document.querySelectorAll(".door-card").forEach(card => {
    card.addEventListener("click", () => {
      const open = card.classList.toggle("is-open");
      card.setAttribute("aria-expanded", String(open));
    });
  });

  // Circular cursor follows pointer and reacts to interactive surfaces.
  if (cursor && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduceMotion) {
    cursor.style.opacity = "1";
    window.addEventListener("pointermove", event => {
      cursor.style.left = `${event.clientX}px`; cursor.style.top = `${event.clientY}px`;
      const target = event.target.closest("a, button, .skill-panel, .creative-card, .service-card, .social-card, .discord-card, .mood-card, .door-card");
      cursor.classList.toggle("active", Boolean(target));
    }, { passive: true });
    document.addEventListener("pointerleave", () => { cursor.style.opacity = "0"; });
    document.addEventListener("pointerenter", () => { cursor.style.opacity = "1"; });
  }

  // Gentle card tilt on pointer devices; disabled on touch and reduced-motion.
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".skill-panel, .creative-card, .service-card, .social-card, .discord-card, .door-card").forEach(card => {
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  // User-controlled audio only; no autoplay.
  if (music && musicToggle) {
    music.volume = .22;
    musicToggle.addEventListener("click", async () => {
      if (music.paused) {
        try { await music.play(); musicToggle.classList.add("playing"); musicToggle.setAttribute("aria-pressed","true"); musicToggle.setAttribute("aria-label","Pause background music"); musicToggle.innerHTML = '<span aria-hidden="true">Ⅱ</span>'; }
        catch (error) { musicToggle.setAttribute("aria-label","Background music unavailable"); console.warn("Background music could not be played:", error); }
      } else {
        music.pause(); musicToggle.classList.remove("playing"); musicToggle.setAttribute("aria-pressed","false"); musicToggle.setAttribute("aria-label","Play background music"); musicToggle.innerHTML = '<span aria-hidden="true">♫</span>';
      }
    });
  }
});
