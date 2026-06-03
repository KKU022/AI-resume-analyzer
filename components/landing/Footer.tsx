'use client';

import React from 'react';
import { motion } from 'framer-motion';

const members = [
  {
    name: 'Krishna Kant Upadhyay',
    role: 'Lead Developer • Product Architect • AI Engineer',
    quote:
      '"Every feature here was built with a purpose — not just to work, but to actually help someone move forward."',
    extra:
      'Built with late nights, consistency, and full ownership of design, logic, and experience.',
  },
];

export default function Footer() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#07101c] via-[#08131f] to-[#05080e] px-6 py-24 lg:py-32">
      <motion.div
        className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#f59e0b]/10 blur-[110px]"
        animate={{ x: [0, 22, -12, 0], y: [0, 10, -6, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#38BDF8]/10 blur-[120px]"
        animate={{ x: [0, -18, 12, 0], y: [0, -10, 6, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <p className="mb-3 inline-block rounded-full border border-white/10 bg-white/[0.04] px-4 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#f8fafc]">
            Built with Intent
          </p>
          <h2 className="text-4xl font-black leading-tight tracking-tight text-white md:text-6xl font-space-grotesk">
            Built with intent, not just code
          </h2>
          <p className="mt-4 text-lg text-slate-300 md:text-xl">
            A product crafted to feel calm, useful, and genuinely supportive from the first interaction.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-1">
          {members.map((member, index) => (
            <motion.article
              key={member.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, delay: index * 0.12 }}
              whileHover={{ scale: 1.01, y: -2 }}
              className="group relative mx-auto max-w-3xl rounded-[32px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_20px_55px_rgba(15,23,42,0.22)]"
            >
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-[28px] border border-transparent"
                animate={{ opacity: [0.16, 0.32, 0.16] }}
                transition={{ duration: 4.8 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
              />
              <motion.div
                className="pointer-events-none absolute -top-10 right-8 h-20 w-20 rounded-full bg-[#f59e0b]/10 blur-2xl"
                animate={{ y: [0, 5, 0], opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 5 + index, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="relative">
                <h3 className="text-2xl font-black text-white">{member.name}</h3>
                <p className="mt-2 text-sm font-semibold text-[#cbd5e1]">{member.role}</p>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200">{member.quote}</p>
                {member.extra ? (
                  <p className="mt-4 text-sm leading-relaxed text-slate-400">{member.extra}</p>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-12 max-w-4xl text-center text-base text-slate-400 md:text-lg"
        >
          Built through continuous iteration, late nights, and a belief that career tools should guide, not confuse.
        </motion.p>
      </div>
    </section>
  );
}
