import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Loader2,
  ShieldCheck,
  Sparkles,
  User2,
} from 'lucide-react';
import api from '../api/axios';
import {
  findFallbackBlog,
  getFallbackBlogs,
  getLiveOrFallbackBlogs,
  getRelatedBlogs,
  normalizeBlog,
} from '../data/blogs';

const buildGridBackground = (from, to) => ({
  backgroundImage: [
    'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
    'linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
    `linear-gradient(135deg, ${from}, ${to})`,
  ].join(', '),
  backgroundSize: '40px 40px, 40px 40px, 100% 100%',
  backgroundPosition: '0 0, 0 0, 0 0',
});

const MetaPill = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/85 backdrop-blur">
    <Icon size={15} />
    {children}
  </span>
);

const RelatedCard = ({ blog, basePath }) => (
  <Link
    to={`${basePath}/${blog.slug}`}
    className="group flex h-full flex-col rounded-[28px] border border-black/5 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1"
  >
    <div
      className="rounded-[24px] p-5 text-white"
      style={buildGridBackground(blog.accentFrom, blog.accentTo)}
    >
      <p className="text-[11px] uppercase tracking-[0.32em] text-white/75">
        {blog.eyebrow}
      </p>
      <h3 className="mt-3 text-2xl font-semibold leading-[1.02] tracking-[-0.05em]">
        {blog.cardTitle || blog.title}
      </h3>
    </div>

    <p className="mt-5 text-sm leading-6 text-[#5b5652]">{blog.excerpt}</p>
    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#e3522c]">
      Read story
      <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
    </div>
  </Link>
);

const BlogDetails = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [blog, setBlog] = useState(findFallbackBlog(slug));
  const [relatedBlogs, setRelatedBlogs] = useState(
    getRelatedBlogs(slug, getFallbackBlogs())
  );
  const [loading, setLoading] = useState(true);
  const basePath = location.pathname.startsWith('/articles') ? '/articles' : '/blogs';
  const listingLabel = basePath === '/articles' ? 'articles' : 'blogs';

  useEffect(() => {
    let isMounted = true;

    const fetchBlog = async () => {
      setLoading(true);
      window.scrollTo(0, 0);

      const fallback = findFallbackBlog(slug);

      try {
        const [blogResponse, blogsResponse] = await Promise.allSettled([
          api.get(`/blogs/${slug}`),
          api.get('/blogs?limit=100'),
        ]);

        if (!isMounted) return;

        let resolvedBlog = fallback;
        let relatedSource = getFallbackBlogs();

        if (blogResponse.status === 'fulfilled' && blogResponse.value.data?.success) {
          resolvedBlog = normalizeBlog(blogResponse.value.data.blog, 0);
        }

        if (blogsResponse.status === 'fulfilled' && blogsResponse.value.data?.success) {
          relatedSource = getLiveOrFallbackBlogs(blogsResponse.value.data.blogs);
        }

        setBlog(resolvedBlog || null);
        setRelatedBlogs(getRelatedBlogs(slug, relatedSource));
      } catch (error) {
        console.error('Failed to fetch blog details:', error);
        if (isMounted) {
          setBlog(fallback || null);
          setRelatedBlogs(getRelatedBlogs(slug, getFallbackBlogs()));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBlog();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading && !blog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf7f2]">
        <Loader2 size={48} className="animate-spin text-[#e3522c]" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf7f2] px-4 pt-28 pb-16">
        <div className="max-w-xl rounded-[32px] bg-white p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[#111111]">
            Blog not found
          </h1>
          <p className="mt-3 text-[#635d59]">
            The story you opened is not available right now.
          </p>
          <Link
            to={basePath}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e3522c] px-5 py-3 text-sm font-medium text-white"
          >
            <ArrowLeft size={15} />
            Back to {listingLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf7f2] pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Link
          to={basePath}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6d6762] transition-colors hover:text-[#e3522c]"
        >
          <ArrowLeft size={16} />
          Back to all {listingLabel}
        </Link>

        <section
          className="relative mt-6 overflow-hidden rounded-[36px] px-6 py-7 text-white shadow-[0_30px_85px_rgba(226,95,49,0.24)] sm:px-8 sm:py-9 lg:px-10 lg:py-10"
          style={buildGridBackground(blog.accentFrom, blog.accentTo)}
        >
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_340px]">
            <div className="relative z-10">
              <p className="text-[11px] font-medium uppercase tracking-[0.38em] text-white/75">
                {blog.eyebrow || blog.category}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.96] tracking-[-0.07em] sm:text-5xl lg:text-[4.15rem]">
                {blog.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/88 sm:text-lg">
                {blog.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <MetaPill icon={CalendarDays}>
                  {format(new Date(blog.publishedAt), 'dd MMM yyyy')}
                </MetaPill>
                <MetaPill icon={Clock3}>{blog.readTime}</MetaPill>
                <MetaPill icon={User2}>{blog.author}</MetaPill>
              </div>
            </div>

            <div className="relative z-10">
              <div className="overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-3 backdrop-blur-md">
                {blog.thumbnail ? (
                  <div className="relative h-[260px] overflow-hidden rounded-[22px]">
                    <img
                      src={blog.thumbnail}
                      alt={blog.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                ) : (
                  <div className="flex h-[260px] items-center justify-center rounded-[22px] bg-white/10">
                    <Sparkles size={44} />
                  </div>
                )}

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[20px] bg-white/12 p-4">
                    <p className="text-[11px] uppercase tracking-[0.26em] text-white/62">
                      Story Focus
                    </p>
                    <p className="mt-2 text-lg font-medium">
                      {blog.tags?.[0] || blog.category}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-white/12 p-4">
                    <p className="text-[11px] uppercase tracking-[0.26em] text-white/62">
                      Buying Edge
                    </p>
                    <p className="mt-2 text-lg font-medium">
                      Better clarity, stronger price control
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <article className="rounded-[34px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>

          <aside className="space-y-6">
            <div className="rounded-[30px] bg-[#171513] p-6 text-white shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#ffb29b]">
                <ShieldCheck size={22} />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                Buy with a stronger position
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/74">
                Join a live TogetherBuying group to compare projects smarter,
                negotiate harder, and close with guided support.
              </p>
              <Link
                to="/properties"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e3522c] px-5 py-3 text-sm font-medium text-white"
              >
                Explore properties
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="rounded-[30px] border border-[#eee2d8] bg-[#fff7f1] p-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#8f847b]">
                Quick Takeaways
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#574f49]">
                <li className="rounded-[18px] bg-white px-4 py-3">
                  Better pricing happens when buyer intent is consolidated.
                </li>
                <li className="rounded-[18px] bg-white px-4 py-3">
                  Guided shortlisting removes noise before negotiation starts.
                </li>
                <li className="rounded-[18px] bg-white px-4 py-3">
                  Structured follow-through matters as much as the discount.
                </li>
              </ul>
            </div>
          </aside>
        </section>

        {relatedBlogs.length > 0 && (
          <section className="mt-14">
            <div className="mb-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#857d77]">
                Related Stories
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111111]">
                Keep reading
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedBlogs.map((relatedBlog) => (
                <RelatedCard key={relatedBlog.slug} blog={relatedBlog} basePath={basePath} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default BlogDetails;
