import Link from 'next/link';
import { Film } from '@/lib/api';
import FilmCard from './FilmCard';

interface FilmRowProps {
  title: string;
  films: Film[];
  moreLink?: string;
}

export default function FilmRow({ title, films, moreLink }: FilmRowProps) {
  if (!films || films.length === 0) return null;
  
  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl md:text-2xl font-bold uppercase text-white border-l-4 border-[var(--primary-color)] pl-3">
          {title}
        </h2>
        {moreLink && (
          <Link href={moreLink} className="text-sm border border-[rgba(255,255,255,0.1)] rounded px-3 py-1 text-[var(--text-base)] hover:text-white hover:border-white/40 transition-colors">
            Xem tất cả »
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {films.slice(0, 12).map(film => (
          <FilmCard key={film.slug} film={film} />
        ))}
      </div>
    </section>
  );
}
