// Create application database and user
db = db.getSiblingDB('alfanio');

// Create application user with restricted permissions
db.createUser({
  user: process.env.MONGO_APP_USER || 'alfanio_app',
  pwd: process.env.MONGO_APP_PASSWORD || 'app_password',
  roles: [
    { role: 'readWrite', db: 'alfanio' }
  ]
});

// Create indexes for better performance
db.contacts.createIndex({ "email": 1 });
db.contacts.createIndex({ "phone": 1 });
db.contacts.createIndex({ "type": 1, "createdAt": -1 });
db.contacts.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 15552000 }); // 6 months TTL

// Create initial collections with schema validation
db.createCollection("contacts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "phone", "type"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        phone: {
          bsonType: "string",
          pattern: "^[0-9]{10}$"
        },
        message: {
          bsonType: "string",
          maxLength: 1000
        },
        type: {
          enum: ["contact", "brochure"]
        },
        downloadPath: {
          bsonType: "string"
        },
        ipAddress: {
          bsonType: "string"
        },
        userAgent: {
          bsonType: "string"
        },
        downloadCount: {
          bsonType: "int"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
});
