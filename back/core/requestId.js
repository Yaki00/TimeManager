import { randomUUID } from "node:crypto";

export function requestId() {
  return (req, res, next) => {
    const id =
      req.get?.("x-request-id") ||
      req.headers?.["x-request-id"] ||
      randomUUID();

    req.traceId = id;
    res.setHeader("X-Request-Id", id);
    next();
  };
}
