// FinTrack site — small interaction layer, no dependencies.
(function(){
  "use strict";

  // [PERF] Google Fonts loaded after first paint (was a render-blocking <link> on every page).
  // font-display:swap in the font CSS keeps text visible meanwhile.
  (function loadFonts(){
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(l);
  })();

  // [PERF] Ticker needs two identical sets for the seamless loop — clone instead of shipping the markup twice.
  (function cloneTicker(){
    var track = document.querySelector('.ticker-track');
    if (track && track.children.length === 1){
      var copy = track.firstElementChild.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    }
  })();

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

  // ── Chart animations ──────────────────────────────────────────────────────
  var chartCards = document.querySelectorAll('[data-chart]');
  if (chartCards.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var chartObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        var card = entry.target;
        var type = card.getAttribute('data-chart');

        if (type === 'donut'){
          // Animate each segment from 0 to its final dasharray
          card.querySelectorAll('.donut-seg').forEach(function(seg){
            seg.style.strokeDasharray = seg.getAttribute('data-da');
          });
          // Fade in areas
          card.querySelectorAll('.c-area').forEach(function(a){ a.style.opacity='0.12'; });
        }

        if (type === 'line'){
          setTimeout(function(){
            card.querySelectorAll('.c-line').forEach(function(line){
              line.style.strokeDasharray = '1000 0';
            });
            card.querySelectorAll('.c-area').forEach(function(a){ a.style.opacity='1'; });
          }, 100);
        }

        if (type === 'budget'){
          card.querySelectorAll('.bfill').forEach(function(fill, i){
            setTimeout(function(){
              fill.style.width = 'calc(var(--pct))';
            }, i * 120);
          });
        }

        if (type === 'bar'){
          card.querySelectorAll('.nw-bar').forEach(function(bar, i){
            setTimeout(function(){
              bar.style.height = 'var(--h)';
            }, i * 100);
          });
        }

        chartObs.unobserve(card);
      });
    }, { threshold: 0.25 });

    chartCards.forEach(function(card){ chartObs.observe(card); });
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ── Bloom — rotating features ────────────────────────────────────────────
  var FEATURES = [
    { id:'ic-accounts',     name:'Multiple Accounts',  desc:'Track cash, bank &amp; wallets side by side — any currency.' },
    { id:'ic-category',     name:'Categories',         desc:'Organise every transaction into categories that fit how you spend.' },
    { id:'ic-receipt',      name:'Receipt Scanner',    desc:'Snap a paper receipt — FinTrack reads the amount and date.' },
    { id:'ic-recur',        name:'Recurring Bills',    desc:'Rent, subscriptions, EMIs — set once, tracked every cycle.' },
    { id:'ic-wallet',       name:'Budgets',            desc:'Set a monthly limit per category and get nudged before you overspend.' },
    { id:'ic-exchange',     name:'Debt &amp; Credit',  desc:'Track who owes what, with due-date reminders.' },
    { id:'ic-calendar',     name:'Calendar',           desc:'A day-by-day view of every transaction, bill &amp; reminder.' },
    { id:'ic-todo',         name:'To-Do Lists',        desc:'Money-related tasks right alongside the budget they affect.' },
    { id:'ic-ai',           name:'AI Insights',        desc:'Monthly analysis of your spending &amp; savings trends — private, on your data.' },
    { id:'ic-networth',     name:'Net Worth',          desc:'FD, Stocks, Bonds, Crypto &amp; manual assets — your full wealth picture.' },
    { id:'ic-report',       name:'Reports',            desc:'Export clean PDF or Excel reports of your spending anytime.' },
    { id:'ic-cloud',        name:'Cloud Backup',       desc:'Auto backup so a lost phone never means lost data.' },
    { id:'ic-reminder',     name:'Reminders',          desc:'Never miss a bill, a debt due date, or a budget check-in.' },
    { id:'ic-gamification', name:'Gamification',       desc:'Earn levels and streaks for logging consistently.' },
    { id:'ic-reward',       name:'Rewards',            desc:'Unlock rewards as you hit savings milestones.' },
    { id:'ic-community',    name:'Community',          desc:'Compare progress, share wins, stay accountable with friends.' },
    { id:'ic-notification', name:'Notifications',      desc:'Smart nudges for budgets and bills — tuned to matter, not nag.' },
  ];

  var stage    = document.getElementById('bloomStage');
  var infoBox  = document.getElementById('bloomInfo');
  var infoName = document.getElementById('bloomInfoName');
  var infoDesc = document.getElementById('bloomInfoDesc');

  if (stage && infoBox){
    var petals = Array.prototype.slice.call(stage.querySelectorAll('.petal'));
    var hideTimer, rotatorsRunning = true;

    // ── Assign starting features — no two petals start with the same one ──
    var shuffled = FEATURES.slice().sort(function(){ return Math.random()-.5; });
    petals.forEach(function(p, i){
      var feat = shuffled[i % shuffled.length];
      p._featIdx   = FEATURES.indexOf(feat);
      p._isHovered = false;
      var useEl = p.querySelector('use');
      if (useEl){ useEl.setAttribute('href', '#' + feat.id); }
      p.setAttribute('data-label', feat.name);
      p.setAttribute('data-desc',  feat.desc);
    });

    // ── Cross-fade icon swap ────────────────────────────────────────────────
    function swapFeature(petal){
      var svg  = petal.querySelector('svg');
      var use  = petal.querySelector('use');
      if (!svg || !use) return;

      // Pick next index (skip current)
      var next = (petal._featIdx + 1 + Math.floor(Math.random() * (FEATURES.length - 2))) % FEATURES.length;
      var feat = FEATURES[next];
      petal._featIdx = next;

      // Fade out
      svg.classList.add('icon-fading');
      setTimeout(function(){
        use.setAttribute('href', '#' + feat.id);
        petal.setAttribute('data-label', feat.name);
        petal.setAttribute('data-desc',  feat.desc);
        // If still hovered, update info card live
        if (petal._isHovered){ showInfo(petal); }
        // Fade in
        svg.classList.remove('icon-fading');
        svg.classList.add('icon-appearing');
        setTimeout(function(){ svg.classList.remove('icon-appearing'); }, 320);
      }, 230);
    }

    // ── Start individual rotating timers per petal ─────────────────────────
    var INTERVALS = [3000, 3400, 2800, 3700, 3100, 2600]; // ms, one per petal
    petals.forEach(function(p, i){
      // Random offset so they don't all fire together
      var offset = Math.floor(Math.random() * 1800);
      p._rotTimer = null;

      function startRotation(){
        var delay = INTERVALS[i % INTERVALS.length] + Math.floor(Math.random() * 600);
        p._rotTimer = setTimeout(function(){
          if (!p._isHovered){ swapFeature(p); }
          startRotation(); // re-schedule
        }, delay);
      }

      setTimeout(function(){ startRotation(); }, offset);
    });

    // ── Show / hide info card ─────────────────────────────────────────────
    function showInfo(petal){
      clearTimeout(hideTimer);
      infoName.textContent = petal.getAttribute('data-label') || '';
      infoDesc.innerHTML   = petal.getAttribute('data-desc')  || '';
      infoBox.classList.add('visible');
    }
    function hideInfo(){
      hideTimer = setTimeout(function(){
        infoBox.classList.remove('visible');
      }, 250);
    }

    // ── Petal event listeners ─────────────────────────────────────────────
    petals.forEach(function(p){
      p.addEventListener('mouseenter', function(){
        p._isHovered = true;
        showInfo(p);
      });
      p.addEventListener('mouseleave', function(){
        p._isHovered = false;
        hideInfo();
      });
      p.addEventListener('touchstart', function(e){
        e.preventDefault();
        petals.forEach(function(x){ x._isHovered = false; x.classList.remove('is-active'); });
        p._isHovered = true;
        p.classList.add('is-active');
        showInfo(p);
      }, { passive:false });
      p.addEventListener('focus', function(){ p._isHovered = true;  showInfo(p); });
      p.addEventListener('blur',  function(){ p._isHovered = false; hideInfo(); });
      p.addEventListener('keydown', function(e){
        if (e.key==='Enter'||e.key===' '){ e.preventDefault(); showInfo(p); }
      });
    });

    // ── 3-D Mouse tilt ────────────────────────────────────────────────────
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile     = window.matchMedia('(max-width: 880px)').matches;
    if (!reduceMotion && !isMobile){
      stage.addEventListener('mousemove', function(e){
        var r  = stage.getBoundingClientRect();
        var dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
        var dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
        stage.style.transform = 'perspective(700px) rotateX('+(-dy*9)+'deg) rotateY('+(dx*9)+'deg)';
      });
      stage.addEventListener('mouseleave', function(){
        stage.style.transition = 'transform .55s cubic-bezier(.2,.8,.2,1)';
        stage.style.transform  = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
        setTimeout(function(){ stage.style.transition = 'transform .08s ease-out'; }, 580);
      });
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // ── Apply launch date from config ────────────────────────────────────────
  var _cfg     = window.FINTRACK_CONFIG || {};
  var _full    = _cfg.LAUNCH_DISPLAY || '01 November 2026';
  var _short   = _cfg.LAUNCH_SHORT   || '01 Nov 2026';
  var _isoDate = _cfg.LAUNCH_DATE    || '2026-11-01T00:00:00Z';

  document.querySelectorAll('.js-launch-full').forEach(function(el){
    el.textContent = _full;
  });
  document.querySelectorAll('.js-launch-short').forEach(function(el){
    el.textContent = _short;
  });
  // ─────────────────────────────────────────────────────────────────────────

  // ── Countdown timer ──────────────────────────────────────────────────────
  var LAUNCH = new Date(_isoDate).getTime();

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

// ── Advanced Web3 Effects ─────────────────────────────────────────────────
(function(){
  var rM = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var isMob = window.innerWidth < 881;

  // Scroll progress bar
  var prog = document.getElementById('scrollProgress');
  if(prog){
    window.addEventListener('scroll', function(){
      var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      prog.style.width = Math.min(pct*100,100) + '%';
    }, {passive:true});
  }

  // Cursor glow
  if(!rM && !isMob){
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    window.addEventListener('mousemove', function(e){
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    }, {passive:true});
  }

  // Feature card spotlight + 3D tilt
  if(!rM && !isMob){
    document.querySelectorAll('.card').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width  - 0.5;
        var y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.setProperty('--cx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--cy', (e.clientY - r.top)  + 'px');
        card.style.transform = 'translateY(-5px) perspective(700px) rotateX('+(-y*9)+'deg) rotateY('+(x*9)+'deg)';
      });
      card.addEventListener('mouseleave', function(){
        card.style.setProperty('--cx','-999px');
        card.style.setProperty('--cy','-999px');
        card.style.transition = 'box-shadow .3s ease, border-color .3s ease, transform .5s cubic-bezier(.2,.8,.2,1)';
        card.style.transform = '';
        setTimeout(function(){ card.style.transition=''; }, 520);
      });
      card.addEventListener('mouseenter', function(){
        card.style.transition = 'box-shadow .3s ease, border-color .3s ease, transform .12s ease';
      });
    });
  }

  // Stats counter animation
  var statNums = document.querySelectorAll('.stat-num[data-target]');
  if(statNums.length){
    var statObs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        var el     = entry.target;
        var target = parseInt(el.getAttribute('data-target'), 10);
        var start  = 0;
        var dur    = rM ? 0 : 1400;
        var t0     = performance.now();
        function step(now){
          var p   = Math.min((now - t0) / dur, 1);
          var val = Math.round(p * p * target);
          el.textContent = val;
          if(p < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        statObs.unobserve(el);
      });
    }, {threshold:0.5});
    statNums.forEach(function(el){ statObs.observe(el); });
  }
})();
