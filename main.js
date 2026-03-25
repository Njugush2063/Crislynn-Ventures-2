// ── NAVBAR: scroll effect ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ── HERO: background zoom on load ──
window.addEventListener('load', () => {
  document.getElementById('hero').classList.add('loaded');
});

// ── SCROLL REVEAL: IntersectionObserver ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
reveals.forEach(el => revealObserver.observe(el));



/* =========================================
   CLICKABLE CARDS
========================================= */

document.querySelectorAll(".exp-card").forEach(card=>{

card.addEventListener("click",()=>{

const link=card.querySelector(".exp-link");

if(!link) return;

const data={
title:link.dataset.title,
image:link.dataset.image,
video:link.dataset.video,
desc:link.dataset.desc
};

localStorage.setItem("selectedExperience",JSON.stringify(data));

window.location.href = link.getAttribute("href");

});

});

// ── MOBILE NAV ──
const navBurger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');
if (navBurger) {
  navBurger.addEventListener('click', () => {
    const isOpen = navLinks.style.display === 'flex';
    navLinks.style.display = isOpen ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '80px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(245,240,232,0.98)';
    navLinks.style.padding = '24px 48px';
    navLinks.style.gap = '20px';
  });
}

// ── FORM: submit handler ──
function handleSubmit(e) {
  e.preventDefault();
  const btn = e.target;
  btn.textContent = "Sent! We'll be in touch ✓";
  btn.style.background = '#4A7A5A';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "Request Services ›";
    btn.style.background = '';
    btn.disabled = false;
  }, 4000);
}

/* ═══════════════════════════════════════════════════════════
   ABOUT SECTION — Script
   Paste just before your closing </body> tag,
   or add to your existing JS file.
═══════════════════════════════════════════════════════════ */

(function () {

  /* ── 1. Scroll-reveal: add .about-visible when section enters viewport ── */
  const aboutSection = document.getElementById('about');
  if (!aboutSection) return;

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          aboutSection.classList.add('about-visible');
          sectionObserver.unobserve(aboutSection);
          startCounters();   // fire counters once visible
        }
      });
    },
    { threshold: 0.18 }
  );
  sectionObserver.observe(aboutSection);


  /* ── 2. Story slide rotation ── */
  const slides    = aboutSection.querySelectorAll('.about-slide');
  const dots      = aboutSection.querySelectorAll('.about-dot');
  let   current   = 0;
  let   autoTimer = null;

  function showSlide(idx) {
    slides.forEach(function (s, i) {
      s.classList.toggle('active', i === idx);
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('active', i === idx);
    });
    current = idx;
  }

  function nextSlide() {
    showSlide((current + 1) % slides.length);
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(nextSlide, 4500);
  }

  // Dot click
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(dot.getAttribute('data-slide'), 10);
      showSlide(idx);
      startAuto(); // reset timer on manual click
    });
  });

  startAuto();


  /* ── 3. Animated counters (ease-out, fire once) ── */
  var countersDone = false;

  function startCounters() {
    if (countersDone) return;
    countersDone = true;

    var counters = aboutSection.querySelectorAll('.counter');
    counters.forEach(function (el) {
      var target   = parseInt(el.getAttribute('data-target'), 10);
      var duration = 1800; // ms
      var start    = null;

      function easeOut(t) {
        return 1 - Math.pow(1 - t, 3); // cubic ease-out
      }

      function step(timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        el.textContent = Math.floor(easeOut(progress) * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }

      // Small delay so counters start after the stat block fades in (~0.9s)
      setTimeout(function () {
        requestAnimationFrame(step);
      }, 950);
    });
  }

})();

/* ═══════════════════════════════════════════════════
   EXPERIENCES SECTION — SLIDER SCRIPT
   Paste this just before your closing </body> tag,
   or add it to your existing JS file.
═══════════════════════════════════════════════════ */

