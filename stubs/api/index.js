const router = require('express').Router();
const { MongoClient, ServerApiVersion } = require('mongodb');

const timer = (time = 300) => (req, res, next) => setTimeout(next, time);

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
    mongoConnected = true;
    
    // Create indexes for performance
    await collection.createIndex({ placeNumber: 1 });
    await collection.createIndex({ employeeName: 1 });
    await collection.createIndex({ blockCode: 1 });
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
        return Object.values(grouped).sort((a, b) => a.code.localeCompare(b.code));
      }
    })
  };
}

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
    const blocks = await coll.aggregate([]).toArray();

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

// Authentication endpoints

// POST /api/auth/login - Login user
router.post('/auth/login', (req, res) => {
  try {
    const { name } = req.body;

    // Validation: name is required and should be a string
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    const trimmedName = name.trim();

    // Validation: name length >= 2
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Name must be at least 2 characters'
      });
    }

    // Validation: name length <= 100
    if (trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Name must be less than 100 characters'
      });
    }

    // Sanitize name: remove HTML tags and dangerous characters
    const sanitizedName = trimmedName.replace(/<[^>]*>/g, '');

    const user = {
      name: sanitizedName,
      enteredAt: new Date().toISOString()
    };

    // Optionally: save to MongoDB for logging
    // TODO: Uncomment when database integration is ready
    // if (mongoConnected && db) {
    //   const usersCollection = db.collection('users');
    //   await usersCollection.insertOne(user);
    // }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Auth login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/auth/me - Get current user
router.get('/auth/me', (req, res) => {
  try {
    // In simplified version return null
    // Frontend reads from localStorage
    res.json({
      success: true,
      user: null
    });
  } catch (error) {
    console.error('Auth me error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.use(timer());

module.exports = router;

// Initialize MongoDB connection at startup (do this AFTER exporting the router)
connectToDatabase().catch(console.error);
