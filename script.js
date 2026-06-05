function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function cssRgba(name, alpha) {
    const hex = cssVar(name);
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.getElementById('cursorGlow');
    const skipFill = document.getElementById('skipFill');
    const skipPages = document.querySelectorAll('.skip-pages span');
    const sections = document.querySelectorAll('.section');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const contactForm = document.getElementById('contactForm');
    const tarots = document.querySelectorAll('.tarot');
    const domainLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const magneticBtn = document.querySelector('.hero-cta');

    const themes = ['bestiary', 'cinder', 'depths', 'solar', 'pale'];
    function setTheme(name) {
        if (document.startViewTransition) {
            document.startViewTransition(() => {
                document.documentElement.setAttribute('data-theme', name);
                localStorage.setItem('kreatures-theme', name);
                document.querySelectorAll('.theme-dot').forEach(d => d.classList.toggle('active', d.dataset.theme === name));
            });
        } else {
            document.documentElement.setAttribute('data-theme', name);
            localStorage.setItem('kreatures-theme', name);
            document.querySelectorAll('.theme-dot').forEach(d => d.classList.toggle('active', d.dataset.theme === name));
        }
    }
    function initTheme() {
        const saved = localStorage.getItem('kreatures-theme');
        if (saved && themes.includes(saved)) { setTheme(saved); return; }
        setTheme('pale');
    }
    initTheme();
    document.querySelectorAll('.theme-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            setTheme(dot.dataset.theme);
            if (navToggle && mobileMenu) {
                navToggle.classList.remove('active');
                mobileMenu.classList.remove('open');
            }
        });
    });

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
        if (magneticBtn) {
            const rect = magneticBtn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = mouseX - cx;
            const dy = mouseY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = 180;
            const pull = 0.25;
            if (dist < radius && dist > 0) {
                const strength = (1 - dist / radius) * pull;
                magneticBtn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
            } else {
                magneticBtn.style.transform = '';
            }
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

    initSnake();
    initArt();
    initAnim();
});

