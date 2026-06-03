const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:Chirag30kum%40r@localhost:3306/groupbuying';

const pool = mysql.createPool({
  uri: databaseUrl,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
  dateStrings: false,
});

const models = {
  user: { table: 'users', json: [], bool: ['isVerified', 'isActive'], updatedAt: true },
  admin: { table: 'admins', json: ['permissions'], bool: ['isActive'], updatedAt: true },
  oTP: { table: 'otps', json: [], bool: ['isUsed'] },
  developer: { table: 'developers', json: [], bool: ['isActive'], updatedAt: true },
  propertyStatus: { table: 'property_statuses', json: [], bool: ['isActive'], updatedAt: true },
  property: { table: 'properties', json: ['amenities', 'images'], bool: ['isFeatured'], updatedAt: true },
  group: { table: 'groups', json: [], bool: [], updatedAt: true },
  groupMember: { table: 'group_members', json: [], bool: ['isActive'] },
  lead: { table: 'leads', json: [], bool: ['isContacted'], updatedAt: true },
  blog: { table: 'blogs', json: ['tags'], bool: ['isPublished'], updatedAt: true },
  testimonial: { table: 'testimonials', json: [], bool: ['isActive'], updatedAt: true },
  caseStudy: { table: 'case_studies', json: [], bool: ['isPublished'], updatedAt: true },
  fAQ: { table: 'faqs', json: [], bool: ['isActive'], updatedAt: true },
  subscription: { table: 'subscriptions', json: [], bool: [], updatedAt: true },
  subscriptionPlan: { table: 'subscription_plans', json: [], bool: ['isActive'], updatedAt: true },
  rMAssignment: { table: 'rm_assignments', json: [], bool: [] },
  siteSettings: { table: 'site_settings', json: [], bool: [], updatedAt: true },
  notification: { table: 'notifications', json: [], bool: ['isRead'] },
  wishlist: { table: 'wishlists', json: [], bool: [] },
  projectVideo: { table: 'project_videos', json: [], bool: ['isActive', 'isFeatured'], updatedAt: true },
  comparison: { table: 'comparisons', json: [], bool: [] },
};

const relations = {
  user: {
    groupMembers: { type: 'many', model: 'groupMember', local: 'id', foreign: 'userId' },
    wishlist: { type: 'many', model: 'wishlist', local: 'id', foreign: 'userId' },
    comparisons: { type: 'many', model: 'comparison', local: 'id', foreign: 'userId' },
    subscriptions: { type: 'many', model: 'subscription', local: 'id', foreign: 'userId' },
    assignedRM: { type: 'many', model: 'rMAssignment', local: 'id', foreign: 'userId' },
    rmOf: { type: 'many', model: 'rMAssignment', local: 'id', foreign: 'rmId' },
  },
  property: {
    developer: { type: 'one', model: 'developer', local: 'developerId', foreign: 'id' },
    propertyStatus: { type: 'one', model: 'propertyStatus', local: 'propertyStatusId', foreign: 'id' },
    groups: { type: 'many', model: 'group', local: 'id', foreign: 'propertyId' },
    videos: { type: 'many', model: 'projectVideo', local: 'id', foreign: 'propertyId' },
    wishlistedBy: { type: 'many', model: 'wishlist', local: 'id', foreign: 'propertyId' },
    comparedBy: { type: 'many', model: 'comparison', local: 'id', foreign: 'propertyId' },
  },
  developer: {
    properties: { type: 'many', model: 'property', local: 'id', foreign: 'developerId' },
  },
  propertyStatus: {
    properties: { type: 'many', model: 'property', local: 'id', foreign: 'propertyStatusId' },
  },
  group: {
    property: { type: 'one', model: 'property', local: 'propertyId', foreign: 'id' },
    members: { type: 'many', model: 'groupMember', local: 'id', foreign: 'groupId' },
  },
  groupMember: {
    group: { type: 'one', model: 'group', local: 'groupId', foreign: 'id' },
    user: { type: 'one', model: 'user', local: 'userId', foreign: 'id' },
  },
  lead: {
    user: { type: 'one', model: 'user', local: 'userId', foreign: 'id' },
  },
  testimonial: {
    user: { type: 'one', model: 'user', local: 'userId', foreign: 'id' },
  },
  subscription: {
    user: { type: 'one', model: 'user', local: 'userId', foreign: 'id' },
  },
  rMAssignment: {
    user: { type: 'one', model: 'user', local: 'userId', foreign: 'id' },
    rm: { type: 'one', model: 'user', local: 'rmId', foreign: 'id' },
  },
  wishlist: {
    property: { type: 'one', model: 'property', local: 'propertyId', foreign: 'id' },
    user: { type: 'one', model: 'user', local: 'userId', foreign: 'id' },
  },
  comparison: {
    property: { type: 'one', model: 'property', local: 'propertyId', foreign: 'id' },
    user: { type: 'one', model: 'user', local: 'userId', foreign: 'id' },
  },
  projectVideo: {
    property: { type: 'one', model: 'property', local: 'propertyId', foreign: 'id' },
  },
  oTP: {},
};

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);
const quote = (name) => `\`${name}\``;

