import { NextRequest, NextResponse } from 'next/server';

// Script được inject vào trang embed để tự động bỏ qua quảng cáo
const AD_SKIP_SCRIPT = `
<script>
(function() {
  'use strict';

  // Danh sách selector quảng cáo phổ biến
  const AD_SELECTORS = [
    // Overlay / popup ads
    '.vast-blocker', '.ad-overlay', '.ad-container', '.advertisement',
    '.popup-ad', '.overlay-ad', '[class*="ad-"]', '[id*="ad-"]',
    '[class*="ads-"]', '[id*="ads-"]', '[class*="popup"]',
    // Skip button selectors
    '.skip-ad', '.skip-button', '[class*="skip"]', '[id*="skip"]',
    // Viqeo / common player ads
    '.vjs-ad-playing', '.vjs-ad-loading',
  ];

  // Selector cho nút "Bỏ qua quảng cáo" / "Skip Ad"
  const SKIP_BTN_SELECTORS = [
    '[class*="skip"]', '[id*="skip"]', 
    'button[class*="Skip"]', '.skipButton', '.skip-ad-button',
    '.btn-skip', '#btnSkip', '[data-skip]',
  ];

  // Text phổ biến trên nút skip (tiếng Việt + tiếng Anh)
  const SKIP_TEXTS = [
    'bỏ qua', 'skip', 'bỏ qua quảng cáo', 'skip ad', 'skip ads',
    'close ad', 'đóng', 'close', '×', 'x',
  ];

  function tryClickSkip() {
    // 1. Thử click theo selector rõ ràng
    for (const sel of SKIP_BTN_SELECTORS) {
      try {
        const el = document.querySelector(sel);
        if (el && el.offsetParent !== null) {
          el.click();
          return true;
        }
      } catch(e) {}
    }

    // 2. Tìm theo text nội dung
    const allButtons = document.querySelectorAll('button, [role="button"], a, div, span');
    for (const el of allButtons) {
      const text = (el.textContent || '').trim().toLowerCase();
      if (SKIP_TEXTS.some(t => text.includes(t)) && el.offsetParent !== null) {
        try {
          el.click();
          return true;
        } catch(e) {}
      }
    }

    return false;
  }

  function hideAdOverlays() {
    for (const sel of AD_SELECTORS) {
      try {
        document.querySelectorAll(sel).forEach(el => {
          // Chỉ ẩn nếu không phải video element
          const tag = el.tagName.toLowerCase();
          if (tag !== 'video' && tag !== 'audio') {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
          }
        });
      } catch(e) {}
    }
  }

  // Chặn window.open (popup ads)
  const _open = window.open;
  window.open = function(...args) {
    const url = args[0] || '';
    // Cho phép popup từ chính trang hiện tại
    if (url && typeof url === 'string' && !url.startsWith(location.origin)) {
      console.log('[AdBlock] Blocked popup:', url);
      return null;
    }
    return _open.apply(window, args);
  };

  // Observer theo dõi DOM thay đổi
  const observer = new MutationObserver(() => {
    tryClickSkip();
    hideAdOverlays();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class'],
  });

  // Chạy mỗi 500ms để bắt các quảng cáo xuất hiện muộn
  setInterval(() => {
    tryClickSkip();
    hideAdOverlays();
  }, 500);

  // Chạy ngay khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      tryClickSkip();
      hideAdOverlays();
    });
  } else {
    tryClickSkip();
    hideAdOverlays();
  }

  console.log('[PhimHay AdBlock] Đã kích hoạt bộ lọc quảng cáo');
})();
</script>
`;

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  // Kiểm tra URL hợp lệ
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  // Chỉ cho phép proxy các domain embed đã được whitelist
  const ALLOWED_HOSTS = [
    'streamc.xyz',
    'phim.nguonc.com',
    'nguonc.com',
    'opstream.xyz',
    'vkstream.xyz',
  ];

  const isAllowed = ALLOWED_HOSTS.some(
    (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host)
  );

  if (!isAllowed) {
    return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://phim.nguonc.com/',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status }
      );
    }

    let html = await response.text();

    // Inject ad-skip script vào <head>
    if (html.includes('</head>')) {
      html = html.replace('</head>', AD_SKIP_SCRIPT + '\n</head>');
    } else if (html.includes('<body')) {
      html = html.replace('<body', AD_SKIP_SCRIPT + '\n<body');
    } else {
      html = AD_SKIP_SCRIPT + html;
    }

    // Fix relative URLs để tài nguyên (JS, CSS, images) vẫn load được
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    html = html.replace(
      /<head>/i,
      `<head><base href="${baseUrl}" />`
    );

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Cho phép iframe nhúng
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'",
      },
    });
  } catch (error) {
    console.error('[proxy-embed] Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch embed page' }, { status: 500 });
  }
}
