/**
 * Wraps an async Express route handler so any rejected promise is forwarded
 * to Express's next(err) error handler — no per-route try/catch needed.
 * @param {Function} fn - async (req, res, next) => ...
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
