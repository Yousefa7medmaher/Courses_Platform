import mongoose from 'mongoose';

// Lesson subdocument schema
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Lesson title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Lesson content is required']
  },
  videoUrl: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid video URL'
    }
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  duration: {
    type: Number, // in minutes
    default: 0,
    min: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Video subdocument schema
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid video URL'
    }
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Video duration is required'],
    min: 0
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  thumbnail: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Rating subdocument schema
const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Course category is required'],
    trim: true,
    enum: {
      values: ['Development', 'Business', 'Finance & Accounting', 'IT & Software', 'Office Productivity', 'Personal Development', 'Design', 'Marketing', 'Lifestyle', 'Photography & Video', 'Health & Fitness', 'Music', 'Teaching & Academics'],
      message: 'Please select a valid category'
    }
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags) {
        return tags.length <= 10;
      },
      message: 'Cannot have more than 10 tags'
    }
  },
  duration: {
    type: Number, // total duration in hours
    required: [true, 'Course duration is required'],
    min: [0, 'Duration cannot be negative']
  },
  level: {
    type: String,
    enum: {
      values: ['Beginner', 'Intermediate', 'Advanced'],
      message: 'Please select a valid level'
    },
    required: [true, 'Course level is required']
  },
  imageUrl: {
    type: String,
    default: '',
    validate: {
      validator: function(v) {
        return true ; 
        // return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid image URL'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'pending', 'published'],
      message: 'Status must be draft, pending, or published'
    },
    default: 'draft'
  },
  studentsEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lessons: [lessonSchema],
  videos: [videoSchema],
  ratings: [ratingSchema],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  totalStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
courseSchema.index({ instructor: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ averageRating: -1 });
courseSchema.index({ totalStudents: -1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for enrolled students count
courseSchema.virtual('enrolledCount').get(function() {
  return this.studentsEnrolled.length;
});

// Virtual for total course duration from videos
courseSchema.virtual('totalVideoDuration').get(function() {
  return this.videos.reduce((total, video) => total + video.duration, 0);
});

// Pre-save middleware to update published status and date
courseSchema.pre('save', function(next) {
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.isPublished = true;
  } else if (this.status !== 'published') {
    this.isPublished = false;
  }

  // Update total students count
  this.totalStudents = this.studentsEnrolled.length;

  next();
});

// Method to calculate and update average rating
courseSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
    this.totalReviews = this.ratings.length;
  }
  return this.save();
};

// Method to add a student to the course
courseSchema.methods.enrollStudent = function(studentId) {
  if (!this.studentsEnrolled.includes(studentId)) {
    this.studentsEnrolled.push(studentId);
    this.totalStudents = this.studentsEnrolled.length;
  }
  return this.save();
};

// Method to remove a student from the course
courseSchema.methods.unenrollStudent = function(studentId) {
  this.studentsEnrolled = this.studentsEnrolled.filter(
    id => !id.equals(studentId)
  );
  this.totalStudents = this.studentsEnrolled.length;
  return this.save();
};

// Method to add a lesson
courseSchema.methods.addLesson = function(lessonData) {
  this.lessons.push(lessonData);
  return this.save();
};

// Method to update a lesson
courseSchema.methods.updateLesson = function(lessonId, updateData) {
  const lesson = this.lessons.id(lessonId);
  if (lesson) {
    Object.assign(lesson, updateData);
    return this.save();
  }
  throw new Error('Lesson not found');
};

// Method to remove a lesson
courseSchema.methods.removeLesson = function(lessonId) {
  this.lessons.id(lessonId).remove();
  return this.save();
};

// Method to add a video
courseSchema.methods.addVideo = function(videoData) {
  this.videos.push(videoData);
  return this.save();
};

// Method to update a video
courseSchema.methods.updateVideo = function(videoId, updateData) {
  const video = this.videos.id(videoId);
  if (video) {
    Object.assign(video, updateData);
    return this.save();
  }
  throw new Error('Video not found');
};

// Method to remove a video
courseSchema.methods.removeVideo = function(videoId) {
  this.videos.id(videoId).remove();
  return this.save();
};

// Static method to find courses by instructor
courseSchema.statics.findByInstructor = function(instructorId) {
  return this.find({ instructor: instructorId }).populate('instructor', 'name email');
};

// Static method to find published courses
courseSchema.statics.findPublished = function() {
  return this.find({ status: 'published', isPublished: true });
};

const CourseModel = mongoose.model('Course', courseSchema);

export default CourseModel;
