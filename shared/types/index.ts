// User Types
export interface User {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  preferences: UserPreferences;
  readingHistory: ReadingHistory[];
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'auto';
  readingSettings: ReadingSettings;
  notifications: NotificationSettings;
}

export interface ReadingSettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'arabic' | 'english' | 'mono';
  backgroundColor: string;
  textColor: string;
  lineHeight: number;
  maxWidth: number;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  newChapters: boolean;
  updates: boolean;
}

export interface ReadingHistory {
  novelId: string;
  chapterId: string;
  progress: number; // 0-100
  lastRead: Date;
}

// Novel Types
export interface Novel {
  _id: string;
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  author: {
    ar: string;
    en: string;
  };
  coverImage: string;
  country: 'korean' | 'chinese' | 'japanese' | 'other';
  genres: Genre[];
  status: 'ongoing' | 'completed' | 'hiatus' | 'dropped';
  rating: number;
  totalRatings: number;
  views: number;
  favorites: number;
  chapters: Chapter[];
  tags: string[];
  year: number;
  isPopular: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  _id: string;
  novelId: string;
  title: {
    ar: string;
    en: string;
  };
  content: {
    ar: string;
    en: string;
  };
  chapterNumber: number;
  wordCount: number;
  isPublished: boolean;
  publishedAt?: Date;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Genre {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  slug: string;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  country?: string[];
  genres?: string[];
  status?: string[];
  rating?: number;
  sortBy?: 'title' | 'rating' | 'views' | 'favorites' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  novels: Novel[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Comment Types
export interface Comment {
  _id: string;
  novelId: string;
  userId: string;
  user: {
    username: string;
    avatar?: string;
  };
  content: string;
  rating?: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalNovels: number;
  totalChapters: number;
  totalViews: number;
  recentUsers: User[];
  popularNovels: Novel[];
  recentComments: Comment[];
}

// Reading Session Types
export interface ReadingSession {
  novelId: string;
  chapterId: string;
  progress: number;
  startTime: Date;
  lastActivity: Date;
  totalTime: number; // in minutes
}

// Notification Types
export interface Notification {
  _id: string;
  userId: string;
  type: 'new_chapter' | 'novel_update' | 'comment_reply' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}