import { getFilmsByCategory } from '@/lib/api';
import FilmCard from '@/components/films/FilmCard';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  return {
    title: `Danh sách phim ${category.replace('-', ' ')} - PhimHay`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page || 1);
  const data = await getFilmsByCategory(category, currentPage).catch(() => null);
  
  if (!data || !data.items) notFound();

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold uppercase text-white border-l-4 border-[var(--primary-color)] pl-3 mb-8">
        Danh sách phim: {category.replace(/-/g, ' ')}
      </h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {data.items.map(film => (
          <FilmCard key={film.slug} film={film} />
        ))}
      </div>

      {/* Basic Pagination */}
      <div className="flex justify-center items-center gap-4 mt-12">
        {currentPage > 1 && (
          <a href={`/danh-sach/${category}?page=${currentPage - 1}`} className="btn btn-secondary px-6">
            Trang Trước
          </a>
        )}
        <span className="text-white">Trang {currentPage}</span>
        {currentPage < (data.paginate?.total_page || 1) && (
          <a href={`/danh-sach/${category}?page=${currentPage + 1}`} className="btn btn-primary px-6">
            Trang Sau
          </a>
        )}
      </div>
    </div>
  );
}
