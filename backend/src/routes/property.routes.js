const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { optionalAuth } = require('../middleware/auth.middleware');
const db = require('../config/database');
const ensurePropertyDetailFields = require('../utils/ensurePropertyDetailFields');
const ensurePropertyStatuses = require('../utils/ensurePropertyStatuses');

const DEFAULT_ORDER_BY = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
const DISPLAY_SECTIONS = ['PRE_LAUNCH', 'FEATURED_COMMERCIAL', 'TRENDING', 'FAST_SELLING', 'PROMINSHES_AND_PLOTS'];
const DEFAULT_BUDGET_MAX = 150000000;
const BUDGET_STEP = 500000;
const SUPPORTED_PROPERTY_TYPES = ['Residential', 'Commercial', 'Plots', 'Villa'];

const splitLines = (value) => String(value || '')
  .split('\n')
  .map((item) => item.trim())
  .filter(Boolean);

const isLikelyImageUrl = (value = '') => /^(https?:\/\/|\/|uploads\/|data:image\/|blob:)/i.test(String(value).trim())
  || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(String(value).trim());

const isLikelyArea = (value = '') => /(sq\.?\s*ft|sqft|square\s*feet|acre|acres|sq\.?\s*m|sqm|yard|yd)/i.test(String(value).trim());

const parseFloorPlans = (value) => {
  if (Array.isArray(value)) return value;
  return splitLines(value).map((line) => {
    const [label, ...parts] = line.split('|').map((part) => part.trim());
    const [first = '', second = '', third = '', fourth = ''] = parts;
    const startsWithImage = isLikelyImageUrl(first);
    const startsWithArea = isLikelyArea(first);
    const secondIsArea = isLikelyArea(second);

    let imageUrl = '';
    let area = '';
    let price = '';
    let priceTo = '';

    if (startsWithImage) {
      imageUrl = first;
      area = second;
      price = third;
      priceTo = fourth;
    } else if (startsWithArea) {
      area = first;
      price = second;
      imageUrl = third;
      priceTo = fourth;
    } else {
      price = first;
      area = secondIsArea || second ? second : '';
      imageUrl = third;
      priceTo = fourth;
    }

    if (!isLikelyImageUrl(imageUrl)) {
      const detectedImageUrl = parts.find(isLikelyImageUrl);
      if (detectedImageUrl) imageUrl = detectedImageUrl;
    }

    return {
      label: label || 'Floor Plan',
      imageUrl: imageUrl || '',
      area: area || '',
      price: price || '',
      priceTo: priceTo || '',
    };
  }).filter((plan) => plan.label || plan.imageUrl);
};

const parseNearbyPlaces = (value) => {
  if (Array.isArray(value)) return value;
  return splitLines(value).map((line) => {
    const [category, name, address, distance, time] = line.split('|').map((part) => part.trim());
    return {
      category: category || 'Nearby',
      name: name || '',
      address: address || '',
      distance: distance || '',
      time: time || '',
    };
  }).filter((place) => place.category || place.name);
};

const parsePriceInput = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const text = String(value).replace(/,/g, '').trim();
  const match = text.match(/[\d.]+/);
  if (!match) return null;
  let parsedValue = Number(match[0]);
  if (!Number.isFinite(parsedValue)) return null;
  if (/cr|crore/i.test(text)) parsedValue *= 10000000;
  if (/lac|lakh/i.test(text)) parsedValue *= 100000;
  return parsedValue;
};

