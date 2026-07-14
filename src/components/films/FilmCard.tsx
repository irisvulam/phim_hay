import Link from 'next/link';
import { Film } from '@/lib/api';

interface FilmCardProps {
  film: Film;
}

export default function FilmCard({ film }: FilmCardProps) {
  return (
    <article className="group">
      {/* Hình + tên phim chung một khung; cả card là 1 link duy nhất
          (1 điểm dừng focus cho D-pad/TV thay vì 2 — rule 09) */}
      <Link
        href={`/${film.slug}`}
        className="film-card-link flex flex-col overflow-hidden rounded-lg bg-[var(--bg-2)] border border-white/5 hover:border-white/15 transition-colors cursor-pointer"
        title={film.name}
      >
        <div className="relative w-full aspect-[2/3] overflow-hidden bg-[var(--bg-3)]">
          <img
            src={film.thumb_url}
            alt={film.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
          />

          <div className="absolute top-1.5 left-1.5 flex gap-1 z-10">
            <span className="tag-quality">{film.quality}</span>
          </div>

          <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] py-[2px] px-[5px] rounded-[3px]">
            {film.current_episode}
          </span>

          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
            <span className="text-[32px] text-[var(--primary-color)]">▶</span>
          </div>
        </div>

        <div className="flex flex-col px-2.5 py-2">
          <span className="text-white text-[14px] font-medium truncate group-hover:text-[var(--primary-color)] group-focus-within:text-[var(--primary-color)] transition-colors">
            {film.name}
          </span>
          <span className="text-[12px] text-[var(--text-base)] truncate mt-0.5" title={film.original_name}>
            {film.original_name}
          </span>
        </div>
      </Link>
    </article>
  );
}
