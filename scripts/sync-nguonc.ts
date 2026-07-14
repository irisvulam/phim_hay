// scripts/sync-nguonc.ts
//
// Script chạy THỦ CÔNG trên máy local để duyệt dữ liệu phim trên
// phim.nguonc.com bằng trình duyệt thật (Playwright) và ghi/cập nhật
// vào DB (Prisma / Supabase Postgres).
//
// Vì sao dùng Playwright thay vì fetch() thường: xem
// API-Audit-KeHoach-TinhNang.md mục 7.1 — NguonC có thể chặn theo IP
// datacenter; script này chạy trên máy cá nhân (IP dân dụng) nên không
// gặp vấn đề đó, và Playwright còn giả lập trình duyệt thật đầy đủ hơn.
//
// Cách chạy: xem lệnh chính xác trong câu trả lời kèm theo, hoặc:
//   npx tsx scripts/sync-nguonc.ts --max-pages=5
//   npx tsx scripts/sync-nguonc.ts --max-pages=50 --targets=genres,countries --concurrency=4
//
// Tham số:
//   --max-pages=N    Số trang tối đa mỗi danh mục/thể loại/quốc gia (mặc định 20)
//   --targets=...    Danh sách nhóm cần đồng bộ, phân tách bằng dấu phẩy:
//                     new (phim mới cập nhật), formats (phim lẻ/bộ/...),
//                     genres (thể loại), countries (quốc gia). Mặc định: cả 4.
//   --delay=N        Độ trễ (ms) giữa các lần gọi TRONG CÙNG 1 worker (mặc định 400)
//   --concurrency=N  Số "worker" (tab trình duyệt) chạy song song, mỗi worker xử lý
//                     1 thể loại/quốc gia/định dạng tại 1 thời điểm (mặc định 3).
//                     Tăng số này giúp đồng bộ nhanh hơn nhiều lần, NHƯNG:
//                       - Quá cao dễ khiến NguonC nghi ngờ là bot/spam request.
//                       - Cắn nhiều connection DB hơn (đã tự tăng pool theo concurrency).
//                     Khuyến nghị: 3-5 khi chạy --max-pages nhỏ để test, có thể thử
//                     6-8 khi đã ổn định để chạy full lần đầu.
//   --start-page=N   Bắt đầu mỗi mục được chọn từ trang N thay vì trang 1 (dùng để
//                     RESUME sau khi script bị crash/rớt mạng giữa chừng — xem
//                     log cuối cùng để biết mục nào đang dừng ở trang bao nhiêu).
//   --only=slug1,slug2   Chỉ chạy các mục có slug này (khớp với --targets đang chọn).
//                     VD slug: 'new', các slug trong FORMATS/GENRES/COUNTRIES ở
//                     src/lib/taxonomy.ts (vd hanh-dong, phieu-luu, phim-bo...).
//   --exclude=slug1,slug2   Bỏ qua các mục có slug này (dùng khi chạy phần "còn lại
//                     chưa đụng tới" mà không muốn chạy lại các mục đã resume riêng).

// Nạp biến môi trường từ .env trước tiên — script này chạy độc lập qua tsx,
// không tự động load .env như Next.js hay Prisma CLI (prisma.config.ts).
import 'dotenv/config';

import { chromium, type Page, type BrowserContext } from 'playwright';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { GENRES, COUNTRIES, FORMATS, TaxonomyItem } from '../src/lib/taxonomy';

const BASE = 'https://phim.nguonc.com/api';

// ---- Đọc tham số dòng lệnh ----
const args = process.argv.slice(2);
function getArg(name: string, def: string): string {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split('=').slice(1).join('=') : def;
}
const MAX_PAGES = parseInt(getArg('max-pages', '20'), 10);
const TARGETS = getArg('targets', 'new,formats,genres,countries').split(',');
const DELAY_MS = parseInt(getArg('delay', '400'), 10);
const CONCURRENCY = Math.max(1, parseInt(getArg('concurrency', '3'), 10));
const START_PAGE = Math.max(1, parseInt(getArg('start-page', '1'), 10));
const ONLY = getArg('only', '').split(',').filter(Boolean);
const EXCLUDE = getArg('exclude', '').split(',').filter(Boolean);

// Prisma 7 yêu cầu driver adapter thay vì tự đọc DATABASE_URL — xem src/lib/prisma.ts.
// Tăng số connection trong pool theo concurrency để mỗi worker không phải chờ nhau
// khi ghi DB (Supabase free tier vẫn đủ đáp ứng ở mức concurrency vài chục).
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: CONCURRENCY + 5,
});
const prisma = new PrismaClient({ adapter });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Thử lại khi gặp lỗi mạng/DB thoáng qua (VD mất mạng vài giây) trước khi bỏ cuộc hẳn —
// tránh tình trạng 1 lần rớt mạng ngắn làm mất luôn toàn bộ các mục còn lại trong hàng đợi.
async function withRetry<T>(fn: () => Promise<T>, retries = 3, backoffMs = 3000): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await sleep(backoffMs * (attempt + 1));
    }
  }
  throw lastErr;
}

