"use client";
import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Input, Modal, ConfigProvider, App } from 'antd';
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
import cartService from '@/services/cartService';

const antdTheme = {
  token: {
    colorPrimary: '#181411',
    colorPrimaryHover: '#332A24',
    colorPrimaryActive: '#181411',
    colorError: '#9A3412',
    colorErrorBorder: '#FDBA74',
    colorErrorHover: '#C2410C',
    borderRadius: 12,
    fontFamily: '"Inter", sans-serif',
  },
  components: {
    Input: {
      activeBorderColor: '#181411',
      hoverBorderColor: '#8C6228',
      paddingBlock: 9,
      borderRadius: 12,
    },
    Form: {
      itemMarginBottom: 14,
      verticalLabelPadding: '0 0 4px',
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

  // Forgot password states
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'otp'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotCountdown, setForgotCountdown] = useState(0);

  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [forgotEmailForm] = Form.useForm();
  const [forgotResetForm] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/';

  // Check existing session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loginForm.resetFields();
      registerForm.resetFields();
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

  // Forgot password countdown timer
  useEffect(() => {
    if (forgotCountdown > 0) {
      const timer = setTimeout(() => {
        setForgotCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forgotCountdown]);

  // Handle send forgot password OTP
  const handleSendForgotOtp = async (values) => {
    setForgotLoading(true);
    setForgotError(null);
    try {
      const cleanEmail = values.email.trim().toLowerCase();
      const res = await authService.forgotPassword({ email: cleanEmail });
      setForgotEmail(cleanEmail);
      setForgotStep('otp');
      setForgotCountdown(60);
      message.success(res.message || 'Verification code sent to your email.');
    } catch (err) {
      console.error('Forgot password send error:', err);
      const isNetwork = err.code === 'ERR_NETWORK' || !err.response;
      setForgotError(isNetwork ? 'Unable to connect to server. Please try again.' : (err.response?.data?.message || 'Failed to send recovery code.'));
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle reset password with OTP
  const handleResetPassword = async (values) => {
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await authService.resetPassword({
        email: forgotEmail,
        otp: values.otp.trim(),
        newPassword: values.newPassword
      });
      message.success(res.message || 'Password reset successfully!');
      setForgotModalOpen(false);
      setForgotStep('email');
      forgotEmailForm.resetFields();
      forgotResetForm.resetFields();
      loginForm.setFieldsValue({ email: forgotEmail, password: '' });
    } catch (err) {
      console.error('Reset password error:', err);
      const isNetwork = err.code === 'ERR_NETWORK' || !err.response;
      setForgotError(isNetwork ? 'Unable to connect to server.' : (err.response?.data?.message || 'Failed to reset password. Please verify the code.'));
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle resend forgot password OTP
  const handleResendForgotOtp = async () => {
    if (forgotCountdown > 0 || !forgotEmail) return;
    setForgotLoading(true);
    setForgotError(null);
    try {
      const res = await authService.forgotPassword({ email: forgotEmail });
      setForgotCountdown(60);
      message.success(res.message || 'A new reset code has been sent.');
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setForgotLoading(false);
    }
  };

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

  // Step 2: User enters OTP -> Verify code & Register
  const onVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.register({
        name: registerPayload.name,
        email: registerPayload.email,
        password: registerPayload.password,
        otp: otpValue
      });

      if (res?.success && res.token && res.user) {
        authService.saveSession(res.user, res.token);
        cartService.clearCart(); // Fresh account starts with empty cart
        message.success(`Account successfully created! Welcome to ROVE & AMBER, ${res.user.name}.`);
        router.push(redirect === '/admin' ? '/' : redirect);
      } else {
        setErrorMessage(res?.message || 'Registration failed. Please check the code and try again.');
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

  // Resend OTP code
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || !registerPayload.email) return;
    setResendingOtp(true);
    setErrorMessage(null);

    try {
      const res = await authService.resendOtp({
        email: registerPayload.email,
        name: registerPayload.name
      });
      if (res?.success) {
        setResendCountdown(60);
        message.success(`A new verification code has been dispatched to ${registerPayload.email}`);
      } else {
        setErrorMessage(res?.message || 'Failed to resend code.');
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

  return (
    <div 
      className="min-h-screen md:h-screen w-full flex items-center justify-center p-3 sm:p-5 md:p-8 relative overflow-y-auto md:overflow-hidden font-sans selection:bg-[#B3874B]/20 selection:text-black bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/perfumes/login_ambient_bg.jpg')",
        backgroundColor: '#EAE1D5'
      }}
    >
      {/* Warm Ambient Atmosphere Overlay matching mockup */}
      <div className="absolute inset-0 bg-[#F5EFE6]/40 backdrop-blur-[2px] pointer-events-none" />

      {/* Subtle Back Link to Maison Home */}
      <Link
        href="/"
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 inline-flex items-center gap-2 text-xs font-medium text-gray-700 hover:text-black transition-colors group cursor-pointer"
      >
        <span className="w-8 h-8 rounded-full bg-white/75 backdrop-blur-md border border-black/10 flex items-center justify-center group-hover:bg-white group-hover:border-black/25 shadow-xs transition-all text-gray-800">
          <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
        </span>
        <span className="hidden sm:inline tracking-wider uppercase text-[10px] font-semibold">Back to Maison</span>
      </Link>

      {/* Main Luxury Card - matches Desktop & Mobile Mockups 1:1 */}
      <div className="w-full max-w-[420px] md:max-w-[880px] bg-white rounded-[28px] sm:rounded-[36px] shadow-[0_30px_90px_-15px_rgba(40,25,15,0.22)] overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-white/80 relative z-10 my-auto">
        
        {/* DESKTOP LEFT COLUMN: Exact Rove & Amber Marble Cap Perfume Banner (Hidden on Mobile) */}
        <div className="hidden md:block relative w-full h-full min-h-[520px] bg-[#EFE9DF] overflow-hidden select-none">
          <img
            src="/images/perfumes/login_mockup_desktop.jpg"
            alt="ROVE & AMBER Fine Fragrance"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* MOBILE TOP BANNER: Exact Mobile Banner with bottom curve scoop (Hidden on Desktop) */}
        <div className="block md:hidden relative w-full h-[235px] xs:h-[265px] bg-[#EFE9DF] overflow-hidden select-none">
          <img
            src="/images/perfumes/login_mockup_mobile.jpg"
            alt="ROVE & AMBER Fine Fragrance"
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Right Column: Clean Editorial Form */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-white overflow-y-auto">
          
          {/* Header: Title & Subtitle */}
          <div className="mb-4 sm:mb-5">
            <h1 className="font-serif text-2xl sm:text-[30px] font-normal text-gray-900 tracking-tight leading-tight mb-1">
              {activeTab === 'login'
                ? 'Welcome Back'
                : registerStep === 'otp'
                ? 'Verify Email'
                : 'Create Account'}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 font-light leading-relaxed">
              {activeTab === 'login'
                ? 'Sign in to manage your Rove & Amber account.'
                : registerStep === 'otp'
                ? `Enter the 6-digit verification code dispatched to ${registerPayload.email}`
                : 'Sign up to discover and collect fine fragrances.'}
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-2 text-[#9A3412] text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5 text-[#C2410C]" />
              <span className="leading-relaxed font-light">{errorMessage}</span>
            </div>
          )}

          {/* View 1: Login Form */}
          {activeTab === 'login' ? (
            <Form
              form={loginForm}
              layout="vertical"
              onFinish={onLoginFinish}
              onValuesChange={() => {
                if (errorMessage) setErrorMessage(null);
              }}
              requiredMark={false}
              autoComplete="off"
            >
              <Form.Item
                label={<span className="text-xs font-semibold text-gray-800">Email Address</span>}
                name="email"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Email address is required' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
                className="mb-3"
              >
                <Input 
                  prefix={<Mail size={14} className="text-gray-400 mr-2" />} 
                  placeholder="Enter your email address" 
                  autoComplete="off"
                  className="rounded-xl text-xs h-10 bg-white border-[#E8E2D8] focus:bg-white placeholder:text-gray-400 placeholder:text-xs"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-800">Password</span>}
                name="password"
                validateTrigger={['onChange', 'onBlur']}
                rules={[{ required: true, message: 'Password is required' }]}
                className="mb-1"
              >
                <Input.Password 
                  prefix={<Lock size={14} className="text-gray-400 mr-2" />} 
                  placeholder="Enter your password" 
                  autoComplete="new-password"
                  className="rounded-xl text-xs h-10 bg-white border-[#E8E2D8] focus:bg-white placeholder:text-gray-400 placeholder:text-xs"
                  disabled={loading}
                />
              </Form.Item>

              {/* Right-aligned Forgot Password link */}
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(true);
                    setForgotStep('email');
                    setForgotError(null);
                    const currentEmail = loginForm.getFieldValue('email');
                    if (currentEmail) forgotEmailForm.setFieldsValue({ email: currentEmail });
                  }}
                  className="text-xs text-[#B3874B] hover:text-[#8C6228] font-normal transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Main Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#181411] hover:bg-[#2A231E] active:bg-black text-white h-11 rounded-full font-medium text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-60"
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

              {/* Divider: or continue with */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8E2D8]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400 font-light text-[11px]">or continue with</span>
                </div>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={() => message.info('Google Sign-In is configured with your domain credentials.')}
                className="w-full bg-white hover:bg-[#F9F7F3] border border-[#E2DBD0] text-gray-700 h-11 rounded-full font-medium text-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-2xs hover:shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Footer Switch to Register */}
              <div className="mt-4 sm:mt-5 text-center text-xs text-gray-500 font-light">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegisterStep('form');
                    setErrorMessage(null);
                  }}
                  className="text-[#B3874B] font-semibold hover:text-[#8C6228] hover:underline cursor-pointer transition-colors ml-1"
                >
                  Register
                </button>
              </div>
            </Form>
          ) : registerStep === 'form' ? (
            /* View 2: Register Form */
            <Form
              form={registerForm}
              layout="vertical"
              onFinish={onRequestOtp}
              onValuesChange={() => {
                if (errorMessage) setErrorMessage(null);
              }}
              requiredMark={false}
            >
              <Form.Item
                label={<span className="text-xs font-semibold text-gray-800">Full Name</span>}
                name="name"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Name is required' },
                  { min: 2, message: 'Name must be at least 2 characters' }
                ]}
                className="mb-2.5"
              >
                <Input 
                  prefix={<User size={14} className="text-gray-400 mr-2" />} 
                  placeholder="Enter your full name" 
                  className="rounded-xl text-xs h-10 bg-white border-[#E8E2D8] focus:bg-white placeholder:text-gray-400 placeholder:text-xs"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-800">Email Address</span>}
                name="email"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Email address is required' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
                className="mb-2.5"
              >
                <Input 
                  prefix={<Mail size={14} className="text-gray-400 mr-2" />} 
                  placeholder="Enter your email address" 
                  className="rounded-xl text-xs h-10 bg-white border-[#E8E2D8] focus:bg-white placeholder:text-gray-400 placeholder:text-xs"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-800">Password</span>}
                name="password"
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Password is required' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
                className="mb-2.5"
              >
                <Input.Password 
                  prefix={<Lock size={14} className="text-gray-400 mr-2" />} 
                  placeholder="Create password (min. 6 chars)" 
                  className="rounded-xl text-xs h-10 bg-white border-[#E8E2D8] focus:bg-white placeholder:text-gray-400 placeholder:text-xs"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-800">Confirm Password</span>}
                name="confirmPassword"
                dependencies={['password']}
                validateTrigger={['onChange', 'onBlur']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    }
                  })
                ]}
                className="mb-4"
              >
                <Input.Password 
                  prefix={<Lock size={14} className="text-gray-400 mr-2" />} 
                  placeholder="Re-enter password" 
                  className="rounded-xl text-xs h-10 bg-white border-[#E8E2D8] focus:bg-white placeholder:text-gray-400 placeholder:text-xs"
                  disabled={loading}
                />
              </Form.Item>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#181411] hover:bg-[#2A231E] active:bg-black text-white h-11 rounded-full font-medium text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>

              {/* Divider: or continue with */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E8E2D8]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400 font-light text-[11px]">or continue with</span>
                </div>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={() => message.info('Google Sign-In is configured with your domain credentials.')}
                className="w-full bg-white hover:bg-[#F9F7F3] border border-[#E2DBD0] text-gray-700 h-11 rounded-full font-medium text-xs flex items-center justify-center gap-2.5 cursor-pointer transition-all shadow-2xs hover:shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Footer Switch to Sign In */}
              <div className="mt-4 sm:mt-5 text-center text-xs text-gray-500 font-light">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className="text-[#B3874B] font-semibold hover:text-[#8C6228] hover:underline cursor-pointer transition-colors ml-1"
                >
                  Sign In
                </button>
              </div>
            </Form>
          ) : (
            /* View 3: Registration OTP Verification */
            <form onSubmit={onVerifyAndRegister} className="mt-1">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-800">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterStep('form');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ArrowLeft size={11} />
                    <span>Change Details</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpValue(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[12px] font-mono text-xl font-bold h-11 rounded-xl bg-white border border-[#E8E2D8] text-gray-900 focus:outline-none focus:border-black transition-colors"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpValue.length !== 6}
                className="w-full bg-[#181411] hover:bg-[#2A231E] active:bg-black text-white h-11 rounded-full font-medium text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Verifying & Activating...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <CheckCircle2 size={14} />
                  </>
                )}
              </button>

              <div className="mt-5 pt-3.5 border-t border-[#E8E2D8] flex items-center justify-between text-xs text-gray-500 font-light">
                <span>Didn't receive the email?</span>
                {resendCountdown > 0 ? (
                  <span className="text-gray-400">
                    Resend in <strong className="text-gray-700 font-semibold">{resendCountdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendingOtp}
                    className="font-semibold text-[#B3874B] hover:text-[#8C6228] hover:underline cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
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

      {/* Luxury Branded Forgot Password Modal */}
      <Modal
        open={forgotModalOpen}
        onCancel={() => {
          if (!forgotLoading) {
            setForgotModalOpen(false);
            setForgotError(null);
          }
        }}
        footer={null}
        centered
        width={420}
        destroyOnHidden
        styles={{
          content: {
            borderRadius: 24,
            padding: '28px 22px',
            backgroundColor: '#FCFAF6',
            boxShadow: '0 25px 60px -12px rgba(45, 30, 15, 0.25)',
            border: '1px solid #E8E1D5'
          }
        }}
      >
        {forgotStep === 'email' ? (
          <div>
            <div className="text-center mb-5">
              <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#E8E1D5] flex items-center justify-center mx-auto mb-2.5 text-[#B3874B]">
                <KeyRound size={20} />
              </div>
              <h3 className="font-serif text-2xl font-normal tracking-tight text-gray-900 mb-1">
                Forgot Password
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed max-w-xs mx-auto">
                Enter your registered client email address and we'll send you a 6-digit recovery code.
              </p>
            </div>

            {forgotError && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-2 text-[#9A3412] text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-[#C2410C]" />
                <span className="leading-relaxed font-light">{forgotError}</span>
              </div>
            )}

            <Form
              form={forgotEmailForm}
              layout="vertical"
              onFinish={handleSendForgotOtp}
              requiredMark={false}
            >
              <Form.Item
                label={<span className="text-xs font-semibold text-gray-800">Client Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Email address is required' },
                  { type: 'email', message: 'Please enter a valid email address' }
                ]}
                className="mb-5"
              >
                <Input
                  prefix={<Mail size={14} className="text-gray-400 mr-2" />}
                  placeholder="your.email@example.com"
                  className="rounded-xl text-xs h-10 bg-white border-[#E8E2D8] focus:bg-white"
                  disabled={forgotLoading}
                />
              </Form.Item>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-[#181411] hover:bg-[#2A231E] active:bg-black text-white h-11 rounded-full font-medium tracking-wide text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
              >
                {forgotLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Dispatching Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Recovery Code</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </Form>
          </div>
        ) : (
          <div>
            <div className="text-center mb-5">
              <div className="w-11 h-11 rounded-full bg-[#FAF5EE] border border-[#E8E1D5] flex items-center justify-center mx-auto mb-2.5 text-[#B3874B]">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-serif text-2xl font-normal tracking-tight text-gray-900 mb-1">
                Reset Password
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed max-w-xs mx-auto">
                Enter the 6-digit code sent to <strong className="text-gray-800 font-medium">{forgotEmail}</strong> and set your new password.
              </p>
            </div>

            {forgotError && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-2 text-[#9A3412] text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5 text-[#C2410C]" />
                <span className="leading-relaxed font-light">{forgotError}</span>
              </div>
            )}

            <Form
              form={forgotResetForm}
              layout="vertical"
              onFinish={handleResetPassword}
              requiredMark={false}
            >
              <Form.Item
                label={<span className="text-xs font-semibold text-gray-800">6-Digit Code</span>}
                name="otp"
                rules={[
                  { required: true, message: 'Verification code is required' },
                  { len: 6, message: 'Code must be exactly 6 digits' }
                ]}
                className="mb-3"
              >
                <Input
                  prefix={<KeyRound size={14} className="text-gray-400 mr-2" />}
                  placeholder="123456"
                  maxLength={6}
                  className="rounded-xl text-center font-mono font-bold tracking-widest text-sm h-10 bg-white border-[#E8E2D8] focus:bg-white"
                  disabled={forgotLoading}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-800">New Password</span>}
                name="newPassword"
                rules={[
                  { required: true, message: 'New password is required' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
                className="mb-3"
              >
                <Input.Password
                  prefix={<Lock size={14} className="text-gray-400 mr-2" />}
                  placeholder="Min 6 characters"
                  className="rounded-xl text-xs h-10 bg-white border-[#E8E2D8] focus:bg-white"
                  disabled={forgotLoading}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-xs font-semibold text-gray-800">Confirm New Password</span>}
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match'));
                    }
                  })
                ]}
                className="mb-5"
              >
                <Input.Password
                  prefix={<Lock size={14} className="text-gray-400 mr-2" />}
                  placeholder="Repeat new password"
                  className="rounded-xl text-xs h-10 bg-white border-[#E8E2D8] focus:bg-white"
                  disabled={forgotLoading}
                />
              </Form.Item>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full bg-[#181411] hover:bg-[#2A231E] active:bg-black text-white h-11 rounded-full font-medium tracking-wide text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60 mb-3.5"
              >
                {forgotLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <CheckCircle2 size={14} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-500 font-light pt-2.5 border-t border-[#E8E2D8]">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('email');
                    setForgotError(null);
                  }}
                  className="text-gray-500 hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ArrowLeft size={12} />
                  <span>Change Email</span>
                </button>

                {forgotCountdown > 0 ? (
                  <span className="text-gray-400">
                    Resend in <strong className="text-gray-700 font-semibold">{forgotCountdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendForgotOtp}
                    disabled={forgotLoading}
                    className="text-[#B3874B] font-semibold hover:text-[#8C6228] hover:underline cursor-pointer flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={12} />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

const LoginPage = () => {
  return (
    <ConfigProvider theme={antdTheme}>
      <App>
        <Suspense fallback={<div className="h-screen w-full bg-[#523A25]" />}>
          <LoginContent />
        </Suspense>
      </App>
    </ConfigProvider>
  );
};

export default LoginPage;
