import mongoose, { Document, Schema } from 'mongoose';

export interface IGenre extends Document {
  name: {
    ar: string;
    en: string;
  };
  slug: string;
  description?: {
    ar: string;
    en: string;
  };
  color?: string;
  isActive: boolean;
}

export interface INovel extends Document {
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
  genres: mongoose.Types.ObjectId[];
  status: 'ongoing' | 'completed' | 'hiatus' | 'dropped';
  rating: number;
  totalRatings: number;
  views: number;
  favorites: number;
  chapters: mongoose.Types.ObjectId[];
  tags: string[];
  year: number;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const GenreSchema = new Schema<IGenre>({
  name: {
    ar: {
      type: String,
      required: [true, 'Arabic genre name is required']
    },
    en: {
      type: String,
      required: [true, 'English genre name is required']
    }
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    ar: String,
    en: String
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const NovelSchema = new Schema<INovel>({
  title: {
    ar: {
      type: String,
      required: [true, 'Arabic title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    en: {
      type: String,
      required: [true, 'English title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    }
  },
  description: {
    ar: {
      type: String,
      required: [true, 'Arabic description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    en: {
      type: String,
      required: [true, 'English description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    }
  },
  author: {
    ar: {
      type: String,
      required: [true, 'Arabic author name is required'],
      trim: true
    },
    en: {
      type: String,
      required: [true, 'English author name is required'],
      trim: true
    }
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image is required']
  },
  country: {
    type: String,
    enum: ['korean', 'chinese', 'japanese', 'other'],
    required: [true, 'Country is required']
  },
  genres: [{
    type: Schema.Types.ObjectId,
    ref: 'Genre',
    required: true
  }],
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'hiatus', 'dropped'],
    default: 'ongoing'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  favorites: {
    type: Number,
    default: 0
  },
  chapters: [{
    type: Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
NovelSchema.index({ title: 'text', description: 'text', author: 'text', tags: 'text' });
NovelSchema.index({ country: 1, status: 1 });
NovelSchema.index({ rating: -1, totalRatings: -1 });
NovelSchema.index({ views: -1 });
NovelSchema.index({ favorites: -1 });
NovelSchema.index({ isPopular: 1, isFeatured: 1 });
NovelSchema.index({ createdAt: -1 });
NovelSchema.index({ slug: 1 });

// Virtual for average rating
NovelSchema.virtual('averageRating').get(function() {
  return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0;
});

// Method to increment views
NovelSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to toggle favorite
NovelSchema.methods.toggleFavorite = function(userId: string) {
  const index = this.favorites.indexOf(userId);
  if (index > -1) {
    this.favorites.splice(index, 1);
    this.favorites -= 1;
  } else {
    this.favorites.push(userId);
    this.favorites += 1;
  }
  return this.save();
};

export const Genre = mongoose.model<IGenre>('Genre', GenreSchema);
export default mongoose.model<INovel>('Novel', NovelSchema);