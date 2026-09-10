import { ApiError } from "../../common/utils/ApiError.js";

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`No route ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

  if (!isApiError) {
    // Unexpected error (Mongoose/driver throwing, programming bug, etc.) -
    // log the full thing server-side but never leak internals to the client.
    console.error(`[unhandled] ${req.method} ${req.originalUrl}`, err);
    try {
      import("fs").then(fs => {
        import("path").then(path => {
          const logPath = path.join(process.cwd(), "unhandled_errors.log");
          fs.appendFileSync(logPath, `[${new Date().toISOString()}] [unhandled] ${req.method} ${req.originalUrl}\n${err.stack || err}\n\n`);
        });
      });
    } catch (e) {
      console.error("Failed to write to error log file", e);
    }
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: isApiError ? err.message : "Internal server error.",
      details: isApiError ? err.details : undefined,
    },
  });
}
