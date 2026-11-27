/* 안동얀마농기계 영업용 링크 화면 · v1 (2026-11-27)
 * 주소: https://ay-9090.github.io/고객코드  (문자 링크) · https://ay-9090.github.io/?r=소개자코드 (이웃 공유)
 * 묻는 곳: 통합앱 SalesLink.gs (?app=sales) — 이 화면은 손님 정보를 저장하지 않는다 (고객코드만 이 폰에 기억)
 */
(function () {
  'use strict';
  var API = 'https://script.google.com/macros/s/AKfycbzqba8hKPS6CQFwZhgsP9z9tAmQT9g5W6Actuaok_hBUyUeFrdknsGMENH8WPg4E_yY/exec';
  var SITE = 'https://ay-9090.github.io/';
  var CLS = {
    '트랙터': ['모름', '10-19 hp', '20-29 hp', '30-39 hp', '40-49 hp', '50-59 hp', '60-69 hp', '70-79 hp', '80-89 hp', '90-99 hp', '100-109hp', '110-119hp', '120-129hp', '130-139hp', '140-149hp', '150-159hp'],
    '콤바인': ['모름', '2조식', '3조식', '4조식', '5조식', '6조식', '7조식', '보통형'],
    '이앙기': ['모름', '4조식', '6조식', '8조식']
  };
  var CLS_LABEL = function (c) { return c.indexOf('hp') > 0 ? c.replace(/\s?hp$/, '').replace('-', '~') + '마력' : c; };

  var $ = function (id) { return document.getElementById(id); };
  var st = { code: '', ref: '', known: false, yanmar: false, name: '', tMode: '보상가', photos: [], uses: ['논 (벼농사)'], when: '내년 봄 전', busy: false };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k) || ''; localStorage.setItem(k, v); } catch (e) { return ''; } }

  /* ---------- 주소에서 코드 ---------- */
  var path = location.pathname.replace(/^\/+|\/+$/g, '');
  if (/^[A-Za-z0-9]{3,8}$/.test(path)) st.code = path;
  var q = new URLSearchParams(location.search);
  if (/^[A-Za-z0-9]{3,8}$/.test(q.get('r') || '')) st.ref = q.get('r');
  if (!st.code && !st.ref) st.code = store('ay_code');   // 홈 화면 아이콘으로 열 때
  if (st.code) store('ay_code', st.code);

  /* ---------- 서버 ---------- */
  function get(params) {
    var u = API + '?app=sales&' + Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(u).then(function (r) { return r.json(); });
  }
  function post(body) {
    body.app = 'sales';
    return fetch(API, { method: 'POST', body: JSON.stringify(body) }).then(function (r) { return r.json(); });
  }

  /* ---------- 화면 바꾸기 ---------- */
  var VIEWS = ['home', 'trade', 'quote', 'ask', 'done'];
  function go(v) {
    VIEWS.forEach(function (x) { $('v-' + x).classList.toggle('hide', x !== v); });
    window.scrollTo(0, 0);
    if (v !== 'home' && history.state !== v) history.pushState(v, '');
  }
  window.addEventListener('popstate', function (e) { var v = e.state; VIEWS.forEach(function (x) { $('v-' + x).classList.toggle('hide', x !== (v || 'home')); }); });
  document.querySelectorAll('[data-go]').forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-go')); }); });

  /* ---------- 인사 ---------- */
  function showWho() { document.querySelectorAll('.who').forEach(function (w) { w.classList.toggle('hide', st.known); }); }
  showWho();
  if (st.code) {
    get({ a: 'hello', c: st.code }).then(function (r) {
      if (!r || !r.ok || !r.known) { st.known = false; showWho(); return; }
      st.known = true; st.yanmar = !!r.yanmar; st.name = r.name || '';
      if (st.name) $('hello').textContent = st.name + '님, 반갑습니다';
      $('hello-sub').textContent = '궁금하신 것을 하나 눌러 보세요. 이름 · 번호는 따로 적지 않으셔도 됩니다.';
      $('app-btn').classList.toggle('hide', !st.yanmar);
      showWho();
    }).catch(function () { showWho(); });
  }

  /* ---------- 이웃 공유 (소개자 코드만, 손님 정보 없음) ---------- */
  var shareUrl = SITE + (st.code ? '?r=' + st.code : '');
  var shareText = '안동얀마농기계 — 내 기계 중고시세 확인 · 보조사업 기종 견적';
  $('share-sms').href = 'sms:?&body=' + encodeURIComponent(shareText + '\n' + shareUrl);
  $('share-kakao').addEventListener('click', function () {
    if (navigator.share) { navigator.share({ title: '안동얀마농기계', text: shareText, url: shareUrl }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(shareText + '\n' + shareUrl); alert('링크를 복사했어요. 카카오톡 대화방에 붙여 넣어 주세요.'); }
    catch (e) { prompt('이 링크를 복사해서 보내 주세요', shareUrl); }
  });

  /* ---------- 홈 화면에 추가 ---------- */
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
  $('app-btn').addEventListener('click', function () {
    if (deferred) { deferred.prompt(); deferred = null; return; }
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    $('a2hs-txt').innerHTML = ios
      ? '사파리 아래쪽 <b>공유 버튼(네모에 화살표)</b> → <b>「홈 화면에 추가」</b> → 오른쪽 위 <b>「추가」</b>를 눌러 주세요.'
      : '오른쪽 위 <b>점 세 개(⋮)</b> → <b>「홈 화면에 추가」</b> 또는 <b>「앱 설치」</b>를 눌러 주세요.';
    $('a2hs').classList.remove('hide');
  });
  $('a2hs-close').addEventListener('click', function () { $('a2hs').classList.add('hide'); });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});

  /* ---------- 보상가 · 위탁 ---------- */
  document.querySelectorAll('#t-mode .mode').forEach(function (b) {
    b.addEventListener('click', function () {
      st.tMode = b.getAttribute('data-v');
      document.querySelectorAll('#t-mode .mode').forEach(function (x) { x.classList.toggle('on', x === b); });
      var cons = st.tMode === '위탁';
      $('t-want-wrap').classList.toggle('hide', !cons);
      $('t-send').textContent = cons ? '위탁 판매 상담 신청' : '정확한 보상가 연락 받기';
      $('t-photo-hint').textContent = cons ? '위탁 판매 사진은 매물 사진으로 그대로 쓰여요 · 최대 10장 (앞 · 옆 · 뒤 · 계기판 · 엔진 · 타이어 · 작업기)' : '사진이 있으면 보상가를 더 정확하게 알려 드릴 수 있어요 · 최대 5장';
    });
  });
  function fillCls() {
    var k = $('t-kind').value, list = CLS[k] || ['모름'];
    $('t-cls').innerHTML = list.map(function (c) { return '<option value="' + (c === '모름' ? '' : c) + '">' + (c === '모름' ? '모름' : CLS_LABEL(c)) + '</option>'; }).join('');
    $('t-cls').disabled = !CLS[k];
    $('t-kind-etc').classList.toggle('hide', k.indexOf('기타') !== 0);
  }
  fillCls();
  $('t-kind').addEventListener('change', function () { fillCls(); askPrice(); });
  var priceTimer = null, shown = '';
  function askPrice() {
    clearTimeout(priceTimer);
    priceTimer = setTimeout(function () {
      var y = $('t-year').value.replace(/[^0-9]/g, '');
      if (!/^(19|20)\d\d$/.test(y)) { shown = ''; $('t-price-v').textContent = '연식 · 사용 시간을 넣으면 보여 드려요'; return; }
      $('t-price-v').textContent = '찾는 중…';
      get({ a: 'price', model: $('t-model').value, year: y, hours: $('t-hours').value, brand: $('t-brand').value, kind: $('t-kind').value, cls: $('t-cls').value })
        .then(function (r) {
          shown = (r && r.price) ? String(r.price) : '';
          $('t-price-v').textContent = shown ? '약 ' + Number(shown).toLocaleString('ko-KR') + '만원부터' : '기계를 보고 정확히 알려 드려요';
        }).catch(function () { shown = ''; $('t-price-v').textContent = '기계를 보고 정확히 알려 드려요'; });
    }, 500);
  }
  ['t-model', 't-year', 't-hours'].forEach(function (id) { $(id).addEventListener('input', function () { $(id).classList.remove('err'); askPrice(); }); });
  ['t-brand', 't-cls'].forEach(function (id) { $(id).addEventListener('change', askPrice); });

  /* 사진: 폰에서 1280px 로 줄여서 한 장씩 올림 */
  function addFiles(files) {
    var max = st.tMode === '위탁' ? 10 : 5;
    Array.prototype.slice.call(files || []).forEach(function (file) {
      if (st.photos.length >= max) return;
      var ph = { id: '', state: 'up', url: '' }; st.photos.push(ph); drawThumbs();
      shrink(file).then(function (dataUrl) {
        ph.url = dataUrl; drawThumbs();
        return post({ a: 'photo', c: st.code, key: st.code || deviceKey(), name: st.name, mime: 'image/jpeg', data: dataUrl });
      }).then(function (r) { ph.state = (r && r.ok) ? 'ok' : 'fail'; ph.id = (r && r.id) || ''; drawThumbs(); })
        .catch(function () { ph.state = 'fail'; drawThumbs(); });
    });
  }
  function deviceKey() { var k = store('ay_dev'); if (!k) { k = Math.random().toString(36).slice(2, 12); store('ay_dev', k); } return k; }
  function shrink(file) {
    return new Promise(function (ok, no) {
      var img = new Image(), rd = new FileReader();
      rd.onload = function () { img.src = rd.result; };
      rd.onerror = no;
      img.onload = function () {
        var s = Math.min(1, 1280 / Math.max(img.width, img.height));
        var cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        ok(cv.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = no;
      rd.readAsDataURL(file);
    });
  }
  function drawThumbs() {
    $('t-thumbs').innerHTML = st.photos.map(function (p, i) {
      var label = p.state === 'up' ? '올리는 중' : p.state === 'fail' ? '실패 · 눌러서 빼기' : '';
      return '<div data-i="' + i + '" style="' + (p.url ? 'background-image:url(' + p.url + ')' : '') + '">' + (label ? '<span style="background:rgba(255,255,255,.85);padding:2px 4px;border-radius:4px">' + label + '</span>' : '') + '</div>';
    }).join('');
    $('t-thumbs').querySelectorAll('div').forEach(function (d) {
      d.addEventListener('click', function () { var i = +d.getAttribute('data-i'); if (st.photos[i] && st.photos[i].state !== 'up') { st.photos.splice(i, 1); drawThumbs(); } });
    });
  }
  $('t-cam').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });
  $('t-pick').addEventListener('change', function (e) { addFiles(e.target.files); e.target.value = ''; });

  function err(id, msg) { $(id).textContent = msg; $(id).classList.toggle('hide', !msg); }

  $('t-send').addEventListener('click', function () {
    if (st.busy) return;
    var y = $('t-year').value.trim(), h = $('t-hours').value.trim();
    $('t-year').classList.toggle('err', !y); $('t-hours').classList.toggle('err', !h);
    if (!y || !h) { err('t-err', '연식과 사용 시간을 꼭 적어 주세요.'); return; }
    if (!st.known && !$('t-phone').value.trim()) { err('t-err', '연락받으실 휴대폰 번호를 적어 주세요.'); return; }
    if (st.photos.some(function (p) { return p.state === 'up'; })) { err('t-err', '사진을 올리는 중이에요. 잠시만 기다려 주세요.'); return; }
    err('t-err', '');
    var kind = $('t-kind').value.indexOf('기타') === 0 ? ($('t-kind-etc').value.trim() || '기타') : $('t-kind').value;
    send('t', {
      type: st.tMode, kind: kind, brand: $('t-brand').value, model: $('t-model').value, cls: $('t-cls').value ? CLS_LABEL($('t-cls').value) : '',
      year: y, hours: h, want: st.tMode === '위탁' ? $('t-want').value : '', shown: shown,
      photos: st.photos.filter(function (p) { return p.state === 'ok' && p.id; }).map(function (p) { return p.id; }),
      name: $('t-name').value, phone: $('t-phone').value, hp: $('t-hp').value, ad: $('t-ad').checked
    }, st.tMode === '위탁' ? '사장님이 확인하고 곧 연락드릴게요.<br>기계를 보러 찾아뵙겠습니다.' : '사장님이 확인하고 곧 연락드릴게요.<br>찾아뵙고 기계를 직접 봐 드립니다.');
  });

  /* ---------- 견적 ---------- */
  function pills(id, list, isOn, onPick) {
    $(id).innerHTML = list.map(function (x) { return '<button type="button" class="pill' + (isOn(x) ? ' on' : '') + '">' + x + '</button>'; }).join('');
    $(id).querySelectorAll('.pill').forEach(function (b, i) { b.addEventListener('click', function () { onPick(list[i]); }); });
  }
  var USES = ['논 (벼농사)', '밭', '과수원', '축산 · 조사료', '시설 하우스', '기타'], WHENS = ['올해 안', '내년 봄 전', '알아보는 중'];
  function drawQuote() {
    pills('q-uses', USES, function (u) { return st.uses.indexOf(u) >= 0; }, function (u) {
      var i = st.uses.indexOf(u); if (i >= 0) st.uses.splice(i, 1); else st.uses.push(u); drawQuote();
    });
    pills('q-when', WHENS, function (w) { return w === st.when; }, function (w) { st.when = w; drawQuote(); });
    var k = $('q-kind').value, etc = k.indexOf('작업기') === 0;
    $('q-kind-etc').classList.toggle('hide', !etc);
    $('q-kind-show').textContent = etc ? '작업기' : k;
  }
  drawQuote();
  $('q-kind').addEventListener('change', drawQuote);
  $('q-send').addEventListener('click', function () {
    if (st.busy) return;
    if (!st.known && !$('q-phone').value.trim()) { err('q-err', '연락받으실 휴대폰 번호를 적어 주세요.'); return; }
    err('q-err', '');
    var k = $('q-kind').value, kind = k.indexOf('작업기') === 0 ? ($('q-kind-etc').value.trim() || '작업기') : k;
    send('q', {
      type: '견적', kind: kind, model: $('q-model').value, uses: st.uses.join(', '), scale: $('q-scale').value, when: st.when,
      name: $('q-name').value, phone: $('q-phone').value, hp: $('q-hp').value, ad: $('q-ad').checked
    }, '사장님이 확인하고 곧 연락드릴게요.<br>쓰실 곳에 맞는 기종으로 견적을 드립니다.');
  });

  /* ---------- 보내기 ---------- */
  function send(pre, f, doneMsg) {
    st.busy = true;
    var btn = $(pre + '-send'), label = btn.textContent;
    btn.disabled = true; btn.textContent = '보내는 중…';
    var memo = [];
    if (f.ad) memo.push('광고 수신 동의: 예');
    if (st.ref) memo.push('소개자 코드 ' + st.ref);
    f.memo = memo.join(' / ');
    f.a = 'apply'; f.c = st.code;
    delete f.ad;
    post(f).then(function (r) {
      if (r && r.ok) { $('done-msg').innerHTML = doneMsg; go('done'); }
      else err(pre + '-err', (r && (r.message || r.error)) || '신청을 남기지 못했어요. 054-855-9090 으로 전화 주세요.');
    }).catch(function () {
      err(pre + '-err', '인터넷이 약해서 보내지 못했어요. 잠시 뒤 다시 눌러 주시거나 054-855-9090 으로 전화 주세요.');
    }).then(function () { st.busy = false; btn.disabled = false; btn.textContent = label; });
  }
})();
