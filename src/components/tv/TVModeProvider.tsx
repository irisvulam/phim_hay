'use client';

/**
 * TVModeProvider — rule 09-tv-support
 * Mount 1 lần trong root layout:
 * - Detect TV (UA / ?tv=1 / localStorage) → set html[data-mode="tv"]
 * - Dynamic import spatial-nav (chỉ tải khi là TV)
 * - Map phím remote: Back (Tizen 10009 / webOS 461) → history.back(),
 *   Play/Pause (Tizen 10252 / webOS 415,19) → điều khiển <video>
 * - Nút "Thoát chế độ TV" (phòng detect sai)
 */

import { useEffect, useState } from 'react';
import { detectTVMode, applyTVMode } from '@/lib/tv';

// Keycode remote không có trong e.key chuẩn
const KEY_BACK_TIZEN = 10009;
const KEY_BACK_WEBOS = 461;
const KEY_PLAYPAUSE_TIZEN = 10252;
const KEY_PLAY_WEBOS = 415;
const KEY_PAUSE_WEBOS = 19;

export default function TVModeProvider() {
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    const tv = detectTVMode();
    setIsTV(tv);
    if (!tv) return;

    document.documentElement.dataset.mode = 'tv';

    // Spatial navigation — chỉ tải trên TV
    let disposeNav: (() => void) | undefined;
    import('@/lib/spatial-nav').then((m) => {
      disposeNav = m.initSpatialNav();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      // Back của remote
      if (e.keyCode === KEY_BACK_TIZEN || e.keyCode === KEY_BACK_WEBOS) {
        e.preventDefault();
        // Nếu đang focus trong input → thoát input trước, chưa back trang
        const active = document.activeElement as HTMLElement | null;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          active.blur();
          return;
        }
        history.back();
        return;
      }

      // Play/Pause của remote → video đang có trên trang
      if (
        e.keyCode === KEY_PLAYPAUSE_TIZEN ||
        e.keyCode === KEY_PLAY_WEBOS ||
        e.keyCode === KEY_PAUSE_WEBOS ||
        e.key === 'MediaPlayPause'
      ) {
        const video = document.querySelector<HTMLVideoElement>('video');
        if (!video) return;
        e.preventDefault();
        if (e.keyCode === KEY_PLAY_WEBOS) video.play();
        else if (e.keyCode === KEY_PAUSE_WEBOS) video.pause();
        else if (video.paused) video.play();
        else video.pause();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      disposeNav?.();
      delete document.documentElement.dataset.mode;
    };
  }, []);

  if (!isTV) return null;

  return (
    <button
      type="button"
      className="tv-exit-btn"
      onClick={() => {
        applyTVMode(false);
        setIsTV(false);
        window.location.reload();
      }}
    >
      Thoát chế độ TV
    </button>
  );
}
