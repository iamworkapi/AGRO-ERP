// Wraps an async route/controller so a rejected promise reaches Express's
// error middleware instead of becoming an unhandled rejection.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
