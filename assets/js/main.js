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
      cur.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      spawnTrail(mx, my);
    });

    const trackRing = () => {
      rx += (mx - rx) * 0.32;
      ry += (my - ry) * 0.32;
      curR.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
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

  /* ── 4b. CHATBOT KEYBOARD AVOID (mobile) ── */
  if (window.visualViewport && window.innerWidth <= 600) {
    const chatEl = document.getElementById('aiChat');
    window.visualViewport.addEventListener('resize', () => {
      if (!chatEl) return;
      const gap = window.innerHeight - window.visualViewport.height;
      chatEl.style.bottom = gap > 50 ? gap + 'px' : '';
    });
  }

  /* ── 5. SCROLL TO TOP ── */
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── 6. TICKER — handled by CSS animation (ticker-scroll keyframe) ── */

  /* ── 6. RESULTS SLIDER AUTO-SCROLL ── */
  const resSlider = document.querySelector('.res-slider');
  const resTrack  = document.querySelector('.res-track');
  if (resSlider && resTrack && !prefersReducedMotion) {
    resTrack.innerHTML += resTrack.innerHTML;
    const step = (resTrack.firstElementChild?.offsetWidth ?? 320) + 14;
    let pos = 0, paused = false;
    resSlider.addEventListener('mouseenter', () => paused = true);
    resSlider.addEventListener('mouseleave', () => paused = false);
    resSlider.addEventListener('touchstart', () => paused = true, { passive: true });
    resSlider.addEventListener('touchend',   () => { setTimeout(() => paused = false, 1500); }, { passive: true });
    (function tick() {
      if (!paused) {
        pos += 0.55;
        if (pos >= resTrack.scrollWidth / 2) pos = 0;
        resTrack.style.transform = `translateX(${-pos}px)`;
      }
      requestAnimationFrame(tick);
    })();
    const resPrev = document.querySelector('.res-prev');
    const resNext = document.querySelector('.res-next');
    // Snap to a whole card (not a fractional auto-scroll position) and glide there.
    let snapTimer;
    const snap = delta => {
      paused = true;
      const half = resTrack.scrollWidth / 2;            // one full copy of the cards
      const cur = Math.round(pos / step) * step;        // nearest card boundary
      let target = cur + delta * step;
      if (target < 0) {                                 // jump a loop ahead so there's content to the left
        pos = cur + half;
        resTrack.style.transition = 'none';
        resTrack.style.transform = `translateX(${-pos}px)`;
        void resTrack.offsetWidth;                      // force reflow so the jump isn't animated
        target += half;
      }
      resTrack.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
      pos = target;
      resTrack.style.transform = `translateX(${-pos}px)`;
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        resTrack.style.transition = '';
        pos = ((pos % half) + half) % half;             // normalise seamlessly (track is duplicated)
        resTrack.style.transform = `translateX(${-pos}px)`;
        paused = false;
      }, 600);
    };
    if (resPrev) resPrev.addEventListener('click', () => snap(-1));
    if (resNext) resNext.addEventListener('click', () => snap(1));
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

  /* ── 15. HERO ROTATING HEADLINE WORD ── */
  const rotate = document.querySelector('.h1-rotate');
  if (rotate && !prefersReducedMotion) {
    const words = Array.from(rotate.querySelectorAll('.rot-word'));
    if (words.length > 1) {
      // Clear any prior timer so a re-run can never stack intervals.
      if (window.__ahcaRotTimer) clearInterval(window.__ahcaRotTimer);
      let active = 0;
      const INTERVAL = 1500; // faster than the original 2000ms
      const apply = () => words.forEach((w, i) => {
        // mirrors framer logic: passed words exit up, upcoming wait below.
        // Atomic className set guarantees exactly one state class at a time.
        w.className = 'rot-word ' + (i === active ? 'is-active' : (active > i ? 'is-prev' : 'is-next'));
      });
      apply();
      window.__ahcaRotTimer = setInterval(() => {
        active = (active + 1) % words.length;
        apply();
      }, INTERVAL);
    }
  }

  /* ── 16. HERO "NUMBERS" DIGIT-SCRAMBLE (runs once) ── */
  const scrambleEl = document.querySelector('.num-scramble');
  if (scrambleEl && !scrambleEl.dataset.done) {
    scrambleEl.dataset.done = '1';
    const finalText = scrambleEl.dataset.text || scrambleEl.textContent;

    if (prefersReducedMotion) {
      scrambleEl.textContent = finalText;
    } else {
      // A hidden "ghost" copy permanently holds the word's exact box, so the
      // rest of the line ("We do the") never shifts. The shuffling digits ride
      // on a separate "live" layer positioned on top of the ghost.
      scrambleEl.textContent = '';
      const ghost = document.createElement('span');
      ghost.className = 'ns-ghost';
      ghost.textContent = finalText;
      const live = document.createElement('span');
      live.className = 'ns-live';
      scrambleEl.appendChild(ghost);
      scrambleEl.appendChild(live);

      // One span per character so rolling digits can glow green individually,
      // then settle into the gold final letters.
      const cells = finalText.split('').map(ch => {
        const s = document.createElement('span');
        s.className = 'ns-ch';
        s.textContent = ch;
        live.appendChild(s);
        return s;
      });

      const digits     = '0123456789';
      const startDelay = 650; // initial all-digits shuffle phase (ms)
      const lockStep   = 230; // delay between locking each character (ms)
      const digitTick  = 75;  // how often a shuffling digit re-rolls (ms) — slow enough to read
      const begin = performance.now();
      const shown = finalText.split('').map(() => digits[(Math.random() * 10) | 0]);
      let lastTick = 0;

      const run = now => {
        const t = now - begin;
        const reroll = (t - lastTick >= digitTick);
        if (reroll) lastTick = t;
        let done = true;
        for (let i = 0; i < finalText.length; i++) {
          const ch = finalText[i], cell = cells[i];
          if (ch === ' ' || ch === '.') continue;       // separators stay locked
          if (t >= startDelay + i * lockStep) {
            if (cell.classList.contains('is-rolling')) { // just locked → gold
              cell.classList.remove('is-rolling');
              cell.textContent = ch;
            }
          } else {
            if (reroll) { shown[i] = digits[(Math.random() * 10) | 0]; cell.textContent = shown[i]; }
            cell.classList.add('is-rolling');           // shuffling → green glow
            done = false;
          }
        }
        if (!done) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }
  }

  /* ── 17. SERVICES — 3D SOLAR-SYSTEM ORBIT ── */
  const orbit = document.getElementById('orbit');
  if (orbit) {
    const magnet  = document.getElementById('orbitMagnet');
    const canvas  = document.getElementById('orbitSpiral');
    const nodes   = Array.from(orbit.querySelectorAll('.orbit-node'));
    const card    = document.getElementById('orbitCard');
    const elTag   = document.getElementById('ocTag');
    const elIco   = document.getElementById('ocIco');
    const elTit   = document.getElementById('ocTitle');
    const elDesc  = document.getElementById('ocDesc');
    const elPoints = document.getElementById('ocPoints');
    const elRel   = document.getElementById('ocRelated');
    const elClose = document.getElementById('ocClose');
    const byId = id => nodes.find(n => n.dataset.id === id);
    const N = nodes.length, TAU = Math.PI * 2;

    const magnetState = { x: 0, y: 0, tx: 0, ty: 0 };
    let t = -Math.PI / 2;   // base orbital angle
    let hovering = false;

    // ── tilted elliptical layout: planets scale / brighten / overlap by depth ──
    function layout() {
      const S = orbit.clientWidth || 760;
      const cx = S / 2, cy = S / 2, rx = S * 0.40, ry = S * 0.15;
      for (let i = 0; i < N; i++) {
        const node = nodes[i];
        const ang = t + i * (TAU / N);
        const x = cx + Math.cos(ang) * rx;
        const y = cy + Math.sin(ang) * ry;
        const depth = (Math.sin(ang) + 1) / 2;          // 0 = back/top, 1 = front/bottom
        const ds = 0.66 + depth * 0.56;                 // planet scale (back small, front big)
        node.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) translate(-50%,-50%) scale(' + ds.toFixed(3) + ')';
        node.style.zIndex = String(20 + Math.round(depth * 60));  // pass behind (z<50) / in front of the sun
        node.style.opacity = (0.5 + depth * 0.5).toFixed(2);
      }
    }
    layout();   // static initial placement (valid even before the loop runs)

    // ── detail card anchored above the clicked planet (flips below if no room) ──
    function positionCard(node) {
      const o = orbit.getBoundingClientRect();
      const n = node.getBoundingClientRect();
      const nx = (n.left + n.right) / 2 - o.left;
      const nTop = n.top - o.top, nBot = n.bottom - o.top;
      const cw = card.offsetWidth, ch = card.offsetHeight;
      const gap = 16, m = 12;
      let cx = nx - cw / 2;
      cx = Math.max(m, Math.min(cx, o.width - cw - m));
      let cy = nTop - gap - ch, oy = '100%';
      if (cy < m) { cy = nBot + gap; oy = '0%'; }       // flip below
      if (cy + ch > o.height - m) cy = Math.max(m, o.height - ch - m);
      card.style.left = cx + 'px';
      card.style.top  = cy + 'px';
      const ox = Math.max(8, Math.min(92, ((nx - cx) / cw) * 100));
      card.style.transformOrigin = ox + '% ' + oy;
    }

    function activate(node) {
      if (!node) return;
      // freeze + reset the magnet so the card anchors to the planet's true position
      magnetState.tx = magnetState.ty = magnetState.x = magnetState.y = 0;
      if (magnet) magnet.style.transform = 'translate(0,0)';

      nodes.forEach(n => n.classList.remove('is-active', 'is-related'));
      node.classList.add('is-active');
      const related = (node.dataset.related || '').split(',').filter(Boolean);
      related.forEach(id => { const r = byId(id); if (r) r.classList.add('is-related'); });

      elTag.textContent  = node.dataset.tag || '';
      elIco.className    = 'oc-ico ti ' + node.dataset.icon;
      elTit.textContent  = node.dataset.title;
      elDesc.textContent = node.dataset.desc;

      elPoints.classList.remove('show');
      elPoints.innerHTML = '';
      (node.dataset.points || '').split('|').filter(Boolean).forEach((txt, i) => {
        const li = document.createElement('li');
        li.style.setProperty('--i', i);
        const ic = document.createElement('i');
        ic.className = 'ti ti-circle-check';
        ic.setAttribute('aria-hidden', 'true');
        li.appendChild(ic);
        li.appendChild(document.createTextNode(txt));
        elPoints.appendChild(li);
      });

      elRel.innerHTML = '';
      related.forEach(id => {
        const r = byId(id);
        if (!r) return;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'oc-chip';
        chip.textContent = r.dataset.title;
        chip.addEventListener('click', e => { e.stopPropagation(); activate(r); });
        elRel.appendChild(chip);
      });

      orbit.classList.add('is-active');
      positionCard(node);                 // anchor above the planet
      card.classList.add('is-open');
      card.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(() => requestAnimationFrame(() => elPoints.classList.add('show')));
    }

    function deactivate() {
      nodes.forEach(n => n.classList.remove('is-active', 'is-related'));
      orbit.classList.remove('is-active');
      card.classList.remove('is-open');
      card.setAttribute('aria-hidden', 'true');
    }

    nodes.forEach(node => node.addEventListener('click', e => { e.stopPropagation(); activate(node); }));
    if (elClose) elClose.addEventListener('click', e => { e.stopPropagation(); deactivate(); });
    card.addEventListener('click', e => e.stopPropagation());
    orbit.addEventListener('click', deactivate);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') deactivate(); });

    /* ── animation loop (rotation + magnet + spiral) — runs only while on-screen ── */
    if (!prefersReducedMotion) {
      const ctx = canvas ? canvas.getContext('2d') : null;
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      let rafId = null, particles = [];

      function sizeCanvas() {
        if (!canvas) return;
        const r = orbit.getBoundingClientRect();
        canvas.width  = Math.max(1, r.width * DPR);
        canvas.height = Math.max(1, r.height * DPR);
      }
      sizeCanvas();
      window.addEventListener('resize', () => { sizeCanvas(); layout(); });

      function spawn() {
        const half = canvas.width / 2;
        particles.push({
          a: Math.random() * TAU,
          r: half * (0.40 + Math.random() * 0.06),
          vr: (0.3 + Math.random() * 0.4) * DPR,
          va: 0.012 + Math.random() * 0.016,
          sz: (0.9 + Math.random() * 1.6) * DPR,
          gold: Math.random() < 0.16
        });
      }

      function frame() {
        rafId = requestAnimationFrame(frame);
        const active = orbit.classList.contains('is-active');
        if (!hovering && !active) t += 0.0017;     // slow drift; paused on hover / when a card is open
        layout();

        // magnet pull (eases back to 0 when idle or a card is open)
        const tx = active ? 0 : magnetState.tx, ty = active ? 0 : magnetState.ty;
        magnetState.x += (tx - magnetState.x) * 0.08;
        magnetState.y += (ty - magnetState.y) * 0.08;
        if (magnet) magnet.style.transform = 'translate(' + magnetState.x.toFixed(2) + 'px,' + magnetState.y.toFixed(2) + 'px)';

        // spiral energy around the sun (hover only)
        if (ctx) {
          const w = canvas.width, h = canvas.height, ccx = w / 2, ccy = h / 2;
          ctx.clearRect(0, 0, w, h);
          if (hovering && !active) {
            if (Math.random() < 0.5) spawn();
            if (particles.length < 70 && Math.random() < 0.3) spawn();
          }
          const maxR = (w / 2) * 0.42;
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.r -= p.vr; p.a += p.va;
            if (p.r <= 3 * DPR) { particles.splice(i, 1); continue; }
            const x = ccx + Math.cos(p.a) * p.r, y = ccy + Math.sin(p.a) * p.r;
            const alpha = Math.min(1, p.r / maxR) * 0.85;
            ctx.beginPath();
            ctx.arc(x, y, p.sz, 0, TAU);
            ctx.fillStyle = p.gold ? 'rgba(226,192,106,' + alpha + ')' : 'rgba(94,207,160,' + alpha + ')';
            ctx.shadowBlur = 6 * DPR;
            ctx.shadowColor = p.gold ? 'rgba(201,168,76,.8)' : 'rgba(2,179,106,.85)';
            ctx.fill();
          }
          ctx.shadowBlur = 0;
        }
      }
      function startLoop() { if (rafId == null) { sizeCanvas(); frame(); } }
      function stopLoop()  { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } }

      const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) startLoop(); else stopLoop(); });
      }, { threshold: 0 });
      io.observe(orbit);

      orbit.addEventListener('mouseenter', () => { hovering = true; orbit.classList.add('is-hover'); });
      orbit.addEventListener('mouseleave', () => { hovering = false; orbit.classList.remove('is-hover'); magnetState.tx = 0; magnetState.ty = 0; });
      orbit.addEventListener('mousemove', e => {
        const r = orbit.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        magnetState.tx = Math.max(-1, Math.min(1, dx)) * 26;
        magnetState.ty = Math.max(-1, Math.min(1, dy)) * 26;
      });
    }
  }

  /* ── 18. GALAXY STARFIELD (contact section) ── */
  const gCanvas = document.getElementById('galaxyStars');
  if (gCanvas && !prefersReducedMotion) {
    const gctx = gCanvas.getContext('2d');
    const host = gCanvas.closest('#contact') || gCanvas.parentElement;
    const COLORS = [
      [94, 207, 160],   // green-light
      [180, 255, 210],  // pale mint
      [2, 179, 106],    // green
      [220, 245, 235],  // near-white (rare)
      [201, 168, 76],   // gold (rare)
    ];
    let W = 0, H = 0, cx = 0, cy = 0, maxR = 1, stars = [], gRaf = null, rot = 0;

    function makeStars() {
      const count = Math.min(170, Math.max(70, Math.round(W * H / 9000)));
      stars = Array.from({ length: count }, () => {
        const rad = Math.pow(Math.random(), 1.8) * maxR;      // dense toward the core
        const ci = Math.random() < 0.07 ? 4 : Math.random() < 0.16 ? 3
                 : Math.random() < 0.45 ? 1 : Math.floor(Math.random() * 2);
        const near = rad < maxR * 0.3;
        return {
          ang: Math.random() * Math.PI * 2,
          rad,
          size: Math.random() * 1.3 + 0.4 + (near ? 0.5 : 0),
          col: COLORS[ci],
          base: 0.22 + Math.random() * 0.6,
          tw: Math.random() * Math.PI * 2,
          twSpeed: 0.008 + Math.random() * 0.03,
        };
      });
    }
    function resize() {
      const r = host.getBoundingClientRect();
      W = gCanvas.width = Math.max(1, Math.round(r.width));
      H = gCanvas.height = Math.max(1, Math.round(r.height));
      cx = W / 2; cy = H / 2;
      maxR = Math.max(W, H) * 0.52;
      makeStars();
    }
    function draw() {
      gctx.clearRect(0, 0, W, H);
      rot += 0.0003;                                          // very slow galaxy rotation
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.tw += s.twSpeed;
        const a = s.ang + rot;
        const x = cx + Math.cos(a) * s.rad;
        const y = cy + Math.sin(a) * s.rad * 0.66;            // squash → elliptical galaxy tilt
        if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
        const alpha = s.base * (0.55 + 0.45 * Math.sin(s.tw));
        const [r, g, b] = s.col;
        if (s.size > 1.15) { gctx.shadowBlur = s.size * 3; gctx.shadowColor = 'rgba(' + r + ',' + g + ',' + b + ',.7)'; }
        else gctx.shadowBlur = 0;
        gctx.beginPath();
        gctx.arc(x, y, s.size, 0, Math.PI * 2);
        gctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha.toFixed(3) + ')';
        gctx.fill();
      }
      gctx.shadowBlur = 0;
    }
    function loop() { gRaf = requestAnimationFrame(loop); draw(); }
    function start() { if (gRaf == null) loop(); }
    function stop()  { if (gRaf != null) { cancelAnimationFrame(gRaf); gRaf = null; } }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: 0 }).observe(host);
  }

})();
