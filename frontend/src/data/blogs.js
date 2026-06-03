const stripHtml = (value = '') =>
  value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const createReadTime = (value = '') => {
  const words = stripHtml(value).split(' ').filter(Boolean).length;
  const minutes = Math.max(4, Math.ceil(words / 180));
  return `${minutes} min read`;
};

const storyThemes = [
  {
    eyebrow: 'Feature Story',
    accentFrom: '#f1683d',
    accentTo: '#df4b25',
    softTint: '#ffe4db',
    darkTint: '#8f2b14',
  },
  {
    eyebrow: 'Buyer Story',
    accentFrom: '#ef7d3b',
    accentTo: '#e15a2d',
    softTint: '#ffe9dd',
    darkTint: '#93401c',
  },
  {
    eyebrow: 'Field Notes',
    accentFrom: '#f47d4e',
    accentTo: '#df5630',
    softTint: '#ffeadf',
    darkTint: '#8d3418',
  },
  {
    eyebrow: 'Market Insight',
    accentFrom: '#ec6f48',
    accentTo: '#d94e2a',
    softTint: '#ffe1d4',
    darkTint: '#7f3019',
  },
];

const preferredCategoryOrder = [
  'All Articles',
  'Investments',
  'Market Trends',
  'Group Buying',
  'Project Details',
  'Buyer Stories',
  'Vastu Shastra',
  'Numerology',
];

export const blogPageStats = [
  {
    value: '25 Lakhs',
    label: 'Saved Each Family',
    icon: 'banknote',
  },
  {
    value: '20%',
    label: 'Average Discount',
    icon: 'badge-percent',
  },
  {
    value: '150+',
    label: 'Party Benefited',
    icon: 'users',
  },
];

