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
  if (embedUrl) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          title={title || 'Video Player'}
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-pointer-lock"
        />
      </div>
    );
  }

  // Fallback: HLS native player khi không có embed URL
  return <HlsPlayer m3u8Url={m3u8Url} poster={poster} title={title} />;
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
