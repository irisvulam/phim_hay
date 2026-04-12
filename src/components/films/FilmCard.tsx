import Link from 'next/link';
import { Film } from '@/lib/api';

interface FilmCardProps {
  film: Film;
}

export default function FilmCard({ film }: FilmCardProps) {
  return (
    <article className="relative flex flex-col gap-2 group">
      <Link href={`/${film.slug}`} className="relative block w-full aspect-[2/3] overflow-hidden rounded-lg bg-[var(--bg-2)] cursor-pointer">
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
        
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-[32px] text-[var(--primary-color)]">▶</span>
        </div>
      </Link>
      
      <div className="flex flex-col px-1">
        <Link href={`/${film.slug}`} className="text-white text-[14px] font-medium truncate hover:text-[var(--primary-color)] transition-colors" title={film.name}>
          {film.name}
        </Link>
        <div className="text-[12px] text-[var(--text-base)] truncate mt-0.5" title={film.original_name}>
          {film.original_name}
        </div>
      </div>
    </article>
  );
}
