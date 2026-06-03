import React, { useEffect } from 'react';

const DEVELOPERS = [
  {
    name: 'Godrej Properties',
    logo: 'https://images.seeklogo.com/logo-png/6/2/godrej-logo-png_seeklogo-61759.png',
  },
  {
    name: 'Smartworld',
    logo: 'https://www.smartworlddevelopers.com/images/logo.svg',
  },
  {
    name: 'Sobha',
    logo: 'https://assets.upstox.com/content/assets/images/cms/202445/sobha%20logo.png',
  },
  {
    name: 'Shapoorji Pallonji',
    logo: 'https://shapoorji.in/wp-content/uploads/2017/09/SP.png',
  },
  {
    name: 'M3M',
    logo: 'https://m3mindialtd.com/wp-content/uploads/2024/11/logo.png',
  },
  {
    name: 'Emaar',
    logo: 'https://placehold.co/240x90/ffffff/111111?text=EMAAR',
  },
  {
    name: 'DLF',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/DLF_logo.svg',
  },
  {
    name: 'Anant Raj Estate',
    logo: 'https://placehold.co/240x90/ffffff/8d6b2b?text=ANANT+RAJ+ESTATE',
  },
  {
    name: 'Tata Housing',
    logo: 'https://static.vecteezy.com/system/resources/previews/020/975/561/non_2x/tata-logo-tata-icon-transparent-free-png.png',
  },
  {
    name: 'Signature Global',
    logo: 'https://placehold.co/240x90/ffffff/3a8d2f?text=SIGNATURE+GLOBAL',
  },
  {
    name: 'Dalcore',
    logo: 'https://placehold.co/220x90/ffffff/a26b2a?text=Dalcore',
  },
  {
    name: 'Krisumi',
    logo: 'https://placehold.co/220x90/ffffff/111111?text=KRISUMI',
  },
];

const DeveloperGrid = ({ items }) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {items.map((item) => (
      <article
        key={item.name}
        className="flex min-h-[92px] items-center justify-center rounded-[20px] border border-[#eee5dc] bg-[#fffdf9] px-4 py-3 shadow-[0_12px_30px_rgba(43,33,24,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#f1b29d] hover:shadow-[0_18px_40px_rgba(43,33,24,0.075)]"
      >
        <div className="flex w-full flex-col items-center justify-center gap-2.5">
          <img
            src={item.logo}
            alt={item.name}
            className="max-h-[50px] max-w-[190px] object-contain opacity-95 grayscale-[0.04]"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <p className="text-center text-[15px] font-semibold leading-tight tracking-[-0.02em] text-[#161616]">
            {item.name}
          </p>
        </div>
      </article>
    ))}
  </div>
);

const TrustUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white pt-16 xl:pb-16">
      <section className="px-4 pb-8 sm:px-6 md:pb-14">
        <div className="mx-auto max-w-[1880px]">
          <div className="rounded-[28px] bg-white px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:pb-2">
            <div className="mx-auto max-w-[760px] text-center">
              <h1 className="text-[34px] font-semibold leading-[1.04] tracking-[-0.03em] text-[#101010] sm:text-[46px] lg:text-[56px]">
                Top Developers <span className="text-[#e1532e]">Trust Us</span>
              </h1>
            </div>

            <div className="mx-auto mt-8 max-w-[1240px] lg:mt-10">
              <DeveloperGrid items={DEVELOPERS} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TrustUs;
