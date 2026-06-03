import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { getFallbackTestimonials, getLiveOrFallbackTestimonials } from '../data/testimonials';

const TestimonialCard = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="flex h-full flex-col rounded-[24px] border border-slate-100 bg-white p-5 transition-all duration-300 hover:border-orange-200"
  >
    <div className="mb-4 flex items-center gap-3">
      <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-100">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-900">{testimonial.name}</h4>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-orange-500">
          {testimonial.role}
        </p>
      </div>
    </div>

    <div className="mb-4 flex items-center gap-1 text-[#ff9d00]">
      {Array.from({ length: Math.max(1, Number(testimonial.rating) || 5) }).map(
        (_, starIndex) => (
          <Star key={starIndex} size={14} fill="currentColor" strokeWidth={0} />
        )
      )}
    </div>

    <p className="text-sm leading-7 text-slate-600">
      "{testimonial.content.slice(0, 120)}
      {testimonial.content.length > 120 ? '...' : ''}"
    </p>
  </motion.div>
);

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(getFallbackTestimonials().slice(0, 3));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchTestimonials = async () => {
      try {
        const response = await api.get('/testimonials');
        if (!isMounted) return;

        const liveTestimonials = getLiveOrFallbackTestimonials(response.data?.testimonials);
        setTestimonials(liveTestimonials.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        if (isMounted) {
          setTestimonials(getFallbackTestimonials().slice(0, 3));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTestimonials();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="border-t border-slate-50 bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl home-page-gutter">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="text-center md:text-left">
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.3em] text-orange-600">
              Reviews
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900 md:text-4xl">
              What customers are saying
            </h2>
          </div>

          <Link
            to="/reviews"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-900 transition-colors hover:border-orange-300 hover:text-orange-600"
          >
            View all reviews
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={28} className="animate-spin text-orange-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
