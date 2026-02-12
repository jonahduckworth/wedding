import { motion } from 'framer-motion';
import Layout from '../components/Layout';

export default function DetailsPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const timeline = [
    { time: '3:45 PM', event: 'Ceremony Begins', icon: '💍' },
    { time: '4:15 PM', event: 'Cocktail Hour', icon: '🍸' },
    { time: '5:30 PM', event: 'Reception & Dinner', icon: '🍽️' },
    { time: '7:00 PM', event: 'Speeches & Toasts', icon: '🥂' },
    { time: '8:00 PM', event: 'Cake Cutting', icon: '🎂' },
    { time: '8:30 PM', event: 'Dancing Begins', icon: '💃' },
    { time: 'Late', event: 'Party Continues', icon: '🎉' },
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

      {/* ─── Venue & Dress Code ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="py-16 md:py-24 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Venue */}
            <motion.div variants={fadeInUp}>
              <div className="bg-white rounded-2xl p-8 md:p-10 border border-card-border h-full">
                <div className="text-4xl mb-4">📍</div>
                <h2
                  className="font-display text-3xl md:text-4xl text-heading mb-5"
                  style={{ fontWeight: 300 }}
                >
                  The Venue
                </h2>
                <div className="space-y-2 text-body">
                  <p className="text-2xl font-display text-gold" style={{ fontWeight: 400 }}>
                    Rouge Restaurant
                  </p>
                  <p className="text-lg">Calgary, Alberta</p>
                  <p className="text-lg font-medium text-heading">August 15, 2026</p>
                  <p className="text-lg font-medium text-gold">Ceremony: 3:45 PM</p>
                </div>
              </div>
            </motion.div>

            {/* Dress Code */}
            <motion.div variants={fadeInUp}>
              <div className="bg-white rounded-2xl p-8 md:p-10 border border-card-border h-full">
                <div className="text-4xl mb-4">👗</div>
                <h2
                  className="font-display text-3xl md:text-4xl text-heading mb-5"
                  style={{ fontWeight: 300 }}
                >
                  Dress Code
                </h2>
                <div className="space-y-4 text-body">
                  <p className="text-lg font-medium text-gold">Cocktail Attire</p>
                  <p className="leading-relaxed">
                    The ceremony and cocktail hour will take place on grass, so
                    please choose appropriate footwear.
                  </p>
                  <p className="leading-relaxed">
                    Although the venue is well-shaded, you may be more comfortable
                    dressing in breathable clothing.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── Timeline ─── */}
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

          <div className="relative">
            {/* Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gold/20" />

            <div className="space-y-6 md:space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className={`relative ${
                    index % 2 === 0
                      ? 'md:pr-1/2 md:text-right'
                      : 'md:pl-1/2 md:ml-auto'
                  } md:w-1/2`}
                >
                  {/* Dot */}
                  <div
                    className={`absolute top-4 ${
                      index % 2 === 0
                        ? 'md:right-[-1.25rem]'
                        : 'md:left-[-1.25rem]'
                    } left-[1.5rem] w-10 h-10 bg-gold rounded-full border-4 border-blush flex items-center justify-center text-base shadow-sm`}
                  >
                    {item.icon}
                  </div>

                  {/* Card */}
                  <div className="ml-20 md:ml-0">
                    <div
                      className={`bg-white rounded-2xl p-5 md:p-6 border border-card-border shadow-sm ${
                        index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                      }`}
                    >
                      <span className="inline-block text-[13px] font-medium text-gold mb-1 tracking-wide">
                        {item.time}
                      </span>
                      <h3
                        className="font-display text-xl md:text-2xl text-heading"
                        style={{ fontWeight: 400 }}
                      >
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

      {/* ─── About the Venue ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="py-24 md:py-32 px-6"
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
                Parking information will be included with your invitation.
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
                Details to be confirmed — but we're planning to celebrate well
                into the evening!
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