interface RawFilmItem {
  name: string;
  slug: string;
  original_name?: string;
  thumb_url?: string;
  poster_url?: string;
  description?: string;
  total_episodes?: number;
  current_episode?: string;
  time?: string;
  quality?: string;
  language?: string;
  director?: string;
  casts?: string;
  modified?: string;
}

interface ListResponse {
  status: string;
  message?: string;
  paginate?: { current_page: number; total_page: number; total_items: number };
  items?: RawFilmItem[];
}

// ---- Gọi API bằng Playwright (mở trang, đọc text JSON trả về) ----
async function fetchJson(page: Page, url: string): Promise<ListResponse> {
  return withRetry(async () => {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const text = await page.evaluate(() => document.body.innerText);
    return JSON.parse(text);
  });
}

function extractYear(item: RawFilmItem): number | null {
  const m = item.name?.match(/\((\d{4})\)/) || item.original_name?.match(/\((\d{4})\)/);
  return m ? parseInt(m[1], 10) : null;
}

async function upsertFilm(item: RawFilmItem) {
  const data = {
    name: item.name,
    originalName: item.original_name || null,
    thumbUrl: item.thumb_url || null,
    posterUrl: item.poster_url || null,
    description: item.description || null,
    totalEpisodes: item.total_episodes ?? null,
    currentEpisode: item.current_episode || null,
    time: item.time || null,
    quality: item.quality || null,
    language: item.language || null,
    director: item.director || null,
    casts: item.casts || null,
    year: extractYear(item),
    sourceModified: item.modified ? new Date(item.modified) : null,
  };
  // upsert theo `slug` (@unique) — chạy lại nhiều lần / nhiều worker cùng lúc
  // chỉ cập nhật bản ghi cũ, không tạo trùng.
  return withRetry(() =>
    prisma.film.upsert({
      where: { slug: item.slug },
      update: data,
      create: { slug: item.slug, ...data },
    })
  );
}

async function linkGenre(filmId: string, genreId: string) {
  await withRetry(() =>
    prisma.filmGenre.upsert({
      where: { filmId_genreId: { filmId, genreId } },
      update: {},
      create: { filmId, genreId },
    })
  );
}

async function linkCountry(filmId: string, countryId: string) {
  await withRetry(() =>
    prisma.filmCountry.upsert({
      where: { filmId_countryId: { filmId, countryId } },
      update: {},
      create: { filmId, countryId },
    })
  );
}

// Duyệt 1 danh sách phim (có phân trang), upsert từng phim, tuỳ chọn gắn
// thêm quan hệ thể loại/quốc gia dựa vào endpoint đang duyệt.
async function crawlListUrl(
  page: Page,
  logPrefix: string,
  label: string,
  urlBase: string,
  onFilm?: (filmId: string) => Promise<void>
) {
  let currentPage = START_PAGE;
  let totalPage = 1;
  let synced = 0;

  do {
    const sep = urlBase.includes('?') ? '&' : '?';
    const url = `${urlBase}${sep}page=${currentPage}`;
    let data: ListResponse;
    try {
      data = await fetchJson(page, url);
    } catch (err) {
      console.warn(`${logPrefix}[bỏ qua] ${label} trang ${currentPage}: ${(err as Error).message}`);
      break;
    }

    if (data?.status !== 'success' || !Array.isArray(data.items)) {
      console.warn(`${logPrefix}[bỏ qua] ${label}: response không hợp lệ (${data?.message || 'không rõ lỗi'})`);
      break;
    }

    totalPage = data.paginate?.total_page ?? 1;

    for (const item of data.items) {
      try {
        const film = await upsertFilm(item);
        if (onFilm) await onFilm(film.id);
        synced++;
      } catch (err) {
        console.warn(`${logPrefix}[lỗi phim ${item.slug}]`, (err as Error).message);
      }
    }

    console.log(`${logPrefix}${label}: trang ${currentPage}/${Math.min(totalPage, MAX_PAGES)} — luỹ kế ${synced} phim`);
    currentPage++;
    await sleep(DELAY_MS);
  } while (currentPage <= totalPage && currentPage <= MAX_PAGES);
}

interface Job {
  id: string;
  label: string;
  url: string;
  onFilm?: (filmId: string) => Promise<void>;
}