const normalizeValue = (modelName, field, value) => {
  if (value === undefined) return undefined;
  if (models[modelName].json.includes(field)) {
    return value === null || typeof value === 'string' ? value : JSON.stringify(value);
  }
  if (models[modelName].bool.includes(field)) return value ? 1 : 0;
  // Convert Date objects and ISO strings to MySQL-compatible format
  if (value instanceof Date) {
    return value.toISOString().slice(0, 19).replace('T', ' ');
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 19).replace('T', ' ');
  }
  return value;
};

const normalizeRow = (modelName, row) => {
  if (!row) return row;
  const model = models[modelName];
  const out = { ...row };
  for (const field of model.json) {
    if (typeof out[field] === 'string') {
      try { out[field] = JSON.parse(out[field]); } catch { /* keep original string */ }
    }
  }
  for (const field of model.bool) {
    if (field in out) out[field] = Boolean(out[field]);
  }
  return out;
};

const flattenWhere = (where = {}) => {
  const entries = Object.entries(where);
  if (entries.length === 1) {
    const [key, value] = entries[0];
    if (key.includes('_') && isObject(value)) return value;
  }
  return where;
};

const buildWhere = (modelName, where = {}, alias = null) => {
  where = flattenWhere(where);
  const clauses = [];
  const params = [];
  const prefix = alias ? `${quote(alias)}.` : '';

  for (const [field, value] of Object.entries(where || {})) {
    if (value === undefined) continue;
    if (field === 'OR' && Array.isArray(value)) {
      const parts = value.map((item) => buildWhere(modelName, item, alias)).filter((part) => part.sql);
      if (parts.length) {
        clauses.push(`(${parts.map((part) => part.sql).join(' OR ')})`);
        parts.forEach((part) => params.push(...part.params));
      }
      continue;
    }

    const relation = relations[modelName]?.[field];
    if (relation && isObject(value)) {
      const relationWhere = value.is || value;
      const related = models[relation.model];
      const relatedWhere = buildWhere(relation.model, relationWhere, 'r');
      if (relation.type === 'one') {
        clauses.push(`${prefix}${quote(relation.local)} IN (SELECT ${quote('r')}.${quote(relation.foreign)} FROM ${quote(related.table)} ${quote('r')}${relatedWhere.sql ? ` WHERE ${relatedWhere.sql}` : ''})`);
      } else {
        clauses.push(`EXISTS (SELECT 1 FROM ${quote(related.table)} ${quote('r')} WHERE ${quote('r')}.${quote(relation.foreign)} = ${prefix}${quote(relation.local)}${relatedWhere.sql ? ` AND ${relatedWhere.sql}` : ''})`);
      }
      params.push(...relatedWhere.params);
      continue;
    }

    const column = `${prefix}${quote(field)}`;
    if (value === null) {
      clauses.push(`${column} IS NULL`);
    } else if (isObject(value)) {
      for (const [op, opValue] of Object.entries(value)) {
        if (opValue === undefined) continue;
        if (op === 'contains') {
          clauses.push(`${column} LIKE ?`);
          params.push(`%${opValue}%`);
        } else if (op === 'string_contains') {
          clauses.push(`CAST(${column} AS CHAR) LIKE ?`);
          params.push(`%${opValue}%`);
        } else if (op === 'gte') {
          clauses.push(`${column} >= ?`);
          params.push(normalizeValue(modelName, field, opValue));
        } else if (op === 'lte') {
          clauses.push(`${column} <= ?`);
          params.push(normalizeValue(modelName, field, opValue));
        } else if (op === 'gt') {
          clauses.push(`${column} > ?`);
          params.push(normalizeValue(modelName, field, opValue));
        } else if (op === 'lt') {
          clauses.push(`${column} < ?`);
          params.push(normalizeValue(modelName, field, opValue));
        } else if (op === 'in' && Array.isArray(opValue)) {
          clauses.push(`${column} IN (${opValue.map(() => '?').join(', ')})`);
          params.push(...opValue.map(v => normalizeValue(modelName, field, v)));
        } else if (op === 'notIn' && Array.isArray(opValue)) {
          clauses.push(`${column} NOT IN (${opValue.map(() => '?').join(', ')})`);
          params.push(...opValue.map(v => normalizeValue(modelName, field, v)));
        }
      }
    } else {
      clauses.push(`${column} = ?`);
      params.push(normalizeValue(modelName, field, value));
    }
  }

  return { sql: clauses.join(' AND '), params };
};

