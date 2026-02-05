import { motion } from 'framer-motion';
import Layout from '../components/Layout';

export default function WeddingPartyPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const bridalParty = [
    {
      name: 'Sarah Orr',
      role: 'Maid of Honour',
      bio: "Sarah is the Maid of Honour and the bride's sister. She lives in Vancouver, B.C with her boyfriend, Cam. Together, they have a band named ORRA! Sarah used to annoy Sam lots as a child, and about 40% of the time it was because she was always singing. However, this paid off as they are very talented musicians. Although they live a province away from each other, Sam & Sarah make an effort to visit one another often. They share a similar sense of humour, and way of talking (IYKYK). They were lucky to have been best friends since day one. Sarah watched Sam play lots of computer games, always gave her the best toys, and they often got in trouble from their mother as teenagers for staying up too late chatting together in the basement.",
      color: 'gold'
    },
    {
      name: 'Tessa Hawkes',
      role: 'Bridesmaid',
      bio: 'Tessa and Sam met at the University of Victoria, back in 2014. They lived in the same residence building together, and both majored in psychology. They bonded through shared classes, life rants at the gym, and shared desire to travel. After graduating, they went on a 3-month backpacking trip throughout Southeast Asia. They learned that they were the perfect travel companions (you never know!) and made the most amazing memories filled with adventure, problem-solving, and mishaps. Tessa has recently moved from Washington to San Diego, California with her husband (River), baby boy (Cassian), and two big doggos (Saka and Charlie). Sam cannot wait to go visit them on their newest adventure (and I bet the dogs can\'t wait for us to come too!).',
      color: 'sage'
    },
    {
      name: 'Isabelle McCue',
      role: 'Bridesmaid',
      bio: 'Issi is originally from Calgary, A.B., but her and Sam also met at UVic through living in the same residence building. After a year of fun, they moved out together in a basement suite. Our parents always felt bad about the dark and dingy conditions of where we lived, but we loved it. We spent the next three years studying hard (one of us slightly more than the other), attending house parties, and going to the beach. Although Sam and Issi have almost polar opposite personalities, they have maintained a strong and light-hearted friendship throughout the years. Issi lives in Calgary, A.B. with her husband Ryan and sweet, giant, dog Nova. The four of us hang out often (with our pups!) and are super close friends.',
      color: 'gold'
    },
    {
      name: 'Courtney Walker',
      role: 'Bridesmaid',
      bio: 'Courtney and Sam met through mutual friends (Ryan and Issi) approximately 4 years ago. After hanging out as a group, Court and I found that we got along seamlessly and were quite similar people with a lot of shared interests. Since then, we have had many girls nights with lots of amazing snacks, brunch dates, and bubble tea dates. They are both artistic individuals (Court is a graphic designer) and enjoy doing crafts together, which often take longer than expected because both of them are perfectionists. Court has quite the green thumb and is a talented baker. She often generously gifts Sam with an abundance of veggies, herbs, and sweet treats, and Sam graciously accepts. She lives in Calgary with her husband, Dawson, and their two Frenchies, Lilo and Louie. Sam is the proud favourite of Lilo, who\'s affection is hard to earn.',
      color: 'blush'
    },
    {
      name: 'Rachelle Duckworth',
      role: 'Bridesmaid',
      bio: 'Rachelle is Jonah\'s lovely younger sister. She lives in Calgary, A.B. with her boyfriend, Ryan, and their teacup Yorkie, Bailey. She lived in Vancouver, B.C., until 2 years ago, and Sam and Jonah have enjoyed having her live much closer. Many childhood memories involving Rachelle and Jonah (and Lukas!) include singing and dancing (e.g., making an original song about corn and choreographing a dance to the Shrek soundtrack). Rachelle had always wanted to be a performer, but she has switched course and is now a Registered Sports Dietician. Rachelle and Sam bond over common interests in strength training, sports, and nutrition, and Sam loves all the free advice she gets! They also both love Christmas (Rachelle probably a good amount more), and enjoy dragging their partners to Christmas markets, watching Charlie Brown Christmas every year, and engaging in crafts and cookie decorating.',
      color: 'gold'
    },
    {
      name: 'Brienna Cabral',
      role: 'Bridesmaid',
      bio: 'Brie lives in Vernon, B.C., with her partner Rylan and cute cockapoo, Lenny. Sam and Brie went to the same elementary school, where they were friends, but got much closer starting in Grade 9 in high school. They both loved P.E. - it was the only class that she showed up consistently for! Brie\'s mom has always loved Sam because she has always been "the responsible friend". From house parties, to Monashee\'s, to working at a group home together, to gushing over romantasy books, Brie and Sam have shared many memories. They take turns visiting each other in Vernon and Calgary and enjoy any time they can spend together. Brie never fails to make Sam laugh, but also shake her head.',
      color: 'sage'
    },
    {
      name: 'Franzi Faetsch',
      role: 'Bridesmaid',
      bio: 'Franzi lives in Calgary, A.B., with her fiance Davron and their golden retriever puppy, Frankie. She is originally from Garmisch-Partenkirchen, Germany. Franzi and Sam met when they were in Grade 10. Franzi was an exchange student at Fulton for a semester, and they became friends. After Franzi returned to Germany, she visited Vernon once in a while in the summer and they would reconnect. In 2019, while Sam was travelling SE Asia, Franzi was doing a university exchange in Bali. They spent time together there and like to reminisce on their travel days. They then both moved back to Vernon in 2020 during Covid. Sam moved to Calgary in late 2020, then Franzi in 2021. Since then, they\'ve enjoyed pizza nights, ski trips, going hiking, and having puppy play dates.',
      color: 'gold'
    }
  ];

  const groomsmen = [
    { name: 'Lukas Duckworth', role: 'Groomsman' },
    { name: 'Layne Richardson', role: 'Groomsman' },
    { name: 'Nolan Munden', role: 'Groomsman' },
    { name: 'Adam Struch', role: 'Groomsman' },
    { name: 'Adam Hildebrand', role: 'Groomsman' },
    { name: 'Ryan McCue', role: 'Groomsman' },
    { name: 'Dawson Walker', role: 'Groomsman' }
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
            Our Wedding Party
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl text-blush/70 italic mb-8"
          >
            The amazing people standing by our side
          </motion.p>
          <motion.div variants={fadeInUp}>
          </motion.div>
        </div>
      </motion.section>

      {/* Bridesmaids */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="py-20 px-4 bg-berry"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl text-center mb-16 text-cream"
          >
            Bridesmaids
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {bridalParty.map((person, index) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-berry/50 rounded-3xl p-8 border-2 border-glass-border shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  {/* Photo placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-blush/40 to-sage/40 rounded-2xl mb-6 flex items-center justify-center border-2 border-glass-border overflow-hidden">
                    <span className="text-6xl">👰</span>
                  </div>

                  {/* Name & Role */}
                  <div className="mb-4">
                    <h3 className="font-display text-3xl mb-1 text-cream">
                      {person.name}
                    </h3>
                    <p className="text-gold font-medium">
                      {person.role}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-blush/70 leading-relaxed font-light text-sm">
                    {person.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Divider */}
      <div className="py-12 bg-berry flex items-center justify-center">
      </div>

      {/* Groomsmen */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="py-20 px-4 bg-berry"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.h2
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl text-center mb-16 text-cream"
          >
            Groomsmen
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {groomsmen.map((person, index) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-berry rounded-2xl p-6 border-2 border-glass-border shadow-lg hover:shadow-xl transition-all duration-300 text-center h-full">
                  {/* Photo placeholder */}
                  <div className="aspect-square bg-glass rounded-xl mb-4 flex items-center justify-center border-2 border-glass-border overflow-hidden">
                    <span className="text-5xl">🤵</span>
                  </div>

                  {/* Name & Role */}
                  <h3 className="font-display text-xl mb-1 text-cream">
                    {person.name}
                  </h3>
                  <p className="text-gold font-medium text-sm">
                    {person.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </Layout>
  );
}
