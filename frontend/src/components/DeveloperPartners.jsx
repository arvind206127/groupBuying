import React from 'react';
import { motion } from 'framer-motion';

const DeveloperPartners = () => {
    // Top Indian Real Estate Developers Mock Logos (Representative)
    // Using placehold.co as it's often more reliable than via.placeholder.com
    const developers = [
        { name: "DLF", logo: "https://upload.wikimedia.org/wikipedia/commons/a/aa/DLF_logo.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" },
        { name: "M3M", logo: "https://m3mindialtd.com/wp-content/uploads/2024/11/logo.png" },
        { name: "Godrej", logo: "https://images.seeklogo.com/logo-png/6/2/godrej-logo-png_seeklogo-61759.png" },
        { name: "Oberoi", logo: "https://assets.cntraveller.in/photos/60ba178fe1b212c19a817988/master/pass/Oberoi-1366x768.jpg" },
        { name: "Sobha", logo: "https://assets.upstox.com/content/assets/images/cms/202445/sobha%20logo.png" },
        { name: "Prestige", logo: "https://mir-s3-cdn-cf.behance.net/projects/404/5adcb1230770925.Y3JvcCw5NjMsNzUzLDAsMTAw.jpg" },
        { name: "Lodha", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Lodha_logo.png/500px-Lodha_logo.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail" },
        { name: "Tata", logo: "https://static.vecteezy.com/system/resources/previews/020/975/561/non_2x/tata-logo-tata-icon-transparent-free-png.png" },
        { name: "Adani", logo: "https://placehold.co/200x100/f8fafc/0f172a?text=ADANI" },
        { name: "Birla", logo: "https://www.adityabirla.com/_next/image/?url=%2F_next%2Fstatic%2Fmedia%2Faditya-birla-group-download-logo.a8a380da.webp&w=1080&q=100" },
        { name: "Emaar", logo: "https://placehold.co/200x100/f8fafc/0f172a?text=EMAAR" },
        { name: "Shapoorji", logo: "https://shapoorji.in/wp-content/uploads/2017/09/SP.png" },
        { name: "ATS", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d3/ATS-Corporation-Logo-2024.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" },
        { name: "Signature", logo: "https://placehold.co/200x100/f8fafc/0f172a?text=SIGNATURE" },
        { name: "Omaxe", logo: "https://companieslogo.com/img/orig/OMAXE.NS_BIG-7771e542.png?t=1720244493" },
        { name: "Mahindra", logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/Mahindra_Auto.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" }
    ];
    const midpoint = Math.ceil(developers.length / 2);
    const marqueeRows = [
        { items: developers.slice(0, midpoint), direction: 'developer-marquee-ltr' },
        { items: developers.slice(midpoint), direction: 'developer-marquee-rtl' },
    ];

    const LogoCard = ({ dev }) => (
        <div className="group flex h-[94px] w-[170px] shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white px-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl md:h-[104px] md:w-[190px] md:rounded-3xl">
            <img
                src={dev.logo}
                alt={dev.name}
                className="max-h-16 max-w-full object-contain transition-all duration-300 group-hover:scale-105 md:max-h-[74px]"
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                }}
            />
            <div className="hidden text-center text-sm font-black uppercase leading-tight tracking-widest text-slate-400 transition-colors group-hover:text-orange-600">
                {dev.name}
                <div className="mx-auto mt-1 h-0.5 w-4 rounded-full bg-orange-600/30" />
            </div>
        </div>
    );

    return (
        <section className="overflow-hidden bg-gray-100 py-16 md:py-24">
            <div className="mx-auto max-w-7xl home-page-gutter">
                <div className="text-center mb-10 md:mb-16">
                    <p className="text-[9px] md:text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-3 md:mb-4">Strategic Collaborations</p>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                        Our Top <span className="text-orange-600 font-black">Developer</span> Partners
                    </h2>
                </div>

                <div className="space-y-5">
                    {marqueeRows.map((row, rowIndex) => (
                        <motion.div
                            key={row.direction}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: rowIndex * 0.12 }}
                            className="developer-marquee-mask overflow-hidden"
                        >
                            <div className={`developer-marquee-track ${row.direction} flex w-max gap-4`}>
                                {[...row.items, ...row.items, ...row.items].map((dev, idx) => (
                                    <LogoCard key={`${row.direction}-${dev.name}-${idx}`} dev={dev} />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default DeveloperPartners;
