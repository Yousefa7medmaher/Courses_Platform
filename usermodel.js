import mongoose from 'mongoose';

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
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long']
    },
    age: {
      type: Number,
      min: [0, 'Age must be a positive number'],
      max: [120, 'Age seems unrealistic']
    },
    img_profile: {
      type: String, // store path or URL of image
      default: ''   // or null
    }
  },
  {
    timestamps: true // createdAt and updatedAt
  }
);

const User = mongoose.model('User', userSchema);
export default User;
