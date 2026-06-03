import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import Card from './Card';

const PropertyCarousel = ({
  category,
  status,
  displaySection,
  containerClassName = 'home-page-gutter',
}) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const query = new URLSearchParams();
        if (category) query.append('category', category);
        if (status) query.append('status', status);
        if (displaySection) query.append('displaySection', displaySection);
        query.append('limit', '12');

        const res = await api.get(`/properties?${query.toString()}`);
        setProperties(res.data.properties || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, status, displaySection]);

  if (loading || properties.length === 0) return null;

  const slideCards = (direction) => {
    sliderRef.current?.scrollBy({
      left: direction * 460,
      behavior: 'smooth',
    });
  };

  return (
    <section className="bg-[#f5f5f5] py-10 md:py-3">
      <div className={`relative mx-auto max-w-[1560px] ${containerClassName}`}>
        {properties.length > 3 && (
          <>
            <button
              type="button"
              onClick={() => slideCards(-1)}
              className="absolute left-2 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-[#df472b] text-white shadow-[0_12px_28px_rgba(223,71,43,0.35)] transition-all hover:scale-105 hover:bg-[#c93f26] md:flex"
              aria-label="Previous properties"
            >
              <ChevronLeft size={26} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={() => slideCards(1)}
              className="absolute right-2 top-1/2 z-20 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.24)] ring-1 ring-slate-100 transition-all hover:scale-105 hover:text-[#df472b] md:flex"
              aria-label="Next properties"
            >
              <ChevronRight size={26} strokeWidth={2.5} />
            </button>
          </>
        )}

        <div
          ref={sliderRef}
          className="flex justify-evenly snap-x snap-mandatory gap-5 overflow-x-auto pb-4 no-scrollbar"
        >
          {properties.map((item, i) => (
            <div key={item.id} className="w-[92vw] max-w-[440px] shrink-0 snap-start sm:w-[440px]">
              <Card property={item} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyCarousel;
