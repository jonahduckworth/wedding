import { motion } from 'framer-motion';
import { useState } from 'react';
import Layout from '../components/Layout';

export default function StoryPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const timelineEvents = [
    {
      date: 'January 2021',
      title: 'The First Date',
      description: 'They matched on Hinge a couple months earlier, but Covid restrictions delayed their first meeting. Their skating/pond hockey date quickly turned into a 12-hour adventure that included coffee, building furniture, and ordering sushi. Sam thought Jonah was "kinda funny", and Jonah loved Sam\'s stories.',
      icon: '⛸️'
    },
    {
      date: '2021-2022',
      title: 'Inseparable',
      description: 'They originally agreed to only see each other a couple times per week due to busy schedules with Jonah taking his B.Sc. in Computer Science and Sam taking her M.Ed. in School and Applied Child Psychology. This plan quickly went out the window after the 2nd date!',
      icon: '💫'
    },
    {
      date: '2022',
      title: 'Long Distance',
      description: 'When Jonah had to live in Kamloops for 4 months to finish his degree, they proved their love could withstand the distance.',
      icon: '✈️'
    },
    {
      date: '2022-2024',
      title: 'Adventures Together',
      description: 'They traveled to Arizona, Seattle, and throughout B.C., supported each other through the early days of their careers, and enjoyed bike rides (on the bike Jonah refurbished for Sam), getting burgers, hanging with friends, and playing sports together.',
      icon: '🚴'
    },
    {
      date: 'November 2024',
      title: 'Moose Joins the Family',
      description: 'They adopted their sweet puppy, Moose, and now enjoy daily walks together as a family.',
      icon: '🐕'
    },
    {
      date: 'Future',
      title: 'Dreams Ahead',
      description: 'Sam and Jonah aspire to travel to Italy, Germany, and Japan, while expanding their family and building a beautiful life together.',
      icon: '🌟'
    }
  ];

  // Curated selection of engagement photos
  const galleryPhotos = [
    'NoraHanakoPhotographyS&JEngagement-5429.jpg',
    'NoraHanakoPhotographyS&JEngagement-5481.jpg',
    'NoraHanakoPhotographyS&JEngagement-5500-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-5521-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-5537.jpg',
    'NoraHanakoPhotographyS&JEngagement-5571.jpg',
    'NoraHanakoPhotographyS&JEngagement-5590-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-5635.jpg',
    'NoraHanakoPhotographyS&JEngagement-5671-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-5718-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-5750-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-5786.jpg',
    'NoraHanakoPhotographyS&JEngagement-5815.jpg',
    'NoraHanakoPhotographyS&JEngagement-5852-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-5880-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-5925-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-5963-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-5995-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-6057.jpg',
    'NoraHanakoPhotographyS&JEngagement-6089-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-6165-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-6183-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-6203-2.jpg',
    'NoraHanakoPhotographyS&JEngagement-6223.jpg',
  ];

  return (
    <Layout>

      {/* Hero Section with Photo */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/Gallery/NoraHanakoPhotographyS&JEngagement-5590.jpg"
            alt="Sam & Jonah"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-berry" />
        </div>

        <div className="container mx-auto max-w-4xl text-center relative z-10 px-4 py-24">
          <motion.h1
            variants={fadeInUp}
            className="font-display text-5xl md:text-7xl mb-6 text-cream"
          >
            Our Love Story
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-blush/70 italic mb-8"
          >
            From a first date that lasted 12 hours to a lifetime together
          </motion.p>
          <motion.div variants={fadeInUp}>
          </motion.div>
        </div>
      </motion.section>

      {/* The Full Story */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInUp}
        className="py-20 px-4 bg-berry"
      >
        <div className="container mx-auto max-w-3xl">
          <div className="bg-berry/50 rounded-3xl p-8 md:p-12 border-2 border-glass-border shadow-lg">
            <p className="text-lg text-cream leading-relaxed mb-6 font-light">
              Jonah and Sam met in <strong className="font-medium text-gold">January 2021</strong>. They matched on the dating app, Hinge, a couple of months earlier. They delayed their first date due to Covid restrictions, and the fact that Sam would be travelling home for Christmas.
            </p>
            <p className="text-lg text-cream leading-relaxed mb-6 font-light">
              Their first date was skating/playing pond hockey. Sam thought Jonah was <em className="font-display">"kinda funny"</em>, Jonah loved Sam's stories, and their skating date quickly turned into a <strong className="font-medium text-gold">12-hour day</strong> which also included having coffee, building some furniture, and ordering sushi.
            </p>
            <p className="text-lg text-cream leading-relaxed mb-6 font-light">
              They were both students at the time, with Jonah taking his B.Sc. in Computer Science, and Sam taking her M.Ed. in School and Applied Child Psychology. They had originally agreed that with their busy schedules, they should only plan to see each other a couple of times per week. This plan quickly went out the window (after the 2nd date), and they have been inseparable ever since.
            </p>
            <p className="text-lg text-cream leading-relaxed mb-6 font-light">
              Over the course of their relationship, they have spent some time long-distance (Jonah had to live in Kamloops for 4 months to finish his degree), lived together, done some travels (Arizona, Seattle, and throughout B.C.), and have supported each other through the early days/years of their professional careers.
            </p>
            <p className="text-lg text-cream leading-relaxed mb-6 font-light">
              In their free time, they enjoy going for bike rides (on the bike that Jonah refurbished for Sam), getting burgers, hanging out with friends, and playing a variety of different sports (e.g., soccer, tennis, golf, pickleball). They adopted their sweet puppy, <strong className="font-medium text-gold">Moose</strong>, in November 2024, and enjoy taking him for daily walks as well.
            </p>
            <p className="text-lg text-cream leading-relaxed font-light">
              Jonah and Sam aspire to do some bigger travels, including Italy, Germany, and Japan, as well as expanding their family. They are <strong className="font-medium text-gold">thrilled to be able to celebrate their love story and marriage</strong> with all of their favourite people.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Featured Photo Strip */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-8 bg-berry overflow-hidden"
      >
        <div className="flex gap-4 animate-scroll">
          {[...galleryPhotos.slice(0, 8), ...galleryPhotos.slice(0, 8)].map((photo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: (index % 8) * 0.05 }}
              className="flex-shrink-0 w-64 h-64 md:w-80 md:h-80"
            >
              <img
                src={`/Gallery/${photo}`}
                alt={`Sam & Jonah engagement photo ${index + 1}`}
                className="w-full h-full object-cover rounded-2xl shadow-lg"
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Timeline */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="py-20 px-4 bg-berry-dark/20"
      >
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl text-center mb-16 text-cream"
          >
            Our Journey
          </motion.h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gold/30" />

            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative mb-16 md:mb-12 ${
                  index % 2 === 0 ? 'md:pr-1/2 md:text-right' : 'md:pl-1/2 md:ml-auto'
                } md:w-1/2`}
              >
                {/* Timeline dot - centered on timeline line */}
                <div className={`absolute top-6 left-2 md:left-auto ${index % 2 === 0 ? 'md:right-0 md:translate-x-1/2' : 'md:left-0 md:-translate-x-1/2'} w-12 h-12 bg-gold rounded-full border-4 border-berry flex items-center justify-center text-xl shadow-lg z-10`}>
                  {event.icon}
                </div>

                {/* Content card */}
                <div className="ml-20 md:ml-0 md:mr-0">
                  <div className={`bg-berry rounded-2xl p-6 shadow-lg border-2 border-glass-border hover:shadow-xl transition-shadow ${
                    index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                  }`}>
                    <span className="inline-block text-sm font-medium text-gold mb-2">
                      {event.date}
                    </span>
                    <h3 className="font-display text-2xl mb-3 text-cream">
                      {event.title}
                    </h3>
                    <p className="text-blush/70 leading-relaxed font-light">
                      {event.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Photo Gallery */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={fadeInUp}
        className="py-20 px-4 bg-berry"
      >
        <div className="container mx-auto max-w-6xl">
          <h2 className="font-display text-4xl md:text-5xl mb-4 text-cream text-center">
            Our Memories
          </h2>
          <p className="text-blush/70 mb-12 text-center">
            A glimpse into our journey together
          </p>

          {/* Masonry Grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {galleryPhotos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <img
                    src={`/Gallery/${photo}`}
                    alt={`Sam & Jonah engagement photo ${index + 1}`}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-colors duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-berry-dark/95 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-5xl max-h-[90vh]"
          >
            <img
              src={`/Gallery/${selectedPhoto}`}
              alt="Sam & Jonah"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-berry rounded-full shadow-lg flex items-center justify-center text-cream hover:bg-gold hover:text-berry-dark transition-colors"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
}
