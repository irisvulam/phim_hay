// Danh mục thể loại/quốc gia dùng chung cho:
// - Menu điều hướng (Header, trang /the-loai, /quoc-gia)
// - Script đồng bộ dữ liệu scripts/sync-nguonc.ts
//
// Slug ở đây phải khớp với slug NguonC dùng ở endpoint
// /api/films/the-loai/{slug} và /api/films/quoc-gia/{slug}.
// Danh sách này KHÔNG lấy được tự động từ API (NguonC không có endpoint
// liệt kê toàn bộ danh mục — xem API-Audit-KeHoach-TinhNang.md mục 2),
// nên phải bổ sung thủ công nếu phát hiện thể loại/quốc gia còn thiếu.
// Slug sai/không tồn tại sẽ chỉ khiến script bỏ qua mục đó, không lỗi toàn bộ.

export interface TaxonomyItem {
  slug: string;
  name: string;
}

export const GENRES: TaxonomyItem[] = [
  { slug: 'hanh-dong', name: 'Hành Động' },
  { slug: 'phieu-luu', name: 'Phiêu Lưu' },
  { slug: 'hoat-hinh', name: 'Hoạt Hình' },
  { slug: 'hai-huoc', name: 'Hài Hước' },
  { slug: 'hinh-su', name: 'Hình Sự' },
  { slug: 'tai-lieu', name: 'Tài Liệu' },
  { slug: 'chinh-kich', name: 'Chính Kịch' },
  { slug: 'gia-dinh', name: 'Gia Đình' },
  { slug: 'gia-tuong', name: 'Giả Tưởng' },
  { slug: 'lich-su', name: 'Lịch Sử' },
  { slug: 'kinh-di', name: 'Kinh Dị' },
  { slug: 'nhac', name: 'Phim Nhạc' },
  { slug: 'bi-an', name: 'Bí Ẩn' },
  { slug: 'lang-man', name: 'Lãng Mạn' },
  { slug: 'khoa-hoc-vien-tuong', name: 'Khoa Học Viễn Tưởng' },
  { slug: 'gay-can', name: 'Gây Cấn' },
  { slug: 'chien-tranh', name: 'Chiến Tranh' },
  { slug: 'mien-tay', name: 'Miền Tây' },
  { slug: 'co-trang', name: 'Cổ Trang' },
  { slug: 'tam-ly', name: 'Tâm Lý' },
  { slug: 'tinh-cam', name: 'Tình Cảm' },
  { slug: 'vien-tuong', name: 'Viễn Tưởng' },
];

export const COUNTRIES: TaxonomyItem[] = [
  { slug: 'au-my', name: 'Âu Mỹ' },
  { slug: 'anh', name: 'Anh' },
  { slug: 'trung-quoc', name: 'Trung Quốc' },
  { slug: 'indonesia', name: 'Indonesia' },
  { slug: 'viet-nam', name: 'Việt Nam' },
  { slug: 'duc', name: 'Đức' },
  { slug: 'tay-ban-nha', name: 'Tây Ban Nha' },
  { slug: 'phap', name: 'Pháp' },
  { slug: 'hong-kong', name: 'Hồng Kông' },
  { slug: 'han-quoc', name: 'Hàn Quốc' },
  { slug: 'nhat-ban', name: 'Nhật Bản' },
  { slug: 'thai-lan', name: 'Thái Lan' },
  { slug: 'dai-loan', name: 'Đài Loan' },
  { slug: 'nga', name: 'Nga' },
  { slug: 'ha-lan', name: 'Hà Lan' },
  { slug: 'an-do', name: 'Ấn Độ' },
  { slug: 'philippines', name: 'Philippines' },
  { slug: 'quoc-gia-khac', name: 'Quốc gia khác' },
];

// Định dạng phim theo endpoint /api/films/danh-sach/{slug}
export const FORMATS: TaxonomyItem[] = [
  { slug: 'phim-le', name: 'Phim Lẻ' },
  { slug: 'phim-bo', name: 'Phim Bộ' },
  { slug: 'hoat-hinh', name: 'Hoạt Hình' },
  { slug: 'tv-shows', name: 'TV Shows' },
  { slug: 'phim-dang-chieu', name: 'Đang Chiếu' },
  { slug: 'phim-sap-chieu', name: 'Sắp Chiếu' },
];
