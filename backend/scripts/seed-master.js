require('dotenv').config();
const db = require('../src/config/database');

async function main() {
  console.log('--- MASTER RESET STARTED ---');
  
  console.log('Cleaning up all existing data using Raw SQL...');
  const tables = [
    'notifications', 'comparisons', 'wishlists', 'leads', 'testimonials', 
    'group_members', 'groups', 'project_videos', 'blogs', 'faqs', 
    'case_studies', 'properties', 'developers', 'site_settings'
  ];

  await db.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
  for (const table of tables) {
    try {
      await db.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
    } catch (e) {
      console.log(`Could not truncate ${table}, skipping...`);
    }
  }
  await db.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

  console.log('Seeding Developers...');
  const developers = await Promise.all([
    db.developer.create({
      data: { name: 'CRC Group', logo: 'https://crccorp.in/wp-content/uploads/2021/08/CRC-Logo.png', city: 'Noida' }
    }),
    db.developer.create({
      data: { name: 'Nirala World', logo: 'https://niralaworld.com/wp-content/uploads/2019/07/Nirala-Logo.png', city: 'Greater Noida' }
    }),
    db.developer.create({
      data: { name: 'Godrej Properties', city: 'Delhi NCR' }
    }),
    db.developer.create({
      data: { name: 'DLF Limited', city: 'Gurgaon' }
    })
  ]);

  console.log('Seeding Properties...');
  const propertiesData = [
    {
      title: 'CRC Maesta - Ultra Luxury',
      description: 'The pinnacle of luxury living in the heart of Noida Sector 1.',
      price: 18400000,
      originalPrice: 21500000,
      city: 'Noida',
      locality: 'Sector 1',
      bhk: 3,
      area: 1750,
      targetGroupSize: 10,
      thumbnailUrl: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=1200',
      isFeatured: true,
      category: 'BUY',
      developerId: developers[0].id,
      expiryDate: new Date('2026-05-31')
    },
    {
      title: 'Nirala Trio - Elite Living',
      description: 'Experience the trio of luxury, comfort and convenience.',
      price: 14200000,
      originalPrice: 17500000,
      city: 'Greater Noida',
      locality: 'Sector 10',
      bhk: 4,
      area: 2200,
      targetGroupSize: 12,
      thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      isFeatured: true,
      category: 'TRADE',
      developerId: developers[1].id,
      expiryDate: new Date('2026-06-15')
    },
    {
      title: 'Godrej Aristocrat',
      description: 'Forest-themed luxury residences in Sector 49, Gurgaon.',
      price: 38500000,
      originalPrice: 45000000,
      city: 'Gurgaon',
      locality: 'Sector 49',
      bhk: 3,
      area: 2100,
      targetGroupSize: 8,
      thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      isFeatured: true,
      category: 'BUY',
      developerId: developers[2].id,
      expiryDate: new Date('2026-04-20')
    },
    {
      title: 'DLF The Aralias',
      description: 'Living in the lap of golf courses and super luxury.',
      price: 92000000,
      originalPrice: 110000000,
      city: 'Gurgaon',
      locality: 'Golf Course Road',
      bhk: 4,
      area: 5500,
      targetGroupSize: 4,
      thumbnailUrl: 'https://images.unsplash.com/photo-1620608209102-4b63ff4ee7a1?auto=format&fit=crop&q=80&w=1200',
      isFeatured: true,
      category: 'SELL',
      developerId: developers[3].id,
      expiryDate: new Date('2026-05-01')
    },
    {
      title: 'TATA Eureka Park',
      description: 'Smart homes with a touch of green technology.',
      price: 9500000,
      originalPrice: 11200000,
      city: 'Noida',
      locality: 'Sector 150',
      bhk: 2,
      area: 1100,
      targetGroupSize: 15,
      thumbnailUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1200',
      isFeatured: false,
      category: 'BUY',
      developerId: developers[2].id,
      expiryDate: new Date('2026-12-31')
    },
    {
      title: 'Emaar Digi Homes',
      description: 'The smart way to live in Gurgaon Sector 62.',
      price: 26500000,
      originalPrice: 31000000,
      city: 'Gurgaon',
      locality: 'Sector 62',
      bhk: 3,
      area: 2500,
      targetGroupSize: 10,
      thumbnailUrl: 'https://images.unsplash.com/photo-1512918766671-5085e6ddf104?auto=format&fit=crop&q=80&w=1200',
      isFeatured: false,
      category: 'TRADE',
      developerId: developers[3].id,
      expiryDate: new Date('2026-06-30')
    },
    {
      title: 'Mahagun Mezzaria',
      description: 'Art-Deco architecture themed luxury homes.',
      price: 22000000,
      originalPrice: 26500000,
      city: 'Noida',
      locality: 'Sector 78',
      bhk: 4,
      area: 2800,
      targetGroupSize: 6,
      thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      isFeatured: false,
      category: 'SELL',
      developerId: developers[0].id,
      expiryDate: new Date('2026-05-20')
    },
    {
      title: 'M3M Crown',
      description: 'Luxury high-rise apartments in the heart of Gurgaon.',
      price: 34500000,
      originalPrice: 41000000,
      city: 'Gurgaon',
      locality: 'Sector 111',
      bhk: 3,
      area: 2300,
      targetGroupSize: 10,
      thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      isFeatured: false,
      category: 'TRADE',
      developerId: developers[3].id,
      expiryDate: new Date('2026-07-15')
    },
    {
      title: 'Birla Navya',
      description: 'The luxury of being close to nature in Sector 63A Gurgaon.',
      price: 45000000,
      originalPrice: 52000000,
      city: 'Gurgaon',
      locality: 'Sector 63A',
      bhk: 4,
      area: 3500,
      targetGroupSize: 5,
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      isFeatured: false,
      category: 'BUY',
      developerId: developers[2].id,
      expiryDate: new Date('2026-05-15')
    },
    {
      title: 'ATS Pious Hideaways',
      description: 'Living in a masterpiece of architecture and design.',
      price: 12500000,
      originalPrice: 14500000,
      city: 'Greater Noida',
      locality: 'Sector 150',
      bhk: 3,
      area: 1650,
      targetGroupSize: 12,
      thumbnailUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
      isFeatured: false,
      category: 'TRADE',
      developerId: developers[1].id,
      expiryDate: new Date('2026-08-31')
    }
  ];

  const createdProperties = [];
  for (const p of propertiesData) {
    const prop = await db.property.create({ data: p });
    createdProperties.push(prop);
    await db.group.create({
      data: { propertyId: prop.id, status: 'OPEN', maxMembers: prop.targetGroupSize, targetDate: prop.expiryDate }
    });
  }

  console.log('Seeding Project Videos (Short Tours)...');
  await db.projectVideo.createMany({
    data: [
      { title: 'CRC Maesta Site Tour', videoUrl: 'https://v.ftcdn.net/05/73/42/15/700_F_573421523_xN3x6K0pX8YfXz7hRyW7Uu6vN6V5u3Ym_ST.mp4', propertyId: createdProperties[0].id },
      { title: 'Nirala Trio Show Flat', videoUrl: 'https://v.ftcdn.net/04/85/45/64/700_F_485456485_4X7zS7E6X8vLhD8Q7WzPZpYxGvH6mZzS_ST.mp4', propertyId: createdProperties[1].id },
      { title: 'Godrej Aristocrat Highlights', videoUrl: 'https://joy.videvo.net/videvo_files/video/free/2019-11/large_watermarked/190301_08_Buildings_08_preview.mp4', propertyId: createdProperties[2].id }
    ]
  });

  console.log('Skipping blog, FAQ, and testimonial dummy seed data - frontend fallback files will handle demo content.');

  console.log('Seeding Case Studies (Success Stories)...');
  await db.caseStudy.create({
    data: {
      title: 'CRC Maesta - Group Success',
      slug: 'crc-maesta-success',
      propertyName: 'CRC Maesta',
      location: 'Noida',
      originalPrice: 20900000,
      finalPrice: 18400000,
      savings: 2500000,
      savingsPercent: 12,
      buyersCount: 15,
      thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000'
    }
  });

  console.log('--- MASTER SEEDING COMPLETED ---');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
