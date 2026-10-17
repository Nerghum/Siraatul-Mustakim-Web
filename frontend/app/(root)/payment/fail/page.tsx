"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft, Heart } from "lucide-react";
import Wrapper from "@/components/wrapper";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const tranId = searchParams.get("tran_id") || "";

  return (
    <section className="py-12 md:py-16 min-h-[70vh] flex items-center justify-center">
      <Wrapper className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-500" />

          <div className="size-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 ring-8 ring-red-50/50">
            <XCircle className="size-11" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-bangla">
            পেমেন্ট ব্যর্থ হয়েছে
          </h1>
          <p className="text-sm text-gray-600 mb-6 font-bangla leading-relaxed">
            দুঃখিত, কোনো একটি কারণে আপনার অনুদানের পেমেন্টটি সম্পন্ন হতে পারেনি। অনুগ্রহ করে আপনার ব্যালেন্স ও পেমেন্ট বিবরণ যাচাই করে পুনরায় চেষ্টা করুন।
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
              <RefreshCw className="size-4" /> পুনরায় চেষ্টা করুন
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

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">লোড হচ্ছে...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
}
