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

  // ── Bloom interactions ────────────────────────────────────────────────────
  var stage    = document.getElementById('bloomStage');
  var infoBox  = document.getElementById('bloomInfo');
  var infoName = document.getElementById('bloomInfoName');
  var infoDesc = document.getElementById('bloomInfoDesc');

  if (stage && infoBox){
    var petals = stage.querySelectorAll('.petal');
    var hideTimer;

    function showInfo(petal){
      clearTimeout(hideTimer);
      infoName.textContent = petal.getAttribute('data-label') || '';
      infoDesc.innerHTML   = petal.getAttribute('data-desc')  || '';
      infoBox.classList.add('visible');
    }

    function hideInfo(){
      hideTimer = setTimeout(function(){
        infoBox.classList.remove('visible');
      }, 200);
    }

    petals.forEach(function(p){
      // Mouse
      p.addEventListener('mouseenter', function(){ showInfo(p); });
      p.addEventListener('mouseleave', hideInfo);
      // Touch
      p.addEventListener('touchstart', function(e){
        e.preventDefault();
        petals.forEach(function(x){ x.classList.remove('is-active'); });
        p.classList.add('is-active');
        showInfo(p);
      }, { passive: false });
      // Keyboard
      p.addEventListener('focus',   function(){ showInfo(p); });
      p.addEventListener('blur',    hideInfo);
      p.addEventListener('keydown', function(e){
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); showInfo(p); }
      });
    });

    // ── Mouse tilt (3-D perspective effect) ────────────────────────────────
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile     = window.matchMedia('(max-width: 880px)').matches;

    if (!reduceMotion && !isMobile){
      stage.addEventListener('mousemove', function(e){
        var r   = stage.getBoundingClientRect();
        var cx  = r.left + r.width  / 2;
        var cy  = r.top  + r.height / 2;
        var dx  = (e.clientX - cx) / (r.width  / 2); // -1 to +1
        var dy  = (e.clientY - cy) / (r.height / 2);
        var tx  =  dy * -9;  // tilt up/down (inverted)
        var ty  =  dx *  9;  // tilt left/right
        stage.style.transform = 'perspective(700px) rotateX('+tx+'deg) rotateY('+ty+'deg)';
      });

      stage.addEventListener('mouseleave', function(){
        stage.style.transition = 'transform .5s cubic-bezier(.2,.8,.2,1)';
        stage.style.transform  = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
        setTimeout(function(){ stage.style.transition = 'transform .08s ease-out'; }, 520);
      });
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ── Countdown timer ──────────────────────────────────────────────────────
  var LAUNCH = new Date('2026-11-01T00:00:00Z').getTime(); // UTC midnight

  var cdDays  = document.getElementById('cd-days');
  var cdHours = document.getElementById('cd-hours');
  var cdMins  = document.getElementById('cd-mins');
  var cdSecs  = document.getElementById('cd-secs');
  var cdWrap  = document.getElementById('countdown');
  var cdDone  = document.getElementById('cd-launched');

  function pad(n){ return n < 10 ? '0' + n : String(n); }

  function tickNum(el, newVal){
    if (!el) return;
    if (el.textContent !== newVal){
      el.classList.add('tick');
      el.textContent = newVal;
      setTimeout(function(){ el.classList.remove('tick'); }, 150);
    }
  }

  function updateCountdown(){
    var now  = Date.now();
    var diff = LAUNCH - now;

    if (diff <= 0){
      // Launch day — hide countdown, show "live" message
      if (cdWrap)  cdWrap.style.display  = 'none';
      if (cdDone){ cdDone.style.display  = 'flex'; }
      return;
    }

    var days  = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins  = Math.floor((diff % 3600000)  / 60000);
    var secs  = Math.floor((diff % 60000)    / 1000);

    tickNum(cdDays,  String(days));
    tickNum(cdHours, pad(hours));
    tickNum(cdMins,  pad(mins));
    tickNum(cdSecs,  pad(secs));
  }

  if (cdDays){ // only run on index page where countdown exists
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
  // ─────────────────────────────────────────────────────────────────────────

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
