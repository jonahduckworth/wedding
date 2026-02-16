import { motion, useAnimation } from 'framer-motion';
import { useState } from 'react';
import Layout from '../components/Layout';

export default function StoryPage() {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const timelineEvents = [
    {
      date: 'January 2021',
      title: 'The First Date',
      description:
        'They matched on Hinge a couple months earlier, but Covid restrictions delayed their first meeting. Their skating/pond hockey date quickly turned into a 12-hour adventure that included coffee, building furniture, and ordering sushi. Sam thought Jonah was "kinda funny", and Jonah loved Sam\'s stories.',
      icon: '⛸️',
    },
    {
      date: '2021–2022',
      title: 'Inseparable',
      description:
        'They originally agreed to only see each other a couple times per week due to busy schedules with Jonah taking his B.Sc. in Computer Science and Sam taking her M.Ed. in School and Applied Child Psychology. This plan quickly went out the window after the 2nd date!',
      icon: '💫',
    },
    {
      date: '2022',
      title: 'Long Distance',
      description:
        'When Jonah had to live in Kamloops for 4 months to finish his degree, they proved their love could withstand the distance.',
      icon: '✈️',
    },
    {
      date: '2022–2024',
      title: 'Adventures Together',
      description:
        'They traveled to Arizona, Seattle, and throughout B.C., supported each other through the early days of their careers, and enjoyed bike rides (on the bike Jonah refurbished for Sam), getting burgers, hanging with friends, and playing sports together.',
      icon: '🚴',
    },
    {
      date: 'November 2024',
      title: 'Moose Joins the Family',
      description:
        'They adopted their sweet puppy, Moose, and now enjoy daily walks together as a family.',
      icon: '🐕',
    },
    {
      date: 'Future',
      title: 'Dreams Ahead',
      description:
        'Sam and Jonah aspire to travel to Italy, Portugal, and Japan, while expanding their family and building a beautiful life together.',
      icon: '🌟',
    },
  ];

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
    'NoraHanakoPhotographyS&JEngagement-5806.jpg',
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
      {/* ─── Hero ─── */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <motion.img
            src="/Gallery/NoraHanakoPhotographyS&JEngagement-5590.jpg"
            alt="Sam & Jonah"
            className="w-full h-full object-cover object-[center_40%]"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={heroLoaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/25" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative z-10 w-full text-center pb-24 md:pb-32 px-6"
        >
          <p className="text-white/80 text-[15px] tracking-[0.35em] uppercase mb-4 font-medium">
            How it all began
          </p>
          <h1
            className="font-display text-5xl md:text-7xl lg:text-8xl text-white drop-shadow-lg"
            style={{ fontWeight: 400, letterSpacing: '0.02em' }}
          >
            Our Love Story
          </h1>
          <p className="text-xl md:text-2xl font-display italic text-white/85 mt-3">
            From a first date that lasted 12 hours to a lifetime together
          </p>
        </motion.div>
      </section>

      {/* ─── The Full Story ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="py-24 md:py-32 px-6"
      >
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6 text-lg text-body leading-[1.9]">
            <p>
              Jonah and Sam met in{' '}
              <strong className="font-medium text-heading">January 2021</strong>.
              They matched on the dating app, Hinge, a couple of months earlier.
              They delayed their first date due to Covid restrictions, and the
              fact that Sam would be travelling home for Christmas.
            </p>
            <p>
              Their first date was skating/playing pond hockey. Sam thought Jonah
              was <em className="font-display">"kinda funny"</em>, Jonah loved
              Sam's stories, and their skating date quickly turned into a{' '}
              <strong className="font-medium text-heading">12-hour day</strong>{' '}
              which also included having coffee, building some furniture, and
              ordering sushi.
            </p>
            <p>
              They were both students at the time, with Jonah taking his B.Sc. in
              Computer Science, and Sam taking her M.Ed. in School and Applied
              Child Psychology. They had originally agreed that with their busy
              schedules, they should only plan to see each other a couple of times
              per week. This plan quickly went out the window (after the 2nd
              date), and they have been inseparable ever since.
            </p>
            <p>
              Over the course of their relationship, they have spent some time
              long-distance (Jonah had to live in Kamloops for 4 months to finish
              his degree), lived together, done some travels (Arizona, Seattle,
              and throughout B.C.), and have supported each other through the
              early days/years of their professional careers.
            </p>
            <p>
              In their free time, they enjoy going for bike rides (on the bike
              that Jonah refurbished for Sam), getting burgers, hanging out with
              friends, and playing a variety of different sports (e.g., soccer,
              tennis, golf, pickleball). They adopted their sweet puppy,{' '}
              <strong className="font-medium text-heading">Moose</strong>, in
              November 2024, and enjoy taking him for daily walks as well.
            </p>
            <p>
              Jonah and Sam aspire to do some bigger travels, including Italy,
              Portugal, and Japan, as well as expanding their family. They are{' '}
              <strong className="font-medium text-heading">
                thrilled to be able to celebrate their love story and marriage
              </strong>{' '}
              with all of their favourite people.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ─── Scrolling Photo Strip ─── */}
      <section className="py-6 bg-blush overflow-hidden">
        <div className="flex gap-3 animate-scroll">
          {[...galleryPhotos.slice(0, 8), ...galleryPhotos.slice(0, 8)].map(
            (photo, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-56 h-56 md:w-72 md:h-72 rounded-xl overflow-hidden"
              >
                <img
                  src={`/Gallery/${photo}`}
                  alt={`Sam & Jonah engagement photo ${(index % 8) + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )
          )}
        </div>
      </section>

      {/* ─── Timeline ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="py-24 md:py-32 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <p className="text-gold text-[13px] tracking-[0.3em] uppercase mb-4 font-medium">
              Our journey
            </p>
            <h2
              className="font-display text-4xl md:text-5xl text-heading"
              style={{ fontWeight: 300 }}
            >
              Milestones
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gold/20" />

            {timelineEvents.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.08 }}
                className={`relative mb-14 md:mb-12 ${
                  index % 2 === 0
                    ? 'md:pr-1/2 md:text-right'
                    : 'md:pl-1/2 md:ml-auto'
                } md:w-1/2`}
              >
                {/* Dot */}
                <div
                  className={`absolute top-6 left-2 md:left-auto ${
                    index % 2 === 0
                      ? 'md:right-0 md:translate-x-1/2'
                      : 'md:left-0 md:-translate-x-1/2'
                  } w-12 h-12 bg-gold rounded-full border-4 border-cream flex items-center justify-center text-xl shadow-sm z-10`}
                >
                  {event.icon}
                </div>

                {/* Card */}
                <div className="ml-20 md:ml-0">
                  <div
                    className={`bg-white rounded-2xl p-6 md:p-8 border border-card-border shadow-sm hover:shadow-md transition-shadow ${
                      index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'
                    }`}
                  >
                    <span className="inline-block text-[13px] font-medium text-gold mb-2 tracking-wide">
                      {event.date}
                    </span>
                    <h3
                      className="font-display text-2xl text-heading mb-3"
                      style={{ fontWeight: 400 }}
                    >
                      {event.title}
                    </h3>
                    <p className="text-body leading-relaxed">{event.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── Photo Gallery ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeInUp}
        className="py-24 md:py-32 px-6 bg-blush"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gold text-[13px] tracking-[0.3em] uppercase mb-4 font-medium">
              Captured moments
            </p>
            <h2
              className="font-display text-4xl md:text-5xl text-heading"
              style={{ fontWeight: 300 }}
            >
              Engagement Gallery
            </h2>
          </div>

          {/* Masonry Grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 md:gap-4 space-y-3 md:space-y-4">
            {galleryPhotos.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: index * 0.03 }}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={`/Gallery/${photo}`}
                    alt={`Sam & Jonah engagement photo ${index + 1}`}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── Lightbox ─── */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-5xl max-h-[90vh]"
          >
            <img
              src={`/Gallery/${selectedPhoto}`}
              alt="Sam & Jonah"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-heading hover:bg-gold hover:text-white transition-colors"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="4" x2="14" y2="14" />
                <line x1="14" y1="4" x2="4" y2="14" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
}
