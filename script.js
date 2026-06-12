/* Live Oak Talent Partners - shared scripts
   Scroll reveals + condensing sticky header.
   Both are skipped if the user prefers reduced motion. */

(function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Condensing header ---------- */

  var header = document.querySelector('.site-header');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }

  if (header) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll reveals ---------- */

  if (reducedMotion || !('IntersectionObserver' in window)) {
    return; /* content stays fully visible, no animation */
  }

  var targets = document.querySelectorAll('[data-reveal]');

  /* Reveals re-trigger every time a section scrolls back into view */
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    },
    { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
  );

  targets.forEach(function (el) {
    el.classList.add('reveal-init');
    observer.observe(el);
  });

  /* ---------- Custom cursor ---------- */
  /* Fine pointers only (mouse or trackpad), never touch devices.
     Sits inside the reduced-motion guard above, so it is
     automatically off for users who prefer reduced motion. */

  if (!window.matchMedia('(pointer: fine)').matches) {
    return;
  }

  var dot = document.createElement('div');
  dot.className = 'cursor-dot is-hidden';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);
  document.body.classList.add('has-custom-cursor');

  document.addEventListener('mousemove', function (e) {
    dot.style.transform =
      'translate(' + e.clientX + 'px, ' + e.clientY + 'px) translate(-50%, -50%)';
    dot.classList.remove('is-hidden');

    var interactive = e.target.closest(
      'a, button, input, select, textarea, label, [role="button"]'
    );
    dot.classList.toggle('is-hovering', Boolean(interactive));
  });

  document.addEventListener('mouseleave', function () {
    dot.classList.add('is-hidden');
  });
})();

/* ---------- Industry index photo crossfade ----------
   Industries We Serve page only. Hovering a row fades in
   that industry's background photo. Hover-capable screens
   only; touch layouts carry photos per-row in CSS. */

(function () {
  var list = document.querySelector('.industry-list');
  if (!list || !window.matchMedia('(hover: hover)').matches) {
    return;
  }

  var bgs = document.querySelectorAll('.industry-bg');
  var DEFAULT_BG = 'liveoak';

  function setActive(name) {
    bgs.forEach(function (bg) {
      bg.classList.toggle('is-active', bg.dataset.bg === name);
    });
  }

  list.addEventListener('mouseover', function (e) {
    var row = e.target.closest('.industry-row');
    if (row) {
      setActive(row.dataset.industry);
    }
  });

  list.addEventListener('mouseleave', function () {
    setActive(DEFAULT_BG);
  });
})();
