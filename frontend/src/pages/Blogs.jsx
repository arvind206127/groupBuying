import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowRight,
  ArrowUpRight,
  BadgePercent,
  Banknote,
  Loader2,
  Users,
} from 'lucide-react';
import api from '../api/axios';
import { blogPageStats, getFallbackBlogs, mergeBlogs } from '../data/blogs';

const FEATURED_SLUG = 'group-buying-revolution';
const DEFAULT_FEATURED_VISUAL =
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80';
const FEATURED_PROPERTY_VISUAL =
  'https://www.birlaojasvi.ind.in/images/birla/best-branded-apartments-in-bangalore.webp';

const statIcons = {
  banknote: Banknote,
  'badge-percent': BadgePercent,
  users: Users,
};

const buildGridBackground = (from, to) => ({
  backgroundImage: [
    'linear-gradient(rgba(255,255,255,0.11) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(255,255,255,0.11) 1px, transparent 1px)',
    `linear-gradient(135deg, ${from}, ${to})`,
  ].join(', '),
  backgroundSize: '40px 40px, 40px 40px, 100% 100%',
  backgroundPosition: '0 0, 0 0, 0 0',
});

const StatCard = ({ stat }) => {
  const Icon = statIcons[stat.icon] || Banknote;

  return (
    <div className="rounded-[24px] border border-[#f3cfc1] bg-[#f8d7cd] p-5 shadow-[0_18px_45px_rgba(226,95,49,0.12)]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f37b54] text-white">
        <Icon size={18} />
      </div>
      <p className="text-sm font-semibold text-[#1c1b1a]">{stat.value}</p>
      <p className="mt-1 text-xs leading-5 text-[#675a56]">{stat.label}</p>
    </div>
  );
};

