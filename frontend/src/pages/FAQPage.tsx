import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Layout from '../components/Layout';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const faqs = [
    {
      question: 'Is the venue outdoors?',
      answer:
        'The ceremony and cocktail hour will be outside. The reception and dancing will begin outside under our tent. Music and dancing will then move inside later into the evening, but guests are free to socialize outside throughout the evening.',
    },
    {
      question: 'What is the dress code?',
      answer:
        'The dress code for the wedding is cocktail attire. The ceremony and cocktail hour will take place on grass, so please choose appropriate footwear. Although the venue is well-shaded, you may be more comfortable dressing in breathable clothing.',
    },
    {
      question: 'Can kids attend the wedding?',
      answer:
        "As much as we love your kiddos, our wedding will be an adults-only celebration. We hope this gives you an opportunity for a parents' night out!",
    },
    {
      question: 'How do I RSVP?',
      answer:
        'Invitations have been sent out! Please check your email for your unique RSVP link. If you haven\'t received yours, please reach out to us at contact@samandjonah.com.',
    },
    {
      question: 'Can I bring my plus one?',
      answer:
        'We can only accommodate guests that we have listed on the invitations. If you have a plus one, their name will be listed on your invite.',
    },
    {
      question: 'Where should I park?',
      answer:
        'All public parking areas surrounding Rouge are City-Controlled Parking Areas. We recommend parking in the Inglewood Parking Lot. Uber is also a great option for transportation.',
    },
    {
      question: 'When does the party end?',
      answer:
        'The party wraps up at 1:00 AM — so wear your dancing shoes!',
    },
    {
      question: 'Will you accept gifts?',
      answer:
        'You are too kind! In lieu of gifts, please consider contributing to our honeymoon fund! We are heading to Italy and Portugal in September 2026. We have set up a Honeymoon Registry for guests who would like to contribute to something specific.',
    },
  ];

  return (
    <Layout>
      {/* ─── Page Header ─── */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-gold text-[13px] tracking-[0.3em] uppercase mb-4 font-medium"
          >
            Questions
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl text-heading mb-6"
            style={{ fontWeight: 300 }}
          >
            FAQ
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4"
          >
            <div className="w-16 h-px bg-gold/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <div className="w-16 h-px bg-gold/30" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-body text-lg mt-6"
          >
            Your questions answered
          </motion.p>
        </div>
      </section>

      {/* ─── FAQ Accordion ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="pb-24 md:pb-32 px-6"
      >
        <div className="max-w-3xl mx-auto">
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.04 }}
                className="bg-white rounded-2xl border border-card-border overflow-hidden hover:shadow-sm transition-shadow"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full text-left p-6 md:p-7 flex items-center justify-between gap-4 group"
                >
                  <h3
                    className="font-display text-xl md:text-2xl text-heading group-hover:text-gold transition-colors"
                    style={{ fontWeight: 400 }}
                  >
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 text-gold"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 md:px-7 pb-6 md:pb-7 text-body leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── Still Have Questions ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="py-24 md:py-32 px-6 bg-blush"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-10 md:p-14 border border-card-border">
            <div className="text-4xl mb-6">💌</div>
            <h2
              className="font-display text-3xl md:text-4xl text-heading mb-4"
              style={{ fontWeight: 300 }}
            >
              Still Have Questions?
            </h2>
            <p className="text-body leading-relaxed mb-8">
              We're happy to help! Feel free to reach out to us directly.
            </p>
            <a
              href="mailto:contact@samandjonah.com"
              className="inline-block bg-berry text-white px-8 py-3 rounded-full text-[13px] font-medium uppercase tracking-[0.1em] hover:bg-berry-light transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
