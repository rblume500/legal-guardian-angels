const GA_MEASUREMENT_ID = 'G-RQLTBCHD7K';
const EMAILJS_CONFIG = window.LGA_EMAILJS_CONFIG || {};
const EMAILJS_PUBLIC_KEY = (window.EMAILJS_PUBLIC_KEY || EMAILJS_CONFIG.publicKey || 'KuO37tT32zhjcAtqT').trim();
const EMAILJS_SERVICE_ID = (window.EMAILJS_SERVICE_ID || EMAILJS_CONFIG.serviceId || 'service_hq6wnc5').trim();
const EMAILJS_TEMPLATE_ID = (window.EMAILJS_TEMPLATE_ID || EMAILJS_CONFIG.templateId || 'template_c280h0u').trim();

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

function showSubmittedState() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('submitted') === '1') {
    setFormStatus('Thanks — your message was received and the auto-reply is on the way.', 'success');
  }
}

function isEmailJsConfigured() {
  return Boolean(
    EMAILJS_PUBLIC_KEY &&
    EMAILJS_SERVICE_ID &&
    EMAILJS_TEMPLATE_ID &&
    !EMAILJS_PUBLIC_KEY.includes('YOUR_') &&
    !EMAILJS_SERVICE_ID.includes('YOUR_') &&
    !EMAILJS_TEMPLATE_ID.includes('YOUR_')
  );
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
    if (!isEmailJsConfigured()) {
      throw new Error('EmailJS values are not configured yet. Add your public key, service ID, and template ID.');
    }

    if (!window.emailjs) {
      throw new Error('EmailJS SDK did not load.');
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name,
        email,
        message,
        from_name: name,
        from_email: email,
        reply_to: email,
        user_name: name,
        user_email: email,
        user_message: message,
        subject: 'New contact form submission'
      }, EMAILJS_PUBLIC_KEY);

      setFormStatus('Thanks, we got your message and your auto-reply is on the way.', 'success');
    } catch (emailError) {
      console.error('EmailJS send failed:', emailError);
      setFormStatus('Your message was captured, but the auto-reply could not be sent. Please contact us directly.', 'error');
    }

    const successUrl = new URL(window.location.href);
    successUrl.searchParams.set('submitted', '1');
    successUrl.hash = 'contact';
    window.history.replaceState({}, '', successUrl.toString());

    form.reset();
    window.setTimeout(() => {
      form.submit();
    }, 250);
  } catch (error) {
    console.error('Form submission failed:', error);
    const detail = error?.text || error?.message || error?.statusText || String(error) || 'Please try again later.';
    setFormStatus(`Sorry, something went wrong: ${detail}`, 'error');
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
  showSubmittedState();
  trackEvent('page_view');
});
