

function buildPageList(page, totalPages, siblingCount = 1) {
    const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2*ellipsis-adjacent
    if (totalPages <= totalNumbers) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const left = Math.max(page - siblingCount, 1);
    const right = Math.min(page + siblingCount, totalPages);

    const showLeftEllipsis = left > 2;
    const showRightEllipsis = right < totalPages - 1;

    const pages = [1];

    if (showLeftEllipsis) pages.push("ellipsis-left");
    for (let p = left; p <= right; p++) {
        if (p !== 1 && p !== totalPages) pages.push(p);
    }
    if (showRightEllipsis) pages.push("ellipsis-right");

    pages.push(totalPages);

    return pages;
}

export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    const pages = buildPageList(page, totalPages);

    return (
        <nav className="pagination" aria-label="Pagination">
            <button
                className="page-btn nav"
                onClick={() => onChange(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
            >
                ← Prev
            </button>

            {pages.map((p) =>
                    typeof p === "number" ? (
                        <button
                            key={p}
                            className={`page-btn ${p === page ? "active" : ""}`}
                            onClick={() => onChange(p)}
                            aria-current={p === page ? "page" : undefined}
                        >
                            {p}
                        </button>
                    ) : (
                        <span key={p} className="ellipsis">
            …
          </span>
                    )
            )}

            <button
                className="page-btn nav"
                onClick={() => onChange(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next page"
            >
                Next →
            </button>

            <div className="pagination-summary">
                Page {page} of {totalPages}
            </div>
        </nav>
    );
}