import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  preferences: {
    language: 'ar' | 'en';
    theme: 'light' | 'dark' | 'auto';
    readingSettings: {
      fontSize: 'small' | 'medium' | 'large' | 'xlarge';
      fontFamily: 'arabic' | 'english' | 'mono';
      backgroundColor: string;
      textColor: string;
      lineHeight: number;
      maxWidth: number;
    };
    notifications: {
      email: boolean;
      push: boolean;
      newChapters: boolean;
      updates: boolean;
    };
  };
  readingHistory: Array<{
    novelId: mongoose.Types.ObjectId;
    chapterId: mongoose.Types.ObjectId;
    progress: number;
    lastRead: Date;
  }>;
  favorites: mongoose.Types.ObjectId[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    language: {
      type: String,
      enum: ['ar', 'en'],
      default: 'ar'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    readingSettings: {
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large', 'xlarge'],
        default: 'medium'
      },
      fontFamily: {
        type: String,
        enum: ['arabic', 'english', 'mono'],
        default: 'arabic'
      },
      backgroundColor: {
        type: String,
        default: '#ffffff'
      },
      textColor: {
        type: String,
        default: '#000000'
      },
      lineHeight: {
        type: Number,
        default: 1.6,
        min: 1.2,
        max: 2.5
      },
      maxWidth: {
        type: Number,
        default: 800,
        min: 400,
        max: 1200
      }
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      newChapters: {
        type: Boolean,
        default: true
      },
      updates: {
        type: Boolean,
        default: true
      }
    }
  },
  readingHistory: [{
    novelId: {
      type: Schema.Types.ObjectId,
      ref: 'Novel',
      required: true
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Novel'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model<IUser>('User', UserSchema);