export const fallbackBlogs = [
  {
    id: 'fallback-group-buying-revolution',
    slug: 'group-buying-revolution',
    title: 'The Group Buying Revolution.',
    excerpt:
      'A closer look at how coordinated buyers unlock stronger discounts, faster decision-making, and more confident purchases in premium projects.',
    content: `
      <p>Group buying changes the power balance in real estate. Instead of one buyer negotiating alone, multiple serious families approach a developer together with clear intent and a stronger combined booking potential.</p>
      <p>That shift creates leverage. Pricing conversations become sharper, inventory access improves, and buyers get a dedicated team that helps them compare layouts, clarify legal points, and close with more confidence.</p>
      <h2>Why the model is working</h2>
      <p>Developers value certainty and speed. When a verified group shows up with aligned timelines, the project team is far more willing to offer meaningful commercial advantages.</p>
      <ul>
        <li>Higher buying power improves discount negotiations.</li>
        <li>Buyers compare details together and catch issues earlier.</li>
        <li>Site visits, follow-ups, and paperwork become more structured.</li>
      </ul>
      <h2>What buyers actually gain</h2>
      <p>The most obvious gain is pricing, but that is not the whole story. Buyers also save time, reduce confusion, and avoid the pressure of handling every discussion alone.</p>
      <blockquote>When families move as a group, even premium inventory becomes easier to negotiate.</blockquote>
      <p>TogetherBuying uses this collective intent to create better outcomes from the very first shortlist to the final registration stage.</p>
    `,
    author: 'TogetherBuying Editorial',
    category: 'Feature Story',
    publishedAt: '2026-03-28T00:00:00.000Z',
    readTime: '6 min read',
    thumbnail:
      'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    heroTitle: 'The Group Buying Revolution.',
    heroSummary:
      'Smart buyers are no longer negotiating in isolation. The biggest wins now come from moving together, faster, and with intent.',
    cardTitle: 'The Group Buying Revolution.',
    cardDate: '28 Mar 2026',
    tags: ['Group Buying', 'Strategy', 'Savings'],
  },
  {
    id: 'fallback-arun-raghav',
    slug: 'how-arun-raghav-saved-42-lakhs-on-his-dream-home',
    title: 'How Arun Raghav Saved Rs.42 Lakhs on His Dream Home?',
    excerpt:
      'Arun entered the process with a shortlist and a budget ceiling. The group model helped him secure a premium apartment with a much stronger final deal.',
    content: `
      <p>Arun Raghav wanted a home in a well-connected premium cluster, but the initial quotes were stretching the budget beyond comfort. Instead of rushing into an isolated negotiation, he joined a project-specific buyer group.</p>
      <h2>What changed after joining the group</h2>
      <p>The dedicated RM coordinated visits, clarified inventory availability, and aligned multiple interested buyers around the same tower and configuration.</p>
      <ul>
        <li>Final negotiation happened with stronger collective leverage.</li>
        <li>Hidden commercial differences across inventory were surfaced early.</li>
        <li>Arun secured a deal that saved him Rs.42 Lakhs overall.</li>
      </ul>
      <h2>Beyond savings</h2>
      <p>The biggest surprise for Arun was not just the price correction. It was the clarity. Instead of chasing multiple sales teams alone, he had one guided flow from shortlist to booking.</p>
      <p>That structure removed noise from the process and let him focus on the right questions: layout, possession outlook, and long-term value.</p>
    `,
    author: 'TogetherBuying NCR Team',
    category: 'Buyer Story',
    publishedAt: '2026-03-28T00:00:00.000Z',
    readTime: '5 min read',
    thumbnail:
      'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
    heroTitle: 'How Arun Raghav Saved Rs.42 Lakhs',
    heroSummary:
      'A guided shortlist, one focused group, and a much better final price on a dream home purchase.',
    cardTitle: 'How Arun Raghav Saved Rs.42 Lakhs on His Dream Home?',
    cardDate: '28 Mar 2026',
    tags: ['Buyer Story', 'Savings', 'Home Purchase'],
  },
  {
    id: 'fallback-rajesh-sharma',
    slug: 'how-rajesh-sharma-saved-71-lakhs-on-his-dream-home-in-gurgaon',
    title: 'How Rajesh Sharma Saved Rs.71 Lakhs On His Dream Home in Gurgaon',
    excerpt:
      'Rajesh had already visited projects independently. Once he entered a live buying group, the final conversation with the developer changed dramatically.',
    content: `
      <p>Rajesh Sharma was deep into his Gurgaon search before he discovered the group-buy route. He had visited several projects, narrowed his preferences, and still felt the commercial terms were not moving enough.</p>
      <h2>The turning point</h2>
      <p>After joining a group of active buyers targeting the same project, the negotiation moved from an individual ask to a structured collective proposal.</p>
      <ul>
        <li>The developer engaged more seriously once buyer intent was consolidated.</li>
        <li>Inventory alternatives were compared in a single guided discussion.</li>
        <li>Rajesh closed at a total savings impact of Rs.71 Lakhs.</li>
      </ul>
      <h2>What this story shows</h2>
      <p>Serious buyers often do the hard part already: research, site visits, and comparison. The missing piece is leverage. Group buying adds that leverage at the moment it matters most.</p>
      <p>For Rajesh, the result was not just a discount but a cleaner close with stronger confidence in the purchase.</p>
    `,
    author: 'TogetherBuying Gurgaon Desk',
    category: 'Buyer Story',
    publishedAt: '2025-12-10T00:00:00.000Z',
    readTime: '5 min read',
    thumbnail:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    heroTitle: 'How Rajesh Sharma Saved Rs.71 Lakhs',
    heroSummary:
      'A buyer who had done the research already, and finally got the leverage he needed to close better.',
    cardTitle: 'How Rajesh Sharma Saved Rs.71 Lakhs On His Dream Home in Gurgaon',
    cardDate: '10 Dec 2025',
    tags: ['Buyer Story', 'Gurgaon', 'Negotiation'],
  },
  {
    id: 'fallback-site-visit-playbook',
    slug: 'why-group-site-visits-help-buyers-close-better',
    title: 'Why Group Site Visits Help Buyers Close Better Deals',
    excerpt:
      'When buyers visit together with aligned intent, questions get sharper, follow-ups become faster, and projects reveal more meaningful commercial flexibility.',
    content: `
      <p>Site visits are where buyer confidence is built, but they are also where momentum can break. Individual buyers often leave with partial answers and a long trail of follow-ups.</p>
      <h2>Why coordinated visits work better</h2>
      <p>A group visit creates structure. Common concerns get addressed once, configuration comparisons happen faster, and the project team sees real seriousness from the buyer side.</p>
      <ul>
        <li>Shared observations make due diligence stronger.</li>
        <li>Commercial conversations start earlier and with better context.</li>
        <li>Buyers stay aligned on timelines, preferences, and next steps.</li>
      </ul>
      <p>The result is a smoother path from curiosity to conviction and a better chance of unlocking the strongest possible commercial package.</p>
    `,
    author: 'TogetherBuying Field Team',
    category: 'Field Notes',
    publishedAt: '2025-11-02T00:00:00.000Z',
    readTime: '4 min read',
    thumbnail:
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
    heroTitle: 'Why Group Site Visits Work',
    heroSummary:
      'A small operational change that gives buyers more clarity, faster alignment, and better negotiation ground.',
    cardTitle: 'Why Group Site Visits Help Buyers Close Better Deals',
    cardDate: '02 Nov 2025',
    tags: ['Field Notes', 'Site Visit', 'Buyer Journey'],
  },
  {
    id: 'fallback-group-buying-future',
    slug: 'why-group-buying-is-the-future',
    title: 'Why Group Buying is the Future',
    excerpt:
      'Homebuyers are no longer settling for solo negotiations. Collective demand is becoming the smarter path to better prices and better decision clarity.',
    content: `
      <p>Real estate buyers today are more informed, more price-sensitive, and more comparison-driven than ever before. That is exactly why group buying is gaining momentum.</p>
      <p>When serious buyers align on the same project, the conversation shifts from scattered interest to visible demand. Developers respond differently when multiple qualified buyers move together.</p>
      <h2>Why this model keeps growing</h2>
      <ul>
        <li>It improves negotiating strength from day one.</li>
        <li>It reduces the pressure of evaluating a project alone.</li>
        <li>It creates faster alignment on pricing, inventory, and timelines.</li>
      </ul>
      <p>For modern buyers, group buying is not just about discounts. It is about better decision-making with stronger market leverage.</p>
    `,
    author: 'TogetherBuying Insights Desk',
    category: 'Group Buying',
    publishedAt: '2026-04-27T00:00:00.000Z',
    readTime: '5 min read',
    thumbnail:
      'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    heroTitle: 'Why Group Buying is the Future',
    heroSummary:
      'A closer look at why collective buyer momentum is becoming the new advantage in premium residential purchases.',
    cardTitle: 'Why Group Buying is the Future',
    cardDate: '27 Apr 2026',
    tags: ['Group Buying', 'Strategy', 'Future'],
  },
  {
    id: 'fallback-pensioner-home-finance',
    slug: 'home-finance-options-for-pensioners-and-senior-citizens-in-india',
    title:
      'What Are the Home Finance Options Available to Pensioners and Senior Citizens in India?',
    excerpt:
      'Retired buyers and senior citizens still have multiple routes to finance a home purchase, provided they choose the structure that fits their income profile and timelines.',
    content: `
      <p>Many homebuyers assume that housing finance becomes unavailable after retirement, but that is not always true. Banks and lenders offer multiple structures for pensioners and senior citizens, depending on pension stability, co-applicant profile, and existing assets.</p>
      <h2>Common options buyers explore</h2>
      <ul>
        <li>Standard home loans with a younger co-applicant.</li>
        <li>Loan-against-property options for existing owners.</li>
        <li>Short-tenure products supported by pension income.</li>
      </ul>
      <p>Before choosing any route, buyers should compare EMI comfort, total interest outgo, insurance requirements, and documentation support.</p>
    `,
    author: 'TogetherBuying Finance Team',
    category: 'Investments',
    publishedAt: '2026-05-23T00:00:00.000Z',
    readTime: '6 min read',
    thumbnail:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    heroTitle: 'Home Finance for Senior Citizens',
    heroSummary:
      'A practical guide to the financing routes that still remain open for retirees and pension-backed buyers.',
    cardTitle:
      'What Are the Home Finance Options Available to Pensioners and Senior Citizens in India?',
    cardDate: '23 May 2026',
    tags: ['Investments', 'Finance', 'Senior Citizens'],
  },
  {
    id: 'fallback-tarc-project-details',
    slug: 'tarc-tripundra-pushpanjali-farms-delhi-price-floor-plan-location-and-project-details',
    title:
      'TARC Tripundra Pushpanjali Farms Delhi: Price, Floor Plan, Location and Project Details',
    excerpt:
      'An overview of configuration mix, pricing band, location strengths, and what buyers should evaluate before shortlisting this Delhi project.',
    content: `
      <p>Project-detail articles help buyers move beyond brochures and understand how a development actually fits their priorities. Pricing, density, configuration mix, and location access all matter.</p>
      <h2>What buyers should assess first</h2>
      <ul>
        <li>Entry pricing versus surrounding micro-market benchmarks.</li>
        <li>Floor plan efficiency and usable area.</li>
        <li>Road access, social infrastructure, and future value triggers.</li>
      </ul>
      <p>Projects in premium zones often look attractive on brand value alone, but the smarter decision comes from comparing the live product against real buyer needs.</p>
    `,
    author: 'TogetherBuying Research Team',
    category: 'Project Details',
    publishedAt: '2026-05-18T00:00:00.000Z',
    readTime: '5 min read',
    thumbnail:
      'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80',
    heroTitle: 'TARC Tripundra Pushpanjali Farms Delhi',
    heroSummary:
      'Price, floor plan, location, and the details buyers should compare before taking the next step.',
    cardTitle:
      'TARC Tripundra Pushpanjali Farms Delhi: Price, Floor Plan, Location and Project Details',
    cardDate: '18 May 2026',
    tags: ['Project Details', 'Price', 'Floor Plan', 'Location'],
  },
  {
    id: 'fallback-ncr-market-trends',
    slug: 'ncr-real-estate-market-trends-homebuyers-should-watch-in-2026',
    title: 'NCR Real Estate Market Trends Homebuyers Should Watch in 2026',
    excerpt:
      'From supply pressure to micro-market pricing shifts, these are the key changes shaping buying decisions across NCR in 2026.',
    content: `
      <p>NCR continues to show strong demand pockets, but the market is no longer moving uniformly. Some clusters are seeing premium pricing acceleration, while others are still using offers and payment plans to create momentum.</p>
      <h2>What is changing</h2>
      <ul>
        <li>Well-connected sectors are attracting faster buyer absorption.</li>
        <li>Finished and near-delivery inventory is seeing stronger preference.</li>
        <li>Buyers are comparing developer credibility more carefully than before.</li>
      </ul>
      <p>That makes timing, micro-market selection, and collective negotiation even more important for value-focused homebuyers.</p>
    `,
    author: 'TogetherBuying Market Desk',
    category: 'Market Trends',
    publishedAt: '2026-05-12T00:00:00.000Z',
    readTime: '5 min read',
    thumbnail:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    heroTitle: 'NCR Real Estate Trends in 2026',
    heroSummary:
      'The pricing, supply, and buyer behavior changes worth tracking before you shortlist your next property.',
    cardTitle: 'NCR Real Estate Market Trends Homebuyers Should Watch in 2026',
    cardDate: '12 May 2026',
    tags: ['Market Trends', 'NCR', 'Analysis'],
  },
  {
    id: 'fallback-vastu-checklist',
    slug: 'vastu-checklist-for-buyers-before-finalizing-an-apartment',
    title: 'Vastu Checklist for Buyers Before Finalizing an Apartment',
    excerpt:
      'For buyers who care about Vastu, a few practical checks can help evaluate the entrance, kitchen, bedrooms, and energy flow before booking.',
    content: `
      <p>Vastu remains an important decision layer for many homebuyers, especially in end-use purchases. While it should not replace legal and financial diligence, it often plays a major role in final comfort and confidence.</p>
      <h2>Common buyer checks</h2>
      <ul>
        <li>Main entrance direction and natural light movement.</li>
        <li>Kitchen placement and internal circulation.</li>
        <li>Master bedroom location and overall layout balance.</li>
      </ul>
      <p>The smartest approach is to use Vastu as one input alongside location, price, builder credibility, and long-term usability.</p>
    `,
    author: 'TogetherBuying Editorial',
    category: 'Vastu Shastra',
    publishedAt: '2026-05-07T00:00:00.000Z',
    readTime: '4 min read',
    thumbnail:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    heroTitle: 'Vastu Checklist Before You Book',
    heroSummary:
      'A simple guide for buyers who want layout harmony without losing sight of price and practical value.',
    cardTitle: 'Vastu Checklist for Buyers Before Finalizing an Apartment',
    cardDate: '07 May 2026',
    tags: ['Vastu', 'Vastu Shastra', 'Home Selection'],
  },
];

