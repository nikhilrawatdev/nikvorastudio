/* ==========================================================================
   NikvoraStudio - Custom Interactive Core Engine (Security Hardened)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initHeaderScroll();
  initMobileMenu();
  initGlassSpotlight();
  initScrollReveal();
  initProcessTimeline();
  initFaqAccordion();
  initSmoothScrollLinks();
  initHeroAnimations();
});

/* --- 1. Custom Pointer Cursor --- */
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  const glow = document.getElementById('customCursorGlow');
  
  if (!cursor || !glow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let glowX = mouseX;
  let glowY = mouseY;

  // Track actual mouse coordinates
  window.addEventListener('mousemove', (e) => {
    // Validate coordinates to prevent injection
    mouseX = Math.max(0, Math.min(e.clientX, window.innerWidth));
    mouseY = Math.max(0, Math.min(e.clientY, window.innerHeight));
  });

  // Animation loop with lag/inertia
  function renderCursor() {
    // Inner dot (very fast responsive follow)
    cursorX += (mouseX - cursorX) * 0.3;
    cursorY += (mouseY - cursorY) * 0.3;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    // Outer glow (slower inertia follow)
    glowX += (mouseX - glowX) * 0.15;
    glowY += (mouseY - glowY) * 0.15;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;

    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Highlight effect on clickable tags
  const clickables = document.querySelectorAll('a, button, .faq-trigger, .glass-card, [data-spotlight]');
  
  clickables.forEach(item => {
    item.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering-clickable');
    });
    item.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovering-clickable');
    });
  });
}

/* --- 2. Floating Header Scroll Transition --- */
function initHeaderScroll() {
  const header = document.getElementById('mainHeader');
  const scrollProgress = document.getElementById('scrollProgressBar');
  
  if (!header) return;

  window.addEventListener('scroll', () => {
    // Toggle header styling
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Update top scroll progress bar indicator
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (totalScroll > 0 && scrollProgress) {
      const percentage = (window.scrollY / totalScroll) * 100;
      // Clamp percentage to valid range
      const clampedPercentage = Math.max(0, Math.min(100, percentage));
      scrollProgress.style.width = `${clampedPercentage}%`;
    }
  });
}

/* --- 3. Mobile Navigation Menu Toggle --- */
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('navMenu');
  const links = document.querySelectorAll('.nav-link');

  if (!toggle || !menu) return;

  function toggleMenu() {
    menu.classList.toggle('open');
    document.body.classList.toggle('mobile-menu-open');
  }

  toggle.addEventListener('click', toggleMenu);

  // Close menu when clicking links
  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      document.body.classList.remove('mobile-menu-open');
    });
  });
}

/* --- 4. Interactive Glass Cards Spotlight Follower --- */
function initGlassSpotlight() {
  const cards = document.querySelectorAll('[data-spotlight]');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      // Validate and clamp coordinates
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* --- 5. Scroll Reveal Intersection Observer --- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without IntersectionObserver
    revealElements.forEach(el => {
      el.classList.add('reveal-visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px' // Trigger slightly before crossing
  });

  revealElements.forEach(el => observer.observe(el));
}

/* --- 6. Process Road Map Scroll Timeline Progress --- */
function initProcessTimeline() {
  const timeline = document.querySelector('.process-timeline-container');
  const steps = document.querySelectorAll('.timeline-step');
  const progressLine = document.getElementById('timelineProgress');

  if (!timeline || !progressLine) return;

  window.addEventListener('scroll', () => {
    const timelineRect = timeline.getBoundingClientRect();
    const triggerLine = window.innerHeight * 0.6; // Scroll threshold line
    
    // Check if timeline is in viewport
    if (timelineRect.top < triggerLine) {
      const timelineHeight = timelineRect.height;
      const scrolledDown = triggerLine - timelineRect.top;
      
      // Calculate scroll progress percentage (capped 0-100)
      let percent = (scrolledDown / timelineHeight) * 100;
      percent = Math.min(Math.max(percent, 0), 100);
      progressLine.style.height = `${percent}%`;

      // Activate corresponding steps as the line reaches them
      steps.forEach((step) => {
        const stepRect = step.getBoundingClientRect();
        if (stepRect.top < triggerLine) {
          step.classList.add('active-step');
        } else {
          step.classList.remove('active-step');
        }
      });
    } else {
      progressLine.style.height = '0%';
      steps.forEach(step => step.classList.remove('active-step'));
    }
  });
}

/* --- 7. FAQ Expandable Accordion Panels --- */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.faq-trigger');

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      const content = item ? item.querySelector('.faq-content') : null;
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close other open accordion items
      document.querySelectorAll('.faq-item.active').forEach(activeItem => {
        if (activeItem !== item) {
          activeItem.classList.remove('active');
          const activeTrigger = activeItem.querySelector('.faq-trigger');
          const activeContent = activeItem.querySelector('.faq-content');
          if (activeTrigger) activeTrigger.setAttribute('aria-expanded', 'false');
          if (activeContent) activeContent.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (item && content) {
        if (isExpanded) {
          item.classList.remove('active');
          trigger.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = null;
        } else {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
          // Set dynamic max-height based on scroll height
          content.style.maxHeight = `${content.scrollHeight}px`;
        }
      }
    });
  });
}

/* --- 8. Smooth Scrolling Anchor Links Helper (Secure) --- */
function initSmoothScrollLinks() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      
      // Validate target ID - prevent XSS through href manipulation
      if (!targetId || targetId === '#' || !/^#[a-zA-Z0-9_-]+$/.test(targetId)) {
        return;
      }
      
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        
        // Calculate offset for sticky header
        const headerOffset = 90;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: Math.max(0, offsetPosition), // Ensure non-negative value
          behavior: 'smooth'
        });
      }
    });
  });
}

/* --- 9. Hero Section Fade-in Animations --- */
function initHeroAnimations() {
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    // Trigger animations after a small delay for smoother initial load
    setTimeout(() => {
      heroSection.classList.add('loaded');
    }, 100);
  }
}