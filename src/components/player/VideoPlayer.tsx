'use client';
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { detectTVMode } from '@/lib/tv';

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

  // Nguồn embed: phát ngay trong trang qua /api/proxy-embed
  // (proxy phía server gỡ header chặn iframe + chặn popup quảng cáo).
  if (embedUrl) {
    return <EmbedFrame embedUrl={embedUrl} title={title} />;
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
      <span className="text-gray-400">Tập phim chưa có nguồn phát</span>
    </div>
  );
}

function EmbedFrame({
  embedUrl,
  title,
}: {
  embedUrl: string;
  title?: string;
}) {
  // TV mode (rule 09): link dự phòng điều hướng cùng tab, không mở popup
  const [isTV, setIsTV] = useState(false);
  useEffect(() => {
    setIsTV(detectTVMode());
  }, []);

  const proxiedUrl = `/api/proxy-embed?url=${encodeURIComponent(embedUrl)}`;

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={proxiedUrl}
          title={title || 'Trình phát video'}
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
      {/* Dự phòng: nguồn embed có thể tự chặn phát khi bị nhúng */}
      <div className="text-center py-1.5">
        <a
          href={embedUrl}
          target={isTV ? undefined : '_blank'}
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-[var(--primary-color)] focus:text-[var(--primary-color)] transition-colors"
        >
          Video không phát được? Mở trình phát riêng →
        </a>
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
