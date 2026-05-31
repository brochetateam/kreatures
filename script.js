document.addEventListener('DOMContentLoaded', () => {
    const skipFill = document.getElementById('skipFill');
    const skipSections = document.querySelectorAll('.skip-sections span');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contactForm');
    const divisionBlocks = document.querySelectorAll('.division-block');

    function updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        
        if (skipFill) {
            skipFill.style.width = progress + '%';
        }

        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollTop >= sectionTop - 300) {
                currentSection = section.getAttribute('id');
            }
        });

        skipSections.forEach(label => {
            label.classList.remove('active');
            if (label.dataset.section === currentSection) {
                label.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateProgress);
    updateProgress();

    skipSections.forEach(label => {
        label.addEventListener('click', () => {
            const targetId = label.dataset.section;
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    divisionBlocks.forEach(block => {
        block.addEventListener('mouseenter', () => {
            divisionBlocks.forEach(b => {
                if (b !== block) {
                    b.style.opacity = '0.5';
                }
            });
        });

        block.addEventListener('mouseleave', () => {
            divisionBlocks.forEach(b => {
                b.style.opacity = '1';
            });
        });
    });

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const btn = contactForm.querySelector('.btn-submit');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<span>TRANSMISSION_SENT ✓</span>';
            btn.style.background = 'var(--butterscotch)';
            
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

    document.querySelectorAll('.creature-card, .division-block').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    const statFills = document.querySelectorAll('.stat-fill');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 200);
            }
        });
    }, { threshold: 0.5 });

    statFills.forEach(fill => statObserver.observe(fill));

    document.querySelectorAll('.creature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    document.addEventListener('keydown', (e) => {
        const currentActive = document.querySelector('.skip-sections span.active');
        const sectionsArray = Array.from(skipSections);
        const currentIndex = sectionsArray.indexOf(currentActive);
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = Math.min(currentIndex + 1, sectionsArray.length - 1);
            const targetId = sectionsArray[nextIndex].dataset.section;
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
        }
        
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevIndex = Math.max(currentIndex - 1, 0);
            const targetId = sectionsArray[prevIndex].dataset.section;
            document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
        }
    });

    const glitchElements = document.querySelectorAll('.division-title');
    glitchElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.animation = 'none';
            el.offsetHeight;
            el.style.animation = 'glitch 0.3s ease-out';
        });
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes glitch {
            0% { transform: translate(0); }
            20% { transform: translate(-2px, 2px); }
            40% { transform: translate(-2px, -2px); }
            60% { transform: translate(2px, 2px); }
            80% { transform: translate(2px, -2px); }
            100% { transform: translate(0); }
        }
    `;
    document.head.appendChild(style);
});
