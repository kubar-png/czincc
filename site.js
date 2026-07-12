/* Smooth scroll reveals — fade + rise as elements enter the viewport.
   Honors prefers-reduced-motion and degrades to fully-visible if JS/IO is unavailable. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return; // leave everything visible

  var SEL = [
    '.eyebrow', 'h1.display', '.phero h1', '.lede', '.hero .cta-row', '.hero-foot',
    '.head-row', '.pillar', '.numitem', '.crow', '.step', '.feecard', '.person',
    '.feature', '.members-grid', '.partner-note', '.ph-note',
    '.band-gold .ast', '.band-gold h2', '.band-gold p', '.band-gold .cta-row',
    '.lead h2', '.lead .sub', '.news h2',
    '.ctacenter h2', '.ctacenter p', '.ctacenter .cta-row',
    '.contact h2', '.contact .sub', '.cdetails', '.contact form'
    // footer intentionally excluded — it must always be fully visible (no bottom-of-page reveal deadzone)
  ].join(',');

  var els = Array.prototype.slice.call(document.querySelectorAll(SEL));
  els.forEach(function (el) {
    el.classList.add('reveal');
    // stagger relative to reveal-siblings within the same parent
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) {
      return el.parentNode === c.parentNode && els.indexOf(c) > -1;
    });
    var idx = sibs.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx, 6) * 0.08 + 's';
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(function (el) { io.observe(el); });
})();

/* Light Lenis smooth scroll. In-page anchors route through Lenis and clear the
   sticky header. Disabled under prefers-reduced-motion or if the CDN is blocked. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.Lenis) return;

  var lenis = new Lenis({ lerp: 0.1, smoothWheel: true }); // light: gentle, not floaty
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: -90 }); // clear the sticky header
    });
  });

  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
})();

/* Mobile navigation — injects a hamburger that reveals nav.main as a dropdown
   panel on small screens. The header CTA is cloned into the panel so it stays
   reachable when the desktop .nav-right is hidden. Runs regardless of motion
   preference (navigation must always work). */
(function () {
  var header = document.querySelector('header');
  var bar = header && header.querySelector('.bar');
  var nav = header && header.querySelector('nav.main');
  if (!header || !bar || !nav) return;

  var btn = document.createElement('button');
  btn.className = 'navtoggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  bar.appendChild(btn);

  var cta = header.querySelector('.nav-right .pill');
  if (cta && !nav.querySelector('.navcta')) {
    var clone = cta.cloneNode(true);
    clone.classList.add('navcta');
    nav.appendChild(clone);
  }

  function close() { header.classList.remove('nav-open'); btn.setAttribute('aria-expanded', 'false'); }

  btn.addEventListener('click', function () {
    var open = header.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 900) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();

/* Work-in-progress bubble — for controls and links that aren't live yet. Shows
   a small "coming soon" tooltip on hover, focus, and click/tap. Applies to the
   EN/CS switch, the founding-member logo cards, the footer social placeholders,
   the leadership LinkedIn icons and the contact-form submit. Any other element
   can opt in with data-wip="message". Pure progressive enhancement — without JS
   the controls simply stay inert. */
(function () {
  var open = []; // currently click-opened hosts

  function tag(el, msg, dot) {
    if (el.dataset.wipReady) return; // idempotent
    el.dataset.wipReady = '1';

    // The bubble must live in a positioned, non-clipping box. If the element
    // itself clips (overflow:hidden — the switch, icons, pill), wrap it so the
    // bubble can escape; otherwise hang the bubble straight off the element.
    var host;
    if (getComputedStyle(el).overflow !== 'visible') {
      host = document.createElement('span');
      host.className = 'wip-wrap wip-host';
      el.parentNode.insertBefore(host, el);
      host.appendChild(el);
    } else {
      host = el;
      el.classList.add('wip-host');
    }

    var bubble = document.createElement('span');
    bubble.className = 'wip-bubble';
    bubble.setAttribute('role', 'status');
    bubble.innerHTML = msg;
    host.appendChild(bubble);

    if (dot) host.classList.add('wip-dot');
    el.classList.add('is-wip');

    // keep native semantics for real links/buttons; promote bare divs
    if (!el.matches('a[href],button,input,select,textarea,[tabindex]')) {
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
    }
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', bubble.textContent);

    function toggle(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      var on = host.classList.toggle('wip-open');
      if (on) { open.push(host); } else { open = open.filter(function (h) { return h !== host; }); }
    }
    el.addEventListener('click', toggle);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') toggle(e);
    });
  }

  function tagAll(sel, msg, dot) {
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { tag(el, msg, dot); });
  }

  // EN/CS switch — Czech version not live yet (gets the persistent "not final" dot)
  tagAll('.lang', 'Czech version <b>coming soon</b> · připravujeme', true);
  // founding-member logo cards — individual member pages aren't built yet
  tagAll('.members-grid .m', 'Member page <b>coming soon</b>');
  // footer social placeholders (real Instagram/email/phone links are left alone)
  tagAll('footer a[href="#"]', '<b>Coming soon</b>');
  // leadership LinkedIn icons
  tagAll('.li[href="#"]', 'LinkedIn <b>coming soon</b>');
  // contact / membership form — not wired to a backend yet
  tagAll('form button[type="submit"]', 'Form <b>not live yet</b> — email info@czin.cc');
  // generic opt-in: <element data-wip="My message">
  Array.prototype.forEach.call(document.querySelectorAll('[data-wip]'), function (el) {
    tag(el, el.getAttribute('data-wip') || 'Work in progress');
  });

  // dismiss click-opened bubbles when interacting elsewhere
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.wip-host')) closeAll();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  function closeAll() {
    open.forEach(function (h) { h.classList.remove('wip-open'); });
    open = [];
  }
})();
