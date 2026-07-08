/* ============================================================
   PRANAV PATEL — "THE CONTROL PLANE"
   Node-graph background · GSAP mask reveals · live terminal
   ============================================================ */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // If GSAP failed to load, drop the JS-gate so nothing stays hidden.
  if (!hasGSAP) document.documentElement.classList.remove('js');

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupNav();
    setupMobileMenu();
    if (canHover) setupMagnetic();
    setupGraph();
    setupTerminal();
    setupCurrentlySwap();
    setupClock();

    if (hasGSAP && !reduced) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      setupRotator();
      setupScrollReveals();
      setupExperienceRail();
    } else {
      // Static path: make sure everything is visible, rotator shows one word.
      const track = $('.rotator-track');
      if (track) track.style.transform = 'none';
    }

    setupLoader();
  }

  /* --------------------------------------------------------
     LOADER  →  hero entrance
  -------------------------------------------------------- */
  function setupLoader() {
    const loader = $('#loader');
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      if (loader) loader.classList.add('hidden');
      if (hasGSAP && !reduced) playHero();
    };
    // Full ignition plays once per browser session; repeat views skip the crank.
    let ignited = false;
    try { ignited = !!sessionStorage.getItem('ignited'); } catch (e) { /* private mode */ }
    const arm = () => {
      if (hasGSAP && !reduced && !ignited) {
        try { sessionStorage.setItem('ignited', '1'); } catch (e) { /* ignore */ }
        playIgnition(finish);
      } else {
        setTimeout(finish, ignited ? 250 : 700);
      }
    };
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm);
    // Hard fallback so the loader can never trap the page.
    setTimeout(finish, 6500);
  }

  /* --------------------------------------------------------
     IGNITION SEQUENCE  (loader = engine start)
  -------------------------------------------------------- */
  function playIgnition(done) {
    const gsap = window.gsap;
    const needle = $('#ign-needle');
    const log = $('#ign-log');
    const rpmEl = $('#ign-rpm-val');
    const inner = $('.loader-inner');
    if (!needle || !log || !inner) { done(); return; }

    const say = (t) => { log.textContent = t; };
    const rpm = { v: 0 };
    const showRpm = () => { if (rpmEl) rpmEl.textContent = String(Math.round(rpm.v)); };

    gsap.set(needle, { rotation: -78, svgOrigin: '100 100' });

    const tl = gsap.timeline({ onComplete: done });
    tl.call(() => say('ignition — on'), null, 0)
      .to(needle, { rotation: -73, duration: 0.15, ease: 'power2.out' }, 0.25)
      .call(() => say('fuel pump — primed'), null, 0.5)
      .call(() => say('starter — cranking'), null, 0.85)
      // crank: needle stutters, rpm flickers
      .to(needle, { rotation: -66, duration: 0.09, yoyo: true, repeat: 5, ease: 'power1.inOut' }, 0.85)
      .to(rpm, { v: 280, duration: 0.1, yoyo: true, repeat: 4, ease: 'power1.inOut', onUpdate: showRpm }, 0.85)
      // catch: the sweep
      .call(() => say('engine — catch'), null, 1.45)
      .to(needle, { rotation: 78, duration: 0.55, ease: 'power3.out' }, 1.45)
      .to(rpm, { v: 7200, duration: 0.55, ease: 'power3.out', onUpdate: showRpm }, 1.45)
      .fromTo(inner, { x: -2 }, { x: 2, duration: 0.045, repeat: 6, yoyo: true, ease: 'none' }, 1.48)
      .set(inner, { x: 0 }, 1.8)
      // settle to idle
      .to(needle, { rotation: -58, duration: 0.65, ease: 'power2.inOut' }, 2.1)
      .to(rpm, { v: 850, duration: 0.65, ease: 'power2.inOut', onUpdate: showRpm }, 2.1)
      .call(() => say('all systems — go'), null, 2.35)
      .to({}, { duration: 0.45 }, 2.35); // beat before the site fires
  }

  function playHero() {
    const gsap = window.gsap;
    const lines = $$('#hero .line');
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(lines, { y: 0, duration: 1.1, stagger: 0.09 }, 0)
      .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, 0.5)
      .to('.hero-socials', { opacity: 1, y: 0, duration: 0.8 }, 0.65);
  }

  /* --------------------------------------------------------
     WORD ROTATOR  (seamless vertical slot)
  -------------------------------------------------------- */
  function setupRotator() {
    const track = $('.rotator-track');
    if (!track) return;
    const words = Array.from(track.children);
    if (words.length < 2) return;
    // Clone first word to the end for a seamless wrap.
    track.appendChild(words[0].cloneNode(true));
    const step = () => words[0].getBoundingClientRect().height || 0;
    let i = 0;
    const total = words.length; // original count
    const gsap = window.gsap;

    function advance() {
      i++;
      gsap.to(track, {
        y: -i * step(), duration: 0.7, ease: 'power4.inOut',
        onComplete: () => {
          if (i >= total) { i = 0; gsap.set(track, { y: 0 }); }
        }
      });
    }
    // start after hero settles
    setInterval(advance, 2200);
  }

  /* --------------------------------------------------------
     SCROLL REVEALS  (mask lines + reveal blocks)
  -------------------------------------------------------- */
  function setupScrollReveals() {
    const gsap = window.gsap, ST = window.ScrollTrigger;

    // section-title lines wipe up
    $$('.section-title .line').forEach((el) => {
      gsap.to(el, {
        y: 0, duration: 0.9, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // generic reveal blocks
    $$('.reveal').forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' }
      });
    });

    // section rules draw in
    $$('.section-rule').forEach((el) => {
      gsap.fromTo(el, { scaleX: 0, transformOrigin: 'left' }, {
        scaleX: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 92%' }
      });
    });

    ST.refresh();
  }

  /* --------------------------------------------------------
     EXPERIENCE RAIL  (scroll-scrubbed fill + node ignite)
  -------------------------------------------------------- */
  function setupExperienceRail() {
    const exp = $('.exp'); if (!exp) return;
    const fill = $('.exp-rail-fill');
    const items = $$('.exp-item');
    const gsap = window.gsap, ST = window.ScrollTrigger;

    if (fill) {
      ST.create({
        trigger: exp, start: 'top 65%', end: 'bottom 60%', scrub: 0.5,
        onUpdate: (self) => { fill.style.height = (self.progress * 100).toFixed(2) + '%'; }
      });
    }
    items.forEach((item) => {
      ST.create({
        trigger: item, start: 'top 70%',
        onEnter: () => item.classList.add('active'),
        onLeaveBack: () => item.classList.remove('active')
      });
    });
  }

  /* --------------------------------------------------------
     NAVBAR  (scrolled state + active link)
  -------------------------------------------------------- */
  function setupNav() {
    const navbar = $('#navbar');
    const links = $$('.nav-link');
    const sections = $$('section[id], header[id]');
    let ticking = false;

    const progress = $('#progress');
    const onScroll = () => {
      const y = window.pageYOffset;
      if (navbar) navbar.classList.toggle('scrolled', y > 40);
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      }
      let current = 'hero';
      sections.forEach((s) => { if (y >= s.offsetTop - 160) current = s.id; });
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + current));
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();
  }

  /* --------------------------------------------------------
     MOBILE MENU
  -------------------------------------------------------- */
  function setupMobileMenu() {
    const burger = $('#hamburger'), menu = $('#mobile-menu');
    if (!burger || !menu) return;
    const toggle = (open) => {
      const state = open ?? !menu.classList.contains('active');
      burger.classList.toggle('active', state);
      menu.classList.toggle('active', state);
      burger.setAttribute('aria-expanded', String(state));
      document.body.style.overflow = state ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle());
    $$('.mobile-link', menu).forEach((l) => l.addEventListener('click', () => toggle(false)));
  }

  /* --------------------------------------------------------
     MAGNETIC ELEMENTS
  -------------------------------------------------------- */
  function setupMagnetic() {
    $$('[data-magnetic]').forEach((el) => {
      const strength = el.classList.contains('contact-hero') ? 0.18 : 0.28;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transition = 'transform 0s';
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
        el.style.transform = 'translate(0,0)';
      });
    });
  }

  /* --------------------------------------------------------
     "CURRENTLY" swap in the system card
  -------------------------------------------------------- */
  function setupCurrentlySwap() {
    const el = $('#sys-currently');
    if (!el || reduced) return;
    const states = ['studying for VCP 9', 'wiring the Miata dash', 'shipping Rhodes', 'upgrading the lab'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % states.length;
      el.style.transition = 'opacity 0.3s ease';
      el.style.opacity = '0';
      setTimeout(() => { el.innerHTML = states[i]; el.style.opacity = '1'; }, 300);
    }, 3600);
  }

  /* --------------------------------------------------------
     LIVE RICHMOND CLOCK
  -------------------------------------------------------- */
  function setupClock() {
    const el = $('#rva-time');
    if (!el) return;
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', hour12: false,
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } catch (e) { return; }
    const tick = () => { el.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  /* --------------------------------------------------------
     RHODES LIVE TERMINAL
  -------------------------------------------------------- */
  function setupTerminal() {
    const body = $('#term-body');
    if (!body) return;
    const lines = [
      { c: 'cmd', t: '$ rhodes watch --autopilot' },
      { c: 'dim', t: '[graph] 214 resources · 5 substrates linked' },
      { c: 'dim', t: '● event    vcenter: "app-tier-03" cpu 94%' },
      { c: 'sig', t: '▸ plan     scale app-tier +2 vCPU · risk: risky_write' },
      { c: 'dim', t: '⏸ approval requested → #ops' },
      { c: 'ok',  t: '✓ approved by @pranav · 9s' },
      { c: 'ok',  t: '✓ safety-snap taken · rollback armed' },
      { c: 'ok',  t: '✓ applied · drift cleared' },
      { c: 'dim', t: '— idle. watching.' },
    ];

    if (reduced) {
      body.innerHTML = lines.map((l) => `<span class="term-${l.c}">${l.t}</span>`).join('\n');
      return;
    }

    const cls = (c) => 'term-' + c;
    let li = 0, ci = 0, cur = null;

    function frame() {
      if (li >= lines.length) { // hold, then restart
        setTimeout(() => { body.innerHTML = ''; li = 0; ci = 0; cur = null; frame(); }, 2600);
        return;
      }
      const line = lines[li];
      if (ci === 0) {
        cur = document.createElement('span');
        cur.className = cls(line.c);
        body.appendChild(cur);
        renderCursor();
      }
      if (ci < line.t.length) {
        cur.textContent += line.t.charAt(ci);
        ci++;
        renderCursor();
        setTimeout(frame, 16 + Math.random() * 34);
      } else {
        body.appendChild(document.createTextNode('\n'));
        li++; ci = 0;
        setTimeout(frame, line.c === 'cmd' ? 320 : 220);
      }
    }
    function renderCursor() {
      const old = body.querySelector('.term-cursor');
      if (old) old.remove();
      const c = document.createElement('span');
      c.className = 'term-cursor';
      body.appendChild(c);
    }

    // Kick off when the terminal scrolls into view (once).
    let started = false;
    const start = () => { if (!started) { started = true; frame(); } };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => { if (e.isIntersecting) { start(); io.disconnect(); } });
      }, { threshold: 0.25 });
      io.observe(body);
    } else { start(); }
  }

  /* --------------------------------------------------------
     NODE-GRAPH BACKGROUND (three.js)
  -------------------------------------------------------- */
  function setupGraph() {
    const canvas = $('#graph-canvas');
    if (!canvas || reduced || !window.THREE) { document.body.classList.add('no-graph'); if (canvas) canvas.style.display = 'none'; return; }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch (e) { document.body.classList.add('no-graph'); canvas.style.display = 'none'; return; }

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);

    let W = window.innerWidth, H = window.innerHeight, aspect = W / H;
    const scene = new THREE.Scene();
    let camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    camera.position.z = 2;
    renderer.setSize(W, H);

    const N = W < 640 ? 46 : 82;
    const R = 0.5;              // edge threshold (world units)
    const MAXE = 220;

    let home = new Float32Array(N * 2);
    let cur  = new Float32Array(N * 2);
    let vel  = new Float32Array(N * 2);
    let phase = new Float32Array(N);
    let act  = new Float32Array(N);
    let edges = [];
    let adj = [];

    const baseCol = new THREE.Color(0x4a4d55);
    const sigCol  = new THREE.Color(0xe4322b);
    const lineBase = new THREE.Color(0x24262c);

    let pointsGeo, points, linesGeo, lineSeg, lineColors;

    function build() {
      aspect = W / H;
      camera.left = -aspect; camera.right = aspect; camera.top = 1; camera.bottom = -1;
      camera.updateProjectionMatrix();

      for (let i = 0; i < N; i++) {
        home[i * 2]     = (Math.random() * 2 - 1) * aspect * 0.98;
        home[i * 2 + 1] = (Math.random() * 2 - 1) * 0.96;
        cur[i * 2] = home[i * 2]; cur[i * 2 + 1] = home[i * 2 + 1];
        vel[i * 2] = 0; vel[i * 2 + 1] = 0;
        phase[i] = Math.random() * Math.PI * 2;
        act[i] = 0;
      }

      // edges by proximity
      edges = []; adj = Array.from({ length: N }, () => []);
      for (let i = 0; i < N && edges.length < MAXE; i++) {
        for (let j = i + 1; j < N && edges.length < MAXE; j++) {
          const dx = home[i * 2] - home[j * 2], dy = home[i * 2 + 1] - home[j * 2 + 1];
          if (dx * dx + dy * dy < R * R) { edges.push(i, j); adj[i].push(j); adj[j].push(i); }
        }
      }

      // points
      if (points) { scene.remove(points); pointsGeo.dispose(); }
      pointsGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(N * 3);
      const aAct = new Float32Array(N);
      for (let i = 0; i < N; i++) { pos[i * 3] = cur[i * 2]; pos[i * 3 + 1] = cur[i * 2 + 1]; pos[i * 3 + 2] = 0; }
      pointsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      pointsGeo.setAttribute('act', new THREE.BufferAttribute(aAct, 1));
      points = new THREE.Points(pointsGeo, ptMat);
      scene.add(points);

      // lines
      if (lineSeg) { scene.remove(lineSeg); linesGeo.dispose(); }
      linesGeo = new THREE.BufferGeometry();
      const lpos = new Float32Array(edges.length * 3);
      lineColors = new Float32Array(edges.length * 3);
      linesGeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
      linesGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
      lineSeg = new THREE.LineSegments(linesGeo, lineMat);
      scene.add(lineSeg);
    }

    const ptMat = new THREE.ShaderMaterial({
      uniforms: { uDPR: { value: DPR }, uBase: { value: baseCol }, uSig: { value: sigCol } },
      vertexShader: `
        attribute float act; varying float vAct; uniform float uDPR;
        void main(){ vAct = act;
          vec4 mv = modelViewMatrix * vec4(position,1.0);
          gl_PointSize = (2.2 + act*4.5) * uDPR;
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `
        precision mediump float; varying float vAct; uniform vec3 uBase; uniform vec3 uSig;
        void main(){ float d = length(gl_PointCoord - vec2(0.5)); if(d>0.5) discard;
          float a = smoothstep(0.5, 0.08, d);
          vec3 c = mix(uBase, uSig, vAct);
          gl_FragColor = vec4(c, a*(0.42 + vAct*0.58)); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
    });
    const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false });

    build();

    // cursor-link edges — the pointer joins the topology
    const LINKK = 6, LINKR = 0.55;
    const linkPos = new Float32Array(LINKK * 2 * 3);
    const linkCol = new Float32Array(LINKK * 2 * 3);
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
    linkGeo.setAttribute('color', new THREE.BufferAttribute(linkCol, 3));
    const linkSeg = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scene.add(linkSeg);

    // pointer in world space
    let px = 999, py = 999, hasPointer = false;
    window.addEventListener('mousemove', (e) => {
      px = ((e.clientX / W) * 2 - 1) * aspect;
      py = -((e.clientY / H) * 2 - 1);
      hasPointer = true;
    }, { passive: true });
    window.addEventListener('mouseout', () => { hasPointer = false; });

    // scroll pause
    let scrolledPast = false;
    window.addEventListener('scroll', () => { scrolledPast = window.pageYOffset > H * 1.05; }, { passive: true });

    // resize (debounced rebuild)
    let rt;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        W = window.innerWidth; H = window.innerHeight; renderer.setSize(W, H); build();
      }, 400);
    });

    document.body.classList.add('graph-ready');

    let last = performance.now();
    let sinceTrig = 0;
    const posAttr = () => pointsGeo.attributes.position.array;
    const actAttr = () => pointsGeo.attributes.act.array;

    function tick(now) {
      requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 16.67, 3); last = now;
      if (scrolledPast) return; // sections cover the canvas — skip GPU work

      const t = now * 0.001;

      // activation pulses
      sinceTrig += dt;
      if (sinceTrig > 42) {
        sinceTrig = 0;
        const n = (Math.random() * N) | 0;
        act[n] = 1;
        adj[n].forEach((m) => { act[m] = Math.max(act[m], 0.6); });
      }

      const P = posAttr(), A = actAttr();
      for (let i = 0; i < N; i++) {
        const ix = i * 2, iy = i * 2 + 1;
        // gentle wander around home
        const hx = home[ix] + Math.sin(t * 0.5 + phase[i]) * 0.03;
        const hy = home[iy] + Math.cos(t * 0.4 + phase[i]) * 0.03;
        // spring toward home
        vel[ix] += (hx - cur[ix]) * 0.014 * dt;
        vel[iy] += (hy - cur[iy]) * 0.014 * dt;
        // pointer repulsion
        if (hasPointer) {
          const dx = cur[ix] - px, dy = cur[iy] - py;
          const d2 = dx * dx + dy * dy, rad = 0.42;
          if (d2 < rad * rad && d2 > 1e-6) {
            const d = Math.sqrt(d2), f = (1 - d / rad) * 0.05 * dt;
            vel[ix] += (dx / d) * f; vel[iy] += (dy / d) * f;
          }
        }
        vel[ix] *= 0.86; vel[iy] *= 0.86;
        cur[ix] += vel[ix]; cur[iy] += vel[iy];
        act[i] *= (1 - 0.03 * dt); if (act[i] < 0.001) act[i] = 0;

        P[i * 3] = cur[ix]; P[i * 3 + 1] = cur[iy];
        A[i] = act[i];
      }
      pointsGeo.attributes.position.needsUpdate = true;
      pointsGeo.attributes.act.needsUpdate = true;

      // update edges
      const L = linesGeo.attributes.position.array, C = lineColors;
      for (let e = 0; e < edges.length; e += 2) {
        const a = edges[e], b = edges[e + 1];
        const o = e * 3;
        L[o] = cur[a * 2]; L[o + 1] = cur[a * 2 + 1]; L[o + 2] = 0;
        L[o + 3] = cur[b * 2]; L[o + 4] = cur[b * 2 + 1]; L[o + 5] = 0;
        const ea = act[a], eb = act[b];
        C[o]     = lineBase.r + (sigCol.r - lineBase.r) * ea;
        C[o + 1] = lineBase.g + (sigCol.g - lineBase.g) * ea;
        C[o + 2] = lineBase.b + (sigCol.b - lineBase.b) * ea;
        C[o + 3] = lineBase.r + (sigCol.r - lineBase.r) * eb;
        C[o + 4] = lineBase.g + (sigCol.g - lineBase.g) * eb;
        C[o + 5] = lineBase.b + (sigCol.b - lineBase.b) * eb;
      }
      linesGeo.attributes.position.needsUpdate = true;
      linesGeo.attributes.color.needsUpdate = true;

      // pointer → nearest-node link edges
      let nl = 0;
      if (hasPointer) {
        const cand = [];
        for (let i = 0; i < N; i++) {
          const dx = cur[i * 2] - px, dy = cur[i * 2 + 1] - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINKR * LINKR) cand.push([d2, i]);
        }
        cand.sort((a, b) => a[0] - b[0]);
        nl = Math.min(LINKK, cand.length);
        for (let k = 0; k < nl; k++) {
          const i = cand[k][1], o = k * 6;
          const w = 1 - Math.sqrt(cand[k][0]) / LINKR;
          linkPos[o] = px; linkPos[o + 1] = py; linkPos[o + 2] = 0;
          linkPos[o + 3] = cur[i * 2]; linkPos[o + 4] = cur[i * 2 + 1]; linkPos[o + 5] = 0;
          linkCol[o] = sigCol.r * w; linkCol[o + 1] = sigCol.g * w; linkCol[o + 2] = sigCol.b * w;
          linkCol[o + 3] = sigCol.r * w * 0.3; linkCol[o + 4] = sigCol.g * w * 0.3; linkCol[o + 5] = sigCol.b * w * 0.3;
          act[i] = Math.max(act[i], w * 0.45); // brush nodes alight as you sweep
        }
      }
      for (let k = nl; k < LINKK; k++) {
        const o = k * 6;
        linkPos.fill(0, o, o + 6); linkCol.fill(0, o, o + 6);
      }
      linkGeo.attributes.position.needsUpdate = true;
      linkGeo.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  }

})();
