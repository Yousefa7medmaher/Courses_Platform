import mongoose from 'mongoose';
import validator from 'validator';

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
      select: false // hide password in queries
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          // Accepts empty or valid phone numbers (basic international format)
          return !v || validator.isMobilePhone(v + '', 'any', { strictMode: false });
        },
        message: 'Please provide a valid phone number'
      }
    },

    role: {
      type: String,
      enum: ['client', 'driver'],
      default: 'client',
      required: [true, 'Role is required']
    },

    authType: {
      type: String,
      enum: ['local', 'facebook', 'google'],
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
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('User', userSchema);
