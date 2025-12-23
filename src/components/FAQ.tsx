import { useState } from 'react';
import {
  HelpCircle, MessageCircle, ShieldCheck, Zap,
  Clock, ChevronDown, Code2, Scale, Phone
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const faqs = [
  {
    category: 'Process & Partnership',
    icon: Zap,
    items: [
      {
        question: 'How quickly can you kick off a new project?',
        answer: 'Discovery typically starts within 3 business days of signing. Once aligned, we assemble your dedicated engineering squad and launch the first sprint within 10 business days.'
      },
      {
        question: 'What does collaboration look like?',
        answer: 'We operate in 2-week sprints. You receive weekly demos, transparent progress reports via our Project Hub, and direct Slack/Discord access to your lead architect.'
      }
    ]
  },
  {
    category: 'Technology & Security',
    icon: Code2,
    items: [
      {
        question: 'Can you integrate with legacy systems?',
        answer: 'Yes. We specialize in building secure bridge layers (APIs) for ERPs like SAP and Oracle, ensuring your modern frontend works seamlessly with established backends.'
      },
      {
        question: 'How do you ensure data security?',
        answer: 'Our workflow includes automated dependency scanning, peer-reviewed pull requests, and SOC 2 aligned infrastructure hardening on AWS/Azure/GCP.'
      }
    ]
  },
  {
    category: 'Legal & Ownership',
    icon: Scale,
    items: [
      {
        question: 'Who owns the final source code?',
        answer: 'You do. We provide a full IP transfer upon project completion. You own 100% of the code, assets, and documentation we produce.'
      }
    ]
  }
];

const quickFacts = [
  { icon: ShieldCheck, title: 'Compliance', desc: 'ISO-aligned workflows.' },
  { icon: Clock, title: 'Support', desc: '24/7 reliability monitoring.' }
];

export default function FAQ() {
  const [activeId, setActiveId] = useState<string | null>("0-0");
  const [showCallForm, setShowCallForm] = useState(false);
  const [callForm, setCallForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    preferredDate: '',
    preferredTime: '',
    callReason: ''
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleCallFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');

    try {
      const { error } = await supabase
        .from('scheduled_calls')
        .insert([{
          full_name: callForm.fullName,
          email: callForm.email,
          phone: callForm.phone,
          company: callForm.company,
          preferred_date: callForm.preferredDate ? new Date(callForm.preferredDate).toISOString() : null,
          preferred_time: callForm.preferredTime,
          call_reason: callForm.callReason || 'General FAQ inquiry'
        }]);

      if (error) {
        throw new Error(error.message);
      }

      setFormStatus('success');
      // Reset form after successful submission
      setCallForm({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        preferredDate: '',
        preferredTime: '',
        callReason: ''
      });
      // Hide form after 3 seconds
      setTimeout(() => {
        setShowCallForm(false);
        setFormStatus('idle');
      }, 3000);
    } catch (err) {
      console.error('Error submitting call request:', err);
      setFormStatus('error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCallForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <section id="faq" className="py-20 md:py-32 bg-slate-50/30 overflow-hidden px-4 md:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Left Side: Text and Stats */}
        <div className="lg:col-span-5 space-y-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              <HelpCircle size={14} /> Knowledge Base
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
              Everything you need to <span className="text-indigo-600">know.</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-md">
              Answers to the technical and business questions teams ask before building with Reverence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {quickFacts.map((fact, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="p-3 rounded-xl bg-indigo-600 text-white"><fact.icon size={20} /></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase">{fact.title}</h4>
                  <p className="font-bold text-slate-800">{fact.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden">
            {showCallForm ? (
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-6">Schedule a Call</h3>
                {formStatus === 'success' ? (
                  <div className="text-center py-6">
                    <p className="text-green-400 mb-4">Request submitted successfully!</p>
                    <p className="text-slate-300">We'll contact you soon to confirm your appointment.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCallFormSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-400 uppercase">Full Name *</label>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          name="fullName"
                          value={callForm.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase">Email *</label>
                      <div className="relative mt-1">
                        <input
                          type="email"
                          name="email"
                          value={callForm.email}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 uppercase">Phone</label>
                        <div className="relative mt-1">
                          <input
                            type="tel"
                            name="phone"
                            value={callForm.phone}
                            onChange={handleInputChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="+1234567890"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 uppercase">Company</label>
                        <div className="relative mt-1">
                          <input
                            type="text"
                            name="company"
                            value={callForm.company}
                            onChange={handleInputChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Your company"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 uppercase">Preferred Date</label>
                        <div className="relative mt-1">
                          <input
                            type="date"
                            name="preferredDate"
                            value={callForm.preferredDate}
                            onChange={handleInputChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 uppercase">Preferred Time</label>
                        <div className="relative mt-1">
                          <input
                            type="time"
                            name="preferredTime"
                            value={callForm.preferredTime}
                            onChange={handleInputChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 uppercase">Reason for Call</label>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          name="callReason"
                          value={callForm.callReason}
                          onChange={handleInputChange}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Specific question or topic"
                        />
                      </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button
                        type="submit"
                        disabled={formStatus === 'submitting'}
                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {formStatus === 'submitting' ? 'Submitting...' : 'Schedule Call'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCallForm(false)}
                        className="py-3 px-4 bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <>
                <MessageCircle className="absolute -right-8 -bottom-8 text-white/5" size={160} />
                <h3 className="text-2xl font-bold mb-2">Still curious?</h3>
                <p className="text-slate-400 text-sm mb-6">Book a 15-minute technical audit with our team.</p>
                <button 
                  onClick={() => setShowCallForm(true)}
                  className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-indigo-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone size={20} /> Schedule Call
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Accordion */}
        <div className="lg:col-span-7 space-y-10">
          {faqs.map((group, gIdx) => (
            <div key={gIdx} className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase text-slate-400 tracking-widest ml-2">
                <group.icon size={14} /> {group.category}
              </h3>
              <div className="space-y-3">
                {group.items.map((item, iIdx) => {
                  const id = `${gIdx}-${iIdx}`;
                  const isOpen = activeId === id;
                  return (
                    <div key={id} className={`rounded-2xl border transition-all duration-300 ${isOpen ? 'bg-white border-indigo-200 shadow-lg' : 'bg-slate-50 border-slate-200'}`}>
                      <button
                        onClick={() => setActiveId(isOpen ? null : id)}
                        className="w-full flex items-center justify-between px-6 py-5 text-left"
                      >
                        <span className={`font-bold text-lg ${isOpen ? 'text-indigo-600' : 'text-slate-900'}`}>{item.question}</span>
                        <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                              {item.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="md:hidden">
            {showCallForm ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-lg">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Phone size={20} /> Schedule a Call
                </h3>
                {formStatus === 'success' ? (
                  <div className="text-center py-4">
                    <p className="text-green-600 mb-2 font-medium">Request submitted successfully!</p>
                    <p className="text-slate-600">We'll contact you soon to confirm your appointment.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCallFormSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={callForm.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={callForm.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={callForm.phone}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Company</label>
                        <input
                          type="text"
                          name="company"
                          value={callForm.company}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="Your company"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Preferred Date</label>
                        <input
                          type="date"
                          name="preferredDate"
                          value={callForm.preferredDate}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Preferred Time</label>
                        <input
                          type="time"
                          name="preferredTime"
                          value={callForm.preferredTime}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Reason for Call</label>
                      <input
                        type="text"
                        name="callReason"
                        value={callForm.callReason}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Specific question or topic"
                      />
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button
                        type="submit"
                        disabled={formStatus === 'submitting'}
                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                      >
                        {formStatus === 'submitting' ? 'Submitting...' : 'Schedule Call'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCallForm(false)}
                        className="py-3 px-4 bg-slate-200 text-slate-800 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setShowCallForm(true)}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-2"
              >
                <Phone size={20} /> Talk to an Expert
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}