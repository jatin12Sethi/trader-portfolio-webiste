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
    
    // Trigger as soon as the block enters the viewport: a ratio threshold never fires for blocks taller than
    // the screen (the courses block is several screens tall on phones and stayed invisible)
    const revealOptions = {
        threshold: 0,
        rootMargin: "0px 0px -60px 0px"
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
            document.dispatchEvent(new CustomEvent('themechange'));
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

    // Course details shared by the course finder (home) and the application form summary (join)
    const COURSES = {
        basics: {
            name: 'Stock Market Basics Course', accent: 'blue', duration: '10 days · 1 hr a day · live online',
            basic: '₹8,000', premium: '₹10,000', pdf: 'courses/stock-market-basics-course.pdf',
            why: 'Build a solid foundation first: how the market works, order types, F&O basics and technical analysis.'
        },
        intraday: {
            name: 'Intraday Option Selling Course', accent: 'gold', duration: '12 days · live post-market classes',
            basic: '₹15,000', premium: '₹25,000', pdf: 'courses/intraday-option-selling-course.pdf',
            why: 'Learn high-probability intraday setups, strike selection, adjustments and strict risk rules.'
        },
        positional: {
            name: 'Positional Option Selling Course', accent: 'green', duration: '20 days · live post-market classes',
            basic: '₹20,000', premium: '₹30,000', pdf: 'courses/positional-option-selling-course.pdf',
            why: 'Master straddles, strangles, iron condors and iron flies to build a steady monthly income system.'
        }
    };

    // 15. Theta decay demo: premium falls with the square root of the time left
    const thetaSlider = document.getElementById('thetaDays');
    if (thetaSlider) {
        const widget = document.querySelector('.theta-widget');
        const chart = document.querySelector('.theta-chart');
        const T = 30, P0 = 200, X0 = 40, X1 = 580, Y0 = 30, Y1 = 240;
        const xAt = d => X0 + (1 - d / T) * (X1 - X0);
        const premiumAt = d => P0 * Math.sqrt(Math.max(d, 0) / T);
        const yAt = p => Y0 + (1 - p / P0) * (Y1 - Y0);
        const pathUntil = dEnd => {
            let d = '';
            for (let i = 0; i <= 60; i++) {
                const day = T - (T - dEnd) * i / 60;
                d += `${i ? 'L' : 'M'}${xAt(day).toFixed(1)} ${yAt(premiumAt(day)).toFixed(1)}`;
            }
            return d;
        };
        const line = chart.querySelector('.theta-line');
        const area = chart.querySelector('.theta-area');
        const cursorLine = chart.querySelector('.theta-cursor');
        const dot = chart.querySelector('.theta-dot');
        const halo = chart.querySelector('.theta-dot-halo');
        const particleLayer = chart.querySelector('.theta-particles');
        const premiumEl = document.getElementById('thetaPremium');
        const gainEl = document.getElementById('thetaGain');
        const rateEl = document.getElementById('thetaRate');
        const daysEl = document.getElementById('thetaDaysLabel');
        const buyerEl = document.getElementById('thetaBuyer');
        const sellerEl = document.getElementById('thetaSeller');
        const buyerBar = document.getElementById('thetaBuyerBar');
        const sellerBar = document.getElementById('thetaSellerBar');
        const expiryBadge = document.getElementById('thetaExpiryBadge');
        const playBtn = document.getElementById('thetaPlay');
        chart.querySelector('.theta-full').setAttribute('d', pathUntil(0));

        // Gold "coins" drip off the curve as premium melts away
        const particles = [];
        let particleRaf = 0;
        let pendingDrop = 0;
        const tickParticles = () => {
            for (let i = particles.length - 1; i >= 0; i--) {
                const pt = particles[i];
                pt.vy += 0.14;
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.life -= 0.02;
                if (pt.life <= 0 || pt.y > Y1 + 30) {
                    pt.el.remove();
                    particles.splice(i, 1);
                    continue;
                }
                pt.el.setAttribute('cx', pt.x.toFixed(1));
                pt.el.setAttribute('cy', pt.y.toFixed(1));
                pt.el.setAttribute('opacity', pt.life.toFixed(2));
            }
            particleRaf = particles.length ? requestAnimationFrame(tickParticles) : 0;
        };
        const spawnParticle = (x, y) => {
            if (prefersReducedMotion || particles.length > 70) return;
            const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            el.setAttribute('r', (1.8 + Math.random() * 2.2).toFixed(1));
            particleLayer.appendChild(el);
            particles.push({ el, x, y, vx: (Math.random() - 0.5) * 1.8, vy: -0.6 - Math.random() * 1.4, life: 1 });
            if (!particleRaf) particleRaf = requestAnimationFrame(tickParticles);
        };

        let lastPremium = P0;
        const render = days => {
            const p = premiumAt(days);
            const path = pathUntil(days);
            const x = xAt(days);
            const y = yAt(p);
            line.setAttribute('d', path);
            area.setAttribute('d', `${path}L${x.toFixed(1)} ${Y1}L${X0} ${Y1}Z`);
            cursorLine.setAttribute('x1', x.toFixed(1));
            cursorLine.setAttribute('x2', x.toFixed(1));
            [dot, halo].forEach(c => { c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); });

            if (p < lastPremium) {
                pendingDrop += lastPremium - p;
                while (pendingDrop > 1.6) {
                    spawnParticle(x, y);
                    pendingDrop -= 1.6;
                }
            } else {
                pendingDrop = 0;
            }
            lastPremium = p;

            const pct = Math.round((1 - p / P0) * 100);
            const decayToday = days >= 1 ? p - premiumAt(days - 1) : p;
            premiumEl.textContent = Math.round(p);
            gainEl.textContent = pct;
            rateEl.innerHTML = days < 0.05 ? 'Fully decayed' : `<b>−₹${decayToday.toFixed(1)}</b> decay today`;
            buyerEl.textContent = pct ? `−${pct}%` : '0%';
            sellerEl.textContent = `+${pct}%`;
            buyerBar.style.width = `${pct}%`;
            sellerBar.style.width = `${pct}%`;
            const whole = Math.round(days);
            daysEl.textContent = whole === 0 ? 'Expiry' : whole;
            const atExpiry = days < 0.05;
            expiryBadge.hidden = !atExpiry;
            widget.classList.toggle('at-expiry', atExpiry);
            thetaSlider.style.setProperty('--fill', `${(1 - days / T) * 100}%`);
        };

        // Play / pause runs the clock down to expiry
        let playRaf = 0;
        const setPlayLabel = state => {
            const icon = state === 'playing' ? 'bx-pause' : state === 'done' ? 'bx-revision' : 'bx-play';
            const text = state === 'playing' ? 'Pause' : state === 'done' ? 'Replay' : 'Play decay';
            playBtn.innerHTML = `<i class='bx ${icon}'></i> <span>${text}</span>`;
            playBtn.classList.toggle('playing', state === 'playing');
        };
        const stopPlay = state => {
            cancelAnimationFrame(playRaf);
            playRaf = 0;
            setPlayLabel(state || 'idle');
        };
        const play = () => {
            let from = Number(thetaSlider.value);
            if (from <= 0) {
                from = T;
                lastPremium = P0;
            }
            if (prefersReducedMotion) {
                thetaSlider.value = 0;
                render(0);
                setPlayLabel('done');
                return;
            }
            const duration = 5600 * from / T;
            const start = performance.now();
            const step = now => {
                const t = Math.min((now - start) / duration, 1);
                const days = from * (1 - t);
                thetaSlider.value = Math.round(days);
                render(days);
                if (t < 1) playRaf = requestAnimationFrame(step);
                else stopPlay('done');
            };
            setPlayLabel('playing');
            playRaf = requestAnimationFrame(step);
        };
        playBtn.addEventListener('click', () => (playRaf ? stopPlay() : play()));
        thetaSlider.addEventListener('input', () => {
            if (playRaf) stopPlay();
            render(Number(thetaSlider.value));
        });
        render(T);

        // Play once when the chart first scrolls into view (unless the visitor already took control)
        if (!prefersReducedMotion && 'IntersectionObserver' in window) {
            let touched = false;
            ['pointerdown', 'keydown'].forEach(evt => thetaSlider.addEventListener(evt, () => { touched = true; }));
            playBtn.addEventListener('click', () => { touched = true; });
            const thetaObserver = new IntersectionObserver(entries => {
                if (!entries[0].isIntersecting) return;
                thetaObserver.disconnect();
                if (!touched) setTimeout(() => { if (!touched && !playRaf) play(); }, 400);
            }, { threshold: 0.5 });
            thetaObserver.observe(chart);
        }
    }

    // 16. Course finder: three answers vote for a course (ties go to the experience answer)
    const finder = document.getElementById('course-finder');
    if (finder) {
        const result = document.getElementById('finderResult');
        const questions = [...finder.querySelectorAll('.finder-q')];
        finder.addEventListener('change', () => {
            const picks = questions.map(q => (q.querySelector('input:checked') || {}).value);
            questions.forEach((q, i) => q.classList.toggle('answered', Boolean(picks[i])));
            if (picks.some(v => !v)) return;
            const votes = {};
            picks.forEach(v => { votes[v] = (votes[v] || 0) + 1; });
            const key = Object.keys(votes).reduce((best, k) => (votes[k] > votes[best] ? k : best), picks[0]);
            const c = COURSES[key];
            result.className = `finder-result accent-${c.accent}`;
            result.innerHTML = `
                <div>
                    <span class="finder-result-tag">Recommended for you</span>
                    <h4>${c.name}</h4>
                    <p>${c.why}</p>
                    <div class="finder-result-meta">
                        <span><i class='bx bx-calendar'></i> ${c.duration}</span>
                        <span><i class='bx bx-rupee'></i> From ${c.basic}</span>
                    </div>
                </div>
                <div class="finder-result-actions">
                    <a class="btn btn-primary" href="join.html?course=${key}">Apply for this course <i class='bx bx-right-arrow-alt'></i></a>
                    <a class="btn btn-outline" href="${c.pdf}" target="_blank" rel="noopener"><i class='bx bxs-file-pdf'></i> View syllabus</a>
                </div>`;
            result.hidden = false;
            void result.offsetWidth; // restart the pop animation
            result.classList.add('pop');
        });
    }

    // 17. Application form: show the chosen course's duration, fees and syllabus
    const courseSelectEl = document.getElementById('course');
    const courseSummary = document.getElementById('courseSummary');
    if (courseSelectEl && courseSummary) {
        const updateSummary = () => {
            const c = COURSES[courseSelectEl.value];
            if (!c) {
                courseSummary.hidden = true;
                return;
            }
            courseSummary.innerHTML = `
                <div class="cs-row"><strong>${c.name}</strong>
                    <a href="${c.pdf}" target="_blank" rel="noopener"><i class='bx bxs-file-pdf'></i> Syllabus</a></div>
                <div class="cs-meta"><i class='bx bx-calendar'></i> ${c.duration}</div>
                <div class="cs-plans"><span>Basic <b>${c.basic}</b></span><span>Premium <b>${c.premium}</b></span></div>`;
            courseSummary.hidden = false;
        };
        courseSelectEl.addEventListener('change', updateSummary);
        updateSummary();
    }

    // 19. Live candlestick chart painted behind selected sections ([data-trading-bg="hero" | "section"])
    const PALETTES = {
        dark: {
            grid: 'rgba(255, 255, 255, 0.05)', up: '16, 185, 129', down: '239, 68, 68',
            ema: 'rgba(212, 175, 55, 0.95)', emaGlow: 'rgba(212, 175, 55, 0.6)', tagText: '#04130d'
        },
        light: {
            grid: 'rgba(15, 23, 42, 0.07)', up: '13, 147, 103', down: '220, 38, 38',
            ema: 'rgba(161, 131, 35, 0.95)', emaGlow: 'rgba(161, 131, 35, 0.35)', tagText: '#ffffff'
        }
    };
    document.querySelectorAll('[data-trading-bg]').forEach((host, hostIndex) => {
        const isHero = host.dataset.tradingBg === 'hero';
        const canvas = document.createElement('canvas');
        canvas.className = `trading-bg trading-bg--${isHero ? 'hero' : 'section'}`;
        canvas.setAttribute('aria-hidden', 'true');
        host.classList.add('has-trading-bg');
        host.prepend(canvas);
        const ctx = canvas.getContext('2d');

        const spacing = isHero ? 16 : 13;
        const bodyWidth = Math.round(spacing * 0.52);
        const candleMs = isHero ? 850 : 1100;
        const base = [23580, 51460, 24150, 81200, 22900][hostIndex % 5];
        let price = base;
        let trend = 0;
        let total = 0;
        const candles = [];
        const nextPrice = () => {
            // random walk with slowly changing trend and a pull back toward the base
            trend = (trend + (Math.random() - 0.5) * 0.35) * 0.96;
            price += (trend + (Math.random() - 0.5) * 1.6) * base * 0.00045 + (base - price) * 0.004;
            return price;
        };
        const addCandle = open => {
            candles.push({ o: open, h: open, l: open, c: open, v: 0.25 + Math.random() * 0.5 });
            total++;
            if (candles.length > 420) candles.splice(0, candles.length - 320);
        };
        const tick = candle => {
            const p = nextPrice();
            candle.c = p;
            candle.h = Math.max(candle.h, p);
            candle.l = Math.min(candle.l, p);
            candle.v = Math.min(1, candle.v + 0.02 + Math.random() * 0.03);
        };
        addCandle(price);
        for (let i = 0; i < 200; i++) {
            const candle = candles[candles.length - 1];
            for (let k = 0; k < 7; k++) tick(candle);
            addCandle(candle.c);
        }

        let width = 0, height = 0, lo = 0, hi = 0;
        let candleStart = performance.now(), lastTick = 0;
        const resize = () => {
            const rect = host.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = (now, animate) => {
            const current = candles[candles.length - 1];
            let progress = 0;
            if (animate) {
                if (now - lastTick > 80) {
                    lastTick = now;
                    tick(current);
                }
                progress = (now - candleStart) / candleMs;
                if (progress >= 1) {
                    addCandle(current.c);
                    candleStart = now;
                    progress = 0;
                }
            }
            const pal = PALETTES[document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'];
            const rightPad = isHero ? Math.min(110, width * 0.12) : spacing;
            const count = Math.ceil((width - rightPad) / spacing) + 2;
            const visible = candles.slice(-count);
            const offset = progress * spacing;
            const xAt = i => width - rightPad - (visible.length - 1 - i) * spacing - offset;

            let tHi = -Infinity, tLo = Infinity;
            visible.forEach(k => { tHi = Math.max(tHi, k.h); tLo = Math.min(tLo, k.l); });
            const pad = (tHi - tLo) * 0.18 || 1;
            tHi += pad;
            tLo -= pad;
            if (!hi || !animate) { hi = tHi; lo = tLo; } else { hi += (tHi - hi) * 0.05; lo += (tLo - lo) * 0.05; }
            // keep the price area in proportion on tall, narrow screens (phones) so candles don't stretch
            const plotH = Math.min(height * 0.68, Math.max(260, width * 0.75));
            const top = (height - plotH) * 0.4, bottom = top + plotH;
            const yAt = v => bottom - (v - lo) / (hi - lo) * (bottom - top);

            ctx.clearRect(0, 0, width, height);

            // grid: fixed horizontal lines, vertical lines that travel with the candles
            ctx.strokeStyle = pal.grid;
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let g = 1; g < 6; g++) {
                const gy = Math.round(height * g / 6) + 0.5;
                ctx.moveTo(0, gy);
                ctx.lineTo(width, gy);
            }
            visible.forEach((k, i) => {
                if ((total - visible.length + i) % 10 === 0) {
                    const gx = Math.round(xAt(i)) + 0.5;
                    ctx.moveTo(gx, 0);
                    ctx.lineTo(gx, height);
                }
            });
            ctx.stroke();

            // volume bars along the bottom
            const volMax = plotH * 0.18, volTop = bottom + plotH * 0.05;
            visible.forEach((k, i) => {
                const up = k.c >= k.o;
                ctx.fillStyle = `rgba(${up ? pal.up : pal.down}, 0.18)`;
                const vh = k.v * volMax;
                ctx.fillRect(xAt(i) - bodyWidth / 2, volTop + volMax - vh, bodyWidth, vh);
            });

            // candles
            visible.forEach((k, i) => {
                const up = k.c >= k.o;
                const x = Math.round(xAt(i)) + 0.5;
                const color = `rgba(${up ? pal.up : pal.down}, 0.9)`;
                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(x, yAt(k.h));
                ctx.lineTo(x, yAt(k.l));
                ctx.stroke();
                const yo = yAt(k.o), yc = yAt(k.c);
                ctx.fillRect(x - bodyWidth / 2, Math.min(yo, yc), bodyWidth, Math.max(Math.abs(yc - yo), 1.5));
            });

            // 9-period EMA with a soft glow
            const warm = candles.slice(-(count + 40));
            const alpha = 2 / (9 + 1);
            let ema = warm[0].c;
            const emaPts = [];
            warm.forEach((k, i) => {
                ema = k.c * alpha + ema * (1 - alpha);
                const vi = i - (warm.length - visible.length);
                if (vi >= 0) emaPts.push([xAt(vi), yAt(ema)]);
            });
            ctx.save();
            ctx.strokeStyle = pal.ema;
            ctx.lineWidth = 2;
            ctx.shadowColor = pal.emaGlow;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            emaPts.forEach(([ex, ey], i) => (i ? ctx.lineTo(ex, ey) : ctx.moveTo(ex, ey)));
            ctx.stroke();
            ctx.restore();

            // hero: live price line, pulsing dot and price tag
            if (isHero) {
                const up = current.c >= current.o;
                const rgb = up ? pal.up : pal.down;
                const py = yAt(current.c);
                const px = xAt(visible.length - 1);
                ctx.save();
                ctx.setLineDash([4, 5]);
                ctx.strokeStyle = `rgba(${rgb}, 0.6)`;
                ctx.beginPath();
                ctx.moveTo(0, Math.round(py) + 0.5);
                ctx.lineTo(width, Math.round(py) + 0.5);
                ctx.stroke();
                ctx.restore();
                const pulse = animate ? (now % 1600) / 1600 : 0;
                ctx.fillStyle = `rgba(${rgb}, ${0.35 * (1 - pulse)})`;
                ctx.beginPath();
                ctx.arc(px, py, 4 + pulse * 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = `rgb(${rgb})`;
                ctx.beginPath();
                ctx.arc(px, py, 3.5, 0, Math.PI * 2);
                ctx.fill();
                const label = current.c.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                ctx.font = '600 12px Inter, sans-serif';
                const tw = ctx.measureText(label).width + 16;
                const tx = Math.min(width - tw - 8, px + 14);
                ctx.fillStyle = `rgb(${rgb})`;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(tx, py - 11, tw, 22, 6); else ctx.rect(tx, py - 11, tw, 22);
                ctx.fill();
                ctx.fillStyle = pal.tagText;
                ctx.textBaseline = 'middle';
                ctx.fillText(label, tx + 8, py + 0.5);
            }
        };

        resize();
        draw(performance.now(), false);
        if (prefersReducedMotion) {
            // one still frame, redrawn when the size or theme changes
            new ResizeObserver(() => { resize(); draw(performance.now(), false); }).observe(host);
            document.addEventListener('themechange', () => draw(performance.now(), false));
            return;
        }
        new ResizeObserver(resize).observe(host);

        // animate only while the section is on screen and the tab is visible
        let onScreen = false, raf = 0;
        const loop = now => {
            if (!onScreen || document.hidden) {
                raf = 0;
                return;
            }
            draw(now, true);
            raf = requestAnimationFrame(loop);
        };
        const kick = () => {
            if (onScreen && !document.hidden && !raf) {
                candleStart = performance.now();
                raf = requestAnimationFrame(loop);
            }
        };
        new IntersectionObserver(entries => {
            onScreen = entries[0].isIntersecting;
            kick();
        }).observe(host);
        document.addEventListener('visibilitychange', kick);
    });
});
