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

/* ---------- Mobile menu toggle ---------- */

(function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');
  if (!toggle || !nav) {
    return;
  }

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  /* Tapping a link closes the panel */
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      setOpen(false);
    }
  });

  /* Escape closes the panel */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  });
})();

/* ---------- How We Work: phase progress ----------
   Drives the amber track line and the active phase highlight.
   The phase nearest the viewport center is active; the line
   fills to match scroll position through the list. Skipped
   entirely under reduced motion (CSS shows all phases full). */

(function () {
  var list = document.querySelector('.phase-list');
  if (!list || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var phases = list.querySelectorAll('.phase');

  function update() {
    var rect = list.getBoundingClientRect();
    var mid = window.innerHeight / 2;

    /* Progress: how far the viewport center has traveled
       through the list, clamped 0-100 */
    var progress = ((mid - rect.top) / rect.height) * 100;
    progress = Math.max(0, Math.min(100, progress));
    list.style.setProperty('--progress', progress + '%');

    /* Active phase: the one containing the viewport center,
       falling back to the nearest */
    var active = null;
    phases.forEach(function (phase) {
      var r = phase.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        active = phase;
      }
    });
    if (!active) {
      active = progress <= 0 ? phases[0] : phases[phases.length - 1];
    }

    phases.forEach(function (phase) {
      phase.classList.toggle('is-active', phase === active);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- How We Work: strategy map spotlight ----------
   Hovering or focusing a term shows its description in the
   display panel. Desktop only; mobile shows every description
   inline via CSS, so this never runs there. */

(function () {
  var spotlight = document.querySelector('.map-spotlight');
  if (!spotlight || !window.matchMedia('(hover: hover)').matches) {
    return;
  }

  var terms = spotlight.querySelectorAll('.map-term');
  var details = spotlight.querySelectorAll('.map-detail');
  var section = document.querySelector('.strategy-map');

  /* The inversion: entering the list floods the section dark,
     leaving releases it. Skipped under reduced motion; the
     section then keeps its static white layout. */
  if (section && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    spotlight.addEventListener('mouseenter', function () {
      section.classList.add('is-inverted');
    });
    spotlight.addEventListener('mouseleave', function () {
      section.classList.remove('is-inverted');
    });
    spotlight.addEventListener('focusin', function () {
      section.classList.add('is-inverted');
    });
    spotlight.addEventListener('focusout', function (e) {
      if (!spotlight.contains(e.relatedTarget)) {
        section.classList.remove('is-inverted');
      }
    });
  }

  var display = spotlight.querySelector('.map-display');

  function setActive(name) {
    var activeTerm = null;
    terms.forEach(function (t) {
      var on = t.dataset.map === name;
      t.classList.toggle('is-active', on);
      if (on) {
        activeTerm = t;
      }
    });
    details.forEach(function (d) {
      d.classList.toggle('is-active', d.dataset.map === name);
    });

    /* Glide the detail to sit level with the active term.
       Both columns share a grid row top, so the term's offset
       center maps straight onto the display column. Clamped
       so the block never escapes the column. */
    if (display && activeTerm) {
      var glide = display.querySelector('.map-detail-glide');
      var dispTop = display.getBoundingClientRect().top;
      var termRect = activeTerm.getBoundingClientRect();
      var center = termRect.top + termRect.height / 2 - dispTop;
      var half = glide.offsetHeight / 2;
      var y = Math.max(half, Math.min(center, display.offsetHeight - half));
      glide.style.transform = 'translateY(' + (y - half) + 'px)';

      /* Water level: one sixth per term */
      var idx = Array.prototype.indexOf.call(terms, activeTerm) + 1;
      glide.style.setProperty('--level', (idx / terms.length) * 100 + '%');
    }
  }

  /* Initial position for the default active item */
  setActive(spotlight.querySelector('.map-term.is-active').dataset.map);

  terms.forEach(function (term) {
    term.addEventListener('mouseenter', function () {
      setActive(term.dataset.map);
    });
    term.querySelector('button').addEventListener('focus', function () {
      setActive(term.dataset.map);
    });
  });
})();

/* ---------- Roles We Place: the deck ----------
   Straight cards, stepped stack. Covered cards scale down
   from their top edge and dim by how deep they're buried,
   while the side rail fills and the counter advances.
   Skipped under reduced motion; CSS then lays the cards out
   as a static stack and hides the rail. */

(function () {
  var deck = document.querySelector('.role-deck');
  if (!deck || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var cards = deck.querySelectorAll('.role-card');
  var railFill = document.querySelector('.deck-rail-fill');
  var count = document.querySelector('.deck-count');
  var total = cards.length;

  function update() {
    var vh = window.innerHeight;

    /* Landing progress of each card: 0 entering at the bottom,
       1 settled on its sticky spot. Card 0 starts landed. */
    var progress = [1];
    for (var j = 1; j < total; j++) {
      var landing = vh * 0.11 + j * 12;
      var top = cards[j].getBoundingClientRect().top;
      progress.push(Math.max(0, Math.min(1, (vh - top) / (vh - landing))));
    }

    /* Each card settles by how deep it is buried: the sum of
       the landing progress of every card above it. Scaling is
       from the top edge, so the stack tightens into even steps. */
    cards.forEach(function (card, i) {
      var depth = 0;
      for (var j = i + 1; j < total; j++) {
        depth += progress[j];
      }
      card.style.transform =
        'scale(' + (1 - depth * 0.035).toFixed(4) + ')';
      card.style.filter = 'brightness(' + (1 - depth * 0.12).toFixed(3) + ')';
    });

    /* Rail fill and counter track the deck as it's worked */
    var landed = 1;
    var sum = 0;
    for (var k = 1; k < total; k++) {
      sum += progress[k];
      if (progress[k] > 0.5) {
        landed = k + 1;
      }
    }
    if (railFill) {
      railFill.style.transform = 'scaleY(' + (sum / (total - 1)).toFixed(4) + ')';
    }
    if (count) {
      count.textContent = '0' + landed + ' / 0' + total;
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
