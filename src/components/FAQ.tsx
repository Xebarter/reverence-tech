import { useState } from 'react';
import { HelpCircle, MessageCircle, ShieldCheck, Zap, Clock, ChevronDown } from 'lucide-react';

const primaryFaqs = [
  {
    question: 'What services does Reverence Technology specialize in?',
    answer:
      'We deliver end-to-end digital solutions including custom web applications, mobile app development, UI/UX design, cloud infrastructure, cybersecurity hardening, and strategic technology consulting tailored to your business goals.'
  },
  {
    question: 'How quickly can you kick off a new project?',
    answer:
      'Discovery starts within 3 business days once we align on the scope. From there we assemble a dedicated squad and share a milestone roadmap, usually launching the first sprint within 10 business days.'
  },
  {
    question: 'Do you support clients beyond the initial launch?',
    answer:
      'Absolutely. We offer flexible retainers for feature enhancements, managed cloud operations, reliability monitoring, and on-call engineering so your product keeps evolving without hiring new staff.'
  },
  {
    question: 'Can you integrate with our existing tools and legacy systems?',
    answer:
      'Yes. We routinely connect to ERPs, CRMs, payment providers, data warehouses, and proprietary APIs. Our architects assess your stack, design secure integration layers, and document the handover.'
  },
  {
    question: 'What does collaboration look like during an engagement?',
    answer:
      'You get a dedicated product lead, weekly demos, transparent sprint reports, and access to our project hub. We co-create solutions with your stakeholders through workshops and rapid iteration.'
  },
  {
    question: 'How do you ensure quality and security?',
    answer:
      'Every release goes through automated testing, peer reviews, threat modelling, and infrastructure hardening. We follow OWASP best practices, maintain SOC 2 aligned controls, and provide documentation for audits.'
  }
];

const quickFacts = [
  {
    icon: ShieldCheck,
    title: 'Trusted Delivery',
    description: 'ISO-aligned workflows with built-in compliance checkpoints.'
  },
  {
    icon: Zap,
    title: 'Agile Velocity',
    description: 'Launch a usable prototype in as little as six weeks.'
  },
  {
    icon: Clock,
    title: 'Ongoing Support',
    description: '24/5 engineering coverage and incident response add-ons.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 bg-gradient-to-b from-white via-slate-50 to-white overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-[42%] bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -left-48 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-yellow-200/20 blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200 text-indigo-600 text-xs font-semibold uppercase tracking-[0.3em]">
              <HelpCircle size={16} /> FAQs
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
                Answers to the questions teams ask before building with us.
              </h2>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                Explore how we partner with ambitious organisations—from start-ups to enterprises—to ship resilient technology.
                Can’t find what you need? Reach out and we’ll tailor a response within a business day.
              </p>
            </div>

            <div className="space-y-5">
              {quickFacts.map((fact, idx) => (
                <div key={idx} className="flex items-start gap-4 bg-white border border-slate-200 rounded-3xl px-5 py-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                    <fact.icon size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">{fact.title}</h3>
                    <p className="mt-1 text-slate-700 font-semibold leading-relaxed">{fact.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 text-white rounded-[2rem] p-8 relative overflow-hidden">
              <MessageCircle className="absolute -right-10 -bottom-10 text-white/5" size={180} />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Need clarity fast?</p>
                <h3 className="mt-3 text-2xl font-extrabold">Book a 20-minute discovery call</h3>
                <p className="mt-3 text-sm text-slate-200">
                  Share your goals and we’ll map the quickest path to value—no obligation, just strategic insight.
                </p>
                <a
                  href="#contact"
                  className="mt-6 inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold shadow-lg hover:bg-yellow-300 transition-colors"
                >
                  Talk to the team
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-indigo-200/40">
              <ul className="space-y-4">
                {primaryFaqs.map((faq, index) => {
                  const isOpen = openIndex === index;
                  return (
                    <li key={faq.question} className="border border-slate-200 rounded-3xl overflow-hidden bg-slate-50/60">
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        className="w-full flex items-center justify-between gap-6 px-6 py-5 text-left"
                        aria-expanded={isOpen}
                        aria-controls={`faq-panel-${index}`}
                      >
                        <span className="text-lg font-semibold text-slate-900">{faq.question}</span>
                        <ChevronDown
                          size={22}
                          className={`text-indigo-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <div
                        id={`faq-panel-${index}`}
                        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                      >
                        <div className="overflow-hidden">
                          <p className="px-6 pb-6 text-base text-slate-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
