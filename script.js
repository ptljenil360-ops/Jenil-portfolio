/**
 * ═══════════════════════════════════════════════════════════════════════
 * PORTFOLIO — GSAP-Powered Cinematic Controller
 *
 * Features:
 *  • Two-Phase Cinematic Hero (video intro → cloud loop)
 *  • GSAP ScrollTrigger for section reveal animations
 *  • Custom Cursor: Dual-ring (dot + outer ring + trailing glow)
 *    — Auto-hides on screens ≤768px
 *  • Magnetic CTA buttons (follow mouse within button bounds)
 *  • Parallax hero fade on scroll
 * ═══════════════════════════════════════════════════════════════════════
 */

document.addEventListener("DOMContentLoaded", () => {

    // ─── Register GSAP Plugins ───
    gsap.registerPlugin(ScrollTrigger);

    // ─── DOM References ───
    const video = document.getElementById("hero-video");
    const cloudVideo = document.getElementById("cloud-video");
    const atmosphere = document.getElementById("hero-atmosphere");
    const particlesCanvas = document.getElementById("particles-canvas");
    const overlayContent = document.getElementById("overlay-content");
    const scrollIndicator = document.getElementById("scroll-indicator");
    const loadingFallback = document.getElementById("loading-fallback");
    const ctaBtn = document.getElementById("cta-btn");
    const body = document.body;

    // ─── State Tracking ───
    let phase2Started = false;
    let scrollUnlocked = false;

    // ═══════════════════════════════════════════════════════════════════════
    // CUSTOM CURSOR — Dual-ring with trailing glow
    // Auto-hides on mobile (≤768px) via CSS; JS skips init on touch devices
    // ═══════════════════════════════════════════════════════════════════════

    const cursorDot = document.getElementById("cursor-dot");
    const cursorRing = document.getElementById("cursor-ring");
    const cursorTrail = document.getElementById("cursor-trail");

    const isMobile = window.matchMedia("(max-width: 768px)").matches ||
                     "ontouchstart" in window;

    if (!isMobile && cursorDot && cursorRing && cursorTrail) {
        const mouse = { x: 0, y: 0 };
        const ringPos = { x: 0, y: 0 };
        const trailPos = { x: 0, y: 0 };

        // Start hidden until first mouse move
        cursorDot.classList.add("cursor-hidden");
        cursorRing.classList.add("cursor-hidden");
        cursorTrail.classList.add("cursor-hidden");

        let hasMoved = false;

        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            // Show cursor on first move
            if (!hasMoved) {
                hasMoved = true;
                cursorDot.classList.remove("cursor-hidden");
                cursorRing.classList.remove("cursor-hidden");
                cursorTrail.classList.remove("cursor-hidden");
            }
        });

        // GSAP tick for smooth cursor interpolation
        gsap.ticker.add(() => {
            // Dot follows instantly
            gsap.set(cursorDot, { x: mouse.x, y: mouse.y });

            // Ring follows with lerp (easing delay)
            ringPos.x += (mouse.x - ringPos.x) * 0.15;
            ringPos.y += (mouse.y - ringPos.y) * 0.15;
            gsap.set(cursorRing, { x: ringPos.x, y: ringPos.y });

            // Trail follows even slower
            trailPos.x += (mouse.x - trailPos.x) * 0.08;
            trailPos.y += (mouse.y - trailPos.y) * 0.08;
            gsap.set(cursorTrail, { x: trailPos.x, y: trailPos.y });
        });

        // Hover state — enlarge cursor on interactive elements
        const hoverTargets = document.querySelectorAll(
            "a, button, .cta, .project-btn, .social-icon, .skill-tag, .stat, .contact-btn"
        );

        hoverTargets.forEach((el) => {
            el.addEventListener("mouseenter", () => {
                cursorDot.classList.add("cursor-hover");
                cursorRing.classList.add("cursor-hover");
            });
            el.addEventListener("mouseleave", () => {
                cursorDot.classList.remove("cursor-hover");
                cursorRing.classList.remove("cursor-hover");
            });
        });
    }

    // ─── Ripple Effect on Click ───
    window.addEventListener("mousedown", (e) => {
        const ripple = document.createElement("div");
        ripple.className = "click-ripple";
        document.body.appendChild(ripple);

        gsap.set(ripple, { 
            x: e.clientX, 
            y: e.clientY, 
            opacity: 1,
            scale: 1,
            borderColor: Math.random() > 0.5 ? "var(--primary)" : "var(--secondary)"
        });

        gsap.to(ripple, {
            scale: 60,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
            onComplete: () => ripple.remove()
        });
    });

    // ═══════════════════════════════════════════════════════════════════════
    // MAGNETIC CTA BUTTONS — Button content follows mouse within bounds
    // ═══════════════════════════════════════════════════════════════════════

    const magneticButtons = document.querySelectorAll(".cta, .project-btn, .contact-btn");

    magneticButtons.forEach((btn) => {
        const strength = 0.35; // How far button content follows (0–1)

        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * strength,
                y: y * strength,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════════════
    // GSAP SCROLL ANIMATIONS — Section reveals, staggered entrances
    // ═══════════════════════════════════════════════════════════════════════

    // Section headers — slide in from left with glitch stagger
    gsap.utils.toArray(".gsap-reveal").forEach((el) => {
        gsap.fromTo(el, {
            opacity: 0,
            x: -60,
            filter: "blur(8px)"
        }, {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none none"
            }
        });
    });

    // Project cards — stagger up from below
    gsap.utils.toArray(".gsap-project").forEach((card, i) => {
        gsap.fromTo(card, {
            opacity: 0,
            y: 80,
            scale: 0.95,
            rotateX: 5
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.9,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                start: "top 88%",
                toggleActions: "play none none none"
            }
        });
    });

    // Stats — count-up and scale pop
    gsap.utils.toArray(".stat").forEach((stat, i) => {
        gsap.fromTo(stat, {
            opacity: 0,
            y: 40,
            scale: 0.85
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            delay: i * 0.2,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: stat,
                start: "top 88%",
                toggleActions: "play none none none"
            }
        });
    });

    // Skill tags — staggered pop-in
    gsap.utils.toArray(".skill-tag").forEach((tag, i) => {
        gsap.fromTo(tag, {
            opacity: 0,
            y: 20,
            scale: 0.8
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            delay: i * 0.08,
            ease: "back.out(2)",
            scrollTrigger: {
                trigger: tag,
                start: "top 90%",
                toggleActions: "play none none none"
            }
        });
    });

    // Social icons — stagger fade + lift
    gsap.utils.toArray(".social-icon").forEach((icon, i) => {
        gsap.fromTo(icon, {
            opacity: 0,
            y: 30,
            scale: 0.9
        }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: i * 0.12,
            ease: "power2.out",
            scrollTrigger: {
                trigger: icon,
                start: "top 92%",
                toggleActions: "play none none none"
            }
        });
    });

    // ═══════════════════════════════════════════════════════════════════════
    // HERO PARALLAX FADE — GSAP-driven smooth fade on scroll
    // ═══════════════════════════════════════════════════════════════════════

    const hero = document.getElementById("hero");

    ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
            if (!phase2Started) return;
            const progress = self.progress;

            // Fade out hero
            gsap.set(hero, { opacity: 1 - progress });

            // Parallax: atmosphere moves slightly upward
            if (atmosphere) {
                gsap.set(atmosphere, {
                    y: -progress * window.innerHeight * 0.15
                });
            }
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // SCROLL LOCK DURING VIDEO
    // ═══════════════════════════════════════════════════════════════════════

    body.style.overflow = "hidden";
    const preventScroll = (e) => e.preventDefault();
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    function unlockScroll() {
        if (scrollUnlocked) return;
        scrollUnlocked = true;
        body.style.overflow = "";
        window.removeEventListener("wheel", preventScroll);
        window.removeEventListener("touchmove", preventScroll);

        // Refresh ScrollTrigger positions after unlock
        ScrollTrigger.refresh();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 1 — Video Playback
    // ═══════════════════════════════════════════════════════════════════════

    function hideLoading() {
        if (loadingFallback) {
            gsap.to(loadingFallback, {
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => {
                    loadingFallback.style.display = "none";
                }
            });
        }
    }

    function startVideo() {
        video.play().then(() => {
            hideLoading();
        }).catch(() => {
            console.warn("Autoplay blocked");
            hideLoading();
            triggerPhase2();
        });
    }

    // Start as soon as some data is available
    if (video.readyState >= 2) {
        startVideo();
    } else {
        video.addEventListener("canplay", startVideo, { once: true });
    }

    // Show loader again if video buffers
    video.addEventListener("waiting", () => {
        if (!phase2Started && loadingFallback) {
            loadingFallback.style.display = "flex";
            loadingFallback.style.opacity = "1";
        }
    });

    video.addEventListener("playing", hideLoading);

    // Safety timeout
    setTimeout(() => {
        if (!phase2Started) {
            hideLoading();
            triggerPhase2();
        }
    }, 15000);

    // When video ends, start Phase 2
    video.addEventListener("ended", triggerPhase2);

    // Reveal text and scroll indicator at 4 seconds into the first video
    let uiRevealed = false;
    video.addEventListener("timeupdate", () => {
        if (!uiRevealed && video.currentTime >= 4) {
            uiRevealed = true;

            // GSAP cinematic text entrance
            gsap.to(overlayContent, {
                opacity: 1,
                duration: 1.8,
                ease: "power2.out",
                onStart: () => {
                    overlayContent.classList.add("visible");
                }
            });

            // Proactively load Phase 2 video
            cloudVideo.load();

            setTimeout(() => {
                scrollIndicator.classList.add("active");
            }, 1500);
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PHASE 2 — Crossfade to Infinite Cloud Loop Video
    // ═══════════════════════════════════════════════════════════════════════

    function triggerPhase2() {
        if (phase2Started) return;
        phase2Started = true;

        // Switch videos
        cloudVideo.play().catch(() => {
            console.warn("Cloud video autoplay blocked");
        });

        gsap.to(cloudVideo, { opacity: 1, duration: 1.5, ease: "power2.inOut" });
        video.style.display = "none";

        // Activate atmosphere overlays
        atmosphere.classList.remove("atmosphere-hidden");
        atmosphere.classList.add("atmosphere-active");

        // Start particle system
        particlesCanvas.classList.add("active");
        initParticles();

        // Unlock scroll
        unlockScroll();

        // Ensure UI is visible
        if (!uiRevealed) {
            uiRevealed = true;
            overlayContent.classList.add("visible");
            scrollIndicator.classList.add("active");
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PARTICLE SYSTEM — Floating Dust & Light Specs
    // ═══════════════════════════════════════════════════════════════════════

    function initParticles() {
        const ctx = particlesCanvas.getContext("2d");
        let width, height;
        const particles = [];
        const PARTICLE_COUNT = 60;

        function resize() {
            width = particlesCanvas.width = window.innerWidth;
            height = particlesCanvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener("resize", resize);

        // Create particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.5 + 0.3,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.15 - 0.05,
                opacity: Math.random() * 0.5 + 0.1,
                // Subtle color variation — mostly cyan, some purple
                hue: Math.random() > 0.7 ? 280 : 185 + Math.random() * 10,
                pulseSpeed: Math.random() * 0.02 + 0.005,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }

        let time = 0;

        function animate() {
            ctx.clearRect(0, 0, width, height);
            time += 1;

            for (const p of particles) {
                // Movement
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10;
                if (p.y > height + 10) p.y = -10;

                // Pulsing opacity
                const pulseOpacity = p.opacity + Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.15;
                const finalOpacity = Math.max(0.05, Math.min(0.7, pulseOpacity));

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${finalOpacity})`;
                ctx.fill();

                // Subtle glow effect for larger particles
                if (p.radius > 1) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${finalOpacity * 0.15})`;
                    ctx.fill();
                }
            }

            requestAnimationFrame(animate);
        }

        animate();
    }

    // ─── CTA Smooth Scroll ───
    if (ctaBtn) {
        ctaBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.getElementById("about");
            if (target) {
                gsap.to(window, {
                    scrollTo: { y: target, offsetY: 0 },
                    duration: 1.2,
                    ease: "power3.inOut"
                });
            }
        });
    }
});
