"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Form, Input, message } from 'antd';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import authService from '@/services/authService';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // 3-second debouncing for administrator email validation
  const emailTimerRef = useRef(null);
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (emailTimerRef.current) clearTimeout(emailTimerRef.current);
    };
  }, []);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = authService.getAdminUser ? authService.getAdminUser() : authService.getUser();
      const token = authService.getAdminToken ? authService.getAdminToken() : authService.getToken();
      if (user && user.role === 'admin' && token) {
        router.replace('/admin');
      }
    }
  }, [router]);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    if (errorMessage) setErrorMessage(null);
    if (emailTimerRef.current) {
      clearTimeout(emailTimerRef.current);
    }
    // Clear validation error immediately while typing
    form.setFields([{ name: 'email', errors: [] }]);

    const trimmed = (val || '').trim();
    if (!trimmed) return;

    // Wait 3 seconds (3000ms) of typing pause before validating
    emailTimerRef.current = setTimeout(() => {
      if (trimmed && !EMAIL_REGEX.test(trimmed)) {
        form.setFields([
          {
            name: 'email',
            errors: ['Please enter a valid administrator email address']
          }
        ]);
      } else {
        form.setFields([{ name: 'email', errors: [] }]);
      }
    }, 3000);
  };

  const handleEmailBlur = () => {
    if (emailTimerRef.current) {
      clearTimeout(emailTimerRef.current);
    }
    const val = (form.getFieldValue('email') || '').trim();
    if (!val) {
      form.setFields([
        {
          name: 'email',
          errors: ['Administrator email is required']
        }
      ]);
    } else if (!EMAIL_REGEX.test(val)) {
      form.setFields([
        {
          name: 'email',
          errors: ['Please enter a valid administrator email address']
        }
      ]);
    } else {
      form.setFields([{ name: 'email', errors: [] }]);
    }
  };

  const handleAdminLogin = async (values) => {
    setLoading(true);
    setErrorMessage(null);

    const email = values.email.trim().toLowerCase();
    const password = values.password;

    try {
      const res = await authService.login({ email, password });

      if (res?.success && res.token && res.user) {
        if (res.user.role !== 'admin') {
          setErrorMessage('Access Denied: This portal requires verified Administrator credentials.');
          return;
        }

        // Save session in both authService and localStorage
        authService.saveSession(res.user, res.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminToken', res.token);
          localStorage.setItem('adminKey', res.token);
          localStorage.setItem('adminUser', JSON.stringify(res.user));
          window.dispatchEvent(new Event('authChange'));
        }

        message.success(`Welcome back, ${res.user.name || 'Administrator'}!`);
        router.replace('/admin');
      } else {
        setErrorMessage(res?.message || 'Invalid administrator email or password.');
      }
    } catch (err) {
      console.error('Admin authentication error:', err);
      const isNetworkError = err.code === 'ERR_NETWORK' || !err.response;
      const errorText = isNetworkError
        ? 'Unable to connect to the authentication service. Please check your network connection and try again.'
        : (err.response?.data?.message || 'Invalid credentials. Please verify your administrator email and password.');
      setErrorMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 relative overflow-x-hidden font-sans selection:bg-[#B3874B]/20 selection:text-black">
      
      {/* Subtle luxury ambient gold glow in the background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-amber-100/60 via-[#F3EAD9]/40 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-50/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Navigation back to Storefront & Security Badge */}
      <header className="w-full max-w-5xl flex items-center justify-between relative z-20 py-2">
        <a 
          href={typeof window !== 'undefined' && window.location.hostname.includes('admin.') ? 'https://www.roveandamber.com' : '/'}
          className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-[#B3874B] transition-colors group cursor-pointer"
        >
          <span className="w-8 h-8 rounded-full bg-white border border-[#E8DFC8] flex items-center justify-center group-hover:border-[#B3874B] shadow-2xs transition-all text-stone-700">
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
          </span>
          <span className="tracking-wider uppercase text-[11px] font-semibold">
            Return to Boutique
          </span>
        </a>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#E8DFC8] shadow-2xs text-[10px] font-semibold text-stone-600 tracking-wider uppercase">
          <ShieldCheck size={13} className="text-[#B3874B]" />
          <span>Atelier Portal</span>
        </div>
      </header>

      {/* Centerpiece: Clean Executive Administrative Card */}
      <main className="w-full max-w-[460px] my-auto relative z-20 py-6">
        <div className="bg-white rounded-[26px] border border-[#E8DFC8] shadow-[0_20px_60px_-15px_rgba(27,16,10,0.10)] p-7 sm:p-9 relative">
          
          {/* Emblem & Branding Header */}
          <div className="text-center mb-6">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#D4A64A] via-[#C59B3F] to-[#B38728] shadow-md flex items-center justify-center mx-auto mb-3.5 text-[#1B100A]">
              <span className="font-serif font-bold text-lg sm:text-xl tracking-wider">RA</span>
            </div>

            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#B3874B] block mb-1">
              ROVE & AMBER • ATELIER COMMAND
            </span>
            <h1 className="text-2xl sm:text-[26px] font-serif font-normal text-stone-900 tracking-tight leading-tight">
              Executive Atelier Access
            </h1>
            <p className="text-xs text-stone-500 font-light mt-1.5 max-w-[340px] mx-auto leading-relaxed">
              Sign in with your administrative credentials to manage boutique formulations, inventory dispatch, and patron orders.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-2.5 text-[#9A3412] text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-[#C2410C]" />
              <span className="leading-relaxed font-light">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAdminLogin}
            onValuesChange={() => {
              if (errorMessage) setErrorMessage(null);
            }}
            requiredMark={false}
            autoComplete="off"
          >
            {/* Email Field */}
            <Form.Item
              name="email"
              label={
                <span className="text-xs font-semibold text-stone-800">
                  Administrator Email
                </span>
              }
              validateTrigger={[]}
              rules={[
                { required: true, message: 'Please enter your administrator email' },
                { type: 'email', message: 'Please enter a valid administrator email address' }
              ]}
              className="mb-4"
            >
              <Input
                prefix={<Mail size={14} className="text-stone-400 mr-2" />}
                placeholder="admin@roveandamber.com"
                autoComplete="off"
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                disabled={loading}
                className="rounded-xl text-xs h-11 bg-[#FAF8F5] border-[#E5DDD0] focus:bg-white focus:border-[#B3874B] placeholder:text-stone-400"
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              label={
                <span className="text-xs font-semibold text-stone-800">
                  Security Passcode
                </span>
              }
              validateTrigger={['onBlur']}
              rules={[{ required: true, message: 'Please enter your administrator passcode' }]}
              className="mb-6"
            >
              <Input.Password
                prefix={<Lock size={14} className="text-stone-400 mr-2" />}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className="rounded-xl text-xs h-11 bg-[#FAF8F5] border-[#E5DDD0] focus:bg-white focus:border-[#B3874B] placeholder:text-stone-400"
              />
            </Form.Item>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B100A] hover:bg-[#2C1B12] active:bg-black text-white py-3.5 rounded-full font-semibold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Atelier Session</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </Form>

          {/* Security Subnote */}
          <div className="mt-6 pt-4 border-t border-[#EFE8DE] text-center text-[10px] text-stone-400 tracking-wider uppercase flex items-center justify-center gap-2">
            <span>256-Bit SSL</span>
            <span>•</span>
            <span>Role-Based Guard</span>
            <span>•</span>
            <span>Encrypted Session</span>
          </div>

        </div>
      </main>

      {/* Footer System Status */}
      <footer className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2 relative z-20 py-2">
        <p className="m-0">
          © {new Date().getFullYear()} ROVE & AMBER Fine Fragrance Atelier. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Atelier Secure Node: <strong className="text-stone-700 font-semibold">Active Online</strong></span>
        </div>
      </footer>

    </div>
  );
}
