---
name: Add API Endpoint
description: Guide for adding new API endpoints to the backend
---

# Add API Endpoint Skill

This skill guides you through adding new API endpoints to the To-Do List WebApp backend.

## Overview

The backend follows an MVC (Model-View-Controller) architecture:
- **Models**: Define data structure (`backend/src/models/`)
- **Controllers**: Handle business logic (`backend/src/controllers/`)
- **Routes**: Define API endpoints (`backend/src/routes/`)
- **Middlewares**: Handle authentication, validation, etc. (`backend/src/middlewares/`)

## Step-by-Step Guide

### Step 1: Define the Model (if needed)

If you need a new data entity, create a Mongoose model:

**File**: `backend/src/models/YourModel.js`

```javascript
const mongoose = require('mongoose');

const yourModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Add indexes
yourModelSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('YourModel', yourModelSchema);
```

### Step 2: Create the Controller

**File**: `backend/src/controllers/YourController.js`

```javascript
const YourModel = require('../models/YourModel');
const BaseController = require('./BaseController');

class YourController extends BaseController {
  // GET all items
  async getAll(req, res) {
    try {
      const items = await YourModel.find({ userId: req.user.id })
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      console.error('Error fetching items:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching items',
      });
    }
  }

  // GET single item by ID
  async getById(req, res) {
    try {
      const item = await YourModel.findOne({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
        });
      }

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error fetching item:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching item',
      });
    }
  }

  // POST create new item
  async create(req, res) {
    try {
      const item = new YourModel({
        ...req.body,
        userId: req.user.id,
      });

      await item.save();

      res.status(201).json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating item',
      });
    }
  }

  // PUT update item
  async update(req, res) {
    try {
      const item = await YourModel.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
        });
      }

      res.json({
        success: true,
        data: item,
      });
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating item',
      });
    }
  }

  // DELETE item
  async delete(req, res) {
    try {
      const item = await YourModel.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id,
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Item not found',
        });
      }

      res.json({
        success: true,
        message: 'Item deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting item',
      });
    }
  }
}

module.exports = new YourController();
```

### Step 3: Create Validation Middleware (optional but recommended)

**File**: `backend/src/middlewares/validateYourModel.js`

```javascript
const validateYourModel = (req, res, next) => {
  const { name, description } = req.body;

  // Validation logic
  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Name is required',
    });
  }

  if (name.length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Name must be less than 100 characters',
    });
  }

  next();
};

module.exports = validateYourModel;
```

### Step 4: Create Routes

**File**: `backend/src/routes/yourRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const YourController = require('../controllers/YourController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateYourModel = require('../middlewares/validateYourModel');

// All routes require authentication
router.use(authMiddleware);

// GET all items
router.get('/', YourController.getAll.bind(YourController));

// GET single item
router.get('/:id', YourController.getById.bind(YourController));

// POST create item
router.post('/', validateYourModel, YourController.create.bind(YourController));

// PUT update item
router.put('/:id', validateYourModel, YourController.update.bind(YourController));

// DELETE item
router.delete('/:id', YourController.delete.bind(YourController));

module.exports = router;
```

### Step 5: Register Routes in app.js

**File**: `backend/src/app.js`

Add your routes to the Express app:

```javascript
const yourRoutes = require('./routes/yourRoutes');

// ... other code ...

app.use('/api/your-endpoint', yourRoutes);
```

### Step 6: Update API Documentation

Update Swagger documentation if you're using it:

**File**: `backend/src/docs/swagger.yaml` (or similar)

```yaml
/api/your-endpoint:
  get:
    summary: Get all items
    tags:
      - YourEndpoint
    security:
      - bearerAuth: []
    responses:
      200:
        description: Success
  post:
    summary: Create a new item
    tags:
      - YourEndpoint
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string
              description:
                type: string
    responses:
      201:
        description: Created
```

### Step 7: Write Tests

**File**: `backend/tests/yourEndpoint.test.js`

```javascript
const request = require('supertest');
const app = require('../src/app');
const YourModel = require('../src/models/YourModel');

describe('YourEndpoint API', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Setup: Login and get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    
    authToken = response.body.token;
    userId = response.body.user.id;
  });

  afterEach(async () => {
    // Cleanup
    await YourModel.deleteMany({ userId });
  });

  describe('POST /api/your-endpoint', () => {
    it('should create a new item', async () => {
      const response = await request(app)
        .post('/api/your-endpoint')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Item',
          description: 'Test description',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe('Test Item');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/your-endpoint')
        .send({
          name: 'Test Item',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/your-endpoint', () => {
    it('should get all items', async () => {
      // Create test items first
      await YourModel.create([
        { name: 'Item 1', userId },
        { name: 'Item 2', userId },
      ]);

      const response = await request(app)
        .get('/api/your-endpoint')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });
});
```

### Step 8: Test the Endpoint

```bash
# Run tests
cd backend
npm test

# Or test manually with curl/Postman
# First, get auth token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Then use the token
curl -X GET http://localhost:5000/api/your-endpoint \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Best Practices

1. **Always validate input**: Use validation middleware
2. **Handle errors properly**: Use try-catch blocks
3. **Use async/await**: Modern promise handling
4. **Secure endpoints**: Use authentication middleware
5. **Check ownership**: Ensure users can only access their data
6. **Return consistent responses**: Use standard response format
7. **Add logging**: Log errors for debugging
8. **Write tests**: Test all endpoints
9. **Document APIs**: Keep Swagger docs updated
10. **Use HTTP status codes correctly**:
    - 200: Success
    - 201: Created
    - 400: Bad Request
    - 401: Unauthorized
    - 404: Not Found
    - 500: Server Error

## Common Patterns

### Pagination

```javascript
async getAll(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const items = await YourModel.find({ userId: req.user.id })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await YourModel.countDocuments({ userId: req.user.id });

  res.json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
```

### Filtering and Searching

```javascript
async getAll(req, res) {
  const { search, status } = req.query;
  
  const filter = { userId: req.user.id };
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  
  if (status) {
    filter.status = status;
  }

  const items = await YourModel.find(filter);
  
  res.json({ success: true, data: items });
}
```

## Troubleshooting

### Endpoint Not Found (404)

- Check route registration in `app.js`
- Verify route path matches request
- Check HTTP method (GET, POST, etc.)

### Validation Errors

- Check request body format
- Verify required fields
- Check data types match schema

### Authentication Issues

- Verify token is included in request
- Check token format: `Bearer <token>`
- Ensure authMiddleware is applied to route

## Next Steps

After adding the endpoint:
1. Test thoroughly
2. Update frontend to use the new endpoint
3. Update documentation
4. Consider rate limiting for production
5. Add monitoring/analytics if needed
