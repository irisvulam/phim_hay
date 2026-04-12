const BASE_URL = 'https://phim.nguonc.com/api';

export interface Film {
  name: string;
  slug: string;
  original_name: string;
  thumb_url: string;
  poster_url: string;
  description: string;
  total_episodes: number;
  current_episode: string;
  time: string;
  quality: string;
  language: string;
  category: { name: string; slug: string }[];
  country:  { name: string; slug: string }[];
  casts?: string;
  director?: string;
}

export interface Episode {
  name: string;
  slug: string;
  link_embed: string;
  link_m3u8: string;
}

export interface EpisodeServer {
  server_name: string;
  server_data: Episode[];
}

export interface FilmDetail {
  film: Film;
  episodes: EpisodeServer[];
}

export interface PaginatedFilms {
  status: string;
  paginate: {
    current_page: number;
    total_page: number;
    total_items: number;
    items_per_page: number;
  };
  items: Film[];
}

async function fetchAPI<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Phim mới — cache 5 phút
export const getNewFilms = (page = 1) =>
  fetchAPI<PaginatedFilms>(
    `${BASE_URL}/films/phim-moi-cap-nhat?page=${page}`,
    { next: { revalidate: 300 } }
  );

// Phim theo danh mục — cache 10 phút
export const getFilmsByCategory = (slug: string, page = 1) =>
  fetchAPI<PaginatedFilms>(
    `${BASE_URL}/films/danh-sach/${slug}?page=${page}`,
    { next: { revalidate: 600 } }
  );

function toSlug(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Chi tiết phim — cache 1 giờ
export const getFilmDetail = async (slug: string): Promise<FilmDetail> => {
  const data = await fetchAPI<any>(`${BASE_URL}/film/${slug}`, { next: { revalidate: 3600 } });
  if (!data?.movie) return null as any;

  const rawMovie = data.movie;
  const rawCategories = rawMovie.category || {};

  const theLoaiList = Object.values(rawCategories).find((c: any) => c.group?.name === 'Thể loại') as any;
  const quocGiaList = Object.values(rawCategories).find((c: any) => c.group?.name === 'Quốc gia') as any;

  const extractSlugs = (groupData: any) => 
    (groupData?.list || []).map((i: any) => ({ name: i.name, slug: toSlug(i.name) }));

  const film: Film = {
    ...rawMovie,
    casts: rawMovie.casts || rawMovie.actor || '', 
    category: extractSlugs(theLoaiList),
    country: extractSlugs(quocGiaList),
  };

  const rawEpisodes = rawMovie.episodes || [];
  const episodes: EpisodeServer[] = rawEpisodes.map((server: any) => ({
    server_name: server.server_name,
    server_data: (server.items || server.server_data || []).map((ep: any) => ({
      name: ep.name,
      slug: ep.slug || toSlug(ep.name),
      link_embed: ep.embed || ep.link_embed || '',
      link_m3u8: ep.m3u8 || ep.link_m3u8 || ''
    }))
  }));

  return { film, episodes };
};

// Thể loại — cache 10 phút
export const getFilmsByGenre = (slug: string, page = 1) =>
  fetchAPI<PaginatedFilms>(
    `${BASE_URL}/films/the-loai/${slug}?page=${page}`,
    { next: { revalidate: 600 } }
  );

// Quốc gia — cache 10 phút
export const getFilmsByCountry = (slug: string, page = 1) =>
  fetchAPI<PaginatedFilms>(
    `${BASE_URL}/films/quoc-gia/${slug}?page=${page}`,
    { next: { revalidate: 600 } }
  );

// Năm — cache 10 phút
export const getFilmsByYear = (year: number, page = 1) =>
  fetchAPI<PaginatedFilms>(
    `${BASE_URL}/films/nam-phat-hanh/${year}?page=${page}`,
    { next: { revalidate: 600 } }
  );

// Tìm kiếm — không cache
export const searchFilms = (keyword: string) =>
  fetchAPI<PaginatedFilms>(
    `${BASE_URL}/films/search?keyword=${encodeURIComponent(keyword)}`,
    { cache: 'no-store' }
  );
