// API client chạy HOÀN TOÀN trên trình duyệt người dùng.
// Lý do: phim.nguonc.com chặn IP datacenter (Vercel/cloud) nhưng cho phép
// IP người dùng cuối, và API có bật CORS (Access-Control-Allow-Origin: *).
// Server chỉ serve HTML/JS tĩnh, không gọi API hộ client.

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

async function fetchAPI<T>(url: string): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch {
    // Cache Cloudflare đôi khi giữ bản response cũ THIẾU header CORS
    // khiến browser chặn đọc kết quả → thử lại với cache-buster để
    // lấy response mới (có Access-Control-Allow-Origin: *).
    const sep = url.includes('?') ? '&' : '?';
    const res = await fetch(`${url}${sep}_cb=${Date.now()}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  }
}

// Phim mới
export const getNewFilms = (page = 1) =>
  fetchAPI<PaginatedFilms>(`${BASE_URL}/films/phim-moi-cap-nhat?page=${page}`);

// Phim theo danh mục
export const getFilmsByCategory = (slug: string, page = 1) =>
  fetchAPI<PaginatedFilms>(`${BASE_URL}/films/danh-sach/${slug}?page=${page}`);

function toSlug(str: string) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Chi tiết phim + danh sách tập
export const getFilmDetail = async (slug: string): Promise<FilmDetail> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await fetchAPI<any>(`${BASE_URL}/film/${slug}`);
  if (!data?.movie) return null as unknown as FilmDetail;

  const rawMovie = data.movie;
  const rawCategories = rawMovie.category || {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const theLoaiList = Object.values(rawCategories).find((c: any) => c.group?.name === 'Thể loại') as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quocGiaList = Object.values(rawCategories).find((c: any) => c.group?.name === 'Quốc gia') as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractSlugs = (groupData: any) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (groupData?.list || []).map((i: any) => ({ name: i.name, slug: toSlug(i.name) }));

  const film: Film = {
    ...rawMovie,
    casts: rawMovie.casts || rawMovie.actor || '',
    category: extractSlugs(theLoaiList),
    country: extractSlugs(quocGiaList),
  };

  const rawEpisodes = rawMovie.episodes || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const episodes: EpisodeServer[] = rawEpisodes.map((server: any) => ({
    server_name: server.server_name,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    server_data: (server.items || server.server_data || []).map((ep: any) => ({
      name: ep.name,
      slug: ep.slug || toSlug(ep.name),
      link_embed: ep.embed || ep.link_embed || '',
      link_m3u8: ep.m3u8 || ep.link_m3u8 || ''
    }))
  }));

  return { film, episodes };
};

// Thể loại
export const getFilmsByGenre = (slug: string, page = 1) =>
  fetchAPI<PaginatedFilms>(`${BASE_URL}/films/the-loai/${slug}?page=${page}`);

// Quốc gia
export const getFilmsByCountry = (slug: string, page = 1) =>
  fetchAPI<PaginatedFilms>(`${BASE_URL}/films/quoc-gia/${slug}?page=${page}`);

// Năm
export const getFilmsByYear = (year: number, page = 1) =>
  fetchAPI<PaginatedFilms>(`${BASE_URL}/films/nam-phat-hanh/${year}?page=${page}`);

// Tìm kiếm
export const searchFilms = (keyword: string) =>
  fetchAPI<PaginatedFilms>(`${BASE_URL}/films/search?keyword=${encodeURIComponent(keyword)}`);
