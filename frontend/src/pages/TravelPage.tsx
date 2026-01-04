import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import FloralDivider from '../components/decorative/FloralDivider';
import SketchFilter from '../components/decorative/SketchFilter';

export default function TravelPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const hotels = [
    {
      name: 'Alt Hotel East Village',
      description: 'We have a discounted rate at this hotel!',
      link: 'https://reservation.germainhotels.com/ibe/details.aspx?propertyid=17539&nights=1&checkin=08/14/2026&group=2604SAMAND&lang=en-us&adults=1&childAges=',
      highlight: true
    },
    {
      name: 'Fairmont Palliser',
      description: 'Luxurious downtown hotel',
      link: null
    },
    {
      name: 'Various Marriott Downtown',
      description: 'Multiple convenient locations',
      link: null
    },
    {
      name: 'Airbnb in Inglewood or Ramsay',
      description: 'Several charming options in nearby neighbourhoods',
      link: null
    }
  ];

  const activities = [
    {
      title: 'Shopping',
      icon: '🛍️',
      description: 'The wedding will be situated in the heart of Inglewood (Calgary\'s original downtown!). This cute neighbourhood has lots of boutiques, thrift shops, cafes, bookstores, and restaurants.'
    },
    {
      title: 'Breweries',
      icon: '🍺',
      description: 'There are lots of breweries in the area. Cold Garden is our old stomping grounds, but our current favourite is Highline Brewing.'
    },
    {
      title: 'E-Bike & River Paths',
      icon: '🚴',
      description: 'Try renting an e-bike, scooter, or just walk along the Bow River. Calgary has over 1000km of scenic and bikeable paths. Check out Pearce Estate Park, East Village or Prince\'s Island Park.'
    },
    {
      title: 'Golf',
      icon: '⛳',
      description: 'Try out one of our courses, or our versions of Top Golf (LaunchPad, Golf Future) for golf games, drinks, and food.'
    },
    {
      title: 'Studio Bell',
      icon: '🎵',
      description: 'Home of the National Music Centre and conveniently located downtown near Inglewood.'
    },
    {
      title: 'Calgary Zoo',
      icon: '🦁',
      description: 'The Calgary Zoo is located right in Inglewood.'
    },
    {
      title: 'Calgary Tower',
      icon: '🏙️',
      description: 'Have drinks in the rotating restaurant with panoramic views of the city.'
    },
    {
      title: 'Kensington',
      icon: '☕',
      description: 'Explore the neighbourhood that we live in! There\'s cute shops and cafes, as well as nearby Riley Park which has a lovely walking loop.'
    },
    {
      title: 'Mountains',
      icon: '⛰️',
      description: 'If you\'re planning on staying a while, check out some of the hikes just outside of Calgary! Anywhere in Kananaskis is stunning (1 hr drive). The town of Canmore is just as beautiful, but less busy than Banff (1 hr drive). Our favourite bagels are in Canmore at Rocky Mountain Bagel Co (it\'s worth it). Banff is a 1.5hr drive. Lake Louise is a 2 hr drive. There are also shuttles that can take you from Calgary to Banff or Lake Louise.'
    }
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
            Travel & Stay
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-warm-gray italic mb-8"
          >
            Everything you need to know about visiting beautiful Calgary
          </motion.p>
          <motion.div variants={fadeInUp}>
            <FloralDivider className="text-dusty-rose" />
          </motion.div>
        </div>
      </motion.section>

      {/* Getting Here Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInUp}
        className="py-20 px-4 bg-off-white"
      >
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-4xl md:text-5xl text-center mb-12 text-charcoal">
            Getting to Calgary
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-dusty-rose/10 to-blush/20 rounded-3xl p-8 border-2 border-dusty-rose/30 shadow-lg"
            >
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="font-display text-2xl mb-3 text-charcoal">
                By Air
              </h3>
              <p className="text-warm-gray leading-relaxed mb-3">
                Calgary has an International Airport (YYC). It is approximately a 20-minute drive from the airport to Inglewood.
              </p>
              <p className="text-warm-gray leading-relaxed">
                Ubers operate throughout Calgary for convenient transportation.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-br from-sage/10 to-terracotta/10 rounded-3xl p-8 border-2 border-sage/30 shadow-lg"
            >
              <div className="text-5xl mb-4">🚇</div>
              <h3 className="font-display text-2xl mb-3 text-charcoal">
                Getting Around
              </h3>
              <p className="text-warm-gray leading-relaxed mb-3">
                The C-Train operates for free throughout downtown.
              </p>
              <p className="text-warm-gray leading-relaxed text-sm">
                Note: There are no trains that connect downtown to Inglewood, but Ubers and taxis are readily available.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Where to Stay */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="py-20 px-4 bg-gradient-to-b from-off-white to-blush/10"
      >
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl text-center mb-4 text-charcoal"
          >
            Where to Stay
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-center text-warm-gray mb-12"
          >
            Recommended accommodations for our wedding weekend
          </motion.p>

          <div className="grid md:grid-cols-2 gap-6">
            {hotels.map((hotel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-2xl p-8 border-2 shadow-lg hover:shadow-xl transition-all ${
                  hotel.highlight
                    ? 'bg-dusty-rose/10 border-dusty-rose/40'
                    : 'bg-off-white border-sage/20'
                }`}
              >
                {hotel.highlight && (
                  <span className="inline-block px-3 py-1 bg-dusty-rose text-off-white text-sm rounded-full mb-3 font-medium">
                    Special Rate
                  </span>
                )}
                <h3 className="font-display text-2xl mb-2 text-charcoal">
                  {hotel.name}
                </h3>
                <p className="text-warm-gray mb-4">
                  {hotel.description}
                </p>
                {hotel.link && (
                  <a
                    href={hotel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-dusty-rose hover:text-dusty-rose/80 font-medium transition-colors"
                  >
                    Book Now
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Things to Do */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="py-20 px-4 bg-cream"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl text-center mb-4 text-charcoal"
          >
            Things to Do in Calgary
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-center text-warm-gray mb-12"
          >
            Make a weekend of it and explore what Calgary has to offer
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-off-white rounded-2xl p-6 border-2 border-dusty-rose/20 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-4xl mb-3">{activity.icon}</div>
                <h3 className="font-display text-xl mb-2 text-charcoal">
                  {activity.title}
                </h3>
                <p className="text-warm-gray text-sm leading-relaxed">
                  {activity.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
