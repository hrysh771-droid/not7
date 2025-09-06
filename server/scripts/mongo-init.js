// MongoDB initialization script for Docker

// Switch to the novel-reader database
db = db.getSiblingDB('novel-reader');

// Create a user for the application
db.createUser({
  user: 'novel-reader-user',
  pwd: 'novel-reader-password',
  roles: [
    {
      role: 'readWrite',
      db: 'novel-reader'
    }
  ]
});

// Create collections with initial indexes
db.createCollection('users');
db.createCollection('novels');
db.createCollection('chapters');
db.createCollection('comments');
db.createCollection('genres');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

db.novels.createIndex({ title: 'text', description: 'text', author: 'text', tags: 'text' });
db.novels.createIndex({ country: 1, status: 1 });
db.novels.createIndex({ rating: -1, totalRatings: -1 });
db.novels.createIndex({ views: -1 });
db.novels.createIndex({ favorites: -1 });
db.novels.createIndex({ isPopular: 1, isFeatured: 1 });
db.novels.createIndex({ createdAt: -1 });
db.novels.createIndex({ slug: 1 }, { unique: true });

db.chapters.createIndex({ novelId: 1, chapterNumber: 1 }, { unique: true });
db.chapters.createIndex({ novelId: 1, isPublished: 1 });
db.chapters.createIndex({ publishedAt: -1 });
db.chapters.createIndex({ views: -1 });

db.comments.createIndex({ novelId: 1, isApproved: 1, isActive: 1 });
db.comments.createIndex({ userId: 1 });
db.comments.createIndex({ createdAt: -1 });
db.comments.createIndex({ parentComment: 1 });

db.genres.createIndex({ slug: 1 }, { unique: true });
db.genres.createIndex({ isActive: 1 });

print('✅ MongoDB initialization completed successfully!');
print('📊 Created database: novel-reader');
print('👤 Created user: novel-reader-user');
print('📚 Created collections: users, novels, chapters, comments, genres');
print('🔍 Created indexes for optimal performance');