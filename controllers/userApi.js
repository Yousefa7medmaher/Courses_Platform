import User from '../usermodel.js';
import validator from 'validator' ;
import bcrypt from 'bcrypt';
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
export { adduser , showAllUsers };
