import { motion } from 'framer-motion';
import { useState } from 'react';
import Layout from '../components/Layout';

export default function TravelPage() {
  const [heroLoaded, setHeroLoaded] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const hotels = [
    {
      name: 'Alt Hotel East Village',
      description: 'We have a discounted rate at this hotel!',
      link: 'https://reservation.germainhotels.com/ibe/details.aspx?propertyid=17539&nights=1&checkin=08/14/2026&group=2604SAMAND&lang=en-us&adults=1&childAges=',
      highlight: true,
    },
    {
      name: 'Fairmont Palliser',
      description: 'Luxurious downtown hotel',
      link: null,
    },
    {
      name: 'Various Marriott Downtown',
      description: 'Multiple convenient locations',
      link: null,
    },
    {
      name: 'Airbnb in Inglewood or Ramsay',
      description: 'Several charming options in nearby neighbourhoods',
      link: null,
    },
  ];

  const activities = [
    {
      title: 'Shopping',
      image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=600&fit=crop',
      description:
        "The wedding will be situated in the heart of Inglewood (Calgary's original downtown!). This cute neighbourhood has lots of boutiques, thrift shops, cafes, bookstores, and restaurants.",
    },
    {
      title: 'Breweries',
      image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&h=600&fit=crop',
      description:
        'There are lots of breweries in the area. Cold Garden is our old stomping grounds, but our current favourite is Highline Brewing.',
    },
    {
      title: 'E-Bike & River Paths',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop',
      description:
        "Try renting an e-bike, scooter, or just walk along the Bow River. Calgary has over 1000km of scenic and bikeable paths. Check out Pearce Estate Park, East Village or Prince's Island Park.",
    },
    {
      title: 'Golf',
      image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&h=600&fit=crop',
      description:
        'Try out one of our courses, or our versions of Top Golf (LaunchPad, Golf Future) for golf games, drinks, and food.',
    },
    {
      title: 'Studio Bell',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop',
      description:
        'Home of the National Music Centre and conveniently located downtown near Inglewood.',
    },
    {
      title: 'Calgary Zoo',
      image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800&h=600&fit=crop',
      description: 'The Calgary Zoo is located right in Inglewood.',
    },
    {
      title: 'Calgary Tower',
      image: 'https://images.unsplash.com/photo-1571154820609-33a8b52f4c7c?w=800&h=600&fit=crop',
      description:
        'Have drinks in the rotating restaurant with panoramic views of the city.',
    },
    {
      title: 'Kensington',
      image: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?w=800&h=600&fit=crop',
      description:
        "Explore the neighbourhood that we live in! There's cute shops and cafes, as well as nearby Riley Park which has a lovely walking loop.",
    },
    {
      title: 'Mountains',
      image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&h=600&fit=crop',
      description:
        "If you're planning on staying a while, check out some of the hikes just outside of Calgary! Anywhere in Kananaskis is stunning (1 hr drive). The town of Canmore is just as beautiful, but less busy than Banff (1 hr drive). Our favourite bagels are in Canmore at Rocky Mountain Bagel Co (it's worth it). Banff is a 1.5hr drive. Lake Louise is a 2 hr drive. There are also shuttles that can take you from Calgary to Banff or Lake Louise.",
    },
  ];

  return (
    <Layout>
      {/* ─── Hero ─── */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <motion.img
            src="/Gallery/NoraHanakoPhotographyS&JEngagement-5892.jpg"
            alt="Sam & Jonah"
            className="w-full h-full object-cover object-center"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={heroLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/25" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative z-10 w-full text-center pb-24 md:pb-32 px-6"
        >
          <p className="text-white/45 text-[13px] tracking-[0.35em] uppercase mb-4">
            Plan your trip
          </p>
          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl text-white"
            style={{ fontWeight: 300, letterSpacing: '0.02em' }}
          >
            Travel &amp; Stay
          </h1>
          <p className="text-lg md:text-xl font-display italic text-white/55 mt-3">
            Everything you need to know about visiting beautiful Calgary
          </p>
        </motion.div>
      </section>

      {/* ─── Getting Here ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="py-16 md:py-24 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <h2
            className="font-display text-3xl md:text-4xl text-center mb-10 text-heading"
            style={{ fontWeight: 300 }}
          >
            Getting to Calgary
          </h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <motion.div variants={fadeInUp}>
              <div className="bg-white rounded-2xl p-8 border border-card-border h-full">
                <div className="text-4xl mb-4">✈️</div>
                <h3
                  className="font-display text-2xl text-heading mb-3"
                  style={{ fontWeight: 400 }}
                >
                  By Air
                </h3>
                <p className="text-body leading-relaxed mb-3">
                  Calgary has an International Airport (YYC). It is approximately
                  a 20-minute drive from the airport to Inglewood.
                </p>
                <p className="text-body leading-relaxed">
                  Ubers operate throughout Calgary for convenient transportation.
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="bg-white rounded-2xl p-8 border border-card-border h-full">
                <div className="text-4xl mb-4">🚇</div>
                <h3
                  className="font-display text-2xl text-heading mb-3"
                  style={{ fontWeight: 400 }}
                >
                  Getting Around
                </h3>
                <p className="text-body leading-relaxed mb-3">
                  The C-Train operates for free throughout downtown.
                </p>
                <p className="text-subtle leading-relaxed text-sm">
                  Note: There are no trains that connect downtown to Inglewood,
                  but Ubers and taxis are readily available.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─── Where to Stay ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="py-24 md:py-32 px-6 bg-blush"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <p className="text-gold text-[13px] tracking-[0.3em] uppercase mb-4 font-medium">
              Accommodations
            </p>
            <h2
              className="font-display text-4xl md:text-5xl text-heading"
              style={{ fontWeight: 300 }}
            >
              Where to Stay
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {hotels.map((hotel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <div
                  className={`rounded-2xl p-8 border h-full transition-shadow duration-500 ${
                    hotel.highlight
                      ? 'bg-white border-gold/30 shadow-md'
                      : 'bg-white border-card-border hover:shadow-md'
                  }`}
                >
                  {hotel.highlight && (
                    <span className="inline-block px-3 py-1 bg-gold text-white text-[12px] rounded-full mb-3 font-medium tracking-wide uppercase">
                      Special Rate
                    </span>
                  )}
                  <h3
                    className="font-display text-2xl text-heading mb-2"
                    style={{ fontWeight: 400 }}
                  >
                    {hotel.name}
                  </h3>
                  <p className="text-body mb-4">{hotel.description}</p>
                  {hotel.link && (
                    <a
                      href={hotel.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-gold text-[13px] font-medium uppercase tracking-[0.1em] hover:text-berry transition-colors"
                    >
                      Book Now
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
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── Things to Do ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="py-24 md:py-32 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <p className="text-gold text-[13px] tracking-[0.3em] uppercase mb-4 font-medium">
              Explore
            </p>
            <h2
              className="font-display text-4xl md:text-5xl text-heading"
              style={{ fontWeight: 300 }}
            >
              Things to Do in Calgary
            </h2>
            <p className="text-body mt-4">
              Make a weekend of it and explore what Calgary has to offer
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.04 }}
              >
                <div className="bg-white rounded-2xl border border-card-border h-full hover:shadow-md transition-shadow duration-500 overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h3
                      className="font-display text-xl text-heading mb-2"
                      style={{ fontWeight: 400 }}
                    >
                      {activity.title}
                    </h3>
                    <p className="text-body text-[15px] leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