const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags !== 'string') return [];

  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
};

const normalizeDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '2026-01-01T00:00:00.000Z';
  }
  return date.toISOString();
};

const formatCategoryLabel = (value = '') =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

export const deriveBlogCategory = (blog = {}) => {
  const tags = parseTags(blog.tags);
  const searchText = [
    blog.category,
    blog.title,
    blog.excerpt,
    tags.join(' '),
    stripHtml(blog.content || '').slice(0, 300),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const categoryRules = [
    {
      name: 'Vastu Shastra',
      keywords: ['vastu'],
    },
    {
      name: 'Numerology',
      keywords: ['numerology'],
    },
    {
      name: 'Group Buying',
      keywords: [
        'group buying',
        'group-buy',
        'collective',
        'togetherbuying',
        'together buying',
        'buyer group',
        'buyers group',
        'discount unlocked',
      ],
    },
    {
      name: 'Investments',
      keywords: [
        'investment',
        'investor',
        'finance',
        'loan',
        'mortgage',
        'returns',
        'wealth',
        'senior citizens',
        'pension',
        'yield',
      ],
    },
    {
      name: 'Market Trends',
      keywords: [
        'market',
        'trend',
        'hotspot',
        'analysis',
        'outlook',
        'growth',
        'demand',
      ],
    },
    {
      name: 'Project Details',
      keywords: [
        'project details',
        'price',
        'floor plan',
        'location',
        'builder',
        'tower',
        'tripundra',
        'pushpanjali',
      ],
    },
    {
      name: 'Buyer Stories',
      keywords: ['saved', 'buyer story', 'dream home', 'home purchase', 'success story'],
    },
  ];

  const matchedRule = categoryRules.find((rule) =>
    rule.keywords.some((keyword) => searchText.includes(keyword))
  );

  if (matchedRule) {
    return matchedRule.name;
  }

  const preferredTag = tags.find(
    (tag) =>
      ![
        'real estate',
        'savings',
        'strategy',
        'feature story',
        'field notes',
        'market insight',
      ].includes(tag.toLowerCase())
  );

  if (preferredTag) {
    return formatCategoryLabel(preferredTag);
  }

  if (
    blog.category &&
    !['feature story', 'field notes', 'market insight'].includes(
      String(blog.category).toLowerCase()
    )
  ) {
    return formatCategoryLabel(blog.category);
  }

  return 'Market Trends';
};

export const normalizeBlog = (blog, index = 0) => {
  const theme = storyThemes[index % storyThemes.length];
  const derivedCategory = deriveBlogCategory(blog);
  const excerpt =
    blog.excerpt ||
    `${stripHtml(blog.content || '').slice(0, 165).trim()}${
      stripHtml(blog.content || '').length > 165 ? '...' : ''
    }`;

  return {
    id: blog.id || `api-blog-${index}`,
    slug: blog.slug || `story-${index}`,
    title: blog.title || 'Untitled story',
    excerpt: excerpt || 'Fresh insights from the TogetherBuying team.',
    content: blog.content || `<p>${excerpt || 'Story details coming soon.'}</p>`,
    author: blog.author?.name || blog.author || 'TogetherBuying Editorial',
    category: derivedCategory,
    publishedAt: normalizeDate(blog.publishedAt || blog.createdAt || Date.now()),
    readTime: blog.readTime || createReadTime(blog.content || excerpt),
    thumbnail: blog.thumbnail || blog.image || '',
    heroTitle: blog.heroTitle || blog.title || 'Story Spotlight',
    heroSummary:
      blog.heroSummary ||
      blog.excerpt ||
      'Sharp buyer stories, field learnings, and group-buy market advantages in one place.',
    cardTitle: blog.cardTitle || blog.title || 'Story Spotlight',
    cardDate: blog.cardDate || '',
    tags: parseTags(blog.tags),
    eyebrow: blog.eyebrow || derivedCategory || theme.eyebrow,
    accentFrom: blog.accentFrom || theme.accentFrom,
    accentTo: blog.accentTo || theme.accentTo,
    softTint: blog.softTint || theme.softTint,
    darkTint: blog.darkTint || theme.darkTint,
  };
};

const fallbackMap = new Map(
  fallbackBlogs.map((blog, index) => [blog.slug, normalizeBlog(blog, index)])
);

export const getFallbackBlogs = () => Array.from(fallbackMap.values());

export const findFallbackBlog = (slug) => fallbackMap.get(slug) || null;

export const normalizeBlogs = (blogs = []) =>
  blogs
    .map((blog, index) => normalizeBlog(blog, index))
    .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));

