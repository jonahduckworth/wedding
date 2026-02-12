import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Countdown from '../components/Countdown';

export default function HomePage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.3 },
    },
  };

  return (
    <Layout>
      {/* ═══════════════════════════════════════════
          HERO — full-viewport photo
          ═══════════════════════════════════════════ */}
      <section className="relative h-screen flex flex-col overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <motion.img
            src="/hero.jpg"
            alt="Sam & Jonah"
            className="w-full h-full object-cover object-[center_20%] md:object-[center_25%]"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          />
          {/* Subtle dark vignette — neutral only, no berry/pink */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/30" />
        </div>

        {/* Content — lower third so we don't cover faces */}
        <div className="relative z-10 flex-1 flex flex-col justify-end pb-24 md:pb-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center px-6"
          >
            <motion.p
              variants={fadeInUp}
              className="text-white/50 text-[13px] tracking-[0.35em] uppercase mb-5"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              We're getting married
            </motion.p>
            <motion.h1
              variants={fadeInUp}
              className="font-display text-[3.5rem] md:text-8xl lg:text-9xl text-white"
              style={{ fontWeight: 300, letterSpacing: '0.02em' }}
            >
              Sam <span className="text-gold-light">&</span> Jonah
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl font-display italic text-white/60 mt-3"
            >
              August 15, 2026 &nbsp;·&nbsp; Calgary, Alberta
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-white/30"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          COUNTDOWN STRIP
          ═══════════════════════════════════════════ */}
      <section className="py-12 md:py-16 border-b border-card-border">
        <div className="max-w-4xl mx-auto px-6">
          <Countdown compact />
          <p className="text-center text-subtle text-sm mt-4 tracking-wider">
            until we say "I do"
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          WELCOME MESSAGE
          ═══════════════════════════════════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="py-24 md:py-32 px-6"
      >
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gold text-[13px] tracking-[0.3em] uppercase mb-6 font-medium">
            Welcome
          </p>
          <h2
            className="font-display text-4xl md:text-5xl text-heading mb-8"
            style={{ fontWeight: 300 }}
          >
            Join Us for Our Celebration
          </h2>
          <p className="text-body text-lg leading-relaxed mb-10">
            We are thrilled to celebrate our love story and marriage with all of
            our favourite people. Explore our website to learn more about our
            journey, wedding details, and how you can be part of our adventure.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-px bg-gold/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <div className="w-16 h-px bg-gold/30" />
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          FEATURED PHOTOS
          ═══════════════════════════════════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="py-16 md:py-24 px-6 bg-blush"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {[
              'NoraHanakoPhotographyS&JEngagement-5590-2.jpg',
              'NoraHanakoPhotographyS&JEngagement-5718-2.jpg',
              'NoraHanakoPhotographyS&JEngagement-5925-2.jpg',
              'NoraHanakoPhotographyS&JEngagement-6183-2.jpg',
            ].map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="aspect-[3/4] overflow-hidden rounded-xl"
              >
                <img
                  src={`/Gallery/${photo}`}
                  alt={`Sam & Jonah ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              to="/story"
              className="inline-flex items-center gap-2 text-gold text-[13px] font-medium uppercase tracking-[0.15em] hover:text-berry transition-colors"
            >
              View our story
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          QUICK LINKS
          ═══════════════════════════════════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={staggerContainer}
        className="py-24 md:py-32 px-6"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: 'Our Story',
                description:
                  'From our first date skating to building a life together',
                link: '/story',
              },
              {
                title: 'Wedding Details',
                description:
                  'Ceremony timeline, venue information, and what to expect',
                link: '/details',
              },
              {
                title: 'Travel & Stay',
                description:
                  'Hotels, things to do, and exploring beautiful Calgary',
                link: '/travel',
              },
            ].map((card) => (
              <motion.div key={card.title} variants={fadeInUp}>
                <Link to={card.link} className="group block h-full">
                  <div className="h-full bg-white rounded-2xl p-8 md:p-10 border border-card-border hover:shadow-lg hover:shadow-berry/5 transition-all duration-500">
                    <h3
                      className="font-display text-2xl md:text-3xl text-heading mb-3"
                      style={{ fontWeight: 400 }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-body leading-relaxed mb-6">
                      {card.description}
                    </p>
                    <span className="inline-flex items-center text-gold text-[13px] font-medium uppercase tracking-[0.1em] group-hover:translate-x-1 transition-transform duration-300">
                      Explore
                      <svg
                        className="ml-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════
          RSVP & REGISTRY CTAs
          ═══════════════════════════════════════════ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="py-24 md:py-32 px-6 bg-blush"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* RSVP */}
            <div className="bg-white rounded-2xl p-10 md:p-12 text-center border border-card-border">
              <h3
                className="font-display text-3xl text-heading mb-4"
                style={{ fontWeight: 300 }}
              >
                RSVP
              </h3>
              <p className="text-body mb-8">
                We can't wait to celebrate with you. Please let us know if you
                can join us.
              </p>
              <Link
                to="/rsvp"
                className="inline-block bg-berry text-white px-8 py-3 rounded-full text-[13px] font-medium uppercase tracking-[0.1em] hover:bg-berry-light transition-colors"
              >
                RSVP Now
              </Link>
            </div>

            {/* Registry */}
            <div className="bg-white rounded-2xl p-10 md:p-12 text-center border border-card-border">
              <h3
                className="font-display text-3xl text-heading mb-4"
                style={{ fontWeight: 300 }}
              >
                Honeymoon Registry
              </h3>
              <p className="text-body mb-8">
                Help us create magical memories in Italy and Germany this
                September.
              </p>
              <Link
                to="/registry"
                className="inline-block border-2 border-berry text-berry px-8 py-3 rounded-full text-[13px] font-medium uppercase tracking-[0.1em] hover:bg-berry hover:text-white transition-colors"
              >
                View Registry
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
