import React from 'react';
import PropertyCarousel from '../components/PropertyCarousel';

const ProminshesAndPlots = ({ standalone = false }) => {
  const sectionGutter = 'px-6 sm:px-8 lg:px-12 xl:px-20';

  return (
    <div className={`bg-[#f5f5f5] pb-16 flex flex-col gap-6 justify-evenly ${standalone ? 'min-h-screen pt-28' : ''}`}>
      <div className={`${sectionGutter} py-6 md:py-8`}>
        <h3 className="text-3xl font-bold text-slate-950 sm:text-4xl lg:text-5xl">Prominsing Plots & villas</h3>
        <p className="mt-2 whitespace-nowrap text-sm tracking-wide text-[#df472b] sm:text-base">
          Premium premises and plotted opportunities curated for smarter group buying.
        </p>
      </div>

      <PropertyCarousel
        displaySection="PROMINSHES_AND_PLOTS"
        containerClassName={sectionGutter}
      />
    </div>
  );
};

export default ProminshesAndPlots;
