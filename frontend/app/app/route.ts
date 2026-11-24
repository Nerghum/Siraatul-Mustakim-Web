import { NextResponse } from "next/server";

export function GET(request: Request) {
  const downloadUrl = new URL("/downloads/siratul-mustakim.apk", request.url);
  return NextResponse.redirect(downloadUrl, 307);
}

export function HEAD(request: Request) {
  const downloadUrl = new URL("/downloads/siratul-mustakim.apk", request.url);
  return NextResponse.redirect(downloadUrl, 307);
}
