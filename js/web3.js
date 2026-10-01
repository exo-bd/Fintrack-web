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

/* ==========================================================================
   Charts section: ১) spider-web canvas  ২) interactive charts
   ========================================================================== */
(function(){
  'use strict';
  var $  = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var rM   = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ── ১) Spider web — মাউস নড়লে জালের সুতো কাছের node-এ টানে ─────────────── */
  (function web(){
    var sec = $('.charts'), cv = $('#chartsWeb');
    if (!sec || !cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), w = 0, h = 0, dpr = 1;
    var nodes = [], all = [], rects = [], raf = 0, visible = false;
    var mouse = { x: 0, y: 0, on: false }, cur = { x: -9999, y: -9999 }, lastMove = 0;
    var R = 210, LINK = 125;

    function build(){
      var r = sec.getBoundingClientRect(), i;
      w = r.width; h = r.height; dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(95, Math.max(28, (w * h) / 11000)));
      nodes = [];
      for (i = 0; i < n; i++){
        var bx = Math.random() * w, by = Math.random() * h;
        nodes.push({ bx: bx, by: by, x: bx, y: by, ph: Math.random() * 6.28,
                     sp: .0006 + Math.random() * .0008, amp: 8 + Math.random() * 14, r: 1 + Math.random() * 1.4 });
      }
      // কার্ডের চার কোণা স্থির anchor — জালটা কার্ডগুলোকে জড়িয়ে ধরে
      var anch = [];
      rects = [];
      $$('.chart-card', sec).forEach(function(c){
        var b = c.getBoundingClientRect(), ox = b.left - r.left, oy = b.top - r.top;
        rects.push({ x: ox, y: oy, w: b.width, h: b.height });
        [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function(a){
          anch.push({ x: ox + a[0] * b.width, y: oy + a[1] * b.height, r: 2, fixed: true });
        });
      });
      all = nodes.concat(anch);
      if (cur.x < -9000){ cur.x = w / 2; cur.y = h / 2; }
    }

    function frame(t, animate){
      ctx.clearRect(0, 0, w, h);
      var i, j, p, q, dx, dy, d, a;
      // idle হলে (বা touch ডিভাইসে) নিজে নিজে ঘুরে বেড়ানো অদৃশ্য cursor
      var idle = !mouse.on || (t - lastMove > 2800);
      var tx = idle ? w * (.5 + .34 * Math.sin(t * .00031)) : mouse.x;
      var ty = idle ? h * (.5 + .32 * Math.sin(t * .00043 + 1)) : mouse.y;
      if (!animate){ tx = ty = -9999; cur.x = cur.y = -9999; }
      else { cur.x += (tx - cur.x) * .12; cur.y += (ty - cur.y) * .12; }

      for (i = 0; i < nodes.length; i++){
        p = nodes[i];
        var gx = p.bx + Math.cos(t * p.sp + p.ph) * p.amp, gy = p.by + Math.sin(t * p.sp * 1.3 + p.ph) * p.amp;
        dx = cur.x - gx; dy = cur.y - gy; d = Math.sqrt(dx * dx + dy * dy);
        if (d < R){ var f = (1 - d / R) * .3; gx += dx * f; gy += dy * f; } // কাছে এলে cursor-এর দিকে টানে
        p.x += (gx - p.x) * .1; p.y += (gy - p.y) * .1;
      }

      // — ambient জাল: কার্ডের ভেতরে আঁকা হয় না, যাতে লেখা পরিষ্কার থাকে —
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, w, h);
      for (i = 0; i < rects.length; i++) ctx.rect(rects[i].x, rects[i].y, rects[i].w, rects[i].h);
      ctx.clip('evenodd');
      ctx.lineWidth = 1;
      for (i = 0; i < all.length; i++){
        p = all[i];
        for (j = i + 1; j < all.length; j++){
          q = all[j];
          if (p.fixed && q.fixed) continue;
          dx = p.x - q.x; dy = p.y - q.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;
          var mx = (p.x + q.x) / 2 - cur.x, my = (p.y + q.y) / 2 - cur.y;
          var near = Math.sqrt(mx * mx + my * my) < R * .8;
          a = (1 - d / LINK) * (near ? .5 : .15);
          ctx.strokeStyle = near ? 'rgba(0,212,255,' + a + ')' : 'rgba(124,58,255,' + a + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(200,200,235,.4)';
      for (i = 0; i < nodes.length; i++){
        p = nodes[i];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
      ctx.restore();
      // — cursor থেকে কাছের node পর্যন্ত সুতো: কার্ডের ওপরেও দেখা যায় —
      for (i = 0; i < all.length; i++){
        p = all[i]; dx = p.x - cur.x; dy = p.y - cur.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < R){
          a = (1 - d / R);
          ctx.strokeStyle = 'rgba(0,212,255,' + (a * .6) + ')';
          ctx.beginPath(); ctx.moveTo(cur.x, cur.y); ctx.lineTo(p.x, p.y); ctx.stroke();
          ctx.fillStyle = 'rgba(0,212,255,' + (.3 + a * .6) + ')';
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r + a * 1.8, 0, 6.2832); ctx.fill();
        }
      }
      if (animate){
        ctx.strokeStyle = 'rgba(0,212,255,.55)';
        ctx.beginPath(); ctx.arc(cur.x, cur.y, 7, 0, 6.2832); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cur.x, cur.y, 2, 0, 6.2832); ctx.fill();
      }
    }
    function loop(t){ frame(t, true); raf = requestAnimationFrame(loop); }
    function start(){ if (!raf && visible && !document.hidden && !rM) raf = requestAnimationFrame(loop); }
    function stop(){ if (raf){ cancelAnimationFrame(raf); raf = 0; } }

    build(); frame(0, false);
    var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ build(); frame(0, false); }, 150); });
    window.addEventListener('load', function(){ setTimeout(function(){ build(); frame(0, false); }, 400); });
    if (rM) return; // শুধু static frame
    sec.addEventListener('pointermove', function(e){
      var r = sec.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.on = true; lastMove = performance.now();
    }, { passive: true });
    sec.addEventListener('pointerleave', function(){ mouse.on = false; });
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(en){ visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(sec);
    } else { visible = true; }
    document.addEventListener('visibilitychange', function(){ document.hidden ? stop() : start(); });
    start();
  })();

  /* ── ২) Interactive charts ──────────────────────────────────────────────── */

  // কার্ডে spotlight + হালকা tilt
  if (!rM && fine){
    $$('.chart-card').forEach(function(c){
      c.addEventListener('mousemove', function(e){
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.setProperty('--cx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--cy', (e.clientY - r.top) + 'px');
        c.style.transform = 'perspective(900px) rotateX(' + (-y * 4) + 'deg) rotateY(' + (x * 4) + 'deg)';
      });
      c.addEventListener('mouseleave', function(){
        c.style.setProperty('--cx', '-999px'); c.style.setProperty('--cy', '-999px'); c.style.transform = '';
      });
    });
  }

  // Donut — segment বা legend hover করলে মাঝের সংখ্যা বদলায়
  (function donut(){
    var dc = $('[data-chart="donut"]'); if (!dc) return;
    var segs = $$('.donut-seg', dc), rows = $$('.dleg', dc);
    var amt = $('.donut-amount', dc), lbl = $('.donut-lbl', dc), wrap = $('.donut-wrap', dc);
    var A0 = amt.textContent, L0 = lbl.textContent;
    var DATA = [['Food', 35], ['Transport', 22], ['Shopping', 18], ['Bills', 15], ['Other', 10]];
    var TOTAL = parseInt(A0.replace(/[^0-9]/g, ''), 10) || 28450;
    function on(i){
      wrap.classList.add('hovering');
      segs.forEach(function(s, k){ s.classList.toggle('on', k === i); });
      rows.forEach(function(r, k){ r.classList.toggle('on', k === i); });
      amt.textContent = Math.round(TOTAL * DATA[i][1] / 100).toLocaleString('en-US');
      lbl.textContent = DATA[i][0] + ' · ' + DATA[i][1] + '%';
    }
    function off(){
      wrap.classList.remove('hovering');
      segs.forEach(function(s){ s.classList.remove('on'); });
      rows.forEach(function(r){ r.classList.remove('on'); });
      amt.textContent = A0; lbl.textContent = L0;
    }
    segs.concat(rows).forEach(function(el, idx){
      var i = idx % 5;
      el.addEventListener('pointerenter', function(){ on(i); });
      el.addEventListener('pointerleave', off);
    });
  })();

  // Line chart — crosshair + tooltip
  (function line(){
    var lc = $('[data-chart="line"]'); if (!lc) return;
    var svg = $('.line-svg', lc), wrap = $('.line-wrap', lc);
    var inc = $('.income-line', lc), exp = $('.expense-line', lc);
    var months = $$('.lx-labels span', lc).map(function(s){ return s.textContent; });
    function parse(pl){ return pl.getAttribute('points').trim().split(/\s+/).map(function(p){ var a = p.split(','); return { x: +a[0], y: +a[1] }; }); }
    var I = parse(inc), E = parse(exp), NS = 'http://www.w3.org/2000/svg';
    var K = .474; // sample মান: y -> হাজার (donut-এর 28,450 এর সাথে মেলে)
    function mk(tag, cls){ var e = document.createElementNS(NS, tag); e.setAttribute('class', cls); e.style.display = 'none'; svg.appendChild(e); return e; }
    var xh = mk('line', 'xh'); xh.setAttribute('y1', 0); xh.setAttribute('y2', 110);
    var d1 = mk('circle', 'xd'), d2 = mk('circle', 'xd');
    d1.setAttribute('r', 4.5); d1.setAttribute('fill', '#00D4FF'); d2.setAttribute('r', 4.5); d2.setAttribute('fill', '#7C3AFF');
    var tip = document.createElement('div'); tip.className = 'ct'; wrap.appendChild(tip);
    function fmt(y){ return (Math.round((110 - y) * K * 10) / 10).toFixed(1) + 'k'; }
    function move(e){
      var ctm = svg.getScreenCTM(); if (!ctm) return;
      var pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      var x = pt.matrixTransform(ctm.inverse()).x, k = 0, best = 1e9;
      for (var i = 0; i < I.length; i++){ var dd = Math.abs(I[i].x - x); if (dd < best){ best = dd; k = i; } }
      xh.setAttribute('x1', I[k].x); xh.setAttribute('x2', I[k].x);
      d1.setAttribute('cx', I[k].x); d1.setAttribute('cy', I[k].y);
      d2.setAttribute('cx', E[k].x); d2.setAttribute('cy', E[k].y);
      [xh, d1, d2].forEach(function(n){ n.style.display = ''; });
      var sp = svg.createSVGPoint(); sp.x = I[k].x; sp.y = Math.min(I[k].y, E[k].y);
      var s = sp.matrixTransform(ctm), wr = wrap.getBoundingClientRect();
      tip.innerHTML = '<b>' + (months[k] || '') + '</b><i style="background:#00D4FF"></i>Income ' + fmt(I[k].y) +
                      '<br><i style="background:#7C3AFF"></i>Expense ' + fmt(E[k].y);
      var left = Math.max(60, Math.min(wr.width - 60, s.x - wr.left));
      tip.style.left = left + 'px'; tip.style.top = (s.y - wr.top - 6) + 'px';
      tip.classList.add('show');
    }
    function hide(){ [xh, d1, d2].forEach(function(n){ n.style.display = 'none'; }); tip.classList.remove('show'); }
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerdown', move);
    svg.addEventListener('pointerleave', hide);
  })();

  // Net worth — প্রতিটি bar-এ tooltip
  (function nw(){
    var nc = $('[data-chart="bar"]'); if (!nc) return;
    var wrap = $('.nw-wrap', nc), cols = $$('.nw-col', nc);
    var months = $$('.nw-x span', nc).map(function(s){ return s.textContent; });
    var tip = document.createElement('div'); tip.className = 'ct'; wrap.appendChild(tip);
    cols.forEach(function(col, i){
      var bar = $('.nw-bar', col);
      var hPct = parseFloat(bar.style.getPropertyValue('--h')) || 50;
      var val = Math.round(1.138 * hPct + 29.2); // প্রথম (85k) ও শেষ (118k) মানের সাথে মেলানো sample রেখা
      function show(){
        var br = bar.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
        tip.innerHTML = '<b>' + (months[i] || '') + '</b>৳' + val + 'k';
        tip.style.left = Math.max(40, Math.min(wr.width - 40, br.left - wr.left + br.width / 2)) + 'px';
        tip.style.top = (br.top - wr.top - 4) + 'px';
        tip.classList.add('show');
      }
      col.addEventListener('pointerenter', show);
      col.addEventListener('pointerdown', show);
      col.addEventListener('pointerleave', function(){ tip.classList.remove('show'); });
    });
  })();
})();
