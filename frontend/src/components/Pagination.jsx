import { ChevronLeft, ChevronRight } from 'lucide-react';

const WINDOW = 5;

function normalizePagination(pagination) {
  const page = pagination?.page ?? 1;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const total = pagination?.total ?? 0;
  const limit = pagination?.limit ?? 10;
  return {
    page,
    totalPages,
    total,
    limit,
    hasPrevPage: pagination?.hasPrevPage ?? page > 1,
    hasNextPage: pagination?.hasNextPage ?? page < totalPages,
  };
}

function visiblePages(current, totalPages) {
  if (totalPages <= WINDOW) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  let start = Math.max(1, current - Math.floor(WINDOW / 2));
  let end = start + WINDOW - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - WINDOW + 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({ pagination, onPageChange }) {
  const { page, totalPages, total, hasPrevPage, hasNextPage } = normalizePagination(pagination);
  const pages = visiblePages(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
      <p className="text-sm text-slate-600">
        Page {page} of {totalPages} ({total} records)
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          className="btn-secondary !py-2 !px-3"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <div className="mx-1 flex gap-1">
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`min-w-[2.25rem] rounded-lg px-2 py-2 text-sm font-medium ${
                p === page
                  ? 'bg-brand-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn-secondary !py-2 !px-3"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
