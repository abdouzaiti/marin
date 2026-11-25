import type { IncomingMessage, ServerResponse } from "http";
import { app } from "../server";

export default function handler(
  req: IncomingMessage & { url?: string },
  res: ServerResponse
) {
  if (req.url) {
    const urlObj = new URL(req.url, "http://localhost");
    const rewrittenPath = urlObj.searchParams.get("__path");
    if (rewrittenPath !== null) {
      urlObj.searchParams.delete("__path");
      const qs = urlObj.searchParams.toString();
      req.url = `/api/${rewrittenPath}${qs ? `?${qs}` : ""}`;
    }
  }
  return app(req as any, res as any);
}
