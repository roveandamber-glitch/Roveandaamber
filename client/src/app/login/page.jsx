"use client";
import React, { useState, Suspense, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Input, ConfigProvider, App } from 'antd';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Loader2, 
  KeyRound, 
  RefreshCw, 
  ArrowLeft, 
  CheckCircle2 
} from 'lucide-react';
import authService from '@/services/authService';

const antdTheme = {
  token: {
    colorPrimary: '#000000',
    colorPrimaryHover: '#333333',
    colorPrimaryActive: '#000000',
    colorError: '#9A3412', // Warm luxury terracotta / amber matching theme
    colorErrorBorder: '#FDBA74',
    colorErrorHover: '#C2410C',
    borderRadius: 12,
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    Input: {
      activeBorderColor: '#000000',
      hoverBorderColor: '#555555',
      paddingBlock: 10,
    },
    Form: {
      itemMarginBottom: 20,
      verticalLabelPadding: '0 0 6px',
    }
  }
};

const LoginContent = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Registration & OTP verification states
  const [registerStep, setRegisterStep] = useState('form'); // 'form' | 'otp'
  const [registerPayload, setRegisterPayload] = useState({ name: '', email: '', password: '' });
  const [otpValue, setOtpValue] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendingOtp, setResendingOtp] = useState(false);

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/';

  // Check existing session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (searchParams?.get('logout') === 'true') {
        authService.clearSession();
        return;
      }

      const currentUser = authService.getUser();
      const currentToken = authService.getToken();

      if (currentUser && currentToken) {
        if (currentUser.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace(redirect === '/admin' ? '/profile' : (redirect === '/' ? '/profile' : redirect));
        }
      }
    }
  }, [router, redirect, searchParams]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle Authentication Login API
  const onLoginFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authService.login({
        email: values.email.trim().toLowerCase(),
        password: values.password
      });

      if (res?.success && res.token && res.user) {
        authService.saveSession(res.user, res.token);

        if (res.user.role === 'admin') {
          message.success('Administrator authenticated.');
          router.push('/admin');
        } else {
          message.success(`Welcome back, ${res.user.name || 'Customer'}!`);
          router.push(redirect === '/admin' ? '/' : redirect);
        }
      } else {
        const errorText = res?.message || 'Incorrect email or password.';
        setErrorMessage(errorText);
      }
    } catch (err) {
      console.error('Login error:', err);

      if (err.response?.data?.field) {
        loginForm.setFields([
          {
            name: err.response.data.field,
            errors: [err.response.data.message]
          }
        ]);
      }

      const isNetworkError = err.code === 'ERR_NETWORK' || !err.response;
      const errorText = isNetworkError
        ? 'Unable to connect to the authentication server. Please ensure the backend is running on http://localhost:5000.'
        : (err.response?.data?.message || 'The email or password you entered is incorrect. Please check your credentials.');
      setErrorMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: User submits registration form -> Dispatch OTP
  const onRequestOtp = async (values) => {
    if (values.password !== values.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      registerForm.setFields([
        {
          name: 'confirmPassword',
          errors: ['Passwords do not match']
        }
      ]);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const email = values.email.trim().toLowerCase();
    const name = values.name.trim();

    try {
      const res = await authService.sendOtp({ email, name });
      if (res?.success) {
        setRegisterPayload({
          name,
          email,
          password: values.password
        });
        setOtpValue('');
        setRegisterStep('otp');
        setResendCountdown(60);
        message.success(`Verification code dispatched to ${email}`);
      } else {
        setErrorMessage(res?.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      console.error('Send OTP error:', err);

      if (err.response?.data?.field) {
        registerForm.setFields([
          {
            name: err.response.data.field,
            errors: [err.response.data.message]
          }
        ]);
      }

      const isNetworkError = err.code === 'ERR_NETWORK' || !err.response;
      const errorText = isNetworkError
        ? 'Unable to connect to the authentication server. Please ensure the backend is running on http://localhost:5000.'
        : (err.response?.data?.message || 'Failed to send verification code. Please check your email and try again.');
      setErrorMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: User verifies OTP and completes registration
  const onVerifyOtpAndRegister = async (e) => {
    if (e) e.preventDefault();

    const cleanOtp = otpValue.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setErrorMessage('Please enter the 6-digit numeric verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.register({
        name: registerPayload.name,
        email: registerPayload.email,
        password: registerPayload.password,
        otp: cleanOtp
      });

      if (res?.success && res.token && res.user) {
        authService.saveSession(res.user, res.token);
        message.success(`Welcome to ROVE & AMBER, ${res.user.name}!`);
        router.push(redirect === '/admin' ? '/' : redirect);
      } else {
        setErrorMessage(res?.message || 'Verification failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration verification error:', err);

      const isNetworkError = err.code === 'ERR_NETWORK' || !err.response;
      const errorText = isNetworkError
        ? 'Unable to connect to the authentication server. Please check your network and try again.'
        : (err.response?.data?.message || 'Invalid or expired verification code. Please try again.');
      setErrorMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP action
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resendingOtp) return;

    setResendingOtp(true);
    setErrorMessage(null);

    try {
      const res = await authService.resendOtp({
        email: registerPayload.email,
        name: registerPayload.name
      });

      if (res?.success) {
        setResendCountdown(60);
        message.success('A new 6-digit verification code has been dispatched.');
      } else {
        setErrorMessage(res?.message || 'Failed to resend verification code.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      const isNetworkError = err.code === 'ERR_NETWORK' || !err.response;
      const errorText = isNetworkError
        ? 'Unable to connect to the server.'
        : (err.response?.data?.message || 'Failed to resend code. Please wait before retrying.');
      setErrorMessage(errorText);
    } finally {
      setResendingOtp(false);
    }
  };

  // Switch tabs
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrorMessage(null);
    if (tab === 'register') {
      setRegisterStep('form');
      setOtpValue('');
    }
  };

  
  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between pt-24 sm:pt-28 font-sans">
      <Navbar />

      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.03)] overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Side: Editorial Image & Brand */}
          <div className="md:col-span-5 relative bg-[#1A1A1A] min-h-[200px] md:min-h-[460px] overflow-hidden">
            <img
              src="/images/perfumes/login_perfume.jpg"
              alt="ROVE & AMBER Fine Fragrance"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.src = '/images/perfumes/amber_oud_perfume.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
            {/* Clean ROVE & AMBER Watermark with Logo */}
            <div className="absolute bottom-6 left-6 right-6 text-white z-10">
              <img 
                src="/images/perfumes/rove_amber_stacked.png" 
                alt="ROVE & AMBER" 
                className="h-14 w-auto object-contain mb-1" 
              />
            </div>
          </div>

          {/* Right Side: Clean & Simple Form */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white">
            
            {/* Header & Tabs Switcher */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <h1 className="text-2xl font-serif font-bold text-black tracking-tight">
                {activeTab === 'login' 
                  ? 'Sign In' 
                  : (registerStep === 'otp' ? 'Verify Email' : 'Create Account')}
              </h1>

              <div className="inline-flex p-1 bg-[#F5F1E9] rounded-full border border-[#E8E2D6]">
                <button
                  type="button"
                  onClick={() => handleTabSwitch('login')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('register')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Elegant Error Alert Notice */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-3 text-[#9A3412] shadow-2xs">
                <div className="w-6 h-6 rounded-full bg-[#FFEDD5] flex items-center justify-center text-[#C2410C] shrink-0 mt-0.5">
                  <AlertCircle size={14} />
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-bold block text-[#7C2D12] mb-0.5">
                    {activeTab === 'login' 
                      ? 'Authentication Notice' 
                      : (registerStep === 'otp' ? 'Verification Notice' : 'Registration Notice')}
                  </span>
                  <span className="text-[#9A3412] font-light leading-relaxed">{errorMessage}</span>
                </div>
              </div>
            )}

            {activeTab === 'login' ? (
              /* Login Form with 2-second debounced validation */
              <Form
                form={loginForm}
                layout="vertical"
                validateDebounce={2000}
                onFinish={onLoginFinish}
                onValuesChange={() => {
                  if (errorMessage) setErrorMessage(null);
                }}
                requiredMark={false}
              >
                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Email Address</span>}
                  name="email"
                  validateDebounce={2000}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Email address is required' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                  className="mb-4"
                >
                  <Input 
                    prefix={<Mail size={14} className="text-gray-400 mr-2" />} 
                    placeholder="your.email@example.com" 
                    className="rounded-xl text-xs bg-[#FAF8F5]/60 focus:bg-white"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Password</span>}
                  name="password"
                  validateDebounce={2000}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[{ required: true, message: 'Password is required' }]}
                  className="mb-6"
                >
                  <Input.Password 
                    prefix={<Lock size={14} className="text-gray-400 mr-2" />} 
                    placeholder="Enter your password" 
                    className="rounded-xl text-xs bg-[#FAF8F5]/60 focus:bg-white"
                    disabled={loading}
                  />
                </Form.Item>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-[#262626] active:bg-black text-white h-11 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>

                
              </Form>
            ) : registerStep === 'form' ? (
              /* Register Step 1: Initial Account Info with 2-second debounced validation */
              <Form
                form={registerForm}
                layout="vertical"
                validateDebounce={2000}
                onFinish={onRequestOtp}
                onValuesChange={() => {
                  if (errorMessage) setErrorMessage(null);
                }}
                requiredMark={false}
              >
                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Full Name</span>}
                  name="name"
                  validateDebounce={2000}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Full name is required' },
                    { min: 2, message: 'Name must be at least 2 characters long' }
                  ]}
                  className="mb-4"
                >
                  <Input 
                    prefix={<User size={14} className="text-gray-400 mr-2" />} 
                    placeholder="Your Name" 
                    className="rounded-xl text-xs bg-[#FAF8F5]/60 focus:bg-white"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Email Address</span>}
                  name="email"
                  validateDebounce={2000}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Email address is required' },
                    { type: 'email', message: 'Please enter a valid email address' }
                  ]}
                  className="mb-4"
                >
                  <Input 
                    prefix={<Mail size={14} className="text-gray-400 mr-2" />} 
                    placeholder="your.email@example.com" 
                    className="rounded-xl text-xs bg-[#FAF8F5]/60 focus:bg-white"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Password</span>}
                  name="password"
                  validateDebounce={2000}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Password is required' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                  className="mb-4"
                >
                  <Input.Password 
                    prefix={<Lock size={14} className="text-gray-400 mr-2" />} 
                    placeholder="Min 6 characters" 
                    className="rounded-xl text-xs bg-[#FAF8F5]/60 focus:bg-white"
                    disabled={loading}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-xs font-semibold text-gray-700">Confirm Password</span>}
                  name="confirmPassword"
                  dependencies={['password']}
                  validateDebounce={2000}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    { required: true, message: 'Please confirm your password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                  className="mb-6"
                >
                  <Input.Password 
                    prefix={<Lock size={14} className="text-gray-400 mr-2" />} 
                    placeholder="Repeat password" 
                    className="rounded-xl text-xs bg-[#FAF8F5]/60 focus:bg-white"
                    disabled={loading}
                  />
                </Form.Item>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-[#262626] active:bg-black text-white h-11 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={13} />
                    </>
                  )}
                </button>
              </Form>
            ) : (
              /* Register Step 2: OTP Verification */
              <form onSubmit={onVerifyOtpAndRegister} className="flex flex-col">
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterStep('form');
                      setErrorMessage(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-black mb-3 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to details</span>
                  </button>

                  <div className="flex items-center gap-3 p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2]">
                    <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                      <KeyRound size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">
                        Verification Sent
                      </p>
                      <p className="text-xs text-gray-800 font-medium truncate">
                        {registerPayload.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    value={otpValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpValue(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••"
                    className="w-full text-center font-mono text-2xl font-bold tracking-[10px] sm:tracking-[14px] h-14 rounded-2xl bg-[#FAF8F5] border border-gray-200 focus:border-black focus:bg-white outline-none transition-all placeholder:text-gray-300 placeholder:tracking-[8px]"
                    disabled={loading}
                  />
                  <p className="text-[11px] text-gray-400 mt-2 text-center">
                    Code is valid for 10 minutes. Check spam folder if not in inbox.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpValue.length !== 6}
                  className="w-full bg-black hover:bg-[#262626] active:bg-black text-white h-11 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Verifying & Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Complete Registration</span>
                      <CheckCircle2 size={14} />
                    </>
                  )}
                </button>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Didn't receive the email?</span>
                  {resendCountdown > 0 ? (
                    <span className="text-gray-400 font-medium">
                      Resend in <strong className="text-gray-700">{resendCountdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendingOtp}
                      className="font-semibold text-black hover:underline cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {resendingOtp ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={12} />
                          <span>Resend Code</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const LoginPage = () => {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <Suspense fallback={<div className="min-h-screen bg-[#F8F7F4]" />}>
          <LoginContent />
        </Suspense>
      </App>
    </ConfigProvider>
  );
};

export default LoginPage;
