// Prisma Client dùng chung cho toàn bộ app (API routes, server components).
// Cache lại instance trong dev để tránh mở quá nhiều connection khi Next.js hot-reload.
//
// Prisma 7: PrismaClient không còn tự đọc DATABASE_URL từ schema.prisma nữa —
// bắt buộc phải tạo qua driver adapter (@prisma/adapter-pg cho Postgres/Supabase).
// Xem: https://pris.ly/d/config-datasource

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
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
