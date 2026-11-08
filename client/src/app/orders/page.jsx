"use client";
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Spin } from 'antd';

function OrdersRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams?.get('orderId');
    const targetUrl = orderId
      ? `/profile?tab=orders&orderId=${encodeURIComponent(orderId)}`
      : '/profile?tab=orders';
    router.replace(targetUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-3 font-sans">
      <Spin size="large" />
      <p className="text-xs font-serif font-bold uppercase tracking-widest text-[#8C6D1F]">
        Loading Maison Order Suite...
      </p>
    </div>
  );
}

export default function MyOrdersRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-3 font-sans">
          <Spin size="large" />
          <p className="text-xs font-serif font-bold uppercase tracking-widest text-[#8C6D1F]">
            Loading Maison Order Suite...
          </p>
        </div>
      }
    >
      <OrdersRedirectContent />
    </Suspense>
  );
}

