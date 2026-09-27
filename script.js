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
});