function initSnake() {
    const codeEl = document.getElementById('codeTyper');
    const codeStage = document.getElementById('codeStage');
    const snakeCanvas = document.getElementById('snakeCanvas');
    const codeStatus = document.getElementById('codeStatus');
    const pre = codeStage?.querySelector('.code-typer');
    if (!codeEl || !snakeCanvas || !codeStatus) return;

    const code = [
        'function SnakeGame() {',
        '  let snake = [{x:6,y:4}];',
        '  let food = {x:8,y:4};',
        '  let dir = {x:1,y:0};',
        '  ',
        '  function update() {',
        '    let h = snake[0];',
        '    let nx = h.x + dir.x;',
        '    let ny = h.y + dir.y;',
        '    if (nx===food.x&&ny===food.y){',
        '      food={x:rand(12),y:rand(8)};',
        '    } else { snake.pop(); }',
        '    snake.unshift({x:nx,y:ny});',
        '  }',
        '}'
    ].join('\n');

    let typed = '', idx = 0;
    let cursorVisible = true;
    let gameCount = 0;
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && idx < code.length) {
            typeNext();
            observer.disconnect();
        }
    }, { threshold: 0.3 });
    observer.observe(codeStage);

    function typeNext() {
        if (idx >= code.length) {
            codeStatus.textContent = '▸ execution ready';
            codeStatus.classList.add('active');
            setTimeout(startSnake, 800);
            return;
        }
        typed += code[idx];
        codeEl.textContent = typed;
        codeEl.parentElement.scrollTop = codeEl.parentElement.scrollHeight;
        idx++;
        const delay = code[idx - 1] === '\n' ? 60 : Math.random() * 25 + 15;
        setTimeout(typeNext, delay);
    }

    function startSnake() {
        pre.classList.add('fade-out');
        snakeCanvas.classList.remove('hidden');
        requestAnimationFrame(() => {
        snakeCanvas.width = snakeCanvas.clientWidth;
        snakeCanvas.height = 160;
        codeStatus.textContent = '▸ running...';

        const ctx = snakeCanvas.getContext('2d');
        const COLS = Math.floor(snakeCanvas.width / 20), ROWS = 8;
        const CELL = Math.floor(snakeCanvas.width / COLS);
        let snake = [{x: 6, y: 4}];
        let food = {x: 8, y: 4};
        let dir = {x: 1, y: 0};
        let gameOver = false;
        let score = 0;
        let moveCount = 0;

        function rand(n) { return Math.floor(Math.random() * n); }

        function spawnFood() {
            let f;
            do { f = {x: rand(COLS), y: rand(ROWS)}; }
            while (snake.some(s => s.x === f.x && s.y === f.y));
            return f;
        }

        function update() {
            if (gameOver) return;
            moveCount++;
            if (moveCount > 200) {
                gameOver = true;
                codeStatus.textContent = '▸ game over · restarting...';
                setTimeout(reset, 1500);
                return;
            }
            let head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};
            if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
                snake.some(s => s.x === head.x && s.y === head.y)) {
                gameOver = true;
                codeStatus.textContent = '▸ game over · restarting...';
                setTimeout(reset, 1500);
                return;
            }
            if (head.x === food.x && head.y === food.y) {
                score++;
                food = spawnFood();
            } else {
                snake.pop();
            }
            snake.unshift(head);
        }

        function draw() {
            ctx.fillStyle = cssVar('--bg');
            ctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
            ctx.fillStyle = cssRgba('--orange', 0.08);
            for (let x = 0; x < COLS; x++)
                for (let y = 0; y < ROWS; y++)
                    if ((x + y) % 2 === 0) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
            snake.forEach((s, i) => {
                ctx.fillStyle = cssVar('--orange');
                ctx.shadowColor = cssVar('--orange');
                ctx.shadowBlur = i === 0 ? 8 : 3;
                ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
            });
            ctx.shadowBlur = 0;
            ctx.fillStyle = cssVar('--red');
            ctx.shadowColor = cssVar('--red');
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = cssVar('--cream');
            ctx.font = '8px Space Mono';
            ctx.fillText('SCORE:' + score, 4, 10);
        }

        function aiDir() {
            const h = snake[0];
            const dx = food.x - h.x;
            const dy = food.y - h.y;
            const poss = [];
            if (dx > 0) poss.push({x: 1, y: 0});
            if (dx < 0) poss.push({x: -1, y: 0});
            if (dy > 0) poss.push({x: 0, y: 1});
            if (dy < 0) poss.push({x: 0, y: -1});
            const safe = poss.filter(d => {
                const nx = h.x + d.x, ny = h.y + d.y;
                return !(nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS ||
                    snake.some(s => s.x === nx && s.y === ny));
            });
            if (safe.length > 0) dir = safe[0];
            else {
                const fallback = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
                const f = fallback.find(d => {
                    const nx = h.x + d.x, ny = h.y + d.y;
                    return !(nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS ||
                        snake.some(s => s.x === nx && s.y === ny));
                });
                if (f) dir = f;
            }
        }

        function reset() {
            snake = [{x: 6, y: 4}];
            food = {x: 8, y: 4};
            dir = {x: 1, y: 0};
            gameOver = false;
            score = 0;
            moveCount = 0;
            gameCount++;
            if (gameCount >= 1) {
                gameCount = 0;
                snakeCanvas.classList.add('hidden');
                pre.classList.remove('fade-out');
                typed = '';
                idx = 0;
                codeEl.textContent = '';
                codeStatus.textContent = '▸ booting...';
                codeStatus.classList.remove('active');
                typeNext();
                return;
            }
            codeStatus.textContent = '▸ running...';
        }

        let frame = 0;
        let loopTimer = null;
        function loop() {
            if (gameOver && snakeCanvas.classList.contains('hidden')) return;
            aiDir();
            if (frame % 4 === 0) update();
            draw();
            frame++;
            loopTimer = setTimeout(loop, 40);
        }
        loop();
        });
    }
}

