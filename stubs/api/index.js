const router = require('express').Router();
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const timer = (time = 300) => (req, res, next) => setTimeout(next, time);

// JWT Secret Key (in production, should be from environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Admin password hash (bcrypt). Default: hash of 'admin123'
// To generate new: node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('YOUR_ADMIN_PASSWORD', 12).then(console.log)"
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$12$REucL0GH7UG8g/AyrgKW4Od7SPFRGzSPyKU.Wd2is5a3qUEr8ArIC';

// Collections for audit logging
let auditLog;
let importLog;

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'workspace-finder';
const COLLECTION_NAME = 'workplaces';

let db;
let collection;
let mongoConnected = false;

// Test data for seeding
const testData = [
  // Блок 5.А.01
  {
    placeNumber: "5.А.01.001",
    placeName: "5.А.01.001",
    zone: "Open space 1",
    blockCode: "5.А.01",
    type: "Openspace",
    category: "Основное",
    employeeName: "Иванов Иван Иванович",
    tabNumber: "001",
    department: "Департамент ИТ блока 'Сеть продаж'",
    team: "SberGeo",
    position: "Ведущий инженер по разработке",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "5.А.01.002",
    placeName: "5.А.01.002",
    zone: "Open space 1",
    blockCode: "5.А.01",
    type: "Openspace",
    category: "Основное",
    employeeName: "Петров Петр Петрович",
    tabNumber: "002",
    department: "Департамент ИТ блока 'Сеть продаж'",
    team: "SberPay",
    position: "Старший разработчик",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "5.А.01.003",
    placeName: "5.А.01.003",
    zone: "Open space 1",
    blockCode: "5.А.01",
    type: "Openspace",
    category: "Основное",
    employeeName: "Сидоров Алексей Михайлович",
    tabNumber: "003",
    department: "Департамент информационной безопасности",
    team: "Security",
    position: "Аналитик безопасности",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "5.А.01.004",
    placeName: "5.А.01.004",
    zone: "Open space 1",
    blockCode: "5.А.01",
    type: "Openspace",
    category: "Основное",
    employeeName: "",
    tabNumber: "",
    department: "",
    team: "",
    position: "",
    status: "free",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Блок 5.А.02
  {
    placeNumber: "5.А.02.001",
    placeName: "5.А.02.001",
    zone: "Open space 2",
    blockCode: "5.А.02",
    type: "Openspace",
    category: "Основное",
    employeeName: "Кузнецова Мария Сергеевна",
    tabNumber: "004",
    department: "Департамент маркетинга",
    team: "Digital Marketing",
    position: "Маркетолог",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "5.А.02.002",
    placeName: "5.А.02.002",
    zone: "Open space 2",
    blockCode: "5.А.02",
    type: "Openspace",
    category: "Основное",
    employeeName: "Волкова Ольга Дмитриевна",
    tabNumber: "005",
    department: "Департамент маркетинга",
    team: "Brand",
    position: "Бренд-менеджер",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "5.А.02.003",
    placeName: "5.А.02.003",
    zone: "Open space 2",
    blockCode: "5.А.02",
    type: "Openspace",
    category: "Основное",
    employeeName: "Соколова Анна Александровна",
    tabNumber: "006",
    department: "Департамент HR",
    team: "Recruiting",
    position: "Рекрутер",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Блок 5.В.01
  {
    placeNumber: "5.В.01.056",
    placeName: "5.В.01.056",
    zone: "Open space 29",
    blockCode: "5.В.01",
    type: "Openspace",
    category: "Основное",
    employeeName: "Морозов Дмитрий Андреевич",
    tabNumber: "007",
    department: "Департамент разработки",
    team: "Backend",
    position: "Senior Backend Developer",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "5.В.01.057",
    placeName: "5.В.01.057",
    zone: "Open space 29",
    blockCode: "5.В.01",
    type: "Openspace",
    category: "Основное",
    employeeName: "Новиков Сергей Викторович",
    tabNumber: "008",
    department: "Департамент разработки",
    team: "Frontend",
    position: "Senior Frontend Developer",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "5.В.01.058",
    placeName: "5.В.01.058",
    zone: "Open space 29",
    blockCode: "5.В.01",
    type: "Openspace",
    category: "Основное",
    employeeName: "Федоров Александр Павлович",
    tabNumber: "009",
    department: "Департамент QA",
    team: "Automation",
    position: "QA Automation Engineer",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Блок 5.В.02
  {
    placeNumber: "5.В.02.001",
    placeName: "5.В.02.001",
    zone: "Open space 30",
    blockCode: "5.В.02",
    type: "Openspace",
    category: "Основное",
    employeeName: "Смирнова Елена Борисовна",
    tabNumber: "010",
    department: "Департамент аналитики",
    team: "Data Science",
    position: "Data Scientist",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "5.В.02.002",
    placeName: "5.В.02.002",
    zone: "Open space 30",
    blockCode: "5.В.02",
    type: "Openspace",
    category: "Основное",
    employeeName: "Попова Татьяна Ивановна",
    tabNumber: "011",
    department: "Департамент аналитики",
    team: "BI",
    position: "BI Analyst",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "5.В.02.003",
    placeName: "5.В.02.003",
    zone: "Open space 30",
    blockCode: "5.В.02",
    type: "Openspace",
    category: "Основное",
    employeeName: "Васильева Наталья Сергеевна",
    tabNumber: "012",
    department: "Департамент финансов",
    team: "Accounting",
    position: "Финансовый аналитик",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Коворкинги
  {
    placeNumber: "C.01.001",
    placeName: "C.01.001",
    zone: "Coworking Zone 1",
    blockCode: "C.01",
    type: "Coworking",
    coworkingType: "Coworking-1",
    category: "Коворкинг",
    employeeName: "Романов Павел Игоревич",
    tabNumber: "013",
    department: "Департамент ИТ",
    team: "Platform",
    position: "DevOps Engineer",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "C.01.002",
    placeName: "C.01.002",
    zone: "Coworking Zone 1",
    blockCode: "C.01",
    type: "Coworking",
    coworkingType: "Coworking-1",
    category: "Коворкинг",
    employeeName: "",
    tabNumber: "",
    department: "",
    team: "",
    position: "",
    status: "free",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "C.01.003",
    placeName: "C.01.003",
    zone: "Coworking Zone 1",
    blockCode: "C.01",
    type: "Coworking",
    coworkingType: "Coworking-1",
    category: "Коворкинг",
    employeeName: "Егорова Марина Алексеевна",
    tabNumber: "014",
    department: "Департамент маркетинга",
    team: "Digital",
    position: "Маркетолог",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "C.02.001",
    placeName: "C.02.001",
    zone: "Coworking Zone 2",
    blockCode: "C.02",
    type: "Coworking",
    coworkingType: "Coworking-2",
    category: "Коворкинг",
    employeeName: "",
    tabNumber: "",
    department: "",
    team: "",
    position: "",
    status: "free",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    placeNumber: "C.02.002",
    placeName: "C.02.002",
    zone: "Coworking Zone 2",
    blockCode: "C.02",
    type: "Coworking",
    coworkingType: "Coworking-2",
    category: "Коворкинг",
    employeeName: "Лебедев Николай Сергеевич",
    tabNumber: "015",
    department: "Департамент аналитики",
    team: "Analytics",
    position: "Data Analyst",
    status: "occupied",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// In-memory fallback data
const fallbackWorkplaces = testData.map((doc, idx) => ({
  _id: { toString: () => String(idx + 1) },
  ...doc
}));

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    
    await client.connect();
    console.log('Connected to MongoDB');
    
    db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);
    auditLog = db.collection('audit_log');
    importLog = db.collection('import_log');
    mongoConnected = true;
    
    // Create indexes for performance
    await collection.createIndex({ placeNumber: 1 });
    await collection.createIndex({ employeeName: 1 });
    await collection.createIndex({ blockCode: 1 });
    
    // Create audit log indexes
    await auditLog.createIndex({ timestamp: 1 });
    await auditLog.createIndex({ eventType: 1 });
    
    // Create import log indexes
    await importLog.createIndex({ timestamp: 1 });
    
    console.log('Indexes created');
    
    // Initialize data if collection is empty
    const count = await collection.countDocuments();
    if (count === 0) {
      await seedDatabase();
    }
    
    return db;
  } catch (error) {
    console.warn('MongoDB connection failed, using in-memory fallback:', error.message);
    mongoConnected = false;
  }
}

// Seed database with test data
async function seedDatabase() {
  try {
    await collection.insertMany(testData);
    console.log(`Seeded ${testData.length} workplaces`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Helper function to get collection (MongoDB or fallback)
function getCollection() {
  if (mongoConnected && collection) {
    return collection;
  }
  // Return a mock collection interface for fallback
  return {
    find: (query) => ({
      toArray: async () => {
        if (query.employeeName) {
          const regex = new RegExp(query.employeeName.$regex, query.employeeName.$options);
          return fallbackWorkplaces.filter(doc => {
            const nameMatch = regex.test(doc.employeeName);
            const statusMatch = !query.status || doc.status === query.status;
            return nameMatch && statusMatch;
          });
        } else if (query.placeNumber) {
          const regex = new RegExp(query.placeNumber.$regex, query.placeNumber.$options);
          return fallbackWorkplaces.filter(doc => regex.test(doc.placeNumber));
        }
        return fallbackWorkplaces;
      }
    }),
    aggregate: (pipeline) => ({
      toArray: async () => {
        // Simple aggregation fallback for grouping by blockCode
        const grouped = {};
        fallbackWorkplaces.forEach(doc => {
          if (!grouped[doc.blockCode]) {
            grouped[doc.blockCode] = {
              _id: doc.blockCode,
              code: doc.blockCode,
              name: doc.blockCode,
              places: [],
              total: 0,
              occupied: 0
            };
          }
          grouped[doc.blockCode].places.push(doc);
          grouped[doc.blockCode].total++;
          if (doc.status === 'occupied') {
            grouped[doc.blockCode].occupied++;
          }
        });
        return Object.values(grouped).sort((a, b) => {
          if (!a.code || !b.code) return 0;
          return a.code.localeCompare(b.code);
        });
      }
    })
  };
}

// Middleware to parse cookies
router.use((req, res, next) => {
  const cookieHeader = req.get('cookie');
  req.cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        req.cookies[key] = decodeURIComponent(value);
      }
    });
  }
  next();
});

// API endpoints

// Поиск по ФИО или номеру места
router.get('/search', async (req, res) => {
  try {
    const { type, q } = req.query;

    if (!q || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing query parameters: type and q are required'
      });
    }

    let query = {};

    if (type === 'name') {
      // Search by employee name (case-insensitive, occupied only)
      query = {
        employeeName: { $regex: q, $options: 'i' },
        status: 'occupied'
      };
    } else if (type === 'place') {
      // Search by place number (case-insensitive)
      query = {
        placeNumber: { $regex: q, $options: 'i' }
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid type parameter. Use "name" or "place"'
      });
    }

    const coll = getCollection();
    const results = await coll.find(query).toArray();

    res.json({
      success: true,
      count: results.length,
      results: results.map(doc => ({
        id: typeof doc._id === 'string' ? doc._id : doc._id.toString(),
        ...doc
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Получить все места по блокам
router.get('/workplaces', async (req, res) => {
  try {
    const { view } = req.query;

    if (view !== 'table') {
      return res.status(400).json({
        success: false,
        error: 'Only table view is supported'
      });
    }

    // Use aggregation to group by blockCode
    const coll = getCollection();
    const pipeline = [
      {
        $group: {
          _id: '$blockCode',
          code: { $first: '$blockCode' },
          name: { $first: '$blockCode' },
          places: { $push: '$$ROOT' },
          total: { $sum: 1 },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { code: 1 }
      }
    ];

    const blocks = await coll.aggregate(pipeline).toArray();

    res.json({
      success: true,
      blocks: blocks
    });
  } catch (error) {
    console.error('Workplaces error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Получить список коворкингов
router.get('/coworkings', async (req, res) => {
  try {
    const coll = getCollection();
    const coworkingPlaces = await coll.find({ type: 'Coworking' }).toArray();

    coworkingPlaces.sort((a, b) => {
      const typeCompare = (a.coworkingType || '').localeCompare(b.coworkingType || '');
      if (typeCompare !== 0) {
        return typeCompare;
      }
      return (a.placeNumber || '').localeCompare(b.placeNumber || '');
    });

    const coworkingsMap = new Map();

    coworkingPlaces.forEach(place => {
      const coworkingName = place.coworkingType || 'Unknown';

      if (!coworkingsMap.has(coworkingName)) {
        coworkingsMap.set(coworkingName, {
          id: coworkingName.toLowerCase().replace(/\s+/g, '-'),
          name: coworkingName,
          total: 0,
          occupied: 0,
          places: []
        });
      }

      const coworking = coworkingsMap.get(coworkingName);
      coworking.total += 1;

      if (place.status === 'occupied' && place.employeeName) {
        coworking.occupied += 1;
        const placeId = typeof place._id === 'string'
          ? place._id
          : place._id?.toString?.() || place.id || place.placeNumber;

        coworking.places.push({
          id: placeId,
          placeNumber: place.placeNumber,
          employeeName: place.employeeName,
          department: place.department || '',
          team: place.team || ''
        });
      }
    });

    const coworkings = Array.from(coworkingsMap.values()).map(coworking => ({
      ...coworking,
      places: coworking.places.sort((a, b) => a.placeNumber.localeCompare(b.placeNumber))
    })).sort((a, b) => a.name.localeCompare(b.name));

    const totalOccupied = coworkings.reduce((sum, coworking) => sum + coworking.occupied, 0);
    const total = coworkings.reduce((sum, coworking) => sum + coworking.total, 0);

    res.json({
      success: true,
      total,
      totalOccupied,
      coworkings
    });
  } catch (error) {
    console.error('Coworkings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coworkings'
    });
  }
});

// Получить список зон
router.get('/zones', async (req, res) => {
  try {
    if (mongoConnected && collection) {
      const zonesResult = await collection.aggregate([
        {
          $group: {
            _id: '$zone',
            totalPlaces: { $sum: 1 },
            occupiedPlaces: {
              $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
            },
            blockCodes: { $addToSet: '$blockCode' },
            type: { $first: '$type' },
            places: { $push: '$$ROOT' }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      const zones = zonesResult.map((zone) => {
        const sortedPlaces = zone.places
          .sort((a, b) => (a.placeNumber || '').localeCompare(b.placeNumber || ''))
          .map((place) => ({
            id: place._id?.toString?.() || place.id || place.placeNumber,
            placeNumber: place.placeNumber,
            employeeName: place.employeeName || '',
            department: place.department || '',
            status: place.status
          }));

        return {
          name: zone._id || 'Без зоны',
          type: (zone.type || 'openspace').toString().toLowerCase(),
          totalPlaces: zone.totalPlaces,
          occupiedPlaces: zone.occupiedPlaces,
          blockCodes: (zone.blockCodes || []).sort(),
          places: sortedPlaces
        };
      });

      return res.json({
        success: true,
        zones
      });
    }

    const zonesMap = new Map();

    fallbackWorkplaces.forEach((place) => {
      const zoneName = place.zone || 'Без зоны';
      if (!zonesMap.has(zoneName)) {
        zonesMap.set(zoneName, {
          name: zoneName,
          type: (place.type || 'openspace').toString().toLowerCase(),
          totalPlaces: 0,
          occupiedPlaces: 0,
          blockCodes: new Set(),
          places: []
        });
      }

      const zone = zonesMap.get(zoneName);
      zone.totalPlaces += 1;
      if (place.status === 'occupied') {
        zone.occupiedPlaces += 1;
      }
      zone.blockCodes.add(place.blockCode);
      zone.places.push({
        id: place._id?.toString?.() || place.id || place.placeNumber,
        placeNumber: place.placeNumber,
        employeeName: place.employeeName || '',
        department: place.department || '',
        status: place.status
      });
    });

    const zones = Array.from(zonesMap.values())
      .map((zone) => ({
        ...zone,
        blockCodes: Array.from(zone.blockCodes).sort(),
        places: zone.places.sort((a, b) => (a.placeNumber || '').localeCompare(b.placeNumber || ''))
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.json({
      success: true,
      zones
    });
  } catch (error) {
    console.error('Zones error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch zones'
    });
  }
});

// Общая статистика по рабочим местам
router.get('/stats', async (req, res) => {
  try {
    if (mongoConnected && collection) {
      const totalPlaces = await collection.countDocuments();
      const occupiedPlaces = await collection.countDocuments({ status: 'occupied' });
      const freePlaces = totalPlaces - occupiedPlaces;

      const blockStatsResult = await collection.aggregate([
        {
          $group: {
            _id: '$blockCode',
            total: { $sum: 1 },
            occupied: {
              $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
            }
          }
        }
      ]).toArray();

      const blockStats = {};
      blockStatsResult.forEach((block) => {
        blockStats[block._id] = {
          total: block.total,
          occupied: block.occupied,
          free: block.total - block.occupied
        };
      });

      const typeStatsResult = await collection.aggregate([
        {
          $group: {
            _id: '$type',
            total: { $sum: 1 },
            occupied: {
              $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
            }
          }
        }
      ]).toArray();

      const typeStats = {};
      typeStatsResult.forEach((type) => {
        typeStats[type._id] = {
          total: type.total,
          occupied: type.occupied
        };
      });

      const coworkingPlaces = await collection.countDocuments({ type: 'Coworking' });
      const occupiedCoworking = await collection.countDocuments({
        type: 'Coworking',
        status: 'occupied'
      });

      return res.json({
        success: true,
        totalPlaces,
        occupiedPlaces,
        freePlaces,
        coworkingPlaces,
        occupiedCoworking,
        blockStats,
        typeStats
      });
    }

    const totalPlaces = fallbackWorkplaces.length;
    const occupiedPlaces = fallbackWorkplaces.filter((doc) => doc.status === 'occupied').length;
    const freePlaces = totalPlaces - occupiedPlaces;
    const coworkingPlaces = fallbackWorkplaces.filter((doc) => doc.type === 'Coworking').length;
    const occupiedCoworking = fallbackWorkplaces.filter((doc) => (
      doc.type === 'Coworking' && doc.status === 'occupied'
    )).length;

    const blockStats = {};
    fallbackWorkplaces.forEach((doc) => {
      if (!blockStats[doc.blockCode]) {
        blockStats[doc.blockCode] = { total: 0, occupied: 0, free: 0 };
      }
      blockStats[doc.blockCode].total += 1;
      if (doc.status === 'occupied') {
        blockStats[doc.blockCode].occupied += 1;
      }
      blockStats[doc.blockCode].free = blockStats[doc.blockCode].total - blockStats[doc.blockCode].occupied;
    });

    const typeStats = {};
    fallbackWorkplaces.forEach((doc) => {
      if (!typeStats[doc.type]) {
        typeStats[doc.type] = { total: 0, occupied: 0 };
      }
      typeStats[doc.type].total += 1;
      if (doc.status === 'occupied') {
        typeStats[doc.type].occupied += 1;
      }
    });

    return res.json({
      success: true,
      totalPlaces,
      occupiedPlaces,
      freePlaces,
      coworkingPlaces,
      occupiedCoworking,
      blockStats,
      typeStats
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

// Authentication endpoints

// Test user credentials (for development)
const TEST_USERS = [
  { id: '1', email: 'user@example.com', password: 'password123' },
  { id: '2', email: 'admin@example.com', password: 'admin123' },
  { id: '3', email: 'test@test.com', password: 'test123' }
];

let nextUserId = 4;

// Simple in-memory rate limiter for admin login
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 5; // 5 attempts

function checkRateLimit(ip) {
  const now = Date.now();
  const key = `login_${ip}`;
  
  if (!loginAttempts.has(key)) {
    loginAttempts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  const attempt = loginAttempts.get(key);
  
  if (now > attempt.resetTime) {
    // Window expired, reset
    loginAttempts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (attempt.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  attempt.count++;
  return true;
}

// Middleware to check rate limit
function adminLoginLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || '0.0.0.0';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      error: 'Too many login attempts, please try again later'
    });
  }
  next();
}

// Middleware to verify admin session cookie
function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.wf_admin_session;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Admin session required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin role required'
      });
    }
    
    req.adminUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired session'
    });
  }
}

// Helper function to log audit event
async function logAuditEvent(eventType, details = {}) {
  try {
    if (auditLog) {
      await auditLog.insertOne({
        eventType,
        timestamp: new Date(),
        ...details
      });
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

// Helper function to log import event
async function logImportEvent(importDetails) {
  try {
    if (importLog) {
      await importLog.insertOne({
        timestamp: new Date(),
        ...importDetails
      });
    }
  } catch (error) {
    console.error('Error logging import event:', error);
  }
}

// POST /api/auth/login - Login with email and password, return JWT token
router.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check credentials against test users
    const user = TEST_USERS.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Auth login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const user = TEST_USERS.find(currentUser => currentUser.id === decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}


// POST /api/auth/register - Register new user
router.post('/auth/register', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists in TEST_USERS
    const emailExists = TEST_USERS.some(u => u.email === email);
    if (emailExists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // For demo purposes, add to TEST_USERS (in production would save to database)
    const newUser = { id: String(nextUserId), email, password };
    nextUserId += 1;
    TEST_USERS.push(newUser);

    // Generate JWT token for registration
    const token = jwt.sign(
      { userId: newUser.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Auth register error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// ============ ADMIN ENDPOINTS ============

// POST /api/admin/upload - Upload XLS file (admin only)
router.post('/admin/upload', requireAdmin, async (req, res) => {
  try {
    // For now, just log the upload and return success
    // In production, would parse XLS file here
    const fileName = req.body?.fileName || 'unknown';
    
    await logImportEvent({
      adminUser: req.adminUser?.role,
      fileName,
      status: 'success',
      rowsProcessed: 0,
      errors: []
    });

    res.json({
      success: true,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Admin upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============ ADMIN AUTH ENDPOINTS ============

// POST /api/auth/admin/login - Admin login with password
router.post('/auth/admin/login', adminLoginLimiter, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      await logAuditEvent('admin_login_attempt', {
        success: false,
        reason: 'missing_password',
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }

    // Compare password with hash
    const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    
    if (!passwordMatch) {
      await logAuditEvent('admin_login_attempt', {
        success: false,
        reason: 'invalid_password',
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Generate JWT token for admin
    const token = jwt.sign(
      { role: 'admin', iat: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    res.cookie('wf_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    await logAuditEvent('admin_login_success', {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      success: true,
      role: 'admin'
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/auth/logout - Logout and clear admin session
router.post('/auth/logout', (req, res) => {
  res.clearCookie('wf_admin_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  res.json({
    success: true
  });
});

// GET /api/auth/me - Get current user
router.get('/auth/me', verifyToken, (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /api/auth/admin/me - Get current admin role
router.get('/auth/admin/me', (req, res) => {
  try {
    const token = req.cookies?.wf_admin_session;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded?.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.json({ role: 'admin' });
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

router.use(timer());

module.exports = router;

// Initialize MongoDB connection at startup (do this AFTER exporting the router)
connectToDatabase().catch(console.error);
