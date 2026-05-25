'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ShoppingBag, ArrowRight, Truck, PackageCheck, Hourglass } from 'lucide-react';
import posthog from 'posthog-js';

function ThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') || '';
  const amountStr = searchParams.get('amount') || '';
  const totalAmount = amountStr ? parseInt(amountStr) : 0;

  useEffect(() => {
    posthog.capture('order_confirmation_viewed', {
      order_id: orderId,
      total_amount: totalAmount,
    });
  }, [orderId, totalAmount]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center space-y-10 min-h-screen">
      {/* 1. Success check animation */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-100 rounded-full scale-120 animate-ping opacity-45" />
          <CheckCircle2 className="w-20 h-20 text-emerald-500 fill-white relative z-10 stroke-[1.8]" />
        </div>
      </div>

      {/* 2. Success Messages */}
      <div className="space-y-3">
        <span className="text-3xs font-extrabold text-emerald-500 uppercase tracking-widest block">
          Giao dịch thành công
        </span>
        <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-neutral-950">
          Đặt Hàng Thành Công!
        </h1>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed font-medium">
          Cảm ơn bạn đã tin tưởng mua sắm tại cửa hàng của chúng tôi. Đơn hàng của bạn đang được tiếp nhận và xử lý nhanh chóng.
        </p>
      </div>

      {/* 3. Order brief details block */}
      {(orderId || totalAmount > 0) && (
        <div className="bg-neutral-50 border border-neutral-100 rounded-3xl p-6 text-xs text-neutral-600 font-semibold space-y-4 max-w-sm mx-auto shadow-2xs">
          {orderId && (
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200">
              <span>Mã Đơn Hàng</span>
              <span className="text-emerald-500 font-black text-sm">#{orderId}</span>
            </div>
          )}
          {totalAmount > 0 && (
            <div className="flex justify-between items-center">
              <span>Tổng Thanh Toán (COD)</span>
              <span className="text-neutral-950 font-black text-sm">
                {totalAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          )}
        </div>
      )}

      {/* 4. Tracking steps flowchart */}
      <div className="space-y-4">
        <h3 className="text-2xs font-extrabold text-neutral-800 uppercase tracking-wider text-left max-w-md mx-auto">
          Quy trình xử lý đơn hàng:
        </h3>
        
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto relative">
          <div className="flex flex-col items-center space-y-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <Hourglass className="w-4 h-4" />
            </div>
            <span className="text-3xs font-extrabold uppercase text-neutral-800 tracking-wide text-center">
              1. Chờ Xác Nhận
            </span>
          </div>

          <div className="flex flex-col items-center space-y-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-400 border border-neutral-200 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
            <span className="text-3xs font-bold uppercase text-neutral-400 tracking-wide text-center">
              2. Đóng Gói
            </span>
          </div>

          <div className="flex flex-col items-center space-y-2 relative z-10">
            <div className="w-10 h-10 rounded-full bg-neutral-100 text-neutral-400 border border-neutral-200 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <span className="text-3xs font-bold uppercase text-neutral-400 tracking-wide text-center">
              3. Đang Giao
            </span>
          </div>

          {/* Connect line */}
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-neutral-100 z-0" />
        </div>
      </div>

      {/* 5. Navigation button */}
      <button
        onClick={() => {
          posthog.capture('continue_shopping_clicked', { order_id: orderId });
          router.push('/products');
        }}
        className="inline-flex items-center gap-2 px-6 py-3.5 bg-neutral-950 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all hover:scale-102 active:scale-98"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>Tiếp tục mua sắm</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </main>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-3xs font-bold text-neutral-400 uppercase tracking-widest mt-3">Đang mở trang...</p>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}