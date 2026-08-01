const GA_MEASUREMENT_ID = 'G-RQLTBCHD7K';
const EMAILJS_PUBLIC_KEY = 'KuO37tT32zhjcAtqT';
const EMAILJS_SERVICE_ID = 'service_hq6wnc5';
const EMAILJS_TEMPLATE_ID = 'template_c280h0u';

window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}

gtag('js', new Date());
gtag('config', GA_MEASUREMENT_ID, {
  page_title: document.title,
  page_location: window.location.href,
  page_path: window.location.pathname + window.location.search + window.location.hash
});

function trackEvent(action, details = {}) {
  gtag('event', action, {
    page_title: document.title,
    page_location: window.location.href,
    ...details
  });
}

function setActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (!href || href.startsWith('#')) return;
    const hrefPath = href.split('#')[0].split('?')[0];
    const isHome = currentPath === 'index.html' && (hrefPath === 'index.html' || hrefPath === '');
    if (hrefPath === currentPath || isHome) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function setupMobileMenu() {
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('mmenu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      menu.classList.toggle('open');
      trackEvent('mobile_menu_toggle');
    });
  }
}

function setupAnchorTracking() {
  document.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href') || '';
      if (!href) return;
      if (href.startsWith('http') || href.startsWith('mailto:')) {
        trackEvent('outbound_click', { link_url: href });
      } else {
        trackEvent('internal_click', { link_url: href });
      }
    });
  });
}

async function handleContactForm(event) {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('cf-status');
  if (!form || !status) return;

  event.preventDefault();
  const name = form.querySelector('[name="name"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  const message = form.querySelector('[name="message"]').value.trim();

  status.textContent = 'Sending your message...';
  trackEvent('contact_form_submit', { contact_email: email });

  let sent = false;

  if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID') {
    try {
      if (window.emailjs) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: name,
          from_email: email,
          message: message
        });
        sent = true;
      }
    } catch (error) {
      console.error('EmailJS failed:', error);
    }
  }

  if (sent) {
    status.textContent = 'Thanks! Your message was sent and a confirmation email is on the way.';
  } else {
    status.textContent = 'Thanks for reaching out. We received your message and will follow up soon.';
  }

  form.reset();
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', handleContactForm);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  setupMobileMenu();
  setupAnchorTracking();
  setupContactForm();
  trackEvent('page_view');
});
