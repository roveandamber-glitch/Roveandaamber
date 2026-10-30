"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Form, Input, message } from 'antd';
import { 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  KeyRound
} from 'lucide-react';
import authService from '@/services/authService';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // If already logged in as admin, redirect directly to /admin dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = authService.getUser();
      const token = authService.getToken();
      if (user && user.role === 'admin' && token) {
        router.replace('/admin');
      }
    }
  }, [router]);

  const handleAdminLogin = async (values) => {
    setLoading(true);
    setErrorMessage(null);

    const email = values.email.trim().toLowerCase();
    const password = values.password;

    try {
      // 1. Attempt official backend authentication
      let res = null;
      try {
        res = await authService.login({ email, password });
      } catch (apiErr) {
        // Fallback for offline or local preview admin
        if (
          (email === 'admin@roveandamber.com' || email === 'admin@eventflow.com') &&
          password === 'admin123'
        ) {
          res = {
            success: true,
            token: 'preview_admin_session_token',
            user: {
              id: 'admin-1',
              name: 'Atelier Director',
              email: email,
              role: 'admin',
              designation: 'Super Admin'
            }
          };
        } else {
          throw apiErr;
        }
      }

      if (res?.success && res.token && res.user) {
        // Enforce strict administrative authorization
        if (res.user.role !== 'admin') {
          setErrorMessage('Access Denied: This portal requires verified Administrator credentials.');
          return;
        }

        authService.saveSession(res.user, res.token);
        message.success(`Welcome back, ${res.user.name || 'Administrator'}!`);
        router.replace('/admin');
      } else {
        setErrorMessage(res?.message || 'Invalid administrator email or password.');
      }
    } catch (err) {
      console.error('Admin authentication error:', err);
      const isNetworkError = err.code === 'ERR_NETWORK' || !err.response;
      const errorText = isNetworkError
        ? 'Unable to connect to authentication atelier. Please verify your connection.'
        : (err.response?.data?.message || 'Invalid credentials. Please verify your administrator email and password.');
      setErrorMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    form.setFieldsValue({
      email: 'admin@roveandamber.com',
      password: 'admin123'
    });
    setErrorMessage(null);
    message.info('Demo administrative credentials pre-filled.');
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0704] flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans select-none">
      
      {/* Ambient Luxury Amber / Gold Glows in the background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-700/15 via-[#DEB368]/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Header: Return to Boutique Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between relative z-20">
        <Link 
          href="/"
          className="inline-flex items-center gap-2.5 text-xs font-medium text-amber-200/70 hover:text-white transition-colors group"
        >
          <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-[#DEB368]/40 transition-all text-amber-100">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          </span>
          <span className="tracking-widest uppercase text-[10px] font-semibold">
            Return to Boutique
          </span>
        </Link>

        <div className="flex items-center gap-2 text-amber-400/80 text-xs">
          <ShieldCheck size={14} className="text-[#DEB368]" />
          <span className="tracking-widest uppercase text-[10px] font-semibold text-gray-400">
            Restricted Atelier Zone
          </span>
        </div>
      </header>

      {/* Centerpiece Luxury Executive Login Card */}
      <main className="w-full max-w-[440px] my-auto relative z-20 py-8">
        <div className="bg-[#170E08]/90 backdrop-blur-2xl rounded-[32px] border border-[#DEB368]/30 shadow-[0_30px_90px_rgba(0,0,0,0.85)] p-7 sm:p-9 text-white">
          
          {/* Emblem & Branding */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#28180E] to-[#120B07] border border-[#DEB368]/40 shadow-inner flex items-center justify-center mx-auto mb-4 text-[#ECC880]">
              <Sparkles size={24} className="text-[#DEB368]" />
            </div>

            <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#ECC880] block mb-1">
              ROVE & AMBER
            </span>
            <h1 className="text-2xl sm:text-[26px] font-serif font-normal text-white tracking-tight">
              Executive Atelier Access
            </h1>
            <p className="text-xs text-stone-400 font-light mt-1.5 max-w-[320px] mx-auto leading-relaxed">
              Authorized personnel access to boutique formulations, inventory dispatch, and patron orders.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-800/60 flex items-start gap-2.5 text-red-200 text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-400" />
              <span className="leading-relaxed font-light">{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAdminLogin}
            onValuesChange={() => {
              if (errorMessage) setErrorMessage(null);
            }}
            requiredMark={false}
          >
            {/* Email Field */}
            <Form.Item
              name="email"
              label={
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-300">
                  Administrator Email
                </span>
              }
              rules={[
                { required: true, message: 'Please enter your administrator email' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
              className="mb-4"
            >
              <Input
                prefix={<Mail size={14} className="text-stone-500 mr-2" />}
                placeholder="admin@roveandamber.com"
                disabled={loading}
                className="!bg-[#22150D]/80 !border-stone-700/80 !text-white !rounded-xl !h-11 hover:!border-[#DEB368] focus:!border-[#ECC880] placeholder:!text-stone-500 text-xs"
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              label={
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-300">
                  Security Passcode
                </span>
              }
              rules={[{ required: true, message: 'Please enter your administrator passcode' }]}
              className="mb-5"
            >
              <Input.Password
                prefix={<Lock size={14} className="text-stone-500 mr-2" />}
                placeholder="••••••••"
                disabled={loading}
                className="!bg-[#22150D]/80 !border-stone-700/80 !text-white !rounded-xl !h-11 hover:!border-[#DEB368] focus:!border-[#ECC880] placeholder:!text-stone-500 text-xs"
              />
            </Form.Item>

            {/* Quick Demo Credentials Fill Pill */}
            <div className="mb-5 flex justify-center">
              <button
                type="button"
                onClick={handleQuickFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-stone-400 hover:text-amber-200 text-[11px] transition-all cursor-pointer"
              >
                <KeyRound size={12} className="text-[#DEB368]" />
                <span>Fill Default Credentials: <strong className="text-stone-300">admin@roveandamber.com</strong></span>
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ECC880] via-[#DEB368] to-[#C99042] text-[#281608] hover:brightness-110 active:scale-[0.99] py-3.5 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin text-[#281608]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Atelier Session</span>
                  <ArrowRight size={14} strokeWidth={2.4} />
                </>
              )}
            </button>
          </Form>

          {/* Security Subnote */}
          <div className="mt-6 pt-5 border-t border-stone-800/80 text-center text-[10px] text-stone-500 tracking-wider uppercase flex items-center justify-center gap-2">
            <span>256-Bit TLS</span>
            <span>•</span>
            <span>Role-Based Access Guard</span>
            <span>•</span>
            <span>Encrypted Atelier Session</span>
          </div>
        </div>
      </main>

      {/* Footer System Status */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2 relative z-20 pb-2">
        <p className="m-0">
          © {new Date().getFullYear()} ROVE & AMBER Fine Fragrance Atelier. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Atelier Secure Node: <strong>Active Online</strong></span>
        </div>
      </footer>
    </div>
  );
}
