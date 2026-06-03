import React from 'react'

import PropertyCarousel from '../components/PropertyCarousel';

const FastSellingProparties = () => {
    const fastSellingGutter = 'px-6 sm:px-8 lg:px-12 xl:px-20';
    const fastSellingShell = 'mx-auto max-w-[1560px]';

    return (<div className="bg-[#f5f5f5] pb-16 flex flex-col gap-6 justify-evenly">
        <div className={` ${fastSellingGutter} py-6 md:py-8`}>
            <h3 className="text-3xl font-bold text-slate-950 sm:text-4xl lg:text-5xl">Fast Selling Properties</h3>
            <p className="mt-2 whitespace-nowrap text-sm tracking-wide text-[#df472b] sm:text-base ">
                High-demand properties with quick turnaround, ideal for group buying success.
            </p>
        </div>

        <PropertyCarousel
            displaySection="FAST_SELLING"
            containerClassName={fastSellingGutter}
        />
    </div>
    )
}

export default FastSellingProparties
