import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Layout from '../components/Layout';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const faqs = [
    {
      question: 'Is the venue outdoors?',
      answer: 'The ceremony and cocktail hour will be outside. The reception and dancing will begin outside under our tent. Music and dancing will then move inside later into the evening, but guests are free to socialize outside throughout the evening.'
    },
    {
      question: 'What is the dress code?',
      answer: 'The dress code for the wedding is cocktail attire. The ceremony and cocktail hour will take place on grass, so please choose appropriate footwear. Although the venue is well-shaded, you may be more comfortable dressing in breathable clothing.'
    },
    {
      question: 'Can kids attend the wedding?',
      answer: 'As much as we love your kiddos, our wedding will be an adults-only celebration. We hope this gives you an opportunity for a parents\' night out!'
    },
    {
      question: 'How do I RSVP?',
      answer: 'Invitations will be sent out in a few months. Please save the date in your calendar and wait for a future email with your invitation and instructions to RSVP!'
    },
    {
      question: 'Can I bring my plus one?',
      answer: 'We can only accommodate guests that we have listed on the invitations. If you have a plus one, their name will be listed on your invite.'
    },
    {
      question: 'Where should I park?',
      answer: 'Parking information will be included with your invitation and detailed on the venue website.'
    },
    {
      question: 'When does the party end?',
      answer: 'Details will be confirmed closer to the date - but we\'re planning to celebrate well into the evening!'
    },
    {
      question: 'Will you accept gifts?',
      answer: 'You are too kind! In lieu of gifts, please consider contributing to our honeymoon fund! We are heading to Italy and Germany in September 2026. We have set up a Honeymoon Registry for guests who would like to contribute to something specific.'
    }
  ];

  return (
    <Layout>

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative py-24 px-4 bg-berry"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h1
            variants={fadeInUp}
            className="font-display text-5xl md:text-7xl mb-6 text-cream"
          >
            FAQ
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-blush/70 italic mb-8"
          >
            Your questions answered
          </motion.p>
          <motion.div variants={fadeInUp}>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Accordion */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="py-20 px-4 bg-berry"
      >
        <div className="container mx-auto max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-berry/50 rounded-2xl border-2 border-glass-border overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 group"
                >
                  <h3 className="font-display text-xl md:text-2xl text-cream group-hover:text-gold transition-colors">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 text-gold"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
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
                      <div className="px-6 pb-6 text-blush/70 leading-relaxed">
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

      {/* Still Have Questions Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInUp}
        className="py-20 px-4 bg-berry-dark/20"
      >
        <div className="container mx-auto max-w-2xl text-center">
          <div className="bg-gold/10 border-2 border-glass-border rounded-3xl p-12 shadow-lg">
            <div className="text-5xl mb-6">💌</div>
            <h2 className="font-display text-3xl md:text-4xl mb-4 text-cream">
              Still Have Questions?
            </h2>
            <p className="text-blush/70 leading-relaxed mb-6">
              We're happy to help! Feel free to reach out to us directly.
            </p>
            <a
              href="mailto:contact@samandjonah.com"
              className="inline-block bg-gold text-berry-dark px-8 py-3 rounded-full font-medium hover:bg-gold/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
