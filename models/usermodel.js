import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email address']
    },

    password: {
      type: String,
      required: function () {
        return this.authType === 'local';
      },
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Hide password in query results
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || validator.isMobilePhone(v + '', 'any', { strictMode: false });
        },
        message: 'Please provide a valid phone number'
      }
    },

    role: {
      type: String,
      enum: ['student', 'instructor', 'manager'],
      default: 'student',
      required: [true, 'Role is required']
    },

    authType: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },

    googleId: {
      type: String,
      default: null
    },

    photo: {
      type: String,
      default: ''
    },

    age: {
      type: Number,
      min: [0, 'Age must be a positive number'],
      max: [120, 'Age seems unrealistic']
    },

    lastLogin: {
      type: Date
    },

    resetPasswordToken: {
      type: String
    },

    resetPasswordExpires: {
      type: Date
    }

  },
  {
    timestamps: true
  }
);

// ✅ Normalize email before saving
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    this.email = validator.normalizeEmail(this.email);
  }
  next();
});

// ✅ Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Method to check password validity
userSchema.methods.isPasswordValid = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

// ✅ Method to check user role (optional)
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};

export default mongoose.model('User', userSchema);
