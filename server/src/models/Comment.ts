import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  novelId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  rating?: number;
  isApproved: boolean;
  isActive: boolean;
  likes: number;
  dislikes: number;
  replies: mongoose.Types.ObjectId[];
  parentComment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  novelId: {
    type: Schema.Types.ObjectId,
    ref: 'Novel',
    required: [true, 'Novel ID is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    minlength: [1, 'Comment cannot be empty']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }
}, {
  timestamps: true
});

// Indexes for better performance
CommentSchema.index({ novelId: 1, isApproved: 1, isActive: 1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

// Method to approve comment
CommentSchema.methods.approve = function() {
  this.isApproved = true;
  return this.save();
};

// Method to reject comment
CommentSchema.methods.reject = function() {
  this.isApproved = false;
  return this.save();
};

// Method to like comment
CommentSchema.methods.like = function() {
  this.likes += 1;
  return this.save();
};

// Method to dislike comment
CommentSchema.methods.dislike = function() {
  this.dislikes += 1;
  return this.save();
};

export default mongoose.model<IComment>('Comment', CommentSchema);