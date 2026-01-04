import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Countdown from '../components/Countdown';
import FloralDivider from '../components/decorative/FloralDivider';
import FloralCorner from '../components/decorative/FloralCorner';
import SketchFilter from '../components/decorative/SketchFilter';

export default function HomePage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  return (
    <Layout>
      <SketchFilter />

      {/* Hero Section with Image */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="/hero.jpg"
            alt="Sam & Jonah"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/80 via-cream/60 to-cream/90" />
        </div>

        {/* Decorative Corners */}
        <FloralCorner position="top-left" className="text-dusty-rose opacity-30 hidden md:block" />
        <FloralCorner position="top-right" className="text-sage opacity-30 hidden md:block" />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Names */}
            <motion.h1
              variants={fadeInUp}
              className="font-display text-6xl md:text-8xl lg:text-9xl mb-6 text-charcoal"
              style={{ fontWeight: 300 }}
            >
              Sam <span className="text-dusty-rose">&</span> Jonah
            </motion.h1>

            {/* Tagline */}
            <motion.div
              variants={fadeInUp}
              className="mb-8"
            >
              <p className="text-2xl md:text-3xl font-display italic text-warm-gray mb-2">
                are getting married
              </p>
            </motion.div>

            {/* Decorative Divider */}
            <motion.div variants={fadeInUp} className="mb-8">
              <FloralDivider className="text-dusty-rose" />
            </motion.div>

            {/* Date & Location */}
            <motion.div variants={fadeInUp} className="mb-12 space-y-2">
              <p className="text-xl md:text-2xl font-display text-charcoal">
                August 15, 2026
              </p>
              <p className="text-lg md:text-xl text-warm-gray">
                Rouge Restaurant, Calgary, Alberta
              </p>
              <p className="text-base md:text-lg text-warm-gray/80">
                Ceremony begins at 3:45 PM
              </p>
            </motion.div>

            {/* Countdown */}
            <motion.div variants={fadeInUp} className="mb-12">
              <Countdown />
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              variants={fadeInUp}
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-warm-gray"
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
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Welcome Message Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInUp}
        className="py-20 px-4 bg-off-white"
      >
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl md:text-5xl mb-6 text-charcoal">
            Join Us for Our Special Day
          </h2>
          <p className="text-lg text-warm-gray leading-relaxed mb-8">
            We are thrilled to celebrate our love story and marriage with all of our favourite people.
            Explore our website to learn more about our journey, wedding details, and how you can be part of our adventure.
          </p>
          <FloralDivider className="text-sage opacity-60" animate={false} />
        </div>
      </motion.section>

      {/* Featured Photos Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="py-16 bg-off-white"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[
              'NoraHanakoPhotographyS&JEngagement-5590-2.jpg',
              'NoraHanakoPhotographyS&JEngagement-5718-2.jpg',
              'NoraHanakoPhotographyS&JEngagement-5925-2.jpg',
              'NoraHanakoPhotographyS&JEngagement-6183-2.jpg',
            ].map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="aspect-square overflow-hidden rounded-2xl shadow-lg"
              >
                <img
                  src={`/Gallery/${photo}`}
                  alt={`Sam & Jonah ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <a
              href="/story"
              className="inline-flex items-center gap-2 text-dusty-rose hover:text-dusty-rose/80 font-medium transition-colors"
            >
              View more photos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Links Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={staggerContainer}
        className="py-20 px-4 bg-cream"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Our Story',
                description: 'From our first date skating to building a life together',
                link: '/story',
                icon: '💕',
                color: 'dusty-rose'
              },
              {
                title: 'Wedding Details',
                description: 'Ceremony timeline, venue information, and what to expect',
                link: '/details',
                icon: '✨',
                color: 'sage'
              },
              {
                title: 'Travel & Stay',
                description: 'Hotels, things to do, and exploring beautiful Calgary',
                link: '/travel',
                icon: '✈️',
                color: 'terracotta'
              }
            ].map((card, index) => (
              <motion.a
                key={card.title}
                href={card.link}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative block"
              >
                <div className="h-full bg-off-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-dusty-rose/20">
                  {/* Decorative corner */}
                  <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {card.icon}
                  </div>

                  <h3 className="font-display text-3xl mb-4 text-charcoal">
                    {card.title}
                  </h3>
                  <p className="text-warm-gray leading-relaxed mb-6">
                    {card.description}
                  </p>
                  <div className="flex items-center text-dusty-rose font-medium group-hover:translate-x-2 transition-transform">
                    <span>Explore</span>
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.section>

      {/* RSVP & Registry CTAs */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInUp}
        className="py-20 px-4 bg-gradient-to-b from-off-white to-blush/30"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* RSVP Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-dusty-rose/10 border-2 border-dusty-rose/30 rounded-2xl p-10 text-center relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="text-5xl mb-4">📬</div>
                <h3 className="font-display text-3xl mb-3 text-charcoal">RSVP</h3>
                <p className="text-warm-gray mb-6">
                  We can't wait to celebrate with you! Please let us know if you can join us.
                </p>
                <a
                  href="/rsvp"
                  className="inline-block bg-dusty-rose text-off-white px-8 py-3 rounded-full font-medium hover:bg-dusty-rose/90 transition-colors"
                >
                  RSVP Now
                </a>
              </div>
              <FloralCorner position="bottom-right" className="text-dusty-rose/20" />
            </motion.div>

            {/* Registry Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-sage/10 border-2 border-sage/30 rounded-2xl p-10 text-center relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="text-5xl mb-4">🇮🇹</div>
                <h3 className="font-display text-3xl mb-3 text-charcoal">Honeymoon Registry</h3>
                <p className="text-warm-gray mb-6">
                  Help us create magical memories in Italy and Germany this September.
                </p>
                <a
                  href="/registry"
                  className="inline-block bg-sage text-off-white px-8 py-3 rounded-full font-medium hover:bg-sage/90 transition-colors"
                >
                  View Registry
                </a>
              </div>
              <FloralCorner position="bottom-left" className="text-sage/20 scale-x-[-1]" />
            </motion.div>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
