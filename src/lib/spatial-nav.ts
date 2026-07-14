/**
 * Spatial navigation cho TV D-pad — rule 09-tv-support
 * DOM-based, không dependency: mũi tên ↑↓←→ di chuyển focus tới
 * element focusable gần nhất theo hướng (getBoundingClientRect).
 *
 * Chỉ được dynamic-import khi TV mode — không tăng bundle desktop/mobile.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'video[controls]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type Direction = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

let attached = false;

export function initSpatialNav(): () => void {
  if (attached || typeof document === 'undefined') return () => {};
  attached = true;
  document.addEventListener('keydown', onKeyDown);
  return () => {
    document.removeEventListener('keydown', onKeyDown);
    attached = false;
  };
}

function onKeyDown(e: KeyboardEvent): void {
  const dir = e.key as Direction;
  if (dir !== 'ArrowUp' && dir !== 'ArrowDown' && dir !== 'ArrowLeft' && dir !== 'ArrowRight') return;
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;

  const active = document.activeElement as HTMLElement | null;

  // Không can thiệp khi element cần phím mũi tên cho chính nó:
  // - input/textarea/select: di chuyển con trỏ / đổi option
  // - video: native controls dùng ←→ tua, ↑↓ âm lượng
  if (active) {
    const tag = active.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'VIDEO') return;
    if (active.isContentEditable) return;
  }

  const candidates = getVisibleFocusables().filter((el) => el !== active);
  if (candidates.length === 0) return;

  // Chưa có focus → focus element đầu tiên nhìn thấy được
  if (!active || active === document.body) {
    e.preventDefault();
    focusEl(candidates[0]);
    return;
  }

  const next = findBestCandidate(active.getBoundingClientRect(), candidates, dir);
  if (next) {
    e.preventDefault();
    focusEl(next);
  }
  // Không có candidate theo hướng đó → để browser scroll mặc định
}

function getVisibleFocusables(): HTMLElement[] {
  const all = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return all.filter((el) => {
    if (el.closest('[aria-hidden="true"], [hidden]')) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.opacity === '0') return false;
    // Giới hạn trong viewport mở rộng (tránh quét cả trang dài — hiệu năng TV)
    const vh = window.innerHeight;
    return r.bottom > -vh && r.top < vh * 2;
  });
}

function findBestCandidate(
  from: DOMRect,
  candidates: HTMLElement[],
  dir: Direction
): HTMLElement | null {
  const fromCx = from.left + from.width / 2;
  const fromCy = from.top + from.height / 2;

  let best: HTMLElement | null = null;
  let bestScore = Infinity;

  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = cx - fromCx;
    const dy = cy - fromCy;

    // Phải nằm đúng hướng
    let primary: number; // khoảng cách theo trục chính (>0)
    let secondary: number; // lệch trục phụ (phạt nặng)
    switch (dir) {
      case 'ArrowUp':
        if (dy >= -1) continue;
        primary = -dy;
        secondary = Math.abs(dx);
        break;
      case 'ArrowDown':
        if (dy <= 1) continue;
        primary = dy;
        secondary = Math.abs(dx);
        break;
      case 'ArrowLeft':
        if (dx >= -1) continue;
        primary = -dx;
        secondary = Math.abs(dy);
        break;
      case 'ArrowRight':
        if (dx <= 1) continue;
        primary = dx;
        secondary = Math.abs(dy);
        break;
    }

    // Ưu tiên thẳng hàng: phạt lệch trục phụ gấp 2.5 lần
    const score = primary + secondary * 2.5;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }

  return best;
}

function focusEl(el: HTMLElement): void {
  el.focus({ preventScroll: true });
  // scroll-margin trong globals.css lo phần bị header che
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
