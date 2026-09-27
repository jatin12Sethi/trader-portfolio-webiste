document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Sticky Header Functionality
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.add('scrolled'); // Force scrolled state for better visibility or keep dynamic? Let's keep dynamic
            header.classList.remove('scrolled');
        }
        
        // Re-apply if > 50
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNav = document.querySelector('.mobile-nav');
    if (mobileMenuBtn && mobileNav) {
        const menuIcon = mobileMenuBtn.querySelector('i');

        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            if (mobileNav.classList.contains('active')) {
                menuIcon.classList.remove('bx-menu');
                menuIcon.classList.add('bx-x');
            } else {
                menuIcon.classList.remove('bx-x');
                menuIcon.classList.add('bx-menu');
            }
        });

        // Close mobile menu when a link is clicked
        const mobileLinks = document.querySelectorAll('.mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('active');
                menuIcon.classList.remove('bx-x');
                menuIcon.classList.add('bx-menu');
            });
        });
    }

    // 3. FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            // Close other open answers (optional, but good for UX)
            faqQuestions.forEach(q => {
                if (q !== question) {
                    q.classList.remove('active');
                    if(q.nextElementSibling) {
                        q.nextElementSibling.style.maxHeight = null;
                    }
                }
            });

            // Toggle current
            question.classList.toggle('active');
            const answer = question.nextElementSibling;
            if (question.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = null;
            }
        });
    });

    // 4. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-scroll');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust scroll position for sticky header
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Dark / light mode toggle (initial theme is applied by an inline script in <head>)
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        const root = document.documentElement;
        const syncToggle = () => {
            const light = root.getAttribute('data-theme') === 'light';
            const label = light ? 'Switch to dark mode' : 'Switch to light mode';
            themeToggle.innerHTML = `<i class='bx ${light ? 'bx-moon' : 'bx-sun'}'></i>`;
            themeToggle.setAttribute('aria-label', label);
            themeToggle.setAttribute('title', label);
        };
        syncToggle();
        themeToggle.addEventListener('click', () => {
            const light = root.getAttribute('data-theme') !== 'light';
            if (light) root.setAttribute('data-theme', 'light');
            else root.removeAttribute('data-theme');
            try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (e) {}
            syncToggle();
        });
    }

    // 6. Live P&L ticker (hero card) - value drifts up and down around the base
    const pnlValue = document.querySelector('.live-pnl-value');
    if (pnlValue) {
        const pnlArrow = document.querySelector('.live-pnl-arrow');
        const base = 12450, min = 9800, max = 15600;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const fmt = n => Math.round(n).toLocaleString('en-IN');
        let current = base;

        const animateTo = (from, to) => {
            if (reduceMotion) {
                pnlValue.textContent = fmt(to);
                return;
            }
            const start = performance.now();
            const duration = 600;
            const step = now => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                pnlValue.textContent = fmt(from + (to - from) * eased);
                if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        const tick = () => {
            // Random step with a pull back towards the base so it never wanders off
            const move = (Math.random() - 0.5) * 900 + (base - current) * 0.08;
            const next = Math.min(max, Math.max(min, current + move));
            const up = next >= current;

            pnlValue.classList.remove('tick-up', 'tick-down');
            void pnlValue.offsetWidth; // restart the flash animation
            pnlValue.classList.add(up ? 'tick-up' : 'tick-down');
            if (pnlArrow) {
                pnlArrow.className = `bx ${up ? 'bx-up-arrow-alt' : 'bx-down-arrow-alt'} live-pnl-arrow ${up ? 'up' : 'down'}`;
            }

            animateTo(current, next);
            current = next;
            setTimeout(tick, 1500 + Math.random() * 1500);
        };

        setTimeout(tick, 2000);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('.current-year').forEach(el => { el.textContent = new Date().getFullYear(); });

    // 7. Scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'p-progress';
    document.body.appendChild(progressBar);
    const updateProgress = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // 8. Mouse-follow highlight on cards
    const spotlightCards = document.querySelectorAll(
        '.problem-card, .pillar, .audience-card, .benefit-card, .course-card, .home-testimonial, ' +
        '.faq-item, .include-item, .testimonial-card, .bento-card'
    );
    spotlightCards.forEach(card => {
        card.classList.add('spotlight');
        const spot = document.createElement('span');
        spot.className = 'p-spot';
        card.prepend(spot);
        card.addEventListener('pointermove', e => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
            card.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
    });

    // 9. Count-up numbers (stats band)
    const counters = document.querySelectorAll('.count-up[data-count]');
    if (counters.length && !prefersReducedMotion && 'IntersectionObserver' in window) {
        const runCounter = el => {
            const target = parseInt(el.dataset.count, 10);
            const start = performance.now();
            const duration = 1400;
            const step = now => {
                const t = Math.min((now - start) / duration, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
                if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };
        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                runCounter(entry.target);
                counterObserver.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        counters.forEach(el => counterObserver.observe(el));
    }

    // 10. Floating WhatsApp button
    const whatsapp = document.createElement('a');
    whatsapp.className = 'p-whatsapp';
    whatsapp.href = 'https://wa.me/919172568611?text=' +
        encodeURIComponent('Hi, I am interested in your option selling courses.');
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener';
    whatsapp.setAttribute('aria-label', 'Chat with us on WhatsApp');
    whatsapp.innerHTML = "<i class='bx bxl-whatsapp'></i><span class='p-whatsapp-label'>Chat with us</span>";
    document.body.appendChild(whatsapp);

    // 11. Highlight the nav link of the section in view (home page)
    const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
    const trackedSections = navLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean)
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    if (trackedSections.length && 'IntersectionObserver' in window) {
        // Sections can be nested (FAQ sits inside Philosophy), so pick the last visible one in page order
        const visible = new Set();
        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) visible.add(entry.target);
                else visible.delete(entry.target);
            });
            const current = trackedSections.filter(section => visible.has(section)).pop();
            const id = current ? `#${current.id}` : null;
            navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === id));
        }, { rootMargin: '-45% 0px -50% 0px' });
        trackedSections.forEach(section => sectionObserver.observe(section));
    }

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // 12. Hero: glow follows the cursor, P&L card tilts towards it
    const hero = document.querySelector('.hero');
    const heroCard = document.querySelector('.hero .chart-card.mockup');
    if (hero && finePointer && !prefersReducedMotion) {
        hero.addEventListener('pointermove', e => {
            const rect = hero.getBoundingClientRect();
            hero.style.setProperty('--gx', `${e.clientX - rect.left}px`);
            hero.style.setProperty('--gy', `${e.clientY - rect.top}px`);
            if (heroCard) {
                const c = heroCard.getBoundingClientRect();
                const dx = (e.clientX - (c.left + c.width / 2)) / (rect.width / 2);
                const dy = (e.clientY - (c.top + c.height / 2)) / (rect.height / 2);
                heroCard.style.transform =
                    `perspective(1000px) rotateY(${(dx * 6).toFixed(2)}deg) rotateX(${(-dy * 6).toFixed(2)}deg)`;
            }
        });
        hero.addEventListener('pointerleave', () => {
            if (heroCard) heroCard.style.transform = '';
        });
    }

    // 13. Magnetic pull on the big call-to-action buttons
    if (finePointer && !prefersReducedMotion) {
        document.querySelectorAll('.btn-large, .tg-btn').forEach(btn => {
            btn.addEventListener('pointermove', e => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.22;
                const y = (e.clientY - r.top - r.height / 2) * 0.35;
                btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
            });
            btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
        });
    }

    // 14. Phone: sticky Apply / WhatsApp bar once the visitor scrolls past the first screen
    if (document.documentElement.dataset.page !== 'join') {
        const bar = document.createElement('div');
        bar.className = 'p-mobile-bar';
        bar.innerHTML =
            "<a href='join.html' class='pmb-apply'>Apply Now <i class='bx bx-right-arrow-alt'></i></a>" +
            `<a href='${whatsapp.href}' class='pmb-wa' target='_blank' rel='noopener' aria-label='Chat on WhatsApp'>` +
            "<i class='bx bxl-whatsapp'></i></a>";
        document.body.appendChild(bar);
        document.body.classList.add('has-mobile-bar');
        const toggleBar = () => bar.classList.toggle('show', window.scrollY > window.innerHeight * 0.6);
        window.addEventListener('scroll', toggleBar, { passive: true });
        toggleBar();
    }
});
