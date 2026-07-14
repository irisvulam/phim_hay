// Helper gọi API nội bộ /api/loc-phim (đọc từ Postgres/Supabase) từ Client Component.
// Dùng cho các trang muốn hiển thị dữ liệu đã đồng bộ trong DB thay vì gọi thẳng
// NguonC — ví dụ trang chủ, /danh-sach/[phim-bo|phim-le|hoat-hinh|phim-moi-cap-nhat],
// /the-loai/[slug], /quoc-gia/[slug]. Trả về đúng shape PaginatedFilms để tái dùng
// FilmCard/Pagination hiện có.

import { PaginatedFilms } from './api';

export interface DbFilmQuery {
  q?: string;
  'the-loai'?: string;
  'quoc-gia'?: string;
  nam?: number | string;
  'dinh-dang'?: 'phim-bo' | 'phim-le';
  sort?: 'new' | 'name';
  page?: number | string;
}

export async function fetchDbFilms(params: DbFilmQuery): Promise<PaginatedFilms> {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }

  const res = await fetch(`/api/loc-phim?${qs.toString()}`, { cache: 'no-store' });
  const json = await res.json();

  if (json?.status !== 'success') {
    throw new Error(json?.message || 'Không truy vấn được dữ liệu từ database');
  }

  return json as PaginatedFilms;
}
