import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Star } from 'lucide-react';
import api from '../api/axios';
import {
  getFallbackTestimonials,
  getLiveOrFallbackTestimonials,
  getTestimonialsSummary,
} from '../data/testimonials';

const GoogleMark = () => (
  <div className="relative h-8 w-8">
    <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.195 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.113 0 9.79-1.957 13.334-5.147l-6.154-5.208C29.123 35.091 26.715 36 24 36c-5.174 0-9.621-3.317-11.283-7.946l-6.52 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.793 2.227-2.231 4.166-4.123 5.645.001-.001 6.154 5.208 6.154 5.208C36.898 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  </div>
);

const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = review.content.length > 150;
  const displayText =
    expanded || !shouldTruncate
      ? review.content
      : `${review.content.slice(0, 150).trim()}...`;

  return (
    <article className="flex h-full flex-col rounded-[28px] border border-[#e9e1d8] bg-white shadow-sm p-4">
      <GoogleMark />

      <div className="mt-5 flex items-center gap-1 text-[#ff9d00]">
        {Array.from({ length: Math.max(1, review.rating) }).map((_, index) => (
          <Star key={index} size={16} fill="currentColor" strokeWidth={0} />
        ))}
      </div>

      <p className="mt-6 text-[1.05rem] leading-9 tracking-[-0.03em] text-[#181716] sm:text-[1.15rem]">
        {displayText}
      </p>

      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 w-fit text-sm font-medium text-[#2f6fff] transition-colors hover:text-[#184dce]"
        >
          {expanded ? 'Show Less' : 'Read More'}
        </button>
      )}

      <div className="mt-auto flex items-center gap-3 pt-6">
        <img
          src={review.image}
          alt={review.name}
          className="h-11 w-11 rounded-full object-cover"
        />
        <div>
          <h3 className="text-sm font-medium text-[#171615]">{review.name}</h3>
          <p className="text-sm text-[#6f6761]">{review.role}</p>
        </div>
      </div>
    </article>
  );
};

const getPerView = (width) => {
  if (width >= 1200) return 3;
  if (width >= 768) return 2;
  return 1;
};

const Reviews = () => {
  const [reviews, setReviews] = useState(getFallbackTestimonials());
  const [loading, setLoading] = useState(true);
  const [isFallbackFeed, setIsFallbackFeed] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [perView, setPerView] = useState(() =>
    typeof window === 'undefined' ? 3 : getPerView(window.innerWidth)
  );
  const reviewsTrackRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        const response = await api.get('/testimonials');
        if (!isMounted) return;

        const apiTestimonials = Array.isArray(response.data?.testimonials)
          ? response.data.testimonials
          : [];

        setReviews(getLiveOrFallbackTestimonials(apiTestimonials));
        setIsFallbackFeed(apiTestimonials.length === 0);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        if (isMounted) {
          setReviews(getFallbackTestimonials());
          setIsFallbackFeed(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setPerView(getPerView(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageCount = Math.max(1, Math.ceil(reviews.length / perView));

  const { averageRating, totalReviews } = useMemo(
    () => getTestimonialsSummary(reviews),
    [reviews]
  );

  const canSlide = pageCount > 1;

  useEffect(() => {
    const track = reviewsTrackRef.current;
    if (!track) return;

    const updateScrollState = () => {
      const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
      const nextScrollLeft = track.scrollLeft;

      setCanScrollPrev(nextScrollLeft > 4);
      setCanScrollNext(nextScrollLeft < maxScrollLeft - 4);

      if (track.clientWidth > 0) {
        const nextPage = Math.round(nextScrollLeft / track.clientWidth);
        setCurrentPage(Math.min(pageCount - 1, Math.max(0, nextPage)));
      } else {
        setCurrentPage(0);
      }
    };

    updateScrollState();
    track.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      track.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [pageCount, reviews.length]);

  const scrollByPage = (direction) => {
    const track = reviewsTrackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * track.clientWidth,
      behavior: 'smooth',
    });
  };

  const goPrevious = () => {
    scrollByPage(-1);
  };

  const goNext = () => {
    scrollByPage(1);
  };

  const goToPage = (pageIndex) => {
    const track = reviewsTrackRef.current;
    if (!track) return;

    track.scrollTo({
      left: pageIndex * track.clientWidth,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 sm:pt-28 sm:pb-20">
      <div className="mx-auto max-w-7xl home-page-gutter">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[16px] font-medium tracking-[0.38em] text-[#857d77]">
            Reviews
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-[#101010] sm:text-5xl lg:text-[4.3rem]">
            What Our Customers Say
          </h1>
          <p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-[#6d6762] sm:text-lg">
            Hear from satisfied buyers who saved big with group purchasing, and
            builders who love the efficiency of TogetherBuying.
          </p>
        </div>

        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ead8cf] bg-white px-4 py-2 text-sm text-[#6b625b]">
              <Loader2 size={16} className="animate-spin text-[#e3522c]" />
              Loading reviews
            </div>
          </div>
        )}

        {!loading && isFallbackFeed && (
          <div className="mt-8 flex justify-center">
            <div className="rounded-full border border-[#f0d8cc] bg-[#fff5ef] px-4 py-2 text-sm text-[#8a5b4c]">
              Live reviews unavailable right now, so fallback customer feedback is showing.
            </div>
          </div>
        )}

        <section className="relative mt-14">
          {canSlide && (
            <>
              <button
                type="button"
                onClick={goPrevious}
                disabled={!canScrollPrev}
                className={`absolute left-0 top-1/2 z-20 hidden h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#111111] transition-all lg:flex ${
                  canScrollPrev
                    ? 'hover:bg-[#f7f1eb]'
                    : 'cursor-not-allowed opacity-45'
                }`}
                aria-label="Previous reviews"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canScrollNext}
                className={`absolute right-0 top-1/2 z-20 hidden h-14 w-14 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#111111] transition-all lg:flex`}
                aria-label="Next reviews"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          <div
            ref={reviewsTrackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex-none snap-start basis-[86%] sm:basis-[74%] md:basis-[calc((100%-1.5rem)/2)] xl:basis-[calc((100%-3rem)/3)]"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>

          {canSlide && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {Array.from({ length: pageCount }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => goToPage(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    currentPage === index
                      ? 'w-5 bg-[#8d8d8d]'
                      : 'w-2.5 bg-[#d9d9d9]'
                  }`}
                  aria-label={`Go to review page ${index + 1}`}
                />
              ))}
            </div>
          )}

          {canSlide && (
            <div className="mt-6 flex items-center justify-center gap-4 lg:hidden">
              <button
                type="button"
                onClick={goPrevious}
                disabled={!canScrollPrev}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#111111] shadow-[0_16px_35px_rgba(15,23,42,0.12)] ${
                  canScrollPrev ? '' : 'cursor-not-allowed opacity-45'
                }`}
                aria-label="Previous reviews"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canScrollNext}
                className={`inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#111111] shadow-[0_16px_35px_rgba(15,23,42,0.12)] ${
                  canScrollNext ? '' : 'cursor-not-allowed opacity-45'
                }`}
                aria-label="Next reviews"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </section>

        <section className="mt-16 flex flex-col items-center justify-center text-center">
          <GoogleMark />
          <div className="mt-4 flex items-center gap-1 text-[#ff9d00]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={18} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <p className="mt-3 text-base font-medium text-[#5d5752]">
            {averageRating} stars, {totalReviews}+ reviews
          </p>
        </section>
      </div>
    </div>
  );
};

export default Reviews;
