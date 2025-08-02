import { sendResponse } from '../utils/sendResponse.js';
import * as userService from '../Services/userService.js';

export async function addUser(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const photo = req.file ? req.file.path : req.body.photo || "";
 
    const user = await userService.registerUser({ name, email, password, photo });
    return sendResponse(res, 201, "User created successfully", user);
  } catch (err) {
    next(err);
  }
}

export async function showAllUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    return sendResponse(res, 200, "Show all users", users);
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    return sendResponse(res, 200, "User updated successfully", updatedUser);
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    await userService.changePassword(req.params.id, req.body);
    return sendResponse(res, 200, "Password updated successfully");
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    await userService.deleteUser(req.params.id);
    return sendResponse(res, 200, "User deleted successfully");
  } catch (err) {
    next(err);
  }
}
