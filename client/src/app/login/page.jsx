"use client";
import React, { useState, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Form, Input, message, ConfigProvider } from 'antd';
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [errorMessage, setErrorMessage] = useState(null);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/';

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('adminKey');
      const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');
      
      if (userStr) {
        try {
          const parsed = JSON.parse(userStr);
          if (parsed.role === 'admin' && adminToken) {
            router.replace('/admin');
          } else if (userToken) {
            router.replace(redirect === '/admin' ? '/profile' : (redirect === '/' ? '/profile' : redirect));
          }
        } catch (e) {}
      }
    }
  }, [router, redirect]);

  const onLoginFinish = async (values) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authService.login({
        email: values.email.trim().toLowerCase(),
        password: values.password
      });

      if (res?.success && res.token) {
        localStorage.setItem('user', JSON.stringify(res.user));
        
        // Role-Based Token Separation & Redirection
        if (res.user?.role === 'admin') {
          localStorage.setItem('adminToken', res.token);
          localStorage.setItem('adminKey', res.token);
          localStorage.removeItem('userToken');
          window.dispatchEvent(new Event('authChange'));
          message.success('Administrator authenticated.');
          router.push('/admin');
        } else {
          localStorage.setItem('userToken', res.token);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminKey');
          window.dispatchEvent(new Event('authChange'));
          message.success(`Welcome back, ${res.user?.name || 'Customer'}!`);
          router.push(redirect === '/admin' ? '/' : redirect);
        }
      } else {
        const errorText = res?.message || 'Incorrect email or password.';
        setErrorMessage(errorText);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorText = err.response?.data?.message || 'The email or password you entered is incorrect. Please check your credentials.';
      setErrorMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await authService.register({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password
      });
      if (res?.success && res.token) {
        localStorage.setItem('userToken', res.token);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminKey');
        localStorage.setItem('user', JSON.stringify(res.user));
        window.dispatchEvent(new Event('authChange'));
        message.success(`Welcome to ROVE & AMBER, ${res.user?.name}!`);
        router.push(redirect === '/admin' ? '/' : redirect);
      } else {
        setErrorMessage(res?.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setErrorMessage(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col justify-between pt-24 sm:pt-28 font-sans">
        <Navbar />

        <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex items-center justify-center">
          <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-[0_8px_40px_rgba(0,0,0,0.03)] overflow-hidden grid grid-cols-1 md:grid-cols-12">
            
            {/* Left Side: Brand New ROVE & AMBER Editorial Image */}
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
                  {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                </h1>

                <div className="inline-flex p-1 bg-[#F5F1E9] rounded-full border border-[#E8E2D6]">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMessage(null);
                    }}
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
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMessage(null);
                    }}
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
                      {activeTab === 'login' ? 'Authentication Notice' : 'Registration Notice'}
                    </span>
                    <span className="text-[#9A3412] font-light leading-relaxed">{errorMessage}</span>
                  </div>
                </div>
              )}

              {activeTab === 'login' ? (
                /* Simple Login Form */
                <Form
                  form={loginForm}
                  layout="vertical"
                  onFinish={onLoginFinish}
                  onValuesChange={() => {
                    if (errorMessage) setErrorMessage(null);
                  }}
                  requiredMark={false}
                >
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Email Address</span>}
                    name="email"
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
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Password</span>}
                    name="password"
                    rules={[{ required: true, message: 'Password is required' }]}
                    className="mb-6"
                  >
                    <Input.Password 
                      prefix={<Lock size={14} className="text-gray-400 mr-2" />} 
                      placeholder="Enter your password" 
                      className="rounded-xl text-xs bg-[#FAF8F5]/60 focus:bg-white"
                    />
                  </Form.Item>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black hover:bg-[#262626] active:bg-black text-white h-11 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2"
                  >
                    <span>{loading ? 'Signing In...' : 'Sign In'}</span>
                    <ArrowRight size={13} />
                  </button>
                </Form>
              ) : (
                /* Simple Register Form */
                <Form
                  form={registerForm}
                  layout="vertical"
                  onFinish={onRegisterFinish}
                  onValuesChange={() => {
                    if (errorMessage) setErrorMessage(null);
                  }}
                  requiredMark={false}
                >
                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Full Name</span>}
                    name="name"
                    rules={[{ required: true, message: 'Full name is required' }]}
                    className="mb-4"
                  >
                    <Input 
                      prefix={<User size={14} className="text-gray-400 mr-2" />} 
                      placeholder="Your Name" 
                      className="rounded-xl text-xs bg-[#FAF8F5]/60 focus:bg-white"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Email Address</span>}
                    name="email"
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
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Password</span>}
                    name="password"
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
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs font-semibold text-gray-700">Confirm Password</span>}
                    name="confirmPassword"
                    dependencies={['password']}
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
                    />
                  </Form.Item>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black hover:bg-[#262626] active:bg-black text-white h-11 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2"
                  >
                    <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                    <ArrowRight size={13} />
                  </button>
                </Form>
              )}

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ConfigProvider>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F7F4]" />}>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;
