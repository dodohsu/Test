/* ─────────────────────────────────────────────
   JBridge.ai — Terminal Pro v2 Dashboard
   Shared interactions: sidebar drawer, copy, hero video
   ───────────────────────────────────────────── */

(function () {
  // Mobile sidebar drawer
  var hamburger = document.getElementById('hamburger');
  var sidebar   = document.getElementById('sidebar');
  var backdrop  = document.getElementById('sidebarBackdrop');

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    if (hamburger) hamburger.classList.remove('active');
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function toggleSidebar() {
    if (!sidebar) return;
    var open = sidebar.classList.toggle('open');
    if (hamburger) hamburger.classList.toggle('active', open);
    if (hamburger) hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (hamburger) hamburger.addEventListener('click', toggleSidebar);
  if (backdrop)  backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  // Copy-to-clipboard buttons (data-copy="text" or data-copy-target="#selector")
  document.querySelectorAll('[data-copy], [data-copy-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      if (!text) {
        var sel = btn.getAttribute('data-copy-target');
        var el = sel && document.querySelector(sel);
        if (el) text = (el.value !== undefined ? el.value : el.textContent || '').trim();
      }
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { flashCopied(btn); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', '');
        ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); flashCopied(btn); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });
  function flashCopied(btn) {
    var original = btn.getAttribute('data-label-original');
    if (original === null) {
      btn.setAttribute('data-label-original', btn.innerHTML);
      original = btn.innerHTML;
    }
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg> Copied';
    setTimeout(function () {
      btn.innerHTML = original;
      btn.removeAttribute('data-label-original');
    }, 1500);
  }

  // Reveal-secret toggles (data-toggle-secret="#id")
  document.querySelectorAll('[data-toggle-secret]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var sel = btn.getAttribute('data-toggle-secret');
      var el = sel && document.querySelector(sel);
      if (!el) return;
      var hidden = el.getAttribute('data-hidden') !== 'false';
      if (hidden) {
        el.textContent = el.getAttribute('data-real') || el.textContent;
        el.setAttribute('data-hidden', 'false');
        btn.setAttribute('aria-label', 'Hide secret');
      } else {
        el.textContent = el.getAttribute('data-mask') || '••••••••';
        el.setAttribute('data-hidden', 'true');
        btn.setAttribute('aria-label', 'Show secret');
      }
    });
  });

  // Tab switching (data-tab-group on container, data-tab/data-tab-panel)
  document.querySelectorAll('[data-tab-group]').forEach(function (group) {
    var tabs = group.querySelectorAll('[data-tab]');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        var key = tab.getAttribute('data-tab');
        tabs.forEach(function (t) {
          t.classList.toggle('active', t === tab);
        });
        var panels = document.querySelectorAll('[data-tab-panel]');
        panels.forEach(function (p) {
          p.hidden = (p.getAttribute('data-tab-panel') !== key);
        });
      });
    });
  });
}());

