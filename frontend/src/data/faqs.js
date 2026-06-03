export const fallbackFaqs = [
  {
    id: 'faq-1',
    question: 'How does group buying work in real estate?',
    answer:
      'Group buying allows multiple buyers to come together for the same project and negotiate stronger pricing as a collective. Once the group reaches meaningful demand, the RM team coordinates discussions with the developer for better commercial terms.',
    category: 'General',
  },
  {
    id: 'faq-2',
    question: 'How much discount can I expect?',
    answer:
      'Discounts usually range from 3% to 10% depending on the builder, inventory type, market conditions, and how many serious buyers are in the group. Premium opportunities can sometimes unlock even stronger pricing advantages.',
    category: 'Savings',
  },
  {
    id: 'faq-3',
    question: 'Is my money safe?',
    answer:
      'Yes. GroupBuying does not take your property payment. Transactions happen directly between the buyer and the developer through standard legal documentation and registered agreements.',
    category: 'Safety',
  },
  {
    id: 'faq-4',
    question: 'How long does it take to form a group?',
    answer:
      'Popular projects can gather enough momentum within a few days, while niche projects may take a few weeks. We keep buyers updated on interest level, availability, and next milestones throughout the process.',
    category: 'Process',
  },
  {
    id: 'faq-5',
    question: 'What happens if I want to exit a group?',
    answer:
      'You can usually exit before the active negotiation phase begins. Once negotiations start, we encourage members to stay aligned so the whole group keeps its buying strength.',
    category: 'Process',
  },
  {
    id: 'faq-6',
    question: 'Do I need a premium subscription to join groups?',
    answer:
      'No. Basic participation can still happen without premium access. Premium plans mainly help with priority alerts, stronger support, and faster access to high-demand opportunities.',
    category: 'Subscription',
  },
];

export const normalizeFaq = (faq, index = 0) => ({
  id: faq.id || `faq-${index}`,
  question: faq.question || 'Untitled question',
  answer: faq.answer || 'Answer coming soon.',
  category: faq.category || 'General',
});

export const getFallbackFaqs = () => fallbackFaqs.map(normalizeFaq);
