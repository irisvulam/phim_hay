import { getFilmDetail, getFilmsByGenre } from '@/lib/api';
import VideoPlayer from '@/components/player/VideoPlayer';
import FilmCard from '@/components/films/FilmCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string; tap: string }>;
  searchParams: Promise<{ server?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug, tap } = await params;
  const data = await getFilmDetail(slug).catch(() => null);
  if (!data) return {};
  const { film } = data;
  const epName = tap.replace('tap-', 'Tập ');
  return {
    title: `Xem phim ${film.name} - ${epName} - Vietsub`,
    description: `Xem phim ${film.name} ${epName} ${film.quality} ${film.language} online miễn phí trên PhimHay`,
    openGraph: {
      title: `Xem phim ${film.name} - ${epName}`,
      images: [film.thumb_url],
    },
  };
}

export default async function WatchPage({ params, searchParams }: Props) {
  const { slug, tap } = await params;
  const resolvedSearchParams = await searchParams;
  const data = await getFilmDetail(slug).catch(() => null);
  if (!data) notFound();

  const { film, episodes } = data;
  const serverIdx = parseInt(resolvedSearchParams.server || '0', 10);
  const currentServer = episodes[serverIdx] || episodes[0];
  const currentEp = currentServer?.server_data.find(ep => ep.slug === tap) ?? currentServer?.server_data[0];
  
  if (!currentEp) notFound();

  const epList = currentServer.server_data;
  const currentIdx = epList.findIndex(ep => ep.slug === tap) || 0;
  const prevEp = epList[currentIdx - 1] ?? null;
  const nextEp = epList[currentIdx + 1] ?? null;

  const related = film.category?.[0]?.slug
    ? await getFilmsByGenre(film.category[0].slug, 1).catch(() => null)
    : null;

  return (
    <div className="bg-[#191b24] min-h-screen">
      <div className="mx-auto px-0 md:px-4 lg:px-8 max-w-screen-[1600px] flex flex-col xl:flex-row gap-6 pt-0 md:pt-6">
        
        {/* MAIN PART */}
        <div className="flex-1 w-full xl:w-[70%]">
          <nav className="mb-4 px-4 md:px-0 flex items-center text-sm gap-2 text-[var(--text-base)]">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span>&rsaquo;</span>
            <Link href={`/${film.slug}`} className="hover:text-white truncate max-w-[120px] sm:max-w-none">{film.name}</Link>
            <span>&rsaquo;</span>
            <span className="text-white">{currentEp.name}</span>
          </nav>

          <div className="shadow-2xl md:rounded-xl overflow-hidden bg-black mb-4">
            <VideoPlayer
              m3u8Url={currentEp.link_m3u8}
              embedUrl={currentEp.link_embed}
              title={`${film.name} - ${currentEp.name}`}
              poster={film.thumb_url}
            />
          </div>

          <div className="px-4 md:px-0 bg-[#202331] md:bg-transparent py-4 md:py-0 border-b md:border-none border-white/5 mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-white mb-2">{film.name} - {currentEp.name}</h1>
            <p className="text-sm text-gray-400">{film.time} · Lượt xem: Đang cập nhật</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-[var(--bg-2)] rounded-lg mb-8 gap-4 shadow-lg border border-white/5">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-white font-medium whitespace-nowrap">Đổi Server:</span>
              <div className="flex flex-wrap gap-2">
                {episodes.map((s, idx) => (
                  <Link key={idx}
                     href={`/xem-phim/${film.slug}/${tap}?server=${idx}`}
                     className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${idx === serverIdx ? 'bg-[var(--primary-color)] text-[#191b24]' : 'bg-[#3e435c] text-white hover:bg-[#535d8e]'}`}>
                    {s.server_name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 ml-auto">
              {prevEp && (
                <Link className="px-4 py-2 bg-[#3e435c] hover:bg-[#535d8e] text-white rounded-md text-sm font-medium flex items-center justify-center flex-1 md:flex-none transition-colors" 
                   href={`/xem-phim/${film.slug}/${prevEp.slug}?server=${serverIdx}`}>
                  ← Tập trước
                </Link>
              )}
              {nextEp && (
                <Link className="px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] text-[#191b24] rounded-md text-sm font-medium flex items-center justify-center flex-1 md:flex-none transition-colors"
                   href={`/xem-phim/${film.slug}/${nextEp.slug}?server=${serverIdx}`}>
                  Tập tiếp →
                </Link>
              )}
            </div>
          </div>

          <div className="hidden xl:block">
            {related && related.items?.length > 0 && (
              <section className="mb-10">
                <h3 className="text-xl font-bold text-white border-l-4 border-[var(--primary-color)] pl-3 mb-4 uppercase">Có thể bạn thích</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {related.items.slice(0, 8).map(f => (
                    <FilmCard key={f.slug} film={f} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-full xl:w-[30%] px-4 xl:px-0 flex flex-col gap-6 pb-20">
          
          <div className="bg-[var(--bg-2)] rounded-xl border border-white/5 overflow-hidden shadow-lg p-5">
            <div className="flex gap-4">
              <Link href={`/${film.slug}`} className="w-24 shrink-0 block aspect-[2/3] rounded-md overflow-hidden relative group">
                <img src={film.poster_url || film.thumb_url} alt={film.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </Link>
              <div className="flex flex-col flex-1">
                <Link href={`/${film.slug}`} className="text-lg font-bold text-white hover:text-[var(--primary-color)] transition-colors mb-1 line-clamp-2">
                  {film.name}
                </Link>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="tag-quality">{film.quality}</span>
                  <span className="tag-classic">{film.language}</span>
                </div>
                <div className="text-xs text-[var(--text-base)] space-y-1">
                  <p>Thể loại: {film.category?.[0]?.name}</p>
                  <p>Quốc gia: {film.country?.[0]?.name}</p>
                  <p>Cập nhật: {film.current_episode}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-2)] rounded-xl border border-white/5 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-white/5 bg-[#202331] flex justify-between items-center">
              <h4 className="text-white font-bold">Danh sách tập</h4>
              <span className="bg-[#3e435c] text-xs px-2 py-1 rounded text-white">{epList.length} tập</span>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 xl:grid-cols-5 gap-2">
                {epList.map(ep => (
                  <Link key={ep.slug}
                     href={`/xem-phim/${film.slug}/${ep.slug}?server=${serverIdx}`}
                     className={`text-center text-sm py-2 px-1 rounded transition-colors truncate ${
                       ep.slug === tap 
                       ? 'bg-[var(--primary-color)] text-[#191b24] font-bold' 
                       : 'bg-[#202331] text-white hover:bg-[#3e435c]'
                     }`}
                     title={ep.name}>
                    {ep.name.replace('Tập ', '')}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="xl:hidden">
            {related && related.items?.length > 0 && (
              <section className="mt-8">
                <h3 className="text-xl font-bold text-white border-l-4 border-[var(--primary-color)] pl-3 mb-4 uppercase">Có thể bạn thích</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {related.items.slice(0, 4).map(f => (
                    <FilmCard key={f.slug} film={f} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
