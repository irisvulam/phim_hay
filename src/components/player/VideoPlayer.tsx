'use client';
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  m3u8Url?: string;
  embedUrl?: string;
  poster?: string;
  title?: string;
}

export default function VideoPlayer({ m3u8Url, embedUrl, poster, title }: VideoPlayerProps) {
  // Ưu tiên m3u8 — phát trực tiếp trong trang bằng hls.js
  if (m3u8Url) {
    return <HlsPlayer m3u8Url={m3u8Url} poster={poster} title={title} />;
  }

  // Nguồn embed (streamc.xyz) hiện CHẶN phát video khi bị nhúng iframe,
  // nên phải mở trình phát ở tab mới (giống cách phim.nguonc.com làm).
  if (embedUrl) {
    return <EmbedLauncher embedUrl={embedUrl} poster={poster} title={title} />;
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
      <span className="text-gray-400">Tập phim chưa có nguồn phát</span>
    </div>
  );
}

function EmbedLauncher({
  embedUrl,
  poster,
  title,
}: {
  embedUrl: string;
  poster?: string;
  title?: string;
}) {
  const openPlayer = () => {
    window.open(embedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
      {poster && (
        <img
          src={poster}
          alt={title || 'Poster'}
          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
        <button
          onClick={openPlayer}
          aria-label={`Phát ${title || 'video'}`}
          className="w-20 h-20 rounded-full bg-[var(--primary-color)] text-[#191b24] flex items-center justify-center text-3xl shadow-2xl hover:scale-110 transition-transform cursor-pointer"
        >
          ▶
        </button>
        <div className="text-center px-4">
          {title && <p className="text-white font-semibold mb-1">{title}</p>}
          <p className="text-gray-300 text-sm">
            Bấm để mở trình phát trong tab mới
          </p>
        </div>
      </div>
    </div>
  );
}

function HlsPlayer({
  m3u8Url,
  poster,
  title,
}: {
  m3u8Url?: string;
  poster?: string;
  title?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    if (!m3u8Url || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, startLevel: -1 });
      hls.loadSource(m3u8Url);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              setError(true);
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = m3u8Url;
      video.addEventListener('error', () => setError(true));
    } else {
      setError(true);
    }

    return () => hls?.destroy();
  }, [m3u8Url]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10 flex-col gap-2">
          <span className="text-white text-lg">Không thể tải video</span>
          <span className="text-gray-400 text-sm">Vui lòng chọn server khác</span>
        </div>
      )}
      <video
        ref={videoRef}
        poster={poster}
        controls
        playsInline
        className="w-full h-full object-contain"
        aria-label={`Đang phát: ${title}`}
      />
    </div>
  );
}
