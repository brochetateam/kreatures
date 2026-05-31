document.addEventListener('DOMContentLoaded', () => {
    const eyeCursor = document.getElementById('eyeCursor');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const divisionTabs = document.querySelectorAll('.division-tab');
    const divisionPanels = document.querySelectorAll('.division-panel');
    const progressFill = document.getElementById('progressFill');
    const progressLabels = document.querySelectorAll('.progress-labels span');
    const sections = document.querySelectorAll('.section');
    const navLinksItems = document.querySelectorAll('.nav-links a');
    const contactForm = document.getElementById('contactForm');

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        if (eyeCursor) {
            eyeCursor.style.left = cursorX + 'px';
            eyeCursor.style.top = cursorY + 'px';
        }
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.addEventListener('mousedown', () => {
        if (eyeCursor) {
            eyeCursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        }
    });

    document.addEventListener('mouseup', () => {
        if (eyeCursor) {
            eyeCursor.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    });

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    divisionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetDivision = tab.dataset.division;
            
            divisionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            divisionPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.dataset.division === targetDivision) {
                    panel.classList.add('active');
                }
            });

            updateAccentColor(targetDivision);
        });
    });

    function updateAccentColor(division) {
        const root = document.documentElement;
        
        switch(division) {
            case 'code':
                root.style.setProperty('--active-accent', 'var(--light-navy)');
                break;
            case 'art':
                root.style.setProperty('--active-accent', 'var(--butterscotch)');
                break;
            case 'anim':
                root.style.setProperty('--active-accent', 'var(--rose-madder)');
                break;
        }
    }

    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }

        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollTop >= sectionTop - 200) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinksItems.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === currentSection) {
                link.classList.add('active');
            }
        });

        progressLabels.forEach(label => {
            label.classList.remove('active');
            if (label.dataset.section === currentSection) {
                label.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    progressLabels.forEach(label => {
        label.addEventListener('click', () => {
            const targetId = label.dataset.section;
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    navLinksItems.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Form submitted:', data);
            
            const btn = contactForm.querySelector('.btn-submit');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>TRANSMISSION_SENT ✓</span>';
            btn.style.background = 'var(--light-navy)';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.background = '';
                contactForm.reset();
            }, 3000);
        });
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .creature-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    const creatureCards = document.querySelectorAll('.creature-card');
    creatureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const svg = card.querySelector('.creature-svg');
            if (svg) {
                svg.style.animation = 'none';
                svg.style.transform = 'scale(1.1) rotate(5deg)';
                svg.style.transition = 'transform 0.3s ease-out';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const svg = card.querySelector('.creature-svg');
            if (svg) {
                svg.style.transform = '';
                svg.style.transition = 'transform 0.3s ease-out';
            }
        });
    });

    const codeBlock = document.querySelector('.code-block code');
    if (codeBlock) {
        const text = codeBlock.textContent;
        codeBlock.textContent = '';
        let i = 0;
        
        function typeCode() {
            if (i < text.length) {
                codeBlock.textContent += text.charAt(i);
                i++;
                setTimeout(typeCode, 20);
            }
        }
        
        const codeObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                typeCode();
                codeObserver.disconnect();
            }
        });
        
        codeObserver.observe(codeBlock.closest('.code-block'));
    }

    const statFills = document.querySelectorAll('.stat-fill');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 100);
            }
        });
    }, { threshold: 0.5 });

    statFills.forEach(fill => statObserver.observe(fill));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (navToggle && navLinks) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        }
    });

    const style = document.createElement('style');
    style.textContent = `
        @media (hover: none) {
            .eye-cursor { display: none !important; }
            body { cursor: auto !important; }
            * { cursor: auto !important; }
        }
    `;
    document.head.appendChild(style);
});