(function () {

  const CARD_W   = 340;  // must match .exp-card flex-basis in CSS
  const CARD_GAP = 20;   // must match .exp-track gap in CSS
  const STEP     = CARD_W + CARD_GAP;

  const state = [
    { idx: 0, dragging: false, startX: 0, scrollStart: 0 },
    { idx: 0, dragging: false, startX: 0, scrollStart: 0 },
    { idx: 0, dragging: false, startX: 0, scrollStart: 0 },
  ];

  function getTrack(cat)      { return document.getElementById('track-' + cat); }
  function getCardCount(cat)  { return getTrack(cat).querySelectorAll('.exp-card').length; }
  function getVisibleCount(cat) {
    const track = getTrack(cat);
    return Math.max(1, Math.floor((track.clientWidth - 120) / STEP));
  }

  /* ── Dots ── */
  function buildDots(cat) {
    const el = document.getElementById('dots-' + cat);
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < getCardCount(cat); i++) {
      const d = document.createElement('div');
      d.className = 'exp-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTo(cat, i));
      el.appendChild(d);
    }
  }

  function updateDots(cat) {
    const dots = document.querySelectorAll('#dots-' + cat + ' .exp-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === state[cat].idx));
  }

  /* ── Arrows ── */
  function updateArrows(cat) {
    const leftBtn  = document.querySelector('.exp-arrow.left[data-cat="'  + cat + '"]');
    const rightBtn = document.querySelector('.exp-arrow.right[data-cat="' + cat + '"]');
    if (leftBtn)  leftBtn.disabled  = state[cat].idx === 0;
    if (rightBtn) rightBtn.disabled = state[cat].idx >= getCardCount(cat) - getVisibleCount(cat);
  }

  /* ── Navigation ── */
  function goTo(cat, idx) {
    const count   = getCardCount(cat);
    const visible = getVisibleCount(cat);
    idx = Math.max(0, Math.min(idx, count - visible));
    state[cat].idx = idx;
    getTrack(cat).scrollTo({ left: idx * STEP, behavior: 'smooth' });
    updateDots(cat);
    updateArrows(cat);
  }

  /* Exposed globally for the inline onclick handlers */
  window.slide = function (cat, dir) { goTo(cat, state[cat].idx + dir); };

  /* ── Mouse Drag ── */
  window.dragStart = function (e, cat) {
    state[cat].dragging    = true;
    state[cat].startX      = e.pageX;
    state[cat].scrollStart = getTrack(cat).scrollLeft;
    getTrack(cat).classList.add('dragging');
  };

  window.dragMove = function (e, cat) {
    if (!state[cat].dragging) return;
    e.preventDefault();
    getTrack(cat).scrollLeft = state[cat].scrollStart - (e.pageX - state[cat].startX);
  };

  window.dragEnd = function (cat) {
    if (!state[cat].dragging) return;
    state[cat].dragging = false;
    getTrack(cat).classList.remove('dragging');
    goTo(cat, Math.round(getTrack(cat).scrollLeft / STEP));
  };

  /* ── Touch Swipe ── */
  window.touchStart = function (e, cat) {
    state[cat].startX      = e.touches[0].pageX;
    state[cat].scrollStart = getTrack(cat).scrollLeft;
    state[cat].dragging    = true;
  };

  window.touchMove = function (e, cat) {
    if (!state[cat].dragging) return;
    getTrack(cat).scrollLeft = state[cat].scrollStart - (e.touches[0].pageX - state[cat].startX);
  };

  /* ── Sync dots on native scroll (trackpad / momentum) ── */
  [0, 1, 2].forEach(function (cat) {
    var track   = getTrack(cat);
    var ticking = false;
    if (!track) return;
    track.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var idx = Math.round(track.scrollLeft / STEP);
          if (state[cat].idx !== idx) {
            state[cat].idx = idx;
            updateDots(cat);
            updateArrows(cat);
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  });

  /* ── Scroll-reveal for category blocks ── */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.exp-category').forEach(function (el) {
    observer.observe(el);
  });

  /* ── Init ── */
  [0, 1, 2].forEach(function (cat) {
    buildDots(cat);
    updateArrows(cat);
  });

})();

/* ════════════════════════════════════════════════════
   CONTACT SECTION — Script
   Paste just before </body> or merge into your JS.

   EMAIL DELIVERY via FormSubmit.co (free, no backend):
   1. On the very first real submission, FormSubmit sends
      a confirmation email to karibu@crislynnventures.co.ke
   2. Click the activation link once.
   3. Done — every submission arrives as a clean table:
      Full Name | Email | Phone | Dates | Experience |
      Guests | Dream Journey Details | How They Heard
════════════════════════════════════════════════════ */

