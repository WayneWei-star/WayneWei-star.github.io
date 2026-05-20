/* ============================================================
   Personal Portfolio Website - Complete JavaScript
   Particles, Cursor, Ripple, Scroll, Theme, Modals & more
   ============================================================ */

(function () {
  'use strict';

  /* ========== DOM References ========== */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const body = document.body;
  const html = document.documentElement;
  const nav = $('.nav');
  const navLinks = $('.nav-links');
  const hamburger = $('.hamburger');
  const mobileOverlay = $('.mobile-overlay');
  const backToTop = $('.back-to-top');
  const scrollProgress = $('.scroll-progress');
  const themeToggle = $('.theme-toggle');
  const cursorDot = $('.cursor-dot');
  const cursorRing = $('.cursor-ring');
  const particleCanvas = $('#particleCanvas');
  const typedEl = $('#typed-text');
  const modalOverlay = $('.modal-overlay');
  const modalQrImg = $('#modal-qr-img');
  const modalTitle = $('.modal-title');
  const modalClose = $('.modal-close');
  const toast = $('.toast');
  const toastMsg = $('#toast-msg');
  const copyEmailBtn = $('#copy-email');
  const wechatBtn = $('#btn-wechat');
  const feishuBtn = $('#btn-feishu');

  /* ========== Theme Management ========== */
  const Theme = {
    init() {
      const saved = localStorage.getItem('theme');
      if (saved) {
        html.setAttribute('data-theme', saved);
      } else {
        // Default to dark mode for a more striking first impression
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    },

    toggle() {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      // Update particles color on theme change
      if (Particles.ctx) {
        Particles.updateColors();
      }
    },
  };

  /* ========== Particle System ========== */
  const Particles = {
    canvas: null,
    ctx: null,
    particles: [],
    mouse: { x: -1000, y: -1000 },
    count: 80,
    colors: {},

    init() {
      this.canvas = particleCanvas;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      this.updateColors();
      this.createParticles();
      this.bindEvents();
      this.animate();
    },

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    updateColors() {
      const style = getComputedStyle(html);
      this.colors.particle = style.getPropertyValue('--particle-color').trim();
      this.colors.line = style.getPropertyValue('--particle-line').trim();
    },

    createParticles() {
      this.particles = [];
      const count = window.innerWidth < 768 ? 40 : this.count;
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          size: Math.random() * 2.5 + 1,
        });
      }
    },

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.createParticles();
      });

      document.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      // Touch support
      document.addEventListener('touchmove', (e) => {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
      });
    },

    animate() {
      const { ctx, canvas, particles, mouse, colors } = this;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Mouse interaction - gentle attraction
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180 * 0.03;
          p.vx += dx * force * 0.01;
          p.vy += dy * force * 0.01;
        }

        // Dampen
        p.vx *= 0.999;
        p.vy *= 0.999;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.particle;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx2 = p.x - p2.x;
          const dy2 = p.y - p2.y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

          if (dist2 < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = colors.line;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(() => this.animate());
    },
  };

  /* ========== Custom Cursor ========== */
  const Cursor = {
    dot: null,
    ring: null,
    pos: { x: -100, y: -100 },
    ringPos: { x: -100, y: -100 },

    init() {
      // Skip on touch devices
      if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

      this.dot = cursorDot;
      this.ring = cursorRing;

      document.addEventListener('mousemove', (e) => {
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;
        this.dot.style.left = this.pos.x + 'px';
        this.dot.style.top = this.pos.y + 'px';
      });

      // Hover effect on interactive elements
      const hoverTargets = $$('a, button, .btn, .wheel-node, .contact-item, .social-link, .project-card, .theme-toggle, .hamburger, .badge');
      hoverTargets.forEach((el) => {
        el.addEventListener('mouseenter', () => this.ring.classList.add('hover'));
        el.addEventListener('mouseleave', () => this.ring.classList.remove('hover'));
      });

      this.animate();
    },

    animate() {
      if (!this.ring) return;

      // Smooth follow for ring
      this.ringPos.x += (this.pos.x - this.ringPos.x) * 0.2;
      this.ringPos.y += (this.pos.y - this.ringPos.y) * 0.2;
      this.ring.style.left = this.ringPos.x + 'px';
      this.ring.style.top = this.ringPos.y + 'px';

      requestAnimationFrame(() => this.animate());
    },
  };

  /* ========== Click Ripple ========== */
  const Ripple = {
    init() {
      document.addEventListener('click', (e) => {
        // Don't create ripples on interactive elements (they have their own effects)
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    },
  };

  /* ========== Scroll Handlers ========== */
  const Scroll = {
    init() {
      this.bindNavScroll();
      this.bindBackToTop();
      this.bindProgressBar();
      this.bindActiveNavLink();
      this.bindRevealAnimations();
    },

    bindNavScroll() {
      let lastScroll = 0;
      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
      });
    },

    bindBackToTop() {
      window.addEventListener('scroll', () => {
        if (window.pageYOffset > window.innerHeight) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      });

      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    },

    bindProgressBar() {
      window.addEventListener('scroll', () => {
        const scrollTop = html.scrollTop || body.scrollTop;
        const scrollHeight = html.scrollHeight - html.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        scrollProgress.style.width = progress + '%';
      });
    },

    bindActiveNavLink() {
      const sections = $$('section[id]');
      const navAs = $$('.nav-links a[href^="#"]');

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              navAs.forEach((a) => {
                a.classList.remove('active');
                if (a.getAttribute('href') === '#' + entry.target.id) {
                  a.classList.add('active');
                }
              });
            }
          });
        },
        { rootMargin: '-40% 0px -55% 0px' }
      );

      sections.forEach((section) => observer.observe(section));
    },

    bindRevealAnimations() {
      const revealEls = $$('.reveal');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );

      revealEls.forEach((el) => observer.observe(el));
    },
  };

  /* ========== Typed Text Effect ========== */
  const TypedText = {
    el: null,
    strings: ['小程序开发者', '网站开发者', 'AI 应用探索者', '热爱解决问题'],
    currentString: 0,
    currentChar: 0,
    isDeleting: false,
    typeSpeed: 100,
    deleteSpeed: 50,
    pauseEnd: 2000,
    pauseStart: 500,

    init() {
      this.el = typedEl;
      if (!this.el) return;
      setTimeout(() => this.tick(), 1000);
    },

    tick() {
      const full = this.strings[this.currentString];

      if (this.isDeleting) {
        this.currentChar--;
        this.el.textContent = full.substring(0, this.currentChar);
      } else {
        this.currentChar++;
        this.el.textContent = full.substring(0, this.currentChar);
      }

      let speed = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

      if (!this.isDeleting && this.currentChar === full.length) {
        speed = this.pauseEnd;
        this.isDeleting = true;
      } else if (this.isDeleting && this.currentChar === 0) {
        this.isDeleting = false;
        this.currentString = (this.currentString + 1) % this.strings.length;
        speed = this.pauseStart;
      }

      setTimeout(() => this.tick(), speed);
    },
  };

  /* ========== Skill Wheel Interaction ========== */
  const SkillWheel = {
    init() {
      const nodes = $$('.wheel-node');
      const hubInfo = $('#hubInfo');
      const hubName = $('.hub-skill-name');
      const hubLevel = $('.hub-skill-level');
      const hubStars = $('.hub-skill-stars');

      nodes.forEach((node) => {
        node.addEventListener('mouseenter', () => {
          if (node.classList.contains('placeholder-node')) return;
          const name = node.dataset.name;
          const level = node.dataset.level;
          const stars = node.dataset.stars;
          const icon = node.dataset.icon;

          hubName.textContent = icon + ' ' + name;
          hubLevel.textContent = level === '学习中' ? '🟡 学习中' : '熟练度 ' + level;
          hubStars.textContent = stars;
          hubInfo.classList.add('active');
        });

        node.addEventListener('mouseleave', () => {
          hubInfo.classList.remove('active');
        });

        // Touch: tap to toggle
        node.addEventListener('click', (e) => {
          if (node.classList.contains('placeholder-node')) return;
          const isActive = hubInfo.classList.contains('active');
          // On mobile, toggle the info
          if (window.innerWidth <= 768) {
            if (!isActive) {
              const name = node.dataset.name;
              const level = node.dataset.level;
              const stars = node.dataset.stars;
              const icon = node.dataset.icon;
              hubName.textContent = icon + ' ' + name;
              hubLevel.textContent = level === '学习中' ? '🟡 学习中' : '熟练度 ' + level;
              hubStars.textContent = stars;
              hubInfo.classList.add('active');
            } else {
              hubInfo.classList.remove('active');
            }
          }
        });
      });
    },
  };

  /* ========== Counter Animation ========== */
  const Counters = {
    init() {
      const counters = $$('.stat-number[data-target]');
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animate(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      counters.forEach((c) => observer.observe(c));
    },

    animate(el) {
      const target = parseInt(el.dataset.target);
      const duration = 1500;
      const start = performance.now();

      const tick = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target) + '+';
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
    },
  };

  /* ========== Card Tilt Effect ========== */
  const CardTilt = {
    init() {
      const cards = $$('.project-card');
      cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / centerY * -8;
          const rotateY = (x - centerX) / centerX * 8;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
      });
    },
  };

  /* ========== Smooth Scroll for Anchor Links ========== */
  const SmoothScroll = {
    init() {
      $$('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = anchor.getAttribute('href');
          if (targetId === '#') return;

          const target = $(targetId);
          if (target) {
            const navHeight = nav.offsetHeight + 20;
            const targetPos = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
            window.scrollTo({ top: targetPos, behavior: 'smooth' });

            // Close mobile menu if open
            if (navLinks.classList.contains('open')) {
              MobileMenu.close();
            }
          }
        });
      });
    },
  };

  /* ========== Mobile Menu ========== */
  const MobileMenu = {
    init() {
      hamburger.addEventListener('click', () => {
        if (navLinks.classList.contains('open')) {
          this.close();
        } else {
          this.open();
        }
      });

      mobileOverlay.addEventListener('click', () => this.close());

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
          this.close();
        }
      });
    },

    open() {
      navLinks.classList.add('open');
      hamburger.classList.add('active');
      mobileOverlay.classList.add('active');
      body.style.overflow = 'hidden';
    },

    close() {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      mobileOverlay.classList.remove('active');
      body.style.overflow = '';
    },
  };

  /* ========== Modal Management ========== */
  const Modals = {
    init() {
      // WeChat modal
      wechatBtn.addEventListener('click', () => {
        modalTitle.textContent = '微信添加好友';
        modalQrImg.src = 'photo/微信添加码.png';
        modalQrImg.alt = '微信添加码';
        modalOverlay.classList.add('active');
        body.style.overflow = 'hidden';
      });

      // Feishu modal
      feishuBtn.addEventListener('click', () => {
        modalTitle.textContent = '飞书添加好友';
        modalQrImg.src = 'photo/飞书外部添加码.png';
        modalQrImg.alt = '飞书外部添加码';
        modalOverlay.classList.add('active');
        body.style.overflow = 'hidden';
      });

      // Close modal
      modalClose.addEventListener('click', () => this.close());
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.close();
      });

      // ESC to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
          this.close();
        }
      });
    },

    close() {
      modalOverlay.classList.remove('active');
      body.style.overflow = '';
    },
  };

  /* ========== Email Copy ========== */
  const EmailCopy = {
    init() {
      copyEmailBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText('3405519221@qq.com');
          this.showToast('邮箱地址已复制到剪贴板！');
        } catch {
          // Fallback
          const textarea = document.createElement('textarea');
          textarea.value = '3405519221@qq.com';
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          this.showToast('邮箱地址已复制到剪贴板！');
        }
      });
    },

    showToast(msg) {
      toastMsg.textContent = msg;
      toast.classList.add('show');
      clearTimeout(this._timeout);
      this._timeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    },
  };

  /* ========== Page Load Animation ========== */
  const PageLoad = {
    init() {
      // Add a subtle entrance class to body after load
      window.addEventListener('load', () => {
        body.classList.add('loaded');
      });
    },
  };

  /* ========== Keyboard Shortcuts ========== */
  const Keyboard = {
    init() {
      document.addEventListener('keydown', (e) => {
        // 'T' to toggle theme
        if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
          const activeEl = document.activeElement;
          // Don't toggle when typing in inputs
          if (!activeEl || activeEl.tagName === 'BODY' || activeEl === body) {
            Theme.toggle();
          }
        }
      });
    },
  };

  /* ========== Initialize Everything ========== */
  function init() {
    Theme.init();
    Particles.init();
    Cursor.init();
    Ripple.init();
    Scroll.init();
    TypedText.init();
    SkillWheel.init();
    Counters.init();
    CardTilt.init();
    SmoothScroll.init();
    MobileMenu.init();
    Modals.init();
    EmailCopy.init();
    PageLoad.init();
    Keyboard.init();

    // Theme toggle button
    themeToggle.addEventListener('click', Theme.toggle);

    console.log('%c Wayne的个人网站 %c已就绪 ',
      'background:#4A90D9;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold;',
      'background:#F97316;color:#fff;padding:4px 8px;border-radius:0 4px 4px 0;');
    console.log('%c欢迎查看源码，有兴趣交流可通过邮箱 3405519221@qq.com 联系我~', 'color:#94a3b8;');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