const extractBhkFromLabel = (value = '') => {
  const match = String(value).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

const getFloorPlanPrices = (floorPlans = []) => floorPlans
  .flatMap((plan) => [
    parsePriceInput(plan?.price ?? plan?.minPrice ?? plan?.priceFrom),
    parsePriceInput(plan?.priceTo ?? plan?.maxPrice ?? plan?.priceTill),
  ])
  .filter((price) => Number.isFinite(price) && price > 0);

const getFloorPlanBhks = (floorPlans = []) => floorPlans
  .map((plan) => parseInt(plan?.bhk, 10) || extractBhkFromLabel(plan?.label || plan?.title || plan?.name || plan?.configuration))
  .filter((bhk) => Number.isFinite(bhk) && bhk > 0);

const parseOptionalNumber = (data, field, parser = parseFloat) => {
  if (data[field] === '') {
    data[field] = null;
    return;
  }
  if (data[field] !== undefined && data[field] !== null) {
    const parsedValue = parser(data[field]);
    data[field] = Number.isFinite(parsedValue) ? parsedValue : null;
  }
};

const preparePropertyData = (body) => {
  const data = { ...body };

  if (data.price !== undefined) data.price = parsePriceInput(data.price);
  if (data.originalPrice !== undefined) data.originalPrice = parsePriceInput(data.originalPrice);
  if (data.discountedPrice !== undefined) data.discountedPrice = parsePriceInput(data.discountedPrice);
  if (data.targetGroupSize) data.targetGroupSize = parseInt(data.targetGroupSize);
  if (data.bhk) data.bhk = parseInt(data.bhk);
  if (data.area) data.area = parseFloat(data.area);
  parseOptionalNumber(data, 'unitCount', parseInt);
  parseOptionalNumber(data, 'propertyAreaAcres', parseFloat);
  parseOptionalNumber(data, 'developerTotalProjects', parseInt);
  parseOptionalNumber(data, 'developerExperienceYears', parseInt);
  if (data.trackingCount) data.trackingCount = parseInt(data.trackingCount);
  if (data.expiryDate && data.expiryDate !== '') data.expiryDate = new Date(data.expiryDate);
  if (data.expiryDate === '') data.expiryDate = null;
  if (data.possessionDate && data.possessionDate !== '') data.possessionDate = new Date(data.possessionDate);
  if (data.possessionDate === '') data.possessionDate = null;
  if (data.launchDate && data.launchDate !== '') data.launchDate = new Date(data.launchDate);
  if (data.launchDate === '') data.launchDate = null;
  if (data.developerId === '') data.developerId = null;
  if (data.propertyStatusId === '') data.propertyStatusId = null;
  if (data.displaySection === '') data.displaySection = null;

  if (typeof data.images === 'string') {
    data.images = splitLines(data.images);
  }
  if (typeof data.amenities === 'string') {
    data.amenities = splitLines(data.amenities);
  }
  if (typeof data.highlights === 'string') data.highlights = splitLines(data.highlights);
  if (typeof data.specifications === 'string') data.specifications = splitLines(data.specifications);
  if (typeof data.floorPlans === 'string') data.floorPlans = parseFloorPlans(data.floorPlans);
  if (typeof data.nearbyPlaces === 'string') data.nearbyPlaces = parseNearbyPlaces(data.nearbyPlaces);

  if (Array.isArray(data.floorPlans) && data.floorPlans.length) {
    const floorPlanPrices = getFloorPlanPrices(data.floorPlans);
    const floorPlanBhks = getFloorPlanBhks(data.floorPlans);
    const firstPlanArea = String(data.floorPlans[0]?.area || '').replace(/,/g, '').match(/[\d.]+/)?.[0];

    if (!Number.isFinite(data.price) && floorPlanPrices.length) {
      data.price = Math.min(...floorPlanPrices);
    }
    if (!Number.isFinite(data.bhk) && floorPlanBhks.length) {
      data.bhk = Math.min(...floorPlanBhks);
    }
    if (!Number.isFinite(data.area) && firstPlanArea) {
      const parsedArea = parseFloat(firstPlanArea);
      data.area = Number.isFinite(parsedArea) ? parsedArea : data.area;
    }
  }

  delete data.developer;
  delete data.propertyStatus;
  delete data.groups;
  delete data.videos;
  delete data.wishlistedBy;
  delete data.comparedBy;
  delete data._count;

  return data;
};

const getDisplaySectionOrderBy = (displaySection) => {
  switch (displaySection) {
    case 'TRENDING':
      return [{ trackingCount: 'desc' }, ...DEFAULT_ORDER_BY];
    case 'FAST_SELLING':
      return [{ trackingCount: 'desc' }, { expiryDate: 'asc' }, ...DEFAULT_ORDER_BY];
    case 'PRE_LAUNCH':
      return [{ expiryDate: 'asc' }, ...DEFAULT_ORDER_BY];
    case 'FEATURED_COMMERCIAL':
      return [{ isFeatured: 'desc' }, { trackingCount: 'desc' }, { createdAt: 'desc' }];
    case 'PROMINSHES_AND_PLOTS':
      return [{ isFeatured: 'desc' }, { trackingCount: 'desc' }, { createdAt: 'desc' }];
    default:
      return DEFAULT_ORDER_BY;
  }
};

const filterPropertiesByDisplaySection = (properties, displaySection) => {
  switch (displaySection) {
    case 'PRE_LAUNCH':
      return properties.filter((property) => property.displaySection === 'PRE_LAUNCH');
    case 'FEATURED_COMMERCIAL':
      return properties.filter((property) => property.displaySection === 'FEATURED_COMMERCIAL');
    case 'TRENDING':
      return properties.filter((property) => property.displaySection === 'TRENDING');
    case 'FAST_SELLING':
      return properties.filter((property) => property.displaySection === 'FAST_SELLING');
    case 'PROMINSHES_AND_PLOTS':
      return properties.filter((property) => property.displaySection === 'PROMINSHES_AND_PLOTS');
    default:
      return properties;
  }
};

const cleanTextValue = (value) => String(value || '').trim();

const uniqueSortedValues = (values) => [
  ...new Set(values.map(cleanTextValue).filter(Boolean)),
].sort((first, second) => first.localeCompare(second));

const buildTextOptions = (values) => uniqueSortedValues(values).map((value) => ({
  value,
  label: value,
}));

const buildLocationOptions = (properties) => {
  const options = new Map();

  properties.forEach((property) => {
    const value = cleanTextValue(property.locality);
    if (!value) return;

    const city = cleanTextValue(property.city);
    const key = `${value.toLowerCase()}-${city.toLowerCase()}`;

    if (!options.has(key)) {
      options.set(key, { value, label: value, city });
    }
  });

  return [...options.values()].sort((first, second) => (
    first.label.localeCompare(second.label) || first.city.localeCompare(second.city)
  ));
};

const buildBhkOptions = (values) => uniqueSortedValues(values)
  .map((value) => Number(value))
  .filter((value) => Number.isFinite(value) && value > 0)
  .sort((first, second) => first - second)
  .map((value) => ({
    value: String(value),
    label: `${value} BHK${value >= 5 ? '+' : ''}`,
  }));

const getRoundedBudgetMax = (prices) => {
  const maxPrice = Math.max(
    0,
    ...prices.map((price) => Number(price)).filter((price) => Number.isFinite(price))
  );

  return Math.max(
    DEFAULT_BUDGET_MAX,
    Math.ceil(maxPrice / BUDGET_STEP) * BUDGET_STEP
  );
};

const propertyMatchesBhk = (property, requestedBhk) => {
  if (!requestedBhk) return true;
  if (parseInt(property.bhk, 10) === requestedBhk) return true;
  return getFloorPlanBhks(property.floorPlans || []).includes(requestedBhk);
};

const getPropertyPriceValues = (property) => [
  parsePriceInput(property.price),
  parsePriceInput(property.originalPrice),
  ...getFloorPlanPrices(property.floorPlans || []),
].filter((price) => Number.isFinite(price) && price > 0);

// GET /api/properties - List all properties with filters
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    await ensurePropertyDetailFields();
    await ensurePropertyStatuses();
    const {
      city,
      locality,
      bhk,
      minPrice,
      maxPrice,
      developer,
      developerName,
      status,
      propertyStatusId,
      featured,
      category,
      displaySection,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const where = {};
    const include = {
      developer: { select: { id: true, name: true, logoUrl: true } },
      propertyStatus: { select: { id: true, name: true } },
      _count: { select: { groups: true } },
      groups: {
        where: { status: { in: ['OPEN', 'FULL', 'NEGOTIATING'] } },
        include: {
          _count: { select: { members: { where: { isActive: true } } } },
          members: {
            where: { isActive: true },
            include: { user: { select: { id: true, name: true, avatar: true, city: true } } },
            orderBy: { joinedAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    };

    const requestedBhk = bhk ? parseInt(bhk, 10) : null;

    if (city) where.city = { contains: city };
    if (locality) where.locality = { contains: locality };
    if (status) {
      where.status = status;
    } else {
      // By default, exclude INACTIVE and SOLD if you want, but for now let's just allow all
      // where.status = { notIn: ['INACTIVE', 'SOLD'] };
    }
    if (propertyStatusId) where.propertyStatusId = propertyStatusId;
    if (category) where.category = category;
    if (featured === 'true') where.isFeatured = true;
    if (developer) where.developerId = developer;
    if (developerName) {
      where.developer = {
        is: {
          name: { contains: developerName },
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { locality: { contains: search } },
        { city: { contains: search } },
        {
          developer: {
            is: {
              name: { contains: search },
            },
          },
        },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Add displaySection filter if provided
    if (displaySection && DISPLAY_SECTIONS.includes(displaySection)) {
      where.displaySection = displaySection;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);
    const orderBy = displaySection ? getDisplaySectionOrderBy(displaySection) : DEFAULT_ORDER_BY;

    let properties;
    let total;

    if (displaySection || requestedBhk) {
      const allProperties = await db.property.findMany({
        where,
        include,
        orderBy,
      });
      const sectionFilteredProperties = displaySection ? filterPropertiesByDisplaySection(allProperties, displaySection) : allProperties;
      const filteredProperties = sectionFilteredProperties.filter((property) => propertyMatchesBhk(property, requestedBhk));

      total = filteredProperties.length;
      properties = filteredProperties.slice(skip, skip + parsedLimit);
    } else {
      [properties, total] = await Promise.all([
        db.property.findMany({
          where,
          include,
          orderBy,
          skip,
          take: parsedLimit,
        }),
        db.property.count({ where }),
      ]);
    }

    res.json({
      success: true,
      properties,
      pagination: { page: parseInt(page), limit: parsedLimit, total, pages: Math.ceil(total / parsedLimit) },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/properties/filter-options - Dynamic homepage/search filter data
router.get('/filter-options', async (req, res, next) => {
  try {
    await ensurePropertyDetailFields();
    await ensurePropertyStatuses();

    const properties = await db.property.findMany({
      select: {
        city: true,
        locality: true,
        category: true,
        bhk: true,
        price: true,
        originalPrice: true,
        floorPlans: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const configurationValues = properties.flatMap((property) => [
      property.bhk,
      ...getFloorPlanBhks(property.floorPlans || []),
    ]);
    const budgetValues = properties.flatMap(getPropertyPriceValues);
    const records = properties.flatMap((property) => {
      const bhkValues = [...new Set([
        property.bhk,
        ...getFloorPlanBhks(property.floorPlans || []),
      ].filter(Boolean).map(String))];
      const baseRecord = {
        city: cleanTextValue(property.city),
        locality: cleanTextValue(property.locality),
        category: cleanTextValue(property.category),
      };

      return (bhkValues.length ? bhkValues : ['']).map((propertyBhk) => ({
        ...baseRecord,
        bhk: propertyBhk,
      }));
    });

    res.json({
      success: true,
      options: {
        cities: uniqueSortedValues(properties.map((property) => property.city)),
        locations: buildLocationOptions(properties),
        propertyTypes: buildTextOptions([
          ...SUPPORTED_PROPERTY_TYPES,
          ...properties.map((property) => property.category),
        ]),
        configurations: buildBhkOptions(configurationValues),
        budget: {
          minPrice: 0,
          maxPrice: getRoundedBudgetMax(budgetValues),
          step: BUDGET_STEP,
        },
        records,
      },
    });
  } catch (error) { next(error); }
});

// GET /api/properties/developers - Public list
router.get('/developers', async (req, res, next) => {
  try {
    const developers = await db.developer.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, developers });
  } catch (error) { next(error); }
});

// GET /api/properties/property-statuses - Public status list
router.get('/property-statuses', async (req, res, next) => {
  try {
    await ensurePropertyStatuses();
    const statuses = await db.propertyStatus.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, statuses });
  } catch (error) { next(error); }
});

// GET /api/properties/project-videos - Public list
router.get('/project-videos', async (req, res, next) => {
  try {
    await ensurePropertyDetailFields();
    await ensurePropertyStatuses();
    const projectVideos = await db.projectVideo.findMany({
      where: { isActive: true },
      include: {
        property: {
          include: {
            developer: { select: { id: true, name: true, logoUrl: true } },
            propertyStatus: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { order: 'asc' }
    });
    res.json({ success: true, projectVideos });
  } catch (error) { next(error); }
});

// GET /api/properties/suggest/smart - Smart matching
router.get('/suggest/smart', authenticate, async (req, res, next) => {
  try {
    await ensurePropertyDetailFields();
    await ensurePropertyStatuses();
    const user = await db.user.findUnique({ where: { id: req.user.id } });
    const where = { status: 'ACTIVE' };

    if (user.city) where.city = { contains: user.city };
    if (user.budget) {
      where.price = { lte: parseFloat(user.budget) * 1.2 };
    }

    const properties = await db.property.findMany({
      where,
      include: {
        developer: { select: { id: true, name: true } },
        propertyStatus: { select: { id: true, name: true } },
        groups: {
          where: { status: { in: ['OPEN', 'FULL', 'NEGOTIATING'] } },
          include: {
            _count: { select: { members: { where: { isActive: true } } } },
            members: {
              where: { isActive: true },
              include: { user: { select: { id: true, name: true, avatar: true, city: true } } },
              orderBy: { joinedAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      take: 6,
      orderBy: { isFeatured: 'desc' },
    });

    res.json({ success: true, properties });
  } catch (error) {
    next(error);
  }
});

// GET /api/properties/:id - Single property
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    await ensurePropertyDetailFields();
    await ensurePropertyStatuses();
    const property = await db.property.findUnique({
      where: { id: req.params.id },
      include: {
        developer: true,
        propertyStatus: true,
        groups: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, avatar: true, city: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.json({ success: true, property });
  } catch (error) {
    next(error);
  }
});

// POST /api/properties - Create property (Admin only)
router.post('/', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res, next) => {
  try {
    await ensurePropertyDetailFields();
    await ensurePropertyStatuses();
    const data = preparePropertyData(req.body);

    const property = await db.property.create({ data });

    // Notify all clients to refresh property lists
    const io = req.app.get('io');
    if (io) io.emit('property-added', { propertyId: property.id });

    res.status(201).json({ success: true, property });
  } catch (error) { next(error); }
});

// PUT /api/properties/:id - Update property (Admin only)
router.put('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res, next) => {
  try {
    await ensurePropertyDetailFields();
    await ensurePropertyStatuses();
    const data = preparePropertyData(req.body);

    const property = await db.property.update({
      where: { id: req.params.id },
      data,
    });

    // Notify all clients to refresh this specific property
    const io = req.app.get('io');
    if (io) io.emit('property-updated', { propertyId: property.id });

    res.json({ success: true, property });
  } catch (error) { next(error); }
});

// DELETE /api/properties/:id - Delete property (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPERADMIN'), async (req, res, next) => {
  try {
    await db.property.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
