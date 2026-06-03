import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight, ArrowUpRight, Loader2 } from 'lucide-react';
import api from '../api/axios';
import {
  getArticleCategories,
  getFallbackBlogs,
  mergeBlogs,
} from '../data/blogs';

const buildGridBackground = (from, to) => ({
  backgroundImage: [
    'linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)',
    `linear-gradient(135deg, ${from}, ${to})`,
  ].join(', '),
  backgroundSize: '40px 40px, 40px 40px, 100% 100%',
  backgroundPosition: '0 0, 0 0, 0 0',
});

const matchesCategory = (article, selectedCategory) => {
  if (selectedCategory === 'All Articles') return true;

  if (article.category === selectedCategory) return true;

  return (article.tags || []).some(
    (tag) => tag.toLowerCase() === selectedCategory.toLowerCase()
  );
};

const CategoryPill = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-5 py-3 text-sm font-medium transition-all sm:px-6 sm:text-base ${active
      ? 'bg-[#e3522c] text-white shadow-[0_16px_35px_rgba(227,82,44,0.25)]'
      : 'bg-[#f8d7cd] text-[#d84d28] hover:bg-[#f3cabd]'
      }`}
  >
    {label}
  </button>
);

const FeaturedArticleCard = ({ article, basePath }) => (
  <article className="group">
    <Link to={`${basePath}/${article.slug}`} className="block">
      <div className="relative min-h-[270px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
        {article.thumbnail ? (
          <img
            src={article.thumbnail}
            alt={article.title}
            className="absolute inset-y-0 right-0 h-full w-full object-cover sm:w-[58%]"
          />
        ) : (
          <div className="absolute inset-0 bg-[#f7ece7]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent sm:hidden" />

        <div
          className="absolute inset-y-0 left-0 w-full sm:w-[52%]"
          style={buildGridBackground(article.accentFrom, article.accentTo)}
        />
        <div className="absolute inset-y-0 left-[47%] hidden w-16 rounded-r-full bg-white/75 blur-[1px] sm:block" />

        <div className="relative z-10 flex min-h-[270px] max-w-full flex-col justify-between p-5 text-white sm:max-w-[53%] sm:p-6">
          <div>
            <p className="text-[11px] font-semibold leading-none tracking-tight text-white sm:text-[0.95rem]">
              Together
            </p>
            <p className="text-[11px] font-semibold leading-none tracking-tight text-white sm:text-[0.95rem]">
              buying.in
            </p>
          </div>

          <div>
            <h2 className="max-w-[92%] text-[2rem] font-medium leading-[0.95] tracking-[-0.06em] sm:text-[2.55rem]">
              {article.heroTitle || article.title}
            </h2>
            <p className="mt-4 inline-flex rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-white/88">
              {format(new Date(article.publishedAt), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
      </div>
    </Link>

    <div className="pt-4">
      <h3 className="text-[2rem] font-medium leading-[1.02] tracking-[-0.055em] text-[#111111] sm:text-[2.2rem]">
        {article.title}
      </h3>
      <Link
        to={`${basePath}/${article.slug}`}
        className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#ddd4cb] bg-white px-5 py-3 text-sm font-medium text-[#161514] transition-colors hover:border-[#e3522c] hover:text-[#e3522c]"
      >
        Read more
        <ArrowUpRight size={15} />
      </Link>
    </div>
  </article>
);

const ArticleListCard = ({ article, basePath }) => (
  <Link
    to={`${basePath}/${article.slug}`}
    className="group flex h-full flex-col rounded-[28px] bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1"
  >
    <div className="relative overflow-hidden rounded-[22px]">
      {article.thumbnail ? (
        <img
          src={article.thumbnail}
          alt={article.title}
          className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div
          className="h-56 w-full"
          style={buildGridBackground(article.accentFrom, article.accentTo)}
        />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 text-white">
        <p className="text-xs uppercase tracking-[0.28em] text-white/70">
          {article.category}
        </p>
      </div>
    </div>

    <div className="mt-5 flex flex-1 flex-col">
      <p className="text-sm text-[#7a716a]">
        {format(new Date(article.publishedAt), 'dd MMM yyyy')}
      </p>
      <h3 className="mt-3 text-[1.6rem] font-medium leading-[1.05] tracking-[-0.05em] text-[#111111]">
        {article.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[#5d5752]">{article.excerpt}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#e3522c]">
        Open article
        <ArrowRight
          size={15}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </span>
    </div>
  </Link>
);

const getCardsPerPage = () => {
  if (typeof window === 'undefined') return 1;
  if (window.innerWidth >= 1280) return 3;
  if (window.innerWidth >= 768) return 2;
  return 1;
};

const Articles = () => {
  const location = useLocation();
  const [articles, setArticles] = useState(getFallbackBlogs());
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [isFallbackFeed, setIsFallbackFeed] = useState(true);
  const [cardsPerPage, setCardsPerPage] = useState(getCardsPerPage);
  const [currentPage, setCurrentPage] = useState(0);
  const basePath = location.pathname.startsWith('/blogs') ? '/blogs' : '/articles';

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      try {
        const response = await api.get('/blogs?limit=100');
        if (!isMounted) return;

        const apiBlogs = Array.isArray(response.data?.blogs) ? response.data.blogs : [];
        setArticles(mergeBlogs(apiBlogs));
        setIsFallbackFeed(apiBlogs.length === 0);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
        if (isMounted) {
          setArticles(getFallbackBlogs());
          setIsFallbackFeed(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setCardsPerPage(getCardsPerPage());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const categories = useMemo(() => getArticleCategories(articles), [articles]);

  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory('All Articles');
    }
  }, [categories, selectedCategory]);

  const filteredArticles = useMemo(
    () => articles.filter((article) => matchesCategory(article, selectedCategory)),
    [articles, selectedCategory]
  );

  const featuredArticles = filteredArticles.slice(0, 2);
  const moreArticles = filteredArticles.slice(2);
  const pageCount = Math.max(1, Math.ceil(moreArticles.length / cardsPerPage));
  const pagedMoreArticles = moreArticles.slice(
    currentPage * cardsPerPage,
    currentPage * cardsPerPage + cardsPerPage
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, cardsPerPage]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(pageCount - 1, 0)));
  }, [pageCount]);

  return (
    <div className="min-h-screen bg-[#fbf7f2] pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="mx-auto max-w-7xl home-page-gutter">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[16px] font-medium tracking-[0.38em] text-[#857d77]">
            Articles
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.07em] text-[#101010] sm:text-5xl lg:text-[4.5rem]">
            Unlocking Real Estate
          </h1>
          <p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-[#6d6762] sm:text-lg">
            Your key to understanding market shifts, property laws, investment
            tips, and smarter buying decisions.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {categories.map((category) => (
            <CategoryPill
              key={category}
              label={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            />
          ))}
        </div>

        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead8cf] bg-white px-4 py-2 text-sm text-[#6b625b] shadow-sm">
              <Loader2 size={16} className="animate-spin text-[#e3522c]" />
              Loading articles
            </div>
          </div>
        )}

        {!loading && isFallbackFeed && (
          <div className="mt-8 flex justify-center">
            <div className="rounded-full border border-[#f0d8cc] bg-[#fff5ef] px-4 py-2 text-sm text-[#8a5b4c]">
              Live article feed unavailable right now, so fallback articles are showing.
            </div>
          </div>
        )}

        {featuredArticles.length > 0 ? (
          <section className="mt-12 grid gap-8 lg:grid-cols-2">
            {featuredArticles.map((article) => (
              <FeaturedArticleCard key={article.slug} article={article} basePath={basePath} />
            ))}
          </section>
        ) : (
          !loading && (
            <div className="mt-12 rounded-[30px] bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-2xl font-medium tracking-[-0.04em] text-[#111111]">
                No articles found for this category
              </h2>
              <p className="mt-3 text-[#655d58]">
                Try another category to explore more article content.
              </p>
            </div>
          )
        )}
        
      </div>
    </div>
  );
};

export default Articles;
