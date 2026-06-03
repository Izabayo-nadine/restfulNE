import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
      <p className="text-sm text-slate-600">
        Page {page} of {totalPages} ({pagination.total} records)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-secondary !py-2 !px-3"
          disabled={!hasPrevPage}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>
        <button
          type="button"
          className="btn-secondary !py-2 !px-3"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
