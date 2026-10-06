/* Hiệu Vàng Ngọc Diệp — homepage interactions (vanilla JS) */
(function () {
  'use strict';

  /* ---------------- DATA ---------------- */
  // Giá mẫu (VNĐ / chỉ) — thay bằng nguồn giá thật khi tích hợp backend
  var PRICES = [
    { id: '9999', name: 'Vàng 999.9', buy: 13250000, sell: 13400000 },
    { id: '980', name: 'Vàng 980', buy: 12950000, sell: 13100000 },
    { id: '960', name: 'Vàng 960', buy: 12650000, sell: 12800000 },
    { id: 'NT980', name: 'Vàng Nữ Trang 980', buy: 12950000, sell: 13250000 },
    { id: '610', name: 'Vàng 610', buy: 8000000, sell: 8500000 }
  ];

  var IMG = 'assets/img/products/';
  var PRODUCTS = [
    { title: 'Vàng Tích Trữ', desc: 'Nhẫn khâu tròn 999.9 / 980 / 960', img: IMG + 'vang-tich-tru.svg',
      children: ['Vàng 999.9', 'Vàng 980', 'Vàng 960'] },
    { title: 'Trang Sức Vàng 980', desc: 'Đa dạng mẫu trang sức và vàng cưới', img: IMG + 'trang-suc-vang-980.svg',
      children: ['Dây Chuyền 980', 'Mặt Kiểu 980', 'Nhẫn Kiểu 980', 'Lắc Tay 980', 'Vòng Tay 980', 'Kiềng Cổ 980', 'Bông Tai 980'] },
    { title: 'Bộ Sưu Tập', desc: 'Những bộ sưu tập nổi bật theo xu hướng', img: IMG + 'bo-suu-tap.svg',
      children: ['Nhẫn Cưới 610', 'Nhẫn Cưới Trắng 610'] },
    { title: 'Trang Sức Vàng 610', desc: 'Đa dạng mẫu vàng tây 610', img: IMG + 'trang-suc-vang-610.svg',
      children: ['Dây Chuyền 610', 'Mặt Kiểu 610', 'Nhẫn Nam 610', 'Nhẫn Nữ 610', 'Lắc Tay 610', 'Vòng Tay 610', 'Bông Tai 610'] },
    { title: 'Trang Sức Vàng Trắng 610', desc: 'Đa dạng mẫu vàng tây Trắng 610', img: IMG + 'trang-suc-vang-trang-610.svg',
      children: ['Dây Chuyền Trắng 610', 'Mặt Kiểu Trắng 610', 'Nhẫn Nam Trắng 610', 'Nhẫn Nữ Trắng 610', 'Lắc Tay Trắng 610', 'Vòng Tay Trắng 610', 'Bông Tai Trắng 610'] }
  ];
  var MENU_ORDER = [0, 1, 3, 4, 2]; // thứ tự trong menu giống trang gốc

  /* ---------------- HELPERS ---------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return n.toLocaleString('vi-VN').replace(/,/g, '.'); };
  var icon = function (id, cls, sw) { return '<svg class="i ' + (cls || '') + '" stroke-width="' + (sw || 2) + '"><use href="#i-' + id + '"/></svg>'; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var reflow = function (el) { void el.offsetWidth; };
  var lockCount = 0;
  function lockScroll(on) {
    lockCount += on ? 1 : -1;
    if (lockCount < 0) lockCount = 0;
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = lockCount ? 'hidden' : '';
    document.body.style.paddingRight = lockCount && sbw ? sbw + 'px' : '';
  }
  function smoothTo(target) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    var y = el === document.body ? 0 : el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  $$('.js-year').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  // Chặn link "#" (trang con chưa có)
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* ---------------- TOAST ---------------- */
  function toast(title, desc) {
    var box = $('#toasts');
    var li = document.createElement('li');
    li.className = 'toast';
    li.innerHTML = '<div><div class="toast__title">' + esc(title) + '</div>' + (desc ? '<div class="toast__desc">' + esc(desc) + '</div>' : '') + '</div>';
    box.appendChild(li);
    reflow(li);
    li.classList.add('is-in');
    setTimeout(function () {
      li.classList.remove('is-in');
      setTimeout(function () { li.remove(); }, 320);
    }, 3500);
  }

  /* ---------------- THEME ---------------- */
  var root = document.documentElement;
  function syncThemeButtons() {
    var dark = !root.classList.contains('light');
    var label = dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối';
    $$('.js-theme').forEach(function (b) {
      b.setAttribute('aria-label', label);
      b.setAttribute('title', label);
      b.querySelector('use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
    });
  }
  $$('.js-theme').forEach(function (b) {
    b.addEventListener('click', function () {
      root.classList.toggle('light');
      store.set('theme-preference', root.classList.contains('light') ? 'light' : 'dark');
      syncThemeButtons();
      if (chartLoaded) loadChart(true);
    });
  });
  syncThemeButtons();

  /* ---------------- TICKER ---------------- */
  function renderTicker() {
    var one = PRICES.map(function (p) {
      return '<span class="ticker__item"><span class="ticker__name">' + p.name + '</span><span class="ticker__val">' + fmt(p.sell) + '</span></span>';
    }).join('');
    $('#ticker').innerHTML = one + one; // nhân đôi để chạy vòng liền mạch (-50%)
  }

  /* ---------------- PRICE TABLES ---------------- */
  var rowObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); rowObserver.unobserve(en.target); }
    });
  }, { threshold: 0.1 }) : null;

  function renderTables() {
    $('#ptable-d').innerHTML = PRICES.map(function (p) {
      return '<tr class="prow reveal">' +
        '<td><div class="prow__name"><span class="badge"><span>Hiệu Vàng</span><span>Ngọc Diệp</span></span><span class="prow__label">' + p.name + '</span></div></td>' +
        '<td class="prow__price">' + fmt(p.buy) + '</td>' +
        '<td class="prow__price gold-text">' + fmt(p.sell) + '</td></tr>';
    }).join('');
    $('#ptable-m').innerHTML = PRICES.map(function (p) {
      return '<tr class="prow--m reveal"><td>' + p.name + '</td><td>' + fmt(p.buy) + '</td><td class="gold-text">' + fmt(p.sell) + '</td></tr>';
    }).join('');
    $$('#ptable-d tr, #ptable-m tr').forEach(function (tr) {
      if (rowObserver) rowObserver.observe(tr); else tr.classList.add('is-in');
    });
  }

  function stamp() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
    $('#updated-at').textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ' ' + p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
  }
  $('.js-refresh').addEventListener('click', function () {
    var b = this;
    if (b.disabled) return;
    b.disabled = true;
    b.classList.add('is-loading');
    setTimeout(function () {
      stamp();
      b.classList.remove('is-loading');
      b.disabled = false;
    }, 800);
  });

  /* ---------------- TABS + CHART ---------------- */
  var chartLoaded = false;
  function loadChart(force) {
    if (chartLoaded && !force) return;
    chartLoaded = true;
    var dark = !root.classList.contains('light');
    var cfg = { symbol: 'OANDA:XAUUSD', interval: 'D', save_image: '0', studies: '[]', theme: dark ? 'dark' : 'light', style: '1', timezone: 'Asia/Ho_Chi_Minh', withdateranges: '1', studies_overrides: '{}' };
    var src = 'https://s.tradingview.com/widgetembed/?hideideas=1&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=vi#' + encodeURIComponent(JSON.stringify(cfg));
    $('#chart-frame').innerHTML = '<iframe title="Biểu đồ giá vàng thế giới XAUUSD" src="' + src + '" allowtransparency="true" scrolling="no" allowfullscreen loading="lazy"></iframe>';
  }
  $$('.tabs__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.dataset.tab;
      $$('.tabs__btn').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', on);
      });
      $$('.tabpanel').forEach(function (p) { p.hidden = p.dataset.panel !== key; });
      if (key === 'chart') loadChart();
    });
  });

  /* ---------------- SMOOTH SCROLL LINKS ---------------- */
  $$('.js-scroll').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      smoothTo(el.dataset.target || el.getAttribute('href'));
    });
  });
  $$('.js-home').forEach(function (b) { b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }); });

  /* ---------------- PRODUCTS ---------------- */
  function cardHTML(p, mobile) {
    return '<a href="#" class="pcard">' +
      '<div class="pcard__media"><img src="' + p.img + '" alt="' + p.title + '" loading="lazy" /><div class="pcard__shade"></div></div>' +
      '<div class="pcard__body"><h3 class="pcard__title">' + p.title + '</h3><p class="pcard__desc">' + p.desc + '</p>' +
      '<span class="pcard__more">Xem thêm' + icon('arrow-right') + '</span></div></a>';
  }
  function renderProducts() {
    $('#pgrid-3').innerHTML = PRODUCTS.slice(0, 3).map(function (p) { return '<div>' + cardHTML(p) + '</div>'; }).join('');
    $('#pgrid-2').innerHTML = PRODUCTS.slice(3).map(function (p) { return '<div>' + cardHTML(p) + '</div>'; }).join('');
    $('#pcarousel-dots').innerHTML = PRODUCTS.map(function (p, i) {
      return '<button type="button" class="pcarousel__dot" data-i="' + i + '" aria-label="Danh mục ' + (i + 1) + '"></button>';
    }).join('');
    $('#pcarousel-thumbs').innerHTML = PRODUCTS.map(function (p, i) {
      return '<button type="button" class="pcarousel__thumb" data-i="' + i + '" aria-label="' + p.title + '"><img src="' + p.img + '" alt="' + p.title + '" loading="lazy" decoding="async" /></button>';
    }).join('');
  }

  var car = { i: 0, timer: null, busy: false };
  function carMark() {
    $$('.pcarousel__dot').forEach(function (d, k) { d.classList.toggle('is-on', k === car.i); });
    $$('.pcarousel__thumb').forEach(function (t, k) {
      t.classList.toggle('is-on', k === car.i);
      if (k === car.i && t.parentNode.scrollWidth > t.parentNode.clientWidth) {
        t.parentNode.scrollTo({ left: Math.max(0, t.offsetLeft - 8), behavior: 'smooth' });
      }
    });
  }
  function carGo(n, dir) {
    if (car.busy || n === car.i) return;
    car.busy = true;
    var slide = $('#pcarousel-slide');
    var rev = dir < 0;
    slide.className = 'pcarousel__slide ' + (rev ? 'is-exit-rev' : 'is-exit');
    setTimeout(function () {
      car.i = n;
      slide.innerHTML = cardHTML(PRODUCTS[n], true);
      slide.className = 'pcarousel__slide ' + (rev ? 'is-pre-rev' : 'is-pre');
      reflow(slide);
      slide.className = 'pcarousel__slide is-enter';
      carMark();
      setTimeout(function () { car.busy = false; }, 300);
    }, 300);
  }
  function carAuto() {
    clearInterval(car.timer);
    car.timer = setInterval(function () { carGo((car.i + 1) % PRODUCTS.length, 1); }, 3500);
  }
  function initCarousel() {
    $('#pcarousel-slide').innerHTML = cardHTML(PRODUCTS[0], true);
    carMark();
    $('#pcarousel').addEventListener('click', function (e) {
      var b = e.target.closest('[data-i]');
      if (!b) return;
      var n = +b.dataset.i;
      carGo(n, n > car.i ? 1 : -1);
      carAuto();
    });
    var vp = $('.pcarousel__viewport'), sx = 0, sy = 0;
    vp.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    vp.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        var L = PRODUCTS.length;
        if (dx < 0) carGo((car.i + 1) % L, 1); else carGo((car.i - 1 + L) % L, -1);
        carAuto();
      }
    });
    carAuto();
  }

  /* ---------------- DRAWER MENU ---------------- */
  var drawer = $('#drawer'), panel = $('#drawer-panel');
  var menuOpen = false;
  function openMenu() {
    if (menuOpen) return;
    menuOpen = true;
    drawer.hidden = false;
    drawer.classList.remove('is-closing');
    reflow(drawer);
    drawer.classList.add('is-open');
    lockScroll(true);
    $('#fabs').classList.add('is-hidden');
  }
  function closeMenu(after) {
    if (!menuOpen) { if (after) after(); return; }
    menuOpen = false;
    drawer.classList.add('is-closing');
    drawer.classList.remove('is-open');
    panel.style.transform = '';
    $('#drawer-overlay').style.opacity = '';
    setTimeout(function () {
      drawer.hidden = true;
      drawer.classList.remove('is-closing');
      lockScroll(false);
      if (!chatOpen) $('#fabs').classList.remove('is-hidden');
      if (after) after();
    }, 300);
  }
  $$('.js-open-menu').forEach(function (b) { b.addEventListener('click', openMenu); });
  $$('.js-close-menu').forEach(function (b) { b.addEventListener('click', function () { closeMenu(); }); });
  $('#drawer-overlay').addEventListener('click', function () { closeMenu(); });

  // Kéo panel sang trái để đóng
  (function () {
    var startX = 0, startY = 0, dx = 0, tracking = false, dragging = false, w = 0, t0 = 0;
    panel.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      tracking = true; dragging = false; dx = 0;
      startX = e.clientX; startY = e.clientY; w = panel.offsetWidth; t0 = Date.now();
    });
    window.addEventListener('pointermove', function (e) {
      if (!tracking) return;
      var mx = e.clientX - startX, my = e.clientY - startY;
      if (!dragging) {
        if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) {
          dragging = true;
          drawer.classList.add('is-dragging');
          try { panel.setPointerCapture(e.pointerId); } catch (err) {}
        } else if (Math.abs(my) > 8) { tracking = false; return; } else return;
      }
      dx = Math.min(0, mx);
      panel.style.transform = 'translateX(' + dx + 'px)';
      $('#drawer-overlay').style.opacity = String(1 + dx / w);
    });
    function end() {
      if (!tracking) return;
      tracking = false;
      if (!dragging) return;
      drawer.classList.remove('is-dragging');
      var v = dx / Math.max(1, Date.now() - t0);
      if (dx < -w * 0.3 || v < -0.5) closeMenu();
      else { panel.style.transform = ''; $('#drawer-overlay').style.opacity = ''; }
      // chặn click ngay sau khi kéo
      panel.addEventListener('click', function stop(ev) { ev.stopPropagation(); ev.preventDefault(); }, { capture: true, once: true });
      setTimeout(function () { dragging = false; }, 0);
    }
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  })();

  // Submenu accordion (height 0 <-> auto)
  function toggleSub(btn, sub) {
    var open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    if (!open) {
      sub.hidden = false;
      var h = sub.scrollHeight;
      sub.style.height = '0px'; sub.style.opacity = '0';
      reflow(sub);
      sub.style.height = h + 'px'; sub.style.opacity = '1';
      sub.addEventListener('transitionend', function te(e) {
        if (e.propertyName !== 'height') return;
        sub.removeEventListener('transitionend', te);
        if (btn.getAttribute('aria-expanded') === 'true') sub.style.height = '';
      });
    } else {
      sub.style.height = sub.scrollHeight + 'px';
      reflow(sub);
      sub.style.height = '0px';
      sub.addEventListener('transitionend', function te(e) {
        if (e.propertyName !== 'height') return;
        sub.removeEventListener('transitionend', te);
        if (btn.getAttribute('aria-expanded') === 'false') { sub.hidden = true; sub.style.height = ''; sub.style.opacity = ''; }
      });
    }
  }
  function renderMenuProducts() {
    $('#nav-products').innerHTML = MENU_ORDER.map(function (k) {
      var p = PRODUCTS[k];
      return '<div><div class="sub-row"><button type="button" class="sub-row__lbl js-goto-products">' + p.title + '</button>' +
        '<button type="button" class="sub-row__tg js-sub3" aria-label="Mở/đóng submenu ' + p.title + '" aria-expanded="false">' + icon('chevron-down', 'chev') + '</button></div>' +
        '<div class="sub" hidden><div class="sub__list sub__list--l3">' +
        p.children.map(function (c) { return '<button type="button" class="sub-leaf js-goto-products">' + c + '</button>'; }).join('') +
        '</div></div></div>';
    }).join('');
  }
  $('#drawer-nav').addEventListener('click', function (e) {
    var t = e.target.closest('.js-sub, .js-sub3');
    if (t) {
      var sub = t.classList.contains('js-sub') ? t.nextElementSibling : t.parentNode.nextElementSibling;
      toggleSub(t, sub);
      return;
    }
    if (e.target.closest('.js-goto-products')) closeMenu(function () { smoothTo('.products'); });
  });
  $$('#drawer .js-nav-link').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var href = a.getAttribute('href');
      closeMenu(function () { smoothTo(href === '#top' ? document.body : href); });
    });
  });
  $$('#drawer .js-nav-dialog').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      closeMenu(function () { openDialog(a.dataset.dialog); });
    });
  });

  // Tìm kiếm trong menu
  var sBtn = $('#nav-search-btn'), sForm = $('#nav-search'), sInput = $('#nav-search-input');
  sBtn.addEventListener('click', function () { sBtn.hidden = true; sForm.hidden = false; sInput.focus(); });
  $('#nav-search-x').addEventListener('click', function () { sInput.value = ''; sForm.hidden = true; sBtn.hidden = false; });
  sForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = sInput.value.trim();
    if (!q) return;
    closeMenu(function () { smoothTo('.products'); toast('Tìm kiếm', 'Kết quả cho “' + q + '”'); });
  });

  /* ---------------- DIALOGS ---------------- */
  var openDialogs = [];
  function openDialog(id) {
    var d = document.getElementById(id);
    if (!d || !d.hidden) return;
    d.hidden = false;
    reflow(d);
    d.classList.add('is-open');
    openDialogs.push(d);
    lockScroll(true);
    var f = d.querySelector('input, button:not(.dialog__x)');
    setTimeout(function () { (d.querySelector('.dialog__content')).focus && d.querySelector('.dialog__content').setAttribute('tabindex', '-1'); }, 0);
    if (f && id === 'dlg-alert') setTimeout(function () { f.focus({ preventScroll: true }); }, 50);
  }
  function closeDialog(d) {
    d = d || openDialogs[openDialogs.length - 1];
    if (!d) return;
    d.classList.remove('is-open');
    openDialogs = openDialogs.filter(function (x) { return x !== d; });
    setTimeout(function () { d.hidden = true; lockScroll(false); }, 200);
  }
  $$('.js-open-dialog').forEach(function (b) { b.addEventListener('click', function () { openDialog(b.dataset.dialog); }); });
  $$('.dialog').forEach(function (d) {
    $$('.js-close-dialog', d).forEach(function (x) { x.addEventListener('click', function () { closeDialog(d); }); });
  });
  $('.news__all').addEventListener('click', function () { toast('Tin tức', 'Hiện chưa có tin tức nào.'); });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (openDialogs.length) closeDialog();
    else if (menuOpen) closeMenu();
    else if (chatOpen) setChat(false);
  });

  // Form đặt thông báo giá
  (function () {
    var sel = $('#alert-type');
    sel.innerHTML = PRICES.map(function (p) { return '<option value="' + p.id + '">' + p.name + '</option>'; }).join('');
    var state = { side: 'sell', cond: 'gte' };
    function hint() {
      $('#alert-hint').textContent = 'Báo khi giá ' + (state.side === 'sell' ? 'bán ra' : 'mua vào') + ' ' +
        (state.cond === 'gte' ? 'tăng đạt mức mong muốn (≥).' : 'giảm xuống mức mong muốn (≤).');
    }
    $$('#alert-form .seg').forEach(function (seg) {
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('.seg__btn');
        if (!b) return;
        $$('.seg__btn', seg).forEach(function (x) { x.classList.toggle('is-on', x === b); });
        state[seg.dataset.name] = b.dataset.value;
        hint();
      });
    });
    var price = $('#alert-price');
    price.addEventListener('input', function () {
      var digits = price.value.replace(/\D/g, '');
      price.value = digits ? fmt(+digits) : '';
    });
    function list() {
      var items = JSON.parse(store.get('nd_price_alerts') || '[]');
      $('#alert-list-empty').hidden = items.length > 0;
      $('#alert-list').innerHTML = items.map(function (a, i) {
        return '<li><span>' + esc(a.type) + ' · ' + (a.side === 'sell' ? 'Bán ra' : 'Mua vào') + ' ' + (a.cond === 'gte' ? '≥' : '≤') + ' ' + esc(a.price) + '</span><button type="button" data-del="' + i + '" aria-label="Xoá">' + icon('x', 'i-16') + '</button></li>';
      }).join('');
    }
    $('#alert-list').addEventListener('click', function (e) {
      var b = e.target.closest('[data-del]');
      if (!b) return;
      var items = JSON.parse(store.get('nd_price_alerts') || '[]');
      items.splice(+b.dataset.del, 1);
      store.set('nd_price_alerts', JSON.stringify(items));
      list();
    });
    $$('#dlg-alert .seg-top .sbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.view;
        $$('#dlg-alert [data-view-panel]').forEach(function (p) { p.hidden = p.dataset.viewPanel !== v; });
        if (v === 'list') list();
      });
    });
    $('#alert-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var items = JSON.parse(store.get('nd_price_alerts') || '[]');
      items.push({ email: $('#alert-email').value, type: sel.options[sel.selectedIndex].text, side: state.side, cond: state.cond, price: price.value });
      store.set('nd_price_alerts', JSON.stringify(items));
      this.reset();
      closeDialog($('#dlg-alert'));
      toast('Đã đặt thông báo', 'Chúng tôi sẽ gửi email khi giá đạt mức mong muốn.');
    });
  })();

  /* ---------------- LIVE CHAT ---------------- */
  var chat = $('#chat'), chatOpen = false;
  function setChat(on) {
    chatOpen = on;
    chat.classList.toggle('is-open', on);
    chat.setAttribute('aria-hidden', String(!on));
    $('#fabs').classList.toggle('is-hidden', on);
    $('#mbar').classList.toggle('is-hidden', on);
    if (on) setTimeout(function () { var f = chat.querySelector('input'); if (f) f.focus({ preventScroll: true }); }, 300);
  }
  $$('.js-open-chat').forEach(function (b) { b.addEventListener('click', function () { setChat(!chatOpen); }); });
  $$('.js-close-chat').forEach(function (b) { b.addEventListener('click', function () { setChat(false); }); });
  var cName = $('#chat-name'), cSubmit = $('.chat__submit');
  cName.addEventListener('input', function () { cSubmit.disabled = !cName.value.trim(); });
  $('#chat-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var name = cName.value.trim();
    if (!name) return;
    var body = $('#chat-body');
    body.innerHTML = '<div class="chat__msgs" id="chat-msgs"><div class="chat__msg chat__msg--them">Xin chào ' + esc(name) + '! Nhân viên Hiệu Vàng Ngọc Diệp sẽ phản hồi trong giây lát.</div></div>';
    var compose = document.createElement('form');
    compose.className = 'chat__compose';
    compose.innerHTML = '<input class="chat__input" placeholder="Nhập tin nhắn..." aria-label="Tin nhắn" /><button type="submit" aria-label="Gửi">' + icon('send', 'i-16') + '</button>';
    chat.appendChild(compose);
    var inp = compose.querySelector('input');
    inp.focus();
    compose.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = inp.value.trim();
      if (!v) return;
      var m = document.createElement('div');
      m.className = 'chat__msg chat__msg--me';
      m.textContent = v;
      $('#chat-msgs').appendChild(m);
      inp.value = '';
      body.scrollTop = body.scrollHeight;
    });
  });

  /* ---------------- MOBILE TOOLBAR ---------------- */
  var mWrap = $('#mbar-wrap'), mShow = $('#mbar-show');
  $('#mbar-hide').addEventListener('click', function () {
    mWrap.classList.add('is-out');
    setTimeout(function () {
      mWrap.hidden = true;
      mShow.hidden = false;
      mShow.classList.add('is-pre');
      reflow(mShow);
      mShow.classList.remove('is-pre');
    }, 200);
  });
  mShow.addEventListener('click', function () {
    mShow.classList.add('is-pre');
    setTimeout(function () {
      mShow.hidden = true;
      mWrap.hidden = false;
      reflow(mWrap);
      mWrap.classList.remove('is-out');
    }, 200);
  });

  /* ---------------- PWA PROMPTS ---------------- */
  function hidePrompt(p, key) {
    store.set(key, '1');
    p.classList.add('is-pre');
    setTimeout(function () { p.hidden = true; }, 300);
  }
  function initPrompts() {
    var standalone = window.matchMedia('(display-mode: standalone)').matches;
    var show = [];
    var pd = $('[data-prompt="desktop"]'), pn = $('[data-prompt="notify"]');
    if (!standalone && window.innerWidth >= 768 && !store.get('nd_pwa_desktop_dismissed')) show.push([pd, 'nd_pwa_desktop_dismissed']);
    if ('Notification' in window && Notification.permission === 'default' && !store.get('nd_pwa_notify_dismissed')) show.push([pn, 'nd_pwa_notify_dismissed']);
    show.forEach(function (pair, i) {
      var p = pair[0];
      $$('.js-prompt-close', p).forEach(function (b) { b.addEventListener('click', function () { hidePrompt(p, pair[1]); }); });
      setTimeout(function () {
        p.hidden = false;
        p.classList.add('is-pre');
        reflow(p);
        p.classList.remove('is-pre');
      }, 1200 + i * 120);
    });
    $('.js-prompt-install').addEventListener('click', function () {
      hidePrompt(pd, 'nd_pwa_desktop_dismissed');
      toast('Cài đặt ứng dụng', 'Trên Chrome/Edge: bấm biểu tượng “Cài đặt” ở thanh địa chỉ.');
    });
    $('.js-prompt-notify').addEventListener('click', function () {
      var b = this;
      b.disabled = true;
      Notification.requestPermission().then(function (perm) {
        hidePrompt(pn, 'nd_pwa_notify_dismissed');
        toast(perm === 'granted' ? 'Đã bật thông báo' : 'Chưa bật thông báo', perm === 'granted' ? 'Bạn sẽ nhận cập nhật giá vàng mới nhất.' : 'Bạn có thể bật lại trong cài đặt trình duyệt.');
      }).catch(function () { b.disabled = false; });
    });
  }

  /* ---------------- INIT ---------------- */
  renderTicker();
  renderTables();
  stamp();
  renderProducts();
  initCarousel();
  renderMenuProducts();
  initPrompts();
})();
