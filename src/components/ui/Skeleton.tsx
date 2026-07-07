export function FilmCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="w-full aspect-[2/3] rounded-lg bg-[var(--bg-2)]" />
      <div className="h-4 bg-[var(--bg-2)] rounded w-3/4" />
      <div className="h-3 bg-[var(--bg-2)] rounded w-1/2" />
    </div>
  );
}

export function FilmGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <FilmCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageLoading({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-[var(--bg-3)] border-t-[var(--primary-color)] rounded-full animate-spin" />
      <span className="text-[var(--text-base)] text-sm">{label}</span>
    </div>
  );
}

export function LoadError({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center px-4">
      <h2 className="text-xl font-bold text-white">Không tải được dữ liệu</h2>
      <p className="text-[var(--text-base)]">
        {message || 'Nguồn phim tạm thời không truy cập được, vui lòng thử lại.'}
      </p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary mt-2 px-6">
          Thử lại
        </button>
      )}
    </div>
  );
}
