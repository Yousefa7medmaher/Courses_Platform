import User from '../models/usermodel.js';
import bcrypt from 'bcrypt';
import validator from 'validator';

export async function registerUser({ name, email, password, photo }) {
  const normalizedEmail = validator.normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const err = new Error("Email is already used");
    err.status = 409;
    throw err;
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password: hashPassword,
    photo, // ✅ store photo
  });

  return {
    id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    photo: newUser.photo,
  };
}

export async function getAllUsers() {
  const users = await User.find({}, '_id name email photo role').lean(); // ✅ use photo
  return users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    photo: user.photo,
    role: user.role
  }));
}

export async function updateUser(id, data) {
  const existingUser = await User.findById(id);
  if (!existingUser) {
    const err = new Error("User does not exist");
    err.status = 404;
    throw err;
  }

  const updateFields = {};
  if (data.name) updateFields.name = data.name;
  if (data.email) updateFields.email = data.email;
  if (data.photo) updateFields.photo = data.photo; // ✅ allow photo update

  const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
    new: true,
    runValidators: true
  });

  return {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    photo: updatedUser.photo,
  };
}

export async function changePassword(userId, { currentPassword, newPassword, confirmPassword }) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error("User does not exist");
    err.status = 404;
    throw err;
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    const err = new Error("Current password is incorrect");
    err.status = 401;
    throw err;
  }

  if (newPassword !== confirmPassword) {
    const err = new Error("Passwords do not match");
    err.status = 400;
    throw err;
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();
}

export async function deleteUser(id) {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  await User.findByIdAndDelete(id);
}
