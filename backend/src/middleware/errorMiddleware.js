export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const isProd = process.env.NODE_ENV === 'production';
  const statusCode = err.status || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    message: isProd && statusCode === 500 ? 'Internal Server Error' : err.message || 'Server error',
    ...(isProd ? {} : { stack: err.stack }),
  });
}
