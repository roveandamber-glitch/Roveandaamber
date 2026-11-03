"use client";
import React, { useState, useEffect } from 'react';
import { Form, Input, message } from 'antd';
import { 
  Mail, 
  Lock, 
  Key, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import adminService from '@/services/adminService';

export default function AdminSettingsPage() {
  const [emailForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [emailSaving, setEmailSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSettings();
      if (res?.data?.email || res?.data?.contactEmail) {
        emailForm.setFieldsValue({
          contactEmail: res.data.email || res.data.contactEmail
        });
      }
    } catch (err) {
      console.warn('Could not load admin settings:', err);
      emailForm.setFieldsValue({
        contactEmail: 'concierge@roveandamber.com'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (values) => {
    setEmailSaving(true);
    try {
      const res = await adminService.updateContactEmail(values.contactEmail);
      message.success(res?.message || 'Contact email updated successfully.');
      emailForm.setFieldsValue({ contactEmail: values.contactEmail });
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update contact email.';
      message.error(errMsg);
    } finally {
      setEmailSaving(false);
    }
  };

  const handleChangePassword = async (values) => {
    setPasswordSaving(true);
    try {
      const res = await adminService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      message.success(res?.message || 'Administrator password updated successfully.');
      passwordForm.resetFields();
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to update password. Please check your current password.';
      message.error(errMsg);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-[#1B100A]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-serif font-normal text-[#1B100A] tracking-tight">
              Store & Security Settings
            </h1>
            <span className="text-xs bg-[#FAF7F2] text-[#1B100A] px-2.5 py-0.5 rounded-full font-medium border border-[#E8DFC8]">
              Atelier Control
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage concierge contact email and secure master administrator credentials.
          </p>
        </div>
      </div>

      {/* Feature 1: Contact Email Update */}
      <div className="bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3E0] border border-[#E0D0A5] text-[#B8860B] flex items-center justify-center">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-serif font-medium text-sm text-[#1B100A]">
                Concierge Contact Email
              </h3>
              <p className="text-[11px] text-gray-500">
                Official contact email for boutique customer communications, inquiries, and notifications.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
            Verified Contact
          </span>
        </div>

        <Form
          form={emailForm}
          layout="vertical"
          onFinish={handleUpdateEmail}
          className="space-y-4"
        >
          <div className="max-w-xl">
            <Form.Item
              name="contactEmail"
              label={<span className="text-xs font-semibold text-gray-700">Concierge Email Address</span>}
              rules={[
                { required: true, message: 'Please enter a contact email' },
                { type: 'email', message: 'Please enter a valid email address' }
              ]}
              className="!mb-2"
            >
              <Input
                type="email"
                placeholder="concierge@roveandamber.com"
                className="rounded-xl py-2 text-xs"
              />
            </Form.Item>
            <p className="text-[11px] text-gray-400 m-0">
              This address receives boutique patron inquiries, order notices, and atelier dispatches.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={emailSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] hover:from-[#C89B3F] hover:to-[#A3791F] text-[#1B100A] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Mail size={14} />
              <span>{emailSaving ? 'Updating Email...' : 'Update Contact Email'}</span>
            </button>
          </div>
        </Form>
      </div>

      {/* Feature 2: Administrator Password Update */}
      <div id="security" className="bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF3E0] border border-[#E0D0A5] text-[#B8860B] flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-serif font-medium text-sm text-[#1B100A]">
                Administrator Security & Password
              </h3>
              <p className="text-[11px] text-gray-500">
                Update master administrator password to safeguard the boutique management atelier.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
            Protected Access
          </span>
        </div>

        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Form.Item
              name="currentPassword"
              label={<span className="text-xs font-semibold text-gray-700">Current Password</span>}
              rules={[{ required: true, message: 'Please enter current password' }]}
            >
              <Input.Password
                placeholder="••••••••"
                className="rounded-xl py-2 text-xs font-mono"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={<span className="text-xs font-semibold text-gray-700">New Password</span>}
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password
                placeholder="Min. 6 characters"
                className="rounded-xl py-2 text-xs font-mono"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<span className="text-xs font-semibold text-gray-700">Confirm New Password</span>}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('New passwords do not match'));
                  }
                })
              ]}
            >
              <Input.Password
                placeholder="Re-enter password"
                className="rounded-xl py-2 text-xs font-mono"
              />
            </Form.Item>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-gray-400 m-0">
              Password must be at least 6 characters. Updating will synchronize master atelier credentials.
            </p>
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A64A] to-[#B38728] hover:from-[#C89B3F] hover:to-[#A3791F] text-[#1B100A] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Key size={14} />
              <span>{passwordSaving ? 'Updating Password...' : 'Change Password'}</span>
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
