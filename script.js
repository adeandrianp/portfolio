document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Smooth scroll with navbar offset for all nav links
  --------------------------------------------------------- */
  const navbar = document.getElementById('navbar');
  const getNavOffset = () => navbar.getBoundingClientRect().height + 24;

  document.querySelectorAll('[data-nav-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;
      e.preventDefault();

      const top = targetId === 'hero'
        ? 0
        : targetEl.getBoundingClientRect().top + window.scrollY - getNavOffset();

      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      closeMobileMenu();
    });
  });

  /* ---------------------------------------------------------
     Mobile menu
  --------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function openMobileMenu(){
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('show');
    mobileOverlay.classList.add('show');
  }
  function closeMobileMenu(){
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('show');
    mobileOverlay.classList.remove('show');
  }
  navToggle.addEventListener('click', () => {
    mobileMenu.classList.contains('show') ? closeMobileMenu() : openMobileMenu();
  });
  mobileOverlay.addEventListener('click', closeMobileMenu);

  /* ---------------------------------------------------------
     Active section tracking + animated underline
  --------------------------------------------------------- */
  const sections = ['hero','about','stacks','journey','projects','certification','contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const desktopLinks = Array.from(document.querySelectorAll('.nav-links a[data-nav-link]'));
  const mobileLinks = Array.from(document.querySelectorAll('.mobile-menu a[data-nav-link]'));
  const navLinksContainer = document.getElementById('navLinks');
  const underline = document.getElementById('navUnderline');

  let currentActive = 'hero';

  function moveUnderlineTo(id){
    const link = desktopLinks.find(a => a.getAttribute('data-target') === id);

    if (!link) {
      // e.g. hero section: retract underline to the left and hide
      underline.style.opacity = '0';
      underline.style.width = '0px';
      underline.style.transform = 'translateX(0px)';
      return;
    }

    const linkRect = link.getBoundingClientRect();
    const containerRect = navLinksContainer.getBoundingClientRect();
    const x = linkRect.left - containerRect.left;
    const width = linkRect.width;

    underline.style.opacity = '1';
    underline.style.width = width + 'px';
    underline.style.transform = `translateX(${x}px)`;
  }

  function setActive(id){
    currentActive = id;
    [...desktopLinks, ...mobileLinks].forEach(a => {
      a.classList.toggle('active', a.getAttribute('data-target') === id);
    });
    moveUnderlineTo(id);
  }

  // Observe sections to know which is active while scrolling
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        setActive(entry.target.id);
      }
    });
  }, {
    rootMargin: `-${72}px 0px -60% 0px`,
    threshold: 0.1
  });
  sections.forEach(sec => sectionObserver.observe(sec));

  // Keep underline aligned on resize
  window.addEventListener('resize', () => moveUnderlineTo(currentActive));

  // Initial state
  setActive('hero');

  /* ---------------------------------------------------------
     Navbar stays fully solid and opaque
  --------------------------------------------------------- */
  const navbarInner = document.querySelector('.navbar-inner');
  if (navbarInner) {
    navbarInner.style.background = '#070A0F';
  }

  /* ---------------------------------------------------------
     Scroll reveal (fade-up / fade-left / fade-right) with stagger
  --------------------------------------------------------- */
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));

  // stagger cards that share the same parent grid/group
  const staggerGroups = new Map();
  revealEls.forEach(el => {
    const parent = el.parentElement;
    if (!staggerGroups.has(parent)) staggerGroups.set(parent, []);
    staggerGroups.get(parent).push(el);
  });
  staggerGroups.forEach(group => {
    group.forEach((el, i) => {
      el.style.setProperty('--reveal-delay', reduceMotion ? '0s' : `${Math.min(i * 90, 360)}ms`);
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
      } else {
        // replay animation when scrolling back up past the element
        entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------------
     Journey timeline progressive fill
  --------------------------------------------------------- */
  const timeline = document.querySelector('.timeline');
  const timelineFill = document.getElementById('timelineFill');

  function updateTimelineFill(){
    if (!timeline || !timelineFill) return;
    const rect = timeline.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const progress = Math.min(Math.max((viewportH * 0.75 - rect.top) / rect.height, 0), 1);
    timelineFill.style.height = (progress * 100) + '%';
  }
  window.addEventListener('scroll', updateTimelineFill, { passive: true });
  window.addEventListener('resize', updateTimelineFill);
  updateTimelineFill();

  /* ---------------------------------------------------------
     Project card expand / collapse
  --------------------------------------------------------- */
  document.querySelectorAll('[data-project-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      const body = card.querySelector('[data-project-body]');
      const expanded = btn.getAttribute('aria-expanded') === 'true';

      btn.setAttribute('aria-expanded', String(!expanded));
      body.classList.toggle('open', !expanded);
      btn.querySelector('span').textContent = expanded ? 'More' : 'Less';

      if (!expanded){
        setTimeout(() => {
          const top = card.getBoundingClientRect().top + window.scrollY - getNavOffset() - 12;
          if (card.getBoundingClientRect().top < 80) {
            window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
          }
        }, 200);
      }
    });
  });

  /* ---------------------------------------------------------
     Scroll cue on hero scrolls to About
  --------------------------------------------------------- */
  const scrollCue = document.getElementById('scrollCue');
  if (scrollCue){
    scrollCue.addEventListener('click', () => {
      const about = document.getElementById('about');
      const top = about.getBoundingClientRect().top + window.scrollY - getNavOffset();
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     Certification modal
  --------------------------------------------------------- */
  const certModal = document.getElementById('certModal');
  const certModalImage = document.getElementById('certModalImage');
  const certTriggers = document.querySelectorAll('[data-cert-modal-trigger]');

  function closeCertModal(){
    certModal.classList.remove('is-open');
    certModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    certModalImage.removeAttribute('src');
  }

  certTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const imageSrc = btn.getAttribute('data-cert-image');
      certModalImage.src = imageSrc;
      certModal.classList.add('is-open');
      certModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
    });
  });

  document.querySelectorAll('[data-cert-modal-close]').forEach(el => {
    el.addEventListener('click', closeCertModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCertModal();
  });

  /* ---------------------------------------------------------
     Uptime counter — small thematic detail (ticks gently)
  --------------------------------------------------------- */
  const uptimeEl = document.getElementById('uptimeCounter');
  if (uptimeEl && !reduceMotion){
    let value = 99.98;
    setInterval(() => {
      value = 99.90 + Math.random() * 0.09;
      uptimeEl.textContent = value.toFixed(2) + '%';
    }, 4000);
  }

});
