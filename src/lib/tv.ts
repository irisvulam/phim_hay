/**
 * TV mode detection — rule 09-tv-support
 * Ưu tiên: ?tv=1|0 (override, lưu lại) > localStorage > User-Agent
 */

const STORAGE_KEY = 'phimhay-tv';
const COOKIE_NAME = 'phimhay-tv';

const TV_UA_PATTERN =
  /smart-?tv|tizen|web[o0]s|netcast|bravia|android\s?tv|googletv|crkey|hbbtv|viera|aquosbrowser|roku|espial|philipstv|nettv|opera tv|smarthub|shield|mi\s?tv|mibox|aft[a-z]|chromecast/i;

export function isTVUserAgent(ua: string): boolean {
  return TV_UA_PATTERN.test(ua);
}

/**
 * Nhiều browser trên Android TV (trình duyệt mặc định, Cốc Cốc...) gửi UA
 * như Android thường — không có chữ "TV". Heuristic bổ sung:
 * thiết bị Android mà KHÔNG có cảm ứng thì gần như chắc chắn là TV/box
 * (mọi điện thoại/tablet Android đều có touch).
 */
function isLikelyTVDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (isTVUserAgent(ua)) return true;

  const isAndroid = /android/i.test(ua);
  const noTouch =
    (navigator.maxTouchPoints ?? 0) === 0 && !('ontouchstart' in window);
  return isAndroid && noTouch;
}

/** Chỉ gọi phía client. Đọc query override → localStorage → UA. */
export function detectTVMode(): boolean {
  if (typeof window === 'undefined') return false;

  const param = new URLSearchParams(window.location.search).get('tv');
  if (param === '1' || param === '0') {
    persistTVMode(param === '1');
    return param === '1';
  }

  const stored = safeGetItem(STORAGE_KEY);
  if (stored === '1') return true;
  if (stored === '0') return false;

  return isLikelyTVDevice();
}

/** Lưu lựa chọn (localStorage + cookie để SSR có thể dùng sau này). */
export function persistTVMode(on: boolean): void {
  safeSetItem(STORAGE_KEY, on ? '1' : '0');
  try {
    document.cookie = `${COOKIE_NAME}=${on ? '1' : '0'}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* cookie bị chặn — bỏ qua */
  }
}

/** Bật/tắt TV mode ngay lập tức trên DOM + lưu lựa chọn. */
export function applyTVMode(on: boolean): void {
  if (typeof document === 'undefined') return;
  if (on) {
    document.documentElement.dataset.mode = 'tv';
  } else {
    delete document.documentElement.dataset.mode;
  }
  persistTVMode(on);
}

export function isTVModeActive(): boolean {
  return typeof document !== 'undefined' && document.documentElement.dataset.mode === 'tv';
}

/* localStorage có thể bị chặn (private mode trên vài TV browser) */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* bỏ qua */
  }
}
