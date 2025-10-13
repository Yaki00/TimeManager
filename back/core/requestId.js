export function requestId(req, _res, next) {
  req.traceId =
    req.headers["x-request-id"] || Math.random().toString(36).slice(2);
  next();
}
