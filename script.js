/**
 * ============================================================================
 * ANUGRAHA SIJU - BIOMEDICAL & EMBEDDED ENGINEERING PORTFOLIO
 * Motion Engine: Lenis Smooth Scroll + GSAP ScrollTrigger + Canvas Kinematics
 * Optimized for Desktop & High-Performance Android / Mobile Touch Devices
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. INITIALIZE ICONS & CORE DETECTIONS
  // --------------------------------------------------------------------------
  if (window.lucide) {
    window.lucide.createIcons();
  }

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobile = window.innerWidth <= 768;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------------------
  // 2. LENIS SMOOTH SCROLL ENGINE (DESKTOP & ANDROID MOBILE SYNC)
  // --------------------------------------------------------------------------
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5,
      syncTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // --------------------------------------------------------------------------
  // 3. THEME SYSTEM & LOCALSTORAGE PERSISTENCE
  // --------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeDropdown = document.getElementById('themeDropdown');
  const themeOptions = document.querySelectorAll('.theme-opt');
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');

  const themeColors = {
    'cyber-teal': { primary: '#00f2fe', secondary: '#4facfe', bg: '#060a12' },
    'neon-purple': { primary: '#c084fc', secondary: '#818cf8', bg: '#060a12' },
    'electric-amber': { primary: '#fbbf24', secondary: '#f97316', bg: '#060a12' },
    'emerald-matrix': { primary: '#34d399', secondary: '#059669', bg: '#060a12' }
  };

  const savedTheme = localStorage.getItem('as_portfolio_theme') || 'cyber-teal';
  setTheme(savedTheme, false);

  if (themeToggleBtn && themeDropdown) {
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      themeDropdown.classList.remove('show');
    });
  }

  themeOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      const themeVal = opt.getAttribute('data-theme-val');
      setTheme(themeVal, true);
      if (themeDropdown) themeDropdown.classList.remove('show');
    });
  });

  function setTheme(themeName, showToast) {
    if (!themeColors[themeName]) themeName = 'cyber-teal';
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('as_portfolio_theme', themeName);

    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors[themeName].bg);
    }

    themeOptions.forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-theme-val') === themeName);
    });

    if (showToast) {
      showToastNotification(`Accent Theme switched to ${themeName.replace('-', ' ').toUpperCase()}`);
    }
  }

  // --------------------------------------------------------------------------
  // 4. ADVANCED CUSTOM CURSOR & FLUID PARTICLE TRAILS (DESKTOP)
  // --------------------------------------------------------------------------
  const cursorGlow = document.getElementById('cursorGlow');
  const cursorDot = document.getElementById('cursorDot');
  const cursorTag = document.getElementById('cursorTag');
  const cursorTrailCanvas = document.getElementById('cursorTrailCanvas');

  if (cursorGlow && cursorDot && cursorTrailCanvas) {
    const trailCtx = cursorTrailCanvas.getContext('2d');
    let trailWidth = cursorTrailCanvas.width = window.innerWidth;
    let trailHeight = cursorTrailCanvas.height = window.innerHeight;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX;
    let glowY = mouseY;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;
    let isMouseInWindow = true;

    cursorDot.style.opacity = '1';
    cursorGlow.style.opacity = '1';
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;

    // Trail nodes & Particles
    const trailPoints = [];
    const maxTrailPoints = 25;
    const trailParticles = [];
    const maxParticles = 80;

    class TrailParticle {
      constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx * 0.35 + (Math.random() - 0.5) * 2.2;
        this.vy = vy * 0.35 + (Math.random() - 0.5) * 2.2;
        this.radius = Math.random() * 3.5 + 1.5;
        this.life = 1.0;
        this.decay = Math.random() * 0.035 + 0.02;
        this.color = color;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.94;
        this.vy *= 0.94;
        this.life -= this.decay;
        this.radius *= 0.96;
      }
      draw(ctx) {
        if (this.life <= 0) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.max(0.4, this.radius), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = Math.max(0, this.life * 0.85);
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();
      }
    }

    function onPointerMove(e) {
      if (e.pointerType === 'touch') return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      isMouseInWindow = true;

      cursorGlow.style.opacity = '1';
      cursorDot.style.opacity = '1';
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      // Mouse velocity
      const vx = mouseX - prevMouseX;
      const vy = mouseY - prevMouseY;
      const speed = Math.sqrt(vx * vx + vy * vy);

      // Record trail point
      trailPoints.unshift({ x: mouseX, y: mouseY, age: 0 });
      if (trailPoints.length > maxTrailPoints) trailPoints.pop();

      // Emit particles on movement
      if (speed > 0.8) {
        const theme = document.documentElement.getAttribute('data-theme') || 'cyber-teal';
        const color = themeColors[theme] ? themeColors[theme].primary : '#00f2fe';
        const count = Math.min(4, Math.floor(speed / 3) + 1);
        for (let i = 0; i < count; i++) {
          if (trailParticles.length < maxParticles) {
            trailParticles.push(new TrailParticle(mouseX, mouseY, vx, vy, color));
          }
        }
      }

      prevMouseX = mouseX;
      prevMouseY = mouseY;
    }

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    document.addEventListener('mouseleave', () => {
      isMouseInWindow = false;
      cursorGlow.style.opacity = '0';
      cursorDot.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      isMouseInWindow = true;
      cursorGlow.style.opacity = '1';
      cursorDot.style.opacity = '1';
    });

    // Click Ripple & scale feedback
    window.addEventListener('mousedown', (e) => {
      cursorDot.classList.add('cursor-click');
      createClickRipple(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      cursorDot.classList.remove('cursor-click');
    });

    function createClickRipple(x, y) {
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      document.body.appendChild(ripple);
      setTimeout(() => {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 600);
    }

    // Contextual Hover States & Tags
    function setupCursorHoverInteractions() {
      const clickables = document.querySelectorAll('a, button, .theme-opt, .filter-btn, .joint-tab, .copy-btn, input, select, textarea, .nav-item');
      clickables.forEach((el) => {
        el.addEventListener('mouseenter', () => {
          cursorDot.classList.add('cursor-hover');
          if (cursorTag) {
            if (el.classList.contains('copy-btn')) cursorTag.textContent = 'COPY';
            else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') cursorTag.textContent = 'TYPE';
            else if (el.classList.contains('theme-opt')) cursorTag.textContent = 'THEME';
            else if (el.classList.contains('filter-btn')) cursorTag.textContent = 'FILTER';
            else cursorTag.textContent = '';
          }
        });
        el.addEventListener('mouseleave', () => {
          cursorDot.classList.remove('cursor-hover', 'cursor-drag', 'cursor-view');
          if (cursorTag) cursorTag.textContent = '';
        });
      });

      const sliders = document.querySelectorAll('input[type="range"], .toggle-switch');
      sliders.forEach((sl) => {
        sl.addEventListener('mouseenter', () => {
          cursorDot.classList.add('cursor-drag');
          if (cursorTag) cursorTag.textContent = 'DRAG';
        });
        sl.addEventListener('mouseleave', () => {
          cursorDot.classList.remove('cursor-drag');
          if (cursorTag) cursorTag.textContent = '';
        });
      });

      const canvases = document.querySelectorAll('#biomechCanvas, #telemetryChartCanvas, #filterScopeCanvas, #miniHeroScope');
      canvases.forEach((cv) => {
        cv.addEventListener('mouseenter', () => {
          cursorDot.classList.add('cursor-view');
          if (cursorTag) cursorTag.textContent = 'LIVE';
        });
        cv.addEventListener('mouseleave', () => {
          cursorDot.classList.remove('cursor-view');
          if (cursorTag) cursorTag.textContent = '';
        });
      });
    }
    setupCursorHoverInteractions();

    // Render Trail Canvas Loop
    function renderCursorTrails() {
      trailCtx.clearRect(0, 0, trailWidth, trailHeight);

      // Lerp glow position smoothly
      glowX += (mouseX - glowX) * 0.14;
      glowY += (mouseY - glowY) * 0.14;
      cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;

      const theme = document.documentElement.getAttribute('data-theme') || 'cyber-teal';
      const primaryColor = themeColors[theme] ? themeColors[theme].primary : '#00f2fe';

      // Draw connective energy ribbon
      if (trailPoints.length > 1) {
        trailCtx.save();
        trailCtx.lineCap = 'round';
        trailCtx.lineJoin = 'round';

        for (let i = 0; i < trailPoints.length - 1; i++) {
          const p1 = trailPoints[i];
          const p2 = trailPoints[i + 1];
          p1.age += 1;

          const ratio = 1 - (i / trailPoints.length);
          const lineWidth = ratio * 4.8;
          const alpha = ratio * 0.65;

          trailCtx.beginPath();
          trailCtx.moveTo(p1.x, p1.y);
          trailCtx.lineTo(p2.x, p2.y);
          trailCtx.lineWidth = Math.max(0.6, lineWidth);
          trailCtx.strokeStyle = primaryColor;
          trailCtx.shadowColor = primaryColor;
          trailCtx.shadowBlur = 12;
          trailCtx.globalAlpha = alpha;
          trailCtx.stroke();
        }
        trailCtx.restore();
      }

      // Draw & update floating spark particles
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        p.update();
        p.draw(trailCtx);
        if (p.life <= 0) {
          trailParticles.splice(i, 1);
        }
      }

      requestAnimationFrame(renderCursorTrails);
    }
    renderCursorTrails();

    function resizeTrailCanvas() {
      trailWidth = cursorTrailCanvas.width = window.innerWidth;
      trailHeight = cursorTrailCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeTrailCanvas, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 4B. 3D PERSPECTIVE CARD TILT & MOUSE SPOTLIGHT SYSTEM
  // --------------------------------------------------------------------------
  const tiltCards = document.querySelectorAll(
    '.bento-card, .project-full-card, .skill-category-card, .edu-card, .timeline-card, .contact-method-card, .contact-form-panel, .sandbox-controls-panel, .sandbox-stage-panel, .holo-card'
  );

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4.5;
      const rotateY = ((x - centerX) / centerX) * 4.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`;
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out';
    });
  });

  // Magnetic Interactive Buttons
  const magneticElements = document.querySelectorAll('.magnetic-btn, .navbar-brand, .theme-btn');
  magneticElements.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${(x * 0.22).toFixed(1)}px, ${(y * 0.22).toFixed(1)}px, 0)`;
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0px, 0px, 0)';
    });
  });
  // --------------------------------------------------------------------------
  // 5. AMBIENT BACKGROUND CANVAS (LOW-OVERHEAD CONSTELLATION)
  // --------------------------------------------------------------------------
  const ambientCanvas = document.getElementById('ambientCanvas');
  if (ambientCanvas) {
    const ctx = ambientCanvas.getContext('2d');
    let width = ambientCanvas.width = window.innerWidth;
    let height = ambientCanvas.height = window.innerHeight;

    const particleCount = isMobile ? 18 : 36;
    const particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.8 + 0.8;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
      draw() {
        const theme = document.documentElement.getAttribute('data-theme') || 'cyber-teal';
        const color = themeColors[theme] ? themeColors[theme].primary : '#00f2fe';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    function renderAmbient() {
      ctx.clearRect(0, 0, width, height);
      const theme = document.documentElement.getAttribute('data-theme') || 'cyber-teal';
      const color = themeColors[theme] ? themeColors[theme].primary : '#00f2fe';

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = isMobile ? 80 : 120;

          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = color;
            ctx.globalAlpha = (1 - dist / maxDist) * 0.18;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }
      requestAnimationFrame(renderAmbient);
    }
    renderAmbient();

    window.addEventListener('resize', () => {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 6. GSAP SCROLLTRIGGER & EXHAUSTIVE SECTION TRANSITION SUITE
  // --------------------------------------------------------------------------
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // A. HERO SECTION ENTRANCE & DYNAMIC COUNTER TIMELINE
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
      heroTl
        .from('.navbar-container', { y: -30, opacity: 0, duration: 0.85 })
        .from('.status-pill', { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from('.hero-eyebrow', { y: 20, opacity: 0, duration: 0.5 }, '-=0.4')
        .from('.hero-title', { y: 35, opacity: 0, duration: 0.9, ease: 'power4.out' }, '-=0.4')
        .from('.hero-subline', { y: 25, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.hero-cta-group .btn', { y: 25, opacity: 0, stagger: 0.1, duration: 0.65 }, '-=0.5')
        .from('.metric-card', { y: 30, opacity: 0, stagger: 0.1, duration: 0.75, ease: 'back.out(1.4)' }, '-=0.4')
        .from('.gsap-hero-visual', { scale: 0.88, y: 40, opacity: 0, duration: 1.1, ease: 'power3.out' }, '-=0.9');

      // Metric Animated Number Counters
      document.querySelectorAll('.metric-number').forEach((counter) => {
        const targetVal = parseFloat(counter.getAttribute('data-count'));
        if (isNaN(targetVal)) return;

        const countAttr = counter.getAttribute('data-count') || '';
        const isDecimal = countAttr.includes('.');
        const decimalPlaces = isDecimal ? countAttr.split('.')[1].length : 0;

        ScrollTrigger.create({
          trigger: counter,
          start: 'top 90%',
          onEnter: () => {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: targetVal,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate: () => {
                counter.textContent = obj.val.toFixed(decimalPlaces);
              }
            });
          },
          once: true
        });
      });

      // B. UNIVERSAL SECTION REVEAL TRANSITIONS (EVERY SECTION)
      const allSections = document.querySelectorAll('.section-block');
      allSections.forEach((section) => {
        // Section Header Reveal
        const header = section.querySelector('.section-header');
        if (header) {
          const subTag = header.querySelector('.section-subtitle-tag');
          const title = header.querySelector('.section-title');
          const desc = header.querySelector('.section-description');

          const secTl = gsap.timeline({
            scrollTrigger: {
              trigger: header,
              start: 'top 95%',
              toggleActions: 'play none none none',
              once: true
            }
          });

          if (subTag) secTl.from(subTag, { y: -15, opacity: 0.6, scale: 0.95, duration: 0.5, ease: 'back.out(1.5)' });
          if (title) secTl.from(title, { y: 20, opacity: 0.7, duration: 0.6, ease: 'power2.out' }, '-=0.3');
          if (desc) secTl.from(desc, { y: 15, opacity: 0.7, duration: 0.6, ease: 'power2.out' }, '-=0.4');
        }

        // Section scanning beam sweep animation
        const beam = document.createElement('div');
        beam.className = 'section-scanner-beam';
        section.appendChild(beam);

        ScrollTrigger.create({
          trigger: section,
          start: 'top 95%',
          onEnter: () => {
            gsap.fromTo(beam, 
              { left: '0%', opacity: 0.9 }, 
              { left: '85%', opacity: 0, duration: 1.6, ease: 'power2.inOut' }
            );
          },
          once: true
        });
      });

      // C. ABOUT SECTION: BENTO GRID STAGGER & GPA RING
      ScrollTrigger.create({
        trigger: '.bento-grid',
        start: 'top 95%',
        onEnter: () => {
          gsap.from('.bento-card', {
            y: 30,
            opacity: 0.7,
            scale: 0.98,
            stagger: 0.08,
            duration: 0.7,
            ease: 'power2.out'
          });
          gsap.from('.highlight-item, .lab-chip, .role-pill', {
            y: 15,
            opacity: 0.7,
            stagger: 0.04,
            duration: 0.5,
            delay: 0.2,
            ease: 'power2.out'
          });
        },
        once: true
      });

      // GPA Progress Ring
      ScrollTrigger.create({
        trigger: '.gpa-display',
        start: 'top 95%',
        onEnter: () => {
          const gpaFg = document.querySelector('.gpa-fg-circle');
          if (gpaFg) {
            gpaFg.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
            gpaFg.style.strokeDashoffset = '28.2';
          }
        },
        once: true
      });

      // D. FLAGSHIP PROJECTS SECTION
      ScrollTrigger.create({
        trigger: '.project-filters',
        start: 'top 95%',
        onEnter: () => {
          gsap.from('.filter-btn', {
            y: 15,
            opacity: 0.7,
            stagger: 0.06,
            duration: 0.5,
            ease: 'back.out(1.5)'
          });
        },
        once: true
      });

      const projectFullCards = gsap.utils.toArray('.project-full-card');
      projectFullCards.forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 95%',
            toggleActions: 'play none none none',
            once: true
          },
          y: 35,
          opacity: 0.75,
          scale: 0.98,
          duration: 0.7,
          ease: 'power2.out'
        });
      });

      // E. REHAB TELEMETRY SANDBOX SECTION
      ScrollTrigger.create({
        trigger: '.sandbox-wrapper',
        start: 'top 95%',
        onEnter: () => {
          gsap.from('.sandbox-controls-panel', {
            x: -25,
            opacity: 0.75,
            duration: 0.7,
            ease: 'power2.out'
          });
          gsap.from('.sandbox-stage-panel', {
            x: 25,
            opacity: 0.75,
            duration: 0.7,
            ease: 'power2.out'
          });
          gsap.from('.joint-tab', {
            y: 12,
            opacity: 0.75,
            stagger: 0.06,
            duration: 0.45,
            delay: 0.2,
            ease: 'back.out(1.5)'
          });
        },
        once: true
      });

      // F. TECHNICAL SKILLS SECTION
      ScrollTrigger.create({
        trigger: '#skills',
        start: 'top 95%',
        onEnter: () => {
          gsap.from('.skill-category-card', {
            y: 30,
            opacity: 0.75,
            scale: 0.98,
            stagger: 0.08,
            duration: 0.7,
            ease: 'power2.out'
          });

          // Animate Progress Fill Bars with Easing
          document.querySelectorAll('.skill-progress-fill').forEach((fill, i) => {
            const widthVal = fill.style.getPropertyValue('--skill-w') || '85%';
            fill.style.width = '0%';
            setTimeout(() => {
              fill.style.transition = 'width 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
              fill.style.width = widthVal;
            }, 200 + (i * 50));
          });

          // Stagger Cloud Tags
          gsap.from('.cloud-tag', {
            scale: 0.8,
            opacity: 0.7,
            stagger: 0.02,
            duration: 0.4,
            delay: 0.3,
            ease: 'back.out(1.5)'
          });
        },
        once: true
      });

      // G. LEADERSHIP JOURNEY & TIMELINE SCRUB
      const timelineContainer = document.querySelector('.timeline-container');
      const timelineSpine = document.querySelector('.timeline-spine');

      if (timelineContainer && timelineSpine) {
        gsap.fromTo(timelineSpine, 
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: timelineContainer,
              start: 'top 85%',
              end: 'bottom 85%',
              scrub: 0.5
            }
          }
        );
      }

      gsap.utils.toArray('.timeline-entry').forEach((entry) => {
        const node = entry.querySelector('.timeline-node');
        const card = entry.querySelector('.timeline-card');

        ScrollTrigger.create({
          trigger: entry,
          start: 'top 95%',
          onEnter: () => {
            if (node) gsap.from(node, { scale: 0.5, opacity: 0.7, duration: 0.5, ease: 'back.out(1.5)' });
            if (card) gsap.from(card, { x: 25, opacity: 0.75, duration: 0.65, ease: 'power2.out' });
          },
          once: true
        });
      });

      // H. EDUCATION & ACADEMIC PEDIGREE SECTION
      ScrollTrigger.create({
        trigger: '.education-cards-grid',
        start: 'top 95%',
        onEnter: () => {
          gsap.from('.edu-card', {
            y: 30,
            opacity: 0.75,
            scale: 0.98,
            stagger: 0.1,
            duration: 0.7,
            ease: 'power2.out'
          });
          gsap.from('.edu-score-box', {
            scale: 0.9,
            opacity: 0.75,
            stagger: 0.1,
            duration: 0.5,
            delay: 0.25,
            ease: 'back.out(1.5)'
          });
        },
        once: true
      });

      // I. CONTACT HUB SECTION
      ScrollTrigger.create({
        trigger: '.contact-hub-wrapper',
        start: 'top 95%',
        onEnter: () => {
          gsap.from('.contact-info-panel', {
            x: -25,
            opacity: 0.75,
            duration: 0.7,
            ease: 'power2.out'
          });
          gsap.from('.contact-form-panel', {
            x: 25,
            opacity: 0.75,
            duration: 0.7,
            ease: 'power2.out'
          });
          gsap.from('.contact-method-card', {
            x: -15,
            opacity: 0.75,
            stagger: 0.08,
            duration: 0.55,
            delay: 0.2,
            ease: 'power2.out'
          });
        },
        once: true
      });

      // Refresh ScrollTrigger after initial DOM calculations
      ScrollTrigger.refresh();
      window.addEventListener('load', () => {
        ScrollTrigger.refresh();
      });
  }

  // --------------------------------------------------------------------------
  // 7. SCROLL PROGRESS & BACK TO TOP BUTTON
  // --------------------------------------------------------------------------
  const progressBar = document.getElementById('progressBar');
  const backToTopBtn = document.getElementById('backToTopBtn');
  const progressRingCircle = document.querySelector('.progress-ring-circle');
  const navLinks = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id], footer[id]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? scrollY / docHeight : 0;

    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }

    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }

      if (progressRingCircle) {
        const circumference = 132;
        const offset = circumference - (progress * circumference);
        progressRingCircle.style.strokeDashoffset = offset;
      }
    }

    // Active Section Navigation Highlighting
    let currentId = '';
    const activationLine = window.innerHeight * 0.35;
    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= activationLine && rect.bottom >= activationLine) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      const navTarget = link.getAttribute('data-nav');
      link.classList.toggle('is-active', navTarget === currentId);
    });
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // --------------------------------------------------------------------------
  // 8. MOBILE DRAWER NAVIGATION & SMOOTH SECTION TRANSITIONS
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.classList.toggle('is-active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('is-active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Smooth Navigation Links scroll via Lenis + Section Glow Pulse
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        // Close mobile drawer if open
        if (mobileDrawer) {
          mobileDrawer.classList.remove('open');
          if (mobileToggle) mobileToggle.classList.remove('is-active');
        }

        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -80, duration: 1.1 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Section transition highlight pulse
        const header = targetEl.querySelector('.section-header') || targetEl;
        header.classList.add('section-highlight-pulse');
        setTimeout(() => {
          header.classList.remove('section-highlight-pulse');
        }, 1200);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 9. MINI HERO BIO-SIGNAL SCOPE SIMULATOR (CANVAS)
  // --------------------------------------------------------------------------
  const miniHeroScope = document.getElementById('miniHeroScope');
  if (miniHeroScope) {
    const scopeCtx = miniHeroScope.getContext('2d');
    let scopeWidth = miniHeroScope.width;
    let scopeHeight = miniHeroScope.height;
    let scopeStep = 0;
    const waveHistory = new Array(Math.floor(scopeWidth / 2)).fill(scopeHeight / 2);

    function getEcgSample(t) {
      const cycle = (t % 120) / 120;
      const base = scopeHeight / 2;
      // Synthesize P-Q-R-S-T cardiac waveform
      if (cycle > 0.15 && cycle < 0.22) {
        return base - Math.sin((cycle - 0.15) / 0.07 * Math.PI) * 4; // P wave
      } else if (cycle > 0.28 && cycle < 0.31) {
        return base + 3; // Q dip
      } else if (cycle >= 0.31 && cycle <= 0.37) {
        return base - Math.sin((cycle - 0.31) / 0.06 * Math.PI) * 16; // R peak
      } else if (cycle > 0.37 && cycle < 0.41) {
        return base + 5; // S dip
      } else if (cycle > 0.48 && cycle < 0.62) {
        return base - Math.sin((cycle - 0.48) / 0.14 * Math.PI) * 6; // T wave
      }
      return base + (Math.random() - 0.5) * 1.5;
    }

    function renderMiniScope() {
      scopeStep += 1;
      const newSample = getEcgSample(scopeStep);
      waveHistory.push(newSample);
      waveHistory.shift();

      scopeCtx.clearRect(0, 0, scopeWidth, scopeHeight);

      // Grid Lines
      scopeCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      scopeCtx.lineWidth = 1;
      scopeCtx.beginPath();
      for (let y = 0; y < scopeHeight; y += 14) {
        scopeCtx.moveTo(0, y);
        scopeCtx.lineTo(scopeWidth, y);
      }
      for (let x = 0; x < scopeWidth; x += 20) {
        scopeCtx.moveTo(x, 0);
        scopeCtx.lineTo(x, scopeHeight);
      }
      scopeCtx.stroke();

      // Waveform line
      const theme = document.documentElement.getAttribute('data-theme') || 'cyber-teal';
      const color = themeColors[theme] ? themeColors[theme].primary : '#00f2fe';

      scopeCtx.beginPath();
      scopeCtx.strokeStyle = color;
      scopeCtx.lineWidth = 1.8;
      for (let i = 0; i < waveHistory.length; i++) {
        const x = i * 2;
        const y = waveHistory[i];
        if (i === 0) scopeCtx.moveTo(x, y);
        else scopeCtx.lineTo(x, y);
      }
      scopeCtx.stroke();

      requestAnimationFrame(renderMiniScope);
    }
    renderMiniScope();
  }

  // --------------------------------------------------------------------------
  // 10. FFT FREQUENCY SPECTRUM SCOPE SIMULATOR (PROJECT 3 CANVAS)
  // --------------------------------------------------------------------------
  const filterScopeCanvas = document.getElementById('filterScopeCanvas');
  if (filterScopeCanvas) {
    const fftCtx = filterScopeCanvas.getContext('2d');
    let fftWidth = filterScopeCanvas.width;
    let fftHeight = filterScopeCanvas.height;
    let fftTick = 0;

    function renderFft() {
      fftTick += 0.04;
      fftCtx.clearRect(0, 0, fftWidth, fftHeight);

      // Grid
      fftCtx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      fftCtx.lineWidth = 1;
      fftCtx.beginPath();
      for (let y = 10; y < fftHeight; y += 24) {
        fftCtx.moveTo(0, y);
        fftCtx.lineTo(fftWidth, y);
      }
      fftCtx.stroke();

      const theme = document.documentElement.getAttribute('data-theme') || 'cyber-teal';
      const color = themeColors[theme] ? themeColors[theme].primary : '#00f2fe';

      // Draw Bandpass Curve with 50Hz notch attenuation
      fftCtx.beginPath();
      fftCtx.strokeStyle = color;
      fftCtx.lineWidth = 2.2;
      fftCtx.fillStyle = `${color}18`;

      fftCtx.moveTo(0, fftHeight - 15);
      for (let x = 0; x < fftWidth; x += 3) {
        const freqNorm = x / fftWidth; // 0 to 1
        let gain = Math.sin(freqNorm * Math.PI) * (fftHeight - 35);
        
        // 50Hz notch dip around freqNorm ~ 0.35
        if (freqNorm > 0.30 && freqNorm < 0.40) {
          const notchDist = Math.abs(freqNorm - 0.35) / 0.05;
          gain *= notchDist;
        }

        const animatedNoise = (Math.sin(x * 0.2 + fftTick) + Math.cos(x * 0.4 - fftTick)) * 2;
        const y = Math.max(15, fftHeight - gain - animatedNoise - 15);
        fftCtx.lineTo(x, y);
      }

      fftCtx.lineTo(fftWidth, fftHeight);
      fftCtx.lineTo(0, fftHeight);
      fftCtx.closePath();
      fftCtx.fill();
      fftCtx.stroke();

      requestAnimationFrame(renderFft);
    }
    renderFft();
  }

  // --------------------------------------------------------------------------
  // 11. REHABILITATION TELEMETRY SANDBOX KINEMATIC ENGINE
  // --------------------------------------------------------------------------
  const jointAngleSlider = document.getElementById('jointAngleSlider');
  const liveAngleDisplay = document.getElementById('liveAngleDisplay');
  const sliderMidTick = document.getElementById('sliderMidTick');
  const sliderMaxTick = document.getElementById('sliderMaxTick');
  const jointTabs = document.querySelectorAll('.joint-tab');
  const toggleAutoSimBtn = document.getElementById('toggleAutoSimBtn');
  const autoSimText = document.getElementById('autoSimText');
  const autoSimIcon = document.getElementById('autoSimIcon');
  const noiseToggle = document.getElementById('noiseToggle');
  const resetSandboxBtn = document.getElementById('resetSandboxBtn');
  const feedbackBox = document.getElementById('feedbackBox');
  const fbHeading = document.getElementById('fbHeading');
  const fbMessage = document.getElementById('fbMessage');
  const repCountDisplay = document.getElementById('repCount');
  const maxRomDisplay = document.getElementById('maxRom');
  const smoothnessScoreDisplay = document.getElementById('smoothnessScore');
  const chartVelDisplay = document.getElementById('chartVelDisplay');
  const cardDialValue = document.getElementById('cardDialValue');
  const cardDialFill = document.getElementById('cardDialFill');
  const cardVelVal = document.getElementById('cardVelVal');
  const heroLiveAngle = document.getElementById('heroLiveAngle');

  const biomechCanvas = document.getElementById('biomechCanvas');
  const telemetryChartCanvas = document.getElementById('telemetryChartCanvas');

  let currentJoint = 'elbow';
  let jointMin = 0;
  let jointMax = 145;
  let jointIdeal = 130;
  let currentAngle = 65;
  let targetAngle = 65;
  let previousAngle = 65;
  let angularVelocity = 0;
  let repCount = 0;
  let maxRomReached = 65;
  let isFlexingPhase = true;
  let isAutoSimRunning = false;
  let autoSimAngle = 0;
  let telemetryWaveHistory = new Array(80).fill(65);

  // Joint Configurations
  const jointConfigs = {
    elbow: { min: 0, max: 145, ideal: 130, label: 'Flexion' },
    knee: { min: 0, max: 135, ideal: 120, label: 'Extension' },
    shoulder: { min: 0, max: 180, ideal: 160, label: 'Abduction' }
  };

  // Joint Tab Click Handlers
  jointTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      jointTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentJoint = tab.getAttribute('data-joint');
      const cfg = jointConfigs[currentJoint];
      jointMin = cfg.min;
      jointMax = cfg.max;
      jointIdeal = cfg.ideal;

      if (jointAngleSlider) {
        jointAngleSlider.min = jointMin;
        jointAngleSlider.max = jointMax;
        jointAngleSlider.value = Math.min(jointMax, Math.max(jointMin, jointAngleSlider.value));
        currentAngle = parseFloat(jointAngleSlider.value);
        targetAngle = currentAngle;
      }

      if (sliderMidTick) sliderMidTick.textContent = `${((jointMin + jointMax) / 2).toFixed(1)}°`;
      if (sliderMaxTick) sliderMaxTick.textContent = `${jointMax}° (Target ${cfg.label})`;

      updateFeedback();
      showToastNotification(`Rehab Simulator switched to ${currentJoint.toUpperCase()} kinematics`);
    });
  });

  // Slider Input Handler (Pointer & Touch on Android)
  if (jointAngleSlider) {
    jointAngleSlider.addEventListener('input', (e) => {
      targetAngle = parseFloat(e.target.value);
      if (isAutoSimRunning) {
        stopAutoSim();
      }
    });
  }

  // Auto-Simulator Routine
  if (toggleAutoSimBtn) {
    toggleAutoSimBtn.addEventListener('click', () => {
      if (isAutoSimRunning) {
        stopAutoSim();
      } else {
        startAutoSim();
      }
    });
  }

  function startAutoSim() {
    isAutoSimRunning = true;
    if (autoSimText) autoSimText.textContent = 'Pause Auto Routine';
    if (toggleAutoSimBtn) toggleAutoSimBtn.classList.add('btn-primary');
    showToastNotification('Auto Exercise Routine Started');
  }

  function stopAutoSim() {
    isAutoSimRunning = false;
    if (autoSimText) autoSimText.textContent = 'Start Auto Exercise Routine';
    if (toggleAutoSimBtn) toggleAutoSimBtn.classList.remove('btn-primary');
  }

  // Reset Counters
  if (resetSandboxBtn) {
    resetSandboxBtn.addEventListener('click', () => {
      repCount = 0;
      maxRomReached = currentAngle;
      if (repCountDisplay) repCountDisplay.textContent = '0';
      if (maxRomDisplay) maxRomDisplay.textContent = `${Math.round(maxRomReached)}°`;
      showToastNotification('Repetition counter & max ROM reset');
    });
  }

  // Kinematics Loop & Evaluation (60 FPS)
  function updateKinematics() {
    // Auto routine generator
    if (isAutoSimRunning) {
      autoSimAngle += 0.035;
      const normalizedSine = (Math.sin(autoSimAngle) + 1) / 2; // 0 to 1
      targetAngle = jointMin + normalizedSine * (jointMax - jointMin);
      if (jointAngleSlider) jointAngleSlider.value = targetAngle;
    }

    // Apply Simulated Sensor Noise if enabled
    let noisyTarget = targetAngle;
    if (noiseToggle && noiseToggle.checked) {
      noisyTarget += (Math.random() - 0.5) * 1.8;
    }

    // Digital Low-Pass Complementary Filter Simulation (alpha = 0.18)
    const alpha = 0.18;
    const nextAngle = currentAngle + (noisyTarget - currentAngle) * alpha;
    angularVelocity = Math.abs(nextAngle - previousAngle) * 60; // deg/sec (at 60fps)

    previousAngle = currentAngle;
    currentAngle = nextAngle;

    // Repetition counting logic based on inflection
    if (isFlexingPhase && currentAngle >= jointIdeal * 0.92) {
      isFlexingPhase = false;
      repCount += 1;
      if (repCountDisplay) repCountDisplay.textContent = repCount;
    } else if (!isFlexingPhase && currentAngle <= jointMin + (jointMax - jointMin) * 0.15) {
      isFlexingPhase = true;
    }

    // Max ROM Tracking
    if (currentAngle > maxRomReached) {
      maxRomReached = currentAngle;
      if (maxRomDisplay) maxRomDisplay.textContent = `${Math.round(maxRomReached)}°`;
    }

    // UI Displays
    const displayAngleStr = `${Math.round(currentAngle)}°`;
    if (liveAngleDisplay) liveAngleDisplay.textContent = displayAngleStr;
    if (heroLiveAngle) heroLiveAngle.textContent = `${currentAngle.toFixed(1)}°`;
    if (cardDialValue) cardDialValue.textContent = displayAngleStr;
    if (cardVelVal) cardVelVal.textContent = `${angularVelocity.toFixed(1)} °/s`;
    if (chartVelDisplay) chartVelDisplay.textContent = `Velocity: ${angularVelocity.toFixed(1)} °/s`;

    // Sync card dial stroke
    if (cardDialFill) {
      const dashoffset = 408 - (408 * (currentAngle / jointMax));
      cardDialFill.style.strokeDashoffset = dashoffset;
    }

    // Push into Telemetry History
    telemetryWaveHistory.push(currentAngle);
    telemetryWaveHistory.shift();

    updateFeedback();
    renderBiomechCanvas();
    renderTelemetryChart();

    requestAnimationFrame(updateKinematics);
  }

  function updateFeedback() {
    if (!feedbackBox || !fbHeading || !fbMessage) return;

    if (angularVelocity > 130) {
      feedbackBox.className = 'sandbox-feedback-box danger';
      fbHeading.textContent = 'High Velocity Warning (>130°/s)';
      fbMessage.textContent = 'Motion is too rapid for controlled tendon rehabilitation. Decelerate joint speed.';
      if (smoothnessScoreDisplay) smoothnessScoreDisplay.textContent = '84%';
    } else if (currentAngle >= jointIdeal) {
      feedbackBox.className = 'sandbox-feedback-box';
      fbHeading.textContent = 'Target Range of Motion Achieved';
      fbMessage.textContent = `Full clinical ${jointConfigs[currentJoint].label} angle reached with optimal bio-mechanical control.`;
      if (smoothnessScoreDisplay) smoothnessScoreDisplay.textContent = '99%';
    } else {
      feedbackBox.className = 'sandbox-feedback-box';
      fbHeading.textContent = 'Exercise Motion in Optimal Zone';
      fbMessage.textContent = 'Smooth trajectory and kinematic progression within verified medical safety margins.';
      if (smoothnessScoreDisplay) smoothnessScoreDisplay.textContent = '96%';
    }
  }

  // Render 2D Biomechanical Skeleton
  function renderBiomechCanvas() {
    if (!biomechCanvas) return;
    const bCtx = biomechCanvas.getContext('2d');
    const w = biomechCanvas.width;
    const h = biomechCanvas.height;

    bCtx.clearRect(0, 0, w, h);

    const theme = document.documentElement.getAttribute('data-theme') || 'cyber-teal';
    const color = themeColors[theme] ? themeColors[theme].primary : '#00f2fe';

    // Base coordinate origins
    const originX = w * 0.40;
    const originY = h * 0.65;
    const upperLength = 80;
    const foreLength = 85;

    // Joint 1: Fixed Proximal Limb
    const baseAngle = -Math.PI / 2.2;
    const jointX = originX + Math.cos(baseAngle) * upperLength;
    const jointY = originY + Math.sin(baseAngle) * upperLength;

    // Joint 2: Distal Flexing Limb
    const radAngle = (currentAngle * Math.PI) / 180;
    const distalAngle = baseAngle + Math.PI - radAngle;
    const endX = jointX + Math.cos(distalAngle) * foreLength;
    const endY = jointY + Math.sin(distalAngle) * foreLength;

    // Draw Reference Target Arc
    bCtx.beginPath();
    bCtx.arc(jointX, jointY, 40, baseAngle + Math.PI - (jointMax * Math.PI / 180), baseAngle + Math.PI);
    bCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    bCtx.lineWidth = 4;
    bCtx.stroke();

    // Draw Live Flexion Arc
    bCtx.beginPath();
    bCtx.arc(jointX, jointY, 40, distalAngle, baseAngle + Math.PI);
    bCtx.strokeStyle = color;
    bCtx.lineWidth = 4;
    bCtx.stroke();

    // Upper Bone (Humerus / Femur)
    bCtx.beginPath();
    bCtx.moveTo(originX, originY);
    bCtx.lineTo(jointX, jointY);
    bCtx.strokeStyle = '#475569';
    bCtx.lineWidth = 10;
    bCtx.lineCap = 'round';
    bCtx.stroke();

    // Lower Bone (Forearm / Tibia)
    bCtx.beginPath();
    bCtx.moveTo(jointX, jointY);
    bCtx.lineTo(endX, endY);
    bCtx.strokeStyle = color;
    bCtx.lineWidth = 8;
    bCtx.lineCap = 'round';
    bCtx.stroke();

    // Joints Pointers
    // Base Anchor
    bCtx.beginPath();
    bCtx.arc(originX, originY, 7, 0, Math.PI * 2);
    bCtx.fillStyle = '#64748b';
    bCtx.fill();

    // Kinematic Active Pivot (Sensor Node)
    bCtx.beginPath();
    bCtx.arc(jointX, jointY, 9, 0, Math.PI * 2);
    bCtx.fillStyle = color;
    bCtx.shadowColor = color;
    bCtx.shadowBlur = 12;
    bCtx.fill();
    bCtx.shadowBlur = 0;

    // Distal Point
    bCtx.beginPath();
    bCtx.arc(endX, endY, 6, 0, Math.PI * 2);
    bCtx.fillStyle = '#ffffff';
    bCtx.fill();

    // Draw Angle Callout Text
    bCtx.font = '700 16px "Space Grotesk", sans-serif';
    bCtx.fillStyle = '#ffffff';
    bCtx.fillText(`${Math.round(currentAngle)}°`, jointX + 24, jointY - 14);

    bCtx.font = '500 11px "JetBrains Mono", monospace';
    bCtx.fillStyle = color;
    bCtx.fillText(`[ MPU6050 SENSOR: ±${(angularVelocity).toFixed(1)}°/s ]`, originX - 40, originY + 28);
  }

  // Render Realtime Telemetry Waveform Chart
  function renderTelemetryChart() {
    if (!telemetryChartCanvas) return;
    const tCtx = telemetryChartCanvas.getContext('2d');
    const w = telemetryChartCanvas.width;
    const h = telemetryChartCanvas.height;

    tCtx.clearRect(0, 0, w, h);

    const theme = document.documentElement.getAttribute('data-theme') || 'cyber-teal';
    const color = themeColors[theme] ? themeColors[theme].primary : '#00f2fe';

    // Horizontal grid
    tCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    tCtx.lineWidth = 1;
    tCtx.beginPath();
    tCtx.moveTo(0, h / 2);
    tCtx.lineTo(w, h / 2);
    tCtx.stroke();

    // Waveform
    tCtx.beginPath();
    tCtx.strokeStyle = color;
    tCtx.lineWidth = 2;

    const stepX = w / (telemetryWaveHistory.length - 1);
    for (let i = 0; i < telemetryWaveHistory.length; i++) {
      const val = telemetryWaveHistory[i];
      const y = h - ((val / jointMax) * (h - 14)) - 7;
      const x = i * stepX;

      if (i === 0) tCtx.moveTo(x, y);
      else tCtx.lineTo(x, y);
    }
    tCtx.stroke();
  }

  updateKinematics();

  // --------------------------------------------------------------------------
  // 12. PROJECT FILTERING TABS
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-full-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const categories = card.getAttribute('data-category') || '';
        if (filterVal === 'all' || categories.includes(filterVal)) {
          card.style.display = 'flex';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --------------------------------------------------------------------------
  // 13. INTERACTIVE CONTACT FORM & TOAST DISPATCHER
  // --------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const copyBtns = document.querySelectorAll('.copy-btn');

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToastNotification(`Copied "${textToCopy}" to clipboard!`);
        });
      }
    });
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('userName');
      const emailInput = document.getElementById('userEmail');
      const subjectInput = document.getElementById('userSubject');
      const messageInput = document.getElementById('userMessage');

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        showFieldError('nameError', 'Please enter your name');
        isValid = false;
      } else {
        clearFieldError('nameError');
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        showFieldError('emailError', 'Please enter a valid email address');
        isValid = false;
      } else {
        clearFieldError('emailError');
      }

      // Validate Subject
      if (!subjectInput.value) {
        showFieldError('subjectError', 'Please select an inquiry purpose');
        isValid = false;
      } else {
        clearFieldError('subjectError');
      }

      // Validate Message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        showFieldError('messageError', 'Message should be at least 10 characters');
        isValid = false;
      } else {
        clearFieldError('messageError');
      }

      if (isValid) {
        // Construct mailto link
        const subject = encodeURIComponent(`[Portfolio Inquiry] ${subjectInput.value} - From ${nameInput.value}`);
        const body = encodeURIComponent(`Name: ${nameInput.value}\nEmail: ${emailInput.value}\n\nMessage:\n${messageInput.value}`);
        const mailtoUri = `mailto:anugrahasiju11@gmail.com?subject=${subject}&body=${body}`;

        window.location.href = mailtoUri;
        showToastNotification('Email client launched with your message details!');
        contactForm.reset();
      }
    });
  }

  function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = msg;
      el.classList.add('visible');
    }
  }

  function clearFieldError(id) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = '';
      el.classList.remove('visible');
    }
  }

  function showToastNotification(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<i data-lucide="check-circle" style="color:var(--accent-primary); width:16px; height:16px;"></i> <span>${message}</span>`;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }
});