const FeaturedStory = ({ blog }) => {
  const reduceMotion = useReducedMotion();
  const featuredImage =
    blog.slug === FEATURED_SLUG
      ? FEATURED_PROPERTY_VISUAL
      : blog.featuredVisual || blog.thumbnail || DEFAULT_FEATURED_VISUAL;

  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group relative block overflow-hidden rounded-[34px] p-5 text-white shadow-[0_30px_80px_rgba(226,95,49,0.25)] transition-transform duration-300 hover:-translate-y-1 sm:p-7 lg:p-9"
      style={buildGridBackground(blog.accentFrom, blog.accentTo)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#f15d33]/95 via-[#f15d33]/88 to-[#df4b25]/68" />
      <div className="absolute -right-24 top-6 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-28 left-12 h-80 w-80 rounded-full bg-[#8a2c18]/18 blur-3xl" />

      <div className="relative z-10 grid min-h-[390px] gap-8 lg:min-h-[430px] lg:grid-cols-[minmax(0,0.98fr)_minmax(390px,0.82fr)] lg:items-center">
        <div className="max-w-2xl lg:max-w-[660px]">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-white/75">
            {blog.eyebrow}
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-[0.96] tracking-[-0.06em] sm:text-5xl lg:text-[4rem]">
            {blog.heroTitle || blog.title}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/86 sm:text-base">
            {blog.heroSummary || blog.excerpt}
          </p>
        </div>

        <motion.div
          className="relative min-h-[245px] overflow-hidden rounded-[30px] border border-white/28 bg-white/12 shadow-[0_34px_80px_rgba(96,30,16,0.34)] backdrop-blur-sm sm:min-h-[310px] lg:min-h-[350px]"
          animate={
            reduceMotion
              ? undefined
              : {
                y: [0, -7, 0],
                rotate: [0, -0.25, 0.25, 0],
              }
          }
          transition={{
            duration: 8.5,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        >
          <motion.div
            className="absolute -inset-10 rounded-[3rem] bg-white/16 blur-3xl"
            animate={
              reduceMotion
                ? undefined
                : {
                  opacity: [0.12, 0.3, 0.12],
                  scale: [1, 1.1, 1],
                }
            }
            transition={{
              duration: 6.5,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />
          <motion.img
            src={featuredImage}
            alt={blog.title}
            className="absolute inset-0 h-full w-full object-cover object-center saturate-[1.08] contrast-[1.04] will-change-transform"
            animate={
              reduceMotion
                ? undefined
                : {
                  scale: [1.02, 1.1, 1.04],
                  x: [0, -10, 5, 0],
                  y: [0, -5, 3, 0],
                }
            }
            transition={{
              duration: 13,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4f1b10]/58 via-transparent to-white/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#ef5e34]/24 via-transparent to-transparent" />
          <div className="absolute inset-4 rounded-[24px] border border-white/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]" />
          <motion.div
            className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-white/0 via-white/28 to-white/0 mix-blend-screen"
            animate={reduceMotion ? undefined : { x: ['0%', '460%'] }}
            transition={{
              duration: 4.8,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 1.4,
            }}
          />
          <div className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#e3522c] shadow-[0_18px_45px_rgba(35,16,9,0.2)] transition-transform duration-300 group-hover:translate-x-1">
            Read More
            <ArrowUpRight size={16} />
          </div>
        </motion.div>
      </div>
    </Link>
  );
};

const StoryCard = ({ blog }) => (
  <article className="group">
    <Link
      to={`/blogs/${blog.slug}`}
      className="relative block min-h-[248px] overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
    >
      <img
        src={blog.thumbnail}
        alt={blog.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/88 to-black/10" />
      <div
        className="absolute inset-0 opacity-30"
        style={buildGridBackground('rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)')}
      />

      <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
        <div>
          <div className="inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-tight text-[#a53d22] backdrop-blur">
            Group
            buying.in
          </div>
        </div>

        <div className="max-w-[70%] rounded-[22px] bg-white/68 p-4 backdrop-blur-md">
          <h3 className="text-[1.6rem] font-semibold leading-[1.05] tracking-[-0.05em] text-[#7c2b18] sm:text-[1.9rem]">
            {blog.heroTitle || blog.cardTitle || blog.title}
          </h3>
          <p className="mt-2 inline-flex rounded-full bg-[#241f1d] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-white/85">
            {blog.cardDate || format(new Date(blog.publishedAt), 'dd MMM yyyy')}
          </p>
        </div>
      </div>
    </Link>

    <div className="px-3 pt-4 sm:px-1">
      <h4 className="text-xl font-semibold leading-[1.15] tracking-[-0.04em] text-[#111111]">
        {blog.title}
      </h4>
      <Link
        to={`/blogs/${blog.slug}`}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#ddd4cb] bg-white px-5 py-3 text-sm font-medium text-[#161514] transition-colors hover:border-[#e3522c] hover:text-[#e3522c]"
      >
        Read more
        <ArrowUpRight size={15} />
      </Link>
    </div>
  </article>
);

const CompactStoryCard = ({ blog }) => (
  <Link
    to={`/blogs/${blog.slug}`}
    className="group flex h-full flex-col rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1"
  >
    <div
      className="rounded-[22px] p-5 text-white"
      style={buildGridBackground(blog.accentFrom, blog.accentTo)}
    >
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/75">{blog.eyebrow}</p>
      <h3 className="mt-3 text-2xl font-semibold leading-[1.02] tracking-[-0.05em]">
        {blog.cardTitle || blog.title}
      </h3>
    </div>
    <p className="mt-5 text-sm leading-6 text-[#5b5652]">{blog.excerpt}</p>
    <div className="mt-5 flex items-center justify-between text-sm text-[#5f5854]">
      <span>{format(new Date(blog.publishedAt), 'dd MMM yyyy')}</span>
      <span className="inline-flex items-center gap-2 font-medium text-[#e3522c]">
        View story
        <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </div>
  </Link>
);

const Blogs = () => {
  const [blogs, setBlogs] = useState(getFallbackBlogs());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchBlogs = async () => {
      try {
        const response = await api.get('/blogs?limit=100');
        if (!isMounted) return;

        if (response.data?.success && Array.isArray(response.data.blogs)) {
          setBlogs(mergeBlogs(response.data.blogs));
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredBlog =
    blogs.find((blog) => blog.slug === FEATURED_SLUG) || blogs[0] || null;
  const highlightedBlogs = blogs
    .filter((blog) => blog.slug !== featuredBlog?.slug)
    .slice(0, 2);
  const moreStories = blogs
    .filter(
      (blog) =>
        blog.slug !== featuredBlog?.slug &&
        !highlightedBlogs.some((story) => story.slug === blog.slug)
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#fbf7f2] pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="mx-auto max-w-7xl home-page-gutter">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[16px] font-medium tracking-[0.38em] text-[#857d77]">
            Blogs
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.07em] text-[#101010] sm:text-5xl lg:text-[4.4rem]">
            Real Estate Success stories :
            <br />
            Transforming spaces
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-[#6d6762] sm:text-lg">
            Explore real-world buyer wins, smarter negotiations, and the stories
            behind better property decisions.
          </p>
        </div>

        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead8cf] bg-white px-4 py-2 text-sm text-[#6b625b] shadow-sm">
              <Loader2 size={16} className="animate-spin text-[#e3522c]" />
              Syncing live blog stories
            </div>
          </div>
        )}

        {featuredBlog && (
          <section className="mt-12 grid gap-6 xl:grid-cols-[132px_minmax(0,1fr)] xl:gap-8">
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {blogPageStats.map((stat) => (
                <StatCard key={stat.label} stat={stat} />
              ))}
            </div>

            <FeaturedStory blog={featuredBlog} />
          </section>
        )}

        {highlightedBlogs.length > 0 && (
          <section className="mt-8 grid gap-8 lg:grid-cols-2">
            {highlightedBlogs.map((blog) => (
              <StoryCard key={blog.slug} blog={blog} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default Blogs;
