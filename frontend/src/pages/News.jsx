import React, { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import SearchPage from './Search';

const NEWS_IMAGE =
  'https://cdn.togetherbuying.in/cms/uploads/BANNER_OPTION_1_a4ae127078.jpeg?q=75&w=3840';

const NEWS_ITEMS = [
  {
    date: '06 Feb 2025',
    title:
      'TogetherBuying.in: Revolutionising How India Buys Homes - Smarter, Together',
    description: 'Together Buying News update',
    tone: 'light',
  },
  {
    date: '15 Jan 2024',
    title:
      'TogetherBuying.in: Revolutionising How India Buys Homes - Smarter, Together',
    description: 'Together Buying News update',
    tone: 'dark',
  },
];

const NewsCard = ({ item }) => (
  <article className="w-full">
    <div className="relative aspect-[1.98/1] overflow-hidden rounded-[14px] bg-slate-100">
      <img
        src={NEWS_IMAGE}
        alt={item.title}
        className="h-full w-full object-cover object-center"
      />
      <div
        className={`absolute inset-0 ${
          item.tone === 'dark'
            ? 'bg-black/55'
            : 'bg-gradient-to-b from-white/62 via-white/10 to-black/18'
        }`}
      />
      <div className="absolute bottom-8 left-8 rounded-full bg-black/28 px-3 py-1.5 text-[15px] font-semibold leading-none text-white">
        {item.date}
      </div>
    </div>

    <h2 className="mt-4 max-w-[610px] text-[26px] font-semibold leading-[1.13] text-black">
      {item.title}
    </h2>
    <p className="mt-5 text-[14px] leading-none text-[#5d626b]">
      {item.description}
    </p>

    <a
      href="/news/how-let-s-upgrade-improved-learning-experience-for-1000s-of-students-2"
      className="mt-8 inline-flex h-[62px] items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-6 text-[20px] font-semibold text-black transition-colors hover:border-[#d7d7d7] hover:bg-[#fafafa]"
    >
      <ArrowUpRight size={22} strokeWidth={2.2} />
      Read more
    </a>
  </article>
);

const News = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24">
      <section className="px-4">
        <div className="mx-auto max-w-[1215px]">
          <div className="pt-6 text-center">
            <h1 className="text-[48px] font-semibold leading-none text-black">
              News
            </h1>
            <p className="mt-8 text-[18px] font-normal text-[#5f6570]">
              Discover the latest news and updates from the real estate world
            </p>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-2">
            {NEWS_ITEMS.map((item) => (
              <NewsCard key={item.date} item={item} />
            ))}
          </div>

          <p className="mt-14 text-center text-[15px] text-[#5f6570]">
            You have reached the end of the list
          </p>
        </div>
      </section>
      <SearchPage/>
    </div>
  );
};

export default News;
