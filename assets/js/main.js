/* Hiệu Vàng Ngọc Diệp — homepage interactions (vanilla JS) */
(function () {
  'use strict';

  /* ---------------- DATA ---------------- */
  // Bảng giá vàng (VNĐ / chỉ) — số mặc định; khi mở trang sẽ được thay bằng giá quy đổi từ API (loadPrices)
  var PRICES = [
    { id: '9999', name: 'Vàng 9999', buy: 14100000, sell: 14230000 },
    { id: '980', name: 'Vàng 98', buy: 13760000, sell: 13950000 },
    { id: '960', name: 'Vàng 96', buy: 13460000, sell: 13650000 },
    { id: 'NT980', name: 'Nữ Trang 98', buy: 13760000, sell: 14050000 },
    { id: '610', name: 'Vàng 610', buy: 8580000, sell: 9000000 }
  ];
  // Bảng giá bạc (VNĐ / lượng 37,5g) — số mặc định; khi mở trang sẽ được thay bằng giá quy đổi từ API
  var SILVER_PRICES = [
    { id: 'AG999', name: 'Bạc 999 (miếng, thỏi)', buy: 2138000, sell: 2204000 },
    { id: 'AG999MN', name: 'Bạc mỹ nghệ 999', buy: 2138000, sell: 2515000 }
  ];
  var SILVER_UPDATED_AT = '18:00 06/10/2026';

  // Mốc giờ cập nhật của bảng giá (hiển thị ở "Cập nhật lúc ...")
  var PRICES_UPDATED_AT = '09:15 28/08/2026';

  // Danh mục sản phẩm (ảnh đại diện lấy từ sản phẩm thật trong assets/img/catalog/)
  var IMG = '/assets/img/catalog/';
  var PRODUCTS = [
    { slug: 'vang-tich-tru', title: 'Vàng Tích Trữ', desc: 'Nhẫn tròn 24K, đồng vàng, vàng ép vỉ 999.9', img: IMG + 'dong-vang-999.jpg',
      children: ['Nhẫn Tròn Trơn', 'Đồng Vàng', 'Vàng Ép Vỉ'] },
    { slug: 'trang-suc-cuoi', title: 'Trang Sức Cưới', desc: 'Dây cổ cưới, mặt khoá, vòng cưới truyền thống', img: IMG + 'day-co-cuoi-5-tang.jpg',
      children: ['Dây Cổ Cưới', 'Mặt Khoá', 'Vòng Cưới'] },
    { slug: 'day-chuyen', title: 'Dây Chuyền', desc: 'Cỏ 4 lá, mặt charm, dây hoa men', img: IMG + 'day-chuyen-co-4-la-vang.jpg',
      children: ['Dây Chuyền Cỏ 4 Lá', 'Dây Chuyền Mặt Charm', 'Dây Hoa Men'] },
    { slug: 'lac-vong', title: 'Lắc & Vòng Tay', desc: 'Lắc tay cỏ 4 lá, bọ rùa, bộ lắc & nhẫn', img: IMG + 'lac-co-4-la-xanh.jpg',
      children: ['Lắc Tay', 'Bộ Lắc & Nhẫn'] },
    { slug: 'nhan', title: 'Nhẫn Thời Trang', desc: 'Nhẫn nữ đính đá, bản lưới, mắt xích', img: IMG + 'nhan-hoa-dinh-da.jpg',
      children: ['Nhẫn Nữ'] },
    { slug: 'qua-tang', title: 'Quà Tặng Vàng', desc: 'Tượng phong thuỷ, hoa hồng vàng, quà cho bé', img: IMG + 'tuong-tai-than-cuoi-ngua.jpg',
      children: ['Tượng Vàng Phong Thuỷ', 'Hoa Vàng', 'Quà Tặng Bé'] }
  ];
  var MENU_ORDER = [0, 1, 2, 3, 4, 5];

  // THÔNG TIN LIÊN HỆ — điền thông tin thật của Ngọc Diệp vào đây (để trống = hiện "Đang cập nhật")
  var CONTACT = {
    gpkd: '',                                                   // chưa có — điền khi khách cung cấp
    address: '94-96 Lý Thái Tổ, phường Thanh Khê, TP. Đà Nẵng',
    hotline: '0905 887 044',
    zalo: '0905 887 044',                                        // cùng số với hotline (theo fanpage)
    email: 'giabaobao2021123@gmail.com',
    facebook: 'https://www.facebook.com/HieuVangNgocDiepHau/',
    hours: 'Mở cửa tất cả các ngày trong tuần'                  // fanpage ghi "Always open"
  };

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
  // Cuộn tới mục trên trang hiện tại; nếu mục nằm ở trang chủ thì chuyển trang
  function goTo(hash) {
    if (hash === '#gia-bac') {
      if (!isHome) { location.href = '/#gia-bac'; return; }
      showTab('silver'); hash = '#bang-gia';
    }
    if (hash === '#top' || hash === 'body') {
      if (isHome) return window.scrollTo({ top: 0, behavior: 'smooth' });
      location.href = '/'; return;
    }
    var el = $(hash);
    if (el) smoothTo(el); else location.href = '/' + hash;
  }
  var isHome = document.body.dataset.page === 'home';
  // Link tới trang danh sách sản phẩm (có thể kèm bộ lọc)
  function shopUrl(params) {
    var q = [];
    Object.keys(params || {}).forEach(function (k) { if (params[k]) q.push(k + '=' + encodeURIComponent(params[k])); });
    return '/san-pham' + (q.length ? '?' + q.join('&') : '');
  }
  var shopApply = null; // được gán khi đang ở trang sản phẩm
  function navigateShop(params) {
    if (shopApply) shopApply(params, true);
    else location.href = shopUrl(params);
  }
  $$('.js-year').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  // Link "#" / nút [data-soon]: trang con chưa có -> báo "đang cập nhật" thay vì bấm không phản hồi
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#"], [data-soon]');
    if (!a) return;
    e.preventDefault();
    if (/\bjs-/.test(a.className)) return; // đã có xử lý riêng
    toast('Đang cập nhật', 'Nội dung này sẽ sớm ra mắt. Quý khách vui lòng liên hệ cửa hàng để được tư vấn.');
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
  function applyTheme() {
    root.classList.toggle('light');
    store.set('theme-preference', root.classList.contains('light') ? 'light' : 'dark');
    syncThemeButtons();
  }
  // Đổi theme: vùng sáng/tối lan ra theo hình tròn từ điểm click (View Transitions API)
  function toggleTheme(e) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) {
      applyTheme();
      if (chartLoaded) loadChart(true);
      return;
    }
    var r = e.currentTarget.getBoundingClientRect();
    var x = e.clientX || r.left + r.width / 2;
    var y = e.clientY || r.top + r.height / 2;
    var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    var t = document.startViewTransition(applyTheme);
    t.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 700, easing: 'cubic-bezier(.4, 0, .2, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
    t.finished.then(function () { if (chartLoaded) loadChart(true); });
  }
  $$('.js-theme').forEach(function (b) { b.addEventListener('click', toggleTheme); });
  syncThemeButtons();

  /* ---------------- TICKER ---------------- */
  function renderTicker() {
    var item = function (name, val, cls) {
      return '<span class="ticker__item"><span class="ticker__name' + (cls || '') + '">' + name + '</span><span class="ticker__val">' + fmt(val) + '</span></span>';
    };
    var one = PRICES.map(function (p) { return item(p.name, p.sell); }).join('') +
      SILVER_PRICES.slice(0, 1).map(function (p) { return item('Bạc 999 / lượng', p.sell, ' ticker__name--silver'); }).join('');
    $('#ticker').innerHTML = one + one; // nhân đôi để chạy vòng liền mạch (-50%)
  }

  /* ---------------- PRICE TABLES ---------------- */
  var rowObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); rowObserver.unobserve(en.target); }
    });
  }, { threshold: 0.1 }) : null;

  function renderTables() {
    renderPriceTable('#ptable-d', '#ptable-m', PRICES, 'gold-text');
    renderPriceTable('#stable-d', '#stable-m', SILVER_PRICES, 'silver-text');
  }
  function renderPriceTable(dSel, mSel, rows, sellCls) {
    if (!$(dSel)) return;
    var shown = $(dSel + ' tr.is-in') || $(mSel + ' tr.is-in'); // đã hiện -> cập nhật tại chỗ, không chạy lại hiệu ứng
    $(dSel).innerHTML = rows.map(function (p) {
      return '<tr class="prow reveal">' +
        '<td><div class="prow__name"><span class="badge"><span>Hiệu Vàng</span><span>Ngọc Diệp</span></span><span class="prow__label">' + p.name + '</span></div></td>' +
        '<td class="prow__price">' + fmt(p.buy) + '</td>' +
        '<td class="prow__price ' + sellCls + '">' + fmt(p.sell) + '</td></tr>';
    }).join('');
    $(mSel).innerHTML = rows.map(function (p) {
      return '<tr class="prow--m reveal"><td>' + p.name + '</td><td>' + fmt(p.buy) + '</td><td class="' + sellCls + '">' + fmt(p.sell) + '</td></tr>';
    }).join('');
    $$(dSel + ' tr, ' + mSel + ' tr').forEach(function (tr) {
      if (shown || !rowObserver) tr.classList.add('is-in'); else rowObserver.observe(tr);
    });
  }

  function stamp() {
    $('#updated-at').textContent = PRICES_UPDATED_AT;
    if ($('#silver-updated-at')) $('#silver-updated-at').textContent = SILVER_UPDATED_AT;
  }
  /* ---------------- GIÁ TỪ API (demo) ----------------
   * Mở trang là lấy giá vàng & bạc thế giới (USD/ounce) + tỷ giá USD/VND rồi quy đổi đổ vào bảng.
   * API miễn phí, không cần key: api.gold-api.com, open.er-api.com
   */
  function loadPrices() {
    var get = function (u) { return fetch(u).then(function (r) { return r.json(); }); };
    return Promise.all([
      get('https://api.gold-api.com/price/XAU'),
      get('https://api.gold-api.com/price/XAG'),
      get('https://open.er-api.com/v6/latest/USD')
    ]).then(function (r) {
      var vnd = r[2].rates.VND, perGram = function (usdOz) { return usdOz * vnd / 31.1035; };
      var round = function (n) { return Math.round(n / 1000) * 1000; };
      var chi = perGram(r[0].price) * 3.75;   // 1 chỉ vàng 999.9
      var luong = perGram(r[1].price) * 37.5; // 1 lượng bạc 999
      var row = function (p, base, k) { p.sell = round(base * k); p.buy = round(base * k * 0.985); };
      var GOLD_K = { '9999': 1, '980': 0.98, '960': 0.96, 'NT980': 0.98, '610': 0.61 };
      PRICES.forEach(function (p) { row(p, chi, GOLD_K[p.id] || 1); });
      var SILVER_K = { AG999: 1, AG999MN: 1.1 };
      SILVER_PRICES.forEach(function (p) { row(p, luong, SILVER_K[p.id] || 1); });
      var d = new Date(), pad = function (n) { return String(n).padStart(2, '0'); };
      PRICES_UPDATED_AT = SILVER_UPDATED_AT = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
      renderTables(); renderTicker(); stamp();
    }).catch(function () { /* lỗi mạng: giữ giá mặc định */ });
  }
  $$('.js-refresh').forEach(function (b) { b.addEventListener('click', loadPrices); });

  /* ---------------- TABS + CHART ---------------- */
  var chartLoaded = false, chartSymbol = 'XAU';
  var CHART = {
    XAU: { tv: 'OANDA:XAUUSD', title: 'Vàng Thế Giới (XAU/USD)', metal: 'Vàng' },
    XAG: { tv: 'OANDA:XAGUSD', title: 'Bạc Thế Giới (XAG/USD)', metal: 'Bạc' }
  };
  function loadChart(force) {
    if (chartLoaded && !force) return;
    chartLoaded = true;
    var c = CHART[chartSymbol];
    var dark = !root.classList.contains('light');
    var cfg = { symbol: c.tv, interval: 'D', save_image: '0', studies: '[]', theme: dark ? 'dark' : 'light', style: '1', timezone: 'Asia/Ho_Chi_Minh', withdateranges: '1', studies_overrides: '{}' };
    var src = 'https://s.tradingview.com/widgetembed/?hideideas=1&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=vi#' + encodeURIComponent(JSON.stringify(cfg));
    $('#chart-frame').innerHTML = '<iframe title="Biểu đồ ' + c.title + '" src="' + src + '" allowtransparency="true" scrolling="no" allowfullscreen loading="lazy"></iframe>';
    $('#chart-title').textContent = c.title;
    $('#chart-metal').textContent = c.metal;
    $('#chart-metal').className = chartSymbol === 'XAG' ? 'silver-text' : 'gold-text';
  }
  function showTab(key) {
    $$('.tabs__btn').forEach(function (b) {
      var on = b.dataset.tab === key;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on);
    });
    $$('.tabpanel').forEach(function (p) { p.hidden = p.dataset.panel !== key; });
    if (key === 'chart') loadChart();
    // hàng bảng giá trong tab vừa mở đã nằm sẵn trong khung nhìn -> hiện ngay
    $$('.tabpanel:not([hidden]) .reveal').forEach(function (tr) {
      var r = tr.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) tr.classList.add('is-in');
    });
  }
  $$('.tabs__btn').forEach(function (btn) { btn.addEventListener('click', function () { showTab(btn.dataset.tab); }); });
  $$('.seg-mini__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.symbol === chartSymbol) return;
      chartSymbol = b.dataset.symbol;
      $$('.seg-mini__btn').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
      loadChart(true);
    });
  });

  /* ---------------- SMOOTH SCROLL LINKS ---------------- */
  $$('.js-scroll').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var t = el.dataset.target || el.getAttribute('href');
      if (t.indexOf('/#') === 0) t = t.slice(1);
      goTo(t.indexOf('#') > 0 ? t.slice(t.indexOf('#')) : t);
    });
  });
  $$('.js-home').forEach(function (b) { b.addEventListener('click', function () { goTo('#top'); }); });

  /* ---------------- PRODUCTS ---------------- */
  function cardHTML(p, mobile) {
    return '<a href="' + shopUrl({ cat: p.slug }) + '" class="pcard">' +
      '<div class="pcard__media"><img src="' + p.img + '" alt="' + p.title + '" loading="lazy" /><div class="pcard__shade"></div></div>' +
      '<div class="pcard__body"><h3 class="pcard__title">' + p.title + '</h3><p class="pcard__desc">' + p.desc + '</p>' +
      '<span class="pcard__more">Xem thêm' + icon('arrow-right') + '</span></div></a>';
  }
  function renderProducts() {
    // 5 danh mục: lưới 3 + 2 (căn giữa); nhiều hơn: lưới 3 cột liên tục
    var split = PRODUCTS.length === 5 ? 3 : PRODUCTS.length;
    $('#pgrid-3').innerHTML = PRODUCTS.slice(0, split).map(function (p) { return '<div>' + cardHTML(p) + '</div>'; }).join('');
    $('#pgrid-2').innerHTML = PRODUCTS.slice(split).map(function (p) { return '<div>' + cardHTML(p) + '</div>'; }).join('');
    $('#pgrid-2').hidden = split === PRODUCTS.length;
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
    car.timer = setInterval(function () {
      if (document.hidden || !$('#pcarousel').offsetParent) return; // desktop hoặc tab ẩn
      carGo((car.i + 1) % PRODUCTS.length, 1);
    }, 3500);
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
    var startX = 0, startY = 0, dx = 0, tracking = false, dragging = false, justDragged = false, w = 0, t0 = 0;
    panel.addEventListener('click', function (ev) { if (justDragged) { ev.stopPropagation(); ev.preventDefault(); } }, true);
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
      // chặn đúng cú click phát sinh ngay sau thao tác kéo
      justDragged = true;
      setTimeout(function () { justDragged = false; }, 60);
      dragging = false;
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
      return '<div><div class="sub-row"><a href="' + shopUrl({ cat: p.slug }) + '" class="sub-row__lbl">' + p.title + '</a>' +
        '<button type="button" class="sub-row__tg js-sub3" aria-label="Mở/đóng submenu ' + p.title + '" aria-expanded="false">' + icon('chevron-down', 'chev') + '</button></div>' +
        '<div class="sub" hidden><div class="sub__list sub__list--l3">' +
        p.children.map(function (c) { return '<a href="' + shopUrl({ cat: p.slug, sub: c }) + '" class="sub-leaf">' + c + '</a>'; }).join('') +
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
  });
  $$('#drawer .js-nav-link').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var href = a.getAttribute('href');
      if (isHome && href.indexOf('/#') === 0) href = href.slice(1);
      if (href === '/' && isHome) href = '#top';
      if (href.charAt(0) !== '#') { closeMenu(function () { location.href = href; }); return; }
      closeMenu(function () { goTo(href); });
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
    closeMenu(function () { navigateShop({ q: q }); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (menuOpen) closeMenu();
    else if (chatOpen) setChat(false);
  });

  /* ---------------- LIVE CHAT ---------------- */
  var chat = $('#chat'), chatOpen = false;
  function setChat(on) {
    chatOpen = on;
    chat.classList.toggle('is-open', on);
    chat.setAttribute('aria-hidden', String(!on));
    chat.inert = !on; // panel đóng thì không nhận focus bàn phím
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
    body.innerHTML = '<div class="chat__msgs" id="chat-msgs">' +
      (chatProduct ? '<div class="chat__msg chat__msg--me">Tôi muốn được tư vấn sản phẩm: ' + esc(chatProduct.name) + ' (' + chatProduct.id + ')</div>' : '') +
      '<div class="chat__msg chat__msg--them">Xin chào ' + esc(name) + '! Nhân viên Hiệu Vàng Ngọc Diệp sẽ phản hồi trong giây lát.</div></div>';
    var compose = document.createElement('form');
    compose.className = 'chat__compose';
    compose.innerHTML = '<input type="text" class="chat__input" placeholder="Nhập tin nhắn..." aria-label="Tin nhắn" /><button type="submit" aria-label="Gửi">' + icon('send', 'i-16') + '</button>';
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

  /* ---------------- MENU NGANG DESKTOP ---------------- */
  function renderMega() {
    $('#mega-products').innerHTML = MENU_ORDER.map(function (k) {
      var p = PRODUCTS[k];
      return '<div class="mega__col">' +
        '<a href="' + shopUrl({ cat: p.slug }) + '" class="mega__thumb"><img src="' + p.img + '" alt="' + p.title + '" loading="lazy" /></a>' +
        '<a href="' + shopUrl({ cat: p.slug }) + '" class="mega__title">' + p.title + '</a>' +
        '<p class="mega__desc">' + p.desc + '</p>' +
        '<ul class="mega__list">' + p.children.map(function (c) { return '<li><a href="' + shopUrl({ cat: p.slug, sub: c }) + '">' + c + '</a></li>'; }).join('') + '</ul>' +
        '<a href="' + shopUrl({ cat: p.slug }) + '" class="mega__all">Xem tất cả' + icon('arrow-right') + '</a></div>';
    }).join('');
  }

  function initTopnav() {
    var dds = $$('#topnav .dd');
    var hoverable = window.matchMedia('(hover: hover) and (pointer: fine)');
    function setOpen(dd, on) {
      dd.classList.toggle('is-open', on);
      dd.querySelector('.dd__trigger').setAttribute('aria-expanded', String(on));
    }
    function closeAll(except) { dds.forEach(function (d) { if (d !== except) setOpen(d, false); }); }

    dds.forEach(function (dd) {
      var trigger = dd.querySelector('.dd__trigger'), timer, closedByClick = false;
      function hoverOpen() {
        if (!hoverable.matches || closedByClick || dd.classList.contains('is-open')) return;
        clearTimeout(timer);
        timer = setTimeout(function () { closeAll(dd); setOpen(dd, true); }, 80);
      }
      trigger.addEventListener('click', function () {
        clearTimeout(timer);
        var on = !dd.classList.contains('is-open');
        closeAll(dd);
        setOpen(dd, on);
        closedByClick = !on; // người dùng chủ động đóng -> không tự mở lại khi còn rê chuột
      });
      dd.addEventListener('mouseenter', hoverOpen);
      // Sau khi chọn một mục, chuột có thể vẫn "ở trong" menu nên không có mouseenter mới -> mở lại khi rê trên nút
      trigger.addEventListener('pointermove', hoverOpen);
      dd.addEventListener('mouseleave', function () {
        closedByClick = false;
        if (!hoverable.matches) return;
        clearTimeout(timer);
        timer = setTimeout(function () { setOpen(dd, false); }, 260);
      });
      // Bấm một mục trong dropdown thì đóng lại
      dd.querySelector('.dd__panel').addEventListener('click', function (e) {
        if (e.target.closest('a, button')) setOpen(dd, false);
      });
      // Bàn phím: mũi tên xuống mở và focus mục đầu
      trigger.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown') return;
        e.preventDefault();
        closeAll(dd); setOpen(dd, true);
        var first = dd.querySelector('.dd__panel a, .dd__panel button');
        if (first) first.focus();
      });
    });

    document.addEventListener('click', function (e) { if (!e.target.closest('#topnav .dd')) closeAll(); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = dds.filter(function (d) { return d.classList.contains('is-open'); })[0];
      if (open) { setOpen(open, false); open.querySelector('.dd__trigger').focus(); }
    });

    // Ô tìm kiếm mở rộng
    var hs = $('#hsearch'), hin = $('#hsearch-input'), hbtn = $('#hsearch-btn');
    function openSearch() { hs.classList.add('is-open'); hin.tabIndex = 0; hin.focus({ preventScroll: true }); }
    function closeSearch() { hs.classList.remove('is-open'); hin.tabIndex = -1; hin.value = ''; }
    hbtn.addEventListener('click', function () {
      if (!hs.classList.contains('is-open')) return openSearch();
      if (hin.value.trim()) hs.requestSubmit(); else closeSearch();
    });
    hs.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = hin.value.trim();
      if (!q) return;
      closeSearch();
      navigateShop({ q: q });
    });
    hin.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.stopPropagation(); closeSearch(); hbtn.focus(); } });
    hin.addEventListener('blur', function () { setTimeout(function () { if (!hin.value.trim() && document.activeElement !== hbtn) closeSearch(); }, 150); });

    // Đánh dấu mục đang xem khi cuộn
    var spyLinks = $$('#topnav [data-spy]');
    var sections = spyLinks.map(function (a) { return document.getElementById(a.dataset.spy); });
    var ticking = false;
    function spy() {
      ticking = false;
      var y = window.scrollY + 120, current = 'top';
      sections.forEach(function (s) { if (s && s.offsetTop <= y) current = s.id; });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = 'lien-he';
      spyLinks.forEach(function (a) { a.classList.toggle('is-active', a.dataset.spy === current); });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
    spy();
  }

  /* ---------------- LIÊN HỆ ---------------- */
  function applyContact() {
    var digits = function (v) { return v.replace(/\D/g, ''); };
    var href = {
      address: function (v) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v); },
      hotline: function (v) { return 'tel:' + digits(v); },
      zalo: function (v) { return 'https://zalo.me/' + digits(v); },
      email: function (v) { return 'mailto:' + v; },
      facebook: function (v) { return v; }
    };
    function link(el, key) {
      var v = (CONTACT[key] || '').trim();
      if (!v || !href[key]) return;
      el.href = href[key](v);
      if (key === 'address' || key === 'zalo' || key === 'facebook') { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
    }
    $$('[data-contact]').forEach(function (el) {
      var key = el.dataset.contact, v = (CONTACT[key] || '').trim();
      if (v) el.textContent = (el.dataset.contactPrefix || '') + v;
      else if (el.dataset.contactOptional !== undefined) el.hidden = true;
      if (el.tagName === 'A') link(el, key);
    });
    $$('[data-contact-link]').forEach(function (el) { link(el, el.dataset.contactLink); });
  }

  // Header nổi trên hero (trang Giới thiệu): trong suốt ở đầu trang, có nền khi cuộn
  function initOverlayHeader() {
    var h = $('#hdr-overlay');
    if (!h) return;
    var update = function () { h.classList.toggle('is-scrolled', window.scrollY > 10); };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------------- SẢN PHẨM: dữ liệu, thẻ, xem nhanh ---------------- */
  var CATALOG = window.ND_CATALOG || [];
  var CAT_BY_SLUG = {};
  PRODUCTS.forEach(function (c) { CAT_BY_SLUG[c.slug] = c; });
  function goldLabel(p) { return p.gold || ''; }
  function fold(str) { return String(str).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function productImg(p) { return '/assets/img/catalog/' + p.img + '.jpg'; }
  function findProduct(id) { return CATALOG.filter(function (p) { return p.id === id; })[0]; }

  function productCard(p, i) {
    var badge = p.gold ? '<span class="badge-gold' + (/999|24K/.test(p.gold) ? ' badge-gold--24k' : '') + '">' + p.gold.replace('Vàng ', '') + '</span>' : '';
    return '<article class="prod" style="animation-delay:' + Math.min(i || 0, 12) * 45 + 'ms">' +
      '<button type="button" class="prod__media js-qv" data-id="' + p.id + '" aria-label="Xem nhanh ' + esc(p.name) + '">' +
        '<img src="' + productImg(p) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" width="800" height="800" />' +
        '<span class="prod__badges">' + badge +
          (p.isNew ? '<span class="badge-new">Mới</span>' : '') + '</span>' +
        '<span class="prod__quick">' + icon('eye', 'i-16') + 'Xem nhanh</span>' +
      '</button>' +
      '<div class="prod__body">' +
        '<p class="prod__meta">' + p.id + ' · ' + esc(p.sub) + (p.weight ? ' · ' + p.weight : '') + '</p>' +
        '<h3 class="prod__name"><button type="button" class="js-qv" data-id="' + p.id + '">' + esc(p.name) + '</button></h3>' +
        '<button type="button" class="prod__more js-qv" data-id="' + p.id + '" tabindex="-1">Xem chi tiết' + icon('arrow-right', 'i-16') + '</button>' +
      '</div></article>';
  }

  // Cửa sổ xem nhanh (dùng chung mọi trang)
  var qv, qvList = [], qvIndex = 0, qvReturn = null, chatProduct = null;
  function buildQuickView() {
    qv = document.createElement('div');
    qv.className = 'qv'; qv.id = 'qv'; qv.hidden = true;
    qv.innerHTML =
      '<div class="qv__overlay js-qv-close"></div>' +
      '<div class="qv__panel" role="dialog" aria-modal="true" aria-labelledby="qv-title" tabindex="-1">' +
        '<button type="button" class="qv__x js-qv-close" aria-label="Đóng">' + icon('x', 'i-20') + '</button>' +
        '<div class="qv__media"><img id="qv-img" alt="" />' +
          '<button type="button" class="qv__nav qv__nav--prev" data-step="-1" aria-label="Sản phẩm trước">' + icon('chevron-down', 'i-20') + '</button>' +
          '<button type="button" class="qv__nav qv__nav--next" data-step="1" aria-label="Sản phẩm tiếp theo">' + icon('chevron-down', 'i-20') + '</button>' +
        '</div>' +
        '<div class="qv__info">' +
          '<p class="qv__crumb" id="qv-crumb"></p>' +
          '<h2 class="qv__title" id="qv-title"></h2>' +
          '<p class="qv__sku" id="qv-sku"></p>' +
          '<dl class="qv__specs" id="qv-specs"></dl>' +
          '<p class="qv__desc" id="qv-desc"></p>' +
          '<div class="qv__actions">' +
            '<button type="button" class="btn-gold qv__cta js-qv-chat">' + icon('message-circle', 'i-18') + 'Tư vấn ngay</button>' +
            '<a href="#" class="qv__ghost" data-contact-link="hotline">' + icon('phone', 'i-18') + 'Gọi đặt hàng</a>' +
          '</div>' +
          '<p class="qv__note" id="qv-note"></p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(qv);
    qv.addEventListener('click', function (e) {
      if (e.target.closest('.js-qv-close')) return closeQuickView();
      var nav = e.target.closest('.qv__nav');
      if (nav) return stepQuickView(+nav.dataset.step);
      if (e.target.closest('.js-qv-chat')) {
        chatProduct = qvList[qvIndex];
        closeQuickView();
        setTimeout(function () { askAboutProduct(chatProduct); }, 220);
      }
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest('.js-qv');
      if (!b) return;
      var grid = b.closest('[data-grid]');
      var ids = grid ? $$('.prod__media.js-qv', grid).map(function (x) { return x.dataset.id; }) : [b.dataset.id];
      openQuickView(b.dataset.id, ids);
    });
    document.addEventListener('keydown', function (e) {
      if (qv.hidden) return;
      if (e.key === 'Escape') { e.stopImmediatePropagation(); closeQuickView(); }
      else if (e.key === 'ArrowRight') stepQuickView(1);
      else if (e.key === 'ArrowLeft') stepQuickView(-1);
    }, true);
  }
  function fillQuickView(p) {
    var cat = CAT_BY_SLUG[p.cat];
    $('#qv-img').src = productImg(p); $('#qv-img').alt = p.name;
    $('#qv-crumb').innerHTML = '<a href="' + shopUrl({ cat: p.cat }) + '">' + cat.title + '</a> · <a href="' + shopUrl({ cat: p.cat, sub: p.sub }) + '">' + p.sub + '</a>';
    $('#qv-title').textContent = p.name;
    $('#qv-sku').textContent = CAT_BY_SLUG[p.cat].desc;
    var specs = [['Loại vàng', p.gold || 'Liên hệ tư vấn'], ['Trọng lượng', p.weight || 'Liên hệ tư vấn'], ['Danh mục', p.sub], ['Mã sản phẩm', p.id]];
    $('#qv-specs').innerHTML = specs.map(function (s) { return '<div><dt>' + s[0] + '</dt><dd>' + s[1] + '</dd></div>'; }).join('');
    $('#qv-desc').textContent = p.desc;
    $('#qv-note').textContent = 'Mẫu có sẵn tại cửa hàng 94-96 Lý Thái Tổ, Đà Nẵng. Nhận gia công theo yêu cầu về kiểu dáng, trọng lượng — vui lòng liên hệ để được tư vấn.';
    var many = qvList.length > 1;
    $$('.qv__nav', qv).forEach(function (n) { n.hidden = !many; });
  }
  function openQuickView(id, ids) {
    qvList = (ids || [id]).map(findProduct).filter(Boolean);
    qvIndex = Math.max(0, qvList.map(function (p) { return p.id; }).indexOf(id));
    fillQuickView(qvList[qvIndex]);
    qvReturn = document.activeElement;
    qv.hidden = false;
    reflow(qv);
    qv.classList.add('is-open');
    lockScroll(true);
    setTimeout(function () { $('.qv__panel', qv).focus({ preventScroll: true }); }, 30);
  }
  function stepQuickView(d) {
    if (qvList.length < 2) return;
    qvIndex = (qvIndex + d + qvList.length) % qvList.length;
    var media = $('.qv__media img', qv);
    media.classList.add('is-swap');
    setTimeout(function () { fillQuickView(qvList[qvIndex]); media.classList.remove('is-swap'); }, 160);
  }
  function closeQuickView() {
    if (!qv || qv.hidden) return;
    qv.classList.remove('is-open');
    setTimeout(function () {
      qv.hidden = true;
      lockScroll(false);
      if (qvReturn && qvReturn.focus && document.contains(qvReturn)) qvReturn.focus({ preventScroll: true });
    }, 220);
  }
  // Mở chat kèm sản phẩm cần tư vấn
  function askAboutProduct(p) {
    setChat(true);
    var msgs = $('#chat-msgs');
    if (msgs) {
      var m = document.createElement('div');
      m.className = 'chat__msg chat__msg--me';
      m.textContent = 'Tôi muốn được tư vấn sản phẩm: ' + p.name + ' (' + p.id + ')';
      msgs.appendChild(m);
      $('#chat-body').scrollTop = $('#chat-body').scrollHeight;
    } else {
      var greet = $('.chat__greet');
      if (greet && !$('.chat__product')) greet.insertAdjacentHTML('afterend', '<div class="chat__product"><img src="' + productImg(p) + '" alt="" /><div><b>' + esc(p.name) + '</b><span>' + p.id + ' · ' + esc(p.sub) + '</span></div></div>');
      else if ($('.chat__product')) $('.chat__product').outerHTML = '<div class="chat__product"><img src="' + productImg(p) + '" alt="" /><div><b>' + esc(p.name) + '</b><span>' + p.id + ' · ' + esc(p.sub) + '</span></div></div>';
    }
  }

  // Lưới sản phẩm với hiệu ứng chuyển
  function renderGrid(grid, items) {
    clearTimeout(grid._swap); // lần lọc mới huỷ lần chuyển cũ chưa xong -> luôn hiện kết quả mới nhất
    var html = items.map(productCard).join('');
    grid.classList.add('is-leaving');
    grid._swap = setTimeout(function () {
      grid.innerHTML = html;
      grid.classList.remove('is-leaving');
    }, grid.children.length ? 160 : 0);
  }

  /* ---------------- TRANG CHỦ: SẢN PHẨM NỔI BẬT ---------------- */
  function initFeatured() {
    var chips = $('#feat-chips'), grid = $('#feat-grid');
    if (!chips || !grid) return;
    var cats = [{ slug: '', title: 'Nổi bật' }].concat(MENU_ORDER.map(function (k) { return PRODUCTS[k]; }));
    chips.innerHTML = cats.map(function (c, i) {
      return '<button type="button" class="chip' + (i ? '' : ' is-on') + '" data-cat="' + c.slug + '" aria-pressed="' + (i ? 'false' : 'true') + '">' + c.title + '</button>';
    }).join('');
    function show(cat) {
      var items = cat ? CATALOG.filter(function (p) { return p.cat === cat; }) : CATALOG.filter(function (p) { return p.featured; });
      renderGrid(grid, items.slice(0, 8));
      $('#feat-more').href = shopUrl({ cat: cat });
    }
    chips.addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (!c || c.classList.contains('is-on')) return;
      $$('.chip', chips).forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
      show(c.dataset.cat);
    });
    show('');
  }

  /* ---------------- TRANG DANH SÁCH SẢN PHẨM ---------------- */
  function initShop() {
    var grid = $('#shop-grid');
    if (!grid) return;
    var st = {};
    var qIn = $('#shop-q'), sortSel = $('#shop-sort');
    function setState(p) {
      st = { cat: p.cat || '', sub: p.sub || '', q: p.q || '', sort: p.sort === 'new' ? 'new' : 'featured' };
      if (st.cat && !CAT_BY_SLUG[st.cat]) st.cat = '';
      if (st.sub && (!st.cat || CAT_BY_SLUG[st.cat].children.indexOf(st.sub) < 0)) st.sub = '';
      qIn.value = st.q; sortSel.value = st.sort;
    }
    function paramsOf(search) {
      var u = new URLSearchParams(search), o = {};
      ['cat', 'sub', 'q', 'gold', 'sort'].forEach(function (k) { o[k] = u.get(k) || ''; });
      return o;
    }
    setState(paramsOf(location.search));

    function matches(p, ignoreCat) {
      if (!ignoreCat && st.cat && p.cat !== st.cat) return false;
      if (!ignoreCat && st.sub && p.sub !== st.sub) return false;
      if (st.q) {
        var hay = fold([p.name, p.id, p.sub, p.desc, CAT_BY_SLUG[p.cat].title, goldLabel(p)].join(' '));
        if (fold(st.q).split(/\s+/).some(function (w) { return w && hay.indexOf(w) < 0; })) return false;
      }
      return true;
    }
    function sortItems(items) {
      var by = {
        'new': function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); },
        'featured': function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); }
      }[st.sort];
      return items.slice().sort(by);
    }
    function syncUrl(push) {
      var u = shopUrl({ cat: st.cat, sub: st.sub, q: st.q, sort: st.sort === 'featured' ? '' : st.sort });
      if (u === '/san-pham' + location.search) return;
      if (push) history.pushState(null, '', u); else history.replaceState(null, '', u);
    }
    // Đánh dấu mục đang xem trong menu (mega + drawer)
    function markNav() {
      $$('#mega-products a, #nav-products a').forEach(function (a) {
        var p = paramsOf(a.getAttribute('href').split('?')[1] || '');
        var on = !st.q && p.cat === st.cat && p.sub === st.sub && !!st.cat;
        a.classList.toggle('is-current', on);
        if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      });
    }
    function render(push) {
      // chip danh mục
      var base = CATALOG.filter(function (p) { return matches(p, true); });
      var cats = [{ slug: '', title: 'Tất cả' }].concat(MENU_ORDER.map(function (k) { return PRODUCTS[k]; }));
      $('#shop-cats').innerHTML = cats.map(function (c) {
        var n = base.filter(function (p) { return !c.slug || p.cat === c.slug; }).length;
        return '<button type="button" class="chip' + (st.cat === c.slug ? ' is-on' : '') + '" data-cat="' + c.slug + '" aria-pressed="' + (st.cat === c.slug) + '">' + c.title + '<span class="chip__n">' + n + '</span></button>';
      }).join('');
      // chip danh mục con
      var subsWrap = $('#shop-subs');
      if (st.cat) {
        var inCat = base.filter(function (p) { return p.cat === st.cat; });
        var subs = CAT_BY_SLUG[st.cat].children.filter(function (c) { return inCat.some(function (p) { return p.sub === c; }); });
        subsWrap.innerHTML = ['<button type="button" class="chip chip--sm' + (!st.sub ? ' is-on' : '') + '" data-sub="">Tất cả</button>'].concat(subs.map(function (c) {
          return '<button type="button" class="chip chip--sm' + (st.sub === c ? ' is-on' : '') + '" data-sub="' + c + '">' + c + '</button>';
        })).join('');
        subsWrap.hidden = false;
      } else { subsWrap.hidden = true; subsWrap.innerHTML = ''; }
      // tiêu đề
      var title = st.sub || (st.cat ? CAT_BY_SLUG[st.cat].title : 'Tất cả sản phẩm');
      $('#shop-title').innerHTML = st.q ? 'Kết quả cho “<span class="gold-text">' + esc(st.q) + '</span>”' : esc(title);
      $('#shop-crumb-cur').textContent = st.cat ? CAT_BY_SLUG[st.cat].title : 'Sản phẩm';
      document.title = (st.q ? 'Tìm “' + st.q + '”' : title) + ' | Hiệu Vàng Ngọc Diệp';
      // lưới
      var items = sortItems(CATALOG.filter(function (p) { return matches(p); }));
      $('#shop-count').textContent = items.length + ' sản phẩm';
      $('#shop-empty').hidden = items.length > 0;
      renderGrid(grid, items);
      syncUrl(push);
      markNav();
    }
    $('#shop-cats').addEventListener('click', function (e) {
      var c = e.target.closest('.chip'); if (!c) return;
      st.cat = c.dataset.cat; st.sub = ''; render(true);
    });
    $('#shop-subs').addEventListener('click', function (e) {
      var c = e.target.closest('.chip'); if (!c) return;
      st.sub = c.dataset.sub; render(true);
    });
    var t;
    qIn.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { st.q = qIn.value.trim(); render(); }, 220); });
    $('#shop-search').addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(t); st.q = qIn.value.trim(); render(); });
    sortSel.addEventListener('change', function () { st.sort = sortSel.value; render(); });
    $$('.js-shop-reset').forEach(function (b) { b.addEventListener('click', function () {
      st = { cat: '', sub: '', q: '', sort: 'featured' };
      qIn.value = ''; sortSel.value = 'featured'; render(true);
    }); });

    // Điều hướng tới trang sản phẩm khi đang ở chính trang này: lọc tại chỗ, không tải lại trang
    shopApply = function (p, push) {
      setState(p);
      render(push);
      var top = $('.shop-hero').getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > top + 40) window.scrollTo({ top: top, behavior: 'smooth' });
    };
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a[href]');
      if (!a || a.target === '_blank') return;
      var url = new URL(a.getAttribute('href'), location.href);
      if (url.origin !== location.origin || !/^\/san-pham\/?$/.test(url.pathname)) return;
      e.preventDefault();
      var p = paramsOf(url.search);
      if (menuOpen) closeMenu(function () { shopApply(p, true); });
      else shopApply(p, true);
    });
    window.addEventListener('popstate', function () { setState(paramsOf(location.search)); render(false); });
    render(false);
  }

  /* ---------------- INIT ---------------- */
  buildQuickView();
  applyContact();
  if (isHome) {
    renderTicker();
    renderTables();
    stamp();
    loadPrices();
    if (location.hash === '#gia-bac') { showTab('silver'); setTimeout(function () { smoothTo('#bang-gia'); }, 60); }
    renderProducts();
    initCarousel();
  }
  renderMenuProducts();
  renderMega();
  initTopnav();
  initOverlayHeader();
  initFeatured();
  initShop();
})();
