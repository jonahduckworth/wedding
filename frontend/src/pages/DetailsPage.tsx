import { motion } from 'framer-motion';
import Layout from '../components/Layout';

export default function DetailsPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const timeline = [
    { time: '3:45 PM', event: 'Ceremony Begins', icon: '💍' },
    { time: '4:15 PM', event: 'Cocktail Hour', icon: '🍸' },
    { time: '5:30 PM', event: 'Reception & Dinner', icon: '🍽️' },
    { time: '7:00 PM', event: 'Speeches & Toasts', icon: '🥂' },
    { time: '8:00 PM', event: 'Cake Cutting', icon: '🎂' },
    { time: '8:30 PM', event: 'Dancing Begins', icon: '💃' },
    { time: 'Late', event: 'Party Continues', icon: '🎉' }
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
            Wedding Details
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-blush/70 italic mb-8"
          >
            Everything you need to know for our special day
          </motion.p>
          <motion.div variants={fadeInUp}>
          </motion.div>
        </div>
      </motion.section>

      {/* Venue Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInUp}
        className="py-20 px-4 bg-berry"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Venue Info Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-glass rounded-3xl p-8 md:p-10 border-2 border-glass-border shadow-lg"
            >
              <div className="text-5xl mb-4">📍</div>
              <h2 className="font-display text-3xl md:text-4xl mb-4 text-cream">
                The Venue
              </h2>
              <div className="space-y-3 text-blush/70">
                <p className="text-2xl font-display text-gold">
                  Rouge Restaurant
                </p>
                <p className="text-lg">
                  Calgary, Alberta
                </p>
                <p className="text-lg font-medium">
                  August 15, 2026
                </p>
                <p className="text-lg font-medium text-gold">
                  Ceremony: 3:45 PM
                </p>
              </div>
            </motion.div>

            {/* Dress Code Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-glass rounded-3xl p-8 md:p-10 border-2 border-glass-border shadow-lg"
            >
              <div className="text-5xl mb-4">👗</div>
              <h2 className="font-display text-3xl md:text-4xl mb-4 text-cream">
                Dress Code
              </h2>
              <div className="space-y-4 text-blush/70">
                <p className="text-lg font-medium text-gold">
                  Cocktail Attire
                </p>
                <p className="text-base leading-relaxed">
                  The ceremony and cocktail hour will take place on grass, so please choose appropriate footwear.
                </p>
                <p className="text-base leading-relaxed">
                  Although the venue is well-shaded, you may be more comfortable dressing in breathable clothing.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Timeline Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="py-20 px-4 bg-berry-dark/20"
      >
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl text-center mb-4 text-cream"
          >
            Timeline of the Day
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-center text-blush/70 mb-12"
          >
            A glimpse at how the celebration will unfold
          </motion.p>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gold/30" />

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className={`relative ${
                    index % 2 === 0
                      ? 'md:pr-1/2 md:text-right'
                      : 'md:pl-1/2 md:ml-auto'
                  } md:w-1/2`}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute top-4 ${
                      index % 2 === 0
                        ? 'md:right-[-1.25rem]'
                        : 'md:left-[-1.25rem]'
                    } left-[1.75rem] w-10 h-10 bg-gold rounded-full border-4 border-berry flex items-center justify-center text-lg shadow-lg`}
                  >
                    {item.icon}
                  </div>

                  {/* Content */}
                  <div className="ml-20 md:ml-0 md:mr-0">
                    <div
                      className={`bg-berry rounded-2xl p-6 shadow-lg border-2 border-glass-border hover:shadow-xl transition-shadow ${
                        index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                      }`}
                    >
                      <span className="inline-block text-sm font-medium text-gold mb-1">
                        {item.time}
                      </span>
                      <h3 className="font-display text-xl md:text-2xl text-cream">
                        {item.event}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Venue Details Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInUp}
        className="py-20 px-4 bg-berry"
      >
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-12 text-cream">
            About the Venue
          </h2>

          <div className="bg-berry/50 rounded-3xl p-8 md:p-12 border-2 border-glass-border shadow-lg space-y-6">
            <div>
              <h3 className="font-display text-2xl mb-3 text-cream flex items-center gap-2">
                <span>🌳</span> Outdoor & Indoor
              </h3>
              <p className="text-blush/70 leading-relaxed">
                The ceremony and cocktail hour will be outside. The reception and dancing will begin outside under our tent. Music and dancing will then move inside later into the evening, but guests are free to socialize outside throughout the evening.
              </p>
            </div>

            <div className="pt-6 border-t border-glass-border">
              <h3 className="font-display text-2xl mb-3 text-cream flex items-center gap-2">
                <span>🅿️</span> Parking
              </h3>
              <p className="text-blush/70 leading-relaxed">
                Parking information will be included with your invitation.
              </p>
            </div>

            <div className="pt-6 border-t border-glass-border">
              <h3 className="font-display text-2xl mb-3 text-cream flex items-center gap-2">
                <span>🌙</span> When Does the Party End?
              </h3>
              <p className="text-blush/70 leading-relaxed">
                Details to be confirmed - but we're planning to celebrate well into the evening!
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
