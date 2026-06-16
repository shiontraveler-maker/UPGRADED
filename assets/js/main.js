/* ============================================================
   AHCA — Main JavaScript v2.0
   Particles · Aurora · 3D Tilt · Cursor Trail · Parallax
   ============================================================ */

(function () {
  'use strict';

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. CUSTOM CURSOR + TRAIL ── */
  const cur  = document.getElementById('cur');
  const curR = document.getElementById('curR');
  const canHover = window.matchMedia('(hover: hover)').matches;

  if (cur && curR && canHover && !prefersReducedMotion) {
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px';
      cur.style.top  = my + 'px';
      spawnTrail(mx, my);
    });

    const trackRing = () => {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      curR.style.left = rx + 'px';
      curR.style.top  = ry + 'px';
      requestAnimationFrame(trackRing);
    };
    trackRing();
  }

  /* Cursor trail dots */
  let trailTimeout;
  function spawnTrail(x, y) {
    clearTimeout(trailTimeout);
    trailTimeout = setTimeout(() => {
      const dot = document.createElement('div');
      dot.className = 'cursor-trail';
      const size = Math.random() * 5 + 3;
      dot.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;opacity:.3`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 600);
    }, 20);
  }

  /* ── 2. FIREFLY PARTICLE CANVAS ── */
  if (!prefersReducedMotion) {
    const canvas = document.getElementById('particleCanvas');
    const ctx    = canvas ? canvas.getContext('2d') : null;

    if (ctx) {
      let W, H;
      const resize = () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener('resize', resize, { passive: true });

      const count  = isMobile ? 40 : 80;
      const COLORS = [
        [94, 207, 160],   // green-light
        [2,  179, 106],   // green
        [1,  143,  84],   // green-dark
        [201,168,  76],   // gold  (rare)
        [180,255, 210],   // pale mint (rare)
      ];

      const fireflies = Array.from({ length: count }, () => {
        const colorIdx = Math.random() < .12 ? 3 : Math.random() < .08 ? 4 : Math.floor(Math.random() * 3);
        return {
          x:     Math.random() * window.innerWidth,
          y:     Math.random() * window.innerHeight,
          vx:    (Math.random() - .5) * .28,
          vy:    (Math.random() - .5) * .28,
          r:     Math.random() * 1.8 + .6,
          col:   COLORS[colorIdx],
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * .01 + .006,
          glowR: Math.random() * 7 + 4,
        };
      });

      const draw = () => {
        ctx.clearRect(0, 0, W, H);

        fireflies.forEach(f => {
          f.phase += f.speed;
          f.x += f.vx + Math.sin(f.phase * .7) * .14;
          f.y += f.vy + Math.cos(f.phase * .5) * .14;

          if (f.x < -10) f.x = W + 10;
          if (f.x > W + 10) f.x = -10;
          if (f.y < -10) f.y = H + 10;
          if (f.y > H + 10) f.y = -10;

          const pulse = .5 + .5 * Math.sin(f.phase);
          const baseA = .15 + .18 * pulse;
          const glowA = .05 + .06 * pulse;
          const [r, g, b] = f.col;

          // Soft outer glow
          const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.glowR);
          grd.addColorStop(0, `rgba(${r},${g},${b},${glowA})`);
          grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${baseA})`;
          ctx.fill();
        });

        requestAnimationFrame(draw);
      };
      draw();
    }
  }

  /* ── 3. SCROLL PROGRESS ── */
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = total > 0 ? (window.scrollY / total * 100) + '%' : '0%';
    }, { passive: true });
  }

  /* ── 4. NAV SCROLL STATE ── */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  /* ── 5. MOBILE MENU ── */
  const burger     = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burger && mobileMenu) {
    const setMenu = open => {
      burger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
    mobileMenu.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* ── 6. INTERSECTION OBSERVER — REVEALS ── */
  const revealEls = document.querySelectorAll(
    '.reveal-up, .reveal-l, .reveal-r, .reveal-scale, .reveal-blur'
  );

  if (revealEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        obs.unobserve(e.target);
      });
    }, { threshold: 0.07 });
    revealEls.forEach(el => obs.observe(el));
  }

  /* ── 7. COUNTER ANIMATION ── */
  document.querySelectorAll('.stat-num[data-val]').forEach(el => {
    const cObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const target = parseInt(e.target.dataset.val, 10);
        const dur    = 1600;
        const steps  = 60;
        let   step   = 0;

        const ease = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const tick = setInterval(() => {
          step++;
          const progress = ease(step / steps);
          e.target.textContent = Math.round(progress * target);
          if (step >= steps) { e.target.textContent = target; clearInterval(tick); }
        }, dur / steps);

        cObs.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    cObs.observe(el);
  });

  /* ── 8. BAR FILLS ── */
  document.querySelectorAll('.bar-fill[data-w]').forEach(el => {
    const bObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        setTimeout(() => { e.target.style.width = e.target.dataset.w + '%'; }, 300);
        bObs.unobserve(e.target);
      });
    }, { threshold: 0.25 });
    bObs.observe(el);
  });

  /* ── 9. 3D CARD TILT ── */
  if (!isMobile && !prefersReducedMotion) {
    document.querySelectorAll('.svc-card, .res-card, .tst-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.width  / 2;
        const cy     = rect.height / 2;
        const x      = e.clientX - rect.left - cx;
        const y      = e.clientY - rect.top  - cy;
        const rotX   = (y / cy) * -5;
        const rotY   = (x / cx) *  5;
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`;
        card.classList.add('card-tilting');
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.classList.remove('card-tilting');
      });
    });
  }

  /* ── 10. HERO PARALLAX ── */
  if (!isMobile && !prefersReducedMotion) {
    const heroContent = document.querySelector('.hero-content');
    const heroBadge   = document.querySelector('.hero-badge');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (heroContent) heroContent.style.transform = `translateY(${y * 0.22}px)`;
      if (heroBadge)   heroBadge.style.transform   = `translateY(${y * 0.08}px)`;
    }, { passive: true });
  }

  /* ── 11. MAGNETIC BUTTONS ── */
  if (!isMobile && !prefersReducedMotion) {
    document.querySelectorAll('.btn--primary, .btn--ghost').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x    = e.clientX - rect.left - rect.width  / 2;
        const y    = e.clientY - rect.top  - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px) translateY(-2px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ── 12. SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = (nav ? nav.offsetHeight : 70) + 20;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    });
  });

  /* ── 13. CONTACT FORM ── */
  const form = document.getElementById('contactForm');

  if (form) {
    const validate = (inputId, errId, type) => {
      const input = document.getElementById(inputId);
      const err   = document.getElementById(errId);
      if (!input || !err) return true;
      const val = input.value.trim();
      let msg = '';
      if (!val) msg = 'This field is required.';
      else if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) msg = 'Enter a valid email address.';
      err.textContent = msg;
      input.classList.toggle('err', !!msg);
      return !msg;
    };

    [['fname','fname-err','text'], ['femail','femail-err','email']].forEach(([id, eid, t]) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('blur', () => validate(id, eid, t));
    });

    const fservice = document.getElementById('fservice');
    if (fservice) fservice.addEventListener('change', () => {
      document.getElementById('fservice-err').textContent = '';
      fservice.classList.remove('err');
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const ok1 = validate('fname', 'fname-err', 'text');
      const ok2 = validate('femail', 'femail-err', 'email');
      const ok3 = validate('fservice', 'fservice-err', 'text');
      if (!ok1 || !ok2 || !ok3) {
        (form.querySelector('.err') || form).focus();
        return;
      }
      const btn     = document.getElementById('submitBtn');
      const success = document.getElementById('formOk');
      btn.classList.add('btn--loading');
      btn.disabled = true;
      await new Promise(r => setTimeout(r, 1600));
      btn.style.display = 'none';
      if (success) success.hidden = false;
    });
  }

  /* ── 14. AURORA MOUSE PARALLAX ── */
  if (!isMobile && !prefersReducedMotion) {
    const blobs = document.querySelectorAll('.aurora-blob');
    document.addEventListener('mousemove', e => {
      const xPct = (e.clientX / window.innerWidth  - .5) * 2;
      const yPct = (e.clientY / window.innerHeight - .5) * 2;
      blobs.forEach((blob, i) => {
        const depth = (i + 1) * 8;
        blob.style.setProperty('--mx', `${xPct * depth}px`);
        blob.style.setProperty('--my', `${yPct * depth}px`);
        blob.style.transform = `translate(var(--mx), var(--my))`;
      });
    }, { passive: true });
  }

})();
