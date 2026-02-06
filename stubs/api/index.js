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
const fallbackImportLogs = [];

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
    importLog = db.collection('import_logs');
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
      error: 'Внутренняя ошибка сервера'
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
      error: 'Слишком много попыток входа, попробуйте позже'
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
        error: 'Необходима админская сессия'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Доступ запрещен: требуется роль администратора'
      });
    }
    
    req.adminUser = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Сессия недействительна или истекла'
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
    const logEntry = {
      timestamp: new Date(),
      ...importDetails
    };

    if (importLog) {
      await importLog.insertOne(logEntry);
    } else {
      fallbackImportLogs.push({
        _id: { toString: () => String(fallbackImportLogs.length + 1) },
        ...logEntry
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
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный формат email'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Пароль должен содержать минимум 6 символов'
      });
    }

    // Check credentials against test users
    const user = TEST_USERS.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Неверный email или пароль'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Auth login error:', error);
    res.status(500).json({
      success: false,
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
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный формат email'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Пароль должен содержать минимум 6 символов'
      });
    }

    // Check if email already exists in TEST_USERS
    const emailExists = TEST_USERS.some(u => u.email === email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: 'Этот email уже зарегистрирован'
      });
    }

    // For demo purposes, add to TEST_USERS (in production would save to database)
    const newUser = { id: String(nextUserId), email, password };
    nextUserId += 1;
    TEST_USERS.push(newUser);

    // Generate JWT token for registration
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Auth register error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ============ ADMIN ENDPOINTS ============

// GET /api/test/upload-real-file - Upload real file with actual data (admin only)
router.get('/test/upload-real-file', requireAdmin, async (req, res) => {
  try {
    const xlsx = require('xlsx');
    console.log('=== REAL FILE UPLOAD ENDPOINT ===');
    
    // Read the formatted file
    const workbook = xlsx.readFile('/Users/internet/Downloads/workplaces_formatted.xlsx');
    const sheet = workbook.Sheets['Workplaces'];
    const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
    
    console.log(`Processing ${data.length} rows from real file...`);
    
    const errors = [];
    let inserted = 0;
    let updated = 0;
    const coll = getCollection();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row.placeNumber || !row.blockCode || !row.status) {
        console.log(`Row ${i + 1}: Missing required fields. Got:`, { placeNumber: row.placeNumber, blockCode: row.blockCode, status: row.status });
        errors.push({
          row: i + 2,
          error: 'Не заполнены обязательные поля: placeNumber, blockCode или status'
        });
        continue;
      }

      const workplaceData = {
        placeNumber: row.placeNumber,
        placeName: row.placeNumber,
        zone: row.zone || '',
        blockCode: row.blockCode,
        type: row.type || 'Openspace',
        category: 'Основное',
        employeeName: row.employeeName || '',
        tabNumber: '',
        department: row.department || '',
        team: row.team || '',
        position: row.position || '',
        status: row.status,
        coworkingType: '',
        updatedAt: new Date()
      };

      if (mongoConnected && coll?.updateOne) {
        const result = await coll.updateOne(
          { placeNumber: row.placeNumber },
          {
            $set: workplaceData,
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          console.log(`Row ${i + 1}: Inserted place ${row.placeNumber}`);
          inserted++;
        } else if (result.modifiedCount > 0) {
          console.log(`Row ${i + 1}: Updated place ${row.placeNumber}`);
          updated++;
        }
      } else {
        const existingIndex = fallbackWorkplaces.findIndex(
          (item) => item.placeNumber === row.placeNumber
        );

        if (existingIndex >= 0) {
          console.log(`Row ${i + 1}: Updated place ${row.placeNumber} (fallback)`);
          fallbackWorkplaces[existingIndex] = {
            ...fallbackWorkplaces[existingIndex],
            ...workplaceData
          };
          updated++;
        } else {
          console.log(`Row ${i + 1}: Inserted place ${row.placeNumber} (fallback)`);
          fallbackWorkplaces.push({
            _id: { toString: () => String(fallbackWorkplaces.length + 1) },
            ...workplaceData,
            createdAt: new Date()
          });
          inserted++;
        }
      }
    }

    console.log(`Real file upload complete: ${inserted} inserted, ${updated} updated, ${errors.length} errors`);

    const importEntry = {
      fileName: '24.10.25-kaz-template-1.xlsx',
      userName: req.adminUser?.role || 'Admin',
      totalRows: data.length,
      inserted,
      updated,
      errors: errors.length,
      status: errors.length > 0 ? 'partial' : 'success'
    };

    await logImportEvent(importEntry);

    res.json({
      success: true,
      total: data.length,
      inserted,
      updated,
      errors,
      message: 'Real file uploaded successfully'
    });
  } catch (error) {
    console.error('Real file upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload real file'
    });
  }
});

