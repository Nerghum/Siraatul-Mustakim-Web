import { NextResponse } from "next/server";

function getDownloadUrl(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "siraatulmustaqim.com";
  return `https://${host}/downloads/siratul-mustakim.apk`;
}

export function GET(request: Request) {
  return NextResponse.redirect(getDownloadUrl(request), 307);
}

export function HEAD(request: Request) {
  return NextResponse.redirect(getDownloadUrl(request), 307);
}
