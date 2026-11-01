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
  ShieldCheck,
  CheckCircle2
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
    <div 
      className="min-h-screen md:h-screen w-full flex items-center justify-center p-3 sm:p-5 md:p-8 relative overflow-y-auto md:overflow-hidden font-sans selection:bg-[#B3874B]/20 selection:text-black bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/perfumes/login_ambient_bg.jpg')",
        backgroundColor: '#EAE1D5'
      }}
    >
      {/* Warm Ambient Atmosphere Overlay matching user storefront login */}
      <div className="absolute inset-0 bg-[#F5EFE6]/40 backdrop-blur-[2px] pointer-events-none" />

      {/* Main Luxury Card - matches Storefront Login Architecture 1:1 */}
      <div className="w-full max-w-[420px] md:max-w-[880px] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_30px_90px_-15px_rgba(40,25,15,0.22)] overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-white/80 relative z-10 my-auto">
        
        {/* DESKTOP LEFT COLUMN: Luxury Perfume Banner with Atelier Command Badge */}
        <div className="hidden md:block relative w-full h-full min-h-[520px] bg-[#EFE9DF] overflow-hidden select-none">
          <img
            src="/images/perfumes/login_mockup_desktop.jpg"
            alt="ROVE & AMBER Fine Fragrance"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-semibold tracking-widest uppercase mb-2 w-fit">
              <ShieldCheck size={12} className="text-[#DEB368]" />
              <span>Atelier Command</span>
            </div>
            <h2 className="font-serif text-xl font-normal text-white drop-shadow-sm mb-1">
              Boutique Operations Portal
            </h2>
            <p className="text-[11px] text-white/80 font-light leading-relaxed max-w-xs">
              Manage artisanal flacons, patron orders, inventory stock, and boutique analytics.
            </p>
          </div>
        </div>

        {/* MOBILE TOP BANNER */}
        <div className="block md:hidden relative w-full h-[210px] xs:h-[240px] bg-[#EFE9DF] overflow-hidden select-none">
          <img
            src="/images/perfumes/login_mockup_mobile.jpg"
            alt="ROVE & AMBER Fine Fragrance"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-5 text-white">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-semibold tracking-widest uppercase">
              <ShieldCheck size={11} className="text-[#DEB368]" />
              <span>Atelier Command</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean, User-Friendly Editorial Form */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white overflow-y-auto">
          
          {/* Header */}
          <div className="mb-5 sm:mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-lg bg-[#FAF5EE] border border-[#E8DFC8] flex items-center justify-center text-[#B3874B]">
                <Sparkles size={13} />
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B3874B]">
                Executive Suite
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-[30px] font-normal text-gray-900 tracking-tight leading-tight mb-1">
              Welcome Back
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 font-light leading-relaxed">
              Sign in to access your Rove & Amber administrative atelier dashboard.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-2.5 text-[#9A3412] text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-[#C2410C]" />
              <span className="leading-relaxed font-light">{errorMessage}</span>
            </div>
          )}

          {/* Admin Login Form */}
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
              label={<span className="text-xs font-semibold text-gray-800">Administrator Email</span>}
              name="email"
              validateTrigger={[]}
              rules={[
                { required: true, message: 'Administrator email is required' },
                { type: 'email', message: 'Please enter a valid administrator email address' }
              ]}
              className="mb-3.5"
            >
              <Input
                prefix={<Mail size={14} className="text-gray-400 mr-2" />}
                placeholder="Enter your administrator email"
                autoComplete="off"
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                disabled={loading}
                className="rounded-xl text-xs h-11 bg-white border-[#E8E2D8] focus:bg-white placeholder:text-gray-400"
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              label={<span className="text-xs font-semibold text-gray-800">Security Passcode</span>}
              name="password"
              validateTrigger={['onBlur']}
              rules={[{ required: true, message: 'Security passcode is required' }]}
              className="mb-5"
            >
              <Input.Password
                prefix={<Lock size={14} className="text-gray-400 mr-2" />}
                placeholder="Enter your security passcode"
                autoComplete="current-password"
                disabled={loading}
                className="rounded-xl text-xs h-11 bg-white border-[#E8E2D8] focus:bg-white placeholder:text-gray-400"
              />
            </Form.Item>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#181411] hover:bg-[#2A231E] active:bg-black text-white h-11 rounded-full font-medium text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Atelier</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </Form>

          {/* Footer Navigation: Return to Boutique & Security Info */}
          <div className="mt-6 pt-4 border-t border-[#E8E2D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-light">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#B3874B] hover:text-[#8C6228] font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Return to Storefront</span>
            </Link>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>256-Bit SSL Secured</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
