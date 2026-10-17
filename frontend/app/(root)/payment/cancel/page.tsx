"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Wrapper from "@/components/wrapper";

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id") || "";

  return (
    <section className="py-12 md:py-16 min-h-[70vh] flex items-center justify-center">
      <Wrapper className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500" />

          <div className="size-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 ring-8 ring-amber-50/50">
            <AlertCircle className="size-11" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-bangla">
            পেমেন্ট বাতিল করা হয়েছে
          </h1>
          <p className="text-sm text-gray-600 mb-6 font-bangla leading-relaxed">
            অনুদানের প্রক্রিয়াটি আপনার দ্বারা বাতিল করা হয়েছে। আপনি চাইলে যেকোনো সময় পুনরায় অনুদান প্রদান করতে পারেন।
          </p>

          {tranId ? (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-6 text-xs text-gray-600 font-mono">
              রেফারেন্স আইডি: {tranId}
            </div>
          ) : null}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/donate"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm transition-colors shadow-sm"
            >
              <RefreshCw className="size-4" /> আবার অনুদান দিন
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-700 font-bangla transition-colors"
            >
              <ArrowLeft className="size-3.5" /> মূল পাতায় ফিরে যান
            </Link>
          </div>
        </div>
      </Wrapper>
    </section>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">লোড হচ্ছে...</div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
