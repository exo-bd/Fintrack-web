// FinTrack site — small interaction layer, no dependencies.
(function(){
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links  = document.querySelector('.nav-links');
  if (toggle && links){
    toggle.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ links.classList.remove('open'); });
    });
  }

  // Scroll reveal (skips entirely for reduced-motion users)
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)){
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('reveal-pending'); });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  }

  // Active TOC highlighting on privacy page
  var tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length){
    var sections = Array.prototype.map.call(tocLinks, function(a){
      return document.querySelector(a.getAttribute('href'));
    }).filter(Boolean);

    var setActive = function(){
      var y = window.scrollY + 120;
      var current = sections[0];
      sections.forEach(function(sec){ if (sec.offsetTop <= y) current = sec; });
      tocLinks.forEach(function(a){ a.style.borderColor = ''; a.style.color = ''; });
      if (current){
        var match = document.querySelector('.toc a[href="#' + current.id + '"]');
        if (match){ match.style.borderColor = 'var(--cyan)'; match.style.color = 'var(--ink)'; }
      }
    };
    window.addEventListener('scroll', setActive, { passive: true });
    setActive();
  }

  // Footer year
  var yearEl = document.querySelector('[data-year]');
  if (yearEl){ yearEl.textContent = new Date().getFullYear(); }

  // Copy-to-clipboard buttons (e.g. support email)
  document.querySelectorAll('.copy-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      var text = btn.getAttribute('data-copy') || '';
      var done = function(){
        var original = btn.querySelector('.copy-label');
        var prevHTML = original ? original.innerHTML : '';
        btn.setAttribute('data-copied', 'true');
        if (original) original.textContent = 'Copied!';
        setTimeout(function(){
          btn.removeAttribute('data-copied');
          if (original) original.innerHTML = prevHTML;
        }, 1800);
      };
      var fallbackCopy = function(){
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch(e){}
        document.body.removeChild(ta);
        done();
      };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    });
  });
})();
