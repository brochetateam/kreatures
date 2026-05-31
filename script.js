document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('cursorGlow');
    const pupil = document.querySelector('.hero-pupil');
    const heroCircle = document.querySelector('.hero-circle');
    const skipFill = document.getElementById('skipFill');
    const skipPages = document.querySelectorAll('.skip-pages span');
    const sections = document.querySelectorAll('.section');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const contactForm = document.getElementById('contactForm');
    const tarots = document.querySelectorAll('.tarot');
    const domainLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.12;
        cursorY += (mouseY - cursorY) * 0.12;
        if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
        }
        if (pupil && heroCircle) {
            const rect = heroCircle.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (mouseX - cx) / rect.width;
            const dy = (mouseY - cy) / rect.height;
            const maxMove = 30;
            pupil.style.transform = `translate(-50%, -50%) translate(${dx * maxMove}px, ${dy * maxMove}px)`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.addEventListener('mousedown', () => {
        if (cursor) { cursor.style.transform = 'translate(-50%, -50%) scale(0.6)'; }
    });
    document.addEventListener('mouseup', () => {
        if (cursor) { cursor.style.transform = 'translate(-50%, -50%) scale(1)'; }
    });

    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.hue = Math.random() > 0.7 ? 15 : 35;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const force = (150 - dist) / 150 * 0.5;
                this.x -= dx / dist * force;
                this.y -= dy / dist * force;
            }
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles(count) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `hsla(15, 80%, 50%, ${0.05 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        animId = requestAnimationFrame(animateParticles);
    }

    initParticles(80);
    animateParticles();

    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        if (skipFill) skipFill.style.width = progress + '%';

        let current = '';
        sections.forEach(s => {
            if (scrollTop >= s.offsetTop - 300) {
                current = s.getAttribute('id');
            }
        });

        skipPages.forEach(sp => {
            sp.classList.toggle('active', sp.dataset.section === current);
        });

        document.querySelectorAll('.tarot').forEach(card => {
            const rect = card.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight - 100 && rect.bottom > 0;
            if (isVisible) {
                card.querySelectorAll('.tstat-fill').forEach(fill => {
                    const w = fill.style.getPropertyValue('--w');
                    if (w && fill.style.width === '0px' || fill.style.width === '') {
                        setTimeout(() => { fill.style.width = w; }, 200);
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    skipPages.forEach(sp => {
        sp.addEventListener('click', () => {
            const target = document.getElementById(sp.dataset.section);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    domainLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = document.getElementById(href.substring(1));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            mobileMenu.classList.toggle('open');
        });
        mobileLinks.forEach(l => {
            l.addEventListener('click', () => {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('open');
            });
        });
    }

    document.addEventListener('keydown', (e) => {
        const active = document.querySelector('.skip-pages span.active');
        const pages = Array.from(skipPages);
        const idx = pages.indexOf(active);
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const next = Math.min(idx + 1, pages.length - 1);
            const target = document.getElementById(pages[next].dataset.section);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = Math.max(idx - 1, 0);
            const target = document.getElementById(pages[prev].dataset.section);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.ritual-btn');
            const original = btn.innerHTML;
            btn.innerHTML = '<span class="btn-text">Summoning Initiated ✓</span>';
            btn.style.borderColor = 'var(--butterscotch)';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.style.borderColor = '';
                contactForm.reset();
            }, 3000);
        });
    }

    tarots.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const tiltX = (y - 0.5) * 10;
            const tiltY = (0.5 - x) * 10;
            card.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-10px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) translateY(0px)';
        });
    });

    const domainArticles = document.querySelectorAll('.domain');
    domainArticles.forEach(domain => {
        domain.addEventListener('mouseenter', () => {
            domainArticles.forEach(d => {
                if (d !== domain) d.style.opacity = '0.4';
            });
        });
        domain.addEventListener('mouseleave', () => {
            domainArticles.forEach(d => d.style.opacity = '1');
        });
    });

    const heroCTA = document.querySelector('.hero-cta');
    if (heroCTA) {
        heroCTA.addEventListener('mouseenter', () => {
            if (cursor) {
                cursor.style.width = '30px';
                cursor.style.height = '30px';
                cursor.style.background = 'var(--red)';
                cursor.style.boxShadow = '0 0 60px var(--red), 0 0 100px var(--red)';
            }
        });
        heroCTA.addEventListener('mouseleave', () => {
            if (cursor) {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.background = 'var(--butterscotch)';
                cursor.style.boxShadow = '0 0 40px var(--butterscotch), 0 0 80px var(--butterscotch)';
            }
        });
    }

    const style = document.createElement('style');
    style.textContent = `@media (hover: none) { .cursor-glow { display: none !important; } body { cursor: auto; } * { cursor: auto; } }`;
    document.head.appendChild(style);
});