(function () {

  var section = document.getElementById('contact');
  if (!section) return;

  /* ── Scroll reveal ── */
  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) {
      section.classList.add('ct-in');
      obs.disconnect();
    }
  }, { threshold: 0.1 }).observe(section);


  /* ── Experience tile selection ── */
  var tiles   = section.querySelectorAll('.ct-tile');
  var expHid  = document.getElementById('ctExp');

  tiles.forEach(function (tile) {
    tile.addEventListener('click', function () {
      tiles.forEach(function (t) { t.classList.remove('ct-sel'); });
      tile.classList.add('ct-sel');
      if (expHid) expHid.value = tile.getAttribute('data-value');
      var wrap = document.getElementById('ctTiles');
      if (wrap) wrap.classList.remove('ct-err');
    });
  });


  /* ── Guest counter ── */
  var gCount = 2;

  window.ctAdjGuests = function (d) {
    gCount = Math.max(1, Math.min(50, gCount + d));
    var valEl = document.getElementById('ctGuestVal');
    var hidEl = document.getElementById('ctGuestsH');
    if (valEl) {
      valEl.textContent = gCount;
      valEl.classList.add('ct-bump');
      setTimeout(function () { valEl.classList.remove('ct-bump'); }, 200);
    }
    if (hidEl) hidEl.value = gCount + (gCount === 1 ? ' guest' : ' guests');
  };


  /* ── Step navigation ── */
  function setStep(n) {
    var p1   = document.getElementById('ctPanel1');
    var p2   = document.getElementById('ctPanel2');
    var fill = document.getElementById('ctFill');
    var lbl  = document.getElementById('ctStepLbl');

    if (n === 1) {
      if (p2) p2.classList.add('ct-step-panel--hidden');
      if (p1) { p1.classList.remove('ct-step-panel--hidden'); p1.style.animation = 'none'; p1.offsetHeight; p1.style.animation = ''; }
      if (fill) fill.style.width = '50%';
      if (lbl)  lbl.textContent  = '01 / 02';
    } else {
      if (p1) p1.classList.add('ct-step-panel--hidden');
      if (p2) { p2.classList.remove('ct-step-panel--hidden'); p2.style.animation = 'none'; p2.offsetHeight; p2.style.animation = ''; }
      if (fill) fill.style.width = '100%';
      if (lbl)  lbl.textContent  = '02 / 02';
      /* Scroll form top into view on mobile */
      var card = section.querySelector('.ct-form-card');
      if (card && window.innerWidth < 960) {
        card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  window.ctNext = function () {
    var nameEl  = document.getElementById('ctName');
    var emailEl = document.getElementById('ctEmail');
    var expEl   = document.getElementById('ctExp');
    var valid   = true;

    /* Validate name */
    if (!nameEl || !nameEl.value.trim()) {
      markErr(nameEl); valid = false;
    } else { clearErr(nameEl); }

    /* Validate email */
    if (!emailEl || !emailEl.value.trim() || !/\S+@\S+\.\S+/.test(emailEl.value)) {
      markErr(emailEl); valid = false;
    } else { clearErr(emailEl); }

    /* Validate experience selection */
    if (!expEl || !expEl.value) {
      var wrap = document.getElementById('ctTiles');
      if (wrap) { wrap.classList.add('ct-err'); wrap.style.animation = 'none'; wrap.offsetHeight; wrap.style.animation = ''; }
      valid = false;
    }

    if (valid) setStep(2);
  };

  window.ctBack = function () { setStep(1); };

  function markErr(input) {
    if (!input) return;
    var field = input.closest('.ct-field');
    if (field) {
      field.classList.add('ct-err');
      field.style.animation = 'none';
      field.offsetHeight;
      field.style.animation = '';
    }
    input.addEventListener('input', function () { clearErr(input); }, { once: true });
  }

  function clearErr(input) {
    if (!input) return;
    var field = input.closest('.ct-field');
    if (field) field.classList.remove('ct-err');
  }


  /* ── Form submission ── */
  var form = document.getElementById('ctForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Validate step 2 message */
      var msgEl = document.getElementById('ctMsg');
      if (!msgEl || !msgEl.value.trim()) {
        markErr(msgEl); return;
      }

      var btn   = document.getElementById('ctSubBtn');
      var label = document.getElementById('ctSubLbl');
      if (btn)   btn.classList.add('ct-loading');
      if (label) label.textContent = 'Sending…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function (res) {
        /* FormSubmit returns a redirect — treat any response as success */
        showSuccess();
      })
      .catch(function () {
        /* Network fallback — let the browser POST normally */
        form.submit();
      });
    });
  }


  /* ── Success screen ── */
  function showSuccess() {
    var formEl = document.getElementById('ctForm');
    var sucEl  = document.getElementById('ctSuccess');
    var fill   = document.getElementById('ctFill');
    var lbl    = document.getElementById('ctStepLbl');
    if (formEl) formEl.style.display = 'none';
    if (sucEl)  sucEl.classList.add('ct-show');
    if (fill)   fill.style.width = '100%';
    if (lbl)    lbl.textContent  = 'Complete';
  }

  window.ctReset = function () {
    var formEl = document.getElementById('ctForm');
    var sucEl  = document.getElementById('ctSuccess');
    if (formEl) { formEl.reset(); formEl.style.display = ''; }
    if (sucEl)  sucEl.classList.remove('ct-show');

    /* Clear tiles */
    tiles.forEach(function (t) { t.classList.remove('ct-sel'); });
    if (expHid) expHid.value = '';

    /* Reset guests */
    gCount = 2;
    ctAdjGuests(0);

    setStep(1);
  };

})();

/* ════════════════════════════════════════════════
   FOOTER — Scroll reveal
   Paste before </body> or merge into main.js
════════════════════════════════════════════════ */

(function () {
  var footer = document.getElementById('footer');
  if (!footer) return;

  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) {
      footer.classList.add('ft-in');
      obs.disconnect();
    }
  }, { threshold: 0.08 }).observe(footer);
})();

/* ════════════════════════════════════════════
   SERVICES SECTION — Scroll reveal
   Paste before </body> or merge into main.js
════════════════════════════════════════════ */

(function () {
  var section = document.getElementById('services');
  if (!section) return;

  new IntersectionObserver(function (entries, obs) {
    if (entries[0].isIntersecting) {
      section.classList.add('sv-in');
      obs.disconnect();
    }
  }, { threshold: 0.12 }).observe(section);
})();