import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import FloralDivider from '../components/decorative/FloralDivider';
import SketchFilter from '../components/decorative/SketchFilter';

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
      <SketchFilter />

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative py-24 px-4 bg-gradient-to-b from-cream to-off-white"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <motion.h1
            variants={fadeInUp}
            className="font-display text-5xl md:text-7xl mb-6 text-charcoal"
          >
            Wedding Details
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-warm-gray italic mb-8"
          >
            Everything you need to know for our special day
          </motion.p>
          <motion.div variants={fadeInUp}>
            <FloralDivider className="text-dusty-rose" />
          </motion.div>
        </div>
      </motion.section>

      {/* Venue Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInUp}
        className="py-20 px-4 bg-off-white"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Venue Info Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-dusty-rose/10 to-blush/20 rounded-3xl p-8 md:p-10 border-2 border-dusty-rose/30 shadow-lg"
            >
              <div className="text-5xl mb-4">📍</div>
              <h2 className="font-display text-3xl md:text-4xl mb-4 text-charcoal">
                The Venue
              </h2>
              <div className="space-y-3 text-warm-gray">
                <p className="text-2xl font-display text-dusty-rose">
                  Rouge Restaurant
                </p>
                <p className="text-lg">
                  Calgary, Alberta
                </p>
                <p className="text-lg font-medium">
                  August 15, 2026
                </p>
                <p className="text-lg font-medium text-dusty-rose">
                  Ceremony: 3:45 PM
                </p>
              </div>
            </motion.div>

            {/* Dress Code Card */}
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-sage/10 to-terracotta/10 rounded-3xl p-8 md:p-10 border-2 border-sage/30 shadow-lg"
            >
              <div className="text-5xl mb-4">👗</div>
              <h2 className="font-display text-3xl md:text-4xl mb-4 text-charcoal">
                Dress Code
              </h2>
              <div className="space-y-4 text-warm-gray">
                <p className="text-lg font-medium text-sage">
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
        className="py-20 px-4 bg-gradient-to-b from-off-white via-blush/10 to-cream"
      >
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl text-center mb-4 text-charcoal"
          >
            Timeline of the Day
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-center text-warm-gray mb-12"
          >
            A glimpse at how the celebration will unfold
          </motion.p>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-dusty-rose/30" />

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
                    } left-[1.75rem] w-10 h-10 bg-dusty-rose rounded-full border-4 border-off-white flex items-center justify-center text-lg shadow-lg`}
                  >
                    {item.icon}
                  </div>

                  {/* Content */}
                  <div className="ml-20 md:ml-0 md:mr-0">
                    <div
                      className={`bg-off-white rounded-2xl p-6 shadow-lg border-2 border-dusty-rose/20 hover:shadow-xl transition-shadow ${
                        index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                      }`}
                    >
                      <span className="inline-block text-sm font-medium text-dusty-rose mb-1">
                        {item.time}
                      </span>
                      <h3 className="font-display text-xl md:text-2xl text-charcoal">
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
        className="py-20 px-4 bg-off-white"
      >
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-12 text-charcoal">
            About the Venue
          </h2>

          <div className="bg-cream/50 rounded-3xl p-8 md:p-12 border-2 border-sage/20 shadow-lg space-y-6">
            <div>
              <h3 className="font-display text-2xl mb-3 text-charcoal flex items-center gap-2">
                <span>🌳</span> Outdoor & Indoor
              </h3>
              <p className="text-warm-gray leading-relaxed">
                The ceremony and cocktail hour will be outside. The reception and dancing will begin outside under our tent. Music and dancing will then move inside later into the evening, but guests are free to socialize outside throughout the evening.
              </p>
            </div>

            <div className="pt-6 border-t border-dusty-rose/20">
              <h3 className="font-display text-2xl mb-3 text-charcoal flex items-center gap-2">
                <span>🅿️</span> Parking
              </h3>
              <p className="text-warm-gray leading-relaxed">
                Parking information will be included with your invitation.
              </p>
            </div>

            <div className="pt-6 border-t border-dusty-rose/20">
              <h3 className="font-display text-2xl mb-3 text-charcoal flex items-center gap-2">
                <span>🌙</span> When Does the Party End?
              </h3>
              <p className="text-warm-gray leading-relaxed">
                Details to be confirmed - but we're planning to celebrate well into the evening!
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
