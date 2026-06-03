import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Loader2, Search as SearchIcon, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';

const MAX_VISIBLE_ITEMS = 5;

const buildSearchFilters = (searchString) => {
  const params = new URLSearchParams(searchString);

  return {
    search: params.get('search') || '',
    city: params.get('city') || '',
    locality: params.get('locality') || '',
    bhk: params.get('bhk') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
    category: params.get('category') || '',
  };
};

const countBy = (items) =>
  items.reduce((map, item) => {
    map.set(item, (map.get(item) || 0) + 1);
    return map;
  }, new Map());

const SearchSuggestionColumn = ({ title, items }) => {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = expanded ? items : items.slice(0, MAX_VISIBLE_ITEMS);
  const remainingCount = Math.max(0, items.length - MAX_VISIBLE_ITEMS);

  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="max-w-[220px] text-[18px] font-semibold leading-[1.1] tracking-[-0.04em] text-[#171717] sm:text-[16px]">
        {title}
      </h2>

      <div className="mt-4 space-y-3.5">
        {visibleItems.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={`block text-[14px] leading-6 tracking-[-0.02em] transition-colors hover:text-[#df472b] sm:text-[15px] ${
              item.highlight ? 'text-[#df472b]' : 'text-[#1c3f7c]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {remainingCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-4 text-[13px] font-medium tracking-[-0.02em] text-[#1c3f7c] transition-colors hover:text-[#df472b] sm:text-[14px]"
        >
          {expanded ? 'Show Less' : `View ${remainingCount} More`}
        </button>
      )}
    </div>
  );
};

const SearchPage = () => {
  const location = useLocation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => buildSearchFilters(location.search));

  useEffect(() => {
    const nextFilters = buildSearchFilters(location.search);
    setFilters(nextFilters);
  }, [location.search]);

  useEffect(() => {
    let isMounted = true;

    const fetchMatches = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.city) params.append('city', filters.city);
        if (filters.locality) params.append('locality', filters.locality);
        if (filters.bhk) params.append('bhk', filters.bhk);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
        if (filters.category) params.append('category', filters.category);
        params.append('limit', '60');

        const response = await api.get(`/properties?${params.toString()}`);
        if (!isMounted) return;

        if (response.data?.success) {
          setProperties(response.data.properties || []);
        } else {
          setProperties([]);
        }
      } catch (error) {
        console.error('Failed to fetch search suggestions:', error);
        if (isMounted) {
          setProperties([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const primaryCity = useMemo(() => {
    if (filters.city) return filters.city;
    if (properties.length === 0) return 'Greater Noida';

    const cityCounts = countBy(
      properties.map((property) => property.city).filter(Boolean)
    );

    return (
      [...cityCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'Greater Noida'
    );
  }, [filters.city, properties]);

  const buildPropertiesHref = (patch = {}) => {
    const params = new URLSearchParams();
    const nextFilters = {
      city: patch.city ?? '',
      locality: patch.locality ?? '',
      developerName: patch.developerName ?? '',
      bhk: patch.bhk ?? '',
      minPrice: patch.minPrice ?? '',
      maxPrice: patch.maxPrice ?? '',
      search: patch.search ?? '',
      category: patch.category ?? filters.category,
      sortBy: 'newest',
    };

    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    return `/properties?${params.toString()}`;
  };

  const suggestionSections = (() => {
    const cityCounts = countBy(
      properties.map((property) => property.city).filter(Boolean)
    );
    const bhkCounts = countBy(
      properties.map((property) => property.bhk).filter(Boolean).map(String)
    );
    const developerCounts = countBy(
      properties
        .map((property) => property.developer?.name)
        .filter(Boolean)
    );
    const localityCounts = countBy(
      properties.map((property) => property.locality).filter(Boolean)
    );

    const cityItems = [...cityCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([city]) => ({
        label: `New Projects in ${city}`,
        href: buildPropertiesHref({ city }),
      }));

    const configurationItems = [...bhkCounts.entries()]
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([bhk]) => ({
        label: `${bhk} BHK apartments in ${primaryCity}`,
        href: buildPropertiesHref({ city: primaryCity, bhk }),
      }));

    const developerItems = [...developerCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([developerName], index) => ({
        label: `${developerName} Projects in ${primaryCity}`,
        href: buildPropertiesHref({
          city: primaryCity,
          developerName,
          search: '',
        }),
        highlight: index === 0,
      }));

    const localityItems = [...localityCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([locality]) => ({
        label: `Apartments in ${locality}`,
        href: buildPropertiesHref({
          city: primaryCity,
          locality,
          search: '',
        }),
      }));

    const budgetBuckets = [
      {
        key: 'under-2cr',
        label: `Flats Under 2 Cr in ${primaryCity}`,
        minPrice: '0',
        maxPrice: '20000000',
        matches: properties.filter((property) => Number(property.price) < 20000000),
      },
      {
        key: '2-4cr',
        label: `Flats in 2-4 Cr in ${primaryCity}`,
        minPrice: '20000000',
        maxPrice: '40000000',
        matches: properties.filter((property) => {
          const price = Number(property.price);
          return price >= 20000000 && price <= 40000000;
        }),
      },
      {
        key: '4cr-plus',
        label: `Flats above 4 Cr in ${primaryCity}`,
        minPrice: '40000000',
        maxPrice: '',
        matches: properties.filter((property) => Number(property.price) > 40000000),
      },
    ];

    const budgetItems = budgetBuckets
      .filter((bucket) => bucket.matches.length > 0)
      .map((bucket) => ({
        label: bucket.label,
        href: buildPropertiesHref({
          city: primaryCity,
          minPrice: bucket.minPrice,
          maxPrice: bucket.maxPrice,
          search: '',
        }),
      }));

    const directPropertyItems = properties.slice(0, 6).map((property) => ({
      label: property.title,
      href: buildPropertiesHref({
        city: property.city,
        search: property.title,
      }),
    }));

    return [
      { title: 'New Projects by Cities', items: cityItems },
      {
        title: `Apartments by Configuration in ${primaryCity}`,
        items: configurationItems,
      },
      {
        title: `Top Developers Projects in ${primaryCity}`,
        items: developerItems,
      },
      {
        title: `Popular Localities in ${primaryCity}`,
        items: localityItems,
      },
      {
        title: `Budget Wise Properties in ${primaryCity}`,
        items: budgetItems,
      },
      {
        title: `Projects Matching ${filters.search ? `"${filters.search}"` : 'Your Search'}`,
        items: directPropertyItems,
      },
    ].filter((section) => section.items.length > 0);
  })();

  const matchingPropertiesHref = buildPropertiesHref({
    city: filters.city,
    locality: filters.locality,
    bhk: filters.bhk,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    search: filters.search,
  });

  return (
    <div className=" pb-16 pt-24 sm:pb-24 sm:pt-28 xl:pt-8 xl:pb-[2px]">
      <div className="mx-auto max-w-[1540px] home-page-gutter">
        <div className="rounded-[32px] border border-[#ece4dc] bg-[linear-gradient(180deg,#ffffff_0%,#fcf8f5_100%)] px-6 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:px-8 sm:py-10 lg:px-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff2eb] px-3 py-2 text-[12px] font-bold tracking-[0.14em] text-[#df472b]">
                <Sparkles size={12} />
                Search Intelligence
              </div>
              <h1 className="mt-5 text-[28px] font-semibold leading-[0.98] tracking-[-0.05em] text-[#102f63] sm:text-[34px] lg:text-[40px]">
                Related to your search
              </h1>
              <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#66605a] sm:text-[16px]">
                {filters.search
                  ? `Showing smart suggestions for "${filters.search}" so you can jump straight to the most relevant properties.`
                  : `Browse curated suggestions from your current property filters and jump directly to matching listings.`}
              </p>
            </div>

            <Link
              to={matchingPropertiesHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#df472b] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[#ca4228] sm:w-fit sm:text-[14px]"
            >
              View Matching Properties
              <ArrowUpRight size={15} />
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[12px] text-[#5a5550] sm:text-[8px]">
            {filters.city ? (
              <span className="rounded-full bg-[#f6f0ea] px-3 py-1.5">
                City: {filters.city}
              </span>
            ) : null}
            {filters.bhk ? (
              <span className="rounded-full bg-[#f6f0ea] px-3 py-1.5">
                {filters.bhk} BHK
              </span>
            ) : null}
            {filters.locality ? (
              <span className="rounded-full bg-[#f6f0ea] px-3 py-1.5">
                Locality: {filters.locality}
              </span>
            ) : null}
            {filters.search ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f6f0ea] px-3 py-1.5">
                <SearchIcon size={14} className="text-[#df472b]" />
                {filters.search}
              </span>
            ) : null}
          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#ece4dc] bg-white px-5 py-3 text-[13px] font-medium text-[#5f5a55] shadow-sm sm:text-[14px]">
                <Loader2 size={16} className="animate-spin text-[#df472b]" />
                Finding related property suggestions
              </div>
            </div>
          ) : suggestionSections.length > 0 ? (
            <div className="mt-12 grid gap-10 md:grid-cols-2 xl:grid-cols-5">
              {suggestionSections.slice(0, 5).map((section) => (
                <SearchSuggestionColumn
                  key={`${section.title}-${section.items.length}`}
                  title={section.title}
                  items={section.items}
                />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[28px] border border-[#efe4dc] bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2eb] text-[#df472b]">
                <SearchIcon size={28} />
              </div>
              <h2 className="mt-5 text-[26px] font-semibold tracking-[-0.05em] text-[#171717] sm:text-[30px]">
                No related suggestions found
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-7 text-[#6d6762] sm:text-[15px]">
                Try a different keyword, city, or budget range. You can also open
                the properties page directly and browse all available listings.
              </p>
              <Link
                to="/properties"
                className="mt-7 inline-flex items-center justify-center rounded-full bg-[#df472b] px-6 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#ca4228] sm:text-[14px]"
              >
                Browse All Properties
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
