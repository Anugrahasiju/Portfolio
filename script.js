const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progressBar = document.querySelector(".scroll-progress-bar");
const particleField = document.querySelector(".particle-field");
const tiltCards = document.querySelectorAll(".tilt-card");
const sections = document.querySelectorAll("main section[id], footer[id]");
const navLinks = document.querySelectorAll(".nav a");
const scrollMotionElements = document.querySelectorAll(".scroll-motion");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -10% 0px",
  }
);

document.querySelectorAll(".reveal").forEach((element) => {
  const delay = element.dataset.delay;
  if (delay) {
    element.style.setProperty("--delay", `${delay}s`);
  }
  observer.observe(element);
});

if (!reducedMotion) {
  const parallaxElements = document.querySelectorAll(".parallax");
  let ticking = false;

  if (particleField) {
    const particleCount = window.innerWidth < 720 ? 12 : 20;
    const fragment = document.createDocumentFragment();

    for (let index = 0; index < particleCount; index += 1) {
      const particle = document.createElement("span");
      particle.className = "particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.setProperty("--size", `${Math.random() * 5 + 3}px`);
      particle.style.setProperty("--duration", `${Math.random() * 10 + 14}s`);
      particle.style.setProperty("--delay", `${Math.random() * -16}s`);
      fragment.appendChild(particle);
    }

    particleField.appendChild(fragment);
  }

  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (window.innerWidth < 720) {
        return;
      }

      const rect = card.getBoundingClientRect();
      const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
      const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-rotate-x", `${(offsetY * -8).toFixed(2)}deg`);
      card.style.setProperty("--tilt-rotate-y", `${(offsetX * 10).toFixed(2)}deg`);
      card.style.setProperty("--glow-x", `${((offsetX + 0.5) * 100).toFixed(2)}%`);
      card.style.setProperty("--glow-y", `${((offsetY + 0.5) * 100).toFixed(2)}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--tilt-rotate-x");
      card.style.removeProperty("--tilt-rotate-y");
      card.style.removeProperty("--glow-x");
      card.style.removeProperty("--glow-y");
    });
  });

  const updateParallax = () => {
    const viewportHeight = window.innerHeight;
    const scrollable = document.documentElement.scrollHeight - viewportHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;

    if (progressBar) {
      progressBar.style.width = `${(progress * 100).toFixed(2)}%`;
    }

    parallaxElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const speed = Number(element.dataset.speed || 0.12);
      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
      const y = centerOffset * speed * -0.35;
      const x = centerOffset * speed * 0.08;
      element.style.setProperty("--parallax-x", `${x.toFixed(2)}px`);
      element.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
    });

    scrollMotionElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
      const normalized = Math.max(-1, Math.min(1, centerOffset / viewportHeight));
      const direction = element.dataset.scroll || "up";
      let x = 0;
      let y = 0;
      let rotate = 0;
      let scale = 1;
      const strength = window.innerWidth < 720 ? 22 : 56;

      if (direction === "left") {
        x = normalized * -strength;
        rotate = normalized * -4;
      } else if (direction === "right") {
        x = normalized * strength;
        rotate = normalized * 4;
      } else if (direction === "down") {
        y = normalized * -strength;
        rotate = normalized * -2.2;
      } else {
        y = normalized * strength;
        rotate = normalized * 2.2;
      }

      scale = 1 - Math.abs(normalized) * 0.05;

      element.style.setProperty("--scroll-shift-x", `${x.toFixed(2)}px`);
      element.style.setProperty("--scroll-shift-y", `${y.toFixed(2)}px`);
      element.style.setProperty("--scroll-rotate", `${rotate.toFixed(2)}deg`);
      element.style.setProperty("--scroll-scale", scale.toFixed(3));
    });

    let currentSectionId = "";
    const activationLine = viewportHeight * 0.32;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= activationLine && rect.bottom >= activationLine) {
        currentSectionId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentSectionId}`;
      link.classList.toggle("is-active", isActive);
    });

    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  requestTick();
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
}
