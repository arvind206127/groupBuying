const fallbackTestimonials = [
  {
    id: 'review-1',
    name: 'Vikrant Grover',
    role: 'Luxury Home Buyer',
    content:
      'Thanks to the amazing team, we found a stunning luxury flat that fits our lifestyle perfectly. They handled every question patiently and made the group-buying process feel very smooth from shortlist to booking.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    source: 'Google',
  },
  {
    id: 'review-2',
    name: 'Arun Chaudhary',
    role: 'First-time Buyer',
    content:
      'Exceptional service. They guided us to the perfect luxury flat, offered personalized options, and explained negotiation benefits very clearly. We felt supported throughout the whole process.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/51.jpg',
    source: 'Google',
  },
  {
    id: 'review-3',
    name: 'Naveen',
    role: 'Senior Manager',
    content:
      'The team made finding our luxury flat effortless. Their expertise, professionalism, and dedication helped us compare the right options and close with confidence at a better value.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/74.jpg',
    source: 'Google',
  },
  {
    id: 'review-4',
    name: 'Sneha Reddy',
    role: 'Doctor',
    content:
      'As a first-time homebuyer, I was nervous. The RM assigned to our group guided us at every step and made the paperwork easy to understand. We saved a meaningful amount on our 2BHK purchase.',
    rating: 4,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    source: 'Google',
  },
  {
    id: 'review-5',
    name: 'Priya Sharma',
    role: 'Marketing Manager',
    content:
      'I was skeptical initially, but the transparency and professionalism won me over. The team negotiated a strong deal and kept communication very clear during every stage of the process.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/65.jpg',
    source: 'Google',
  },
  {
    id: 'review-6',
    name: 'Amit Patel',
    role: 'Entrepreneur',
    content:
      'The smart matching system connected me with like-minded buyers. Together we negotiated an excellent deal. This feels like the future of real estate buying for serious purchasers.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
    source: 'Google',
  },
  {
    id: 'review-7',
    name: 'Rajesh Kumar',
    role: 'IT Professional',
    content:
      'The group buying concept is brilliant and the team was supportive throughout. I saved a substantial amount on my dream home and always knew what the next step in the journey was.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    source: 'Google',
  },
];

export const normalizeTestimonial = (testimonial, index = 0) => ({
  id: testimonial.id || `testimonial-${index}`,
  name: testimonial.name || 'Verified Buyer',
  role: testimonial.role || 'Customer',
  content:
    testimonial.content ||
    'Smooth experience, strong support, and a much better buying journey overall.',
  rating: Number(testimonial.rating) || 5,
  image:
    testimonial.image ||
    testimonial.avatar ||
    `https://randomuser.me/api/portraits/${
      index % 2 === 0 ? 'men' : 'women'
    }/${(index % 70) + 1}.jpg`,
  source: testimonial.source || 'Google',
});

export const getFallbackTestimonials = () =>
  fallbackTestimonials.map((testimonial, index) =>
    normalizeTestimonial(testimonial, index)
  );

export const getLiveOrFallbackTestimonials = (
  apiTestimonials = [],
  minimumCount = 3
) => {
  const normalized = Array.isArray(apiTestimonials)
    ? apiTestimonials.map((testimonial, index) =>
        normalizeTestimonial(testimonial, index)
      )
    : [];

  const fallback = getFallbackTestimonials();

  if (normalized.length === 0) {
    return fallback;
  }

  if (normalized.length >= minimumCount) {
    return normalized;
  }

  const existingIds = new Set(normalized.map((testimonial) => testimonial.id));
  const supplemental = fallback.filter(
    (testimonial) => !existingIds.has(testimonial.id)
  );

  return [...normalized, ...supplemental].slice(0, minimumCount);
};

export const getTestimonialsSummary = (testimonials = []) => {
  const totalReviews = testimonials.length;
  const averageRating =
    totalReviews > 0
      ? (
          testimonials.reduce(
            (sum, testimonial) => sum + (Number(testimonial.rating) || 0),
            0
          ) / totalReviews
        ).toFixed(1)
      : '5.0';

  return {
    totalReviews,
    averageRating,
  };
};
