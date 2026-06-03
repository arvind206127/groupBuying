require('dotenv').config();
const db = require('../src/config/database');

async function main() {
  console.log('Cleaning up existing data...');
  
  // Clean up order to avoid foreign key constraints
  await db.comparison.deleteMany({});
  await db.wishlist.deleteMany({});
  await db.lead.deleteMany({});
  await db.testimonial.deleteMany({});
  await db.fAQ.deleteMany({});
  await db.blog.deleteMany({});
  await db.groupMember.deleteMany({});
  await db.group.deleteMany({});
  await db.projectVideo.deleteMany({});
  await db.property.deleteMany({});
  await db.developer.deleteMany({});

  console.log('Creating Developers...');
  const developers = await Promise.all([
    db.developer.create({
      data: {
        name: 'CRC Group',
        logo: 'https://crccorp.in/wp-content/uploads/2021/08/CRC-Logo.png',
        description: 'Leading name in premium real estate developments.',
        city: 'Noida'
      }
    }),
    db.developer.create({
      data: {
        name: 'Nirala World',
        logo: 'https://niralaworld.com/wp-content/uploads/2019/07/Nirala-Logo.png',
        description: 'Delivering excellence in modern living spaces.',
        city: 'Greater Noida'
      }
    }),
    db.developer.create({
      data: {
        name: 'Godrej Properties',
        description: 'Legacy of trust and innovative design.',
        city: 'Delhi NCR'
      }
    }),
    db.developer.create({
      data: {
        name: 'DLF Limited',
        description: 'India\'s largest real estate developer.',
        city: 'Gurgaon'
      }
    })
  ]);

  console.log('Creating Properties...');
  const propertiesData = [
    {
      title: 'CRC Maesta - Premium 3BHK',
      description: 'Ultra-luxury apartments with world-class amenities in Sector 1 Noida.',
      price: 18400000, // 1.84 Cr
      originalPrice: 20900000, // 2.09 Cr
      city: 'Noida',
      locality: 'Sector 1',
      bhk: 3,
      area: 1750,
      targetGroupSize: 10,
      thumbnailUrl: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&q=80&w=1200',
      isFeatured: true,
      developerId: developers[0].id,
      expiryDate: new Date('2026-05-31T23:59:59'),
      category: 'BUY'
    },
    {
      title: 'Nirala Trio - Spacious 4BHK',
      description: 'Exclusive group-buying opportunity in Greater Noida West.',
      price: 14500000,
      originalPrice: 16800000,
      city: 'Greater Noida',
      locality: 'Sector 10',
      bhk: 4,
      area: 2100,
      targetGroupSize: 8,
      thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      isFeatured: true,
      developerId: developers[1].id,
      expiryDate: new Date('2026-06-15T23:59:59'),
      category: 'TRADE'
    },
    {
      title: 'Godrej Aristocrat',
      description: 'European style luxury residences in Sector 49, Gurgaon.',
      price: 42000000,
      originalPrice: 48500000,
      city: 'Gurgaon',
      locality: 'Sector 49',
      bhk: 4,
      area: 3200,
      targetGroupSize: 5,
      thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      isFeatured: true,
      developerId: developers[2].id,
      expiryDate: new Date('2026-04-25T23:59:59'),
      category: 'SELL'
    },
    {
      title: 'The Aralias by DLF',
      description: 'Ultra-luxury living amidst lush green golf courses.',
      price: 95000000,
      originalPrice: 112000000,
      city: 'Gurgaon',
      locality: 'DLF Phase 5',
      bhk: 4,
      area: 5800,
      targetGroupSize: 3,
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      isFeatured: true,
      developerId: developers[3].id,
      expiryDate: new Date('2026-05-10T23:59:59'),
      category: 'BUY'
    },
    {
      title: 'Godrej Woods - Sector 43',
      description: 'Living in a forest with premium urban facilities.',
      price: 24500000,
      originalPrice: 28500000,
      city: 'Noida',
      locality: 'Sector 43',
      bhk: 3,
      area: 2200,
      targetGroupSize: 12,
      thumbnailUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
      isFeatured: false,
      developerId: developers[2].id,
      expiryDate: new Date('2026-06-30T23:59:59'),
      category: 'TRADE'
    },
    {
      title: 'Arihant One - Modern 3BHK',
      description: 'Smart homes with zero loading in Sector 1, Greater Noida.',
      price: 11200000,
      originalPrice: 13000000,
      city: 'Greater Noida',
      locality: 'Sector 1',
      bhk: 3,
      area: 1450,
      targetGroupSize: 15,
      thumbnailUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
      developerId: developers[0].id,
      expiryDate: new Date('2026-07-01T23:59:59'),
      category: 'SELL'
    },
    {
      title: 'M3M Crown',
      description: 'The epitome of high-class living in Gurgaon Sector 111.',
      price: 38000000,
      originalPrice: 44000000,
      city: 'Gurgaon',
      locality: 'Sector 111',
      bhk: 3,
      area: 2400,
      targetGroupSize: 6,
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
      developerId: developers[3].id,
      expiryDate: new Date('2026-05-20T23:59:59'),
      category: 'TRADE'
    },
    {
      title: 'TATA Eureka Park',
      description: 'Smart green homes for the smart urban citizen.',
      price: 9500000,
      originalPrice: 11500000,
      city: 'Noida',
      locality: 'Sector 150',
      bhk: 2,
      area: 1100,
      targetGroupSize: 20,
      thumbnailUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=1200',
      developerId: developers[2].id,
      expiryDate: new Date('2026-12-31T23:59:59'),
      category: 'BUY'
    },
    {
      title: 'Emaar Digi Homes',
      description: 'Voice-controlled smart homes in Gurgaon Sector 62.',
      price: 28000000,
      originalPrice: 32500000,
      city: 'Gurgaon',
      locality: 'Sector 62',
      bhk: 3,
      area: 2500,
      targetGroupSize: 8,
      thumbnailUrl: 'https://images.unsplash.com/photo-1512918766671-5085e6ddf104?auto=format&fit=crop&q=80&w=1200',
      developerId: developers[3].id,
      expiryDate: new Date('2026-05-30T23:59:59'),
      category: 'TRADE'
    },
    {
      title: 'Sobha International City',
      description: 'Ultra-exclusive villas in Gurgaon Sector 109.',
      price: 65000000,
      originalPrice: 78000000,
      city: 'Gurgaon',
      locality: 'Sector 109',
      bhk: 5,
      area: 4500,
      targetGroupSize: 4,
      thumbnailUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      developerId: developers[3].id,
      expiryDate: new Date('2026-04-10T23:59:59'),
      category: 'SELL'
    },
    {
      title: 'Mahagun Mezzaria',
      description: 'Luxury residences with Art Deco architecture in Noida Sector 78.',
      price: 21500000,
      originalPrice: 25500000,
      city: 'Noida',
      locality: 'Sector 78',
      bhk: 4,
      area: 2600,
      targetGroupSize: 10,
      thumbnailUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      developerId: developers[0].id,
      expiryDate: new Date('2026-06-15T23:59:59'),
      category: 'BUY'
    }
  ];

  for (const data of propertiesData) {
    const property = await db.property.create({ data });
    
    // Create an active group for each property to show openings
    await db.group.create({
      data: {
        propertyId: property.id,
        status: 'OPEN',
        maxMembers: property.targetGroupSize,
        targetDate: property.expiryDate,
        // Mock members (random between 1 and targetSize-1)
        members: {
            // We can't easily add members without user objects, 
            // but we can check the _count later. 
            // For now, let's just create the group.
        }
      }
    });
  }

  console.log('Skipping backend dummy blogs, FAQs, and testimonials. Frontend fallback files will provide demo content.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