// GET /api/test/upload-test-file - Upload a test file for testing (admin only)
router.get('/test/upload-test-file', requireAdmin, async (req, res) => {
  try {
    console.log('=== TEST UPLOAD ENDPOINT ===');
    console.log('Processing test upload...');
    
    // Create test data
    const testData = [
      { placeNumber: '5.В.01.056', blockCode: '102', status: 'free', zone: 'Open space', type: 'Openspace', employeeName: '', department: 'УРМ г.Казань', team: 'КАП. Serverless Engine', position: '' },
      { placeNumber: '5.В.01.066', blockCode: '103', status: 'occupied', zone: 'Open space', type: 'Openspace', employeeName: 'Иванов Иван Иванович', department: 'УРМ г.Иннополис', team: 'SberGeo', position: 'Ведущий инженер по разработке' },
      { placeNumber: '5.В.01.059', blockCode: '103', status: 'occupied', zone: 'Open space', type: 'Openspace', employeeName: 'Степкин Степан Степанович', department: 'УРМ г.Казань', team: 'Инструмент управления численностью блока', position: 'Инженер по разработке' },
      { placeNumber: '5.В.01.047', blockCode: '103', status: 'free', zone: 'Open space', type: 'Openspace', employeeName: '', department: 'УРМ г.Казань', team: 'Инструмент управления численностью блока', position: '' },
      { placeNumber: '5.В.01.057', blockCode: '103', status: 'occupied', zone: 'Open space', type: 'Openspace', employeeName: 'Петров Петр Петрович', department: 'УРМ г.Казань', team: 'SberGeo', position: 'Ведущий разработчик' }
    ];
    
    const errors = [];
    let inserted = 0;
    let updated = 0;
    const coll = getCollection();

    for (let i = 0; i < testData.length; i++) {
      const row = testData[i];

      if (!row.placeNumber || !row.blockCode || !row.status) {
        console.log(`Row ${i + 1}: Missing required fields`);
        errors.push({
          row: i + 1,
          error: 'Не заполнены обязательные поля: placeNumber, blockCode или status'
        });
        continue;
      }

      const workplaceData = {
        placeNumber: row.placeNumber,
        placeName: row.placeNumber,
        zone: row.zone || '',
        blockCode: row.blockCode,
        type: row.type || 'Openspace',
        category: 'Основное',
        employeeName: row.employeeName || '',
        tabNumber: '',
        department: row.department || '',
        team: row.team || '',
        position: row.position || '',
        status: row.status,
        coworkingType: '',
        updatedAt: new Date()
      };

      if (mongoConnected && coll?.updateOne) {
        const result = await coll.updateOne(
          { placeNumber: row.placeNumber },
          {
            $set: workplaceData,
            $setOnInsert: {
              createdAt: new Date()
            }
          },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          console.log(`Row ${i + 1}: Inserted place ${row.placeNumber}`);
          inserted++;
        } else if (result.modifiedCount > 0) {
          console.log(`Row ${i + 1}: Updated place ${row.placeNumber}`);
          updated++;
        }
      } else {
        const existingIndex = fallbackWorkplaces.findIndex(
          (item) => item.placeNumber === row.placeNumber
        );

        if (existingIndex >= 0) {
          console.log(`Row ${i + 1}: Updated place ${row.placeNumber} (fallback)`);
          fallbackWorkplaces[existingIndex] = {
            ...fallbackWorkplaces[existingIndex],
            ...workplaceData
          };
          updated++;
        } else {
          console.log(`Row ${i + 1}: Inserted place ${row.placeNumber} (fallback)`);
          fallbackWorkplaces.push({
            _id: { toString: () => String(fallbackWorkplaces.length + 1) },
            ...workplaceData,
            createdAt: new Date()
          });
          inserted++;
        }
      }
    }

    console.log(`Test upload complete: ${inserted} inserted, ${updated} updated, ${errors.length} errors`);

    const importEntry = {
      fileName: 'test_workplaces.xlsx',
      userName: req.adminUser?.role || 'Admin',
      totalRows: testData.length,
      inserted,
      updated,
      errors: errors.length,
      status: errors.length > 0 ? 'partial' : 'success'
    };

    await logImportEvent(importEntry);

    res.json({
      success: true,
      total: testData.length,
      inserted,
      updated,
      errors,
      message: 'Test file uploaded successfully'
    });
  } catch (error) {
    console.error('Test upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload test file'
    });
  }
});

