"use client";
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function OrderConfirmationRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  useEffect(() => {
    if (id) {
      router.replace(`/orders/${id}`);
    } else {
      router.replace('/orders');
    }
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F7]">
      <p className="text-xs uppercase tracking-widest text-stone-500 font-mono animate-pulse">
        Directing to your order confirmation...
      </p>
    </div>
  );
}

