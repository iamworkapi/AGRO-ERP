// Shared bounded-pagination helper for list endpoints. Every list query
// used to run unbounded (Model.find({}) with no limit) - fine at today's
// data volumes but a real risk once any collection grows into the
// thousands. DEFAULT_LIMIT is generous enough that existing callers (which
// don't pass page/limit) see identical results to before; it just puts a
// ceiling on how much a single request can return.
const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 500;

export function parsePagination({ page, limit } = {}) {
  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  return { page: pageNum, limit: pageSize, skip: (pageNum - 1) * pageSize };
}

export function paginationMeta({ page, limit, total }) {
  return { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) };
}
