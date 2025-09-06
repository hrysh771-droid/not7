import mongoose, { Document, Schema } from 'mongoose';

export interface IChapter extends Document {
  novelId: mongoose.Types.ObjectId;
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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapter>({
  novelId: {
    type: Schema.Types.ObjectId,
    ref: 'Novel',
    required: [true, 'Novel ID is required']
  },
  title: {
    ar: {
      type: String,
      required: [true, 'Arabic chapter title is required'],
      trim: true,
      maxlength: [200, 'Chapter title cannot exceed 200 characters']
    },
    en: {
      type: String,
      required: [true, 'English chapter title is required'],
      trim: true,
      maxlength: [200, 'Chapter title cannot exceed 200 characters']
    }
  },
  content: {
    ar: {
      type: String,
      required: [true, 'Arabic chapter content is required']
    },
    en: {
      type: String,
      required: [true, 'English chapter content is required']
    }
  },
  chapterNumber: {
    type: Number,
    required: [true, 'Chapter number is required'],
    min: [1, 'Chapter number must be at least 1']
  },
  wordCount: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
ChapterSchema.index({ novelId: 1, chapterNumber: 1 }, { unique: true });
ChapterSchema.index({ novelId: 1, isPublished: 1 });
ChapterSchema.index({ publishedAt: -1 });
ChapterSchema.index({ views: -1 });

// Pre-save middleware to calculate word count
ChapterSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate word count for Arabic content
    const arabicWords = this.content.ar.trim().split(/\s+/).filter(word => word.length > 0).length;
    this.wordCount = arabicWords;
  }
  next();
});

// Method to increment views
ChapterSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to publish chapter
ChapterSchema.methods.publish = function() {
  this.isPublished = true;
  this.publishedAt = new Date();
  return this.save();
};

// Method to unpublish chapter
ChapterSchema.methods.unpublish = function() {
  this.isPublished = false;
  this.publishedAt = undefined;
  return this.save();
};

export default mongoose.model<IChapter>('Chapter', ChapterSchema);