import { motion } from 'framer-motion';
import Layout from '../components/Layout';

export default function DetailsPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

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
            The day
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl text-heading mb-6"
            style={{ fontWeight: 300 }}
          >
            Wedding Details
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
            Everything you need to know for our special day
          </motion.p>
        </div>
      </section>

      {/* ─── Venue & Key Info ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="py-20 md:py-28 px-6"
      >
        <div className="max-w-4xl mx-auto">
          {/* Main venue card */}
          <div className="bg-white rounded-2xl p-10 md:p-14 border border-card-border text-center mb-8">
            <h2
              className="font-display text-4xl md:text-5xl text-heading mb-6"
              style={{ fontWeight: 300 }}
            >
              Rouge Restaurant
            </h2>
            <a
              href="https://maps.google.com/?q=1240+8+Ave+SE,+Calgary,+AB+T2G+0M7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gold text-lg hover:underline transition-colors mb-6"
            >
              <span>📍</span>
              1240 8 Ave SE, Calgary, AB T2G 0M7
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-16 h-px bg-gold/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
              <div className="w-16 h-px bg-gold/30" />
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-subtle text-sm uppercase tracking-wider mb-2">Date</p>
                <p className="font-display text-2xl text-heading" style={{ fontWeight: 400 }}>
                  August 15, 2026
                </p>
              </div>
              <div>
                <p className="text-subtle text-sm uppercase tracking-wider mb-2">Ceremony</p>
                <p className="font-display text-2xl text-heading" style={{ fontWeight: 400 }}>
                  4:00 PM
                </p>
              </div>
              <div>
                <p className="text-subtle text-sm uppercase tracking-wider mb-2">Party Ends</p>
                <p className="font-display text-2xl text-heading" style={{ fontWeight: 400 }}>
                  1:00 AM
                </p>
              </div>
            </div>
          </div>

          {/* Dress code - smaller, less prominent */}
          <div className="bg-blush rounded-2xl p-6 md:p-8 border border-card-border">
            <div className="flex items-start gap-4">
              <span className="text-2xl">👗</span>
              <div>
                <h3
                  className="font-display text-xl text-heading mb-2"
                  style={{ fontWeight: 400 }}
                >
                  Dress Code: <span className="text-gold">Cocktail Attire</span>
                </h3>
                <p className="text-body text-sm leading-relaxed">
                  The ceremony and cocktail hour will take place on grass — please choose
                  appropriate footwear. The venue is well-shaded, but breathable clothing
                  is recommended.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── Timeline section commented out per request ─── */}
      {/*
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="py-24 md:py-32 px-6 bg-blush"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <p className="text-gold text-[13px] tracking-[0.3em] uppercase mb-4 font-medium">
              Schedule
            </p>
            <h2
              className="font-display text-4xl md:text-5xl text-heading"
              style={{ fontWeight: 300 }}
            >
              Timeline of the Day
            </h2>
          </motion.div>
        </div>
      </motion.section>
      */}

      {/* ─── About the Venue ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="py-24 md:py-32 px-6 bg-blush"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold text-[13px] tracking-[0.3em] uppercase mb-4 font-medium">
              Good to know
            </p>
            <h2
              className="font-display text-4xl md:text-5xl text-heading"
              style={{ fontWeight: 300 }}
            >
              About the Venue
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-8 md:p-12 border border-card-border space-y-8">
            <div>
              <h3
                className="font-display text-2xl text-heading mb-3 flex items-center gap-3"
                style={{ fontWeight: 400 }}
              >
                <span>🌳</span> Outdoor &amp; Indoor
              </h3>
              <p className="text-body leading-relaxed">
                The ceremony and cocktail hour will be outside. The reception and
                dancing will begin outside under our tent. Music and dancing will
                then move inside later into the evening, but guests are free to
                socialize outside throughout the evening.
              </p>
            </div>

            <div className="border-t border-card-border pt-8">
              <h3
                className="font-display text-2xl text-heading mb-3 flex items-center gap-3"
                style={{ fontWeight: 400 }}
              >
                <span>🅿️</span> Parking
              </h3>
              <p className="text-body leading-relaxed">
                All public parking areas surrounding Rouge are City-Controlled Parking Areas.
                We recommend parking in the Inglewood Parking Lot. Uber is also a great
                option for transportation.
              </p>
            </div>

            <div className="border-t border-card-border pt-8">
              <h3
                className="font-display text-2xl text-heading mb-3 flex items-center gap-3"
                style={{ fontWeight: 400 }}
              >
                <span>🌙</span> When Does the Party End?
              </h3>
              <p className="text-body leading-relaxed">
                The party wraps up at <strong className="text-heading">1:00 AM</strong>.
                We'll be celebrating well into the night!
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
