import { Triangle } from "lucide-react"
import "./Pagination.css";

function Pagination({
  page,
  totalPages,
  totalItems,
  itemsPerPage,
  onChange,
}: {
  page: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onChange: (page: number) => void
}) {
  if (totalItems <= itemsPerPage) {
    return null
  }

  const start = (page - 1) * itemsPerPage + 1
  const end = Math.min(
    page * itemsPerPage,
    totalItems
  )

  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-button"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        <Triangle className='triangle-left'
        strokeWidth={0}
        fill="var(--body)"
        size={16} />
      </button>

      <span className="pagination-label">
        {start}-{end} of {totalItems}
      </span>

      <button
        type="button"
        className="pagination-button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        <Triangle className="triangle-right" 
        strokeWidth={0}
        fill="var(--body)"
        size={16} />
      </button>
    </div>
  )
}

export default Pagination;