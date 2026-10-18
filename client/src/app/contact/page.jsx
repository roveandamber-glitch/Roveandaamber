"use client";
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  ChevronDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { message } from 'antd';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Order & Shipping Status',
    message: ''
  });
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

  const faqs = [
    {
      q: "How are ROVE & AMBER fragrances crafted?",
      a: "Each ROVE & AMBER Eau de Parfum is blended in artisanal batches using 20% to 26% precious fragrance oil concentrations, aged amber, rare oud, and noble botanicals for lasting sillage and projection."
    },
    {
      q: "What are your Pan-India delivery timelines?",
      a: "Domestic orders within India are packaged in our signature embossed luxury gift boxes and dispatched via priority courier within 24 to 48 hours, arriving within 2–4 business days."
    },
    {
      q: "How can I order via WhatsApp or Instagram DM?",
      a: "You can reach out directly to @roveandamber on Instagram or message our concierge on WhatsApp at +91 70343 08604 with your desired flacon and delivery address for assisted checkout."
    },
    {
      q: "How should I store and preserve my perfume flacon?",
      a: "Keep your flacons in a cool, dry environment away from direct sunlight and fluctuating temperatures to preserve the delicate aromatic oils and maceration integrity."
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      message.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const ticketId = `CNV-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket(ticketId);
      setLoading(false);
      message.success('Your message has been sent to the ROVE & AMBER Concierge team!');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] font-sans text-enva-text pt-24 sm:pt-28 flex flex-col justify-between">
      <Navbar />

      <main className="w-full flex-1 max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C827A] block mb-2">
            Client Concierge & Care
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif text-black font-normal mb-3">
            How May We Assist You?
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
            Whether you require personal styling guidance, sizing consultations, or order tracking, our dedicated concierge team is at your service.
          </p>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {/* Card 1: Phone */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E2D6] shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] flex items-center justify-center text-black mb-3">
              <Phone size={18} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Direct Call</span>
            <p className="text-sm font-bold text-black mb-0.5">+91 98765 43210</p>
            <p className="text-[11px] text-gray-500 font-light">+91 70343 08604</p>
          </div>

          {/* Card 2: Email */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E2D6] shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] flex items-center justify-center text-black mb-3">
              <Mail size={18} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B86526] block mb-1">Email Concierge</span>
            <p className="text-sm font-bold text-black mb-0.5 font-mono">concierge@roveandamber.com</p>
            <p className="text-[11px] text-gray-500 font-light font-mono">orders@roveandamber.com</p>
          </div>

          {/* Card 3: Location */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E2D6] shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] flex items-center justify-center text-black mb-3">
              <MapPin size={18} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Flagship Salon</span>
            <p className="text-xs font-bold text-black mb-0.5 leading-snug">74 Atelier Arcade, Defense Colony</p>
            <p className="text-[11px] text-gray-500 font-light">New Delhi, India 110024</p>
          </div>

          {/* Card 4: Hours */}
          <div className="bg-white p-5 rounded-3xl border border-[#E8E2D6] shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] flex items-center justify-center text-black mb-3">
              <Clock size={18} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 block mb-1">Salon Hours</span>
            <p className="text-xs font-bold text-black mb-0.5">Mon – Sat: 10 AM – 8 PM</p>
            <p className="text-[11px] text-gray-500 font-light">Sunday: 11 AM – 6 PM IST</p>
          </div>
        </div>

        {/* 2-Column: Inquiry Form + FAQ Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D6] shadow-sm">
            <div className="mb-6">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8C827A] block mb-1">
                Atelier Message
              </span>
              <h3 className="text-2xl font-serif font-bold text-black">Send a Concierge Inquiry</h3>
            </div>

            {submittedTicket ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-serif font-bold text-black">Inquiry Dispatched</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed font-light">
                  Thank you for reaching out. A dedicated ROVE & AMBER fragrance specialist has received your request and will reply within 2 business hours.
                </p>
                <div className="inline-block bg-[#FAF8F5] border border-[#E8E2D6] px-4 py-2 rounded-xl text-xs font-mono text-black font-bold">
                  Reference Ticket: #{submittedTicket}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setFormData({ name: '', email: '', phone: '', topic: 'Order & Shipping Status', message: '' });
                    }}
                    className="text-xs text-black font-bold underline cursor-pointer mt-2"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Aisha Sharma"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-xs bg-gray-50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. aisha@example.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-xs bg-gray-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full h-11 px-3.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-xs bg-gray-50 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Inquiry Topic</label>
                    <select
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-xs bg-gray-50 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="Order & Shipping Status">Order & Shipping Status</option>
                      <option value="Bespoke Sizing Consultation">Bespoke Sizing Consultation</option>
                      <option value="Returns & Exchanges">Returns & Exchanges</option>
                      <option value="Press & Editorial Inquiries">Press & Editorial Inquiries</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1.5">Your Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your question, fragrance notes, flacon sizing, or order reference..."
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-black focus:outline-none text-xs bg-gray-50 focus:bg-white transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-[#262626] active:bg-black text-white h-12 rounded-full font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Send size={13} />
                  <span>{loading ? 'Submitting...' : 'Send Inquiry to Concierge'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: FAQ Accordion */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-amber-600" />
                <h4 className="text-base font-serif font-bold text-black">Frequently Asked Questions</h4>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-[#E8E2D6] rounded-2xl overflow-hidden bg-[#FAF8F5] transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                        className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-black cursor-pointer gap-2"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown 
                          size={14} 
                          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-black' : ''}`} 
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-gray-600 font-light leading-relaxed border-t border-[#EAE3D5]">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Assurance Box */}
            <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#E8E2D6] flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h5 className="text-xs font-bold text-black uppercase tracking-wider">Atelier Guarantee</h5>
                <p className="text-[11px] text-gray-500 font-light leading-snug">
                  All customer requests are handled confidentially by our in-house fashion advisors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;
