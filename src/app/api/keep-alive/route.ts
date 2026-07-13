// Endpoint để Vercel Cron gọi định kỳ, giữ cho project Supabase Free không bị
// tự pause do 7 ngày không hoạt động (xem API-Audit-KeHoach-TinhNang.md mục 7.3).
// Chỉ cần 1 query nhẹ chạm vào DB là đủ tính là "có hoạt động".

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const filmCount = await prisma.film.count();
    return NextResponse.json({ ok: true, filmCount, pingedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[keep-alive] Lỗi kết nối DB:', error);
    return NextResponse.json({ ok: false, error: 'DB unreachable' }, { status: 500 });
  }
}
