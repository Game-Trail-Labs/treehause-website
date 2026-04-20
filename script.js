/* ================================================================
   TreeHaus Woodworking — Script
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Init Lucide icons ──
  if (window.lucide) lucide.createIcons();

  // ── Page Loader ──
  const loader = document.getElementById('pageLoader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader?.classList.add('hidden');
      // Trigger hero animations after loader fades
      animateHero();
    }, 800);
  });

  // ── Hero staggered animation ──
  function animateHero() {
    if (!window.gsap) return;
    document.querySelectorAll('.hero-animate').forEach(el => {
      const delay = parseFloat(el.dataset.heroDelay) || 0;
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, delay,
        ease: 'power3.out'
      });
    });
  }

  // ── Cursor Glow (desktop only) ──
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', e => {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
      cursorGlow.classList.add('visible');
    });
    document.addEventListener('mouseleave', () => cursorGlow.classList.remove('visible'));
  }

  // ── Back to Top ──
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 600);
  });
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Lightbox ──
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox?.querySelector('.lightbox-img');
  const lightboxClose = lightbox?.querySelector('.lightbox-close');

  document.querySelectorAll('[data-lightbox]').forEach(item => {
    item.addEventListener('click', () => {
      // Copy the placeholder styling for now (later: real images)
      const src = item.querySelector('.placeholder-img');
      if (src && lightboxImg) {
        lightboxImg.style.background = getComputedStyle(src).background;
      }
      lightbox?.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  function closeLightbox() {
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ── Mobile Nav ──
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  navLinks.querySelectorAll('a').forEach(link =>
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('active');
    })
  );

  // ── Navbar scroll effect ──
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ── GSAP Scroll Animations ──
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-animate]').forEach(el => {
      const delay = parseFloat(el.dataset.delay) || 0;
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.9, delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
      );
    });

    // Parallax hero background
    gsap.to('.hero-bg', {
      yPercent: 25,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // Counter animation
    document.querySelectorAll('.stat-num[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count);
      gsap.to(el, {
        textContent: target,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
  }

  // ── Product Filters ──
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      productCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.removeAttribute('data-hidden');
          card.style.display = '';
        } else {
          card.setAttribute('data-hidden', 'true');
          card.style.display = 'none';
        }
      });
    });
  });

  // ── FAQ Accordion ──
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ── Board Builder ──
  const BASE_PRICE = 100;
  const builderState = {
    type: 'cutting', wood: 'walnut', size: 'medium',
    grain: 'edge', engraving: 'none', groove: 'no'
  };
  const optionPrices = {};

  const woodColors = {
    walnut: { bg: '#4a3728', surface: 'linear-gradient(135deg, #4a3728 0%, #6b5240 50%, #3d2c1e 100%)' },
    maple:  { bg: '#d4b896', surface: 'linear-gradient(135deg, #d4b896 0%, #c8a87a 50%, #e0c9a8 100%)' },
    cherry: { bg: '#8b4513', surface: 'linear-gradient(135deg, #8b4513 0%, #a0522d 50%, #723a10 100%)' },
    padauk: { bg: '#9b2d2d', surface: 'linear-gradient(135deg, #9b2d2d 0%, #b33a3a 50%, #7a2020 100%)' },
  };

  const sizeMap = {
    small:  { w: 140, h: 110, label: '10×8"' },
    medium: { w: 190, h: 140, label: '14×10"' },
    large:  { w: 240, h: 165, label: '18×12"' },
    xl:     { w: 300, h: 200, label: '24×16"' },
  };

  // Init pills
  document.querySelectorAll('.option-pills').forEach(group => {
    const optionName = group.dataset.option;
    group.querySelectorAll('.pill').forEach(pill => {
      // Set initial prices from active pills
      if (pill.classList.contains('active')) {
        optionPrices[optionName] = parseFloat(pill.dataset.price) || 0;
      }
      pill.addEventListener('click', () => {
        group.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        builderState[optionName] = pill.dataset.value;
        optionPrices[optionName] = parseFloat(pill.dataset.price) || 0;

        // Show/hide engraving input
        if (optionName === 'engraving') {
          const engGroup = document.getElementById('engravingGroup');
          engGroup.style.display = (pill.dataset.value !== 'none') ? 'block' : 'none';
        }

        updateBuilderPreview();
      });
    });
  });

  function updateBuilderPreview() {
    const total = BASE_PRICE + Object.values(optionPrices).reduce((a, b) => a + b, 0);

    // Update price display
    document.getElementById('builderPrice').textContent = `$${total}`;

    // Update Snipcart button
    const cartBtn = document.getElementById('builderAddToCart');
    const engText = document.getElementById('engravingText')?.value || '';
    const desc = `${builderState.type} — ${builderState.wood}, ${sizeMap[builderState.size].label}, ${builderState.grain}-grain` +
      (builderState.engraving !== 'none' ? `, engraving: "${engText || builderState.engraving}"` : '') +
      (builderState.groove === 'yes' ? ', juice groove' : '');

    cartBtn.dataset.itemPrice = total.toFixed(2);
    cartBtn.dataset.itemDescription = desc;
    cartBtn.dataset.itemName = `Custom ${builderState.type === 'cutting' ? 'Cutting' : 'Charcuterie'} Board`;

    // Update specs list
    const specs = document.getElementById('previewSpecs');
    specs.innerHTML = `
      <li><span>Type</span><span>${builderState.type === 'cutting' ? 'Cutting Board' : 'Charcuterie Board'}</span></li>
      <li><span>Wood</span><span>${builderState.wood.charAt(0).toUpperCase() + builderState.wood.slice(1)}</span></li>
      <li><span>Size</span><span>${sizeMap[builderState.size].label}</span></li>
      <li><span>Grain</span><span>${builderState.grain === 'edge' ? 'Edge Grain' : 'End Grain'}</span></li>
      ${builderState.engraving !== 'none' ? `<li><span>Engraving</span><span>${builderState.engraving === 'initials' ? 'Initials' : 'Custom Text'}</span></li>` : ''}
      ${builderState.groove === 'yes' ? '<li><span>Juice Groove</span><span>Yes</span></li>' : ''}
    `;

    // Update board visual
    const surface = document.getElementById('boardSurface');
    const size = sizeMap[builderState.size];
    const wood = woodColors[builderState.wood];

    surface.style.width = size.w + 'px';
    surface.style.height = size.h + 'px';
    surface.style.background = wood.surface;
    surface.style.borderRadius = builderState.type === 'charcuterie' ? '20px 20px 8px 8px' : '8px';

    // Grain pattern overlay
    if (builderState.grain === 'end') {
      surface.style.backgroundImage = wood.surface + `, repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, transparent 0% 50%)`;
      surface.style.backgroundSize = '100% 100%, 20px 20px';
    }

    // Juice groove
    if (builderState.groove === 'yes') {
      surface.style.boxShadow = `inset 0 0 0 12px rgba(0,0,0,0.15), 0 8px 32px rgba(0,0,0,0.4)`;
    } else {
      surface.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4)`;
    }
  }

  // Engraving text updates
  const engInput = document.getElementById('engravingText');
  if (engInput) engInput.addEventListener('input', updateBuilderPreview);

  // Initial render
  updateBuilderPreview();

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
