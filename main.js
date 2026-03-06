/* ============================================
   PRANAV PATEL — MAIN JS
   Three.js + GSAP + Interactivity
   ============================================ */

// ---- Wait for DOM ----
document.addEventListener('DOMContentLoaded', () => {

  // ========================================
  //  LOADING SCREEN
  // ========================================
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      startHeroAnimations();
    }, 1400);
  });

  // Fallback if load already fired
  if (document.readyState === 'complete') {
    setTimeout(() => {
      loader.classList.add('hidden');
      startHeroAnimations();
    }, 1400);
  }

  // ========================================
  //  CUSTOM CURSOR
  // ========================================
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
  });

  // Smooth follower
  function animateFollower() {
    followerX += (cursorX - followerX) * 0.12;
    followerY += (cursorY - followerY) * 0.12;
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover effects on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, [data-magnetic], .project-card, .stat-card, .skill-orb, .cert-card, .edu-card, .contact-card');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });

  // ========================================
  //  MAGNETIC BUTTONS
  // ========================================
  const magneticEls = document.querySelectorAll('[data-magnetic]');
  magneticEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'none';
    });
  });

  // ========================================
  //  THREE.JS PARTICLE SYSTEM
  // ========================================
  const canvas = document.getElementById('hero-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  // Particles — reduced for smoother performance
  const particleCount = 500;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const velocities = new Float32Array(particleCount * 3);

  const color1 = new THREE.Color(0xef4444); // red
  const color2 = new THREE.Color(0xdc2626); // crimson
  const color3 = new THREE.Color(0xfca5a5); // light red

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 30;
    positions[i3 + 1] = (Math.random() - 0.5) * 30;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;

    // Random color mix
    const mixColor = Math.random();
    const c = mixColor < 0.33 ? color1 : mixColor < 0.66 ? color2 : color3;
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;

    sizes[i] = Math.random() * 2 + 0.3;

    velocities[i3] = (Math.random() - 0.5) * 0.005;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.005;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.003;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Shader material for better-looking particles
  const vertexShader = `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = min(size * (120.0 / -mvPosition.z), 20.0);
      gl_Position = projectionMatrix * mvPosition;
      vAlpha = smoothstep(100.0, 2.0, -mvPosition.z);
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float alpha = smoothstep(0.5, 0.05, dist) * vAlpha * 0.6;
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  const particleMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, particleMaterial);
  scene.add(particles);

  camera.position.z = 10;

  // Mouse tracking for particles
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Scroll-based fade
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.pageYOffset; }, { passive: true });

  // Animation loop — skip GPU work when particles are off-screen
  function animateParticles() {
    requestAnimationFrame(animateParticles);

    // Fade on scroll
    const heroH = window.innerHeight;
    const opacity = Math.max(0, 1 - scrollY / heroH);
    canvas.style.opacity = opacity;

    // Skip rendering entirely when scrolled past hero
    if (opacity <= 0) return;

    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    const posArray = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      posArray[i3] += velocities[i3];
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2];

      // Wrap particles
      if (posArray[i3] > 10) posArray[i3] = -10;
      if (posArray[i3] < -10) posArray[i3] = 10;
      if (posArray[i3 + 1] > 10) posArray[i3 + 1] = -10;
      if (posArray[i3 + 1] < -10) posArray[i3 + 1] = 10;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Rotate based on mouse
    particles.rotation.x += (mouseY * 0.1 - particles.rotation.x) * 0.02;
    particles.rotation.y += (mouseX * 0.1 - particles.rotation.y) * 0.02;

    // Slow global rotation
    particles.rotation.z += 0.0003;

    renderer.render(scene, camera);
  }
  animateParticles();

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ========================================
  //  TYPING EFFECT
  // ========================================
  const roles = [
    'build AI-powered products.',
    'lead enterprise cloud adoption.',
    'operate a real estate portfolio.',
    'scale businesses from zero.',
    'train teams on emerging tech.',
    'am training for an Ironman.',
  ];

  const typedEl = document.getElementById('typed-text');
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 60;

  function typeRole() {
    const current = roles[roleIndex];

    if (isDeleting) {
      typedEl.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 30;
    } else {
      typedEl.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 60;
    }

    if (!isDeleting && charIndex === current.length) {
      typeSpeed = 2000; // Pause at end
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 400; // Pause before next word
    }

    setTimeout(typeRole, typeSpeed);
  }

  // ========================================
  //  HERO ANIMATIONS (GSAP)
  // ========================================
  function startHeroAnimations() {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.8 }, 0.1)
      .to('.name-word', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.15,
      }, 0.3)
      .to('.name-dot', {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)',
      }, 0.9)
      .to('.hero-roles', { opacity: 1, duration: 0.8 }, 0.8)
      .to('.hero-desc', { opacity: 1, y: 0, duration: 0.8 }, 1)
      .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8 }, 1.1)
      .to('.hero-socials', { opacity: 1, y: 0, duration: 0.8 }, 1.2)
      .to('.scroll-indicator', { opacity: 0.6, duration: 1 }, 1.5);

    // Start typing after hero animation
    setTimeout(typeRole, 1500);
  }

  // ========================================
  //  GSAP SCROLL ANIMATIONS
  // ========================================
  gsap.registerPlugin(ScrollTrigger);

  // Section headers
  document.querySelectorAll('.section-header').forEach(header => {
    const num = header.querySelector('.section-number');
    const title = header.querySelector('.section-title');
    const line = header.querySelector('.section-line');

    gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    })
    .to(num, { opacity: 1, x: 0, duration: 0.6 })
    .to(title, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
    .to(line, { opacity: 1, scaleX: 1, duration: 1 }, 0.3);
  });

  // About text
  gsap.utils.toArray('.reveal-text').forEach((el, i) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.15,
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Stat cards
  document.querySelectorAll('.stat-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: i * 0.1,
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onStart: () => {
        // Animate counter
        const numEl = card.querySelector('.stat-number');
        const target = parseInt(numEl.dataset.count);
        const prefix = numEl.dataset.prefix || '';
        let current = 0;
        const increment = target / 40;
        const counter = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(counter);
          }
          numEl.textContent = prefix + Math.round(current);
        }, 30);
      }
    });
  });

  // Timeline items
  document.querySelectorAll('.timeline-item').forEach((item, i) => {
    gsap.to(item, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.2,
      scrollTrigger: {
        trigger: item,
        start: 'top 80%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Timeline line fill
  const timelineEl = document.querySelector('.timeline');
  if (timelineEl) {
    const lineFill = document.querySelector('.timeline-line-fill');
    ScrollTrigger.create({
      trigger: timelineEl,
      start: 'top 60%',
      end: 'bottom 40%',
      onUpdate: (self) => {
        lineFill.style.height = (self.progress * 100) + '%';
      }
    });
  }

  // Project cards
  document.querySelectorAll('.project-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      delay: i * 0.15,
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Skill orbs
  document.querySelectorAll('.skill-orb').forEach((orb, i) => {
    gsap.to(orb, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      delay: i * 0.06,
      scrollTrigger: {
        trigger: orb,
        start: 'top 90%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Cert cards
  document.querySelectorAll('.cert-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: i * 0.1,
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Edu cards
  document.querySelectorAll('.edu-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: i * 0.15,
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none',
      }
    });
  });

  // Contact section
  gsap.to('.contact-lead', {
    opacity: 1, y: 0, duration: 0.8,
    scrollTrigger: { trigger: '.contact-lead', start: 'top 85%' }
  });

  document.querySelectorAll('.contact-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: i * 0.1,
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        toggleActions: 'play none none none',
      }
    });
  });

  // ========================================
  //  NAVBAR SCROLL EFFECT + ACTIVE LINK
  // ========================================
  const navbar = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const offset = window.pageYOffset;

        // Navbar background
        if (offset > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        // Active nav link
        let current = '';
        sections.forEach(section => {
          const sectionTop = section.offsetTop - 150;
          if (offset >= sectionTop) {
            current = section.getAttribute('id');
          }
        });

        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + current) {
            link.style.color = '#f87171';
          }
        });

        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // ========================================
  //  MOBILE MENU
  // ========================================
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ========================================
  //  VANILLA TILT INIT (project cards only)
  // ========================================
  if (window.innerWidth > 768) {
    VanillaTilt.init(document.querySelectorAll('.project-card[data-tilt]'), {
      max: 6,
      speed: 400,
      glare: true,
      'max-glare': 0.08,
      perspective: 1200,
    });
  }

  // ========================================
  //  SMOOTH SCROLL FOR ANCHOR LINKS
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Parallax removed for performance

  // ========================================
  //  PROJECT CARD GLOW FOLLOW CURSOR
  // ========================================
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const glow = card.querySelector('.project-card-glow');
      glow.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(239, 68, 68, 0.15), transparent 40%)`;
      glow.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      const glow = card.querySelector('.project-card-glow');
      glow.style.opacity = '0';
    });
  });

});