const buildOrder = (orderBy) => {
  if (!orderBy) return '';
  const items = Array.isArray(orderBy) ? orderBy : [orderBy];
  const parts = [];
  for (const item of items) {
    for (const [field, direction] of Object.entries(item)) {
      if (field === '_count') continue;
      parts.push(`${quote(field)} ${String(direction).toUpperCase() === 'ASC' ? 'ASC' : 'DESC'}`);
    }
  }
  return parts.length ? ` ORDER BY ${parts.join(', ')}` : '';
};

const selectColumns = (select) => {
  if (!select) return '*';
  const fields = Object.entries(select)
    .filter(([, value]) => value === true)
    .map(([field]) => quote(field));
  return fields.length ? fields.join(', ') : '*';
};

const applySelection = async (modelName, row, options = {}) => {
  if (!row) return row;
  let result = normalizeRow(modelName, row);
  const select = options.select;
  if (select) {
    const selected = {};
    for (const [field, config] of Object.entries(select)) {
      if (config === true && field in result) selected[field] = result[field];
    }
    result = selected;
  }

  const relationOptions = { ...(options.include || {}) };
  if (select) {
    for (const [field, config] of Object.entries(select)) {
      if (isObject(config)) relationOptions[field] = config;
    }
  }

  if (relationOptions._count) {
    result._count = await countRelations(modelName, row, relationOptions._count.select || {});
    delete relationOptions._count;
  }

  for (const [name, config] of Object.entries(relationOptions)) {
    const relation = relations[modelName]?.[name];
    if (!relation) continue;
    result[name] = await loadRelation(relation, row, config === true ? {} : config);
  }
  return result;
};

const countRelations = async (modelName, row, select = {}) => {
  const counts = {};
  for (const [name, config] of Object.entries(select)) {
    const relation = relations[modelName]?.[name];
    if (!relation || relation.type !== 'many') continue;
    const where = { [relation.foreign]: row[relation.local], ...(isObject(config) ? config.where || {} : {}) };
    counts[name] = await client[relation.model].count({ where });
  }
  return counts;
};

const loadRelation = async (relation, row, config = {}) => {
  if (relation.type === 'one') {
    if (row[relation.local] === undefined || row[relation.local] === null || row[relation.local] === '') return null;
    return client[relation.model].findUnique({
      where: { [relation.foreign]: row[relation.local] },
      select: config.select,
      include: config.include,
    });
  }
  const where = { [relation.foreign]: row[relation.local], ...(config.where || {}) };
  return client[relation.model].findMany({
    where,
    select: config.select,
    include: config.include,
    orderBy: config.orderBy,
    skip: config.skip,
    take: config.take,
  });
};

