import User from '../usermodel.js';
import validator from 'validator' ;
import bcrypt, { hash } from 'bcrypt';
/**
 * Add a new user to the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function adduser(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send({
                success: false,
                message: "Please enter all fields."
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).send({
                success: false,
                message: "Please enter a valid email format."
            });
        }

        if (password.length < 6) {
            return res.status(400).send({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        // check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send({
                success: false,
                message: "Email is already used."
            });
        }

        // hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // create a new User
        const newUser = await User.create({ name, email, password: hashPassword });
        return res.status(201).send({
            success: true,
            message: "User created successfully.",
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        });

    } catch (err) {
        next(err);
    }
}

/**
 * Controller to fetch and return all users.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * 
 * This function retrieves all users from the database,
 * selecting only the _id, name, and email fields for privacy and efficiency.
 * It then formats the data to return a list of users with id, name, and email.
 * In case of an error, it passes the error to the next middleware.
 */
async function showAllUsers(req, res, next) {
    try {
        // Fetch all users, selecting only _id, name, and email fields
        const users = await User.find({}, '_id name email');
        
        // Format the user data to return only necessary fields
        const formattedUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email
        }));

        // Send a successful response with the formatted user data
        return res.status(200).send({
            success: true,
            message: "Show all users",
            data: formattedUsers
        });
    } catch (err) {
        // Pass any errors to the error handling middleware
        next(err);
    }
}

/**
 * Controller to update a user's information.
 * 
 * @param {Object} req - Express request object. Expects `id` param and optional `name`, `email`, `password` in body.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * 
 * This function updates the specified user's name, email, and/or password.
 * If the user does not exist, it returns a 404 error.
 * Only provided fields are updated. If password is provided, it is hashed before saving.
 */
async function updateUser(req, res, next) {
    try {
        const user_id = req.params.id;
        const { name, email } = req.body;

        // Find the user by ID
        const existingUser = await User.findById(user_id);
        if (!existingUser) {
            return res.status(404).send({
                success: false,
                message: "User does not exist"
            });
        }

        // Prepare fields to update
        let updateFields = {};
        if (name) updateFields.name = name;
        if (email) updateFields.email = email;
         

        // Update user in the database
        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            updateFields,
            { new: true, runValidators: true }
        );

        // Send success response
        return res.status(200).send({
            success: true,
            message: "User updated successfully",
            data: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email
            }
        });

    } catch (err) {
        next(err);
    }
}

/**
 * Change a user's password.
 * 
 * @param {Object} req - Express request object. 
 *   Expects `id` param in req.params and 
 *   `currentPassword`, `newPassword`, `confirmPassword` in req.body.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
async function changePassword(req, res, next) {
    try {
        const userId = req.params.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).send({
                success: false,
                message: "All password fields (current, new, confirm) are required"
            });
        }

        // Validate new password match
        if (newPassword !== confirmPassword) {
            return res.status(400).send({
                success: false,
                message: "New password and confirm password do not match"
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User does not exist"
            });
        }

        // Check current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).send({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash and update new password
        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        await user.save();

        return res.status(200).send({
            success: true,
            message: "Password updated successfully"
        });
    } catch (err) {
        next(err);
    }
}
export { adduser , showAllUsers , updateUser , changePassword};
