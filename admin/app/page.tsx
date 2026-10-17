import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="max-w-2xl text-center">
        <span className="inline-block rounded-full bg-green-100 px-4 py-2  font-medium text-green-700">
          উন্নয়নাধীন
        </span>

        <h1 className="mt-6 text-5xl font-bold text-gray-900">
          সিরাতুল মুস্তাকীম
        </h1>

        <p className="mt-6 text-lg leading-8 text-gray-600">
          আমাদের ওয়েবসাইট বর্তমানে নির্মাণ ও উন্নয়ন কাজের মধ্যে রয়েছে। আমরা
          আপনাদের জন্য একটি সুন্দর, আধুনিক প্ল্যাটফর্ম তৈরিতে কাজ করছি।
        </p>

        <p className="mt-4 text-gray-500">
          ইনশাআল্লাহ খুব শীঘ্রই আমরা পূর্ণাঙ্গ ওয়েবসাইট নিয়ে আপনাদের সামনে
          উপস্থিত হব। আপনার ধৈর্য ও দোয়ার জন্য আন্তরিকভাবে কৃতজ্ঞ।
        </p>
      </div>
    </main>
  );
}
