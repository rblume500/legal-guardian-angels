const GA_MEASUREMENT_ID = 'G-RQLTBCHD7K';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'service_hq6wnc5';
const EMAILJS_TEMPLATE_ID = 'KuO37tT32zhjcAtqT';

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

function setFormStatus(message, type = 'success') {
  const status = document.getElementById('cf-status');
  if (!status) return;
  status.textContent = message;
  status.className = `form-status ${type}`;
}

async function handleContactForm(event) {
  const form = document.getElementById('contactForm');
  const submitButton = document.getElementById('cf-submit');
  if (!form || !submitButton) return;

  event.preventDefault();
  const name = form.querySelector('[name="name"]').value.trim();
  const email = form.querySelector('[name="email"]').value.trim();
  const message = form.querySelector('[name="message"]').value.trim();

  setFormStatus('Sending your message...', 'info');
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';
  trackEvent('contact_form_submit', { contact_email: email });

  try {
    const formData = new FormData(form);
    const payload = new URLSearchParams(formData).toString();

    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload
    });

    if (!response.ok) {
      throw new Error('Netlify form submission failed');
    }

    const emailReady = EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID' && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID';

    if (!emailReady) {
      setFormStatus('Thanks, we got your message. Add your EmailJS credentials to enable the instant auto-reply.', 'success');
    } else {
      if (!window.emailjs) {
        throw new Error('EmailJS SDK not loaded');
      }
      emailjs.init(EMAILJS_PUBLIC_KEY);
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name,
        email,
        message
      });
      setFormStatus('Thanks, we got your message and your auto-reply is on the way.', 'success');
    }

    form.reset();
  } catch (error) {
    console.error('Form submission failed:', error);
    setFormStatus('Sorry, something went wrong. Please try again later.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send message';
  }
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
