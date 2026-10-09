// Theme toggle -------------------------------------------------------------
(function () {
    const btn = document.getElementById('theme-toggle');
    const icon = btn.querySelector('i');
    const isDark = () =>
        document.documentElement.dataset.theme === 'dark' ||
        (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    const sync = () => { icon.className = isDark() ? 'fa-solid fa-sun' : 'fa-solid fa-moon'; };
    btn.addEventListener('click', () => {
        const next = isDark() ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
        sync();
    });
    sync();
})();

// Publication filter ---------------------------------------------------------
(function () {
    const buttons = document.querySelectorAll('.pub-filters button');
    const pubs = document.querySelectorAll('#pub-list .pub');
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const f = btn.dataset.filter;
            buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
            pubs.forEach((p) => { p.hidden = f !== 'all' && !p.dataset.tags.split(' ').includes(f); });
        });
    });
})();

// Highlight current section in nav -------------------------------------------
(function () {
    const links = [...document.querySelectorAll('.topbar-nav a')];
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
        });
    }, { rootMargin: '-40% 0px -55% 0px' });
    document.querySelectorAll('main .section').forEach((s) => obs.observe(s));
})();

// Reveal sections on scroll --------------------------------------------------
(function () {
    const els = document.querySelectorAll('.section, .pub');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.08 });
    els.forEach((el) => { el.classList.add('reveal'); obs.observe(el); });
})();

// Background: drifting particle field (a nod to diffusion trajectories) ------
(function () {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, dpr, pts;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        w = canvas.width = innerWidth * dpr;
        h = canvas.height = innerHeight * dpr;
        const n = Math.round((innerWidth * innerHeight) / 18000);
        pts = Array.from({ length: n }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr,
        }));
    }

    function frame() {
        const rgb = getComputedStyle(document.documentElement).getPropertyValue('--dot').trim();
        ctx.clearRect(0, 0, w, h);
        const maxD = 120 * dpr;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            ctx.fillStyle = `rgba(${rgb}, 0.35)`;
            ctx.beginPath(); ctx.arc(p.x, p.y, 1.4 * dpr, 0, Math.PI * 2); ctx.fill();
            for (let j = i + 1; j < pts.length; j++) {
                const q = pts[j];
                const d = Math.hypot(p.x - q.x, p.y - q.y);
                if (d < maxD) {
                    ctx.strokeStyle = `rgba(${rgb}, ${0.12 * (1 - d / maxD)})`;
                    ctx.lineWidth = dpr;
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
                }
            }
        }
        requestAnimationFrame(frame);
    }

    addEventListener('resize', resize);
    resize();
    frame();
})();
