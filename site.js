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
