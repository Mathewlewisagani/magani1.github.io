// Progressive enhancement only. Every page is complete without this file.
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fade sections in as they scroll into view
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-vis'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-vis'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
    window.addEventListener('load', function () {
      reveals.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-vis'); });
    });
  }

  // Header gets a background once the hero scrolls away
  var header = document.getElementById('site-header');
  var hero = document.querySelector('.hero');
  function solid() { if (header) header.classList.toggle('is-solid', window.scrollY > (hero ? hero.offsetHeight - 90 : 0)); }
  window.addEventListener('scroll', function () { requestAnimationFrame(solid); }, { passive: true });
  solid();

  // Mark the section in view in the nav
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function mark() {
    var line = window.innerHeight * 0.4, cur = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) cur = i; });
    links.forEach(function (a, i) { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  if (links.length) { window.addEventListener('scroll', function () { requestAnimationFrame(mark); }, { passive: true }); mark(); }
})();
