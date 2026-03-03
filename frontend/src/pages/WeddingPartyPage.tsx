import { motion } from 'framer-motion';
import Layout from '../components/Layout';

export default function WeddingPartyPage() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  const bridalParty = [
    {
      name: 'Sarah Orr',
      role: 'Maid of Honour',
      bio: "Sarah is the Maid of Honour and the bride's sister. She lives in Vancouver, B.C with her boyfriend, Cam. Together, they have a band named ORRA! Sarah used to annoy Sam lots as a child, and about 40% of the time it was because she was always singing. However, this paid off as they are very talented musicians. Although they live a province away from each other, Sam & Sarah make an effort to visit one another often. They share a similar sense of humour, and way of talking (IYKYK). They were lucky to have been best friends since day one. Sarah watched Sam play lots of computer games, always gave her the best toys, and they often got in trouble from their mother as teenagers for staying up too late chatting together in the basement.",
    },
    {
      name: 'Tessa Hawkes',
      role: 'Bridesmaid',
      bio: 'Tessa and Sam met at the University of Victoria, back in 2014. They lived in the same residence building together, and both majored in psychology. They bonded through shared classes, life rants at the gym, and shared desire to travel. After graduating, they went on a 3-month backpacking trip throughout Southeast Asia. They learned that they were the perfect travel companions (you never know!) and made the most amazing memories filled with adventure, problem-solving, and mishaps. Tessa has recently moved from Washington to San Diego, California with her husband (River), baby boy (Cassian), and two big doggos (Saka and Charlie). Sam cannot wait to go visit them on their newest adventure (and I bet the dogs can\'t wait for us to come too!).',
    },
    {
      name: 'Isabelle McCue',
      role: 'Bridesmaid',
      bio: 'Issi is originally from Calgary, A.B., but her and Sam also met at UVic through living in the same residence building. After a year of fun, they moved out together in a basement suite. Our parents always felt bad about the dark and dingy conditions of where we lived, but we loved it. We spent the next three years studying hard (one of us slightly more than the other), attending house parties, and going to the beach. Although Sam and Issi have almost polar opposite personalities, they have maintained a strong and light-hearted friendship throughout the years. Issi lives in Calgary, A.B. with her husband Ryan and sweet, giant, dog Nova. The four of us hang out often (with our pups!) and are super close friends.',
    },
    {
      name: 'Courtney Walker',
      role: 'Bridesmaid',
      bio: 'Courtney and Sam met through mutual friends (Ryan and Issi) approximately 4 years ago. After hanging out as a group, Court and I found that we got along seamlessly and were quite similar people with a lot of shared interests. Since then, we have had many girls nights with lots of amazing snacks, brunch dates, and bubble tea dates. They are both artistic individuals (Court is a graphic designer) and enjoy doing crafts together, which often take longer than expected because both of them are perfectionists. Court has quite the green thumb and is a talented baker. She often generously gifts Sam with an abundance of veggies, herbs, and sweet treats, and Sam graciously accepts. She lives in Calgary with her husband, Dawson, and their two Frenchies, Lilo and Louie. Sam is the proud favourite of Lilo, who\'s affection is hard to earn.',
    },
    {
      name: 'Rachelle Duckworth',
      role: 'Bridesmaid',
      bio: 'Rachelle is Jonah\'s lovely younger sister. She lives in Calgary, A.B. with her boyfriend, Ryan, and their teacup Yorkie, Bailey. She lived in Vancouver, B.C., until 2 years ago, and Sam and Jonah have enjoyed having her live much closer. Many childhood memories involving Rachelle and Jonah (and Lukas!) include singing and dancing (e.g., making an original song about corn and choreographing a dance to the Shrek soundtrack). Rachelle had always wanted to be a performer, but she has switched course and is now a Registered Sports Dietician. Rachelle and Sam bond over common interests in strength training, sports, and nutrition, and Sam loves all the free advice she gets! They also both love Christmas (Rachelle probably a good amount more), and enjoy dragging their partners to Christmas markets, watching Charlie Brown Christmas every year, and engaging in crafts and cookie decorating.',
    },
    {
      name: 'Brienna Cabral',
      role: 'Bridesmaid',
      bio: 'Brie lives in Vernon, B.C., with her partner Rylan and cute cockapoo, Lenny. Sam and Brie went to the same elementary school, where they were friends, but got much closer starting in Grade 9 in high school. They both loved P.E. - it was the only class that she showed up consistently for! Brie\'s mom has always loved Sam because she has always been "the responsible friend". From house parties, to Monashee\'s, to working at a group home together, to gushing over romantasy books, Brie and Sam have shared many memories. They take turns visiting each other in Vernon and Calgary and enjoy any time they can spend together. Brie never fails to make Sam laugh, but also shake her head.',
    },
    {
      name: 'Franzi Faetsch',
      role: 'Bridesmaid',
      bio: 'Franzi lives in Calgary, A.B., with her fiance Davron and their golden retriever puppy, Frankie. She is originally from Garmisch-Partenkirchen, Germany. Franzi and Sam met when they were in Grade 10. Franzi was an exchange student at Fulton for a semester, and they became friends. After Franzi returned to Germany, she visited Vernon once in a while in the summer and they would reconnect. In 2019, while Sam was travelling SE Asia, Franzi was doing a university exchange in Bali. They spent time together there and like to reminisce on their travel days. They then both moved back to Vernon in 2020 during Covid. Sam moved to Calgary in late 2020, then Franzi in 2021. Since then, they\'ve enjoyed pizza nights, ski trips, going hiking, and having puppy play dates.',
    },
  ];

  const groomsmen = [
    {
      name: 'Lukas Duckworth',
      role: 'Best Man',
      bio: "Lukas is the best man and the groom's younger brother — though \"brother\" undersells it. They were best friends who happened to share a last name. Growing up, they'd watch WWE and immediately sprint to the trampoline to try the same moves. They played hockey together constantly: mini sticks, road hockey, and Jonah even helped coach Lukas' team alongside their dad for years. At some point, Lukas decided to pack his life up and move to Banff to chase skiing full-time. He worked at Sunshine for a few years, met his girlfriend Lauren out there, and now works for the ski media hub Newschoolers.",
    },
    {
      name: 'Nolan Munden',
      role: 'Groomsman',
      bio: "Nolan was the first person Jonah met when he moved to Kamloops at eight years old, on his first day at McGowan Park Elementary. They were inseparable through elementary, high school, and even dropped out of business school together at TRU when they were 18. Everything they've been through together — the good times, the terrible decisions, the rest of it — can't really be condensed into a paragraph. But through all of it, they've always had each other's back. Today, Nolan lives in Kamloops with his wife Kirsten and their son Kace, running a truck service and repair shop called Munden Truck & Equipment Ltd.",
    },
    {
      name: 'Adam Hildebrand',
      role: 'Groomsman',
      bio: "Adam and Jonah go back to grade 3, when Nolan introduced them after Jonah moved to Kamloops. They grew up together through McGowan Park and Sahali Secondary — playing sports, getting into trouble, doing what they knew best. After high school, they both gave business school at TRU an honest shot. Neither lasted more than a year. Adam found his way into welding and built a real career with it, while Jonah eventually circled back to school for computing science. Different paths, but the friendship never skipped a beat. Today, Adam lives in Kamloops with his wife Madison and their daughter Hunter. He's also working on a startup to help local businesses.",
    },
    {
      name: 'Adam Struch',
      role: 'Groomsman',
      bio: "Adam and Jonah first crossed paths when Jonah moved to Kamloops and joined Adam's minor hockey team. Jonah always admired Adam's combination of athleticism and business sense, but he could never crack the AAA teams, and Adam went to different schools than the other Kamloops guys — so they didn't really get close until after high school. What brought them together was their mutual best friends, Nolan and Adam Hildebrand. Today, Adam lives in Chilliwack with his wife McKenzie. He has a degree in Hydrogeology, sells real estate, and runs a short-term rental company.",
    },
    {
      name: 'Ryan McCue',
      role: 'Groomsman',
      bio: "Ryan is the first friend the groom made in Calgary. Sam set up a double date — ice skating at Bowness Park — with Ryan and his wife Issi. Jonah was immediately struck by Ryan's real estate tech job and how much he knew about software and building systems. At the time, Jonah hadn't finished his computing science degree and had zero tech portfolio. Ryan helped him build his very first React app, which was enough to land Jonah an internship right out of school. They're still building together — Ryan is CTO of Ref Buddy. Outside of tech, they play pickleball, poker, and get out for hikes, skiing, and golf whenever they can.",
    },
    {
      name: 'Dawson Walker',
      role: 'Groomsman',
      bio: "Dawson is one of the groom's biggest inspirations when it comes to building things. The man has built hundreds of projects: websites, apps, a pinball machine, AR experiments, a hydroponics system for an indoor herb garden, crypto tech. Jonah met Dawson through Ryan, and the three of them bonded over being deep into the tech wave as it kept accelerating. Beyond tech, sports, and poker, Dawson and Jonah are also in a band together with their friend Mike. They play a lot of instruments and they are very loud. First album TBD. Today, Dawson is working on multiple projects in the crypto space and is married to his wife Courtney.",
    },
    {
      name: 'Layne Richardson',
      role: 'Groomsman',
      bio: "Layne and Jonah first met in the summer of 2013 at an event for BC's U17 hockey players and up-and-coming officials. One of those instant friendships — they felt like they'd known each other forever. Since then, they've reffed hockey games together all over BC and built a friendship that goes well beyond the rink. It took both of them considerably longer than their parents expected to finish their degrees, but neither set of parents accounted for the beer consumption along the way. Today, Layne has Bachelor's degrees in Human Kinetics and Athletic Therapy and works as the Athletic Therapist for the Moose Jaw Warriors. He's engaged to his fiancée Taylor.",
    },
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
            The people we love
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl text-heading mb-6"
            style={{ fontWeight: 300 }}
          >
            Our Wedding Party
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
            The amazing people standing by our side
          </motion.p>
        </div>
      </section>

      {/* ─── Bridesmaids ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="py-16 md:py-24 px-6 bg-blush"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl text-center mb-14 text-heading"
            style={{ fontWeight: 300 }}
          >
            Bridesmaids
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {bridalParty.map((person, index) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <div className="bg-white rounded-2xl p-8 md:p-10 border border-card-border h-full hover:shadow-md transition-shadow duration-500">
                  {/* Name & Role */}
                  <div className="mb-5">
                    <h3
                      className="font-display text-2xl md:text-3xl text-heading"
                      style={{ fontWeight: 400 }}
                    >
                      {person.name}
                    </h3>
                    <p className="text-gold text-[13px] font-medium tracking-wide mt-1">
                      {person.role}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-body leading-relaxed text-[15px]">
                    {person.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── Divider ─── */}
      <div className="py-8 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-px bg-gold/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold/30" />
          <div className="w-16 h-px bg-gold/20" />
        </div>
      </div>

      {/* ─── Groomsmen ─── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="py-16 md:py-24 px-6"
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            variants={fadeInUp}
            className="font-display text-4xl md:text-5xl text-center mb-14 text-heading"
            style={{ fontWeight: 300 }}
          >
            Groomsmen
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {groomsmen.map((person, index) => (
              <motion.div
                key={person.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <div className="bg-white rounded-2xl p-8 md:p-10 border border-card-border h-full hover:shadow-md transition-shadow duration-500">
                  {/* Name & Role */}
                  <div className="mb-5">
                    <h3
                      className="font-display text-2xl md:text-3xl text-heading"
                      style={{ fontWeight: 400 }}
                    >
                      {person.name}
                    </h3>
                    <p className="text-gold text-[13px] font-medium tracking-wide mt-1">
                      {person.role}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-body leading-relaxed text-[15px]">
                    {person.bio}
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
