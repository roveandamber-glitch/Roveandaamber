"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from 'antd';

const AdminLogin = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified login portal with admin redirect target
    router.replace('/login?redirect=/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col items-center justify-center space-y-3 font-sans">
      <Spin size="large" />
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
        Redirecting to ROVE & AMBER Portal...
      </p>
    </div>
  );
};

export default AdminLogin;