export const getLiveOrFallbackBlogs = (apiBlogs = []) => {
  const normalizedBlogs = normalizeBlogs(apiBlogs);
  return normalizedBlogs.length > 0 ? normalizedBlogs : getFallbackBlogs();
};

export const mergeBlogs = (apiBlogs = []) => {
  const merged = new Map(fallbackMap);

  apiBlogs.forEach((blog, index) => {
    const normalized = normalizeBlog(blog, index);
    const existing = merged.get(normalized.slug);
    merged.set(normalized.slug, {
      ...existing,
      ...normalized,
    });
  });

  return Array.from(merged.values()).sort(
    (left, right) => new Date(right.publishedAt) - new Date(left.publishedAt)
  );
};

export const getArticleCategories = (blogs = []) => {
  const categories = Array.from(
    new Set(blogs.map((blog) => blog.category).filter(Boolean))
  );

  return ['All Articles', ...categories].sort((left, right) => {
    const leftIndex = preferredCategoryOrder.indexOf(left);
    const rightIndex = preferredCategoryOrder.indexOf(right);

    if (leftIndex === -1 && rightIndex === -1) {
      return left.localeCompare(right);
    }

    if (leftIndex === -1) return 1;
    if (rightIndex === -1) return -1;
    return leftIndex - rightIndex;
  });
};

export const getRelatedBlogs = (slug, sourceBlogs = []) => {
  const relatedSource = sourceBlogs.length
    ? sourceBlogs[0]?.accentFrom
      ? sourceBlogs
      : normalizeBlogs(sourceBlogs)
    : getFallbackBlogs();

  return relatedSource.filter((blog) => blog.slug !== slug).slice(0, 3);
};
