/* FinTrack — Web3 layer (কোনো external library নেই)
 * ১) Hero ledger-network canvas
 * ২) Wallet connect (EIP-6963 + window.ethereum fallback) — read-only
 * ३) Launch Pass — free message signature (transaction নয়), শুধু browser-এ থাকে
 * এই ফাইল কোনো server-এ wallet address পাঠায় না।
 */
(function(){
  'use strict';

  var $  = function(s, r){ return (r || document).querySelector(s); };
  var rM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ════════════════════════════════════════════════════════════════════════
     ১) Hero network canvas — nodes = accounts, ছুটন্ত বিন্দু = transactions
     ════════════════════════════════════════════════════════════════════════ */
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
    if (rM) return; // reduced-motion: শুধু একটা static frame
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

  /* ════════════════════════════════════════════════════════════════════════
     ২) Wallet
     ════════════════════════════════════════════════════════════════════════ */
  var card = $('#walletCard');
  if (!card) return; // wallet section না থাকলে বাকি অংশ চালানোর দরকার নেই

  var CHAINS = {
    '0x1':    { name: 'Ethereum', sym: 'ETH' },
    '0x2105': { name: 'Base',     sym: 'ETH' },
    '0xa4b1': { name: 'Arbitrum', sym: 'ETH' },
    '0xa':    { name: 'Optimism', sym: 'ETH' },
    '0x89':   { name: 'Polygon',  sym: 'POL' },
    '0x38':   { name: 'BNB Chain', sym: 'BNB' },
    '0xaa36a7': { name: 'Sepolia', sym: 'ETH' }
  };
  var CHIPS = ['0x1', '0x2105', '0xa4b1', '0xa', '0x89', '0x38'];
  var LS_LAST = 'ft_w3_last';

  var wallets = [];
  var S = { w: null, acct: '', chain: '', bal: '', block: '' };
  var lastFocus = null;

  var el = {
    pill: $('#walletPill'), pillLabel: $('#walletPill .wp-label'),
    modal: $('#walletModal'), list: $('#walletList'), toast: $('#w3Toast'),
    name: $('#wcName'), ico: $('#wcIco'), addr: $('#wcAddr'),
    net: $('#wcNet'), bal: $('#wcBal'), blk: $('#wcBlock'),
    chips: $('#chainChips'), passId: $('#ptId'), passMeta: $('#ptMeta')
  };

  /* — helpers — */
  function short(a){ return a ? a.slice(0, 6) + '…' + a.slice(-4) : ''; }
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  function lsDel(k){ try { localStorage.removeItem(k); } catch(e){} }
  var tt;
  function toast(msg, isErr){
    el.toast.textContent = msg;
    el.toast.className = 'w3-toast show' + (isErr ? ' err' : '');
    clearTimeout(tt); tt = setTimeout(function(){ el.toast.className = 'w3-toast'; }, 3600);
  }
  function fmtBal(hex, sym){
    try {
      var v = BigInt(hex), base = BigInt('1000000000000000000'), step = BigInt('100000000000000');
      var whole = v / base, frac = String((v % base) / step);
      while (frac.length < 4) frac = '0' + frac;
      return whole.toString() + '.' + frac + ' ' + sym;
    } catch(e){ return '—'; }
  }
  function hexUtf8(s){
    return '0x' + Array.prototype.map.call(new TextEncoder().encode(s), function(b){
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }
  function sha256Hex(s){
    // crypto.subtle শুধু HTTPS/localhost-এ থাকে; না থাকলে signature-এর অংশ দিয়ে ID বানানো হয়
    if (!(window.crypto && window.crypto.subtle)) return Promise.resolve(s.replace(/^0x/, '').slice(0, 16));
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function(buf){
      return Array.prototype.map.call(new Uint8Array(buf), function(b){ return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  function passKey(a){ return 'ft_w3_pass_' + a.toLowerCase(); }

  /* — wallet discovery (EIP-6963) — */
  window.addEventListener('eip6963:announceProvider', function(e){
    var d = e.detail;
    if (!d || !d.info || !d.provider) return;
    if (wallets.some(function(x){ return x.info.uuid === d.info.uuid; })) return;
    wallets.push(d); renderList();
    var last = lsGet(LS_LAST);
    if (last && last === d.info.uuid && !S.acct) silentConnect(d);
  });
  window.dispatchEvent(new Event('eip6963:requestProvider'));
  setTimeout(function(){ // পুরনো wallet যেগুলো EIP-6963 দেয় না
    if (!wallets.length && window.ethereum){
      var w = { info: { uuid: 'injected', name: 'Browser wallet', icon: '' }, provider: window.ethereum };
      wallets.push(w); renderList();
      if (lsGet(LS_LAST) === 'injected' && !S.acct) silentConnect(w);
    }
  }, 500);

  function renderList(){
    el.list.textContent = '';
    if (!wallets.length){
      var li = document.createElement('li'); li.className = 'w3-empty';
      li.innerHTML = 'কোনো wallet পাওয়া যায়নি। <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">MetaMask</a> বা আপনার পছন্দের wallet install করুন — মোবাইলে হলে wallet app-এর ভেতরের browser দিয়ে এই পেজ খুলুন।';
      el.list.appendChild(li); return;
    }
    wallets.forEach(function(w){
      var li = document.createElement('li'), b = document.createElement('button');
      b.type = 'button'; b.className = 'w3-opt';
      var ic;
      if (w.info.icon && String(w.info.icon).indexOf('data:image/') === 0){
        ic = document.createElement('img'); ic.src = w.info.icon; ic.alt = '';
      } else {
        ic = document.createElement('span'); ic.className = 'fallback';
        ic.innerHTML = '<svg><use href="#ic-wallet"/></svg>';
      }
      var t = document.createElement('span'); t.textContent = w.info.name || 'Wallet';
      b.appendChild(ic); b.appendChild(t);
      b.addEventListener('click', function(){ connect(w); });
      li.appendChild(b); el.list.appendChild(li);
    });
  }

  /* — modal — */
  function openModal(){
    lastFocus = document.activeElement;
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    renderList(); el.modal.hidden = false;
    var f = el.modal.querySelector('button'); if (f) f.focus();
  }
  function closeModal(){
    el.modal.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  el.modal.addEventListener('click', function(e){ if (e.target.hasAttribute('data-close')) closeModal(); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && !el.modal.hidden) closeModal(); });

  /* — connect / disconnect — */
  function attach(w){
    var p = w.provider;
    if (!p.on) return;
    p.on('accountsChanged', function(a){ if (S.w !== w) return; a && a.length ? setAccount(a[0]) : reset(); });
    p.on('chainChanged', function(){ if (S.w === w) refresh(); });
    p.on('disconnect', function(){ if (S.w === w) reset(); });
  }
  var attached = [];
  function bind(w){ if (attached.indexOf(w.provider) < 0){ attached.push(w.provider); attach(w); } }

  function connect(w){
    w.provider.request({ method: 'eth_requestAccounts' }).then(function(a){
      if (!a || !a.length) return;
      S.w = w; bind(w); lsSet(LS_LAST, w.info.uuid);
      closeModal(); setAccount(a[0]);
      toast('Wallet connected — শুধু address আর balance দেখা হচ্ছে।');
    }).catch(function(e){
      toast(e && e.code === 4001 ? 'Connection বাতিল করা হয়েছে।' : 'Wallet connect করা যায়নি। আবার চেষ্টা করুন।', true);
    });
  }
  function silentConnect(w){ // popup ছাড়া — আগে allow করা থাকলে তবেই
    w.provider.request({ method: 'eth_accounts' }).then(function(a){
      if (a && a.length){ S.w = w; bind(w); setAccount(a[0]); }
    }).catch(function(){});
  }
  function reset(){
    S.w = null; S.acct = ''; S.chain = ''; S.bal = ''; S.block = '';
    card.dataset.state = 'idle'; card.dataset.pass = 'none';
    $('.wc-status-text').textContent = 'Wallet';
    el.pill.dataset.connected = 'false'; el.pillLabel.textContent = 'Connect';
    el.pill.querySelector('.wp-long').textContent = ' wallet';
    el.name.textContent = 'Not connected';
    el.ico.innerHTML = '<svg><use href="#ic-wallet"/></svg>';
  }
  function disconnect(){
    var w = S.w;
    if (w && w.provider.request){ // সব wallet support করে না, তাই error উপেক্ষা
      w.provider.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] }).catch(function(){});
    }
    lsDel(LS_LAST); reset(); toast('Disconnected।');
  }

  function setAccount(a){
    S.acct = a;
    card.dataset.state = 'connected';
    $('.wc-status-text').textContent = 'Connected';
    el.pill.dataset.connected = 'true';
    el.pillLabel.textContent = short(a);
    el.pill.querySelector('.wp-long').textContent = '';
    el.name.textContent = (S.w && S.w.info.name) || 'Wallet';
    if (S.w && S.w.info.icon && String(S.w.info.icon).indexOf('data:image/') === 0){
      el.ico.textContent = ''; var im = document.createElement('img'); im.src = S.w.info.icon; im.alt = ''; el.ico.appendChild(im);
    }
    el.addr.textContent = a;
    loadPass(); refresh();
  }

  function refresh(){
    if (!S.w || !S.acct) return;
    var req = function(m, p){ return S.w.provider.request({ method: m, params: p || [] }); };
    req('eth_chainId').then(function(c){
      S.chain = String(c).toLowerCase();
      var ch = CHAINS[S.chain];
      el.net.textContent = ch ? ch.name : 'Chain ' + parseInt(S.chain, 16);
      markChips();
      return req('eth_getBalance', [S.acct, 'latest']).then(function(b){
        el.bal.textContent = fmtBal(b, ch ? ch.sym : 'ETH');
        if (!ch) el.bal.textContent = fmtBal(b, 'native');
      });
    }).then(function(){ return req('eth_blockNumber'); }).then(function(n){
      el.blk.textContent = '#' + parseInt(n, 16).toLocaleString('en-US');
    }).catch(function(){ toast('Balance আনা যায়নি। Wallet-এর network চেক করুন।', true); });
  }

  function buildChips(){
    CHIPS.forEach(function(id){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chain-chip'; b.dataset.id = id;
      b.setAttribute('aria-pressed', 'false'); b.textContent = CHAINS[id].name;
      b.addEventListener('click', function(){
        if (!S.w) return;
        S.w.provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: id }] })
          .then(refresh)
          .catch(function(e){
            toast(e && e.code === 4001 ? 'Network বদলানো বাতিল হয়েছে।' : 'এই network আপনার wallet-এ যোগ করা নেই — আগে wallet-এ যোগ করুন।', true);
          });
      });
      el.chips.appendChild(b);
    });
  }
  function markChips(){
    Array.prototype.forEach.call(el.chips.children, function(b){
      b.setAttribute('aria-pressed', b.dataset.id === S.chain ? 'true' : 'false');
    });
  }
  buildChips();

  /* ════════════════════════════════════════════════════════════════════════
     ३) Launch Pass
     ════════════════════════════════════════════════════════════════════════ */
  function loadPass(){
    var raw = lsGet(passKey(S.acct)), p = null;
    try { p = raw ? JSON.parse(raw) : null; } catch(e){}
    if (p && p.id){
      card.dataset.pass = 'ready';
      el.passId.textContent = p.id;
      el.passMeta.textContent = short(S.acct) + ' · ' + new Date(p.at).toISOString().slice(0, 10);
    } else {
      card.dataset.pass = 'none';
    }
  }
  function claimPass(){
    if (!S.w || !S.acct) return;
    var nonce = Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(8)), function(b){ return ('0' + b.toString(16)).slice(-2); }).join('');
    var now = new Date().toISOString();
    var msg = [
      'FinTrack Launch Pass', '',
      'এই signature বিনামূল্যে এবং এটি কোনো blockchain transaction নয়।',
      'এটি দিয়ে কোনো fund সরানো বা spending approve করা যায় না।', '',
      'Address: ' + S.acct, 'Site: ' + location.host, 'Nonce: ' + nonce, 'Issued: ' + now
    ].join('\n');
    S.w.provider.request({ method: 'personal_sign', params: [hexUtf8(msg), S.acct] }).then(function(sig){
      return sha256Hex(sig);
    }).then(function(hex){
      var h = hex.slice(0, 8).toUpperCase();
      var id = 'FT-' + h.slice(0, 4) + '-' + h.slice(4);
      lsSet(passKey(S.acct), JSON.stringify({ id: id, at: now }));
      loadPass(); toast('Launch Pass তৈরি হয়েছে!');
    }).catch(function(e){
      toast(e && e.code === 4001 ? 'Signature বাতিল করা হয়েছে।' : 'Pass তৈরি করা যায়নি।', true);
    });
  }
  function removePass(){ lsDel(passKey(S.acct)); loadPass(); toast('Pass মুছে ফেলা হয়েছে।'); }

  function downloadPass(){
    var raw = lsGet(passKey(S.acct)), p = null;
    try { p = JSON.parse(raw); } catch(e){}
    if (!p) return;
    var cfg = window.FINTRACK_CONFIG || {};
    var launch = cfg.LAUNCH_DISPLAY || '01 November 2026';
    var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    ready.then(function(){
      var c = document.createElement('canvas'); c.width = 1200; c.height = 630;
      var x = c.getContext('2d'), i;
      var g = x.createLinearGradient(0, 0, 1200, 630);
      g.addColorStop(0, '#120A40'); g.addColorStop(.55, '#3A1B9A'); g.addColorStop(1, '#00799C');
      x.fillStyle = g; x.fillRect(0, 0, 1200, 630);
      x.strokeStyle = 'rgba(255,255,255,.06)'; x.lineWidth = 1;
      for (i = 0; i < 1200; i += 60){ x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 630); x.stroke(); }
      for (i = 0; i < 630; i += 60){ x.beginPath(); x.moveTo(0, i); x.lineTo(1200, i); x.stroke(); }
      x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
      x.font = '700 56px Sora, sans-serif'; x.fillText('FinTrack', 150, 140);
      x.font = '500 26px "JetBrains Mono", monospace'; x.fillStyle = 'rgba(255,255,255,.72)';
      x.fillText('Launch Pass', 150, 182);
      x.fillStyle = '#fff'; x.font = '700 104px "JetBrains Mono", monospace'; x.fillText(p.id, 80, 372);
      x.font = '500 28px "JetBrains Mono", monospace'; x.fillStyle = 'rgba(255,255,255,.8)';
      x.fillText(short(S.acct), 80, 470);
      x.fillText('Launching ' + launch + ' · Google Play', 80, 520);
      x.fillStyle = 'rgba(255,255,255,.5)'; x.font = '400 22px Inter, sans-serif';
      x.fillText('Issued ' + new Date(p.at).toISOString().slice(0, 10), 80, 566);
      var done = function(){
        c.toBlob(function(b){
          if (!b) return;
          var a = document.createElement('a'); a.href = URL.createObjectURL(b);
          a.download = 'fintrack-launch-pass-' + p.id + '.png';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
        }, 'image/png');
      };
      var img = new Image();
      img.onload = function(){
        x.save(); x.beginPath();
        if (x.roundRect) x.roundRect(80, 90, 56, 56, 14); else x.rect(80, 90, 56, 56);
        x.clip(); x.drawImage(img, 80, 90, 56, 56); x.restore(); done();
      };
      img.onerror = done;
      img.src = 'assets/favicon.png';
    });
  }

  /* — button wiring — */
  el.pill.addEventListener('click', function(){
    if (S.acct){ $('#wallet').scrollIntoView({ behavior: rM ? 'auto' : 'smooth' }); } else { openModal(); }
  });
  $('#wcConnect').addEventListener('click', openModal);
  $('#wcDisconnect').addEventListener('click', disconnect);
  $('#wcClaim').addEventListener('click', claimPass);
  $('#wcDownload').addEventListener('click', downloadPass);
  $('#wcRemove').addEventListener('click', removePass);
  $('#wcCopy').addEventListener('click', function(){
    if (!S.acct) return;
    var ok = function(){ toast('Address copy হয়েছে।'); };
    if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(S.acct).then(ok); }
  });

  /* — card 3D tilt (desktop, motion অনুমোদিত হলে) — */
  if (!rM && window.matchMedia('(min-width: 901px)').matches){
    var stage = $('.wallet-stage');
    stage.addEventListener('mousemove', function(e){
      var r = card.getBoundingClientRect();
      var dx = (e.clientX - r.left - r.width / 2) / r.width, dy = (e.clientY - r.top - r.height / 2) / r.height;
      card.style.transform = 'rotateX(' + (-dy * 6) + 'deg) rotateY(' + (dx * 7) + 'deg)';
    });
    stage.addEventListener('mouseleave', function(){ card.style.transform = ''; });
  }
})();
