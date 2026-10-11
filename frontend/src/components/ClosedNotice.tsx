import { Link } from 'react-router-dom';
import Layout from './Layout';

export default function ClosedNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Layout>
      <section className="px-6 pt-40 pb-28 md:pt-48 md:pb-36">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gold text-sm uppercase tracking-[0.2em] mb-5">Wedding archive</p>
          <h1 className="mb-8">{title}</h1>
          <p className="text-body text-lg leading-relaxed mb-10">{children}</p>
          <Link to="/story" className="inline-block bg-berry text-white px-8 py-3 rounded-full">
            Revisit our story
          </Link>
        </div>
      </section>
    </Layout>
  );
}
