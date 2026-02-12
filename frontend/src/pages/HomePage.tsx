import { motion } from "framer-motion";
import Layout from "../components/Layout";
import Countdown from "../components/Countdown";

export default function HomePage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Berry Overlay */}
        <div className="absolute inset-0">
          <img
            src="/hero.jpg"
            alt="Sam & Jonah"
            className="w-full h-full object-cover scale-[1.35] md:scale-100 object-[center_15%] md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-berry" />
        </div>

        {/* Countdown - top right on desktop, bottom on mobile */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute top-20 right-6 z-20 hidden md:block"
        >
          <div className="backdrop-blur-md bg-berry-dark/30 border border-glass-border rounded-2xl px-6 py-4">
            <Countdown compact />
          </div>
        </motion.div>

        {/* Hero Content - pushed to bottom so faces are visible */}
        <div className="relative z-10 container mx-auto px-4 pt-[50vh] md:pt-[40vh] text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1
              variants={fadeInUp}
              className="font-display text-5xl md:text-8xl lg:text-9xl mb-4 md:mb-6 text-cream"
              style={{ fontWeight: 300 }}
            >
              Sam <span className="text-gold">&</span> Jonah
            </motion.h1>

            <motion.div variants={fadeInUp} className="mb-6 md:mb-8">
              <p className="text-xl md:text-3xl font-display italic text-blush/80">
                are getting married
              </p>
            </motion.div>

            {/* Elegant thin line divider */}
            <motion.div
              variants={fadeInUp}
              className="mb-6 md:mb-8 flex items-center justify-center gap-4"
            >
              <div className="w-12 md:w-16 h-px bg-gold/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
              <div className="w-12 md:w-16 h-px bg-gold/40" />
            </motion.div>

            <motion.div variants={fadeInUp} className="mb-8 md:mb-12 space-y-1 md:space-y-2">
              <p className="text-lg md:text-2xl font-display text-cream">
                August 15, 2026
              </p>
              <p className="text-base md:text-xl text-blush/70">
                Rouge Restaurant, Calgary, Alberta
              </p>
              <p className="text-sm md:text-lg text-blush/50">
                Ceremony begins at 3:45 PM
              </p>
            </motion.div>

            {/* Mobile countdown - compact inline */}
            <motion.div variants={fadeInUp} className="mb-8 md:hidden">
              <Countdown compact />
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              variants={fadeInUp}
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-gold/50"
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
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-20 px-4 bg-berry"
      >
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl md:text-5xl mb-6 text-cream">
            Join Us for Our Special Day
          </h2>
          <p className="text-lg text-blush/70 leading-relaxed mb-8">
            We are thrilled to celebrate our love story and marriage with all of
            our favourite people. Explore our website to learn more about our
            journey, wedding details, and how you can be part of our adventure.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-20 h-px bg-gold/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/50" />
            <div className="w-20 h-px bg-gold/30" />
          </div>
        </div>
      </motion.section>

      {/* Featured Photos Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="py-16 bg-berry"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[
              "NoraHanakoPhotographyS&JEngagement-5590-2.jpg",
              "NoraHanakoPhotographyS&JEngagement-5718-2.jpg",
              "NoraHanakoPhotographyS&JEngagement-5925-2.jpg",
              "NoraHanakoPhotographyS&JEngagement-6183-2.jpg",
            ].map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="aspect-square overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10"
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
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light font-medium transition-colors"
            >
              View more photos
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </motion.div>
        </div>
      </motion.section>

      {/* Quick Links Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
        className="py-20 px-4 bg-berry-dark/30"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Our Story",
                description:
                  "From our first date skating to building a life together",
                link: "/story",
              },
              {
                title: "Wedding Details",
                description:
                  "Ceremony timeline, venue information, and what to expect",
                link: "/details",
              },
              {
                title: "Travel & Stay",
                description:
                  "Hotels, things to do, and exploring beautiful Calgary",
                link: "/travel",
              },
            ].map((card) => (
              <motion.a
                key={card.title}
                href={card.link}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative block"
              >
                <div className="h-full bg-glass rounded-2xl p-8 border border-glass-border hover:border-gold/30 transition-[border-color] duration-300">
                  <h3 className="font-display text-3xl mb-4 text-cream">
                    {card.title}
                  </h3>
                  <p className="text-blush/60 leading-relaxed mb-6">
                    {card.description}
                  </p>
                  <div className="flex items-center text-gold font-medium group-hover:translate-x-2 transition-transform">
                    <span>Explore</span>
                    <svg
                      className="ml-2 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
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
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="py-20 px-4 bg-berry"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* RSVP Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-glass rounded-2xl p-10 text-center border border-gold/20 hover:border-gold/40 transition-[border-color] duration-300"
            >
              <h3 className="font-display text-3xl mb-3 text-cream">RSVP</h3>
              <p className="text-blush/60 mb-6">
                We can't wait to celebrate with you! Please let us know if you
                can join us.
              </p>
              <a
                href="/rsvp"
                className="inline-block bg-gold text-berry-dark px-8 py-3 rounded-full font-medium hover:bg-gold-light transition-colors"
              >
                RSVP Now
              </a>
            </motion.div>

            {/* Registry Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-glass rounded-2xl p-10 text-center border border-gold/20 hover:border-gold/40 transition-[border-color] duration-300"
            >
              <h3 className="font-display text-3xl mb-3 text-cream">
                Honeymoon Registry
              </h3>
              <p className="text-blush/60 mb-6">
                Help us create magical memories in Italy and Germany this
                September.
              </p>
              <a
                href="/registry"
                className="inline-block border-2 border-gold text-gold px-8 py-3 rounded-full font-medium hover:bg-gold hover:text-berry-dark transition-colors"
              >
                View Registry
              </a>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
