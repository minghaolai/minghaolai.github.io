(function () {
  const root = document.documentElement;

  /* ---------- language ---------- */
  const titles = { zh: '赖铭浩 | 个人主页', en: 'Minghao Lai | Homepage' };
  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    document.title = titles[lang];
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }
  let saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  const params = new URLSearchParams(location.search);
  const initial = params.get('lang') || saved ||
    ((navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
  setLang(initial === 'en' ? 'en' : 'zh');
  document.getElementById('langBtn').addEventListener('click', () => {
    setLang(root.getAttribute('data-lang') === 'zh' ? 'en' : 'zh');
  });

  /* ---------- avatar fallback ---------- */
  const avatar = document.querySelector('.photo-frame');
  const img = document.getElementById('avatarImg');
  const markNoImg = () => avatar && avatar.classList.add('no-img');
  if (img) {
    if (img.complete && img.naturalWidth === 0) markNoImg();
    img.addEventListener('error', markNoImg);
  }

  /* ---------- figure lightbox ---------- */
  const lb = document.getElementById('lightbox');
  if (lb) {
    const lbImg = lb.querySelector('img');
    document.querySelectorAll('[data-zoom]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault(); lbImg.src = a.getAttribute('href'); lb.classList.add('open');
    }));
    const close = () => lb.classList.remove('open');
    lb.addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  /* ---------- mobile menu ---------- */
  const links = document.getElementById('navLinks');
  document.getElementById('menuBtn').addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

  /* ---------- nav state / back to top ---------- */
  const nav = document.querySelector('.nav');
  const toTop = document.getElementById('toTop');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);
    toTop.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- active section highlight ---------- */
  const navMap = {};
  links.querySelectorAll('a[href^="#"]').forEach(a => { navMap[a.getAttribute('href').slice(1)] = a; });
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && navMap[e.target.id]) {
        Object.values(navMap).forEach(a => a.classList.remove('active'));
        navMap[e.target.id].classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('section[id]').forEach(s => secObs.observe(s));

  /* ---------- reveal on scroll ---------- */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (el.closest('.hero') ? i * 90 : 0) + 'ms';
    revObs.observe(el);
  });

  /* ---------- count-up numbers ---------- */
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      const t0 = performance.now(), dur = 1200;
      const step = now => {
        const p = Math.min((now - t0) / dur, 1), v = target * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toFixed(dec);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

  /* ---------- background particle network ---------- */
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, pts = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(Math.floor(W * H / 16000), 90);
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25
    }));
  }
  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 140 * 140) {
          ctx.strokeStyle = `rgba(129,140,248,${(1 - Math.sqrt(d2) / 140) * 0.18})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const mx = a.x - mouse.x, my = a.y - mouse.y, md = Math.sqrt(mx * mx + my * my);
      if (md < 180) {
        ctx.strokeStyle = `rgba(34,211,238,${(1 - md / 180) * 0.35})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(165,180,252,.55)';
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  resize();
  window.addEventListener('resize', resize);
  draw();

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
