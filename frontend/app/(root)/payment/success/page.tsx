"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Copy, Check, Printer, Heart, ArrowLeft, Loader2, Calendar, Phone, User, CreditCard, ShieldCheck } from "lucide-react";
import Wrapper from "@/components/wrapper";
import { verifyPaymentTransaction, type PaymentVerificationData } from "@/lib/api/payment";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import { useLocale } from "@/hooks/use-locale";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const tranId = searchParams.get("tran_id") || "";

  const [payment, setPayment] = useState<PaymentVerificationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!tranId) {
      setLoading(false);
      return;
    }

    verifyPaymentTransaction(tranId)
      .then((data) => {
        setPayment(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [tranId]);

  const handleCopy = () => {
    if (!tranId) return;
    navigator.clipboard.writeText(tranId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="py-12 md:py-16 min-h-[75vh] flex items-center justify-center">
      <Wrapper className="max-w-xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-100/80 text-center relative overflow-hidden">
          {/* Header decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          {/* Success Badge */}
          <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="size-11" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 font-bangla">
            আলহামদুলিল্লাহ! আপনার অনুদান সফল হয়েছে
          </h1>
          <p className="text-sm text-gray-600 mb-6 font-bangla leading-relaxed">
            আল্লাহ তাআলা আপনার এই নেক আমল কবুল করুন এবং সিরাতুল মুস্তাকিমের দ্বীনি খিদমতে সহযোগিতার জন্য আপনাকে সর্বোত্তম প্রতিদান দান করুন। আমীন।
          </p>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="size-6 animate-spin text-emerald-600" />
              <span className="text-sm">অনুদানের বিবরণ যাচাই করা হচ্ছে...</span>
            </div>
          ) : (
            <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 text-left space-y-3.5 mb-6 text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/80">
                <span className="text-gray-500 font-bangla">অনুদানের পরিমাণ</span>
                <span className="text-xl font-bold text-emerald-600 font-mono">
                  ৳{toLocalizedNumber(payment?.amount || 0, locale)} BDT
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bangla flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-gray-400" /> ট্রানজেকশন আইডি
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold text-gray-800 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                    {tranId || "N/A"}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1 text-gray-500 hover:text-emerald-600 transition-colors"
                    title="কপি করুন"
                  >
                    {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>

              {payment?.cus_name ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bangla flex items-center gap-1.5">
                    <User className="size-4 text-gray-400" /> দানকারীর নাম
                  </span>
                  <span className="font-medium text-gray-800 font-bangla">
                    {payment.cus_name}
                  </span>
                </div>
              ) : null}

              {payment?.cus_phone ? (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-bangla flex items-center gap-1.5">
                    <Phone className="size-4 text-gray-400" /> মোবাইল নম্বর
                  </span>
                  <span className="font-mono text-gray-800">
                    {payment.cus_phone}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bangla flex items-center gap-1.5">
                  <CreditCard className="size-4 text-gray-400" /> পেমেন্ট মাধ্যম
                </span>
                <span className="font-medium text-gray-800 capitalize">
                  {payment?.paymentMethod || "bKash / Card"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 font-bangla flex items-center gap-1.5">
                  <Calendar className="size-4 text-gray-400" /> খাত ও ধরণ
                </span>
                <span className="font-medium text-gray-800 font-bangla">
                  {payment?.category === "zakat" ? "যাকাত তহবিল" : "সাধারণ তহবিল"} •{" "}
                  {payment?.frequency === "monthly" ? "মাসিক অনুদান" : "এককালীন অনুদান"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-200/80">
                <span className="text-gray-500 font-bangla">স্ট্যাটাস</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="size-3.5" /> সফলভাবে সম্পন্ন
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <Printer className="size-4" /> রসিদ প্রিন্ট করুন
            </button>

            <Link
              href="/donate"
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm transition-colors shadow-sm"
            >
              <Heart className="size-4 fill-white" /> আবার অনুদান দিন
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

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="size-8 animate-spin mx-auto text-emerald-600" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