/* Theme + Language + Logout + i18n — combined IIFE so they share scope */
(function () {
  var html = document.documentElement;

  /* ─────────── i18n dictionary ─────────── */
  var I18N = {
    'en': {
      'nav.overview': 'Overview',
      'nav.logs': 'Logs',
      'nav.api_keys': 'API Keys',
      'nav.credits': 'Credits',
      'nav.referral': 'Referral',
      'nav.quickstart': 'Quickstart',
      'nav.account': 'Account',
      'nav.security': 'Security',
      'nav.group.workspace': 'Workspace',
      'nav.group.get_started': 'Get started',
      'nav.group.settings': 'Settings',
      'side.home': 'Home',
      'side.logout': 'Sign out',
      'side.theme.go_light': 'Light',
      'side.theme.go_dark': 'Dark',
      'side.status.ok': 'all systems operational',
      'topnav.docs': 'Docs',
      'page.dashboard.welcome': 'Welcome back, ',
      'page.logs.title': 'Request logs',
      'page.logs.sub': 'Live stream of every request routed through your gateway. Retained for 30 days.',
      'page.api_keys.title': 'API keys',
      'page.api_keys.sub': 'Authenticate requests to the JBridge gateway. Store keys securely — they are shown in full only once at creation.',
      'page.credits.title': 'Credits & billing',
      'page.credits.sub': 'Pay-as-you-go. No subscriptions. Add credits anytime and consume by tokens used.',
      'page.referral.title': 'Refer & earn',
      'page.referral.sub': 'Invite developers to JBridge. You both receive $5 in credits when they spend their first $5.',
      'page.quickstart.title.prefix': 'Ship your first request in',
      'page.quickstart.title.shimmer': '60 seconds',
      'page.quickstart.sub': "Drop-in compatible with OpenAI and Anthropic SDKs. Change your base URL — that's it.",
      'page.account.title': 'Account',
      'page.account.sub': 'Your profile, contact email, and workspace preferences.',
      'page.security.title': 'Security',
      'page.security.sub': 'Password, two-factor authentication, active sessions and login history.',
      'logout.confirm': 'Sign out of JBridge?'
    },
    'zh-TW': {
      'nav.overview': '總覽',
      'nav.logs': '請求日誌',
      'nav.api_keys': 'API 金鑰',
      'nav.credits': '點數',
      'nav.referral': '推薦獎勵',
      'nav.quickstart': '快速開始',
      'nav.account': '帳號',
      'nav.security': '安全',
      'nav.group.workspace': '工作區',
      'nav.group.get_started': '開始使用',
      'nav.group.settings': '設定',
      'side.home': '首頁',
      'side.logout': '登出',
      'side.theme.go_light': '淺色',
      'side.theme.go_dark': '深色',
      'side.status.ok': '系統運作正常',
      'topnav.docs': '文件',
      'page.dashboard.welcome': '歡迎回來，',
      'page.logs.title': '請求日誌',
      'page.logs.sub': '所有經由閘道的請求即時串流，保留 30 天。',
      'page.api_keys.title': 'API 金鑰',
      'page.api_keys.sub': '用於驗證對 JBridge 閘道的請求。請妥善保存——金鑰僅在建立時完整顯示一次。',
      'page.credits.title': '點數與帳單',
      'page.credits.sub': '隨用隨付，無訂閱綁約。隨時加值，依使用量扣抵。',
      'page.referral.title': '推薦好友賺取',
      'page.referral.sub': '邀請開發者加入 JBridge。當他們首次消費滿 $5，雙方各獲得 $5 點數。',
      'page.quickstart.title.prefix': '在',
      'page.quickstart.title.shimmer': '60 秒',
      'page.quickstart.sub': '與 OpenAI 和 Anthropic SDK 完全相容。改一行 base URL 即可上線。',
      'page.account.title': '帳號',
      'page.account.sub': '你的個人檔案、聯絡 Email 與工作區偏好設定。',
      'page.security.title': '安全',
      'page.security.sub': '密碼、雙因素驗證、目前登入裝置與登入紀錄。',
      'logout.confirm': '確定要登出 JBridge 嗎？'
    },
    'zh-CN': {
      'nav.overview': '总览',
      'nav.logs': '请求日志',
      'nav.api_keys': 'API 密钥',
      'nav.credits': '积分',
      'nav.referral': '推荐奖励',
      'nav.quickstart': '快速开始',
      'nav.account': '账号',
      'nav.security': '安全',
      'nav.group.workspace': '工作区',
      'nav.group.get_started': '开始使用',
      'nav.group.settings': '设置',
      'side.home': '首页',
      'side.logout': '退出登录',
      'side.theme.go_light': '浅色',
      'side.theme.go_dark': '深色',
      'side.status.ok': '系统运行正常',
      'topnav.docs': '文档',
      'page.dashboard.welcome': '欢迎回来，',
      'page.logs.title': '请求日志',
      'page.logs.sub': '所有经由网关的请求实时流式呈现，保留 30 天。',
      'page.api_keys.title': 'API 密钥',
      'page.api_keys.sub': '用于验证对 JBridge 网关的请求。请妥善保存——密钥仅在创建时完整显示一次。',
      'page.credits.title': '积分与账单',
      'page.credits.sub': '即用即付，无订阅绑约。随时充值，按用量扣减。',
      'page.referral.title': '推荐好友赚取',
      'page.referral.sub': '邀请开发者加入 JBridge。当他们首次消费满 $5，双方各获得 $5 积分。',
      'page.quickstart.title.prefix': '在',
      'page.quickstart.title.shimmer': '60 秒',
      'page.quickstart.sub': '与 OpenAI 和 Anthropic SDK 完全兼容。改一行 base URL 即可上线。',
      'page.account.title': '账号',
      'page.account.sub': '你的个人资料、联系邮箱与工作区偏好设置。',
      'page.security.title': '安全',
      'page.security.sub': '密码、双因素验证、当前登录设备与登录记录。',
      'logout.confirm': '确定要退出 JBridge 吗？'
    },
    'ja': {
      'nav.overview': '概要',
      'nav.logs': 'ログ',
      'nav.api_keys': 'API キー',
      'nav.credits': 'クレジット',
      'nav.referral': '紹介',
      'nav.quickstart': 'クイックスタート',
      'nav.account': 'アカウント',
      'nav.security': 'セキュリティ',
      'nav.group.workspace': 'ワークスペース',
      'nav.group.get_started': '始める',
      'nav.group.settings': '設定',
      'side.home': 'ホーム',
      'side.logout': 'サインアウト',
      'side.theme.go_light': 'ライト',
      'side.theme.go_dark': 'ダーク',
      'side.status.ok': 'すべてのシステムが正常に稼働中',
      'topnav.docs': 'ドキュメント',
      'page.dashboard.welcome': 'おかえりなさい、',
      'page.logs.title': 'リクエストログ',
      'page.logs.sub': 'ゲートウェイを通るすべてのリクエストのライブストリーム。30 日間保持。',
      'page.api_keys.title': 'API キー',
      'page.api_keys.sub': 'JBridge ゲートウェイへのリクエストを認証します。キーは作成時に一度だけ完全表示されます。',
      'page.credits.title': 'クレジットと請求',
      'page.credits.sub': '従量課金。サブスク不要。いつでもクレジットを追加し、トークン単位で消費。',
      'page.referral.title': '紹介して獲得',
      'page.referral.sub': '開発者を JBridge に招待しましょう。初回 $5 利用で双方に $5 のクレジット。',
      'page.quickstart.title.prefix': '初リクエストまで',
      'page.quickstart.title.shimmer': '60 秒',
      'page.quickstart.sub': 'OpenAI と Anthropic SDK とドロップイン互換。ベース URL を変更するだけ。',
      'page.account.title': 'アカウント',
      'page.account.sub': 'プロフィール、連絡先メール、ワークスペース設定。',
      'page.security.title': 'セキュリティ',
      'page.security.sub': 'パスワード、二要素認証、アクティブセッション、ログイン履歴。',
      'logout.confirm': 'JBridge からサインアウトしますか？'
    },
    'ko': {
      'nav.overview': '개요',
      'nav.logs': '로그',
      'nav.api_keys': 'API 키',
      'nav.credits': '크레딧',
      'nav.referral': '추천',
      'nav.quickstart': '빠른 시작',
      'nav.account': '계정',
      'nav.security': '보안',
      'nav.group.workspace': '워크스페이스',
      'nav.group.get_started': '시작하기',
      'nav.group.settings': '설정',
      'side.home': '홈',
      'side.logout': '로그아웃',
      'side.theme.go_light': '라이트',
      'side.theme.go_dark': '다크',
      'side.status.ok': '모든 시스템 정상 작동',
      'topnav.docs': '문서',
      'page.dashboard.welcome': '돌아오신 것을 환영합니다, ',
      'page.logs.title': '요청 로그',
      'page.logs.sub': '게이트웨이를 통과하는 모든 요청의 라이브 스트림. 30일간 보관.',
      'page.api_keys.title': 'API 키',
      'page.api_keys.sub': 'JBridge 게이트웨이 요청을 인증합니다. 생성 시 한 번만 전체 키가 표시됩니다.',
      'page.credits.title': '크레딧 및 결제',
      'page.credits.sub': '사용한 만큼 결제. 구독 없음. 언제든 크레딧을 추가하고 토큰 단위로 차감.',
      'page.referral.title': '추천하고 적립',
      'page.referral.sub': '개발자를 JBridge에 초대하세요. 첫 $5 사용 시 양쪽 모두 $5 크레딧.',
      'page.quickstart.title.prefix': '첫 요청까지',
      'page.quickstart.title.shimmer': '60초',
      'page.quickstart.sub': 'OpenAI 및 Anthropic SDK와 드롭인 호환. base URL만 변경하면 됩니다.',
      'page.account.title': '계정',
      'page.account.sub': '프로필, 연락처 이메일, 워크스페이스 환경설정.',
      'page.security.title': '보안',
      'page.security.sub': '비밀번호, 2단계 인증, 활성 세션 및 로그인 기록.',
      'logout.confirm': 'JBridge에서 로그아웃하시겠습니까?'
    }
  };

  var LANG_NATIVE = {
    'en':    'English',
    'zh-TW': '繁體中文',
    'zh-CN': '简体中文',
    'ja':    '日本語',
    'ko':    '한국어'
  };

  function currentLang() {
    var l = html.getAttribute('lang') || 'en';
    if (I18N[l]) return l;
    if (l.toLowerCase().indexOf('zh') === 0) return 'zh-TW';
    return 'en';
  }
  function t(key) {
    var d = I18N[currentLang()] || I18N.en;
    return (d[key] !== undefined) ? d[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
  }
  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    syncThemeLabel();
  }

  /* ─────────── Theme toggle ─────────── */
  /* Icon visibility is CSS-driven via html[data-theme]; JS only updates label + aria-pressed. */
  var themeBtn   = document.querySelector('[data-theme-toggle]');
  var themeLabel = themeBtn && themeBtn.querySelector('[data-theme-label]');
  function syncThemeLabel() {
    if (!themeLabel) return;
    var light = html.getAttribute('data-theme') === 'light';
    themeLabel.textContent = light ? t('side.theme.go_dark') : t('side.theme.go_light');
    if (themeBtn) themeBtn.setAttribute('aria-pressed', light ? 'true' : 'false');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      try { localStorage.setItem('jb-theme', next); } catch (e) {}
      syncThemeLabel();
    });
  }

  /* ─────────── Language dropdown ─────────── */
  var langBtn   = document.querySelector('[data-lang-toggle]');
  var langMenu  = document.querySelector('.side-lang-menu');
  var langLabel = langBtn && langBtn.querySelector('[data-lang-label]');

  function syncLangSelected() {
    if (!langMenu) return;
    var cur = currentLang();
    var items = langMenu.querySelectorAll('[role="option"]');
    items.forEach(function (li) {
      li.setAttribute('aria-selected', li.getAttribute('data-lang') === cur ? 'true' : 'false');
      li.setAttribute('tabindex', '-1');
    });
    if (langLabel) langLabel.textContent = LANG_NATIVE[cur] || 'English';
  }

  if (langBtn && langMenu) {
    var langItems = Array.prototype.slice.call(langMenu.querySelectorAll('[role="option"]'));

    function positionLangMenu() {
      var rect = langBtn.getBoundingClientRect();
      langMenu.style.minWidth = Math.max(rect.width, 200) + 'px';
      langMenu.style.left   = rect.left + 'px';
      langMenu.style.bottom = (window.innerHeight - rect.top + 6) + 'px';
    }
    function openLangMenu() {
      langMenu.hidden = false;
      langBtn.setAttribute('aria-expanded', 'true');
      positionLangMenu();
      var sel = langMenu.querySelector('[aria-selected="true"]') || langItems[0];
      if (sel) sel.focus();
    }
    function closeLangMenu() {
      langMenu.hidden = true;
      langBtn.setAttribute('aria-expanded', 'false');
    }
    function setLang(lang) {
      html.setAttribute('lang', lang);
      try { localStorage.setItem('jb-lang', lang); } catch (e) {}
      syncLangSelected();
      applyI18n();
    }

    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (langMenu.hidden) openLangMenu(); else closeLangMenu();
    });
    langBtn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); openLangMenu();
      }
    });
    langItems.forEach(function (li) {
      li.addEventListener('click', function () {
        setLang(li.getAttribute('data-lang'));
        closeLangMenu();
        langBtn.focus();
      });
      li.addEventListener('keydown', function (e) {
        var idx = langItems.indexOf(li);
        if (e.key === 'ArrowDown') { e.preventDefault(); langItems[(idx + 1) % langItems.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); langItems[(idx - 1 + langItems.length) % langItems.length].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); langItems[0].focus(); }
        else if (e.key === 'End')  { e.preventDefault(); langItems[langItems.length - 1].focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
        else if (e.key === 'Escape' || e.key === 'Tab') { closeLangMenu(); langBtn.focus(); }
      });
    });
    document.addEventListener('click', function (e) {
      if (langMenu.hidden) return;
      if (!langMenu.contains(e.target) && !langBtn.contains(e.target)) closeLangMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !langMenu.hidden) { closeLangMenu(); langBtn.focus(); }
    });
    window.addEventListener('resize', function () { if (!langMenu.hidden) positionLangMenu(); });
    window.addEventListener('scroll', function () { if (!langMenu.hidden) positionLangMenu(); }, true);
  }

  /* ─────────── Logout ─────────── */
  var logoutBtn = document.querySelector('[data-logout]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      if (!window.confirm(t('logout.confirm'))) return;
      var logo = document.querySelector('a.logo');
      var href = logo ? logo.getAttribute('href') : '../../proposal-terminal-pro-v2.html';
      window.location.href = href;
    });
  }

  /* ─────────── Initial apply ─────────── */
  syncLangSelected();
  applyI18n();
}());

/* Hero video loader (HLS) — only when #hero-video exists on page */
(function () {
  var video = document.getElementById('hero-video');
  if (!video) return;
  var src = video.getAttribute('data-src') || 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';
  if (typeof Hls !== 'undefined' && Hls.isSupported()) {
    var hls = new Hls({ enableWorker: false });
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () { video.play().catch(function(){}); });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
    video.addEventListener('loadedmetadata', function () { video.play().catch(function(){}); });
  }
}());
