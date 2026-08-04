(function () {
  'use strict';

  var config = window.ECOLYN_CONFIG || {};
  var siteConfig = window.ECOLYN_SITE_CONFIG || {};
  var supabaseUrl = clean(config.supabaseUrl);
  var supabaseKey = clean(config.supabaseAnonKey);
  var configured = /^https:\/\//.test(supabaseUrl) && supabaseKey.length > 20;
  var settings = null;

  function applyPackConfig() {
    var pack = siteConfig.pack || {};
    var current = Number(pack.currentPriceDh) || 350;
    var former = Number(pack.formerPriceDh) || 450;
    document.querySelectorAll('[data-pack-price-current-number]').forEach(function (element) {
      element.textContent = String(current);
    });
    document.querySelectorAll('[data-pack-price-current]').forEach(function (element) {
      element.textContent = current + (element.classList.contains('ar-inline') ? ' د.م.' : ' DH');
    });
    document.querySelectorAll('[data-pack-price-former]').forEach(function (element) {
      element.textContent = former + (element.classList.contains('ar-inline') ? ' د.م.' : ' DH');
    });
  }

  applyPackConfig();

  function clean(value) {
    value = String(value || '').trim();
    return value.indexOf('__VITE_') === 0 ? '' : value;
  }

  function requestHeaders() {
    return {
      apikey: supabaseKey,
      Authorization: 'Bearer ' + supabaseKey,
      'Content-Type': 'application/json'
    };
  }

  function fallbackSettings() {
    return {
      meta_pixel_id: clean(config.metaPixelId),
      meta_enabled: Boolean(clean(config.metaPixelId)),
      tiktok_pixel_id: clean(config.tiktokPixelId),
      tiktok_enabled: Boolean(clean(config.tiktokPixelId)),
      ga4_measurement_id: clean(config.ga4MeasurementId),
      ga4_enabled: Boolean(clean(config.ga4MeasurementId))
    };
  }

  function fetchSettings() {
    if (!configured) return Promise.resolve(fallbackSettings());
    return fetch(
      supabaseUrl + '/rest/v1/tracking_settings?select=meta_pixel_id,meta_enabled,tiktok_pixel_id,tiktok_enabled,ga4_measurement_id,ga4_enabled&id=eq.1',
      { headers: requestHeaders() }
    ).then(function (response) {
      if (!response.ok) throw new Error('TRACKING_CONFIG_FAILED');
      return response.json();
    }).then(function (rows) {
      return rows[0] || fallbackSettings();
    }).catch(fallbackSettings);
  }

  function loadGa4(id) {
    if (!id || window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(script);
  }

  function loadMeta(id) {
    if (!id || window.fbq) return;
    var fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.push = fbq;
    window.fbq = fbq;
    window._fbq = fbq;
    window.fbq('init', id);
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  function loadTikTok(id) {
    if (!id || window.ttq) return;
    var queue = [];
    var methods = ['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie','holdConsent','revokeConsent','grantConsent'];
    methods.forEach(function (method) {
      queue[method] = function () { queue.push([method].concat([].slice.call(arguments))); };
    });
    window.ttq = queue;
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + encodeURIComponent(id) + '&lib=ttq';
    document.head.appendChild(script);
  }

  var ready = fetchSettings().then(function (nextSettings) {
    settings = nextSettings;
    if (settings.ga4_enabled) loadGa4(clean(settings.ga4_measurement_id));
    if (settings.meta_enabled) loadMeta(clean(settings.meta_pixel_id));
    if (settings.tiktok_enabled) loadTikTok(clean(settings.tiktok_pixel_id));
    return settings;
  });

  var metaEvents = {
    page_view: 'PageView',
    view_content: 'ViewContent',
    form_submit: 'Lead',
    order_submit: 'Lead',
    whatsapp_click: 'Contact',
    pack_cta_click: 'InitiateCheckout',
    initiate_checkout: 'InitiateCheckout'
  };
  var tiktokEvents = {
    page_view: 'PageView',
    view_content: 'ViewContent',
    form_submit: 'SubmitForm',
    order_submit: 'SubmitForm',
    whatsapp_click: 'Contact',
    pack_cta_click: 'InitiateCheckout',
    initiate_checkout: 'InitiateCheckout'
  };

  function send(eventName, payload) {
    if (!settings) return;
    if (settings.ga4_enabled && window.gtag) window.gtag('event', eventName, payload);
    if (settings.meta_enabled && window.fbq) {
      if (metaEvents[eventName]) window.fbq('track', metaEvents[eventName], payload);
      else window.fbq('trackCustom', eventName, payload);
    }
    if (settings.tiktok_enabled && window.ttq) {
      if (tiktokEvents[eventName] === 'PageView') window.ttq.page(payload);
      else window.ttq.track(tiktokEvents[eventName] || eventName, payload);
    }
  }

  window.ecolynTrack = function (eventName, payload) {
    payload = payload || {};
    var blocked = /^(first_?name|last_?name|full_?name|nom|email|phone|telephone|tel|whatsapp|description|photo|message|free_?text|reference)$/i;
    payload = Object.keys(payload).reduce(function (safe, key) {
      if (!blocked.test(key)) safe[key] = payload[key];
      return safe;
    }, {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({
      event: eventName,
      page_path: window.location.pathname,
      language: document.documentElement.lang || 'fr'
    }, payload));
    ready.then(function () { send(eventName, payload); });
  };

  window.trackCTA = function (event) {
    var target = event && event.currentTarget;
    var locationName = target && target.getAttribute('data-cta-location') || 'pack';
    window.ecolynTrack('pack_cta_click', {
      cta_location: locationName,
      content_name: 'Routine ECOLYN'
    });
    window.ecolynTrack('initiate_checkout', { cta_location: locationName });
  };

  function randomId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (character) {
      var value = Math.random() * 16 | 0;
      return (character === 'x' ? value : (value & 3 | 8)).toString(16);
    });
  }

  window.ecolynSubmitPackProspect = function (payload) {
    if (!configured) return Promise.reject(new Error('SUPABASE_NOT_CONFIGURED'));
    var query = new URLSearchParams(window.location.search);
    var record = {
      id: randomId(),
      reference: payload.reference,
      status: 'nouveau',
      first_name: payload.nom,
      whatsapp: payload.tel,
      email: null,
      city: payload.ville,
      primary_concern: 'commande_routine_ecolyn',
      skin_type: null,
      goal: 'Commander la routine ECOLYN',
      description: null,
      answers: {
        type: 'pack_order',
        nom: payload.nom,
        ville: payload.ville,
        telephone: payload.tel
      },
      photo_data_url: null,
      photo_name: null,
      photo_consent: false,
      contact_consent: true,
      marketing_consent: false,
      language: document.documentElement.lang === 'ar' ? 'ar' : 'fr',
      source: 'ecolyn_pack',
      page_url: window.location.href.slice(0, 2000),
      referrer: document.referrer ? document.referrer.slice(0, 2000) : null,
      utm_source: query.get('utm_source'),
      utm_medium: query.get('utm_medium'),
      utm_campaign: query.get('utm_campaign'),
      utm_term: query.get('utm_term'),
      utm_content: query.get('utm_content')
    };
    return fetch(supabaseUrl + '/rest/v1/prospects', {
      method: 'POST',
      headers: Object.assign(requestHeaders(), { Prefer: 'return=minimal' }),
      body: JSON.stringify(record)
    }).then(function (response) {
      if (!response.ok) throw new Error('PROSPECT_INSERT_FAILED');
      return record;
    });
  };

  window.ecolynThankYouUrl = function (reference) {
    sessionStorage.setItem('ecolyn-last-lead', JSON.stringify({ reference: reference }));
    if (window.location.protocol === 'file:') {
      return new URL('../index.html?ecolyn_route=merci&ref=' + encodeURIComponent(reference), window.location.href).href;
    }
    return new URL('../merci?ref=' + encodeURIComponent(reference), window.location.href).href;
  };

  ready.then(function () {
    window.ecolynTrack('page_view', { page_type: 'pack' });
    window.ecolynTrack('pack_view', { content_name: 'Routine ECOLYN' });
  });
})();
