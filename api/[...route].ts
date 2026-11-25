import type { IncomingMessage, ServerResponse } from "http";
import app from "../serverApp";

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
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
