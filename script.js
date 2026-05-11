/**
 * ═══════════════════════════════════════════════════════════════════════
 * PORTFOLIO — Two-Phase Cinematic Hero Controller
 * Phase 1: Video intro plays → freezes on last frame
 * Phase 2: Atmosphere layers activate (clouds, glow, rays, particles)
 *          Text overlay fades in after 1s delay
 * ═══════════════════════════════════════════════════════════════════════
 */

document.addEventListener("DOMContentLoaded", () => {
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

    // ─── Scroll Reveal (IntersectionObserver) ───
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll(".gsap-project, .gsap-reveal").forEach(el => {
        revealObserver.observe(el);
    });

    // ─── Scroll Lock During Video ───
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
    }

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 1 — Video Playback
    // ═══════════════════════════════════════════════════════════════════

    function hideLoading() {
        if (loadingFallback) {
            loadingFallback.style.opacity = "0";
            setTimeout(() => {
                loadingFallback.style.display = "none";
            }, 800);
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

    // Start as soon as some data is available, don't wait for 'canplaythrough'
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

    // When video ends, hide it and start Phase 2 (cloud loop)
    video.addEventListener("ended", triggerPhase2);

    // Reveal text and scroll indicator at 4 seconds into the first video
    let uiRevealed = false;
    video.addEventListener("timeupdate", () => {
        if (!uiRevealed && video.currentTime >= 4) {
            uiRevealed = true;
            overlayContent.classList.add("visible");
            
            // Proactively start loading Phase 2 video now to avoid lag at 8s
            cloudVideo.load(); 

            setTimeout(() => {
                scrollIndicator.classList.add("active");
            }, 1500);
        }
    });

    // ═══════════════════════════════════════════════════════════════════
    // PHASE 2 — Crossfade to Infinite Cloud Loop Video
    // ═══════════════════════════════════════════════════════════════════

    function triggerPhase2() {
        if (phase2Started) return;
        phase2Started = true;

        // Switch videos instantly
        cloudVideo.play().catch(() => {
            console.warn("Cloud video autoplay blocked");
        });
        cloudVideo.style.opacity = "1";
        video.style.display = "none";

        // Activate atmosphere overlays (neon pulse, god rays)
        atmosphere.classList.remove("atmosphere-hidden");
        atmosphere.classList.add("atmosphere-active");

        // Start particle system
        particlesCanvas.classList.add("active");
        initParticles();

        // Unlock scroll immediately — user can scroll during the loop
        unlockScroll();

        // Ensure UI is visible if video ended before 4s (unlikely but safe)
        if (!uiRevealed) {
            uiRevealed = true;
            overlayContent.classList.add("visible");
            scrollIndicator.classList.add("active");
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // PARTICLE SYSTEM — Floating Dust & Light Specs
    // ═══════════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════════
    // HERO FADE-OUT ON SCROLL
    // ═══════════════════════════════════════════════════════════════════

    const hero = document.getElementById("hero");

    window.addEventListener("scroll", () => {
        if (!phase2Started) return;

        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;
        const progress = Math.min(1, scrollY / (heroHeight * 0.6));

        // Fade out hero content as user scrolls
        hero.style.opacity = 1 - progress;

        // Parallax: atmosphere moves slightly upward
        if (atmosphere) {
            atmosphere.style.transform = `translateY(${-scrollY * 0.15}px)`;
        }
    }, { passive: true });

    // ─── CTA Smooth Scroll ───
    if (ctaBtn) {
        ctaBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.getElementById("about");
            if (target) {
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    }
});
