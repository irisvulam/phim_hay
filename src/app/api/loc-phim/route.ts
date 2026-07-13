// Bộ lọc nâng cao — đọc từ Postgres (Supabase) thay vì gọi NguonC trực tiếp.
// Lý do: API NguonC chỉ lọc được 1 điều kiện/lần gọi (thể loại HOẶC quốc gia
// HOẶC năm), không kết hợp được — xem API-Audit-KeHoach-TinhNang.md mục 2-3.
// DB này được nạp dữ liệu qua script scripts/sync-nguonc.ts chạy thủ công.

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 24;

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const keyword = (sp.get('q') || '').trim();
  const genreSlug = sp.get('the-loai') || undefined;
  const countrySlug = sp.get('quoc-gia') || undefined;
  const yearParam = sp.get('nam');
  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  const sort = sp.get('sort') === 'name' ? 'name' : 'new';
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10));

  const where: Prisma.FilmWhereInput = {};
  if (genreSlug) where.genres = { some: { genre: { slug: genreSlug } } };
  if (countrySlug) where.countries = { some: { country: { slug: countrySlug } } };
  if (year && !Number.isNaN(year)) where.year = year;
  if (keyword) {
    // Tìm theo tên Việt hoá hoặc tên gốc, không phân biệt hoa/thường,
    // kết hợp AND với các filter khác ở trên (thể loại/quốc gia/năm).
    where.OR = [
      { name: { contains: keyword, mode: 'insensitive' } },
      { originalName: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.FilmOrderByWithRelationInput =
    sort === 'name' ? { name: 'asc' } : { syncedAt: 'desc' };

  try {
    const [rows, total] = await Promise.all([
      prisma.film.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          genres: { include: { genre: true } },
          countries: { include: { country: true } },
        },
      }),
      prisma.film.count({ where }),
    ]);

    const items = rows.map((f) => ({
      name: f.name,
      slug: f.slug,
      original_name: f.originalName || '',
      thumb_url: f.thumbUrl || '',
      poster_url: f.posterUrl || '',
      description: f.description || '',
      total_episodes: f.totalEpisodes || 0,
      current_episode: f.currentEpisode || '',
      time: f.time || '',
      quality: f.quality || '',
      language: f.language || '',
      category: f.genres.map((g) => ({ name: g.genre.name, slug: g.genre.slug })),
      country: f.countries.map((c) => ({ name: c.country.name, slug: c.country.slug })),
      director: f.director || undefined,
      casts: f.casts || undefined,
    }));

    return NextResponse.json({
      status: 'success',
      paginate: {
        current_page: page,
        total_page: Math.max(1, Math.ceil(total / PAGE_SIZE)),
        total_items: total,
        items_per_page: PAGE_SIZE,
      },
      items,
    });
  } catch (error) {
    console.error('[loc-phim] Lỗi truy vấn DB:', error);
    return NextResponse.json(
      { status: 'error', message: 'Không truy vấn được database' },
      { status: 500 }
    );
  }
}
