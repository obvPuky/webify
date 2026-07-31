(() => {
  'use strict';

  const GOOGLE_TAG_ID = 'G-PK2LVKS1L1';
  const STORAGE_KEY = 'webfine_cookie_consent_v1';
  const SCRIPT_ID = 'webfine-google-tag';
  const currentScriptUrl = document.currentScript?.src;
  const deniedConsent = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied'
  };
  const grantedConsent = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted'
  };

  const copy = {
    cs: {
      title: 'Vaše soukromí, vaše volba',
      description: 'Používáme jen nezbytné úložiště pro zapamatování vaší volby. Google Analytics spustíme pouze po souhlasu, abychom mohli zlepšovat web.',
      privacy: 'Zásady ochrany soukromí',
      reject: 'Odmítnout',
      accept: 'Přijmout',
      settings: 'Nastavení cookies',
      saved: 'Volba cookies byla uložena.'
    },
    en: {
      title: 'Your privacy, your choice',
      description: 'We only use essential storage to remember your choice. Google Analytics starts only after you consent, helping us improve the website.',
      privacy: 'Privacy policy',
      reject: 'Reject',
      accept: 'Accept',
      settings: 'Cookie settings',
      saved: 'Your cookie choice has been saved.'
    },
    pl: {
      title: 'Twoja prywatność, Twój wybór',
      description: 'Używamy tylko niezbędnej pamięci, aby zapamiętać Twój wybór. Google Analytics uruchomimy wyłącznie po wyrażeniu zgody, co pomoże nam ulepszać stronę.',
      privacy: 'Polityka prywatności',
      reject: 'Odrzuć',
      accept: 'Akceptuj',
      settings: 'Ustawienia cookies',
      saved: 'Twój wybór dotyczący cookies został zapisany.'
    },
    de: {
      title: 'Ihre Privatsphäre, Ihre Wahl',
      description: 'Wir verwenden nur notwendigen Speicher, um Ihre Auswahl zu merken. Google Analytics startet erst nach Ihrer Zustimmung und hilft uns, die Website zu verbessern.',
      privacy: 'Datenschutzerklärung',
      reject: 'Ablehnen',
      accept: 'Akzeptieren',
      settings: 'Cookie-Einstellungen',
      saved: 'Ihre Cookie-Auswahl wurde gespeichert.'
    }
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('consent', 'default', deniedConsent);

  function readChoice() {
    try {
      const choice = localStorage.getItem(STORAGE_KEY);
      return choice === 'accepted' || choice === 'rejected' ? choice : null;
    } catch {
      return null;
    }
  }

  function saveChoice(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // The consent still applies for the current page if storage is unavailable.
    }
  }

  function loadStyles() {
    if (!currentScriptUrl || document.getElementById('webfine-cookie-consent-styles')) return;
    const stylesheetUrl = new URL(currentScriptUrl);
    stylesheetUrl.pathname = stylesheetUrl.pathname.replace(/cookie-consent\.js$/, 'cookie-consent.css');
    const link = document.createElement('link');
    link.id = 'webfine-cookie-consent-styles';
    link.rel = 'stylesheet';
    link.href = stylesheetUrl.href;
    document.head.appendChild(link);
  }

  function enableAnalytics() {
    window[`ga-disable-${GOOGLE_TAG_ID}`] = false;
    window.gtag('consent', 'update', grantedConsent);
    if (document.getElementById(SCRIPT_ID)) return;

    window.gtag('js', new Date());
    window.gtag('config', GOOGLE_TAG_ID);

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_TAG_ID)}`;
    document.head.appendChild(script);
  }

  function disableAnalytics() {
    window[`ga-disable-${GOOGLE_TAG_ID}`] = true;
    window.gtag('consent', 'update', deniedConsent);
  }

  function currentLanguage() {
    const language = document.documentElement.lang.toLowerCase().split('-')[0];
    return copy[language] ? language : 'cs';
  }

  function buildInterface() {
    if (document.getElementById('webfine-cookie-consent')) return;

    if (document.querySelector('link[href*="service-page.css"]')) {
      document.documentElement.classList.add('wf-cookie-light');
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'webfine-cookie-consent';
    wrapper.className = 'wf-cookie-consent';
    wrapper.innerHTML = `
      <section class="wf-cookie-card" role="dialog" aria-modal="false" aria-labelledby="wf-cookie-title" aria-describedby="wf-cookie-description">
        <div class="wf-cookie-copy">
          <p class="wf-cookie-kicker">WEBFINE / COOKIES</p>
          <h2 id="wf-cookie-title"></h2>
          <p id="wf-cookie-description"></p>
          <a class="wf-cookie-privacy" href="/#privacy"></a>
        </div>
        <div class="wf-cookie-actions">
          <button class="wf-cookie-button wf-cookie-reject" type="button"></button>
          <button class="wf-cookie-button wf-cookie-accept" type="button"></button>
        </div>
      </section>
      <p class="wf-cookie-status" role="status" aria-live="polite"></p>
    `;

    const settings = document.createElement('button');
    settings.id = 'webfine-cookie-settings';
    settings.className = 'wf-cookie-settings';
    settings.type = 'button';
    settings.hidden = true;

    document.body.appendChild(wrapper);
    document.body.appendChild(settings);

    const title = wrapper.querySelector('#wf-cookie-title');
    const description = wrapper.querySelector('#wf-cookie-description');
    const privacy = wrapper.querySelector('.wf-cookie-privacy');
    const reject = wrapper.querySelector('.wf-cookie-reject');
    const accept = wrapper.querySelector('.wf-cookie-accept');
    const status = wrapper.querySelector('.wf-cookie-status');

    function translate() {
      const text = copy[currentLanguage()];
      title.textContent = text.title;
      description.textContent = text.description;
      privacy.textContent = text.privacy;
      reject.textContent = text.reject;
      accept.textContent = text.accept;
      settings.textContent = text.settings;
      settings.setAttribute('aria-label', text.settings);
    }

    function openSettings() {
      if (wrapper.classList.contains('is-visible')) return;
      settings.hidden = true;
      wrapper.classList.add('is-visible');
      window.requestAnimationFrame(() => reject.focus());
    }

    function closeSettings(choice) {
      saveChoice(choice);
      if (choice === 'accepted') enableAnalytics();
      else disableAnalytics();
      wrapper.classList.remove('is-visible');
      settings.hidden = false;
      status.textContent = copy[currentLanguage()].saved;
      settings.focus();
    }

    privacy.addEventListener('click', event => {
      const privacyButton = document.getElementById('privacyOpen');
      if (!privacyButton) return;
      event.preventDefault();
      privacyButton.click();
    });
    reject.addEventListener('click', () => closeSettings('rejected'));
    accept.addEventListener('click', () => closeSettings('accepted'));
    settings.addEventListener('pointerup', openSettings);
    settings.onclick = openSettings;
    wrapper.addEventListener('keydown', event => {
      if (event.key === 'Escape' && readChoice()) {
        wrapper.classList.remove('is-visible');
        settings.hidden = false;
        settings.focus();
      }
    });

    translate();
    new MutationObserver(translate).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });

    if (readChoice()) {
      settings.hidden = false;
    } else {
      window.requestAnimationFrame(() => wrapper.classList.add('is-visible'));
    }
  }

  loadStyles();
  const savedChoice = readChoice();
  if (savedChoice === 'accepted') enableAnalytics();
  else disableAnalytics();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildInterface, { once: true });
  } else {
    buildInterface();
  }
})();
