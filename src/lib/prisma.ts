// Prisma Client dùng chung cho toàn bộ app (API routes, server components).
// Cache lại instance trong dev để tránh mở quá nhiều connection khi Next.js hot-reload.
//
// Prisma 7: PrismaClient không còn tự đọc DATABASE_URL từ schema.prisma nữa —
// bắt buộc phải tạo qua driver adapter (@prisma/adapter-pg cho Postgres/Supabase).
// Xem: https://pris.ly/d/config-datasource

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Trên máy local, biến kết nối tên là DATABASE_URL (tự đặt trong .env).
// Trên Vercel, tích hợp Supabase (Marketplace) tự bơm biến với TÊN KHÁC —
// POSTGRES_PRISMA_URL (pooled, nên dùng cho runtime serverless), POSTGRES_URL,
// hoặc POSTGRES_URL_NON_POOLING — không có DATABASE_URL trừ khi tự thêm tay.
// Thử lần lượt theo thứ tự ưu tiên bản pooled trước để tránh cạn connection
// khi nhiều serverless function cùng chạy.
function resolveDatabaseUrl(): string {
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error(
      'Không tìm thấy biến môi trường kết nối Postgres — cần 1 trong các biến: ' +
        'DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL, POSTGRES_URL_NON_POOLING. ' +
        'Kiểm tra lại Vercel → Project Settings → Environment Variables.'
    );
  }

  // Vá lỗi "self-signed certificate in certificate chain": pg-connection-string
  // mới coi sslmode=require như verify-full (kiểm tra cert nghiêm ngặt) — thêm
  // uselibpqcompat=true để quay về hành vi lỏng hơn kiểu libpq cũ.
  if (!url.includes('uselibpqcompat')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}uselibpqcompat=true`;
  }
  return url;
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: resolveDatabaseUrl(),
    // Supabase dùng chứng chỉ SSL mà node-postgres (Prisma 7) mặc định không
    // tin cậy sẵn — tắt rejectUnauthorized để giữ hành vi tương tự Prisma 6.
    // Xem mục "SSL certificate validation changes" trong changelog Prisma 7.
    ssl: { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