// POST /api/admin/upload - Upload XLS file (admin only)
router.post('/admin/upload', requireAdmin, async (req, res) => {
  console.log('=== ADMIN UPLOAD ENDPOINT CALLED ===');
  console.log('Admin user:', req.adminUser);
  const multer = require('multer');
  const xlsx = require('xlsx');
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      console.log('File filter check:', { filename: file.originalname, mimetype: file.mimetype });
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/octet-stream'
      ];

      const name = String(file.originalname || '').toLowerCase();
      const hasValidExt = name.endsWith('.xls') || name.endsWith('.xlsx');

      if (allowedTypes.includes(file.mimetype) || hasValidExt) {
        console.log('File filter: PASSED');
        cb(null, true);
      } else {
        console.log('File filter: REJECTED - invalid mimetype');
        cb(new Error('Разрешены только файлы XLS/XLSX'));
      }
    }
  });

  upload.single('file')(req, res, async (uploadError) => {
    if (uploadError) {
      console.error('Upload middleware error:', uploadError);
      return res.status(400).json({
        success: false,
        error: uploadError.message || 'Не удалось загрузить файл'
      });
    }

    try {
      console.log('Upload request received');
      console.log('File:', req.file ? { name: req.file.originalname, size: req.file.size } : 'No file');
      console.log('Body:', req.body);

      if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({
          success: false,
          error: 'Файл не загружен'
        });
      }

      console.log('Parsing XLS file:', req.file.originalname);
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });

      const normalizeHeader = (value) =>
        String(value || '')
          .replace(/\u00a0/g, ' ')
          .trim();
      const normalizeKey = (value) =>
        normalizeHeader(value)
          .toLowerCase()
          .replace(/[^a-zа-я0-9]+/gi, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      const deriveBlockCode = (placeNumber) => {
        const text = String(placeNumber || '').trim();
        if (!text) return '';
        const match = text.match(/^(.*)\\.[^.]+$/);
        if (match) return match[1];
        const parts = text.split('.');
        return parts.length > 1 ? parts.slice(0, -1).join('.') : '';
      };
      const mapStatus = (value) => {
        const text = String(value || '').trim().toLowerCase();
        if (!text) return '';
        if (text.includes('свобод')) return 'free';
        if (text.includes('занято')) return 'occupied';
        if (text.includes('размещ')) return 'occupied';
        if (text.includes('сотрудник')) return 'occupied';
        if (text.includes('подряд')) return 'occupied';
        if (text.includes('ваканс')) return 'occupied';
        if (text.includes('резерв') || text.includes('coworking')) return 'reserved';
        return 'reserved';
      };
      const normalizeStatusLabel = (value) => {
        const text = String(value || '').trim();
        if (!text) return '';
        if (/coworking[-\\s]*\\d+/i.test(text)) return 'Коворкинг';
        return text;
      };

      const isHeaderMatch = (normalizedRow) => {
        const joined = normalizedRow.join(' ');
        const hasPlace =
          normalizedRow.includes('placenumber') ||
          joined.includes('наименование рм') ||
          joined.includes('номер рм') ||
          joined.includes('ид рм');
        const hasStatus =
          normalizedRow.includes('status') ||
          joined.includes('статус занятости рм') ||
          joined.includes('статус рм');
        return hasPlace || hasStatus;
      };

      const parseSheet = (sheet) => {
        const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        if (!rows.length) return null;

        let headerIndex = -1;
        let headers = [];
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i].map(normalizeHeader);
          const normalizedRow = row.map(normalizeKey);
          if (isHeaderMatch(normalizedRow)) {
            headerIndex = i;
            headers = row;
            break;
          }
        }

        if (headerIndex < 0) return null;

        const headerIndexMap = new Map();
        headers.forEach((header, idx) => {
          if (header) headerIndexMap.set(header, idx);
        });
        const headerIndexMapNormalized = new Map();
        headers.forEach((header, idx) => {
          const key = normalizeKey(header);
          if (key) headerIndexMapNormalized.set(key, idx);
        });

        const getCell = (row, keys) => {
          for (const key of keys) {
            if (headerIndexMap.has(key)) {
              const idx = headerIndexMap.get(key);
              return row[idx];
            }
            const normalizedKey = normalizeKey(key);
            if (headerIndexMapNormalized.has(normalizedKey)) {
              const idx = headerIndexMapNormalized.get(normalizedKey);
              return row[idx];
            }
          }
          return '';
        };

        const dataRows = rows.slice(headerIndex + 1);
        const mappedRows = dataRows.map((row, idx) => {
          const roomNumber = getCell(row, ['Номер помещения']);
          const placeRaw = getCell(row, [
            'placeNumber',
            'Наименование РМ',
            'Номер РМ',
            'Ид. РМ'
          ]);
          let placeNumber = placeRaw;
          if (/^\\d+$/.test(String(placeNumber || '').trim())) {
            if (roomNumber) {
              placeNumber = `${roomNumber}.${String(placeNumber).trim()}`;
            } else {
              const placeId = getCell(row, ['Ид. РМ']);
              if (placeId) {
                placeNumber = placeId;
              }
            }
          }

          const blockCodeSource =
            getCell(row, ['blockCode']) ||
            getCell(row, ['Ид. Помещения']) ||
            roomNumber ||
            getCell(row, ['Ид. РМ']);
          const placeHasBlock = /[A-Za-zА-Яа-я]/.test(String(placeNumber || '')) && String(placeNumber || '').includes('.');
          let blockCode = placeHasBlock ? deriveBlockCode(placeNumber) : deriveBlockCode(blockCodeSource || placeNumber);
          if (!String(blockCode || '').trim()) {
            blockCode = String(blockCodeSource || '').trim();
          }
          blockCode = String(blockCode || '').toLowerCase();
          const statusRaw = getCell(row, [
            'Статус занятости РМ. Описание',
            'status',
            'Статус РМ. Описание',
            'Тип занятия РМ. Описание',
            'ПользоватСтатус'
          ]);
          const statusLabel = normalizeStatusLabel(statusRaw);
          const hasStatusHeader =
            headerIndexMap.has('status') || headerIndexMapNormalized.has('status');
          let status = hasStatusHeader ? statusRaw : mapStatus(statusRaw);
          if (!String(status || '').trim()) {
            const employeeName = getCell(row, ['employeeName', 'ФИО сотрудника', 'ФИО ДП']);
            status = String(employeeName || '').trim() ? 'occupied' : 'free';
          }
          const employeeNameFromRow = getCell(row, ['employeeName', 'ФИО сотрудника', 'ФИО ДП', 'ФИО ЛГ']);
          const contractorName = getCell(row, ['ФИО ДП', 'ФИО ЛГ']);
          let employeeNameFallback = String(employeeNameFromRow || '').trim()
            ? employeeNameFromRow
            : statusLabel || statusRaw;
          if (
            !String(employeeNameFromRow || '').trim() &&
            String(statusRaw || '').toLowerCase().includes('подряд') &&
            String(contractorName || '').trim()
          ) {
            employeeNameFallback = contractorName;
          }
          return {
            _rowNumber: headerIndex + 2 + idx,
            placeNumber,
            placeName: getCell(row, ['placeName']) || placeNumber,
            zone: getCell(row, ['zone', 'Наименование зоны']),
            blockCode,
            type: getCell(row, ['type', 'Тип РМ. Описание']) || 'Openspace',
            category: getCell(row, ['category', 'Категория РМ. Описание']) || 'Основное',
            employeeName: employeeNameFallback,
            tabNumber: getCell(row, ['tabNumber', 'Табельный номер', 'Табельный номер ДП']),
            department: getCell(row, ['Название подразделения Блок-1', 'department', 'Департамент. Описание']),
            team: getCell(row, ['team', 'Команда. Описание']),
            position: getCell(row, ['position', 'Наименование шт.должности']),
            status,
            coworkingType: getCell(row, ['coworkingType', 'Вид рабочего места. Описание']) || statusLabel || statusRaw
          };
        });

        return {
          data: mappedRows.filter((row) => String(row.placeNumber || '').trim()),
          headerIndex,
          headers
        };
      };

      let data = null;
      let usedSheetName = null;
      let usedHeaderRow = null;
      let usedHeadersSample = null;
      for (const name of workbook.SheetNames) {
        const sheet = workbook.Sheets[name];
        if (!sheet) continue;
        const parsed = parseSheet(sheet);
        if (parsed?.data?.length) {
          data = parsed.data;
          usedSheetName = name;
          usedHeaderRow = parsed.headerIndex + 1;
          usedHeadersSample = parsed.headers.map(normalizeHeader).slice(0, 20);
          break;
        }
      }

      if (!data) {
        console.log('Не удалось найти лист с нужными заголовками');
        return res.status(400).json({
          success: false,
          error: 'Не удалось найти лист с рабочими местами. Ожидались колонки вроде \"Наименование РМ\" и \"Статус занятости РМ\".'
        });
      }

      console.log(`Parsed ${data.length} rows from XLS file (sheet: ${usedSheetName})`);
      console.log('Headers sample:', usedHeadersSample);
      const errors = [];
      let inserted = 0;
      let updated = 0;

      const coll = getCollection();
      if (mongoConnected && coll?.deleteMany) {
        await coll.deleteMany({});
      } else {
        fallbackWorkplaces.length = 0;
      }
      const debugInfo = {
        sheet: usedSheetName,
        headerRow: usedHeaderRow,
        headersSample: usedHeadersSample,
        preview: data.slice(0, 3).map((row) => ({
          row: row._rowNumber,
          placeNumber: row.placeNumber,
          blockCode: row.blockCode,
          status: row.status
        }))
      };

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        const rowNumber = row._rowNumber || i + 2;
        if (!row.placeNumber) {
          continue;
        }
        if (!row.blockCode || !row.status) {
          console.log(`Row ${rowNumber}: Missing required fields. Got:`, { placeNumber: row.placeNumber, blockCode: row.blockCode, status: row.status });
          errors.push({
            row: rowNumber,
            error: 'Не заполнены обязательные поля: placeNumber, blockCode или status'
          });
          continue;
        }

        const workplaceData = {
        placeNumber: row.placeNumber,
        placeName: row.placeName || row.placeNumber,
        zone: row.zone || '',
        blockCode: row.blockCode,
        type: row.type || 'Openspace',
        category: row.category || 'Основное',
        employeeName: row.employeeName || '',
        tabNumber: row.tabNumber || '',
        department: row.department || '',
        team: row.team || '',
        position: row.position || '',
        status: row.status,
        coworkingType: row.coworkingType || '',
        updatedAt: new Date()
      };

        if (mongoConnected && coll?.updateOne) {
          const result = await coll.updateOne(
            { placeNumber: row.placeNumber },
            {
              $set: workplaceData,
              $setOnInsert: {
                createdAt: new Date()
              }
            },
            { upsert: true }
          );

          if (result.upsertedCount > 0) {
            console.log(`Row ${i + 2}: Inserted place ${row.placeNumber}`);
            inserted++;
          } else if (result.modifiedCount > 0) {
            console.log(`Row ${i + 2}: Updated place ${row.placeNumber}`);
            updated++;
          }
        } else {
          const existingIndex = fallbackWorkplaces.findIndex(
            (item) => item.placeNumber === row.placeNumber
          );

          if (existingIndex >= 0) {
            console.log(`Row ${i + 2}: Updated place ${row.placeNumber} (fallback)`);
            fallbackWorkplaces[existingIndex] = {
              ...fallbackWorkplaces[existingIndex],
              ...workplaceData
            };
            updated++;
          } else {
            console.log(`Row ${i + 2}: Inserted place ${row.placeNumber} (fallback)`);
            fallbackWorkplaces.push({
              _id: { toString: () => String(fallbackWorkplaces.length + 1) },
              ...workplaceData,
              createdAt: new Date()
            });
            inserted++;
          }
        }
      }

      console.log(`Import complete: ${inserted} inserted, ${updated} updated, ${errors.length} errors`);

      const userName = req.body?.userName || 'Unknown';
      console.log('Logging import event with userName:', userName);
      const importEntry = {
        fileName: req.file.originalname,
        userName,
        totalRows: data.length,
        inserted,
        updated,
        errors: errors.length,
        status: errors.length > 0 ? 'partial' : 'success'
      };

      await logImportEvent({
        adminUser: req.adminUser?.role,
        ...importEntry
      });

      console.log('Sending response with results:', { success: true, total: data.length, inserted, updated, errors });
      res.json({
        success: true,
        total: data.length,
        inserted,
        updated,
        errors,
        debug: errors.length ? debugInfo : undefined
      });
    } catch (error) {
      console.error('Admin upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Не удалось обработать файл'
      });
    }
  });
});

// GET /api/admin/imports - Import history (admin only)
router.get('/admin/imports', requireAdmin, async (req, res) => {
  try {
    let imports = [];

    if (mongoConnected && importLog) {
      imports = await importLog
        .find()
        .sort({ timestamp: -1 })
        .limit(20)
        .toArray();
    } else {
      imports = [...fallbackImportLogs]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);
    }

    res.json({
      success: true,
      imports: imports.map((imp) => ({
        id: typeof imp._id === 'string' ? imp._id : imp._id?.toString?.() || '',
        fileName: imp.fileName,
        userName: imp.userName,
        timestamp: imp.timestamp,
        totalRows: imp.totalRows,
        inserted: imp.inserted,
        updated: imp.updated,
        errors: imp.errors,
        status: imp.status
      }))
    });
  } catch (error) {
    console.error('Error fetching imports:', error);
    res.status(500).json({
      success: false,
      error: 'Не удалось получить историю импортов'
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
        error: 'Пароль обязателен'
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
      error: 'Неверный пароль'
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
      error: 'Внутренняя ошибка сервера'
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
      success: true,
      id: req.user.id,
      email: req.user.email
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({
      success: false,
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
