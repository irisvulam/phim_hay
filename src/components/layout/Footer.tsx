import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0f111a] border-t border-white/5 py-10 mt-16 text-sm text-[#aaaaaa]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="text-2xl font-bold text-[#ffd875] block mb-4">
              PhimHay<span className="text-white text-sm">.HD</span>
            </Link>
            <p className="leading-relaxed mb-4">
              PhimHay là nền tảng xem phim trực tuyến miễn phí chất lượng cao với giao diện thân thiện, mượt mà trên cả điện thoại và máy tính.
            </p>
            <p className="text-xs text-white/40">
              © 2026 PhimHay. Không lưu trữ bất kỳ tệp tin nào trên máy chủ, toàn bộ nội dung được thu thập từ nguồn ngoài.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Thể loại phim</h3>
            <ul className="grid grid-cols-2 gap-2">
              <li><Link href="/the-loai/hanh-dong" className="hover:text-[#ffd875]">Hành Động</Link></li>
              <li><Link href="/the-loai/tinh-cam" className="hover:text-[#ffd875]">Tình Cảm</Link></li>
              <li><Link href="/the-loai/hai-huoc" className="hover:text-[#ffd875]">Hài Hước</Link></li>
              <li><Link href="/the-loai/kinh-di" className="hover:text-[#ffd875]">Kinh Dị</Link></li>
              <li><Link href="/the-loai/hoat-hinh" className="hover:text-[#ffd875]">Hoạt Hình</Link></li>
              <li><Link href="/the-loai/khoa-hoc-vien-tuong" className="hover:text-[#ffd875]">Viễn Tưởng</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Quốc gia</h3>
            <ul className="grid grid-cols-2 gap-2">
              <li><Link href="/quoc-gia/trung-quoc" className="hover:text-[#ffd875]">Trung Quốc</Link></li>
              <li><Link href="/quoc-gia/han-quoc" className="hover:text-[#ffd875]">Hàn Quốc</Link></li>
              <li><Link href="/quoc-gia/nhat-ban" className="hover:text-[#ffd875]">Nhật Bản</Link></li>
              <li><Link href="/quoc-gia/au-my" className="hover:text-[#ffd875]">Âu Mỹ</Link></li>
              <li><Link href="/quoc-gia/viet-nam" className="hover:text-[#ffd875]">Việt Nam</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