function buildJobs(genreIds: Map<string, string>, countryIds: Map<string, string>): Job[] {
  let jobs: Job[] = [];

  if (TARGETS.includes('new')) {
    jobs.push({ id: 'new', label: 'phim-moi-cap-nhat', url: `${BASE}/films/phim-moi-cap-nhat` });
  }

  if (TARGETS.includes('formats')) {
    for (const f of FORMATS as TaxonomyItem[]) {
      jobs.push({ id: f.slug, label: f.name, url: `${BASE}/films/danh-sach/${f.slug}` });
    }
  }

  if (TARGETS.includes('genres')) {
    for (const g of GENRES) {
      const genreId = genreIds.get(g.slug)!;
      jobs.push({
        id: g.slug,
        label: `Thể loại: ${g.name}`,
        url: `${BASE}/films/the-loai/${g.slug}`,
        onFilm: (filmId) => linkGenre(filmId, genreId),
      });
    }
  }

  if (TARGETS.includes('countries')) {
    for (const c of COUNTRIES) {
      const countryId = countryIds.get(c.slug)!;
      jobs.push({
        id: c.slug,
        label: `Quốc gia: ${c.name}`,
        url: `${BASE}/films/quoc-gia/${c.slug}`,
        onFilm: (filmId) => linkCountry(filmId, countryId),
      });
    }
  }

  // Lọc theo --only / --exclude nếu có (dùng khi resume 1 phần cụ thể)
  if (ONLY.length > 0) jobs = jobs.filter((j) => ONLY.includes(j.id));
  if (EXCLUDE.length > 0) jobs = jobs.filter((j) => !EXCLUDE.includes(j.id));

  return jobs;
}

// Chạy 1 worker: mở riêng 1 tab, liên tục lấy job kế tiếp trong hàng đợi
// (dùng chung biến đếm `nextIndex`) cho tới khi hết job.
async function runWorker(workerId: number, context: BrowserContext, jobs: Job[], nextIndexRef: { i: number }) {
  const page = await context.newPage();
  const logPrefix = `[worker ${workerId}] `;

  while (nextIndexRef.i < jobs.length) {
    const myIndex = nextIndexRef.i++;
    const job = jobs[myIndex];
    console.log(`${logPrefix}>> bắt đầu (${myIndex + 1}/${jobs.length}): ${job.label}`);
    await crawlListUrl(page, logPrefix, job.label, job.url, job.onFilm);
  }

  await page.close();
}

async function main() {
  console.log(
    `Bắt đầu đồng bộ NguonC — targets=[${TARGETS.join(', ')}] max-pages=${MAX_PAGES} delay=${DELAY_MS}ms concurrency=${CONCURRENCY}` +
      (START_PAGE > 1 ? ` start-page=${START_PAGE}` : '') +
      (ONLY.length ? ` only=[${ONLY.join(', ')}]` : '') +
      (EXCLUDE.length ? ` exclude=[${EXCLUDE.join(', ')}]` : '') +
      '\n'
  );

  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  // Tạo trước Genre/Country trong DB tuần tự (tránh nhiều worker cùng
  // upsert 1 slug giống nhau cùng lúc), rồi mới chạy song song phần crawl.
  const genreIds = new Map<string, string>();
  if (TARGETS.includes('genres')) {
    for (const g of GENRES) {
      const genre = await prisma.genre.upsert({
        where: { slug: g.slug },
        update: { name: g.name },
        create: { slug: g.slug, name: g.name },
      });
      genreIds.set(g.slug, genre.id);
    }
  }

  const countryIds = new Map<string, string>();
  if (TARGETS.includes('countries')) {
    for (const c of COUNTRIES) {
      const country = await prisma.country.upsert({
        where: { slug: c.slug },
        update: { name: c.name },
        create: { slug: c.slug, name: c.name },
      });
      countryIds.set(c.slug, country.id);
    }
  }

  const jobs = buildJobs(genreIds, countryIds);
  console.log(`Tổng ${jobs.length} mục cần đồng bộ, chạy với ${CONCURRENCY} worker song song.\n`);

  const nextIndexRef = { i: 0 };
  const workers = Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, (_, i) =>
    runWorker(i + 1, context, jobs, nextIndexRef)
  );
  await Promise.all(workers);

  await browser.close();

  try {
    const totalFilms = await prisma.film.count();
    console.log(`\nHoàn tất. Hiện DB có tổng cộng ${totalFilms} phim.`);
  } catch (err) {
    console.warn('\nHoàn tất crawl nhưng không đếm được tổng số phim (DB tạm gián đoạn):', (err as Error).message);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Lỗi không xử lý được:', err);
  try {
    await prisma.$disconnect();
  } catch {
    // bỏ qua lỗi khi disconnect lúc đã lỗi
  }
  process.exit(1);
});