function initArt() {
    const canvas = document.getElementById('artCanvas');
    const status = document.getElementById('artStatus');
    if (!canvas || !status) return;

    const wrap = canvas.parentElement;
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            startArt();
            observer.disconnect();
        }
    }, { threshold: 0.3 });
    observer.observe(wrap);

    let phase = 0; 
    let progress = 0;
    let branches = [];
    let ctx;
    let inkFrames = 0;

    function startArt() {
        canvas.width = canvas.clientWidth;
        canvas.height = 160;
        ctx = canvas.getContext('2d');
        status.textContent = '▸ sketching...';
        status.classList.add('active');
        phase = 0;
        progress = 0;
        branches = [];
        inkFrames = 0;
        animateArt();
    }

    const foxPath = [
        { type: 'move', x: 0.2, y: 0.7 },
        { type: 'curve', cx1: 0.22, cy1: 0.55, cx2: 0.25, cy2: 0.4, x: 0.3, y: 0.3 },
        { type: 'curve', cx1: 0.28, cy1: 0.22, cx2: 0.25, cy2: 0.12, x: 0.2, y: 0.08 },
        { type: 'curve', cx1: 0.22, cy1: 0.1, cx2: 0.3, cy2: 0.05, x: 0.35, y: 0.1 },
        { type: 'curve', cx1: 0.35, cy1: 0.15, cx2: 0.4, cy2: 0.18, x: 0.38, y: 0.2 },
        { type: 'curve', cx1: 0.45, cy1: 0.15, cx2: 0.55, cy2: 0.15, x: 0.55, y: 0.2 },
        { type: 'curve', cx1: 0.5, cy1: 0.2, cx2: 0.45, cy2: 0.22, x: 0.42, y: 0.28 },
        { type: 'curve', cx1: 0.5, cy1: 0.28, cx2: 0.6, cy2: 0.3, x: 0.6, y: 0.35 },
        { type: 'curve', cx1: 0.55, cy1: 0.35, cx2: 0.48, cy2: 0.38, x: 0.45, y: 0.4 },
        { type: 'curve', cx1: 0.5, cy1: 0.45, cx2: 0.55, cy2: 0.55, x: 0.5, y: 0.62 },
        { type: 'curve', cx1: 0.48, cy1: 0.58, cx2: 0.4, cy2: 0.65, x: 0.38, y: 0.68 },
        { type: 'curve', cx1: 0.4, cy1: 0.7, cx2: 0.35, cy2: 0.72, x: 0.32, y: 0.7 },
        { type: 'curve', cx1: 0.3, cy1: 0.72, cx2: 0.25, cy2: 0.73, x: 0.2, y: 0.7 },
    ];

    const totalSteps = foxPath.length;

    function drawSegment(i, t) {
        const p = foxPath[i];
        const pw = canvas.width, ph = canvas.height;
        if (p.type === 'move') {
            ctx.moveTo(p.x * pw, p.y * ph);
            return;
        }
        const endX = p.x * pw, endY = p.y * ph;
        const c1x = p.cx1 * pw, c1y = p.cy1 * ph;
        const c2x = p.cx2 * pw, c2y = p.cy2 * ph;
        const steps = 20;
        const drawSteps = Math.floor(steps * t);
        for (let s = 0; s <= drawSteps; s++) {
            const u = s / steps;
            const bx = Math.pow(1 - u, 3) * (i === 1 ? foxPath[0].x * pw : ctx.lastX) +
                3 * Math.pow(1 - u, 2) * u * c1x +
                3 * (1 - u) * Math.pow(u, 2) * c2x +
                Math.pow(u, 3) * endX;
            const by = Math.pow(1 - u, 3) * (i === 1 ? foxPath[0].y * ph : ctx.lastY) +
                3 * Math.pow(1 - u, 2) * u * c1y +
                3 * (1 - u) * Math.pow(u, 2) * c2y +
                Math.pow(u, 3) * endY;
            if (s === 0) ctx.lineTo(bx, by);
            else ctx.lineTo(bx, by);
        }
        ctx.lastX = endX;
        ctx.lastY = endY;
    }

    function drawFox() {
        const pw = canvas.width, ph = canvas.height;
        ctx.lastX = foxPath[0].x * pw;
        ctx.lastY = foxPath[0].y * ph;
        const segsDone = Math.floor(progress);
        const segT = progress - segsDone;
        ctx.beginPath();
        ctx.moveTo(foxPath[0].x * pw, foxPath[0].y * ph);
        for (let i = 1; i <= Math.min(segsDone, totalSteps - 1); i++) {
            const p = foxPath[i];
            const endX = p.x * pw, endY = p.y * ph;
            if (i < segsDone) {
                ctx.bezierCurveTo(p.cx1 * pw, p.cy1 * ph, p.cx2 * pw, p.cy2 * ph, endX, endY);
                ctx.lastX = endX; ctx.lastY = endY;
            } else {
                const u = segT;
                const bx = Math.pow(1-u,3) * ctx.lastX + 3*Math.pow(1-u,2)*u * p.cx1*pw + 3*(1-u)*Math.pow(u,2) * p.cx2*pw + Math.pow(u,3) * endX;
                const by = Math.pow(1-u,3) * ctx.lastY + 3*Math.pow(1-u,2)*u * p.cy1*ph + 3*(1-u)*Math.pow(u,2) * p.cy2*ph + Math.pow(u,3) * endY;
                ctx.lineTo(bx, by);
            }
        }
        ctx.strokeStyle = cssVar('--orange');
        ctx.lineWidth = 2;
        ctx.shadowColor = cssVar('--orange');
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    function spawnBranches() {
        if (branches.length < 60 && Math.random() < 0.15) {
            const bx = Math.random() * canvas.width;
            const by = Math.random() * canvas.height;
            branches.push({
                x: bx, y: by,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.5 - 0.1,
                life: 1,
                hue: Math.random() > 0.5 ? 35 : 15,
                size: Math.random() * 1.5 + 0.5
            });
        }
    }

    function updateBranches() {
        for (let i = branches.length - 1; i >= 0; i--) {
            const b = branches[i];
            b.x += b.vx;
            b.y += b.vy;
            b.vy += 0.002;
            b.life -= 0.003;
            b.vx += (Math.random() - 0.5) * 0.02;
            if (b.life <= 0 || b.y > canvas.height) {
                branches.splice(i, 1);
            }
        }
    }

    function drawBranches() {
        branches.forEach(b => {
            ctx.globalAlpha = b.life * 0.4;
            ctx.fillStyle = b.hue === 35 ? cssVar('--butterscotch') : cssVar('--red');
            ctx.shadowColor = b.hue === 35 ? cssVar('--butterscotch') : cssVar('--red');
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    function animateArt() {
        if (phase === 0) {
            progress += 0.015;
            if (progress >= totalSteps) {
                progress = totalSteps - 1;
                phase = 1;
                inkFrames = 0;
                status.textContent = '▸ inking...';
            }
        } else {
            inkFrames++;
            if (inkFrames > 180) {
                progress = 0;
                phase = 0;
                inkFrames = 0;
                branches = [];
                status.textContent = '▸ sketching...';
            }
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = cssVar('--bg');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (progress > 0) drawFox();
        if (phase >= 1) {
            spawnBranches();
            updateBranches();
            drawBranches();
        }
        requestAnimationFrame(animateArt);
    }
}

function initAnim() {
    const canvas = document.getElementById('animCanvas');
    const status = document.getElementById('animStatus');
    if (!canvas || !status) return;

    const wrap = canvas.parentElement;
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            startAnim();
            observer.disconnect();
        }
    }, { threshold: 0.3 });
    observer.observe(wrap);

    let phase = 0;
    let morphT = 0;
    let morphCycle = 0;
    let ctx;

    const shapes = [
        { name: 'fox', cssKey: '--orange', verts: [
            [0.5, 0.08], [0.62, 0.12], [0.58, 0.2], [0.7, 0.25],
            [0.65, 0.32], [0.55, 0.3], [0.5, 0.38], [0.5, 0.7],
            [0.45, 0.7], [0.45, 0.38], [0.35, 0.3], [0.3, 0.32],
            [0.35, 0.25], [0.42, 0.2], [0.38, 0.12]
        ]},
        { name: 'bird', cssKey: '--butterscotch', verts: [
            [0.5, 0.1], [0.55, 0.08], [0.6, 0.1], [0.75, 0.15],
            [0.85, 0.18], [0.8, 0.25], [0.65, 0.28], [0.52, 0.3],
            [0.5, 0.5], [0.5, 0.7], [0.45, 0.7], [0.45, 0.5],
            [0.35, 0.28], [0.2, 0.25], [0.15, 0.18],
            [0.25, 0.15], [0.4, 0.1], [0.45, 0.08]
        ]},
        { name: 'cat', cssKey: '--red', verts: [
            [0.5, 0.05], [0.56, 0.05], [0.6, 0.1], [0.68, 0.12],
            [0.72, 0.18], [0.7, 0.25], [0.65, 0.28], [0.55, 0.3],
            [0.5, 0.38], [0.5, 0.7], [0.45, 0.7], [0.45, 0.38],
            [0.35, 0.3], [0.3, 0.28], [0.28, 0.25],
            [0.32, 0.18], [0.4, 0.12], [0.44, 0.1]
        ]}
    ];

    function startAnim() {
        canvas.width = canvas.clientWidth;
        canvas.height = 160;
        ctx = canvas.getContext('2d');
        status.textContent = '▸ morphing...';
        status.classList.add('active');
        phase = 0; morphT = 0; morphCycle = 0;
        animateAnim();
    }

    function lerpVerts(v1, v2, t) {
        const max = Math.max(v1.length, v2.length);
        const result = [];
        for (let i = 0; i < max; i++) {
            const a = v1[i % v1.length] || v1[v1.length - 1];
            const b = v2[i % v2.length] || v2[v2.length - 1];
            result.push([
                a[0] + (b[0] - a[0]) * t,
                a[1] + (b[1] - a[1]) * t
            ]);
        }
        return result;
    }

    function lerpColor(c1, c2, t) {
        const r1 = parseInt(c1.slice(1, 3), 16), g1 = parseInt(c1.slice(3, 5), 16), b1 = parseInt(c1.slice(5, 7), 16);
        const r2 = parseInt(c2.slice(1, 3), 16), g2 = parseInt(c2.slice(3, 5), 16), b2 = parseInt(c2.slice(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return `rgb(${r},${g},${b})`;
    }

    function drawShape(verts, color, shadow) {
        const pw = canvas.width, ph = canvas.height;
        const cx = pw / 2, cy = ph / 2 + 10;
        const sc = 0.6;
        ctx.beginPath();
        verts.forEach((v, i) => {
            const x = cx + (v[0] - 0.5) * pw * sc;
            const y = cy + (v[1] - 0.5) * ph * sc;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.shadowColor = shadow;
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.stroke();
    }

    function spawnParticle(x, y) {
        particles.push({
            x, y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3,
            life: 1, size: Math.random() * 3 + 1
        });
    }

    function cycle() {
        morphT += 0.02;
        if (morphT >= 1) {
            morphT = 0;
            morphCycle = (morphCycle + 1) % 6;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = cssVar('--bg');
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const s1 = Math.floor(morphCycle / 2) % 3;
        const s2 = (s1 + 1) % 3;
        const verts = lerpVerts(shapes[s1].verts, shapes[s2].verts, morphT);
        const color = lerpColor(cssVar(shapes[s1].cssKey), cssVar(shapes[s2].cssKey), morphT);
        drawShape(verts, color, cssRgba('--butterscotch', 0.15));
        const names = ['Fox','Bird','Cat'];
        ctx.fillStyle = cssRgba('--cream', 0.5);
        ctx.font = '9px Space Mono';
        ctx.textAlign = 'center';
        ctx.fillText(names[s1] + ' → ' + names[s2], canvas.width / 2, 20);
    }

    function animateAnim() {
        cycle();
        draw();
        requestAnimationFrame(animateAnim);
    }
}
