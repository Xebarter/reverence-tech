import { Award, Users, TrendingUp, Heart, Lightbulb, Shield, Handshake } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  const stats = [
    { icon: Award, value: "5+", label: "Years Experience", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Users, value: "75+", label: "Satisfied Clients", color: "text-yellow-600", bg: "bg-yellow-50" },
    { icon: TrendingUp, value: "50+", label: "Projects Completed", color: "text-emerald-600", bg: "bg-emerald-50" },
    { icon: Heart, value: "98%", label: "Client Retention", color: "text-rose-600", bg: "bg-rose-50" },
  ];

  const values = [
    { icon: Lightbulb, title: "Innovation", desc: "Cutting-edge solutions adapted for local needs" },
    { icon: Shield, title: "Accessibility", desc: "Technology within reach of every organization" },
    { icon: Handshake, title: "Partnership", desc: "Long-term relationships built on trust" },
  ];

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-slate-50 py-24 px-4 sm:px-6 lg:px-8"
    >
      {/* Decorative background element */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-yellow-400/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 text-4xl md:text-5xl font-black tracking-tight text-[#1C3D5A]"
          >
            Why Choose <span className="text-yellow-500">Reverence Technology</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-600"
          >
            We understand the unique challenges of the East African market.
            Our solutions are built for local context—from{" "}
            <span className="font-semibold text-[#1C3D5A] underline decoration-yellow-400 decoration-2 underline-offset-4">
              mobile money ecosystems
            </span>{" "}
            to resilient off-grid infrastructure.
          </motion.p>
        </div>

        {/* Stats */}
        <div className="mb-24 grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div
                className={`${stat.bg} mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110`}
              >
                <stat.icon className={stat.color} size={32} />
              </div>
              <h3 className="mb-2 text-4xl font-black text-[#1C3D5A]">
                {stat.value}
              </h3>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mission & Values */}
        <div className="relative">
          <div className="absolute inset-0 hidden -rotate-1 rounded-[3rem] bg-gradient-to-br from-[#1C3D5A] to-[#0B1221] lg:block" />

          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1C3D5A] to-[#0B1221] p-8 shadow-2xl md:p-16 lg:rounded-[3rem]">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-yellow-400/10 blur-[80px]" />

            <div className="mx-auto max-w-4xl">
              <div className="mb-16 flex flex-col items-center text-center">
                <div className="mb-6 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-1 text-xs font-black uppercase tracking-[0.3em] text-yellow-400">
                  Our Mission
                </div>

                <h3 className="mb-8 text-3xl md:text-4xl font-bold leading-tight text-white">
                  Bridging the digital divide across East Africa through innovative,
                  accessible technology.
                </h3>

                <div className="h-1.5 w-20 rounded-full bg-yellow-400" />
              </div>

              <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
                {values.map((value, idx) => (
                  <div
                    key={idx}
                    className="group flex flex-col items-center text-center"
                  >
                    <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-yellow-400 transition-all duration-300 group-hover:bg-yellow-400 group-hover:text-[#1C3D5A]">
                      <value.icon size={24} />
                    </div>
                    <h4 className="mb-3 text-xl font-bold text-white">
                      {value.title}
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-400">
                      {value.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
