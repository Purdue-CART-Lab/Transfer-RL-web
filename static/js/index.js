// =====================================================
// Project Page interactions
// Scroll reveal, theme toggle, BibTeX copy, lightbox,
// modal popups, cursor spotlight, 3D tilt cards,
// hero parallax, magnetic badges, scroll progress bar
// =====================================================

(function () {
  'use strict';

  // ---------- Mark JS-enabled (CSS gates initial-hidden state) ----------
  document.documentElement.classList.add('js');

  // ---------- Scroll-triggered fade-in (Intersection Observer) ----------
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Double rAF ensures the initial-hidden style was applied before
            // we trigger the animation — fixes the "shows instantly without
            // animating" issue on elements above the fold at page load.
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                entry.target.classList.add('visible');
              });
            });
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.10, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('visible'));
  }
  // Safety net: force-visible after 4s in case observer never fires
  setTimeout(() => {
    revealEls.forEach((el) => el.classList.add('visible'));
  }, 4000);

  // ---------- Theme toggle (light/dark) ----------
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'project-page-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀' : '☽';
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  // ---------- BibTeX copy ----------
  const copyBtn = document.getElementById('copyBibtex');
  const bibtexCode = document.getElementById('bibtexCode');

  // ---------- Confetti burst (used on BibTeX copy) ----------
  function confettiBurst(originEl, count = 24) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = originEl.getBoundingClientRect();
    const colors = ['#4b6cff', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ec4899'];
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.background = colors[i % colors.length];
      piece.style.left = cx + 'px';
      piece.style.top = cy + 'px';
      const angle = Math.random() * Math.PI - Math.PI / 2; // upward arc
      const dist = 80 + Math.random() * 140;
      const dx = Math.cos(angle) * dist + (Math.random() - 0.5) * 60;
      const dy = Math.sin(angle) * dist + 80 + Math.random() * 80; // drop down
      const rot = (Math.random() * 720 - 360) + 'deg';
      piece.style.setProperty('--dx', dx + 'px');
      piece.style.setProperty('--dy', dy + 'px');
      piece.style.setProperty('--rot', rot);
      const dur = 0.8 + Math.random() * 0.6;
      piece.style.animation = `confetti-fall ${dur}s cubic-bezier(0.16, 0.7, 0.4, 1) forwards`;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), dur * 1000 + 100);
    }
  }

  if (copyBtn && bibtexCode) {
    copyBtn.addEventListener('click', async () => {
      const text = bibtexCode.textContent.trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        const range = document.createRange();
        range.selectNodeContents(bibtexCode);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try { document.execCommand('copy'); } catch (_) {}
        sel.removeAllRanges();
      }
      copyBtn.classList.add('copied');
      copyBtn.innerHTML = '<span>✓</span> Copied!';
      confettiBurst(copyBtn);
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = '<span>⧉</span> Copy';
      }, 2000);
    });
  }

  // ---------- Image lightbox ----------
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
  document.querySelectorAll('img[data-zoomable]').forEach((img) => {
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target === lightboxClose) closeLightbox();
    });
  }

  // ---------- Modals (Paper / Code) ----------
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach((m) => m.classList.remove('active'));
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.getAttribute('data-modal'));
    });
  });

  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.hasAttribute('data-close-modal')) closeAllModals();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      if (lightbox && lightbox.classList.contains('active')) closeLightbox();
    }
  });

  // ====================================================
  // FANCY: pointer-driven interactions (skipped on touch)
  // ====================================================
  const isTouch = matchMedia('(hover: none)').matches;
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Cursor effects ----------
  // Dark mode: large soft spotlight (gradient) follows the cursor.
  // Light mode: small ring + dot — never overlaps text (CSS gates each by theme).
  if (!isTouch && !prefersReducedMotion) {
    const spot = document.createElement('div');
    spot.className = 'cursor-spotlight';
    document.body.appendChild(spot);

    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    let mx = 0, my = 0;      // raw cursor position
    let rx = 0, ry = 0;      // ring position (lerped)
    let rafId = null;

    function tick() {
      // Spotlight: instant (matches cursor exactly)
      spot.style.setProperty('--mx', mx + 'px');
      spot.style.setProperty('--my', my + 'px');
      // Dot: instant
      dot.style.setProperty('--rx', mx + 'px');
      dot.style.setProperty('--ry', my + 'px');
      // Ring: smooth easing (lag for that classy "follower" feel)
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      ring.style.setProperty('--rx', rx + 'px');
      ring.style.setProperty('--ry', ry + 'px');
      // Keep ticking while ring is still catching up
      if (Math.abs(mx - rx) > 0.5 || Math.abs(my - ry) > 0.5) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      spot.classList.add('active');
      ring.classList.add('active');
      dot.classList.add('active');
      if (!rafId) rafId = requestAnimationFrame(tick);
    });

    document.addEventListener('mouseleave', () => {
      spot.classList.remove('active');
      ring.classList.remove('active');
      dot.classList.remove('active');
    });

    // Ring grows when hovering interactive elements
    const hoverSel = 'a, button, .badge, .scene-card, .figure-grid-item, .scroll-indicator, .theme-toggle, video, .copy-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSel)) ring.classList.add('hovering');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSel)) ring.classList.remove('hovering');
    });
  }

  // (Hero parallax intentionally removed — user found it dizzying.
  //  The cursor-spotlight color follow is enough.)

  // ---------- 3D tilt cards ----------
  if (!isTouch && !prefersReducedMotion) {
    const maxTilt = 6; // degrees
    document.querySelectorAll('.tilt-card').forEach((card) => {
      let rect = null;
      let raf3 = null;
      let cx = 0, cy = 0;

      function apply() {
        const px = (cx - rect.left) / rect.width;   // 0..1
        const py = (cy - rect.top) / rect.height;
        const rx = (0.5 - py) * maxTilt;
        const ry = (px - 0.5) * maxTilt;
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
        card.style.setProperty('--cx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--cy', (py * 100).toFixed(1) + '%');
        raf3 = null;
      }
      card.addEventListener('mouseenter', () => {
        rect = card.getBoundingClientRect();
        card.classList.add('tilting');
      });
      card.addEventListener('mousemove', (e) => {
        cx = e.clientX; cy = e.clientY;
        if (!raf3) raf3 = requestAnimationFrame(apply);
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('tilting');
        card.style.transform = '';
      });
    });
  }

  // ---------- Badge inner-glow follow ----------
  if (!isTouch) {
    document.querySelectorAll('.badge').forEach((b) => {
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        b.style.setProperty('--bx', x + '%');
        b.style.setProperty('--by', y + '%');
      });
    });
  }

  // ---------- Visit counter + visitor globe (skip on local file://) ----------
  // External calls are deferred until after window 'load' and only run on
  // http(s) — local file:// previews stay 100% offline & instant.
  window.addEventListener('load', () => {
    if (!/^https?:$/i.test(location.protocol)) return; // local — skip
    const stats = document.getElementById('pageStats');
    if (stats) stats.hidden = false;

    // --- Visit counter: api.visitorbadge.io (reliable, no signup) ---
    const counterImg = document.getElementById('visitCounter');
    if (counterImg) {
      const path = encodeURIComponent(location.href.split('#')[0]);
      counterImg.src =
        'https://api.visitorbadge.io/api/visitors' +
        '?path=' + path +
        '&label=views&countColor=%234B6CFF&style=flat-square&labelColor=%23555555';
      counterImg.onerror = () => {
        counterImg.replaceWith(Object.assign(document.createElement('div'), {
          className: 'map-placeholder',
          textContent: 'Counter unavailable.'
        }));
      };
    }

    // Visitor map — whos.amung.us map widget (replaces dead ClustrMaps).
    // Real visitor pins on a 2D world map. No account, no signup; the tracker
    // ID is just a unique string under which stats accumulate.
    // Full stats viewable at https://whos.amung.us/stats/<TRACKER_ID>
    //
    // IMPORTANT: m.js anchors the rendered map by calling
    //     document.getElementById("_wau" + _wau[n][2])
    // i.e. NO separator between "_wau" and the 3rd push arg. The script's
    // id and the 3rd arg therefore must concatenate to that exact id —
    // here both produce "_wauvMap".
    const slot = document.getElementById('visitorMapSlot');
    if (slot) {
      const TRACKER_ID = 'trrlicml26';
      const NAME = 'vMap';                          // 3rd arg of _wau.push
      const ANCHOR_ID = '_wau' + NAME;              // = "_wauvMap"

      // Match the map theme to the current page theme
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

      // Inline config script — its id is the anchor m.js will look up.
      const cfg = document.createElement('script');
      cfg.id = ANCHOR_ID;
      cfg.text =
        'var _wau = _wau || []; ' +
        '_wau.push(["map", "' + TRACKER_ID + '", "' + NAME + '", ' +
        // amung.us has only 'night' and 'classic' map backgrounds live on
        // their CDN right now — the 'day' background returns 404, which is
        // what caused the broken-image box. Use 'classic' for light mode.
        '"320", "200", "' + (isDark ? 'night' : 'classic') + '", "cross-blue"]);';
      slot.appendChild(cfg);

      // Async loader
      const loader = document.createElement('script');
      loader.async = true;
      loader.src = 'https://waust.at/m.js';
      slot.appendChild(loader);

      // Click-through link to the full stats dashboard
      const link = document.createElement('a');
      link.href = 'https://whos.amung.us/stats/' + TRACKER_ID;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'See visitor details →';
      link.style.cssText =
        'display: block; font-size: 11px; color: var(--accent);' +
        'margin-top: 8px; text-decoration: none;';
      slot.appendChild(link);
    }
  });

  // ---------- Scroll progress bar ----------
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);

  let scrollRaf = null;
  function updateProgress() {
    const doc = document.documentElement;
    const h = doc.scrollHeight - doc.clientHeight;
    const pct = h > 0 ? (doc.scrollTop / h) * 100 : 0;
    progress.style.width = pct.toFixed(2) + '%';
    scrollRaf = null;
  }
  window.addEventListener('scroll', () => {
    if (!scrollRaf) scrollRaf = requestAnimationFrame(updateProgress);
  }, { passive: true });
  updateProgress();
})();
