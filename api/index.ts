import type { IncomingMessage, ServerResponse } from "http";
import app from "../serverApp";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const rawUrl = req.url || "/api";
  try {
    const parsed = new URL(rawUrl, "http://localhost");
    const vercelPath = parsed.searchParams.get("__vercel_path");
    if (vercelPath !== null) {
      parsed.searchParams.delete("__vercel_path");
      const cleanPath = vercelPath.replace(/^\/+/, "");
      const qs = parsed.searchParams.toString();
      req.url = `/api/${cleanPath}${qs ? `?${qs}` : ""}`;
    } else if (!parsed.pathname.startsWith("/api")) {
      const qs = parsed.search;
      req.url = `/api${parsed.pathname.startsWith("/") ? "" : "/"}${parsed.pathname}${qs}`;
    }
  } catch {
    if (!rawUrl.startsWith("/api")) {
      req.url = `/api${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;
    }
  }

  const anyReq = req as IncomingMessage & {
    body?: unknown;
    _body?: boolean;
    readableEnded?: boolean;
  };
  const bodyDescriptor = Object.getOwnPropertyDescriptor(anyReq, "body");
  if (
    bodyDescriptor &&
    "value" in bodyDescriptor &&
    bodyDescriptor.value !== undefined &&
    (anyReq.readable === false || anyReq.readableEnded === true)
  ) {
    anyReq._body = true;
  }

  return app(req as any, res as any);
}
