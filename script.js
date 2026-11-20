// Progressive enhancement only. Every page is complete without this file.
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Reveal on scroll
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-vis'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-vis'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
    window.addEventListener('load', function () {
      setTimeout(function () {
        reveals.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-vis'); });
      }, 60);
    });
  }

  // 2. Header turns solid once the hero scrolls away
  var header = document.getElementById('site-header');
  var hero = document.querySelector('.hero');
  function solid() {
    if (!header) return;
    var limit = hero ? hero.offsetHeight - 120 : 0;
    header.classList.toggle('is-solid', window.scrollY > limit);
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(solid); }, { passive: true });
  solid();

  // 3. Mobile menu
  var btn = header && header.querySelector('.menu-btn');
  function setMenu(open) {
    header.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'Close' : 'Menu';
  }
  if (btn) {
    btn.addEventListener('click', function () { setMenu(!header.classList.contains('is-open')); });
    header.querySelectorAll('nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('is-open')) { setMenu(false); btn.focus(); }
    });
  }

  // 4. Current section in the nav (home page anchors only)
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function mark() {
    var line = window.innerHeight * 0.4, current = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) current = i; });
    links.forEach(function (a, i) { if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  if (links.length) { window.addEventListener('scroll', function () { requestAnimationFrame(mark); }, { passive: true }); mark(); }

  // 5. Gentle parallax on the hero image
  var bg = document.querySelector('.hero-bg');
  if (bg && !reduce) {
    window.addEventListener('scroll', function () {
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        bg.style.transform = 'translate3d(0,' + (y * 0.25) + 'px,0)';
        bg.style.opacity = String(1 - y / window.innerHeight * 0.6);
      });
    }, { passive: true });
  }
})();