const cleanData = (modelName, data = {}, forUpdate = false) => {
  const out = {};
  for (const [field, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (relations[modelName]?.[field] || field === '_count') continue;
    out[field] = normalizeValue(modelName, field, value);
  }
  if (!forUpdate && !('id' in out)) out.id = uuidv4();
  if (models[modelName].updatedAt) out.updatedAt = new Date();
  return out;
};

const makeModel = (modelName) => {
  const model = models[modelName];

  return {
    async findMany(options = {}) {
      const where = buildWhere(modelName, options.where);
      const limit = Number.isInteger(options.take) ? ` LIMIT ${options.take}` : '';
      const offset = Number.isInteger(options.skip) ? ` OFFSET ${options.skip}` : '';
      const sql = `SELECT ${selectColumns(options.select)} FROM ${quote(model.table)}${where.sql ? ` WHERE ${where.sql}` : ''}${buildOrder(options.orderBy)}${limit}${offset}`;
      const [rows] = await pool.execute(sql, where.params);
      return Promise.all(rows.map((row) => applySelection(modelName, row, options)));
    },

    async findFirst(options = {}) {
      const rows = await this.findMany({ ...options, take: 1 });
      return rows[0] || null;
    },

    async findUnique(options = {}) {
      return this.findFirst(options);
    },

    async count(options = {}) {
      const where = buildWhere(modelName, options.where);
      const sql = `SELECT COUNT(*) AS total FROM ${quote(model.table)}${where.sql ? ` WHERE ${where.sql}` : ''}`;
      const [rows] = await pool.execute(sql, where.params);
      return rows[0]?.total || 0;
    },

    async create(options = {}) {
      const data = cleanData(modelName, options.data || {});
      const fields = Object.keys(data);
      const sql = `INSERT INTO ${quote(model.table)} (${fields.map(quote).join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;
      await pool.execute(sql, fields.map((field) => data[field]));
      return this.findUnique({ where: { id: data.id }, select: options.select, include: options.include });
    },

    async createMany(options = {}) {
      const data = options.data || [];
      for (const item of data) await this.create({ data: item });
      return { count: data.length };
    },

    async update(options = {}) {
      const data = cleanData(modelName, options.data || {}, true);
      const fields = Object.keys(data);
      if (!fields.length) return this.findUnique({ where: options.where, select: options.select, include: options.include });
      const where = buildWhere(modelName, options.where);
      const sql = `UPDATE ${quote(model.table)} SET ${fields.map((field) => `${quote(field)} = ?`).join(', ')}${where.sql ? ` WHERE ${where.sql}` : ''}`;
      await pool.execute(sql, [...fields.map((field) => data[field]), ...where.params]);
      return this.findUnique({ where: options.where, select: options.select, include: options.include });
    },

    async updateMany(options = {}) {
      const data = cleanData(modelName, options.data || {}, true);
      const fields = Object.keys(data);
      if (!fields.length) return { count: 0 };
      const where = buildWhere(modelName, options.where);
      const sql = `UPDATE ${quote(model.table)} SET ${fields.map((field) => `${quote(field)} = ?`).join(', ')}${where.sql ? ` WHERE ${where.sql}` : ''}`;
      const [result] = await pool.execute(sql, [...fields.map((field) => data[field]), ...where.params]);
      return { count: result.affectedRows || 0 };
    },

    async delete(options = {}) {
      const existing = await this.findUnique({ where: options.where });
      const where = buildWhere(modelName, options.where);
      await pool.execute(`DELETE FROM ${quote(model.table)}${where.sql ? ` WHERE ${where.sql}` : ''}`, where.params);
      return existing;
    },

    async deleteMany(options = {}) {
      const where = buildWhere(modelName, options.where);
      const [result] = await pool.execute(`DELETE FROM ${quote(model.table)}${where.sql ? ` WHERE ${where.sql}` : ''}`, where.params);
      return { count: result.affectedRows || 0 };
    },

    async upsert(options = {}) {
      const existing = await this.findUnique({ where: options.where });
      if (existing) return this.update({ where: options.where, data: options.update || {}, select: options.select, include: options.include });
      return this.create({ data: { ...flattenWhere(options.where || {}), ...(options.create || {}) }, select: options.select, include: options.include });
    },

    async groupBy(options = {}) {
      const by = options.by || [];
      const where = buildWhere(modelName, options.where);
      const columns = by.map(quote).join(', ');
      let order = '';
      if (options.orderBy?._count) {
        const direction = Object.values(options.orderBy._count)[0] === 'asc' ? 'ASC' : 'DESC';
        order = ` ORDER BY _count_id ${direction}`;
      }
      const limit = Number.isInteger(options.take) ? ` LIMIT ${options.take}` : '';
      const sql = `SELECT ${columns}, COUNT(*) AS _count_id FROM ${quote(model.table)}${where.sql ? ` WHERE ${where.sql}` : ''} GROUP BY ${columns}${order}${limit}`;
      const [rows] = await pool.execute(sql, where.params);
      return rows.map((row) => {
        const out = {};
        by.forEach((field) => { out[field] = row[field]; });
        out._count = { id: row._count_id };
        return out;
      });
    },
  };
};

const client = Object.fromEntries(Object.keys(models).map((modelName) => [modelName, makeModel(modelName)]));

client.$executeRawUnsafe = async (sql, ...params) => {
  const [result] = await pool.query(sql, params);
  return result.affectedRows || 0;
};
client.$queryRawUnsafe = async (sql, ...params) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};
client.$disconnect = async () => pool.end();
client.pool = pool;

module.exports = client;
