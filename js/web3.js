/* FinTrack — Web3 ডিজাইন effects (কোনো library নেই, কোনো network call নেই)
 * ১) Hero ledger-network canvas   ২) Eyebrow "decode" text effect
 * ३) Button magnetic pull          — সব effect motion-কমানো ব্যবহারকারীর জন্য বন্ধ
 */
(function(){
  'use strict';
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var rM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── ১) Hero network — node = account, ছুটন্ত বিন্দু = transaction ─────── */
  (function heroNet(){
    var cv = $('#heroNet');
    if (!cv || !cv.getContext) return;
    var hero = cv.parentElement, ctx = cv.getContext('2d');
    var w = 0, h = 0, dpr = 1, nodes = [], packets = [];
    var mouse = { x: -9999, y: -9999 }, raf = 0, visible = true;
    var LINK = 150, COLORS = ['#00D4FF', '#9D6BFF', '#FFB547'];

    function seed(){
      var n = Math.round(Math.min(46, Math.max(16, (w * h) / 26000)));
      nodes = []; packets = [];
      for (var i = 0; i < n; i++){
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
          r: 1.3 + Math.random() * 1.6, hub: i % 9 === 0
        });
      }
    }
    function size(){
      var r = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(); draw(false);
    }
    function spawnPacket(){
      if (packets.length > 14) return;
      var a = (Math.random() * nodes.length) | 0, b = (Math.random() * nodes.length) | 0;
      if (a === b) return;
      var dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y;
      if (dx * dx + dy * dy > LINK * LINK) return;
      packets.push({ a: a, b: b, t: 0, s: .012 + Math.random() * .012, c: COLORS[(Math.random() * 3) | 0] });
    }
    function draw(move){
      ctx.clearRect(0, 0, w, h);
      var i, j, n = nodes.length, p, q, dx, dy, d, al;
      if (move){
        for (i = 0; i < n; i++){
          p = nodes[i]; p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
        if (Math.random() < .08) spawnPacket();
      }
      ctx.lineWidth = 1;
      for (i = 0; i < n; i++){
        p = nodes[i];
        for (j = i + 1; j < n; j++){
          q = nodes[j]; dx = p.x - q.x; dy = p.y - q.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;
          var mx = (p.x + q.x) / 2 - mouse.x, my = (p.y + q.y) / 2 - mouse.y;
          var near = Math.sqrt(mx * mx + my * my) < 170;
          al = (1 - d / LINK) * (near ? .6 : .26);
          ctx.strokeStyle = near ? 'rgba(0,212,255,' + al + ')' : 'rgba(124,58,255,' + al + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      for (i = packets.length - 1; i >= 0; i--){
        var k = packets[i], A = nodes[k.a], B = nodes[k.b];
        dx = A.x - B.x; dy = A.y - B.y;
        if (dx * dx + dy * dy > (LINK + 20) * (LINK + 20)){ packets.splice(i, 1); continue; }
        if (move) k.t += k.s;
        if (k.t >= 1){ packets.splice(i, 1); continue; }
        var x = A.x + (B.x - A.x) * k.t, y = A.y + (B.y - A.y) * k.t;
        ctx.fillStyle = k.c; ctx.shadowColor = k.c; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.2832); ctx.fill(); ctx.shadowBlur = 0;
      }
      for (i = 0; i < n; i++){
        p = nodes[i];
        ctx.fillStyle = p.hub ? 'rgba(0,212,255,.9)' : 'rgba(200,200,235,.5)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.hub ? p.r + 1.4 : p.r, 0, 6.2832); ctx.fill();
        if (p.hub){
          ctx.strokeStyle = 'rgba(0,212,255,.3)';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 6, 0, 6.2832); ctx.stroke();
        }
      }
    }
    function loop(){ draw(true); raf = requestAnimationFrame(loop); }
    function start(){ if (!raf && visible && !document.hidden && !rM) raf = requestAnimationFrame(loop); }
    function stop(){ if (raf){ cancelAnimationFrame(raf); raf = 0; } }

    size();
    var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(size, 150); });
    if (rM) return; // static frame-ই যথেষ্ট
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });
    hero.addEventListener('mouseleave', function(){ mouse.x = mouse.y = -9999; });
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(en){ visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', function(){ document.hidden ? stop() : start(); });
    start();
  })();

  /* ── ২) Eyebrow "decode" — স্ক্রলে এলে একবার অক্ষর ডিকোড হয় ─────────────── */
  (function decode(){
    if (rM || !('IntersectionObserver' in window)) return;
    var CH = '01abcdef#$%&<>/', els = document.querySelectorAll('.eyebrow');
    var io = new IntersectionObserver(function(en){
      en.forEach(function(e){
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, txt = el.textContent, t0 = performance.now(), dur = 650;
        el.setAttribute('aria-label', txt); // screen reader সবসময় আসল লেখা পড়বে
        (function step(now){
          var p = Math.min((now - t0) / dur, 1), out = '';
          for (var i = 0; i < txt.length; i++){
            out += (txt[i] === ' ' || i < p * txt.length) ? txt[i] : CH[(Math.random() * CH.length) | 0];
          }
          el.textContent = out;
          if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
        })(t0);
      });
    }, { threshold: .6 });
    els.forEach(function(el){ io.observe(el); });
  })();

  /* ── ३) Magnetic buttons (শুধু mouse/trackpad-এ) ─────────────────────────── */
  if (!rM && fine){
    document.querySelectorAll('.btn').forEach(function(b){
      b.addEventListener('mousemove', function(e){
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
        b.style.translate = (x * 10) + 'px ' + (y * 8) + 'px';
      });
      b.addEventListener('mouseleave', function(){ b.style.translate = ''; });
    });
  }
})();
