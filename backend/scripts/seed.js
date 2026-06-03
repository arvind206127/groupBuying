require('dotenv').config();
const db = require('../src/config/database');

async function main() {
  console.log('Starting database seed...');

  await db.testimonial.deleteMany({});
  await db.fAQ.deleteMany({});
  await db.blog.deleteMany({});
  console.log('Cleared backend testimonial, FAQ, and blog rows so frontend fallback data can take over.');

  const admin = await db.user.upsert({
    where: { email: 'admin@realtogather.com' },
    update: {},
    create: {
      email: 'admin@realtogather.com',
      name: 'Admin User',
      phone: '9876543210',
      role: 'ADMIN',
      isVerified: true,
      city: 'Mumbai',
    },
  });
  console.log('Admin created:', admin.email);

  const rm = await db.user.upsert({
    where: { email: 'rm@realtogather.com' },
    update: {},
    create: {
      email: 'rm@realtogather.com',
      name: 'Relationship Manager',
      phone: '9876543211',
      role: 'RM',
      isVerified: true,
      city: 'Pune',
    },
  });
  console.log('RM created:', rm.email);

  const developers = await Promise.all([
    db.developer.upsert({
      where: { id: 'dev-001' },
      update: {},
      create: {
        id: 'dev-001',
        name: 'Lodha Group',
        description:
          "India's premier real estate developer with iconic projects across Mumbai.",
        city: 'Mumbai',
        website: 'https://www.lodhagroup.com',
      },
    }),
    db.developer.upsert({
      where: { id: 'dev-002' },
      update: {},
      create: {
        id: 'dev-002',
        name: 'Godrej Properties',
        description:
          'A trusted name in Indian real estate with pan-India presence.',
        city: 'Mumbai',
        website: 'https://www.godrejproperties.com',
      },
    }),
    db.developer.upsert({
      where: { id: 'dev-003' },
      update: {},
      create: {
        id: 'dev-003',
        name: 'Prestige Group',
        description: "South India's leading real estate developer.",
        city: 'Bangalore',
        website: 'https://www.prestigeconstructions.com',
      },
    }),
  ]);
  console.log('Developers created:', developers.length);

  const properties = await Promise.all([
    db.property.upsert({
      where: { id: 'prop-001' },
      update: {},
      create: {
        id: 'prop-001',
        title: 'Lodha Altamount - Premium 3BHK',
        description:
          'Experience luxury living at its finest with breathtaking sea views and world-class amenities. Located in the heart of South Mumbai.',
        price: 45000000,
        discountedPrice: 42750000,
        city: 'Mumbai',
        locality: 'Altamount Road',
        bhk: 3,
        area: 2100,
        targetGroupSize: 5,
        isFeatured: true,
        developerId: 'dev-001',
        amenities: JSON.stringify([
          'Swimming Pool',
          'Gym',
          'Concierge',
          'Valet Parking',
          'Club House',
          'Spa',
          'Garden',
          'Security',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
          'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
        ]),
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      },
    }),
    db.property.upsert({
      where: { id: 'prop-002' },
      update: {},
      create: {
        id: 'prop-002',
        title: 'Godrej Prime - Spacious 2BHK',
        description:
          'Modern living spaces with top-notch amenities in the vibrant Thane locality. Perfect for young families.',
        price: 15000000,
        discountedPrice: 14250000,
        city: 'Thane',
        locality: 'Ghodbunder Road',
        bhk: 2,
        area: 1050,
        targetGroupSize: 8,
        isFeatured: true,
        developerId: 'dev-002',
        amenities: JSON.stringify([
          'Swimming Pool',
          'Gym',
          'Children Play Area',
          'Jogging Track',
          'Club House',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
          'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        ]),
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
      },
    }),
    db.property.upsert({
      where: { id: 'prop-003' },
      update: {},
      create: {
        id: 'prop-003',
        title: 'Prestige Lakeside Habitat - 4BHK Villa',
        description:
          'Sprawling villas in serene lakeside setting. An epitome of luxury and tranquility in IT hub of India.',
        price: 85000000,
        discountedPrice: 80750000,
        city: 'Bangalore',
        locality: 'Whitefield',
        bhk: 4,
        area: 4200,
        targetGroupSize: 3,
        isFeatured: true,
        developerId: 'dev-003',
        amenities: JSON.stringify([
          'Lake View',
          'Private Pool',
          'Smart Home',
          'Gymnasium',
          'Tennis Court',
          'Clubhouse',
          'Gated Community',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        ]),
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      },
    }),
    db.property.upsert({
      where: { id: 'prop-004' },
      update: {},
      create: {
        id: 'prop-004',
        title: 'Lodha Palava City - 1BHK Smart Home',
        description:
          "Affordable smart homes in India's first planned city. Perfect investment opportunity with high returns.",
        price: 7500000,
        discountedPrice: 7125000,
        city: 'Mumbai',
        locality: 'Dombivli',
        bhk: 1,
        area: 620,
        targetGroupSize: 10,
        isFeatured: false,
        developerId: 'dev-001',
        amenities: JSON.stringify([
          'Smart Home',
          'School',
          'Hospital',
          'Mall',
          'Metro Connectivity',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        ]),
        thumbnailUrl:
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      },
    }),
    db.property.upsert({
      where: { id: 'prop-005' },
      update: {},
      create: {
        id: 'prop-005',
        title: 'Prestige Song of the South - 3BHK',
        description:
          'Premium apartments in South Bangalore with excellent connectivity and modern amenities.',
        price: 12000000,
        discountedPrice: 11400000,
        city: 'Bangalore',
        locality: 'Begur Road',
        bhk: 3,
        area: 1680,
        targetGroupSize: 6,
        isFeatured: false,
        developerId: 'dev-003',
        amenities: JSON.stringify([
          'Swimming Pool',
          'Gym',
          'Badminton Court',
          'Indoor Games',
          'Garden',
        ]),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800',
        ]),
        thumbnailUrl:
          'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800',
      },
    }),
  ]);
  console.log('Properties created:', properties.length);

  console.log('Testimonials seed skipped - using frontend fallback data');

  await db.caseStudy.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Group of 8 Saves Rs.68 Lakhs in Mumbai',
        slug: 'group-8-saves-68-lakhs-mumbai',
        description:
          'Eight buyers joined forces to purchase premium 2BHK apartments in Thane, negotiating a stellar 5.5% discount.',
        propertyName: 'Godrej Prime, Thane',
        location: 'Thane, Mumbai',
        originalPrice: 15000000,
        finalPrice: 14175000,
        savings: 825000,
        savingsPercent: 5.5,
        buyersCount: 8,
        thumbnail:
          'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
        isPublished: true,
      },
      {
        title: 'Bangalore Tech Professionals Crack 7% Deal',
        slug: 'bangalore-tech-professionals-7-percent-deal',
        description:
          'Five IT professionals formed a group on Real Togather and negotiated a record 7% discount on premium apartments in Whitefield.',
        propertyName: 'Prestige Lakeside Habitat',
        location: 'Whitefield, Bangalore',
        originalPrice: 85000000,
        finalPrice: 79050000,
        savings: 5950000,
        savingsPercent: 7.0,
        buyersCount: 5,
        thumbnail:
          'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
        isPublished: true,
      },
    ],
  });
  console.log('Case Studies created');

  console.log('FAQ seed skipped - using frontend fallback data');
  console.log('Blog seed skipped - using frontend fallback data');

  await db.siteSettings.createMany({
    skipDuplicates: true,
    data: [
      { key: 'site_name', value: 'Real Togather' },
      { key: 'site_tagline', value: 'Buy Together, Save Together' },
      { key: 'contact_email', value: 'hello@realtogather.com' },
      { key: 'contact_phone', value: '+91 98765 43210' },
      {
        key: 'contact_address',
        value: '123, Business Park, Andheri East, Mumbai - 400069',
      },
      { key: 'social_facebook', value: 'https://facebook.com/realtogather' },
      { key: 'social_instagram', value: 'https://instagram.com/realtogather' },
      {
        key: 'social_linkedin',
        value: 'https://linkedin.com/company/realtogather',
      },
      { key: 'social_twitter', value: 'https://twitter.com/realtogather' },
      { key: 'hero_title', value: 'Buy Your Dream Home\nTogether & Save More' },
      {
        key: 'hero_subtitle',
        value:
          'Join groups of smart buyers to negotiate the best real estate deals. Save up to 10% on your dream property.',
      },
      { key: 'stats_users', value: '10,000+' },
      { key: 'stats_properties', value: '500+' },
      { key: 'stats_savings', value: 'Rs.50Cr+' },
      { key: 'stats_deals', value: '1,200+' },
    ],
  });
  console.log('Site Settings created');

  console.log('\nDatabase seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('   Admin: admin@realtogather.com');
  console.log('   RM:    rm@realtogather.com');
  console.log('   (Use OTP login - check console for OTP in dev mode)');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
