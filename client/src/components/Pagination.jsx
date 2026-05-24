import React from "react";

const Pagination = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      {Array.from({ length: totalPages }).map((_, idx) => {
        const current = idx + 1;
        return (
          <button
            key={current}
            className={current === page ? "primary" : "ghost"}
            onClick={() => onPageChange(current)}
          >
            {current}
          </button>
        );
      })}
    </div>
  );
};

export default Pagination;
